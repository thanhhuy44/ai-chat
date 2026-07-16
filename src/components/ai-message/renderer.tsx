import type { Components } from 'streamdown'
import { InlineCode } from './inline-code'
import { Paragraph } from './paragraph'
import { Heading } from './heading'
import { OrderedList, UnorderedList, ListItem } from './list'
import { Blockquote } from './blockquote'
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from './table'
import { Link } from './link'

/**
 * Mapping of Markdown element types to custom React components.
 * Pass this as the `components` prop to Streamdown.
 */
export const renderers: Components = {
  // Inline code
  inlineCode: InlineCode,

  // Block elements
  p: Paragraph,
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  h5: Heading,
  h6: Heading,

  // Lists
  ol: OrderedList,
  ul: UnorderedList,
  li: ListItem,

  // Blockquotes
  blockquote: Blockquote,

  // Tables
  table: Table,
  thead: TableHead,
  tbody: TableBody,
  tr: TableRow,
  th: TableHeader,
  td: TableCell,

  // Links
  a: Link,
}