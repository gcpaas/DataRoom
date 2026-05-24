import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from '@/dataroom-packages/components/type/ChartConfig.ts'
import type {Behavior} from '@/dataroom-packages/components/type/Behavior.ts'
import type {ChartDatasetField} from '@/dataroom-packages/components/type/ChartDatasetField.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrPeriodCompareCardPropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
  }
  dataMode: {
    mode: 'fields' | 'series' | 'autoFallback'
    lag: number
    sortByTime: 'asc' | 'desc' | 'none'
    zeroPolicy: 'empty' | 'zero' | 'infinite'
  }
  title: {
    show: boolean
    text: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  current: {
    label: string
    defaultValue: number
    format: 'value' | 'integer' | 'float1' | 'float2' | 'percent' | 'thousand' | 'currency'
    prefix: string
    suffix: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  comparison: {
    label: string
    showPreviousValue: boolean
    showChangeValue: boolean
    showChangeRate: boolean
    rateFormat: 'percent0' | 'percent1' | 'percent2'
    changeValuePrefix: string
    changeValueSuffix: string
  }
  indicator: {
    show: boolean
    type: 'arrow' | 'triangle' | 'text' | 'none'
    positiveDirection: 'increaseGood' | 'decreaseGood' | 'neutral'
    positiveColor: string
    negativeColor: string
    neutralColor: string
    iconSize: number
  }
  layout: {
    mode: 'compact' | 'horizontal' | 'vertical'
    horizontalAlign: 'left' | 'center' | 'right'
    gap: number
    labelWidth: number
  }
  textStyle: {
    labelFontSize: number
    labelColor: string
    compareFontSize: number
    compareFontWeight: 'normal' | 'bold' | 'bolder'
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

export type DrPeriodCompareCardConfig = ChartConfig<DrPeriodCompareCardPropsInterface>

const getInstance = (): DrPeriodCompareCardConfig => {
  return createChartConfig<DrPeriodCompareCardPropsInterface>(
    'DrPeriodCompareCard',
    {
      global: {
        padding: [16, 18, 16, 18],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
      },
      dataMode: {
        mode: 'autoFallback',
        lag: 1,
        sortByTime: 'asc',
        zeroPolicy: 'empty',
      },
      title: {
        show: true,
        text: '周期对比',
        fontSize: 14,
        color: 'var(--el-text-color-secondary)',
        fontWeight: 'normal',
      },
      current: {
        label: '当前',
        defaultValue: 1280,
        format: 'thousand',
        prefix: '',
        suffix: '',
        fontSize: 34,
        color: 'var(--el-text-color-primary)',
        fontWeight: 'bold',
      },
      comparison: {
        label: '对比',
        showPreviousValue: true,
        showChangeValue: true,
        showChangeRate: true,
        rateFormat: 'percent2',
        changeValuePrefix: '',
        changeValueSuffix: '',
      },
      indicator: {
        show: true,
        type: 'arrow',
        positiveDirection: 'increaseGood',
        positiveColor: 'var(--el-color-success)',
        negativeColor: 'var(--el-color-danger)',
        neutralColor: 'var(--el-text-color-secondary)',
        iconSize: 14,
      },
      layout: {
        mode: 'compact',
        horizontalAlign: 'left',
        gap: 10,
        labelWidth: 0,
      },
      textStyle: {
        labelFontSize: 12,
        labelColor: 'var(--el-text-color-secondary)',
        compareFontSize: 14,
        compareFontWeight: 'normal',
      },
      animation: {
        enabled: true,
        duration: 800,
        easing: 'cubicOut',
      },
    },
    {
      title: '周期对比卡',
      w: 360,
      h: 160,
      x: 0,
      y: 0,
      z: 0,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '周期对比单击',
    desc: '鼠标点击周期对比卡时触发',
    method: 'click',
    paramsList: [
      {name: 'currentValue', desc: '当前值', type: 'number'},
      {name: 'previousValue', desc: '对比值', type: 'number'},
      {name: 'changeValue', desc: '变化值', type: 'number'},
      {name: 'changeRate', desc: '变化率', type: 'number'},
      {name: 'trend', desc: '变化方向：up/down/flat', type: 'string'},
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'currentValueField',
    desc: '当前值字段，字段直传模式下必填',
    required: false,
    multiple: false,
  },
  {
    name: 'previousValueField',
    desc: '对比值字段，字段直传模式下必填',
    required: false,
    multiple: false,
  },
  {
    name: 'changeValueField',
    desc: '变化值字段，可由数据集直接返回',
    required: false,
    multiple: false,
  },
  {
    name: 'changeRateField',
    desc: '变化率字段，可由数据集直接返回',
    required: false,
    multiple: false,
  },
  {
    name: 'timeField',
    desc: '时间字段，序列自动计算模式下使用',
    required: false,
    multiple: false,
  },
  {
    name: 'valueField',
    desc: '序列数值字段，序列自动计算模式下使用',
    required: false,
    multiple: false,
  },
  {
    name: 'titleField',
    desc: '标题字段',
    required: false,
    multiple: false,
  },
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
