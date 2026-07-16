import type { HeadingProps } from './types'

export const Heading = ({ children, className, ...props }: HeadingProps) => {
  return (
    <h1 className={`mb-3 mt-6 font-semibold tracking-tight first:mt-0 ${className ?? ''}`} {...props}>
      {children}
    </h1>
  )
}