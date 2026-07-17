import * as React from 'react'
import {
  ChatCircleDotsIcon,
  DotsThreeIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { flattenInfiniteData } from '@/lib/utils'
import { useTRPC } from '@/trpc/react'
import { NavUser } from './nav-user'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const trpc = useTRPC()
  const params = useParams({ strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const conversationsQuery = useInfiniteQuery(
    trpc.conversations.getAll.infiniteQueryOptions(
      { cursor: null, limit: 50 },
      {
        getNextPageParam: (lastPage) => lastPage.pagination.cursor ?? undefined,
        initialCursor: null,
      },
    ),
  )

  const conversations = React.useMemo(() => flattenInfiniteData(conversationsQuery.data), [
    conversationsQuery.data,
  ])

  const invalidateList = () => {
    queryClient.invalidateQueries({
      queryKey: trpc.conversations.getAll.infiniteQueryKey({
        cursor: null,
        limit: 50,
      }),
    })
  }

  // ── Rename ──────────────────────────────────────────────────────────
  const [renameTarget, setRenameTarget] = React.useState<{
    id: string
    title: string
  } | null>(null)
  const [renameValue, setRenameValue] = React.useState('')

  const renameMutation = useMutation({
    ...trpc.conversations.update.mutationOptions(),
    onSuccess: () => {
      invalidateList()
      setRenameTarget(null)
      toast('Conversation renamed')
    },
    onError: () => {
      toast('Failed to rename conversation')
    },
  })

  // ── Delete ───────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = React.useState<{
    id: string
    title: string
  } | null>(null)

  const deleteMutation = useMutation({
    ...trpc.conversations.delete.mutationOptions(),
    onSuccess: () => {
      invalidateList()
      setDeleteTarget(null)
      // Navigate away if we are on the deleted conversation
      if (params.id === deleteTarget?.id) {
        navigate({ to: '/chat' })
      }
      toast('Conversation deleted')
    },
    onError: () => {
      toast('Failed to delete conversation')
    },
  })

  return (
    <>
      <Sidebar {...props}>
        <SidebarHeader className="p-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="group/sidebar-logo">
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
            <SidebarMenu>
              {conversations.map((conv) => (
                <SidebarMenuItem key={conv.id} className="group/item">
                  <SidebarMenuButton asChild isActive={params.id === conv.id}>
                    <Link to="/chat/$id" params={{ id: conv.id }}>
                      <span className="truncate">{conv.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction
                        showOnHover
                        aria-label="Conversation actions"
                      >
                        <DotsThreeIcon />
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                      <DropdownMenuItem
                        onClick={() => {
                          setRenameValue(conv.title)
                          setRenameTarget({ id: conv.id, title: conv.title })
                        }}
                      >
                        <PencilSimpleIcon />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() =>
                          setDeleteTarget({ id: conv.id, title: conv.title })
                        }
                      >
                        <TrashIcon />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              ))}
              {conversations.length === 0 && (
                <p className="px-0.5 py-2 text-sm text-sidebar-foreground/40">
                  No conversations yet
                </p>
              )}
            </SidebarMenu>
          </div>
        </SidebarContent>

        <SidebarRail />

        <SidebarFooter className="border-t border-sidebar-border">
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      {/* Rename Dialog */}
      <Dialog
        open={renameTarget !== null}
        onOpenChange={(open) => {
          if (!open) setRenameTarget(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && renameTarget) {
                renameMutation.mutate({
                  id: renameTarget.id,
                  title: renameValue,
                })
              }
              if (e.key === 'Escape') setRenameTarget(null)
            }}
            placeholder="Conversation title"
            autoFocus
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              disabled={!renameValue.trim() || renameMutation.isPending}
              onClick={() => {
                if (renameTarget) {
                  renameMutation.mutate({
                    id: renameTarget.id,
                    title: renameValue,
                  })
                }
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <strong>{deleteTarget?.title}</strong>? This action cannot be
              undone and all messages will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate({ id: deleteTarget.id })
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
