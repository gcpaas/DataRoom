import type {ChartDatasetParam} from '@/dataRoom/components/type/ChartDatasetParam.ts'

const isBlankValue = (value: unknown) => value === undefined || value === null || value === ''

export const resolveDatasetParamValue = (paramConfig: ChartDatasetParam, globalVariableValue?: unknown) => {
  if (paramConfig.from === 'globalVar') {
    return isBlankValue(globalVariableValue) ? paramConfig.defaultValue : globalVariableValue
  }
  return paramConfig.defaultValue
}
