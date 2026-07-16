import { useAutoScroll } from '#/hooks/use-scroll'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTRPC } from '#/trpc/react'
import { useParams } from '@tanstack/react-router'
import { useMemo } from 'react'
import { ChatInput } from './input'
import { MessageList } from './message-list'
import { useStream } from '#/hooks/use-stream'
import { flattenInfiniteData } from '#/lib/utils'

export const ChatContainer = () => {
  const { id } = useParams({
    from: '/_auth/chat/$id/',
  })
  const trpc = useTRPC()
  const messages = useInfiniteQuery(
    trpc.conversations.getMessages.infiniteQueryOptions(
      {
        id,
        cursor: null,
      },
      {
        getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
      },
    ),
  )

  const items = useMemo(
    () => flattenInfiniteData(messages.data),
    [messages.data],
  )

  const { scrollRef, bottomRef, handleScroll } = useAutoScroll(items)

  const { message: streamingMessage, isStreaming } = useStream(id)

  return (
    <div className="flex h-dvh flex-col">
      {/* Messages area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-4 py-6">
          <MessageList
            items={items}
            streamingMessage={streamingMessage}
          />
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input at bottom */}
      <div className="shrink-0 border-t border-border/50 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <ChatInput isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  )
}