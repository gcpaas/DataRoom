import { defineAsyncComponent } from 'vue'

import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import { createGroupChart, DR_GROUP_TYPE } from '@/dataRoom/visual-screen-designer/grouping'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export const behaviors: Behavior[] = []
export const datasetFields: ChartDatasetField[] = []

export const getInstance = () => {
  return createGroupChart({
    title: '组合',
    x: 100,
    y: 100,
    w: 300,
    h: 200,
    children: [],
  })
}

export { DR_GROUP_TYPE }
