import { unref, type Ref } from 'vue'

import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

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

/**
 * 生成图层树节点。层级由 chart.z 决定（z 越大越靠顶层）；
 * 树按 z 升序排列（树顶部为最底层），同 z 保持数组原有顺序。
 */
export const createLayerNodes = (charts: ChartListLike): LayerNode[] => {
  return [...resolveChartList(charts)]
    .map((chart, index) => ({ chart, index }))
    .sort((a, b) => (a.chart.z - b.chart.z) || (a.index - b.index))
    .map(({ chart }) => ({
      id: chart.id,
      title: chart.title || '',
      chart,
      hidden: chart.hide === true,
      children: chart.children?.length ? createLayerNodes(chart.children) : undefined,
    }))
}
