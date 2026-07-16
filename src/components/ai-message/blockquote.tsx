import type { BlockquoteProps } from './types'

export const Blockquote = ({ children, className, ...props }: BlockquoteProps) => {
  return (
    <blockquote className={`mb-3 border-l-4 border-primary/30 pl-4 italic text-muted-foreground last:mb-0 ${className ?? ''}`} {...props}>
      {children}
    </blockquote>
  )
}