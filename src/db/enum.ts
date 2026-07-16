import { pgEnum } from 'drizzle-orm/pg-core'

export const messageRoleEnum = pgEnum('message_role', ['system', 'user', 'ai'])
