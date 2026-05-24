export type DatasetRow = Record<string, unknown>
export type ValueFormat =
  | 'text'
  | 'value'
  | 'integer'
  | 'float1'
  | 'float2'
  | 'percent'
  | 'percent0'
  | 'percent1'
  | 'percent2'
  | 'thousand'
  | 'currency'
  | 'date'
export type SortOrder = 'ascending' | 'descending' | 'none' | ''
export type ConditionalOperator = '>' | '>=' | '<' | '<=' | '=' | '!=' | 'contains' | 'empty' | 'notEmpty'
export type ComparisonTrend = 'up' | 'down' | 'flat' | 'empty'
export type AggregationMethod = 'sum' | 'avg' | 'min' | 'max' | 'count'

export interface TableColumnConfig {
  field: string
  label: string
  width?: number
  minWidth?: number
  align?: 'left' | 'center' | 'right'
  fixed?: '' | 'left' | 'right'
  visible?: boolean
  format?: ValueFormat
}

export interface MetricFormatOptions {
  format?: ValueFormat
  decimalPlaces?: number
  thousandSeparator?: boolean
  prefix?: string
  suffix?: string
  emptyText?: string
  nullText?: string
  currencySymbol?: string
  dateFormat?: string
}

export interface ConditionalRule {
  operator: ConditionalOperator
  value?: unknown
}

export interface ChangeResult {
  current?: number
  previous?: number
  changeValue?: number
  changeRate?: number
  trend: ComparisonTrend
}

const isRecord = (value: unknown): value is DatasetRow => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const normalizeRows = (datasetValue: unknown): DatasetRow[] => {
  if (Array.isArray(datasetValue)) {
    return datasetValue.filter(isRecord)
  }
  if (isRecord(datasetValue)) {
    for (const key of ['data', 'rows', 'records', 'list']) {
      const value = datasetValue[key]
      if (Array.isArray(value)) {
        return value.filter(isRecord)
      }
    }
    return [datasetValue]
  }
  if (datasetValue === undefined || datasetValue === null) {
    return []
  }
  return [{ value: datasetValue }]
}

export const getDatasetFieldNames = (fields: Record<string, string[]> | undefined, key: string): string[] => {
  const value = fields?.[key]
  return Array.isArray(value) ? value.filter(Boolean) : []
}

export const getFieldValue = (row: DatasetRow | undefined, field: string | undefined): unknown => {
  if (!row || !field) {
    return undefined
  }
  if (Object.prototype.hasOwnProperty.call(row, field)) {
    return row[field]
  }
  return field.split('.').reduce<unknown>((current, key) => {
    if (!isRecord(current)) {
      return undefined
    }
    return current[key]
  }, row)
}

export const getFirstFieldValue = (
  row: DatasetRow | undefined,
  fields: Record<string, string[]> | undefined,
  key: string,
): unknown => {
  const fieldName = getDatasetFieldNames(fields, key)[0]
  return getFieldValue(row, fieldName)
}

export const toFiniteNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined
  }
  if (typeof value === 'string') {
    const normalized = value.trim().replace(/,/g, '').replace(/%$/, '')
    if (!normalized) {
      return undefined
    }
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0
  }
  return undefined
}

const isFiniteNumber = (value: number | undefined): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

const withThousands = (value: string): string => {
  const [integerPart = '', decimalPart] = value.split('.')
  const signed = integerPart.startsWith('-')
  const normalizedInteger = signed ? integerPart.slice(1) : integerPart
  const formatted = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${signed ? '-' : ''}${formatted}${decimalPart === undefined ? '' : `.${decimalPart}`}`
}

export const formatDateValue = (value: unknown, format = 'YYYY-MM-DD HH:mm:ss'): string => {
  if (value === undefined || value === null || value === '') {
    return ''
  }
  const date = value instanceof Date ? value : new Date(value as string | number)
  if (Number.isNaN(date.getTime())) {
    return String(value)
  }
  const pad = (input: number) => String(input).padStart(2, '0')
  return format
    .replace(/YYYY/g, String(date.getFullYear()))
    .replace(/MM/g, pad(date.getMonth() + 1))
    .replace(/DD/g, pad(date.getDate()))
    .replace(/HH/g, pad(date.getHours()))
    .replace(/mm/g, pad(date.getMinutes()))
    .replace(/ss/g, pad(date.getSeconds()))
}

export const formatMetricValue = (value: unknown, options: MetricFormatOptions = {}): string => {
  const emptyText = options.emptyText ?? options.nullText ?? '--'
  if (value === undefined || value === null || value === '') {
    return emptyText
  }
  if (options.format === 'date') {
    return `${options.prefix ?? ''}${formatDateValue(value, options.dateFormat)}${options.suffix ?? ''}`
  }
  if (options.format === 'text') {
    return `${options.prefix ?? ''}${String(value)}${options.suffix ?? ''}`
  }

  const numeric = toFiniteNumber(value)
  if (numeric === undefined) {
    return `${options.prefix ?? ''}${String(value)}${options.suffix ?? ''}`
  }

  let formatted: string
  switch (options.format) {
    case 'integer':
      formatted = Math.round(numeric).toString()
      break
    case 'float1':
      formatted = numeric.toFixed(1)
      break
    case 'float2':
      formatted = numeric.toFixed(2)
      break
    case 'percent':
      formatted = `${(numeric * 100).toFixed(options.decimalPlaces ?? 2)}%`
      break
    case 'percent0':
      formatted = `${(numeric * 100).toFixed(0)}%`
      break
    case 'percent1':
      formatted = `${(numeric * 100).toFixed(1)}%`
      break
    case 'percent2':
      formatted = `${(numeric * 100).toFixed(2)}%`
      break
    case 'thousand':
      formatted = withThousands((Number.isInteger(numeric) ? numeric.toString() : numeric.toString()))
      break
    case 'currency':
      formatted = `${options.currencySymbol ?? ''}${withThousands(numeric.toFixed(options.decimalPlaces ?? 2))}`
      break
    case 'value':
    default:
      formatted =
        typeof options.decimalPlaces === 'number' ? numeric.toFixed(options.decimalPlaces) : numeric.toString()
      if (options.thousandSeparator) {
        formatted = withThousands(formatted)
      }
      break
  }

  return `${options.prefix ?? ''}${formatted}${options.suffix ?? ''}`
}

export const calculateChange = (
  currentValue: unknown,
  previousValue: unknown,
  zeroPolicy: 'empty' | 'zero' | 'infinite' = 'empty',
): ChangeResult => {
  const current = toFiniteNumber(currentValue)
  const previous = toFiniteNumber(previousValue)
  if (current === undefined || previous === undefined) {
    return { current, previous, trend: 'empty' }
  }

  const changeValue = current - previous
  let changeRate: number | undefined
  if (previous === 0) {
    if (zeroPolicy === 'zero') {
      changeRate = 0
    } else if (zeroPolicy === 'infinite') {
      changeRate = changeValue === 0 ? 0 : changeValue > 0 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    }
  } else {
    changeRate = changeValue / Math.abs(previous)
  }

  const trend: ComparisonTrend = changeValue > 0 ? 'up' : changeValue < 0 ? 'down' : 'flat'
  return { current, previous, changeValue, changeRate, trend }
}

const hasFieldPair = (row: DatasetRow | undefined, fields: Record<string, string[]> | undefined): boolean => {
  const currentField = getDatasetFieldNames(fields, 'currentValueField')[0]
  const previousField = getDatasetFieldNames(fields, 'previousValueField')[0]
  return getFieldValue(row, currentField) !== undefined && getFieldValue(row, previousField) !== undefined
}

export const resolveComparison = (
  rows: DatasetRow[],
  fields: Record<string, string[]> | undefined,
  props: {
    dataMode: {
      mode: 'fields' | 'series' | 'autoFallback'
      lag: number
      sortByTime: 'asc' | 'desc' | 'none'
      zeroPolicy: 'empty' | 'zero' | 'infinite'
    }
  },
): ChangeResult & { title?: string } => {
  const firstRow = rows[0]
  const mode = props.dataMode.mode
  if ((mode === 'fields' || mode === 'autoFallback') && hasFieldPair(firstRow, fields)) {
    const currentValue = getFirstFieldValue(firstRow, fields, 'currentValueField')
    const previousValue = getFirstFieldValue(firstRow, fields, 'previousValueField')
    const result = calculateChange(currentValue, previousValue, props.dataMode.zeroPolicy)
    const directChange = toFiniteNumber(getFirstFieldValue(firstRow, fields, 'changeValueField'))
    const directRate = toFiniteNumber(getFirstFieldValue(firstRow, fields, 'changeRateField'))
    return {
      ...result,
      changeValue: directChange ?? result.changeValue,
      changeRate: directRate ?? result.changeRate,
      title: String(getFirstFieldValue(firstRow, fields, 'titleField') ?? ''),
    }
  }
  if (mode === 'fields') {
    return {
      trend: 'empty',
      title: String(getFirstFieldValue(firstRow, fields, 'titleField') ?? ''),
    }
  }

  const timeField = getDatasetFieldNames(fields, 'timeField')[0]
  const valueField = getDatasetFieldNames(fields, 'valueField')[0]
  const sortedRows = [...rows]
  if (timeField && props.dataMode.sortByTime !== 'none') {
    sortedRows.sort((a, b) => {
      const aValue = getFieldValue(a, timeField)
      const bValue = getFieldValue(b, timeField)
      const diff = String(aValue ?? '').localeCompare(String(bValue ?? ''))
      return props.dataMode.sortByTime === 'asc' ? diff : -diff
    })
  }

  const currentRow = sortedRows[sortedRows.length - 1]
  const previousRow = sortedRows[Math.max(sortedRows.length - 1 - Math.max(props.dataMode.lag, 1), 0)]
  const result = calculateChange(
    getFieldValue(currentRow, valueField),
    getFieldValue(previousRow, valueField),
    props.dataMode.zeroPolicy,
  )
  return {
    ...result,
    title: String(getFirstFieldValue(currentRow, fields, 'titleField') ?? ''),
  }
}

export const buildColumnsFromRows = (rows: DatasetRow[], displayFields: string[] = []): TableColumnConfig[] => {
  const fields = displayFields.length > 0 ? displayFields : Object.keys(rows[0] ?? {})
  return fields.map(field => ({
    field,
    label: field,
    minWidth: 100,
    align: 'left',
    fixed: '',
    visible: true,
    format: 'text',
  }))
}

export const filterRows = (rows: DatasetRow[], keyword: string, fields: string[] = []): DatasetRow[] => {
  const normalizedKeyword = keyword.trim().toLowerCase()
  if (!normalizedKeyword) {
    return rows
  }
  return rows.filter(row => {
    const keys = fields.length > 0 ? fields : Object.keys(row)
    return keys.some(field => String(getFieldValue(row, field) ?? '').toLowerCase().includes(normalizedKeyword))
  })
}

export const sortRows = (rows: DatasetRow[], field: string, order: SortOrder): DatasetRow[] => {
  if (!field || !order || order === 'none') {
    return rows
  }
  return [...rows].sort((a, b) => {
    const aValue = getFieldValue(a, field)
    const bValue = getFieldValue(b, field)
    const aNumber = toFiniteNumber(aValue)
    const bNumber = toFiniteNumber(bValue)
    const diff =
      aNumber !== undefined && bNumber !== undefined
        ? aNumber - bNumber
        : String(aValue ?? '').localeCompare(String(bValue ?? ''))
    return order === 'ascending' ? diff : -diff
  })
}

export const aggregateRows = (
  rows: DatasetRow[],
  dimensions: string[],
  aggregations: Array<{ field: string; method: AggregationMethod }>,
): DatasetRow[] => {
  if (dimensions.length === 0 || aggregations.length === 0) {
    return rows
  }
  const groups = new Map<string, DatasetRow[]>()
  for (const row of rows) {
    const key = dimensions.map(field => String(getFieldValue(row, field) ?? '')).join('\u0001')
    const groupRows = groups.get(key) ?? []
    groupRows.push(row)
    groups.set(key, groupRows)
  }

  return Array.from(groups.values()).map(groupRows => {
    const first = groupRows[0] ?? {}
    const result: DatasetRow = {}
    for (const dimension of dimensions) {
      result[dimension] = getFieldValue(first, dimension)
    }
    for (const aggregation of aggregations) {
      const values = groupRows.map(row => toFiniteNumber(getFieldValue(row, aggregation.field))).filter(isFiniteNumber)
      const key = aggregation.field
      switch (aggregation.method) {
        case 'avg':
          result[key] = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : undefined
          break
        case 'min':
          result[key] = values.length > 0 ? Math.min(...values) : undefined
          break
        case 'max':
          result[key] = values.length > 0 ? Math.max(...values) : undefined
          break
        case 'count':
          result[key] = groupRows.length
          break
        case 'sum':
        default:
          result[key] = values.reduce((sum, value) => sum + value, 0)
          break
      }
    }
    return result
  })
}

export const summarizeRows = (
  rows: DatasetRow[],
  fields: string[],
  methods: Array<{ field: string; method: AggregationMethod }>,
): Record<string, string | number> => {
  const summary: Record<string, string | number> = {}
  for (const field of fields) {
    const method = methods.find(item => item.field === field)?.method
    if (!method) {
      summary[field] = ''
      continue
    }
    const values = rows.map(row => toFiniteNumber(getFieldValue(row, field))).filter(isFiniteNumber)
    switch (method) {
      case 'avg':
        summary[field] = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : ''
        break
      case 'min':
        summary[field] = values.length > 0 ? Math.min(...values) : ''
        break
      case 'max':
        summary[field] = values.length > 0 ? Math.max(...values) : ''
        break
      case 'count':
        summary[field] = rows.length
        break
      case 'sum':
      default:
        summary[field] = values.reduce((sum, value) => sum + value, 0)
        break
    }
  }
  return summary
}

export const matchConditionalRule = (value: unknown, rule: ConditionalRule): boolean => {
  const numericValue = toFiniteNumber(value)
  const numericRule = toFiniteNumber(rule.value)
  switch (rule.operator) {
    case '>':
      return numericValue !== undefined && numericRule !== undefined && numericValue > numericRule
    case '>=':
      return numericValue !== undefined && numericRule !== undefined && numericValue >= numericRule
    case '<':
      return numericValue !== undefined && numericRule !== undefined && numericValue < numericRule
    case '<=':
      return numericValue !== undefined && numericRule !== undefined && numericValue <= numericRule
    case '=':
      return String(value ?? '') === String(rule.value ?? '')
    case '!=':
      return String(value ?? '') !== String(rule.value ?? '')
    case 'contains':
      return String(value ?? '').includes(String(rule.value ?? ''))
    case 'empty':
      return value === undefined || value === null || value === ''
    case 'notEmpty':
      return value !== undefined && value !== null && value !== ''
    default:
      return false
  }
}

export const getPaginationItems = <T>(rows: T[], page: number, pageSize: number): T[] => {
  const safePageSize = Math.max(pageSize, 1)
  const safePage = Math.max(page, 1)
  return rows.slice((safePage - 1) * safePageSize, safePage * safePageSize)
}
