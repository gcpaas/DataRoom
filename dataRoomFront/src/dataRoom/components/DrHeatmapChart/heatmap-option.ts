import type { EChartsOption } from 'echarts'
import { withOpacity } from '../../theme/color'
import type { DrHeatmapChartConfig, HeatmapAxis } from './install'
import { getChartDatasetFieldNames } from '../_shared/chart-data-defaults'

type FieldBindings = Record<string, string[]>
export interface HeatmapData {
  xCategories: string[]
  yCategories: string[]
  data: [number, number, number][]
}

const category = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return undefined
}

/** 每行一个格子；保留零值，跳过缺失值，同坐标取第一行且不隐式聚合。 */
export function normalizeHeatmapData(rows: unknown, fields: FieldBindings, xOrder: string[], yOrder: string[]): HeatmapData {
  const xCategories = [...new Set(xOrder)]
  const yCategories = [...new Set(yOrder)]
  const result: HeatmapData = { xCategories, yCategories, data: [] }
  const xField = fields.xField?.[0]
  const yField = fields.yField?.[0]
  const valueField = fields.valueField?.[0]
  if (!Array.isArray(rows) || !xField || !yField || !valueField) return result
  const xMap = new Map(xCategories.map((value, index) => [value, index]))
  const yMap = new Map(yCategories.map((value, index) => [value, index]))
  const seen = new Set<string>()
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    const item = row as Record<string, unknown>
    const x = category(item[xField])
    const y = category(item[yField])
    if (x === undefined || y === undefined) continue
    if ((xOrder.length && !xMap.has(x)) || (yOrder.length && !yMap.has(y))) continue
    if (!xMap.has(x)) {
      xMap.set(x, xCategories.length)
      xCategories.push(x)
    }
    if (!yMap.has(y)) {
      yMap.set(y, yCategories.length)
      yCategories.push(y)
    }
    const xi = xMap.get(x)!
    const yi = yMap.get(y)!
    const key = `${xi}:${yi}`
    if (seen.has(key)) continue
    seen.add(key)
    const raw = item[valueField]
    if (typeof raw !== 'number' && typeof raw !== 'string') continue
    if (typeof raw === 'string' && !raw.trim()) continue
    const value = Number(raw)
    if (Number.isFinite(value)) result.data.push([xi, yi, value])
  }
  return result
}

function axisOption(axis: HeatmapAxis, categories: string[]) {
  return {
    type: 'category' as const,
    data: categories,
    show: axis.show,
    name: axis.name,
    nameTextStyle: { ...axis.nameTextStyle },
    inverse: axis.inverse,
    axisLabel: { ...axis.axisLabel },
    axisLine: { show: axis.axisLine.show, lineStyle: { color: axis.axisLine.color, width: axis.axisLine.width } },
    splitArea: { show: axis.splitArea },
  }
}

export function buildHeatmapOption(chart: DrHeatmapChartConfig, rows: unknown): EChartsOption {
  const props = chart.props
  const scale = props.series
  if (!Number.isFinite(scale.min) || !Number.isFinite(scale.max) || scale.min >= scale.max) {
    throw new Error('最小值必须小于最大值，且均为有效数值')
  }
  const fields = {
    xField: getChartDatasetFieldNames(chart, 'xField', ['hour']),
    yField: getChartDatasetFieldNames(chart, 'yField', ['day']),
    valueField: getChartDatasetFieldNames(chart, 'valueField', ['value']),
  }
  const normalized = normalizeHeatmapData(rows, fields, props.xAxis.categories, props.yAxis.categories)
  if (!Number.isInteger(scale.segments) || scale.segments < 1 || scale.segments > 100) {
    throw new Error('分段数必须是 1～100 的整数')
  }
  // 首尾区间向外延伸，范围外数据保留数值并使用首尾透明度。
  const pieces = Array.from({ length: scale.segments }, (_, index) => ({
    ...(index > 0 ? { gte: scale.min + ((scale.max - scale.min) * index) / scale.segments } : {}),
    ...(index < scale.segments - 1 ? { lt: scale.min + ((scale.max - scale.min) * (index + 1)) / scale.segments } : {}),
    color: withOpacity(scale.backgroundColor, (index + 1) / scale.segments),
  }))
  const [top, right, bottom, left] = props.global.padding
  return {
    grid: { top, right, bottom, left, containLabel: true },
    xAxis: axisOption(props.xAxis, normalized.xCategories),
    yAxis: axisOption(props.yAxis, normalized.yCategories),
    tooltip: {
      ...props.tooltip,
      trigger: 'item',
      renderMode: 'richText',
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const value = item?.value
        if (!Array.isArray(value)) return ''
        return `${normalized.xCategories[Number(value[0])]} / ${normalized.yCategories[Number(value[1])]}\n${props.series.name}: ${value[2]}`
      },
    },
    visualMap: {
      type: 'piecewise',
      show: false,
      min: scale.min,
      max: scale.max,
      dimension: 2,
      seriesIndex: 0,
      pieces,
    },
    series: [
      {
        type: 'heatmap',
        name: props.series.name,
        data: normalized.data,
        label: { ...props.series.label },
        itemStyle: { borderWidth: props.series.borderWidth, borderColor: props.series.borderColor },
        emphasis: { itemStyle: { borderWidth: props.series.borderWidth + 1 } },
      },
    ],
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
  }
}
