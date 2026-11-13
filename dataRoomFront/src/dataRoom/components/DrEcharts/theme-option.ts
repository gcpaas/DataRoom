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
  merge(result, 'textStyle', { color: style.text })
  // 修改浅拷贝的配置项，避免用户返回的缓存 option 被污染。
  for (const key of ['title', 'legend', 'tooltip', 'xAxis', 'yAxis', 'radar', 'series']) {
    const value = result[key]
    if (Array.isArray(value)) result[key] = value.map(item => record(item) ? { ...item } : item)
    else if (record(value)) result[key] = { ...value }
  }
  each(result.title, title => {
    merge(title, 'textStyle', { color: style.text })
    merge(title, 'subtextStyle', { color: style.secondaryText })
  })
  each(result.legend, legend => merge(legend, 'textStyle', { color: style.secondaryText }))
  each(result.tooltip, tooltip => {
    tooltip.backgroundColor = style.background
    tooltip.borderColor = style.border
    merge(tooltip, 'textStyle', { color: style.text })
  })
  for (const key of ['xAxis', 'yAxis']) each(result[key], axis => {
    merge(axis, 'axisLabel', { color: style.secondaryText })
    merge(axis, 'nameTextStyle', { color: style.secondaryText })
    for (const [part, color] of [['axisLine', style.border], ['axisTick', style.grid], ['splitLine', style.grid]] as const) {
      const current = record(axis[part]) ? axis[part] as ObjectValue : {}
      axis[part] = { ...current, lineStyle: { ...(record(current.lineStyle) ? current.lineStyle : {}), color } }
    }
  })
  each(result.radar, radar => {
    merge(radar, 'axisName', { color: style.secondaryText })
    for (const part of ['axisLine', 'splitLine']) {
      const current = record(radar[part]) ? radar[part] as ObjectValue : {}
      radar[part] = { ...current, lineStyle: { ...(record(current.lineStyle) ? current.lineStyle : {}), color: style.grid } }
    }
  })
  each(result.series, (series, index) => {
    const color = style.colors[index % style.colors.length] ?? style.primary
    merge(series, 'label', { color: style.text })
    if (['pie', 'funnel', 'treemap', 'sunburst'].includes(String(series.type))) {
      series.color = [...style.colors]
      const itemStyle = { ...(record(series.itemStyle) ? series.itemStyle : {}) }
      delete itemStyle.color
      series.itemStyle = itemStyle
    } else merge(series, 'itemStyle', { color })
    if (series.type === 'line') merge(series, 'lineStyle', { color })
  })
  return result
}
