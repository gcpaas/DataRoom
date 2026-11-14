import { defineAsyncComponent } from 'vue'
import { PageType } from '@/dataRoom/constants/PageType.ts'

import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import { createGroupChart, DR_GROUP_TYPE } from '@/dataRoom/visual-screen-designer/grouping'

export const component = defineAsyncComponent(() => import('./index.vue'))
export const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))
export const behaviors: Behavior[] = []
export const datasetFields: ChartDatasetField[] = []

export const getInstance = (pageType: PageType) => {
  if (pageType !== PageType.PAGE && pageType !== PageType.VISUAL_SCREEN) {
    throw new Error('不支持的页面类型，仅支持 PAGE 或 VISUAL_SCREEN')
  }
  const config = createGroupChart({
    title: '组合',
    x: 100,
    y: 100,
    w: 300,
    h: 200,
    children: [],
  })
  if (pageType === PageType.PAGE) {
    config.w = 16
    config.h = 10
  }
  return config
}

export { DR_GROUP_TYPE }
