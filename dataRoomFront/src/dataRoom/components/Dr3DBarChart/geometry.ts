export type BarShape = 'diamond' | 'cylinder' | 'cuboid'
type Sizing = { barWidth: number | null; barMaxWidth: number; barGap: string; barCategoryGap: string }

function spacing(value: string, reference: number): number {
  const number = Number.parseFloat(value)
  if (!Number.isFinite(number)) return 0
  return Math.max(0, value.trim().endsWith('%') ? (reference * number) / 100 : number)
}

/** 返回包括侧面在内的总宽度；空间不足时等比例收缩，避免组间重叠。 */
export function layoutBars(band: number, count: number, index: number, config: Sizing) {
  count = Math.max(1, count)
  const available = Math.max(0, band - Math.min(band * 0.95, spacing(config.barCategoryGap, band)))
  const percentGap = config.barGap.trim().endsWith('%')
  const gapRatio = percentGap ? spacing(config.barGap, 1) : 0
  const fixedGap = percentGap ? 0 : Math.min(spacing(config.barGap, 1), available / (count * 2))
  const fit = Math.max(0, (available - fixedGap * (count - 1)) / (count + gapRatio * (count - 1)))
  const width = Math.max(0, Math.min(config.barWidth ?? config.barMaxWidth, fit))
  const gap = percentGap ? width * gapRatio : fixedGap
  return { width, offset: (index - (count - 1) / 2) * (width + gap) }
}

export type Face =
  | { name: 'front' | 'side' | 'end' | 'base'; type: 'polygon'; shape: { points: number[][] } }
  | { name: 'front'; type: 'rect'; shape: { x: number; y: number; width: number; height: number } }
  | { name: 'end' | 'base'; type: 'ellipse'; shape: { cx: number; cy: number; rx: number; ry: number } }

/** 所有面共用基线/端点，负值按同一坐标系统自然向下延伸。 */
export function barGeometry(shape: BarShape, x: number, base: number, end: number, width: number, ratio: number): Face[] {
  if (base === end || width <= 0) return []
  const depth = (width * Math.max(0.05, Math.min(1, ratio))) / 2
  const left = x - width / 2
  const right = x + width / 2
  const top = Math.min(base, end)
  const height = Math.abs(base - end)
  const polygon = (name: 'front' | 'side' | 'end' | 'base', points: number[][]): Face => ({ name, type: 'polygon', shape: { points } })
  if (shape === 'cuboid') {
    const frontRight = right - depth
    const cap = (name: 'base' | 'end', y: number) =>
      polygon(name, [
        [left, y],
        [frontRight, y],
        [right, y - depth],
        [left + depth, y - depth],
      ])
    return [
      cap('base', base),
      { name: 'front', type: 'rect', shape: { x: left, y: top, width: width - depth, height } },
      polygon('side', [
        [frontRight, base],
        [right, base - depth],
        [right, end - depth],
        [frontRight, end],
      ]),
      cap('end', end),
    ]
  }
  const cap = (name: 'base' | 'end', y: number): Face =>
    shape === 'cylinder'
      ? { name, type: 'ellipse', shape: { cx: x, cy: y, rx: width / 2, ry: depth } }
      : polygon(name, [
          [left, y],
          [x, y - depth],
          [right, y],
          [x, y + depth],
        ])
  const body: Face = { name: 'front', type: 'rect', shape: { x: left, y: top, width, height } }
  // 先画远端，最后画近端；短柱及负值端面也保持正确遮挡顺序。
  return end < base ? [cap('base', base), body, cap('end', end)] : [cap('end', end), body, cap('base', base)]
}
