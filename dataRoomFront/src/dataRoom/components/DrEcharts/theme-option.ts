import { TOOLTIP_TEXT_COLOR, TOOLTIP_BACKGROUND_OPACITY } from '../../theme/defaults'
import { withOpacity } from '../../theme/color'
import type { DrEchartsConfig } from './install'

type ObjectValue = Record<string, unknown>
const record = (value: unknown): value is ObjectValue => value !== null && typeof value === 'object' && !Array.isArray(value)
const each = (value: unknown, apply: (item: ObjectValue, index: number) => void) => {
  if (Array.isArray(value)) value.forEach((item, index) => { if (record(item)) apply(item, index) })
  else if (record(value)) apply(value, 0)
}
const merge = (parent: ObjectValue, key: string, values: ObjectValue) => {
  parent[key] = { ...(record(parent[key]) ? parent[key] : {}), ...values }
}

/** 对求值结果应用通用 ECharts 样式；不改写用户代码、数据和 formatter。 */
export function applyCustomChartTheme(option: object, style: DrEchartsConfig['props']['themeStyle']) {
  if (!style) return option
  const result = { ...option } as ObjectValue
  result.color = [...style.colors]
  result.backgroundColor = style.background
  // 修改浅拷贝的配置项，避免用户返回的缓存 option 被污染。
  for (const key of ['title', 'legend', 'tooltip', 'xAxis', 'yAxis', 'radar', 'series']) {
    const value = result[key]
    if (Array.isArray(value)) result[key] = value.map(item => record(item) ? { ...item } : item)
    else if (record(value)) result[key] = { ...value }
  }
  each(result.tooltip, tooltip => {
    tooltip.backgroundColor = withOpacity(style.primary, TOOLTIP_BACKGROUND_OPACITY)
    tooltip.borderColor = style.primary
    merge(tooltip, 'textStyle', { color: TOOLTIP_TEXT_COLOR })
  })
  each(result.series, (series, index) => {
    const color = style.colors[index % style.colors.length] ?? style.primary
    if (['pie', 'funnel', 'treemap', 'sunburst'].includes(String(series.type))) {
      series.color = [...style.colors]
      const itemStyle = { ...(record(series.itemStyle) ? series.itemStyle : {}) }
      delete itemStyle.color
      series.itemStyle = itemStyle
    } else merge(series, 'itemStyle', { color })
    if (series.type === 'line') {
      merge(series, 'lineStyle', { color })
      if (record(series.areaStyle)) merge(series, 'areaStyle', { color })
    }
  })
  return result
}
