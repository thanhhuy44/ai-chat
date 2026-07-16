import { NewChatPage } from '@/features/chat'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/chat/')({
  component: NewChatPage,
})
