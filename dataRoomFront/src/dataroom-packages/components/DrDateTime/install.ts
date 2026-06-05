import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"
import type {DateTimeFormat} from './time-format.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrDateTimePropsInterface {
  format: DateTimeFormat
  textStyle: {
    fontSize: number
    fontFamily: string
    fontWeight: string
    letterSpacing: number
    color: string
  }
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'center' | 'bottom'
}

export type DrDateTimeConfig = ChartConfig<DrDateTimePropsInterface>

const getInstance = (): DrDateTimeConfig => {
  return createChartConfig<DrDateTimePropsInterface>(
    'DrDateTime',
    {
      format: 'yyyy-MM-dd HH:mm:ss',
      textStyle: {
        fontSize: 24,
        fontFamily: 'Microsoft YaHei',
        fontWeight: '400',
        letterSpacing: 1,
        color: '#909399',
      },
      align: 'center',
      verticalAlign: 'center',
    },
    {
      title: '时间',
      w: 240,
      h: 60,
    },
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
