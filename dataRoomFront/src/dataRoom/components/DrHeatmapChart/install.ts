import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'
import type { Behavior } from '../type/Behavior'
import { DEFAULT_NEUTRAL_COLOR, TOOLTIP_TEXT_COLOR, createTooltipAppearance } from '../../theme/defaults'
import { getDefaultTheme } from '../../theme/registry'

export interface DrHeatmapChartPropsInterface {
  global: { padding: [number, number, number, number] }
  xAxis: {
    show: boolean
    name: string
    /** 坐标轴名称字体，与轴标签独立配置。 */
    nameTextStyle: { fontSize: number; color: string }
    /** 为空时按数据首次出现顺序；非空时限定轴范围及顺序。 */
    categories: string[]
    inverse: boolean
    axisLabel: { show: boolean; fontSize: number; color: string; rotate: number }
    axisLine: { show: boolean; width: number; color: string }
    splitArea: boolean
  }
  yAxis: {
    show: boolean
    name: string
    /** 坐标轴名称字体，与轴标签独立配置。 */
    nameTextStyle: { fontSize: number; color: string }
    /** 为空时按数据首次出现顺序；非空时限定轴范围及顺序。 */
    categories: string[]
    inverse: boolean
    axisLabel: { show: boolean; fontSize: number; color: string; rotate: number }
    axisLine: { show: boolean; width: number; color: string }
    splitArea: boolean
  }
  series: {
    /** 格子基础背景色，透明度按分段计算。 */
    backgroundColor: string
    /** 等宽分段数，正整数，默认 5。 */
    segments: number
    /** 固定范围下限，不随数据变化。 */
    min: number
    /** 固定范围上限，必须大于最小值。 */
    max: number
    name: string
    borderWidth: number
    borderColor: string
    label: { show: boolean; fontSize: number; color: string }
  }
  tooltip: {
    show: boolean
    backgroundColor: string
    borderColor: string
    textStyle: { color: string }
  }
  animation: { enabled: boolean; duration: number }
}

export type HeatmapAxis = DrHeatmapChartPropsInterface['xAxis']

export type DrHeatmapChartConfig = ChartConfig<DrHeatmapChartPropsInterface>
export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

const createAxis = (): HeatmapAxis => ({
  show: true,
  name: '',
  nameTextStyle: { fontSize: 12, color: DEFAULT_NEUTRAL_COLOR },
  categories: [],
  inverse: false,
  axisLabel: { show: true, fontSize: 12, color: DEFAULT_NEUTRAL_COLOR, rotate: 0 },
  axisLine: { show: false, width: 1, color: DEFAULT_NEUTRAL_COLOR },
  splitArea: false,
})

export const getInstance = (pageType: PageType): DrHeatmapChartConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrHeatmapChartPropsInterface>(
    'DrHeatmapChart',
    {
      global: { padding: [30, 20, 30, 20] },
      xAxis: createAxis(),
      yAxis: createAxis(),
      series: {
        backgroundColor: theme.color.primary,
        segments: 5,
        min: 0,
        max: 100,
        name: '热力图',
        borderWidth: 0,
        borderColor: DEFAULT_NEUTRAL_COLOR,
        label: { show: true, fontSize: 14, color: TOOLTIP_TEXT_COLOR },
      },
      tooltip: { show: true, ...createTooltipAppearance(theme.color.primary) },
      animation: { enabled: true, duration: 300 },
    },
    { title: '热力图', w: 600, h: 360 },
    pageType,
    { w: 16, h: 8 },
  )
}

export const datasetFields: ChartDatasetField[] = [
  { name: 'xField', desc: 'X 轴类目字段', required: true, multiple: false },
  { name: 'yField', desc: 'Y 轴类目字段', required: true, multiple: false },
  { name: 'valueField', desc: '格子数值字段', required: true, multiple: false },
]
export const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '点击热力图格子时触发',
    method: 'click',
    paramsList: [
      { name: 'x', desc: '横轴类目', type: 'string' },
      { name: 'y', desc: '纵轴类目', type: 'string' },
      { name: 'value', desc: '格子数值', type: 'number' },
    ],
  },
]
export const mockDataset: ChartMockDataset = {
  dataset: [
    { hour: '08:00', day: '周一', value: 0 },
    { hour: '10:00', day: '周一', value: 65 },
    { hour: '12:00', day: '周一', value: 30 },
    { hour: '14:00', day: '周一', value: 98 },
    { hour: '16:00', day: '周一', value: 45 },
    { hour: '08:00', day: '周二', value: 55 },
    { hour: '10:00', day: '周二', value: 10 },
    { hour: '12:00', day: '周二', value: 75 },
    { hour: '14:00', day: '周二', value: 25 },
    { hour: '16:00', day: '周二', value: 85 },
    { hour: '08:00', day: '周三', value: 90 },
    { hour: '10:00', day: '周三', value: 40 },
    { hour: '12:00', day: '周三', value: 18 },
    { hour: '14:00', day: '周三', value: 60 },
    { hour: '16:00', day: '周三', value: 35 },
    { hour: '08:00', day: '周四', value: 38 },
    { hour: '10:00', day: '周四', value: 80 },
    { hour: '12:00', day: '周四', value: 50 },
    { hour: '14:00', day: '周四', value: 5 },
    { hour: '16:00', day: '周四', value: 78 },
    { hour: '08:00', day: '周五', value: 70 },
    { hour: '10:00', day: '周五', value: 20 },
    { hour: '12:00', day: '周五', value: 100 },
    { hour: '14:00', day: '周五', value: 58 },
    { hour: '16:00', day: '周五', value: 15 },
  ],
  fields: [
    { name: 'xField', bindName: 'hour' },
    { name: 'yField', bindName: 'day' },
    { name: 'valueField', bindName: 'value' },
  ],
}
