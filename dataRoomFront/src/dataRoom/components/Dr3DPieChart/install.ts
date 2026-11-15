import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '../../constants/PageType'
import type { ChartConfig } from '../type/ChartConfig'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'
import type { Behavior } from '../type/Behavior'
import { getDefaultTheme } from '../../theme/registry'
import { DEFAULT_NEUTRAL_COLOR, TOOLTIP_TEXT_COLOR, TOOLTIP_BACKGROUND_OPACITY } from '../../theme/defaults'
import { withOpacity } from '../../theme/color'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export interface Dr3DPieChartPropsInterface {
  global: { padding: [number, number, number, number] }
  pie: {
    shape: 'pie' | 'ring'
    innerRadius: number
    size: number
    depth: number
    elevation: number
    rotation: number
    gap: number
    sideDarkness: number
  }
  series: { colors: string[] }
  label: {
    show: boolean
    position: 'inside' | 'outside'
    content: 'name' | 'value' | 'percent' | 'name+value' | 'name+percent'
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold'
    minPercent: number
    guideLine: { show: boolean; length: number; width: number; color: string }
  }
  legend: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    itemGap: number
    textStyle: { fontSize: number; color: string; fontWeight: 'normal' | 'bold' }
  }
  tooltip: {
    show: boolean
    showPercent: boolean
    backgroundColor: string
    borderColor: string
    textStyle: { fontSize: number; color: string }
  }
  format: { decimals: number | null; percentDecimals: number; prefix: string; suffix: string }
  animation: { enabled: boolean; duration: number }
}
export type Dr3DPieChartConfig = ChartConfig<Dr3DPieChartPropsInterface>
export function getInstance(pageType: PageType): Dr3DPieChartConfig {
  const theme = getDefaultTheme(pageType)
  return createChartConfig(
    'Dr3DPieChart',
    {
      global: { padding: [20, 20, 20, 20] },
      pie: { shape: 'pie', innerRadius: 55, size: 90, depth: 24, elevation: 35, rotation: 0, gap: 2, sideDarkness: 0.3 },
      series: { colors: [...theme.series.colors] },
      label: {
        show: true,
        position: 'outside',
        content: 'name+percent',
        fontSize: 12,
        color: DEFAULT_NEUTRAL_COLOR,
        fontWeight: 'normal',
        minPercent: 2,
        guideLine: { show: true, length: 14, width: 1, color: DEFAULT_NEUTRAL_COLOR },
      },
      legend: { show: true, position: 'bottom', itemGap: 16, textStyle: { fontSize: 12, color: DEFAULT_NEUTRAL_COLOR, fontWeight: 'normal' } },
      tooltip: {
        show: true,
        showPercent: true,
        backgroundColor: withOpacity(theme.color.primary, TOOLTIP_BACKGROUND_OPACITY),
        borderColor: theme.color.primary,
        textStyle: { fontSize: 12, color: TOOLTIP_TEXT_COLOR },
      },
      format: { decimals: null, percentDecimals: 1, prefix: '', suffix: '' },
      animation: { enabled: true, duration: 600 },
    } satisfies Dr3DPieChartPropsInterface,
    { title: '3D 饼图', w: 500, h: 340 },
    pageType,
  )
}
export const datasetFields: ChartDatasetField[] = [
  { name: 'nameField', desc: '分类名称', required: true, multiple: false },
  { name: 'valueField', desc: '数值', required: true, multiple: false },
]
export const behaviors: Behavior[] = [
  {
    name: '扇区单击',
    desc: '点击扇区顶面或侧面',
    method: 'click',
    paramsList: [
      { name: 'name', desc: '分类名称', type: 'string' },
      { name: 'value', desc: '分类数值', type: 'number' },
      { name: 'percent', desc: '可见分类中的占比（%）', type: 'number' },
    ],
  },
  {
    name: '图例点击',
    desc: '切换分类显示状态',
    method: 'legendClick',
    paramsList: [
      { name: 'name', desc: '分类名称', type: 'string' },
      { name: 'selected', desc: '是否显示', type: 'boolean' },
    ],
  },
]
export const mockDataset: ChartMockDataset = {
  dataset: [
    { name: '政务服务', value: 320 },
    { name: '城市管理', value: 260 },
    { name: '公共安全', value: 210 },
    { name: '交通出行', value: 160 },
    { name: '民生保障', value: 120 },
  ],
  fields: [
    { name: 'nameField', bindName: 'name' },
    { name: 'valueField', bindName: 'value' },
  ],
}
