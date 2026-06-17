import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from '@/dataRoom/components/type/ChartConfig.ts'
import type {Behavior} from '@/dataRoom/components/type/Behavior.ts'
import type {ChartDatasetField} from '@/dataRoom/components/type/ChartDatasetField.ts'
import type {DrBorderType} from './options.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrBorderPropsInterface {
  borderType: DrBorderType
  colors: string[]
  backgroundColor: string
  reverse: boolean
  dur: number | null
  title: string
  titleWidth: number
  animate: boolean
}

export type DrBorderConfig = ChartConfig<DrBorderPropsInterface>

const getInstance = (): DrBorderConfig => {
  return createChartConfig<DrBorderPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrBorder',
    {
      borderType: 'BorderBox1',
      colors: [],
      backgroundColor: 'transparent',
      reverse: false,
      dur: null,
      title: '',
      titleWidth: 250,
      animate: true,
    },
    {
      title: '边框',
      w: 400,
      h: 240,
    },
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
