import { createTooltipAppearance, type TooltipAppearance } from '../../theme/defaults'
import { DEFAULT_NEUTRAL_COLOR } from '../../theme/defaults'
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import { getInstance as getTextInstance } from '../DrText/install'
import { getDefaultTheme } from '../../theme/registry'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { Behavior } from '../type/Behavior'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export interface DrPictorialBarChartPropsInterface {
  mountain: { width: number; opacity: number; colorByCategory: boolean }
  series: { colors: string[] }
  image: { show: boolean; url: string; width: number; height: number; gap: number }
  xAxis: { show: boolean; fontSize: number; color: string; rotate: number }
  yAxis: { show: boolean; autoMax: boolean; max: number; splitLine: boolean; color: string; lineColor: string }
  label: { show: boolean; fontSize: number; color: string; decimals: number; unit: string }
  tooltip: { show: boolean } & Partial<TooltipAppearance>
  global: { padding: [number, number, number, number] }
}
export type DrPictorialBarChartConfig = ChartConfig<DrPictorialBarChartPropsInterface>
export const getInstance = (pageType: PageType): DrPictorialBarChartConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrPictorialBarChartPropsInterface>(
    'DrPictorialBarChart',
    {
      mountain: { width: 180, opacity: 0.6, colorByCategory: true },
      series: { colors: [...theme.series.colors] },
      image: { show: true, url: '', width: 64, height: 64, gap: 8 },
      xAxis: { show: true, fontSize: 14, color: getTextInstance(pageType).props.textStyle.color, rotate: 0 },
      yAxis: { show: false, autoMax: true, max: 100, splitLine: false, color: DEFAULT_NEUTRAL_COLOR, lineColor: DEFAULT_NEUTRAL_COLOR },
      label: { show: false, fontSize: 14, color: DEFAULT_NEUTRAL_COLOR, decimals: 0, unit: '' },
      tooltip: { show: true, ...createTooltipAppearance(theme.color.primary) },
      global: { padding: [16, 16, 16, 16] },
    },
    { title: '象形图', w: 640, h: 400 },
    pageType,
  )
}
export const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '点击山峰或图片',
    method: 'click',
    paramsList: [
      { name: 'name', desc: '分类名称', type: 'string' },
      { name: 'value', desc: '数值', type: 'number' },
      { name: 'image', desc: '图片地址', type: 'string' },
    ],
  },
]
export const datasetFields: ChartDatasetField[] = [
  { name: 'nameField', desc: '分类', required: true, multiple: false },
  { name: 'valueField', desc: '数值', required: true, multiple: false },
  { name: 'imageField', desc: '图片地址', required: false, multiple: false },
]
export const mockDataset: ChartMockDataset = {
  dataset: [
    { name: '小鹿', value: 100, url: '/dataRoom/resource/image/base/小鹿.svg' },
    { name: '火箭', value: 65, url: '/dataRoom/resource/image/base/火箭.svg' },
    { name: '飞机', value: 40, url: '/dataRoom/resource/image/base/飞机.svg' },
    { name: '高铁', value: 20, url: '/dataRoom/resource/image/base/高铁.svg' },
    { name: '小汽车', value: 10, url: '/dataRoom/resource/image/base/小汽车.svg' },
  ],
  fields: [
    { name: 'nameField', bindName: 'name' },
    { name: 'valueField', bindName: 'value' },
    { name: 'imageField', bindName: 'url' },
  ],
}
