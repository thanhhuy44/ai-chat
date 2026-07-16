import { protectedProcedure } from '../init'

import type { TRPCRouterRecord } from '@trpc/server'

import { TRPCError } from '@trpc/server'
import { db } from '#/db'
import { conversation, message } from '#/db/schema'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { aiClient } from '#/lib/ai'
import EventEmitter, { on } from 'node:events'

// Per-conversation events: server triggers AI generation after user sends a message
const ee = new EventEmitter()

// Tracks active AI generation per conversation — only one at a time
const activeControllers = new Map<string, AbortController>()

// Makes a fresh processor per AI generation (avoids cross-generation state leaks)
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

const getLastMessages = async (conversationId: string) => {
  return db
    .select()
    .from(message)
    .where(eq(message.conversationId, conversationId))
    .orderBy(message.createdAt)
}

// Returns true if there was a pending user message to respond to
// Yields streaming chunks and the final completed message
async function* generateAIResponse(
  conversationId: string,
  signal?: AbortSignal,
) {
  const msgs = await getLastMessages(conversationId)
  const lastMessage = msgs.at(-1)

  // Only generate if the last message is from the user (no AI response yet)
  if (!lastMessage || lastMessage.role !== 'user') {
    return false
  }

  try {
    const stream = await aiClient.chat.completions.create({
      model: process.env.OPENAI_MODEL!,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.',
        },
        ...(msgs.map((m) => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
        })) as any),
      ],
      stream: true,
    })

    const processChunk = createChunkProcessor()
    let content = ''
    for await (const event of stream) {
      if (signal?.aborted) {
        break
      }
      const delta = event.choices[0]?.delta?.content ?? ''
      content += processChunk(delta)
      yield { content, status: 'streaming' as const }
      // trigger: pass the yield value upward via delegation
    }

    if (signal?.aborted) return false

    const [aiMessage] = await db
      .insert(message)
      .values({
        conversationId,
        role: 'ai',
        content,
      })
      .returning()

    yield {
      content,
      status: 'completed' as const,
      data: aiMessage,
    }
    return true
  } catch (error) {
    console.error('🚀 ~ AI generation error:', error)
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'AI generation failed',
    })
  }
}

export const messageRouter = {
  send: protectedProcedure
    .input(
      z.object({
        conversationId: z.string().optional(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // let existConversation: { id: string }[] | undefined
      const { conversationId = undefined, content } = input

      const user = ctx.user
      const existConversation = conversationId
        ? await db
            .select()
            .from(conversation)
            .where(eq(conversation.id, conversationId))
        : await db
            .insert(conversation)
            .values({
              createdBy: user.id,
              title: content,
            })
            .returning()
      if (!existConversation.length) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        })
      }

      const newMessage = await db
        .insert(message)
        .values({
          content,
          conversationId: existConversation[0].id,
          role: 'user',
        })
        .returning()

      // Abort any in-flight AI generation for this conversation
      const prevController = activeControllers.get(existConversation[0].id)
      if (prevController && !prevController.signal.aborted) {
        prevController.abort()
      }

      // Notify the subscription to start/resume AI generation
      ee.emit(existConversation[0].id)

      return { ...newMessage[0], conversationId: existConversation[0].id }
    }),
} satisfies TRPCRouterRecord
