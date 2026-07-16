import { useAutoScroll } from '#/hooks/use-scroll'
import { useStream } from '#/hooks/use-stream'
import { useTRPC } from '#/trpc/react'
import { flattenInfiniteData } from '#/lib/utils'
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChatInput } from './input'
import { MessageList } from './message-list'

interface MessageItem {
  id: string
  content: string
  role: string
  status: string
}

export const ChatContainer = () => {
  const { id } = useParams({
    from: '/_auth/chat/$id/',
  })
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // ── Messages query ──────────────────────────────────────────────────
  const messages = useInfiniteQuery(
    trpc.conversations.getMessages.infiniteQueryOptions(
      { id, cursor: null },
      {
        getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
      },
    ),
  )

  const items = useMemo(
    () => (flattenInfiniteData(messages.data) as MessageItem[]),
    [messages.data],
  )

  // ── Active AI generation state ──────────────────────────────────────
  const [activeAiMessageId, setActiveAiMessageId] = useState<string | null>(
    null,
  )

  // Resume any pending streaming AI message from loaded items
  // (e.g. when navigating from NewChatPage after sending a message)
  useEffect(() => {
    if (activeAiMessageId) return // already tracking one
    const streamingAi = items.find(
      (m) => m.role === 'ai' && m.status === 'streaming',
    )
    if (streamingAi) {
      setActiveAiMessageId(streamingAi.id)
    }
  }, [items, activeAiMessageId])

  const handleGenerationComplete = useCallback(() => {
    setActiveAiMessageId(null)
  }, [])

  const { message: streamingMessage, isStreaming } = useStream(
    id,
    activeAiMessageId,
    handleGenerationComplete,
  )

  // ── Send message ────────────────────────────────────────────────────
  const sendMessage = useMutation({
    ...trpc.messages.send.mutationOptions(),
    onSuccess: (response) => {
      setActiveAiMessageId(response.aiMessageId)
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getAll.infiniteQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getMessages.infiniteQueryKey({
          id,
          cursor: null,
        }),
      })
    },
    onError: (error) => {
      console.error('Failed to send message:', error)
    },
  })

  // ── Retry / Regenerate ──────────────────────────────────────────────
  const retryMessage = useMutation({
    ...trpc.messages.retryMessage.mutationOptions(),
    onSuccess: (response) => {
      setActiveAiMessageId(response.aiMessageId)
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getMessages.infiniteQueryKey({
          id,
          cursor: null,
        }),
      })
    },
  })

  const regenerate = useMutation({
    ...trpc.messages.regenerate.mutationOptions(),
    onSuccess: (response) => {
      setActiveAiMessageId(response.aiMessageId)
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getMessages.infiniteQueryKey({
          id,
          cursor: null,
        }),
      })
    },
  })

  const onSend = useCallback(
    (content: string) => {
      sendMessage.mutate({ conversationId: id, content })
    },
    [id, sendMessage.mutate],
  )

  const onRetry = useCallback(
    (messageId: string) => {
      retryMessage.mutate({ conversationId: id, messageId })
    },
    [id, retryMessage.mutate],
  )

  const onRegenerate = useCallback(
    (messageId: string) => {
      regenerate.mutate({ conversationId: id, messageId })
    },
    [id, regenerate.mutate],
  )

  const { scrollRef, bottomRef, handleScroll } = useAutoScroll(items)

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
            onRetry={onRetry}
            onRegenerate={onRegenerate}
          />
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input at bottom */}
      <div className="shrink-0 border-t border-border/50 bg-background">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <ChatInput
            isStreaming={isStreaming}
            onSubmit={onSend}
          />
        </div>
      </div>
    </div>
  )
}