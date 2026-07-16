import { useTRPC } from '#/trpc/react'
import { useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import { useState } from 'react'

export const useStream = (conversationId: string) => {
  const [message, setMessage] = useState('')
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const subscription = useSubscription(
    trpc.messages.onSend.subscriptionOptions(
      { conversationId },
      {
        onData: ({ status, content, data }) => {
          if (status === 'streaming') {
            setMessage(content)
          }

          if (status === 'completed') {
            setMessage('')

            queryClient.setQueryData(
              trpc.conversations.getMessages.infiniteQueryKey({
                id: conversationId,
              }),
              (old) => {
                if (!old) return old
                const lastPageIndex = old.pages.length - 1
                return {
                  ...old,
                  pages: old.pages.map((page, index) => {
                    if (index !== lastPageIndex) return page
                    return {
                      ...page,
                      items: [...page.items, data],
                    }
                  }),
                }
              },
            )
          }
        },
        onError: () => {
          setMessage('')
        },
      },
    ),
  )

  return {
    message,
    isStreaming: subscription.status === 'pending',
  }
}
