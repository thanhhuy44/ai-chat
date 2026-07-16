import { AppSidebar } from '#/components/layout/app-sidebar'
import { SidebarInset, SidebarProvider } from '#/components/ui/sidebar'
import { getSession } from '#/lib/auth.functions'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const session = await getSession()
    if (!session)
      throw redirect({
        to: '/sign-in',
      })
  },
  loader: ({ context: { queryClient, trpc } }) => {
    queryClient.prefetchInfiniteQuery(
      trpc.conversations.getAll.infiniteQueryOptions(
        {
          limit: 50,
          cursor: null,
        },
        {
          getNextPageParam: (lastPage) =>
            lastPage.pagination.cursor ?? undefined,
        },
      ),
    )
  },
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  )
}
