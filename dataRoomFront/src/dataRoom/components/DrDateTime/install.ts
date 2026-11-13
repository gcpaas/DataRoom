import { getDefaultTheme } from '../../theme/registry'
import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {PageType} from '@/dataRoom/constants/PageType.ts'
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts"
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts"
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts"
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

const getInstance = (pageType: PageType): DrDateTimeConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrDateTimePropsInterface>(
    'DrDateTime',
    {
      format: 'yyyy-MM-dd HH:mm:ss',
      textStyle: {
        fontSize: 24,
        fontFamily: 'Microsoft YaHei',
        fontWeight: '400',
        letterSpacing: 1,
        color: theme.text.secondary,
      },
      align: 'center',
      verticalAlign: 'center',
    },
    {
      title: '时间',
      w: 240,
      h: 60,
    },
    pageType,
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
