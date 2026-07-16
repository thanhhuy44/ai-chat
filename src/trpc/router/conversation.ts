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
    .input(z.object({ id: z.uuid(), title: z.string() }))
    .mutation(async ({ input }) => {
      const { title, id } = input
      const updatedConversations = await db
        .update(conversation)
        .set({
          title,
        })
        .where(eq(conversation.id, id))
        .returning()
      if (!updatedConversations.length)
        throw new TRPCError({
          code: 'NOT_FOUND',
        })
      return updatedConversations[0]
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
} satisfies TRPCRouterRecord
