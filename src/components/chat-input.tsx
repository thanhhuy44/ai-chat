import { useTRPC } from '@/trpc/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useCallback, useState } from 'react'
import { ModelSelector } from './model-select'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ArrowUp, File, Pause } from 'lucide-react'
import { useModels } from '@/stores/model'

type Props = {
  isStreaming: boolean
}
export const ChatInput = ({ isStreaming }: Props) => {
  const [text, setText] = useState('')
  const params = useParams({
    strict: false,
  })
  const id = params.id
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { model } = useModels()

  const mutation = useMutation({
    ...trpc.messages.send.mutationOptions(),
    onSuccess: (response) => {
      if (!id) {
        queryClient.invalidateQueries({
          queryKey: trpc.conversations.getAll.infiniteQueryKey(),
        })
        navigate({
          to: '/chat/$id',
          params: {
            id: response.conversationId,
          },
        })
        return
      }
      //    setActiveAiMessageId(response.aiMessageId)
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getAll.infiniteQueryKey(),
      })
      queryClient.invalidateQueries({
        queryKey: trpc.conversations.getMessages.infiniteQueryKey({
          id,
          cursor: null,
        }),
      })
    },
    onError: (error) => {
      console.error('🚀 ~ NewChatPage ~ error:', error)
    },
  })

  const cancelGeneration = useMutation({
    ...trpc.messages.cancelGeneration.mutationOptions(),
  })

  const handleSubmit = useCallback(() => {
    const content = text.trim()
    if (!content || isStreaming || !model) return
    setText('')
    mutation.mutate({
      content,
      model,
      conversationId: id,
    })
  }, [text, isStreaming, model])

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
    if (!id) return
    cancelGeneration.mutate({ conversationId: id })
  }, [id, cancelGeneration.mutate])

  return (
    <div className="flex flex-col gap-4 p-4 border rounded-lg">
      {/* Input row */}
      <div className="flex items-center gap-2">
        <Textarea
          rows={2}
          onKeyDown={handleKeyDown}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isStreaming}
          placeholder={isStreaming ? 'Waiting for response...' : 'Message...'}
          className="bg-transparent p-0 rounded-none border-none! outline-none! focus:outline-none! focus-visible:ring-0! ring-0!"
        />
      </div>

      {/* Action rows */}
      <div className="flex justify-between gap-4">
        <Button size={'icon'} variant="ghost">
          <File />
        </Button>
        <div className="flex items-center gap-2">
          <ModelSelector disabled={isStreaming} />
          {isStreaming ? (
            <Button
              type="button"
              size="icon"
              variant="destructive"
              onClick={handleStop}
              title="Stop generation"
            >
              <Pause className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              disabled={!text.trim()}
              onClick={handleSubmit}
            >
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
