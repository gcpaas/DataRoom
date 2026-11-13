import type { EChartsOption } from 'echarts'
import type { DrPictorialBarChartPropsInterface } from './install'
import type { PictorialRow } from './data'

export interface LoadedPicture {
  url: string
  width: number
  height: number
}
export const mountainPath = 'path://M0,100 C35,100 45,85 50,0 C55,85 65,100 100,100 Z'
export function buildPictorialOption(props: DrPictorialBarChartPropsInterface, rows: PictorialRow[], pictures: (LoadedPicture | null)[], width: number): EChartsOption {
  const format = (value: number) => `${value.toFixed(Math.max(0, Math.min(10, props.label.decimals)))}${props.label.unit}`
  const topSpace = (props.image.show ? props.image.height + props.image.gap : 0) + (props.label.show ? props.label.fontSize + 12 : 0)
  // 分类边界已有半格留白；额外预留宽山峰溢出的部分。
  const extraSide = (width * Math.max(0, props.mountain.width / 100 - 1)) / (2 * Math.max(1, rows.length) + 2)
  return {
    animation: false,
    grid: {
      top: props.global.padding[0] + topSpace,
      right: props.global.padding[1] + extraSide,
      bottom: props.global.padding[2],
      left: props.global.padding[3] + extraSide,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.name),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: props.xAxis.show, fontSize: props.xAxis.fontSize, color: props.xAxis.color, rotate: props.xAxis.rotate, interval: 0 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: props.yAxis.autoMax ? undefined : props.yAxis.max,
      axisLine: { show: props.yAxis.show, lineStyle: { color: props.yAxis.lineColor } },
      axisTick: { show: false },
      axisLabel: { show: props.yAxis.show, color: props.yAxis.color, formatter: format },
      splitLine: { show: props.yAxis.splitLine, lineStyle: { color: props.yAxis.lineColor } },
    },
    tooltip: {
      show: props.tooltip.show,
      trigger: 'item',
      renderMode: 'richText',
      formatter: (params) => {
        const item = Array.isArray(params) ? params[0] : params
        const row = item ? rows[item.dataIndex] : undefined
        return row && row.value !== null ? `${row.name}: ${format(row.value)}` : ''
      },
    },
    series: [
      {
        type: 'pictorialBar',
        symbol: mountainPath,
        symbolClip: false,
        barWidth: `${props.mountain.width}%`,
        z: 1,
        data: rows.map((row, index) => ({
          name: row.name,
          value: row.value ?? '-',
          itemStyle: { color: props.series.colors[(props.mountain.colorByCategory ? index : 0) % props.series.colors.length], opacity: props.mountain.opacity },
        })),
        label: {
          show: props.label.show,
          position: 'top',
          distance: (props.image.show ? props.image.height + props.image.gap : 0) + 8,
          fontSize: props.label.fontSize,
          color: props.label.color,
          formatter: (params) => {
            const row = rows[params.dataIndex]
            return row?.value !== null && row?.value !== undefined ? format(row.value) : ''
          },
        },
      },
      {
        type: 'scatter',
        z: 3,
        clip: false,
        data: rows.map((row, index) => {
          const picture = props.image.show ? pictures[index] : null
          const scale = picture ? Math.min(props.image.width / picture.width, props.image.height / picture.height) : 0
          const size: [number, number] = picture ? [picture.width * scale, picture.height * scale] : [0, 0]
          return {
            name: row.name,
            value: [index, row.value ?? '-'],
            symbol: picture ? `image://${picture.url}` : 'none',
            symbolSize: size,
            symbolOffset: [0, -size[1] / 2 - props.image.gap],
          }
        }),
      },
    ],
  }
}
