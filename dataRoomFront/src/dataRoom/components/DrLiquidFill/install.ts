import { getDefaultTheme } from '../../theme/registry'
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { Behavior } from '../type/Behavior'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'

export interface DrLiquidFillPropsInterface {
  liquid: {
    shape: 'circle' | 'pin' | 'roundRect' | 'diamond'
    min: number
    max: number
    radius: number
    color: string
    backgroundColor: string
    waveCount: number
    amplitude: number
    animated: boolean
  }
  outline: { show: boolean; width: number; gap: number; color: string }
  detail: { show: boolean; fontSize: number; color: string; format: 'percent' | 'value'; decimals: number; suffix: string }
  title: { show: boolean; text: string; fontSize: number; color: string; gap: number }
}
export type DrLiquidFillConfig = ChartConfig<DrLiquidFillPropsInterface>
export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export const getInstance = (pageType: PageType): DrLiquidFillConfig =>
  createChartConfig(
    'DrLiquidFill',
    {
      liquid: {
        shape: 'circle',
        min: 0,
        max: 100,
        radius: 80,
        color: getDefaultTheme(pageType).color.primary,
        backgroundColor: 'transparent',
        waveCount: 2,
        amplitude: 6,
        animated: true,
      },
      outline: { show: true, width: 2, gap: 5, color: getDefaultTheme(pageType).color.primary },
      detail: { show: true, fontSize: 32, color: '#FFFFFF', format: 'percent', decimals: 0, suffix: '' },
      title: { show: true, text: '', fontSize: 14, color: '#FFFFFF', gap: 8 },
    } as DrLiquidFillPropsInterface,
    { title: '水球图', w: 300, h: 300 },
    pageType,
  )
export const behaviors: Behavior[] = [
  {
    name: '水球单击',
    desc: '点击水球时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '原始数值', type: 'number' },
      { name: 'percent', desc: '水位百分比', type: 'number' },
    ],
  },
]
export const datasetFields: ChartDatasetField[] = [
  { name: 'valueField', desc: '数值字段（取第一行）', required: true, multiple: false },
  { name: 'titleField', desc: '标题字段（可选）', required: false, multiple: false },
]
export const mockDataset: ChartMockDataset = {
  dataset: [{ value: 75, title: '完成率' }],
  fields: [
    { name: 'valueField', bindName: 'value' },
    { name: 'titleField', bindName: 'title' },
  ],
}
