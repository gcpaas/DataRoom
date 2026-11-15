import type { EChartsOption, CustomSeriesOption } from 'echarts'
import type { Dr3DBarChartPropsInterface } from './install'
import type { BarData } from './data'
import { createRenderer, formatValue } from './renderer'
import { DEFAULT_NEUTRAL_COLOR } from '../../theme/defaults'

export function buildBarOption(props: Dr3DBarChartPropsInterface, data: BarData, selected: Record<string, boolean> = {}): EChartsOption {
  const visible = data.series.filter((series) => selected[series.name] !== false)
  const seriesList: CustomSeriesOption[] = data.series.map((series, index) => {
    const color = props.series.colors[index % props.series.colors.length] || DEFAULT_NEUTRAL_COLOR
    return {
      id: `bar-${index}`,
      name: series.name,
      type: 'custom',
      coordinateSystem: 'cartesian2d',
      dimensions: ['category', 'value'],
      encode: { x: 0, y: 1, tooltip: [1], itemName: 0 },
      data: series.values.map((value, i) => ({ name: data.categories[i], value: [i, value] })),
      renderItem: createRenderer(props, color, visible.length, Math.max(0, visible.indexOf(series))),
      itemStyle: { color },
      clip: true,
      emphasis: { itemStyle: { opacity: 1 } },
    }
  })
  const positions = {
    top: { top: 0, left: 'center', orient: 'horizontal' },
    bottom: { bottom: 0, left: 'center', orient: 'horizontal' },
    left: { top: 'center', left: 0, orient: 'vertical' },
    right: { top: 'center', right: 0, orient: 'vertical' },
  } as const
  const legendPos = positions[props.legend.position]
  return {
    grid: {
      top: props.global.padding[0],
      right: props.global.padding[1],
      bottom: props.global.padding[2],
      left: props.global.padding[3],
      containLabel: true,
    },
    xAxis: {
      show: props.xAxis.show,
      type: 'category',
      data: data.categories,
      axisLine: {
        show: props.xAxis.axisLine.show,
        lineStyle: {
          color: props.xAxis.axisLine.color,
          width: props.xAxis.axisLine.width,
        },
      },
      axisLabel: {
        show: props.xAxis.axisLabel.show,
        fontSize: props.xAxis.axisLabel.fontSize,
        color: props.xAxis.axisLabel.color,
        fontWeight: props.xAxis.axisLabel.fontWeight as 'normal' | 'bold',
        fontFamily: props.xAxis.axisLabel.fontFamily,
        rotate: props.xAxis.axisLabel.rotate,
        interval: props.xAxis.axisLabel.interval,
      },
      axisTick: {
        show: props.xAxis.axisTick.show,
        length: props.xAxis.axisTick.length,
        lineStyle: {
          color: props.xAxis.axisTick.color,
        },
      },
      splitLine: {
        show: props.xAxis.splitLine.show,
        lineStyle: {
          color: props.xAxis.splitLine.color,
          width: props.xAxis.splitLine.width,
          type: props.xAxis.splitLine.type,
        },
      },
    },
    yAxis: {
      show: props.yAxis.show,
      name: props.yAxis.name || undefined,
      min: props.yAxis.range.auto ? ({ min, max }: { min: number; max: number }) => (min < 0 ? min - Math.max(max - min, Math.abs(min), 1) * 0.15 : 0) : props.yAxis.range.min,
      max: props.yAxis.range.auto
        ? ({ min, max }: { min: number; max: number }) => (max > 0 ? max + Math.max(max - min, Math.abs(max), 1) * 0.15 : max === 0 && min === 0 ? 1 : 0)
        : props.yAxis.range.max,
      axisLine: {
        show: props.yAxis.axisLine.show,
        lineStyle: {
          color: props.yAxis.axisLine.color,
          width: props.yAxis.axisLine.width,
        },
      },
      axisLabel: {
        show: props.yAxis.axisLabel.show,
        formatter: (value: number) => formatValue(value, props.format),
        fontSize: props.yAxis.axisLabel.fontSize,
        color: props.yAxis.axisLabel.color,
        fontWeight: props.yAxis.axisLabel.fontWeight as 'normal' | 'bold',
        fontFamily: props.yAxis.axisLabel.fontFamily,
      },
      axisTick: {
        show: props.yAxis.axisTick.show,
        length: props.yAxis.axisTick.length,
        lineStyle: {
          color: props.yAxis.axisTick.color,
        },
      },
      splitLine: {
        show: props.yAxis.splitLine.show,
        lineStyle: {
          color: props.yAxis.splitLine.color,
          width: props.yAxis.splitLine.width,
          type: props.yAxis.splitLine.type,
        },
      },
    },
    legend: {
      show: props.legend.show,
      data: data.series.map((series) => series.name),
      selected,
      itemWidth: props.legend.itemWidth,
      itemHeight: props.legend.itemHeight,
      ...legendPos,
      textStyle: {
        fontSize: props.legend.textStyle.fontSize,
        color: props.legend.textStyle.color,
        fontWeight: props.legend.textStyle.fontWeight as 'normal' | 'bold',
      },
      itemGap: props.legend.itemGap,
    },
    tooltip: {
      show: props.tooltip.show,
      renderMode: 'richText',
      formatter: (params) => {
        const entries = Array.isArray(params) ? params : [params]
        const index = entries[0]?.dataIndex ?? 0
        const lines = entries.flatMap((entry) => {
          const series = data.series[entry.seriesIndex ?? 0]
          const value = series?.values[entry.dataIndex]
          return series && selected[series.name] !== false && value !== null && value !== undefined ? [series.name + '：' + formatValue(value, props.format)] : []
        })
        return [data.categories[index] ?? '', ...lines].join('\n')
      },
      trigger: props.tooltip.trigger,
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: {
        fontSize: props.tooltip.textStyle.fontSize,
        color: props.tooltip.textStyle.color,
      },
    },
    series: seriesList,
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationDurationUpdate: props.animation.duration,
    animationEasing: props.animation.easing,
    animationEasingUpdate: props.animation.easing,
  }
}
