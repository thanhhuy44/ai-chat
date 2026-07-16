import type { ExtraProps } from 'streamdown'

/** Props for a `<p>` renderer component. */
export type ParagraphProps = React.ComponentPropsWithoutRef<'p'> & ExtraProps

/** Props for a heading renderer component. */
export type HeadingProps = React.ComponentPropsWithoutRef<'h1'> & ExtraProps

/** Props for a list renderer component. */
export type ListProps = React.ComponentPropsWithoutRef<'ul'> & ExtraProps

/** Props for a list item renderer component. */
export type ListItemProps = React.ComponentPropsWithoutRef<'li'> & ExtraProps

/** Props for a blockquote renderer component. */
export type BlockquoteProps = React.ComponentPropsWithoutRef<'blockquote'> & ExtraProps

/** Props for a table renderer component. */
export type TableProps = React.ComponentPropsWithoutRef<'table'> & ExtraProps

/** Props for a table section (thead/tbody) renderer component. */
export type TableSectionProps = React.ComponentPropsWithoutRef<'thead'> & ExtraProps

/** Props for a table row renderer component. */
export type TableRowProps = React.ComponentPropsWithoutRef<'tr'> & ExtraProps

/** Props for a table header cell renderer component. */
export type TableHeaderProps = React.ComponentPropsWithoutRef<'th'> & ExtraProps

/** Props for a table cell renderer component. */
export type TableCellProps = React.ComponentPropsWithoutRef<'td'> & ExtraProps

/** Props for a link renderer component. */
export type LinkProps = React.ComponentPropsWithoutRef<'a'> & ExtraProps

/** Props for an inline code renderer component. */
export type InlineCodeProps = React.ComponentPropsWithoutRef<'code'> & ExtraProps