import type { ExcelColumn } from './api'

const sameNonEmptyValue = (left?: string, right?: string) => Boolean(left && right && left === right)

export const preservePrimaryKeySelection = (uploadedColumns: ExcelColumn[], previousColumns: ExcelColumn[]): ExcelColumn[] => {
  const previousPrimaryKey = previousColumns.find((column) => column.primaryKey)
  if (!previousPrimaryKey) {
    return uploadedColumns.map((column) => ({ ...column }))
  }

  const matchedIndex = uploadedColumns.findIndex(
    (column) =>
      sameNonEmptyValue(column.name, previousPrimaryKey.name) ||
      sameNonEmptyValue(column.originalHeader, previousPrimaryKey.originalHeader),
  )

  return uploadedColumns.map((column, index) => ({
    ...column,
    primaryKey: matchedIndex >= 0 && index === matchedIndex,
  }))
}
