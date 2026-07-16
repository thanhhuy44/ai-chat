import type { ParagraphProps } from './types'

export const Paragraph = ({ children, className, ...props }: ParagraphProps) => {
  return (
    <p className={`mb-3 leading-relaxed last:mb-0 ${className ?? ''}`} {...props}>
      {children}
    </p>
  )
}