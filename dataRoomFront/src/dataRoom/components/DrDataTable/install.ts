import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'
import type { TableColumnConfig, ValueFormat } from '@/dataRoom/components/_shared/metric-table-utils.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrDataTablePropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
  }
  table: {
    autoColumns: boolean
    columns: TableColumnConfig[]
    rowKey: string
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
    stripeBackgroundColor: string
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
  search: {
    show: boolean
    placeholder: string
    fields: string[]
    debounce: number
  }
  sort: {
    enabled: boolean
    defaultField: string
    defaultOrder: 'ascending' | 'descending' | 'none'
  }
  pagination: {
    show: boolean
    pageSize: number
    pageSizes: number[]
    layout: 'prev, pager, next' | 'total, prev, pager, next' | 'sizes, prev, pager, next'
    position: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topRight'
  }
  formatting: {
    defaultNumberFormat: ValueFormat
    dateFormat: string
    nullText: string
  }
}

export type DrDataTableConfig = ChartConfig<DrDataTablePropsInterface>

const getInstance = (): DrDataTableConfig => {
  return createChartConfig<DrDataTablePropsInterface>(
    'DrDataTable',
    {
      global: {
        padding: [0, 0, 0, 0],
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
        borderRadius: 6,
      },
      table: {
        autoColumns: true,
        columns: [
          { field: 'name', label: '名称', width: 160, align: 'left', format: 'text', visible: true },
          { field: 'value', label: '数值', width: 120, align: 'right', format: 'thousand', visible: true },
          { field: 'status', label: '状态', width: 120, align: 'center', format: 'text', visible: true },
        ],
        rowKey: '',
        size: 'default',
        border: false,
        stripe: true,
        fit: true,
        showIndex: false,
        emptyText: '暂无数据',
      },
      headerStyle: {
        height: 42,
        backgroundColor: '#f5f7fa',
        color: '#303133',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'left',
      },
      rowStyle: {
        height: 40,
        backgroundColor: 'rgba(0, 0, 0, 0)',
        stripeBackgroundColor: '#fafafa',
        hoverBackgroundColor: '#ecf5ff',
        borderColor: '#ebeef5',
      },
      cellStyle: {
        color: '#606266',
        fontSize: 14,
        fontWeight: 'normal',
        padding: [8, 12, 8, 12],
        overflow: 'ellipsis',
        showTooltip: true,
      },
      search: {
        show: false,
        placeholder: '搜索',
        fields: [],
        debounce: 200,
      },
      sort: {
        enabled: true,
        defaultField: '',
        defaultOrder: 'none',
      },
      pagination: {
        show: true,
        pageSize: 10,
        pageSizes: [10, 20, 50, 100],
        layout: 'prev, pager, next',
        position: 'bottomRight',
      },
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
  {
    name: '分页变化',
    desc: '页码或每页行数变化时触发',
    method: 'pageChange',
    paramsList: [
      { name: 'page', desc: '当前页码', type: 'number' },
      { name: 'pageSize', desc: '每页行数', type: 'number' },
    ],
  },
  {
    name: '排序变化',
    desc: '列排序变化时触发',
    method: 'sortChange',
    paramsList: [
      { name: 'field', desc: '排序字段', type: 'string' },
      { name: 'order', desc: '排序方向', type: 'string' },
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
  {
    name: 'rowKeyField',
    desc: '行唯一键字段',
    required: false,
    multiple: false,
  },
]

const mockDataset: ChartMockDataset = {
  dataset: [
    { id: 'A001', name: '政务服务', value: 320, status: '正常' },
    { id: 'A002', name: '城市治理', value: 245, status: '正常' },
    { id: 'A003', name: '民生保障', value: 186, status: '关注' },
  ],
  fields: [
    { name: 'displayFields', bindName: 'name' },
    { name: 'displayFields', bindName: 'value' },
    { name: 'displayFields', bindName: 'status' },
    { name: 'rowKeyField', bindName: 'id' },
  ],
}

export { component, controlPanel, getInstance, behaviors, datasetFields, mockDataset }
