import { createTooltipAppearance, type TooltipAppearance } from '../../theme/defaults'
import { DEFAULT_NEUTRAL_COLOR } from '../../theme/defaults'
import { getDefaultTheme } from '../../theme/registry'
import { withOpacity } from '../../theme/color'
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '@/dataRoom/constants/PageType.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'
import type { ValueFormat } from '@/dataRoom/components/_shared/metric-table-utils.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrDataTablePropsInterface {
  tooltip?: TooltipAppearance
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
  }
  table: {
    size: 'large' | 'default' | 'small'
    border: boolean
    stripe: boolean
    fit: boolean
    showIndex: boolean
    emptyText: string
  }
  headerStyle: {
    height: number
    backgroundColor: string
    color: string
    fontSize: number
    fontWeight: 'normal' | 'bold' | 'bolder'
    textAlign: 'left' | 'center' | 'right'
  }
  rowStyle: {
    height: number
    backgroundColor: string
    oddBackgroundColor: string
    evenBackgroundColor: string
    hoverBackgroundColor: string
    borderColor: string
  }
  cellStyle: {
    color: string
    fontSize: number
    fontWeight: 'normal' | 'bold' | 'bolder'
    padding: [number, number, number, number]
    overflow: 'ellipsis' | 'wrap' | 'clip'
    showTooltip: boolean
  }
  /** 按实际数据字段覆盖列样式，不参与列生成。元素包含 field（必填字段名）、label（表头名称）、width（列宽px，省略则自适应）、headerFontSize/headerColor（表头字号/颜色）、fontSize/color（正文字号/颜色）、showTooltip（溢出提示布尔值）。可选属性省略时继承全表设置，提示仅在省略模式生效。 */
  columnStyles?: Array<{
    field: string
    label?: string
    width?: number
    headerFontSize?: number
    headerColor?: string
    fontSize?: number
    color?: string
    showTooltip?: boolean
  }>
  formatting: {
    defaultNumberFormat: ValueFormat
    dateFormat: string
    nullText: string
  }
}

export type DrDataTableConfig = ChartConfig<DrDataTablePropsInterface>

const getInstance = (pageType: PageType): DrDataTableConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrDataTablePropsInterface>(
    'DrDataTable',
    {
      tooltip: createTooltipAppearance(theme.color.primary),
      global: {
        padding: [0, 0, 0, 0],
        backgroundColor: 'transparent',
        borderColor: 'var(--el-border-color)',
        borderWidth: 0,
        borderRadius: 6,
      },
      table: {
        size: 'default',
        border: false,
        stripe: true,
        fit: true,
        showIndex: false,
        emptyText: '暂无数据',
      },
      headerStyle: {
        height: 42,
        backgroundColor: withOpacity(theme.color.primary, 0.1),
        color: DEFAULT_NEUTRAL_COLOR,
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      rowStyle: {
        height: 36,
        backgroundColor: 'transparent',
        oddBackgroundColor: 'transparent',
        evenBackgroundColor: 'transparent',
        hoverBackgroundColor: withOpacity(theme.color.primary, 0.1),
        borderColor: DEFAULT_NEUTRAL_COLOR,
      },
      cellStyle: {
        color: DEFAULT_NEUTRAL_COLOR,
        fontSize: 14,
        fontWeight: 'normal',
        padding: [8, 12, 8, 12],
        overflow: 'ellipsis',
        showTooltip: true,
      },
      columnStyles: [],
      formatting: {
        defaultNumberFormat: 'value',
        dateFormat: 'YYYY-MM-DD HH:mm:ss',
        nullText: '--',
      },
    },
    {
      title: '数据表格',
      w: 640,
      h: 360,
      x: 0,
      y: 0,
      z: 0,
    },
    pageType,
  )
}

const behaviors: Behavior[] = [
  {
    name: '行单击',
    desc: '鼠标点击表格行时触发',
    method: 'rowClick',
    paramsList: [
      { name: 'row', desc: '当前行完整数据', type: 'object' },
      { name: 'rowIndex', desc: '当前行索引', type: 'number' },
    ],
  },
  {
    name: '单元格单击',
    desc: '鼠标点击单元格时触发',
    method: 'cellClick',
    paramsList: [
      { name: 'row', desc: '当前行完整数据', type: 'object' },
      { name: 'field', desc: '当前列字段名', type: 'string' },
      { name: 'value', desc: '当前单元格值', type: 'string | number | boolean | null' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'displayFields',
    desc: '显示字段列表，未配置时使用数据集返回的全部字段',
    required: false,
    multiple: true,
  },
]

const mockDataset: ChartMockDataset = {
  dataset: [
    { 产品名称: '手机', 分类: '数码', 销售额: 328000, 环比值: '+12.5%', 同比值: '+23.8%' },
    { 产品名称: '笔记本电脑', 分类: '数码', 销售额: 256000, 环比值: '+8.2%', 同比值: '+18.6%' },
    { 产品名称: '无线耳机', 分类: '数码', 销售额: 86000, 环比值: '-3.1%', 同比值: '+15.2%' },
    { 产品名称: '空调', 分类: '家电', 销售额: 195000, 环比值: '+16.8%', 同比值: '+28.5%' },
    { 产品名称: '咖啡机', 分类: '家电', 销售额: 72000, 环比值: '+5.6%', 同比值: '-2.4%' },
    { 产品名称: '运动鞋', 分类: '服饰', 销售额: 108000, 环比值: '-1.8%', 同比值: '+9.7%' },
  ],
  fields: [
    { name: 'displayFields', bindName: '产品名称' },
    { name: 'displayFields', bindName: '分类' },
    { name: 'displayFields', bindName: '销售额' },
    { name: 'displayFields', bindName: '环比值' },
    { name: 'displayFields', bindName: '同比值' },
  ],
}

export { component, controlPanel, getInstance, behaviors, datasetFields, mockDataset }
