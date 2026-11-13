import { getDefaultTheme } from '../../theme/registry'
import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {PageType} from '@/dataRoom/constants/PageType.ts'
import type {ChartConfig} from '@/dataRoom/components/type/ChartConfig.ts'
import type {Behavior} from '@/dataRoom/components/type/Behavior.ts'
import type {ChartDatasetField} from '@/dataRoom/components/type/ChartDatasetField.ts'
import type {DrDecorationType} from './options.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrDecorationPropsInterface {
  decorationType: DrDecorationType
  colors: string[]
  reverse: boolean
  dur: number | null
  scanDur: number | null
  haloDur: number | null
}

export type DrDecorationConfig = ChartConfig<DrDecorationPropsInterface>

const getInstance = (pageType: PageType): DrDecorationConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrDecorationPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrDecoration',
    {
      decorationType: 'Decoration1',
      colors: [theme.color.primary, theme.color.secondary],
      reverse: false,
      dur: null,
      scanDur: null,
      haloDur: null,
    },
    {
      title: '装饰',
      w: 300,
      h: 80,
    },
    pageType,
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
