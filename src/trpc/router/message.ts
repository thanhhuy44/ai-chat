import { protectedProcedure } from '../init'

import type { TRPCRouterRecord } from '@trpc/server'

import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { conversation, message } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import z from 'zod'
import { aiClient } from '@/lib/ai'
import { SYSTEM_PROMPT } from '@/constants/system_promt'

// Track per-generation AbortControllers so cancelGeneration can abort them
const generationControllers = new Map<string, AbortController>()

// ─── Chunk processor (filters <thought> tags) ──────────────────────────
const createChunkProcessor = () => {
  let isThinking = false
  let buffer = ''

  return (chunk: string): string => {
    buffer += chunk
    let output = ''

    while (buffer.length > 0) {
      if (!isThinking) {
        const tagIndex = buffer.indexOf('<thought>')
        if (tagIndex !== -1) {
          output += buffer.substring(0, tagIndex)
          buffer = buffer.substring(tagIndex + 9)
          isThinking = true
        } else {
          const partialIndex = buffer.lastIndexOf('<')
          if (
            partialIndex !== -1 &&
            '<thought>'.startsWith(buffer.substring(partialIndex))
          ) {
            output += buffer.substring(0, partialIndex)
            buffer = buffer.substring(partialIndex)
            break
          } else {
            output += buffer
            buffer = ''
          }
        }
      } else {
        const closingIndex = buffer.indexOf('</thought>')
        if (closingIndex !== -1) {
          buffer = buffer.substring(closingIndex + 10)
          isThinking = false
        } else {
          const partialIndex = buffer.lastIndexOf('<')
          if (
            partialIndex !== -1 &&
            '</thought>'.startsWith(buffer.substring(partialIndex))
          ) {
            buffer = buffer.substring(partialIndex)
          } else {
            buffer = ''
          }
          break
        }
      }
    }
    return output
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

const getCompletedMessages = async (conversationId: string) => {
  return db
    .select()
    .from(message)
    .where(
      and(
        eq(message.conversationId, conversationId),
        eq(message.status, 'completed'),
      ),
    )
    .orderBy(message.createdAt)
}

function combineAbortSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal {
  const validSignals = signals.filter((s): s is AbortSignal => s !== undefined)
  if (validSignals.length === 0) return new AbortController().signal
  if (validSignals.length === 1) return validSignals[0]

  const controller = new AbortController()
  for (const signal of validSignals) {
    if (signal.aborted) {
      controller.abort()
      return controller.signal
    }
    signal.addEventListener('abort', () => controller.abort(), { once: true })
  }
  return controller.signal
}

// ─── AI generation (shared by streamMessage, retry, regenerate) ────────

async function* generateAIResponse(
  conversationId: string,
  aiMessageId: string,
  signal: AbortSignal,
) {
  const msgs = await getCompletedMessages(conversationId)
  const lastMessage = msgs.at(-1)

  if (!lastMessage || lastMessage.role !== 'user') {
    return false
  }

  try {
    const model = process.env.OPENAI_MODEL!
    const stream = await aiClient.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...msgs.map((m) => ({
          role: m.role === 'user' ? ('user' as const) : ('assistant' as const),
          content: m.content,
        })),
      ],
      stream: true,
    })

    const processChunk = createChunkProcessor()
    let content = ''

    for await (const chunk of stream) {
      if (signal.aborted) break
      const delta = chunk.choices[0]?.delta?.content ?? ''
      content += processChunk(delta)

      await db
        .update(message)
        .set({ content })
        .where(eq(message.id, aiMessageId))

      yield { status: 'streaming' as const, content, data: null }
    }

    if (signal.aborted) {
      await db
        .update(message)
        .set({ status: 'failed', content })
        .where(eq(message.id, aiMessageId))
      yield { status: 'error' as const, content, data: null }
      return false
    }

    // Mark complete
    const [aiMsg] = await db
      .update(message)
      .set({ content, status: 'completed', model })
      .where(eq(message.id, aiMessageId))
      .returning()

    // Touch conversation updatedAt
    await db
      .update(conversation)
      .set({ updatedAt: new Date() })
      .where(eq(conversation.id, conversationId))

    yield { status: 'completed' as const, content, data: aiMsg }
    return true
  } catch (error) {
    console.error('AI generation error:', error)
    await db
      .update(message)
      .set({ status: 'failed' })
      .where(eq(message.id, aiMessageId))
    yield { status: 'error' as const, content: '', data: null }
    return false
  }
}

// ─── Router ────────────────────────────────────────────────────────────

export const messageRouter = {
  /** Send a user message, create an AI placeholder, return the IDs. */
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { conversationId, content } = input
      const user = ctx.user

      // Find or create conversation
      const conv = conversationId
        ? await db
            .select()
            .from(conversation)
            .where(eq(conversation.id, conversationId))
            .then((rows) => rows[0] ?? null)
        : null

      const resolvedConv =
        conv ??
        (await db
          .insert(conversation)
          .values({ createdBy: user.id, title: content })
          .returning()
          .then((rows) => rows[0]))

      if (!resolvedConv) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Insert user message
      const [userMsg] = await db
        .insert(message)
        .values({
          content,
          conversationId: resolvedConv.id,
          role: 'user',
          status: 'completed',
        })
        .returning()

      // Insert AI placeholder
      const [aiPlaceholder] = await db
        .insert(message)
        .values({
          content: '',
          conversationId: resolvedConv.id,
          role: 'ai',
          status: 'streaming',
        })
        .returning()

      // Abort any in-flight generation for this conversation
      const prev = generationControllers.get(resolvedConv.id)
      if (prev && !prev.signal.aborted) prev.abort()

      return {
        userMessage: userMsg,
        conversationId: resolvedConv.id,
        aiMessageId: aiPlaceholder.id,
      }
    }),

  /** Stream a single AI generation for a given placeholder message. */
  streamMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        aiMessageId: z.string(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const { conversationId, aiMessageId } = input
      const aliveSignal = signal ?? new AbortController().signal

      // Yield connected immediately
      yield {
        type: 'connected' as const,
        status: 'connected' as const,
        content: '',
        data: null,
      }

      const genController = new AbortController()
      generationControllers.set(conversationId, genController)
      const combinedSignal = combineAbortSignals(
        aliveSignal,
        genController.signal,
      )

      try {
        for await (const event of generateAIResponse(
          conversationId,
          aiMessageId,
          combinedSignal,
        )) {
          yield event
        }
      } finally {
        generationControllers.delete(conversationId)
      }
    }),

  /** Cancel the current generation for a conversation. */
  cancelGeneration: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ input }) => {
      const controller = generationControllers.get(input.conversationId)
      if (controller && !controller.signal.aborted) {
        controller.abort()
      }
      return { success: true }
    }),

  /** Reset a failed message to streaming and return its ID for a new subscription. */
  retryMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(message)
        .set({ status: 'streaming', content: '' })
        .where(eq(message.id, input.messageId))

      const prev = generationControllers.get(input.conversationId)
      if (prev && !prev.signal.aborted) prev.abort()

      return { aiMessageId: input.messageId }
    }),

  /** Reset a completed AI message to streaming and return its ID for a new subscription. */
  regenerate: protectedProcedure
    .input(
      z.object({
        conversationId: z.string(),
        messageId: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      await db
        .update(message)
        .set({ status: 'streaming', content: '' })
        .where(eq(message.id, input.messageId))

      const prev = generationControllers.get(input.conversationId)
      if (prev && !prev.signal.aborted) prev.abort()

      return { aiMessageId: input.messageId }
    }),
} satisfies TRPCRouterRecord
