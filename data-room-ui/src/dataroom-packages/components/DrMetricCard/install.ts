import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrMetricCardPropsInterface {
  global: {
    padding: [number, number, number, number]
    backgroundColor: string
    borderColor: string
    borderWidth: number
    borderRadius: number
    shadow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
  }
  layout: {
    direction: 'vertical' | 'horizontal'
    horizontalAlign: 'left' | 'center' | 'right'
    verticalAlign: 'top' | 'center' | 'bottom'
    gap: number
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
    thousandSeparator: boolean
    prefix: string
    suffix: string
    emptyText: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
    lineHeight: number
  }
  subtitle: {
    show: boolean
    text: string
    fontSize: number
    color: string
    fontWeight: 'normal' | 'bold' | 'bolder'
  }
  unit: {
    show: boolean
    text: string
    position: 'prefix' | 'suffix' | 'top' | 'bottom'
    fontSize: number
    color: string
    gap: number
  }
  conditional: {
    enabled: boolean
    rules: Array<{
      operator: '>' | '>=' | '<' | '<=' | '=' | '!=' | 'contains' | 'empty' | 'notEmpty'
      value?: number | string
      valueColor: string
      backgroundColor: string
      borderColor: string
    }>
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

export type DrMetricCardConfig = ChartConfig<DrMetricCardPropsInterface>

const getInstance = (): DrMetricCardConfig => {
  return createChartConfig<DrMetricCardPropsInterface>(
    'DrMetricCard',
    {
      global: {
        padding: [16, 18, 16, 18],
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 8,
        shadow: {
          enabled: false,
          color: 'var(--el-border-color)',
          blur: 12,
          offsetX: 0,
          offsetY: 4
        }
      },
      layout: {
        direction: 'vertical',
        horizontalAlign: 'left',
        verticalAlign: 'center',
        gap: 8
      },
      title: {
        show: true,
        text: '指标名称',
        fontSize: 14,
        color: 'var(--el-text-color-secondary)',
        fontWeight: 'normal'
      },
      value: {
        defaultValue: 1280,
        format: 'thousand',
        decimalPlaces: 0,
        thousandSeparator: true,
        prefix: '',
        suffix: '',
        emptyText: '--',
        fontSize: 36,
        color: 'var(--el-text-color-primary)',
        fontWeight: 'bold',
        lineHeight: 1
      },
      subtitle: {
        show: true,
        text: '实时统计',
        fontSize: 12,
        color: 'var(--el-text-color-secondary)',
        fontWeight: 'normal'
      },
      unit: {
        show: true,
        text: '',
        position: 'suffix',
        fontSize: 14,
        color: 'var(--el-text-color-secondary)',
        gap: 4
      },
      conditional: {
        enabled: false,
        rules: [
          {
            operator: '>=',
            value: 1000,
            valueColor: 'var(--el-color-success)',
            backgroundColor: 'transparent',
            borderColor: 'transparent'
          }
        ]
      },
      animation: {
        enabled: true,
        duration: 800,
        easing: 'cubicOut'
      }
    },
    {
      title: '指标卡',
      w: 280,
      h: 140,
      x: 0,
      y: 0,
      z: 0
    }
  )
}

const behaviors: Behavior[] = [
  {
    name: '指标卡单击',
    desc: '鼠标点击指标卡时触发',
    method: 'click',
    paramsList: [
      {name: 'value', desc: '当前指标值', type: 'number'},
      {name: 'title', desc: '当前指标标题', type: 'string'},
      {name: 'unit', desc: '当前指标单位', type: 'string'}
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '指标数值字段',
    required: true,
    multiple: false
  },
  {
    name: 'titleField',
    desc: '标题字段',
    required: false,
    multiple: false
  },
  {
    name: 'subtitleField',
    desc: '副标题字段',
    required: false,
    multiple: false
  },
  {
    name: 'unitField',
    desc: '单位字段',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
