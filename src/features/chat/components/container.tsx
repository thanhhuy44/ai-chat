import { useAutoScroll } from '@/hooks/use-scroll'
import { useStream } from '@/hooks/use-stream'
import { useTRPC } from '@/trpc/react'
import { flattenInfiniteData } from '@/lib/utils'
import {
  useMutation,
  useQueryClient,
  useInfiniteQuery,
  useQuery,
} from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageList } from './message-list'
import { ChatInput } from '@/components/chat-input'
import { useModels } from '@/stores/model'

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
  const { model } = useModels()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  // ── Conversation query (for model) ───────────────────────────────────
  const conversationQuery = useQuery(
    trpc.conversations.getById.queryOptions({ id }),
  )

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
    () => flattenInfiniteData(messages.data) as MessageItem[],
    [messages.data],
  )

  // ── Active AI generation state ──────────────────────────────────────
  const [activeAiMessageId, setActiveAiMessageId] = useState<string | null>(
    null,
  )

  // Reset when navigating to a different conversation
  useEffect(() => {
    setActiveAiMessageId(null)
  }, [id])

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
    model!,
    activeAiMessageId,
    handleGenerationComplete,
  )

  // ── Regenerate ──────────────────────────────────────────────────────
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

  const onRegenerate = useCallback(
    (messageId: string) => {
      regenerate.mutate({
        conversationId: id,
        messageId,
        model,
      })
    },
    [id, model, regenerate.mutate],
  )

  const { scrollRef, bottomRef, handleScroll } = useAutoScroll([
    items,
    streamingMessage,
  ])

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
            isStreaming={isStreaming}
            onRegenerate={onRegenerate}
          />
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input at bottom */}
      <div className="">
        <div className="mx-auto max-w-3xl px-4">
          <ChatInput isStreaming={isStreaming} />
        </div>
      </div>
    </div>
  )
}
