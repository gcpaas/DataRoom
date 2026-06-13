type DatasetLike = {
  code?: string
  fields?: Record<string, string[] | undefined>
}

type ChartLike = {
  dataset?: DatasetLike
}

/**
 * 判断图表是否已经绑定数据集。
 *
 * 这里仅以 dataset.code 是否有值作为判断标准：
 * - 未绑定数据集：组件可以使用内置示例数据和默认字段名。
 * - 已绑定数据集：组件必须尊重数据集返回结果，即使返回空数组也不回退到示例数据。
 */
export const hasConfiguredDataset = (chart: ChartLike): boolean => {
  return Boolean(chart.dataset?.code?.trim())
}

/**
 * 是否应该使用组件内置示例数据。
 *
 * 示例数据只用于“未配置数据集”的设计态占位展示。只要配置了数据集，
 * 数据为空就按空数据渲染，避免真实数据场景被示例数据误覆盖。
 */
export const shouldUseDefaultChartData = (chart: ChartLike): boolean => {
  return !hasConfiguredDataset(chart)
}

/**
 * 获取图表字段绑定。
 *
 * defaultFieldName 只在未配置数据集时生效，用于配合组件内置示例数据的默认字段名。
 * 已配置数据集时，即使字段数组为空也原样返回空数组，交给图表按“字段未绑定”
 * 或“无数据系列”处理，避免误读成示例数据字段。
 */
export const getChartDatasetFieldNames = (chart: ChartLike, fieldName: string, defaultFieldName: string[] = []): string[] => {
  const fieldNames = chart.dataset?.fields?.[fieldName]
  if (hasConfiguredDataset(chart)) {
    return Array.isArray(fieldNames) ? fieldNames : []
  }
  return Array.isArray(fieldNames) && fieldNames.length > 0 ? fieldNames : defaultFieldName
}
