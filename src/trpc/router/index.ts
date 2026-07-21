import { createTRPCRouter } from '../init'

import { conversationRouter } from './conversation'
import { messageRouter } from './message'
import { modelRouter } from './model'

export const trpcRouter = createTRPCRouter({
  conversations: conversationRouter,
  messages: messageRouter,
  models: modelRouter,
})
export type TRPCRouter = typeof trpcRouter
