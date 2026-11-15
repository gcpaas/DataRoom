import type { PieSlice } from './data'
import type { Dr3DPieChartPropsInterface } from './install'
import { projectPoint, type PieProjection } from './geometry'

export function formatValue(value: number, format: Dr3DPieChartPropsInterface['format']) {
  const digits = format.decimals === null ? null : Math.max(0, Math.min(10, Math.round(format.decimals)))
  return `${format.prefix}${digits === null ? value : value.toFixed(digits)}${format.suffix}`
}
export const formatPercent = (value: number, digits: number) => `${value.toFixed(Math.max(0, Math.min(4, Math.round(digits))))}%`
export interface PieLabel {
  x: number
  y: number
  align: 'left' | 'right' | 'center'
  width: number
  points: number[][]
}

/** 两侧分别排布并避让；标签过多时优先展示较大扇区，不改变数据和占比。 */
export function layoutLabels(
  slices: PieSlice[],
  p: PieProjection,
  props: Dr3DPieChartPropsInterface,
  bounds: { left: number; right: number; top: number; bottom: number },
): Map<string, PieLabel> {
  const result = new Map<string, PieLabel>()
  if (!props.label.show || p.radius <= 0) return result
  const items = slices.filter((s) => s.percent > 0 && s.percent >= props.label.minPercent)
  if (props.label.position === 'inside') {
    for (const slice of items) {
      const angle = (slice.start + slice.end) / 2
      const [x = 0, y = 0] = projectPoint(angle, (p.radius + p.inner) / 2, p)
      result.set(slice.name, { x, y, align: 'center', width: Math.max(20, p.radius * (slice.end - slice.start) * 0.5), points: [] })
    }
    return result
  }
  const spacing = props.label.fontSize + 8
  const capacity = Math.max(0, Math.floor((bounds.bottom - bounds.top) / spacing))
  for (const right of [false, true]) {
    const labels = items
      .filter((s) => Math.cos((s.start + s.end) / 2) >= 0 === right)
      .sort((a, b) => b.percent - a.percent)
      .slice(0, capacity)
      .map((s) => {
        const angle = (s.start + s.end) / 2
        const anchor = projectPoint(angle, p.radius, p)
        const labelAnchor = projectPoint(angle, p.radius + props.label.guideLine.length, p)
        return { slice: s, anchor, y: labelAnchor[1] ?? 0 }
      })
      .sort((a, b) => a.y - b.y)
    let last = bounds.top - spacing / 2
    for (const label of labels) {
      label.y = Math.max(label.y, last + spacing)
      last = label.y
    }
    last = bounds.bottom + spacing / 2
    for (const label of [...labels].reverse()) {
      label.y = Math.min(label.y, last - spacing)
      last = label.y
    }
    const edge = p.cx + (right ? 1 : -1) * (p.radius + props.label.guideLine.length)
    const x = edge + (right ? 4 : -4)
    for (const label of labels)
      result.set(label.slice.name, {
        x,
        y: label.y,
        align: right ? 'left' : 'right',
        width: Math.max(0, right ? bounds.right - x : x - bounds.left),
        points: [label.anchor, [edge, label.y]],
      })
  }
  return result
}

export function labelText(slice: PieSlice, props: Dr3DPieChartPropsInterface) {
  const value = formatValue(slice.value, props.format)
  const percent = formatPercent(slice.percent, props.format.percentDecimals)
  switch (props.label.content) {
    case 'value':
      return value
    case 'percent':
      return percent
    case 'name+value':
      return `${slice.name} ${value}`
    case 'name+percent':
      return `${slice.name} ${percent}`
    default:
      return slice.name
  }
}
