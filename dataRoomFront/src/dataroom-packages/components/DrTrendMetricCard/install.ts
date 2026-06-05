import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrTrendMetricCardPropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
  }
  layout: {
    trendPosition: 'bottom' | 'right'
    horizontalAlign: 'left' | 'center' | 'right'
    gap: number
    trendHeight: number
    trendWidth: number
  }
  title: {
    show: boolean
    text: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  value: {
    defaultValue: number
    format: 'value' | 'integer' | 'float1' | 'float2' | 'percent' | 'thousand' | 'currency'
    decimalPlaces: number
    prefix: string
    suffix: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  timestamp: {
    show: boolean
    format: string
    prefix: string
    fontSize: number
    color: string
  }
  compare: {
    show: boolean
    mode: 'value' | 'rate' | 'both'
    positiveColor: string
    negativeColor: string
    neutralColor: string
    fontSize: number
  }
  trend: {
    show: boolean
    chartType: 'line' | 'area'
    smooth: boolean
    lineWidth: number
    lineColor: string
    areaColor: string
    areaOpacity: number
    showSymbol: boolean
    symbolSize: number
    startYAxisAtZero: boolean
  }
  axis: {
    showXAxis: boolean
    showYAxis: boolean
    showMinMaxLabel: boolean
    labelColor: string
    labelFontSize: number
  }
  tooltip: {
    show: boolean
    formatter: string
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

export type DrTrendMetricCardConfig = ChartConfig<DrTrendMetricCardPropsInterface>

const getInstance = (): DrTrendMetricCardConfig => {
  return createChartConfig<DrTrendMetricCardPropsInterface>(
    'DrTrendMetricCard',
    {
      global: {
        padding: [16, 18, 14, 18],
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0)',
        borderWidth: 0,
        borderRadius: 8,
      },
      layout: {
        trendPosition: 'bottom',
        horizontalAlign: 'left',
        gap: 10,
        trendHeight: 64,
        trendWidth: 140,
      },
      title: {
        show: true,
        text: '趋势指标',
        fontSize: 14,
        color: '#909399',
        fontWeight: 'normal',
      },
      value: {
        defaultValue: 9860,
        format: 'thousand',
        decimalPlaces: 0,
        prefix: '',
        suffix: '',
        fontSize: 34,
        color: '#303133',
        fontWeight: 'bold',
      },
      timestamp: {
        show: false,
        format: 'YYYY-MM-DD HH:mm',
        prefix: '更新时间 ',
        fontSize: 12,
        color: '#909399',
      },
      compare: {
        show: true,
        mode: 'rate',
        positiveColor: '#67c23a',
        negativeColor: '#f56c6c',
        neutralColor: '#909399',
        fontSize: 12,
      },
      trend: {
        show: true,
        chartType: 'line',
        smooth: true,
        lineWidth: 2,
        lineColor: '#409eff',
        areaColor: '#ecf5ff',
        areaOpacity: 0.35,
        showSymbol: false,
        symbolSize: 4,
        startYAxisAtZero: false,
      },
      axis: {
        showXAxis: false,
        showYAxis: false,
        showMinMaxLabel: false,
        labelColor: '#909399',
        labelFontSize: 10,
      },
      tooltip: {
        show: true,
        formatter: '{time}<br/>{value}',
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut',
      },
    },
    {
      title: '趋势指标卡',
      w: 360,
      h: 180,
      x: 0,
      y: 0,
      z: 0,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '趋势指标单击',
    desc: '鼠标点击趋势指标卡时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '当前最新指标值', type: 'number' },
      { name: 'changeValue', desc: '最新值相对上一项的变化值', type: 'number' },
      { name: 'changeRate', desc: '最新值相对上一项的变化率', type: 'number' },
    ],
  },
  {
    name: '趋势点单击',
    desc: '鼠标点击趋势线数据点时触发',
    method: 'pointClick',
    paramsList: [
      { name: 'time', desc: '点击点的时间或类目', type: 'string' },
      { name: 'value', desc: '点击点的数值', type: 'number' },
      { name: 'index', desc: '点击点索引', type: 'number' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'timeField',
    desc: '时间或类目字段',
    required: true,
    multiple: false,
  },
  {
    name: 'valueField',
    desc: '趋势数值字段',
    required: true,
    multiple: false,
  },
  {
    name: 'titleField',
    desc: '标题字段',
    required: false,
    multiple: false,
  },
  {
    name: 'unitField',
    desc: '单位字段',
    required: false,
    multiple: false,
  },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
