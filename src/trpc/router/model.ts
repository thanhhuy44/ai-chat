import z from 'zod'
import { protectedProcedure } from '../init'
import { db } from '@/db'
import { tierEnum } from '@/db/enum'
import { model } from '@/db/schema'

const priority = {
  free: 1,
  pro: 2,
  max: 3,
}

export const modelRouter = {
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        tier: z.enum(tierEnum.enumValues),
        sys_prompt: z.string(),
      }),
    )
    .mutation(({ input }) => {
      return db.insert(model).values(input)
    }),
  getAll: protectedProcedure.query(async () => {
    const models = await db.select().from(model)
    return models.sort((a, b) => priority[a.tier] - priority[b.tier])
  }),
}
