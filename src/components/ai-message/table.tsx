import type {
  TableProps,
  TableSectionProps,
  TableRowProps,
  TableHeaderProps,
  TableCellProps,
} from './types'

export const Table = ({ children, className, ...props }: TableProps) => {
  return (
    <div className="mb-3 overflow-x-auto last:mb-0">
      <table className={`w-full border-collapse text-sm ${className ?? ''}`} {...props}>
        {children}
      </table>
    </div>
  )
}

export const TableHead = ({ children, ...props }: TableSectionProps) => {
  return (
    <thead className="border-b border-border bg-muted/50" {...props}>
      {children}
    </thead>
  )
}

export const TableBody = ({ children, ...props }: TableSectionProps) => {
  return <tbody {...props}>{children}</tbody>
}

export const TableRow = ({ children, ...props }: TableRowProps) => {
  return <tr className="border-b border-border/50 last:border-0" {...props}>{children}</tr>
}

export const TableHeader = ({ children, ...props }: TableHeaderProps) => {
  return (
    <th className="px-3 py-2 text-left font-medium text-muted-foreground" {...props}>
      {children}
    </th>
  )
}

export const TableCell = ({ children, ...props }: TableCellProps) => {
  return (
    <td className="px-3 py-2" {...props}>
      {children}
    </td>
  )
}