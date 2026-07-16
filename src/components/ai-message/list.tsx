import type { ListProps, ListItemProps } from './types'

export const OrderedList = ({ children, className, ...props }: ListProps) => {
  return (
    <ol className={`mb-3 list-decimal pl-6 last:mb-0 ${className ?? ''}`} {...props}>
      {children}
    </ol>
  )
}

export const UnorderedList = ({ children, className, ...props }: ListProps) => {
  return (
    <ul className={`mb-3 list-disc pl-6 last:mb-0 ${className ?? ''}`} {...props}>
      {children}
    </ul>
  )
}

export const ListItem = ({ children, className, ...props }: ListItemProps) => {
  return (
    <li className={`mb-1 leading-relaxed ${className ?? ''}`} {...props}>
      {children}
    </li>
  )
}