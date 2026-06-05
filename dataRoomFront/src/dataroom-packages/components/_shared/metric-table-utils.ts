/**
 * 新增指标卡、趋势指标、周期对比和表格组件共用的数据行类型。
 *
 * 数据集返回值在运行时可能来自 SQL、HTTP、JSON 等不同来源，所以这里不约束字段名，
 * 仅要求每一行是普通对象，具体字段由组件的数据集字段映射或表格列配置决定。
 */
export type DatasetRow = Record<string, unknown>

/**
 * 指标和表格单元格支持的展示格式。
 *
 * - `text`：按原始文本输出，不做数值转换。
 * - `value`：按数值输出，可配合小数位和千分位。
 * - `percent*`：按比例值乘以 100 后输出百分比。
 * - `date`：使用简单日期模板格式化时间值。
 */
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

/**
 * 条件样式使用的比较操作符。
 *
 * 数值比较会先尝试把值转换成有限数字；文本比较和空值判断会保留原始值语义。
 */
export type ConditionalOperator = '>' | '>=' | '<' | '<=' | '=' | '!=' | 'contains' | 'empty' | 'notEmpty'

/**
 * 周期对比和趋势指标的方向判断结果。
 */
export type ComparisonTrend = 'up' | 'down' | 'flat' | 'empty'

/**
 * 表格聚合支持的方法。
 */
export type AggregationMethod = 'sum' | 'avg' | 'min' | 'max' | 'count'

/**
 * 表格列的公共配置结构。
 *
 * `DrDataTable` 使用该结构描述字段、标题、宽度、对齐方式、固定列位置、
 * 显隐状态和默认格式化方式。
 */
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

/**
 * 指标值和表格单元格格式化参数。
 *
 * 该配置同时覆盖指标卡数值、趋势数值、周期对比数值和表格单元格。
 * `emptyText` 与 `nullText` 都用于空值兜底，保留两个字段是为了兼容不同组件配置命名。
 */
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

/**
 * 条件格式规则的最小公共结构。
 *
 * 组件可以在此基础上扩展文字色、背景色、目标字段等 UI 配置，
 * 但匹配逻辑只关心 `operator` 和 `value`。
 */
export interface ConditionalRule {
  operator: ConditionalOperator
  value?: unknown
}

/**
 * 当前值与对比值计算后的结果。
 *
 * `changeValue` 表示差值，`changeRate` 表示变化率，`trend` 给 UI 决定颜色、箭头和文案。
 */
export interface ChangeResult {
  current?: number
  previous?: number
  changeValue?: number
  changeRate?: number
  trend: ComparisonTrend
}

/**
 * 判断运行时值是否是普通对象行。
 *
 * 数组、null 和基础类型都不是数据行。该方法用于过滤数据集结果，防止组件渲染阶段
 * 把数组元素、空值或标量值当作可读取字段的对象处理。
 */
const isRecord = (value: unknown): value is DatasetRow => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

/**
 * 将任意数据集返回值规范化为行数组。
 *
 * 支持以下输入形态：
 * - 数组：过滤掉非对象元素后作为多行数据。
 * - 对象：优先读取 `data`、`rows`、`records`、`list` 字段中的数组。
 * - 普通对象：作为单行数据。
 * - 标量值：包装成 `{ value }`，供指标卡直接读取默认值。
 * - null/undefined：返回空数组。
 *
 * 该方法是 5 个新增组件的数据入口，组件内部应先调用它再读取字段。
 */
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

/**
 * 从组件数据集字段映射中读取某个逻辑字段对应的真实字段名列表。
 *
 * 设计器的数据集字段配置通常是 `Record<string, string[]>`，例如
 * `valueField -> ['amount']`。这里会过滤空字符串，避免空字段名继续传入取值逻辑。
 */
export const getDatasetFieldNames = (fields: Record<string, string[]> | undefined, key: string): string[] => {
  const value = fields?.[key]
  return Array.isArray(value) ? value.filter(Boolean) : []
}

/**
 * 从数据行读取字段值。
 *
 * 读取顺序：
 * 1. 先按完整字段名直接读取，支持字段名本身包含点号的场景。
 * 2. 如果直接字段不存在，再按 `a.b.c` 路径逐层读取嵌套对象。
 *
 * 找不到字段、行为空或路径中间值不是对象时返回 `undefined`。
 */
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

/**
 * 读取某个逻辑字段映射中的第一个字段值。
 *
 * 用于指标类组件的主值、标题、当前值、对比值等单字段映射场景。
 * 如果字段映射不存在或字段取不到值，返回 `undefined`。
 */
export const getFirstFieldValue = (
  row: DatasetRow | undefined,
  fields: Record<string, string[]> | undefined,
  key: string,
): unknown => {
  const fieldName = getDatasetFieldNames(fields, key)[0]
  return getFieldValue(row, fieldName)
}

/**
 * 将运行时值转换为有限数字。
 *
 * 支持 number、数字字符串、带千分位逗号的字符串、末尾带 `%` 的字符串以及 boolean。
 * 无法转换、空字符串、NaN、Infinity 都返回 `undefined`，避免后续计算产生异常数值。
 */
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

/**
 * 判断数字是否是有限值，并在数组过滤时收窄 TypeScript 类型。
 */
const isFiniteNumber = (value: number | undefined): value is number => {
  return typeof value === 'number' && Number.isFinite(value)
}

/**
 * 给数字字符串添加千分位分隔符。
 *
 * 输入必须已经是合法数字字符串，方法会保留负号和小数部分。
 */
const withThousands = (value: string): string => {
  const [integerPart = '', decimalPart] = value.split('.')
  const signed = integerPart.startsWith('-')
  const normalizedInteger = signed ? integerPart.slice(1) : integerPart
  const formatted = normalizedInteger.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `${signed ? '-' : ''}${formatted}${decimalPart === undefined ? '' : `.${decimalPart}`}`
}

/**
 * 按简单模板格式化日期值。
 *
 * 当前支持 `YYYY`、`MM`、`DD`、`HH`、`mm`、`ss` 占位符。
 * 无法被 `Date` 解析的值会直接转成字符串返回，避免表格单元格显示为空。
 */
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

/**
 * 统一格式化指标值或表格单元格值。
 *
 * 处理流程：
 * 1. 空值返回 `emptyText/nullText`，默认 `--`。
 * 2. `date` 和 `text` 走专用分支，不强制转数字。
 * 3. 其他格式会先调用 `toFiniteNumber`，转换失败时保留原始文本。
 * 4. 数值格式根据 `format` 输出整数、小数、百分比、千分位或货币。
 * 5. 最后统一拼接前缀和后缀。
 *
 * 该方法保证指标卡、趋势卡、周期对比和表格中相同格式配置得到一致展示结果。
 */
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

/**
 * 计算当前值与历史值的差值、变化率和趋势方向。
 *
 * `zeroPolicy` 控制历史值为 0 时的变化率：
 * - `empty`：不返回变化率。
 * - `zero`：变化率固定为 0。
 * - `infinite`：根据差值方向返回正/负无穷，差值为 0 时返回 0。
 *
 * 任一输入无法转成有限数字时，返回 `trend: 'empty'`。
 */
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

/**
 * 判断一行数据是否同时包含当前值字段和历史值字段。
 *
 * 周期对比组件在 `fields` 或 `autoFallback` 模式下会优先使用这种直接字段对比。
 */
const hasFieldPair = (row: DatasetRow | undefined, fields: Record<string, string[]> | undefined): boolean => {
  const currentField = getDatasetFieldNames(fields, 'currentValueField')[0]
  const previousField = getDatasetFieldNames(fields, 'previousValueField')[0]
  return getFieldValue(row, currentField) !== undefined && getFieldValue(row, previousField) !== undefined
}

/**
 * 解析周期对比组件需要的当前值、历史值、变化值、变化率和标题。
 *
 * 支持两种数据模式：
 * - 字段直传：一行数据中直接包含当前值、历史值，可选变化值和变化率。
 * - 序列计算：按时间字段排序后，使用最新行和滞后 `lag` 行计算变化。
 *
 * `autoFallback` 会优先尝试字段直传，字段不完整时退回序列计算。
 * 返回结果用于周期对比卡的主值、对比文案、颜色和涨跌图标。
 */
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

/**
 * 根据数据行自动生成表格列配置。
 *
 * 如果提供 `displayFields`，只按该字段顺序生成列；否则读取首行对象的全部字段。
 * 自动列默认可见、左对齐、最小宽 100，并按文本格式展示。
 */
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

/**
 * 在前端按关键字过滤表格行。
 *
 * `fields` 为空时搜索整行所有字段；否则只搜索指定字段。
 * 搜索时统一转成小写字符串，适用于表格组件的客户端搜索模式。
 */
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

/**
 * 在前端按字段排序表格行。
 *
 * 数值字段优先按数值大小排序；无法同时转成数字时按字符串排序。
 * 未指定字段、排序方向为空或方向为 `none` 时返回原数组引用，不额外复制。
 */
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

/**
 * 按维度字段对行数据做分组聚合。
 *
 * 每个维度组合会生成一行结果，维度字段取分组首行的值，指标字段按配置执行
 * `sum`、`avg`、`min`、`max` 或 `count`。无法转成数字的指标值会被忽略。
 *
 * 当维度或聚合配置为空时，直接返回原始行数组，表示不启用聚合。
 */
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

/**
 * 计算表格汇总行数据。
 *
 * 与 `aggregateRows` 不同，这里不会分组，而是面向当前行集合生成一行汇总结果。
 * 未配置汇总方法的字段返回空字符串，便于表格底部汇总行保持列对齐。
 */
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

/**
 * 判断某个值是否命中条件样式规则。
 *
 * 数值比较类操作符会要求被比较值和规则值都能转成有限数字。
 * 等于、不等于和包含按字符串语义处理；空值判断覆盖 `undefined`、`null` 和空字符串。
 */
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

/**
 * 按页码和每页条数截取当前页数据。
 *
 * 页码和页大小都会做最小值保护，避免 0 或负数导致 slice 下标异常。
 */
export const getPaginationItems = <T>(rows: T[], page: number, pageSize: number): T[] => {
  const safePageSize = Math.max(pageSize, 1)
  const safePage = Math.max(page, 1)
  return rows.slice((safePage - 1) * safePageSize, safePage * safePageSize)
}
