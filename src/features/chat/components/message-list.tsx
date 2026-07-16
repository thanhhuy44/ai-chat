import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr'

interface MessageItem {
  id: string
  content: string
  role: string
  status: string
}

interface MessageListProps {
  items: MessageItem[]
  streamingMessage: string
  onRetry: (messageId: string) => void
  onRegenerate: (messageId: string) => void
}

export const MessageList = ({
  items,
  streamingMessage,
  onRetry,
  onRegenerate,
}: MessageListProps) => {
  if (items.length === 0 && !streamingMessage) {
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
          <div
            className={
              msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'
            }
          >
            <div className="whitespace-pre-wrap text-sm leading-relaxed">
              {msg.content}
            </div>
          </div>
          {/* Action buttons for AI messages */}
          {msg.role === 'ai' && msg.status === 'failed' && (
            <button
              type="button"
              onClick={() => onRetry(msg.id)}
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Retry"
            >
              <ArrowClockwiseIcon className="size-3.5" />
              <span>Retry</span>
            </button>
          )}
          {msg.role === 'ai' && msg.status === 'completed' && msg.content && (
            <button
              type="button"
              onClick={() => onRegenerate(msg.id)}
              className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
              title="Regenerate"
            >
              <ArrowClockwiseIcon className="size-3.5" />
              <span>Regenerate</span>
            </button>
          )}
        </div>
      ))}
      {streamingMessage && (
        <div className="chat-message-ai">
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {streamingMessage}
            <span className="ml-0.5 inline-block size-2 animate-pulse rounded-full bg-primary align-middle" />
          </div>
        </div>
      )}
    </div>
  )
}