import { memo, useMemo } from 'react'
import { Streamdown } from 'streamdown'
import { renderers } from './renderer'

interface MarkdownProps {
  content: string
  className?: string
}

/**
 * Pre-configured Markdown renderer for AI responses.
 *
 * Uses Streamdown (a drop-in replacement for react-markdown) with:
 * - GitHub Flavored Markdown (tables, task lists, strikethrough)
 * - Custom renderers for code, headings, lists, tables, links, etc.
 * - Streaming-optimized rendering (handles incomplete blocks gracefully)
 * - Fade-in animation for streaming content
 *
 * The component is memoized to prevent unnecessary re-renders
 * during streaming updates — only changed props trigger a re-render.
 */
export const Markdown = memo(function Markdown({
  content,
  className,
}: MarkdownProps) {
  // Memoize the renderers object to prevent re-render loops
  const components = useMemo(() => renderers, [])

  if (!content) return null

  return (
    <Streamdown
      className={`prose prose-sm max-w-none dark:prose-invert ${className ?? ''}`}
      components={components}
      mode={typeof window !== 'undefined' ? 'streaming' : 'static'}
      // Enable streaming-optimised parsing for incomplete blocks
      parseIncompleteMarkdown
    >
      {content}
    </Streamdown>
  )
})