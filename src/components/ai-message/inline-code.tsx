import type { InlineCodeProps } from './types'

/**
 * Renders inline code (`code` snippets inside paragraphs).
 */
export const InlineCode = ({ children, className, ...props }: InlineCodeProps) => {
  return (
    <code className={`rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground ${className ?? ''}`} {...props}>
      {children}
    </code>
  )
}