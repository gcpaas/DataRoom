import { toFiniteNumber } from '../_shared/metric-table-utils.ts'

export interface AlarmImageItem {
  id: string
  name: string
  url: string
  condition: string
  enabled: boolean
}

export interface ResolveAlarmImageItemOptions {
  items: AlarmImageItem[]
  defaultItemId: string
  value: unknown
  chartId?: string
}

type AlarmOperator = '>' | '>=' | '<' | '<='

const NUMBER_PATTERN = '[-+]?(?:\\d+\\.?\\d*|\\.\\d+)'
const OPERATOR_PATTERN = '(>=|<=|>|<)'
const VARIABLE_PATTERN = '[xX]'
const intervalRegExp = new RegExp(
  `^(${NUMBER_PATTERN})${OPERATOR_PATTERN}${VARIABLE_PATTERN}${OPERATOR_PATTERN}(${NUMBER_PATTERN})$`,
)
const rightSideRegExp = new RegExp(`^${VARIABLE_PATTERN}${OPERATOR_PATTERN}(${NUMBER_PATTERN})$`)
const leftSideRegExp = new RegExp(`^(${NUMBER_PATTERN})${OPERATOR_PATTERN}${VARIABLE_PATTERN}$`)

const compare = (left: number, operator: AlarmOperator, right: number): boolean => {
  switch (operator) {
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '<':
      return left < right
    case '<=':
      return left <= right
  }
}

const normalizeCondition = (condition: string): string => condition.trim().replace(/\s+/g, ' ')

const parseNumber = (value: string): number | undefined => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export const isAlarmConditionSyntax = (condition: string): boolean => {
  const compact = normalizeCondition(condition).replace(/\s/g, '')
  if (!compact) {
    return false
  }
  return intervalRegExp.test(compact) || rightSideRegExp.test(compact) || leftSideRegExp.test(compact)
}

export const matchAlarmCondition = (condition: string, value: unknown): boolean => {
  const numericValue = toFiniteNumber(value)
  if (numericValue === undefined) {
    return false
  }

  const normalized = normalizeCondition(condition)
  if (!normalized) {
    return false
  }

  const compact = normalized.replace(/\s/g, '')
  const intervalMatch = compact.match(intervalRegExp)
  if (intervalMatch) {
    const leftValue = parseNumber(intervalMatch[1]!)
    const leftOperator = intervalMatch[2] as AlarmOperator
    const rightOperator = intervalMatch[3] as AlarmOperator
    const rightValue = parseNumber(intervalMatch[4]!)
    if (leftValue === undefined || rightValue === undefined) {
      return false
    }
    return compare(leftValue, leftOperator, numericValue) && compare(numericValue, rightOperator, rightValue)
  }

  const rightSideMatch = compact.match(rightSideRegExp)
  if (rightSideMatch) {
    const operator = rightSideMatch[1] as AlarmOperator
    const rightValue = parseNumber(rightSideMatch[2]!)
    return rightValue === undefined ? false : compare(numericValue, operator, rightValue)
  }

  const leftSideMatch = compact.match(leftSideRegExp)
  if (leftSideMatch) {
    const leftValue = parseNumber(leftSideMatch[1]!)
    const operator = leftSideMatch[2] as AlarmOperator
    return leftValue === undefined ? false : compare(leftValue, operator, numericValue)
  }

  return false
}

const warnInvalidCondition = (chartId: string | undefined, condition: string) => {
  if (!condition.trim()) {
    return
  }
  const prefix = chartId ? `组件 ${chartId}` : '告警图组件'
  console.warn(`${prefix} 条件表达式无法解析: ${condition}`)
}

export const resolveAlarmImageItem = (options: ResolveAlarmImageItemOptions): AlarmImageItem | undefined => {
  const enabledItems = options.items.filter((item) => item.enabled)
  const matchedItem = enabledItems.find((item) => {
    if (!item.condition.trim()) {
      return false
    }
    const matched = matchAlarmCondition(item.condition, options.value)
    if (!matched && toFiniteNumber(options.value) !== undefined && !isAlarmConditionSyntax(item.condition)) {
      warnInvalidCondition(options.chartId, item.condition)
    }
    return matched
  })

  if (matchedItem) {
    return matchedItem
  }

  return enabledItems.find((item) => item.id === options.defaultItemId) ?? enabledItems[0]
}
