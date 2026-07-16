import { Markdown } from './markdown'

interface AiMessageProps {
  content: string
  className?: string
}

/**
 * AiMessage — public entry point for rendering AI message content.
 *
 * Wraps the Markdown renderer with AI-specific defaults.
 * Keeps the external API simple: just pass the `content` string.
 *
 * @example
 * ```tsx
 * <AiMessage content="Hello! Here's some **markdown**" />
 * ```
 */
export const AiMessage = ({ content, className }: AiMessageProps) => {
  return <Markdown content={content} className={className} />
}
