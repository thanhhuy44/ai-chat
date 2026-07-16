import type { LinkProps } from './types'

export const Link = ({ children, href, className, ...props }: LinkProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`font-medium text-primary underline underline-offset-2 transition-colors hover:text-primary/80 ${className ?? ''}`}
      {...props}
    >
      {children}
    </a>
  )
}