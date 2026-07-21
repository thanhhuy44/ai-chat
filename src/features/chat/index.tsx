import z from 'zod'

import { ChatInput } from '@/components/chat-input'

export const NewChatPage = () => {
  return (
    <div className="flex h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            What can I help with?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask anything, get instant answers
          </p>
        </div>

        <ChatInput isStreaming={false} />
      </div>
    </div>
  )
}
