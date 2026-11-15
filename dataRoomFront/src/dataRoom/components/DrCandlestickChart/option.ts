import type { EChartsOption } from 'echarts'
import type { DrCandlestickChartPropsInterface } from './install'

export type CandleFields = Record<'time' | 'open' | 'close' | 'low' | 'high', string>
type CandleData = { categories: string[]; values: [number, number, number, number][] }
const price = (value: unknown): number =>
  (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')) ? Number(value) : NaN

/** 保留 OHLC 的真实数值；缺失或非法价格不补零。 */
export function buildCandlestickData(input: unknown, fields: CandleFields): CandleData {
  const result: CandleData = { categories: [], values: [] }
  if (!Array.isArray(input) || Object.values(fields).some(field => !field)) return result
  const rows: { time: string; order: number; values: [number, number, number, number] }[] = []
  for (const row of input) {
    if (!row || typeof row !== 'object') continue
    const record = row as Record<string, unknown>
    const time = record[fields.time]
    if ((typeof time !== 'string' && typeof time !== 'number') || String(time).trim() === '') continue
    const open = price(record[fields.open])
    const close = price(record[fields.close])
    const low = price(record[fields.low])
    const high = price(record[fields.high])
    if (![open, close, low, high].every(Number.isFinite) || low > Math.min(open, close) || high < Math.max(open, close)) continue
    rows.push({ time: String(time), order: typeof time === 'number' ? time : Date.parse(time), values: [open, close, low, high] })
  }
  rows.sort((a, b) => Number.isFinite(a.order) && Number.isFinite(b.order) ? a.order - b.order : a.time.localeCompare(b.time, undefined, { numeric: true }))
  result.categories = rows.map(row => row.time)
  result.values = rows.map(row => row.values)
  return result
}

export interface CandlePalette { border: string; hollow: string }
export function buildCandlestickOption(props: DrCandlestickChartPropsInterface, data: CandleData, palette: CandlePalette): EChartsOption {
  return {
    grid: { top: 24, left: 16, right: 16, bottom: 20, containLabel: true },
    xAxis: { type: 'category', data: data.categories, show: props.xAxis.show,
      axisLabel: { show: props.xAxis.labelShow, fontSize: props.xAxis.fontSize, color: props.xAxis.color }, axisLine: { show: true, lineStyle: { color: palette.border } } },
    yAxis: { type: 'value', scale: true, show: props.yAxis.show,
      axisLabel: { show: props.yAxis.labelShow, fontSize: props.yAxis.fontSize, color: props.yAxis.color }, axisLine: { show: true, lineStyle: { color: palette.border } },
      splitLine: { show: props.yAxis.splitLineShow, lineStyle: { width: props.yAxis.splitLineWidth, color: props.yAxis.splitLineColor, type: props.yAxis.splitLineType } } },
    tooltip: {
      show: props.tooltip.show, trigger: 'axis', renderMode: 'richText', confine: true,
      backgroundColor: props.tooltip.backgroundColor, borderColor: props.tooltip.borderColor, textStyle: { ...props.tooltip.textStyle },
      formatter: params => {
        const point = Array.isArray(params) ? params[0] : params
        const index = point?.dataIndex
        const values = index === undefined ? undefined : data.values[index]
        if (!values || index === undefined) return ''
        return `${data.categories[index]}\n开盘：${values[0]}\n收盘：${values[1]}\n最低：${values[2]}\n最高：${values[3]}`
      },
    },
    dataZoom: [],
    series: [{ name: 'K线', type: 'candlestick', data: data.values, barMaxWidth: props.series.barMaxWidth,
      itemStyle: { color: props.series.upHollow ? palette.hollow : props.series.upColor, color0: props.series.downHollow ? palette.hollow : props.series.downColor,
        borderColor: props.series.upColor, borderColor0: props.series.downColor } }],
  }
}
