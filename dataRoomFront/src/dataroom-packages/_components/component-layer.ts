import { unref, type Ref } from 'vue'

import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'

export type LayerNode = {
  id: string
  title: string
  chart: ChartConfig<unknown>
  hidden: boolean
  children?: LayerNode[]
}

type ChartListLike = ChartConfig<unknown>[] | Ref<ChartConfig<unknown>[] | undefined> | undefined

const resolveChartList = (charts: ChartListLike): ChartConfig<unknown>[] => {
  const value = unref(charts)
  return Array.isArray(value) ? value : []
}

export const createLayerNodes = (charts: ChartListLike): LayerNode[] => {
  return [...resolveChartList(charts)]
    .reverse()
    .map((chart) => ({
      id: chart.id,
      title: chart.title || '',
      chart,
      hidden: chart.hide === true,
      children: chart.children?.length ? createLayerNodes(chart.children) : undefined,
    }))
}
