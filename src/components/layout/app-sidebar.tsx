import * as React from 'react'
import { ChatCircleDotsIcon, PlusIcon } from '@phosphor-icons/react/dist/ssr'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { NavUser } from './nav-user'
import { Link, useParams, useNavigate } from '@tanstack/react-router'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useTRPC } from '#/trpc/react'
import { flattenInfiniteData } from '#/lib/utils'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC()
  const params = useParams({
    strict: false,
  })
  const navigate = useNavigate()

  const conversationsQuery = useInfiniteQuery(
    trpc.conversations.getAll.infiniteQueryOptions(
      {
        cursor: null,
        limit: 50,
      },
      {
        getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
        initialCursor: null,
      },
    ),
  )

  const conversations = React.useMemo(() => {
    return flattenInfiniteData(conversationsQuery.data)
  }, [conversationsQuery.data])

  return (
    <Sidebar {...props}>
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="group/sidebar-logo"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChatCircleDotsIcon className="size-4" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <span className="font-semibold text-sm">Filixer AI</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* New chat button */}
        <button
          onClick={() => navigate({ to: '/chat' })}
          className="mt-2 flex w-full items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <PlusIcon className="size-4" />
          <span>New chat</span>
        </button>
      </SidebarHeader>

      <SidebarContent>
        <div className="px-3 py-2">
          <p className="mb-2 text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider">
            Conversations
          </p>
          <div className="space-y-0.5">
            {conversations.map((conv) => (
              <Link
                key={conv.id}
                to="/chat/$id"
                params={{ id: conv.id }}
                className={`sidebar-conversation-item block truncate ${
                  params.id === conv.id ? 'active' : ''
                }`}
              >
                {conv.title}
              </Link>
            ))}
            {conversations.length === 0 && (
              <p className="text-sm text-sidebar-foreground/40 px-0.5 py-2">
                No conversations yet
              </p>
            )}
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />

      <SidebarFooter className="border-t border-sidebar-border">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}