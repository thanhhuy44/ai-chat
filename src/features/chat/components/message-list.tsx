interface MessageListProps {
  items: { id: string; content: string; role: string }[]
  streamingMessage: string
}

export const MessageList = ({ items, streamingMessage }: MessageListProps) => {
  if (items.length === 0 && !streamingMessage) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-muted p-4">
          <span className="text-3xl">💬</span>
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">Start a conversation</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Send a message to begin chatting
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {items.map((msg) => (
        <div
          key={msg.id}
          className={msg.role === 'user' ? 'chat-message-user' : 'chat-message-ai'}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {msg.content}
          </div>
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