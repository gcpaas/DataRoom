import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type {
  AggregationMethod,
  ConditionalOperator,
  TableColumnConfig,
} from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrAnalysisTablePropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
  }
  table: {
    rowKey: string
    size: 'large' | 'default' | 'small'
    border: boolean
    stripe: boolean
    fit: boolean
    showIndex: boolean
    showSelection: boolean
    emptyText: string
  }
  analysis: {
    mode: 'raw' | 'aggregate'
    dimensions: string[]
    metrics: string[]
    metricAggregations: Array<{ field: string; method: AggregationMethod }>
    percentMetrics: string[]
    percentBase: 'columnTotal' | 'visibleRows' | 'customTotal'
  }
  columns: {
    autoColumns: boolean
    columnConfig: TableColumnConfig[]
    allowResize: boolean
    allowReorder: boolean
    allowHide: boolean
    showColumnSettings: boolean
    persistState: boolean
  }
  search: {
    show: boolean
    placeholder: string
    fields: string[]
    mode: 'client' | 'datasetParams'
    debounce: number
  }
  sort: {
    enabled: boolean
    mode: 'client' | 'datasetParams'
    defaultSorts: Array<{ field: string; order: 'ascending' | 'descending' | 'none' | '' }>
    multiSort: boolean
  }
  pagination: {
    show: boolean
    mode: 'client' | 'datasetParams'
    pageSize: number
    pageSizes: number[]
    layout: 'prev, pager, next' | 'total, prev, pager, next' | 'total, sizes, prev, pager, next'
    position: 'bottomLeft' | 'bottomCenter' | 'bottomRight' | 'topRight'
  }
  summary: {
    show: boolean
    label: string
    methods: Array<{ field: string; method: AggregationMethod }>
    position: 'bottom' | 'top'
  }
  cellBars: {
    show: boolean
    fields: string[]
    alignPositiveNegative: boolean
    positiveColor: string
    negativeColor: string
    barHeight: number
  }
  conditionalFormatting: {
    enabled: boolean
    rules: Array<{
      field: string
      operator: ConditionalOperator
      value?: string | number | null
      target: 'cell' | 'row'
      textColor: string
      backgroundColor: string
    }>
    basicTrendColor: 'none' | 'increaseGreen' | 'increaseRed'
  }
  headerStyle: {
    height: number
    backgroundColor: string
    color: string
    fontSize: number
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  rowStyle: {
    height: number
    backgroundColor: string
    stripeBackgroundColor: string
    hoverBackgroundColor: string
    selectedBackgroundColor: string
  }
  cellStyle: {
    color: string
    fontSize: number
    fontWeight: 'normal' | 'bold' | 'bolder'
    padding: [number, number, number, number]
    overflow: 'ellipsis' | 'wrap' | 'clip'
    showTooltip: boolean
  }
}

export type DrAnalysisTableConfig = ChartConfig<DrAnalysisTablePropsInterface>

const getInstance = (): DrAnalysisTableConfig => {
  return createChartConfig<DrAnalysisTablePropsInterface>(
    'DrAnalysisTable',
    {
      global: {
        padding: [0, 0, 0, 0],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 6,
      },
      table: {
        rowKey: '',
        size: 'default',
        border: true,
        stripe: true,
        fit: true,
        showIndex: false,
        showSelection: false,
        emptyText: '暂无数据',
      },
      analysis: {
        mode: 'raw',
        dimensions: [],
        metrics: [],
        metricAggregations: [{ field: 'value', method: 'sum' }],
        percentMetrics: [],
        percentBase: 'columnTotal',
      },
      columns: {
        autoColumns: true,
        columnConfig: [
          { field: 'name', label: '名称', width: 160, minWidth: 100, align: 'left', fixed: '', visible: true, format: 'text' },
          { field: 'value', label: '数值', width: 140, minWidth: 100, align: 'right', fixed: '', visible: true, format: 'thousand' },
        ],
        allowResize: true,
        allowReorder: true,
        allowHide: true,
        showColumnSettings: true,
        persistState: false,
      },
      search: {
        show: true,
        placeholder: '搜索',
        fields: [],
        mode: 'client',
        debounce: 300,
      },
      sort: {
        enabled: true,
        mode: 'client',
        defaultSorts: [],
        multiSort: false,
      },
      pagination: {
        show: true,
        mode: 'client',
        pageSize: 20,
        pageSizes: [10, 20, 50, 100, 200],
        layout: 'total, sizes, prev, pager, next',
        position: 'bottomRight',
      },
      summary: {
        show: false,
        label: '合计',
        methods: [{ field: 'value', method: 'sum' }],
        position: 'bottom',
      },
      cellBars: {
        show: false,
        fields: [],
        alignPositiveNegative: false,
        positiveColor: 'var(--el-color-success-light-9)',
        negativeColor: 'var(--el-color-danger-light-9)',
        barHeight: 70,
      },
      conditionalFormatting: {
        enabled: false,
        rules: [
          {
            field: 'value',
            operator: '>=',
            value: 1000,
            target: 'cell',
            textColor: 'var(--el-color-success)',
            backgroundColor: 'transparent',
          },
        ],
        basicTrendColor: 'increaseGreen',
      },
      headerStyle: {
        height: 42,
        backgroundColor: 'var(--el-fill-color-light)',
        color: 'var(--el-text-color-primary)',
        fontSize: 14,
        fontWeight: 'bold',
      },
      rowStyle: {
        height: 40,
        backgroundColor: 'transparent',
        stripeBackgroundColor: 'var(--el-fill-color-lighter)',
        hoverBackgroundColor: 'var(--el-color-primary-light-9)',
        selectedBackgroundColor: 'var(--el-color-primary-light-9)',
      },
      cellStyle: {
        color: 'var(--el-text-color-regular)',
        fontSize: 14,
        fontWeight: 'normal',
        padding: [8, 12, 8, 12],
        overflow: 'ellipsis',
        showTooltip: true,
      },
    },
    {
      title: '分析表格',
      w: 760,
      h: 420,
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
    name: '选择变化',
    desc: '多选行变化时触发',
    method: 'selectionChange',
    paramsList: [{ name: 'rows', desc: '当前选中的行数据', type: 'object[]' }],
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
    paramsList: [{ name: 'sorts', desc: '排序配置列表', type: 'object[]' }],
  },
  {
    name: '列状态变化',
    desc: '列宽、列顺序、列显隐变化时触发',
    method: 'columnStateChange',
    paramsList: [{ name: 'columns', desc: '当前列状态列表', type: 'object[]' }],
  },
]

const datasetFields: ChartDatasetField[] = [
  { name: 'dimensionFields', desc: '维度字段列表', required: false, multiple: true },
  { name: 'metricFields', desc: '指标字段列表', required: false, multiple: true },
  { name: 'percentMetricFields', desc: '百分比指标字段列表', required: false, multiple: true },
  { name: 'displayFields', desc: '显示字段列表，未配置时使用数据集返回的全部字段', required: false, multiple: true },
  { name: 'rowKeyField', desc: '行唯一键字段', required: false, multiple: false },
  { name: 'totalField', desc: '服务端分页或自定义总数模式下的总行数字段', required: false, multiple: false },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
