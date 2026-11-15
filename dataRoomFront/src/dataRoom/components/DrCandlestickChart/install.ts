import { createCandlestickProps } from './defaults'
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'
import type { Behavior } from '../type/Behavior'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export interface DrCandlestickChartPropsInterface {
  series: { upColor: string; downColor: string; upHollow: boolean; downHollow: boolean; barMaxWidth: number }
  xAxis: { show: boolean; labelShow: boolean; fontSize: number; color: string }
  yAxis: { show: boolean; labelShow: boolean; fontSize: number; color: string; splitLineShow: boolean; splitLineWidth: number; splitLineColor: string; splitLineType: 'solid' | 'dashed' | 'dotted' }
  tooltip: { show: boolean; backgroundColor: string; borderColor: string; textStyle: { fontSize: number; color: string } }
}
export type DrCandlestickChartConfig = ChartConfig<DrCandlestickChartPropsInterface>
export const getInstance = (pageType: PageType): DrCandlestickChartConfig => createChartConfig(
  'DrCandlestickChart',
  createCandlestickProps(pageType),
  { title: 'K线图', w: 500, h: 320 },
  pageType,
)
export const behaviors: Behavior[] = []
export const datasetFields: ChartDatasetField[] = [
  { name: 'time', desc: '时间', required: true, multiple: false },
  { name: 'open', desc: '开盘价', required: true, multiple: false },
  { name: 'close', desc: '收盘价', required: true, multiple: false },
  { name: 'low', desc: '最低价', required: true, multiple: false },
  { name: 'high', desc: '最高价', required: true, multiple: false },
]
export const mockDataset: ChartMockDataset = {
  dataset: [
    { time: '2026-11-09', open: 100, close: 108, low: 98, high: 110 },
    { time: '2026-11-10', open: 108, close: 103, low: 101, high: 112 },
    { time: '2026-11-11', open: 103, close: 110, low: 102, high: 113 },
    { time: '2026-11-12', open: 110, close: 106, low: 104, high: 111 },
    { time: '2026-11-13', open: 106, close: 114, low: 105, high: 116 },
  ],
  fields: datasetFields.map(({ name }) => ({ name, bindName: name })),
}
