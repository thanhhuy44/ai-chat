import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Copy, RefreshCw, RotateCcw } from 'lucide-react'

interface AiMessageActionsProps {
  messageId: string
  content: string
  status: string
  onRegenerate: (messageId: string) => void
}

export const AiMessageActions = ({
  messageId,
  content,
  status,
  onRegenerate,
}: AiMessageActionsProps) => {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content)
  }, [content])

  if (status === 'streaming') {
    return null
  }

  return (
    <TooltipProvider>
      <div className="mt-1 flex items-center gap-1">
        {status === 'failed' ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={() => onRegenerate(messageId)}
                aria-label="Retry"
              >
                <RefreshCw className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Retry</TooltipContent>
          </Tooltip>
        ) : (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRegenerate(messageId)}
                  aria-label="Regenerate"
                >
                  <RotateCcw className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Regenerate</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={handleCopy}
                  aria-label="Copy"
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Copy</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
