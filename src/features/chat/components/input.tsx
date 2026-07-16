import { useTRPC } from '#/trpc/react'
import { ArrowUpIcon, CircleNotchIcon } from '@phosphor-icons/react/dist/ssr'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface ChatInputProps {
  isStreaming: boolean
}

export const ChatInput = ({ isStreaming }: ChatInputProps) => {
  const [text, setText] = useState('')
  const { id } = useParams({
    from: '/_auth/chat/$id/',
  })
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const sendMessage = useMutation({
    mutationFn: () => Promise.resolve({}),
    onSuccess: (message) => {
      setText('')
    },
  })

  const onSubmit = useCallback(() => {
    const content = text.trim()
    if (!content || isStreaming) {
      return
    }
    sendMessage.mutate()
  }, [text, id, isStreaming])

  return (
    <div className="chat-input-wrapper flex items-end gap-2">
      <TextareaAutosize
        rows={1}
        maxRows={6}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSubmit()
          }
        }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Message..."
        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/60"
      />
      <button
        type="button"
        onClick={onSubmit}
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {isStreaming ? (
          <CircleNotchIcon className="size-4 animate-spin" />
        ) : (
          <ArrowUpIcon className="size-4" />
        )}
      </button>
    </div>
  )
}
