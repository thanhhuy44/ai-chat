import { useTRPC } from '@/trpc/react'
import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowUpIcon, CircleNotchIcon } from '@phosphor-icons/react/dist/ssr'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Controller, useForm } from 'react-hook-form'
import TextareaAutosize from 'react-textarea-autosize'
import z from 'zod'

const newMessageSchema = z.object({
  content: z.string().min(1),
})

type NewMessageBody = z.infer<typeof newMessageSchema>

export const NewChatPage = () => {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const form = useForm<NewMessageBody>({
    resolver: zodResolver(newMessageSchema),
    defaultValues: {
      content: '',
    },
  })
  const navigate = useNavigate()

  const mutation = useMutation({
    ...trpc.messages.send.mutationOptions(),
    onSuccess: (response) => {
      form.reset()
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getAll.infiniteQueryKey(),
      })
      navigate({
        to: '/chat/$id',
        params: {
          id: response.conversationId,
        },
      })
    },
    onError: (error) => {
      console.error('🚀 ~ NewChatPage ~ error:', error)
    },
  })

  const onSubmit = (body: NewMessageBody) => mutation.mutate(body)

  return (
    <div className="flex h-dvh flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            What can I help with?
          </h1>
          <p className="text-sm text-muted-foreground">
            Ask anything, get instant answers
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Controller
            control={form.control}
            name="content"
            render={({ field }) => (
              <div className="chat-input-wrapper flex items-center gap-2">
                <TextareaAutosize
                  {...field}
                  rows={1}
                  maxRows={6}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      form.handleSubmit(onSubmit)()
                    }
                  }}
                  placeholder="Message..."
                  className="flex-1 resize-none bg-transparent p-0! text-base outline-none placeholder:text-muted-foreground/60"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={mutation.isPending || !field.value.trim()}
                >
                  {mutation.isPending ? (
                    <CircleNotchIcon className="size-4 animate-spin" />
                  ) : (
                    <ArrowUpIcon className="size-4" />
                  )}
                </Button>
              </div>
            )}
          />
        </form>
      </div>
    </div>
  )
}
