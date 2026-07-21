import { useTRPC } from '@/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import { useState, useEffect, useRef } from 'react'

interface StreamEvent {
  status: 'connected' | 'streaming' | 'completed' | 'error'
  content: string
  data: {
    id: string
    content: string
    role: string
    status: string
    createdAt: Date
    updatedAt: Date
    conversationId: string
  } | null
}

/**
 * Subscribe to a single AI generation. Pass `aiMessageId` to start streaming,
 * pass `null` to idle. `onComplete` is called when generation finishes or errors.
 */
export const useStream = (
  conversationId: string,
  modelId: string,
  aiMessageId: string | null,
  onComplete?: () => void,
) => {
  const [streamingContent, setStreamingContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    if (aiMessageId) {
      setStreamingContent('')
      setIsStreaming(true)
    } else {
      setStreamingContent('')
      setIsStreaming(false)
    }
  }, [aiMessageId, conversationId])

  const enabled = !!aiMessageId

  useSubscription(
    trpc.messages.streamMessage.subscriptionOptions(
      { conversationId, aiMessageId: aiMessageId ?? '', modelId },
      {
        enabled,
        onData: (event: StreamEvent) => {
          if (event.status === 'connected') return

          if (event.status === 'streaming') {
            setStreamingContent(event.content)
            return
          }

          if (event.status === 'completed') {
            setStreamingContent('')
            setIsStreaming(false)

            // Update the cache: replace the streaming placeholder with the completed message
            queryClient.setQueryData(
              trpc.conversations.getMessages.infiniteQueryKey({
                id: conversationId,
                cursor: null,
              }),
              (old: any) => {
                if (!old) return old
                const lastPageIndex = old.pages.length - 1
                return {
                  ...old,
                  pages: old.pages.map((page: any, index: number) => {
                    if (index !== lastPageIndex) return page
                    const items = [...page.items]
                    const lastAiIdx = items.length - 1
                    if (lastAiIdx >= 0 && items[lastAiIdx].role === 'ai') {
                      items[lastAiIdx] = event.data
                    } else {
                      items.push(event.data)
                    }
                    return { ...page, items }
                  }),
                }
              },
            )

            queryClient.invalidateQueries({
              queryKey: trpc.conversations.getAll.infiniteQueryKey(),
            })

            onCompleteRef.current?.()
            return
          }

          // Error case
          setStreamingContent('')
          setIsStreaming(false)

          queryClient.invalidateQueries({
            queryKey: trpc.conversations.getMessages.infiniteQueryKey({
              id: conversationId,
              cursor: null,
            }),
          })

          onCompleteRef.current?.()
        },
        onError: () => {
          setStreamingContent('')
          setIsStreaming(false)
          onCompleteRef.current?.()
        },
      },
    ),
  )

  return {
    message: streamingContent,
    isStreaming,
  }
}
