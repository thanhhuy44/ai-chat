import { ChatRoom, ChatRoomLoading } from '@/features/chat/room'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/chat/$id/')({
  loader: ({ context: { queryClient, trpc }, params: { id } }) => {
    queryClient.prefetchInfiniteQuery(
      trpc.conversations.getMessages.infiniteQueryOptions(
        {
          cursor: null,
          id,
        },
        {
          getNextPageParam: (lastPage) =>
            lastPage.pagination.cursor ?? undefined,
        },
      ),
    )
  },
  pendingComponent: ChatRoomLoading,
  component: ChatRoom,
})
