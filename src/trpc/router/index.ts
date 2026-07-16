import { createTRPCRouter } from '../init'

import { conversationRouter } from './conversation'
import { messageRouter } from './message'

export const trpcRouter = createTRPCRouter({
  conversations: conversationRouter,
  messages: messageRouter,
})
export type TRPCRouter = typeof trpcRouter
