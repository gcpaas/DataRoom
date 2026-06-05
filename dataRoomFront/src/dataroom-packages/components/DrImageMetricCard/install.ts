import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'
import type { ImageMetricRepeatMode } from './runtime.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

type TextAlign = 'left' | 'center' | 'right'
type FontWeight = 'normal' | 'bold' | 'bolder'

export interface DrImageMetricCardPropsInterface {
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
    imagePosition: 'left' | 'right'
    contentOrder: 'descriptionFirst' | 'valueFirst'
    gap: number
    rowGap: number
    horizontalAlign: TextAlign
    verticalAlign: 'top' | 'center' | 'bottom'
  }
  image: {
    url: string
    width: number
    height: number
    repeatMode: ImageMetricRepeatMode
    borderRadius: number
  }
  description: {
    text: string
    fontSize: number
    color: string
    fontWeight: FontWeight
    lineHeight: number
    align: TextAlign
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
    fontWeight: FontWeight
    lineHeight: number
    align: TextAlign
    glow: {
      enabled: boolean
      color: string
      blur: number
      offsetX: number
      offsetY: number
    }
  }
  unit: {
    text: string
    position: 'descriptionSuffix' | 'valuePrefix' | 'valueSuffix'
    gap: number
    fontSize: number
    color: string
    fontWeight: FontWeight
    lineHeight: number
  }
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

export type DrImageMetricCardConfig = ChartConfig<DrImageMetricCardPropsInterface>

const getInstance = (): DrImageMetricCardConfig => {
  return createChartConfig<DrImageMetricCardPropsInterface>(
    'DrImageMetricCard',
    {
      global: {
        padding: [12, 16, 12, 16],
        backgroundColor: '',
        borderColor: '',
        borderWidth: 0,
        borderRadius: 8,
        shadow: {
          enabled: false,
          color: '',
          blur: 12,
          offsetX: 0,
          offsetY: 4,
        },
      },
      layout: {
        imagePosition: 'left',
        contentOrder: 'descriptionFirst',
        gap: 18,
        rowGap: 8,
        horizontalAlign: 'left',
        verticalAlign: 'center',
      },
      image: {
        url: '/dataRoom/resource/image/placeholder.png',
        width: 120,
        height: 96,
        repeatMode: 'no-repeat-contain',
        borderRadius: 0,
      },
      description: {
        text: '批销总金额',
        fontSize: 16,
        color: '',
        fontWeight: 'bold',
        lineHeight: 1.4,
        align: 'left',
      },
      value: {
        defaultValue: 1234.56,
        format: 'thousand',
        decimalPlaces: 2,
        thousandSeparator: true,
        prefix: '',
        suffix: '',
        emptyText: '--',
        fontSize: 36,
        color: '',
        fontWeight: 'bold',
        lineHeight: 1,
        align: 'left',
        glow: {
          enabled: true,
          color: '',
          blur: 8,
          offsetX: 0,
          offsetY: 0,
        },
      },
      unit: {
        text: '（单位）',
        position: 'descriptionSuffix',
        gap: 6,
        fontSize: 14,
        color: '',
        fontWeight: 'normal',
        lineHeight: 1.4,
      },
      animation: {
        enabled: true,
        duration: 800,
        easing: 'cubicOut',
      },
    },
    {
      title: '图片指标卡',
      w: 360,
      h: 120,
      x: 0,
      y: 0,
      z: 0,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '图片指标卡单击',
    desc: '鼠标点击图片指标卡时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '当前原始数值', type: 'number|string' },
      { name: 'formattedValue', desc: '当前格式化数值', type: 'string' },
      { name: 'description', desc: '描述文本', type: 'string' },
      { name: 'unit', desc: '单位文本', type: 'string' },
      { name: 'imageUrl', desc: '图片地址', type: 'string' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '指标数值字段',
    required: false,
    multiple: false,
  },
]

export { component, controlPanel, getInstance, behaviors, datasetFields }
