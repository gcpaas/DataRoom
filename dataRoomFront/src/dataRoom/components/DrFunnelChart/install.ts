import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import { getDefaultTheme } from '../../theme/registry'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { Behavior } from '../type/Behavior'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrFunnelChartPropsInterface {
  funnel: { sort: 'descending' | 'ascending' | 'none'; gap: number }
  label: { show: boolean; content: 'name' | 'value' | 'name+value'; position: 'inside' | 'outside' }
  series: { colors: string[] }
}
export type DrFunnelChartConfig = ChartConfig<DrFunnelChartPropsInterface>

export const getInstance = (pageType: PageType): DrFunnelChartConfig =>
  createChartConfig<DrFunnelChartPropsInterface>(
    'DrFunnelChart',
    {
      funnel: { sort: 'descending', gap: 2 },
      label: { show: true, content: 'name+value', position: 'inside' },
      series: { colors: [...getDefaultTheme(pageType).series.colors] },
    },
    { title: '漏斗图', w: 400, h: 320 },
    pageType,
  )

export const behaviors: Behavior[] = [{
  name: '阶段单击', desc: '鼠标点击漏斗阶段时触发', method: 'click',
  paramsList: [
    { name: 'name', desc: '阶段名称', type: 'string' },
    { name: 'value', desc: '阶段数值', type: 'number' },
  ],
}]
export const datasetFields: ChartDatasetField[] = [
  { name: 'nameField', desc: '阶段名称', required: true, multiple: false },
  { name: 'valueField', desc: '数值', required: true, multiple: false },
]
export const mockDataset: ChartMockDataset = {
  dataset: [
    { name: '访问', value: 1000 },
    { name: '注册', value: 700 },
    { name: '下单', value: 400 },
    { name: '支付', value: 200 },
  ],
  fields: [
    { name: 'nameField', bindName: 'name' },
    { name: 'valueField', bindName: 'value' },
  ],
}
