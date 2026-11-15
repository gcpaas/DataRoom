import { color } from 'echarts'
import type { EChartsOption, CustomSeriesOption, CustomSeriesRenderItemReturn } from 'echarts'
import type { Dr3DPieChartPropsInterface } from './install'
import { sliceData, type PieDatum } from './data'
import { sectorFaces, type PieProjection } from './geometry'
import { layoutLabels, labelText, formatValue, formatPercent } from './labels'
import { DEFAULT_NEUTRAL_COLOR } from '../../theme/defaults'

type ElementOption = NonNullable<CustomSeriesRenderItemReturn>

export function buildPieOption(props: Dr3DPieChartPropsInterface, data: PieDatum[], width: number, height: number, selected: Record<string, boolean> = {}): EChartsOption {
  const [top, right, bottom, left] = props.global.padding
  const bounds = { left, right: width - right, top, bottom: height - bottom }
  if (props.legend.show) {
    if (props.legend.position === 'left') bounds.left += 110
    else if (props.legend.position === 'right') bounds.right -= 110
    else if (props.legend.position === 'top') bounds.top += props.legend.textStyle.fontSize + 22
    else bounds.bottom -= props.legend.textStyle.fontSize + 22
  }
  const availableWidth = Math.max(0, bounds.right - bounds.left)
  const availableHeight = Math.max(0, bounds.bottom - bounds.top)
  const labelSpace = props.label.show && props.label.position === 'outside' ? Math.min(110, availableWidth * 0.24) : 4
  const squash = Math.sin((Math.max(10, Math.min(85, props.pie.elevation)) * Math.PI) / 180)
  const depth = Math.min(Math.max(0, props.pie.depth), availableHeight * 0.4)
  const radius = (Math.max(0, Math.min((availableWidth - labelSpace * 2) / 2, (availableHeight - depth) / (2 * squash))) * Math.max(10, Math.min(100, props.pie.size))) / 100
  const projection: PieProjection = {
    cx: (bounds.left + bounds.right) / 2,
    cy: (bounds.top + bounds.bottom - depth) / 2,
    radius,
    inner: props.pie.shape === 'ring' ? (radius * Math.max(10, Math.min(85, props.pie.innerRadius))) / 100 : 0,
    squash,
    depth,
  }
  const slices = sliceData(data, selected, props.pie.rotation - 90, props.pie.gap)
  const labels = layoutLabels(slices, projection, props, bounds)
  const series: CustomSeriesOption[] = slices.map((slice, index) => {
    const base = props.series.colors[index % props.series.colors.length] || DEFAULT_NEUTRAL_COLOR
    return {
      id: `slice-${slice.name}`,
      name: slice.name,
      type: 'custom',
      coordinateSystem: 'none',
      data: [{ name: slice.name, value: slice.value }],
      itemStyle: { color: base },
      renderItem: () => {
        if (slice.percent <= 0 || radius <= 0) return
        const children: ElementOption[] = sectorFaces(slice.start, slice.end, projection, props.pie.gap > 0).map((face, i) => {
          const fill = face.kind === 'top' ? base : color.lift(base, -Math.max(0, Math.min(0.8, props.pie.sideDarkness)))
          return {
            type: 'polygon',
            name: `${face.kind}-${i}`,
            z2: face.order,
            shape: { points: face.points },
            style: { fill, opacity: 1 },
            emphasis: { style: { fill: color.lift(fill, 0.18) } },
            enterFrom: { shape: { points: face.points }, style: { opacity: 0 } },
            transition: ['shape'],
          }
        })
        const label = labels.get(slice.name)
        if (label && label.width > 0) {
          if (props.label.guideLine.show && label.points.length)
            children.push({
              type: 'line',
              name: 'guide',
              silent: true,
              z2: 2000,
              shape: { x1: label.points[0]?.[0], y1: label.points[0]?.[1], x2: label.points[1]?.[0], y2: label.points[1]?.[1] },
              style: { stroke: props.label.guideLine.color, lineWidth: props.label.guideLine.width },
            })
          children.push({
            type: 'text',
            name: 'label',
            silent: true,
            z2: 2001,
            style: {
              x: label.x,
              y: label.y,
              text: labelText(slice, props),
              align: label.align,
              verticalAlign: 'middle',
              fill: props.label.color,
              fontSize: props.label.fontSize,
              fontWeight: props.label.fontWeight,
              width: label.width,
              overflow: 'truncate',
            },
          })
        }
        return { type: 'group', $mergeChildren: 'byName', children, focus: 'series' }
      },
    }
  })
  const positions = {
    top: { top: 0, left: 'center', orient: 'horizontal' },
    bottom: { bottom: 0, left: 'center', orient: 'horizontal' },
    left: { top: 'center', left: 0, orient: 'vertical' },
    right: { top: 'center', right: 0, orient: 'vertical' },
  } as const
  return {
    legend: {
      show: props.legend.show,
      type: 'scroll',
      ...positions[props.legend.position],
      data: data.map((item) => item.name),
      selected,
      itemGap: props.legend.itemGap,
      textStyle: { ...props.legend.textStyle, width: 90, overflow: 'truncate' },
    },
    tooltip: {
      show: props.tooltip.show,
      trigger: 'item',
      renderMode: 'richText',
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: props.tooltip.textStyle,
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const slice = slices.find((slice) => slice.name === item?.seriesName)
        if (!slice) return ''
        return `${slice.name}：${formatValue(slice.value, props.format)}${props.tooltip.showPercent ? `（${formatPercent(slice.percent, props.format.percentDecimals)}）` : ''}`
      },
    },
    series,
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationDurationUpdate: props.animation.duration,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
  }
}
