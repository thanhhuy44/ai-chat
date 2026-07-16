import {
  ArrowUpIcon,
  PauseIcon,
} from '@phosphor-icons/react/dist/ssr'
import { useTRPC } from '#/trpc/react'
import { useMutation } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

interface ChatInputProps {
  isStreaming: boolean
  onSubmit: (content: string) => void
}

export const ChatInput = ({ isStreaming, onSubmit }: ChatInputProps) => {
  const [text, setText] = useState('')
  const { id } = useParams({
    from: '/_auth/chat/$id/',
  })
  const trpc = useTRPC()

  const cancelGeneration = useMutation({
    ...trpc.messages.cancelGeneration.mutationOptions(),
  })

  const handleSubmit = useCallback(() => {
    const content = text.trim()
    if (!content || isStreaming) return
    onSubmit(content)
  }, [text, isStreaming, onSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmit()
      }
    },
    [handleSubmit],
  )

  const handleStop = useCallback(() => {
    cancelGeneration.mutate({ conversationId: id })
  }, [id, cancelGeneration.mutate])

  return (
    <div className="chat-input-wrapper flex items-end gap-2">
      <TextareaAutosize
        rows={1}
        maxRows={6}
        onKeyDown={handleKeyDown}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isStreaming}
        placeholder={
          isStreaming ? 'Waiting for response...' : 'Message...'
        }
        className="flex-1 resize-none bg-transparent px-3 py-2.5 text-base outline-none placeholder:text-muted-foreground/60 disabled:opacity-50"
      />
      {isStreaming ? (
        <button
          type="button"
          onClick={handleStop}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90"
          title="Stop generation"
        >
          <PauseIcon className="size-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowUpIcon className="size-4" />
        </button>
      )}
    </div>
  )
}