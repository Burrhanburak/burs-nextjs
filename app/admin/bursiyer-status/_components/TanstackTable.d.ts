import "@tanstack/react-table"

declare module "@tanstack/react-table" {
  // These type parameters are required by the library's type system
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    className?: string
    displayName: string
  }
}
