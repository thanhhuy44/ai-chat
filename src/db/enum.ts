import { pgEnum } from 'drizzle-orm/pg-core'

export const messageRoleEnum = pgEnum('message_role', ['system', 'user', 'ai'])

export const tierEnum = pgEnum('tier', ['free', 'pro', 'max'])

export const messageStatusEnum = pgEnum('message_status', [
  'streaming',
  'completed',
  'failed',
])
