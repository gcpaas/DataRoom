import { color, graphic } from 'echarts'
import type { CustomSeriesRenderItem, CustomSeriesRenderItemReturn } from 'echarts'
import type { Dr3DBarChartPropsInterface } from './install'
import { barGeometry, layoutBars } from './geometry'
import { withOpacity } from '../../theme/color'

export function formatValue(value: number, format: Dr3DBarChartPropsInterface['format']): string {
  const decimals = format.decimals === null ? null : Math.max(0, Math.min(10, Math.round(format.decimals)))
  return `${format.prefix}${decimals === null ? String(value) : value.toFixed(decimals)}${format.suffix}`
}

export function createRenderer(props: Dr3DBarChartPropsInterface, baseColor: string, count: number, index: number): CustomSeriesRenderItem {
  return (params, api) => {
    const raw = api.value(1)
    if (raw === null || raw === undefined || raw === '' || !Number.isFinite(Number(raw))) return
    const value = Number(raw)
    const category = Number(api.value(0))
    const coord = params.coordSys as unknown as { x: number; y: number; width: number; height: number }
    const zero = api.coord([category, 0])
    const point = api.coord([category, value])
    const size = api.size?.([1, 0]) as number[] | undefined
    const { width, offset } = layoutBars(Math.abs(size?.[0] ?? 0), count, index, props.series)
    const x = (point[0] ?? 0) + offset
    const rawEnd = point[1] ?? 0
    const rawBase = zero[1] ?? 0
    const clampY = (y: number) => Math.max(coord.y, Math.min(coord.y + coord.height, y))
    const base = clampY(rawBase)
    const end = clampY(rawEnd)
    if (x + width / 2 < coord.x || x - width / 2 > coord.x + coord.width) return
    const series = props.series
    const caps = series.caps
    const gradient = series.gradient
    const startColor = gradient.autoColor ? baseColor : gradient.startColor || baseColor
    const endColor = gradient.autoColor ? baseColor : gradient.endColor || baseColor
    const fill = gradient.enabled
      ? new graphic.LinearGradient(0, 0, gradient.direction === 'horizontal' ? 1 : 0, gradient.direction === 'vertical' ? 1 : 0, [
          { offset: 0, color: withOpacity(startColor, gradient.startOpacity ?? 1) },
          { offset: 1, color: withOpacity(endColor, gradient.endOpacity ?? 0.3) },
        ])
      : baseColor
    const fills = {
      front: fill,
      side: caps.autoColor ? color.lift(baseColor, -0.25) : caps.sideColor || baseColor,
      end: caps.autoColor ? color.lift(baseColor, 0.25) : caps.topColor || baseColor,
      base: caps.autoColor ? baseColor : caps.bottomColor || baseColor,
    }
    // 用同一个 group 绑定业务数据，避免端面产生额外 tooltip/图例项。
    const children: CustomSeriesRenderItemReturn[] = barGeometry(series.shape, x, base, end, width, series.depth)
      .filter((face) => face.name !== 'end' || (caps.topShow && rawEnd === end))
      .filter((face) => face.name !== 'base' || (caps.bottomShow && rawBase === base))
      .map((face) => {
        return {
          ...face,
          transition: ['shape'],
          enterFrom: { style: { opacity: 0 } },
          style: { fill: fills[face.name], opacity: series.opacity * (face.name === 'front' || face.name === 'side' ? 1 : caps.opacity) },
          emphasis: { style: { opacity: 1 } },
        } as CustomSeriesRenderItemReturn
      })
    if (series.label.show && rawEnd === end) {
      const outside = series.label.position === 'outside'
      const depth = (width * series.depth) / 2
      const direction = value < 0 ? 1 : -1
      const y = outside ? end + direction * (depth + series.label.distance) : (base + end) / 2
      children.push({
        type: 'text',
        name: 'value-label',
        silent: true,
        style: {
          text: formatValue(value, props.format),
          x,
          y,
          align: 'center',
          verticalAlign: outside ? (value < 0 ? 'top' : 'bottom') : 'middle',
          fill: series.label.color,
          fontSize: series.label.fontSize,
          fontWeight: series.label.fontWeight === 'normal' || series.label.fontWeight === 'bold' ? series.label.fontWeight : Number(series.label.fontWeight),
        },
      })
    }
    return { type: 'group', $mergeChildren: 'byName', children: children as NonNullable<Extract<CustomSeriesRenderItemReturn, { type: 'group' }>['children']> }
  }
}
