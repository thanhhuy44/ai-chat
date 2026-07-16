import { AiMessage } from '@/components/ai-message'
import { AiMessageActions } from './actions'

interface MessageItem {
  id: string
  content: string
  role: string
  status: string
}

interface MessageListProps {
  items: MessageItem[]
  streamingMessage: string
  isStreaming: boolean
  onRegenerate: (messageId: string) => void
}

export const MessageList = ({
  items,
  streamingMessage,
  isStreaming,
  onRegenerate,
}: MessageListProps) => {
  if (items.length === 0 && !isStreaming && !streamingMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4">
          <span className="text-3xl">💬</span>
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">
          Start a conversation
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a message to begin chatting
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((msg) => (
        <div key={msg.id}>
          <div className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}>
            {msg.role === 'user' ? (
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            ) : (
              <AiMessage content={msg.content} />
            )}
          </div>
          {/* Action buttons for AI messages */}
          {msg.role === 'ai' && (
            <AiMessageActions
              messageId={msg.id}
              content={msg.content}
              status={msg.status}
              onRegenerate={onRegenerate}
            />
          )}
        </div>
      ))}
      {isStreaming && !streamingMessage && (
        <div className="chat-message-ai">
          <div className="flex items-center gap-1.5 py-1">
            <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:0ms]" />
            <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:150ms]" />
            <span className="inline-block size-1.5 animate-bounce rounded-full bg-muted-foreground/50 [animation-delay:300ms]" />
          </div>
        </div>
      )}
      {streamingMessage && (
        <div className="chat-message-ai">
          <AiMessage content={streamingMessage} />
          <span className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-primary align-middle" />
        </div>
      )}
    </div>
  )
}