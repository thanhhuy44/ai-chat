import { protectedProcedure } from '../init'

import type { TRPCRouterRecord } from '@trpc/server'

import { TRPCError } from '@trpc/server'
import { db } from '@/db'
import { conversation, message } from '@/db/schema'
import { and, asc, desc, eq, gt } from 'drizzle-orm'
import z, { string } from 'zod'

export const conversationRouter = {
  getAll: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(10).max(100),
        cursor: z.uuid().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input
      const items = await db
        .select()
        .from(conversation)
        .where(
          and(
            eq(conversation.createdBy, ctx.user.id),
            cursor ? gt(conversation.id, cursor) : undefined,
          ),
        )
        .orderBy(desc(conversation.updatedAt))
        .limit(limit)
      return {
        items,
        pagination: {
          limit,
          cursor: items.at(-1)?.id ?? null,
        },
      }
    }),
  create: protectedProcedure
    .input(
      z.object({
        title: string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { title } = input
      const user = ctx.user
      return db.insert(conversation).values({
        title,
        createdBy: user.id,
      })
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        title: z.string().optional(),
        model: z.uuid().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...updates } = input
      const setFields: Record<string, unknown> = {}
      if (updates.title !== undefined) setFields.title = updates.title
      if (updates.model !== undefined) setFields.model = updates.model
      const updatedConversations = await db
        .update(conversation)
        .set(setFields)
        .where(eq(conversation.id, id))
        .returning()
      if (!updatedConversations.length)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })
      return updatedConversations[0]
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership before deleting
      const conv = await db
        .select({ id: conversation.id })
        .from(conversation)
        .where(
          and(
            eq(conversation.id, input.id),
            eq(conversation.createdBy, ctx.user.id),
          ),
        )
        .limit(1)

      if (!conv.length) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }

      // Messages cascade-delete via FK
      await db.delete(conversation).where(eq(conversation.id, input.id))
      return { success: true }
    }),
  getMessages: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
        cursor: z.uuid().nullable(),
        limit: z.number().min(0).default(50),
      }),
    )
    .query(async ({ input }) => {
      const { id, cursor, limit } = input
      const items = await db
        .select()
        .from(message)
        .where(
          and(
            eq(message.conversationId, id),
            cursor ? gt(message.id, cursor) : undefined,
          ),
        )
        .orderBy(asc(message.createdAt))
        .limit(limit)
      return {
        items,
        pagination: {
          limit,
          cursor: items.at(-1)?.id ?? null,
        },
      }
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ input }) => {
      const [conv] = await db
        .select()
        .from(conversation)
        .where(eq(conversation.id, input.id))
        .limit(1)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' })
      return conv
    }),
} satisfies TRPCRouterRecord
