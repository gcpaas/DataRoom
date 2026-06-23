import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'
import type { AlarmImageItem } from './alarm-condition.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrAlarmImagePropsInterface {
  value: {
    show: boolean
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
  image: {
    defaultItemId: string
    repeatMode: 'no-repeat-stretch' | 'no-repeat-contain' | 'no-repeat-center' | 'repeat' | 'repeat-x' | 'repeat-y'
    borderRadius: number
    items: AlarmImageItem[]
  }
  layout: {
    direction: 'vertical' | 'horizontal'
    imageSize: 'auto' | 'contain'
    gap: number
    horizontalAlign: 'left' | 'center' | 'right'
    verticalAlign: 'top' | 'center' | 'bottom'
  }
  animation: {
    enabled: boolean
    duration: number
  }
}

export type DrAlarmImageConfig = ChartConfig<DrAlarmImagePropsInterface>

const getInstance = (): DrAlarmImageConfig => {
  return createChartConfig<DrAlarmImagePropsInterface>(
    'DrAlarmImage',
    {
      value: {
        show: true,
        defaultValue: 95,
        format: 'integer',
        decimalPlaces: 0,
        thousandSeparator: false,
        prefix: '',
        suffix: '',
        emptyText: '--',
        fontSize: 28,
        color: 'var(--el-text-color-primary)',
        fontWeight: 'bold',
        lineHeight: 1,
      },
      image: {
        defaultItemId: 'normal',
        repeatMode: 'no-repeat-contain',
        borderRadius: 0,
        items: [
          {
            id: 'normal',
            name: '正常',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: '',
            enabled: true,
          },
          {
            id: 'warning',
            name: '预警',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: '100 > x > 90',
            enabled: true,
          },
          {
            id: 'danger',
            name: '异常',
            url: '/dataRoom/resource/image/placeholder.png',
            condition: 'x >= 100',
            enabled: true,
          },
        ],
      },
      layout: {
        direction: 'vertical',
        imageSize: 'contain',
        gap: 8,
        horizontalAlign: 'center',
        verticalAlign: 'center',
      },
      animation: {
        enabled: true,
        duration: 200,
      },
    },
    {
      title: '告警图',
      w: 220,
      h: 180,
    },
  )
}

const behaviors: Behavior[] = [
  {
    name: '告警图单击',
    desc: '鼠标点击告警图时触发',
    method: 'click',
    paramsList: [
      { name: 'value', desc: '当前原始数值', type: 'number' },
      { name: 'formattedValue', desc: '当前格式化数值文本', type: 'string' },
      { name: 'imageName', desc: '当前图片名称', type: 'string' },
      { name: 'imageUrl', desc: '当前图片地址', type: 'string' },
      { name: 'condition', desc: '当前命中的条件表达式', type: 'string' },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '告警数值字段',
    required: false,
    multiple: false,
  },
]

const mockDataset: ChartMockDataset = {
  dataset: [
    {
      value: 3,
    },
  ],
  fields: [
    {
      name: 'valueField',
      bindName: 'value',
    },
  ],
}

export { component, controlPanel, getInstance, behaviors, datasetFields, mockDataset }
