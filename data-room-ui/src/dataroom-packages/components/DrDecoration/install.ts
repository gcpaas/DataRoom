import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from '@/dataroom-packages/components/type/ChartConfig.ts'
import {DrConst} from '@/dataroom-packages/constant/DrConst.ts'
import type {Behavior} from '@/dataroom-packages/components/type/Behavior.ts'
import type {ChartDatasetField} from '@/dataroom-packages/components/type/ChartDatasetField.ts'
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

const getInstance = (): DrDecorationConfig => {
  return createChartConfig<DrDecorationPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      decorationType: 'Decoration1',
      colors: [],
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
  )
}

const behaviors: Behavior[] = []

const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
