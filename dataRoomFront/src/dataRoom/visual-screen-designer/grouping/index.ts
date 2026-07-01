import { v4 as uuidv4 } from 'uuid'
import type { ChartConfig } from '../../components/type/ChartConfig.ts'
import { cloneChartConfig } from '../../designer/utils/editor-history.ts'

export const DR_GROUP_TYPE = 'DrGroup'

export interface CreateGroupChartOptions {
  id?: string
  title: string
  x: number
  y: number
  w: number
  h: number
  z?: number
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  children?: ChartConfig<unknown>[]
}

export interface GroupChartsResult {
  changed: boolean
  group?: ChartConfig<unknown>
  selectedIds: string[]
}

export interface UngroupChartResult {
  changed: boolean
  insertedCharts: ChartConfig<unknown>[]
  selectedIds: string[]
}

export interface NormalizeGroupBoundsResult {
  changed: boolean
}

interface IndexedChart {
  chart: ChartConfig<unknown>
  index: number
}

export const isGroupChart = (chart: ChartConfig<unknown>): chart is ChartConfig<unknown> & { type: typeof DR_GROUP_TYPE } => {
  return chart.type === DR_GROUP_TYPE
}

export const createGroupChart = (options: CreateGroupChartOptions): ChartConfig<unknown> & { children: ChartConfig<unknown>[] } => {
  const id = options.id ?? uuidv4()

  return {
    id,
    i: id,
    type: DR_GROUP_TYPE,
    title: options.title,
    x: options.x,
    y: options.y,
    w: options.w,
    h: options.h,
    z: options.z ?? 0,
    rotateX: options.rotateX ?? 0,
    rotateY: options.rotateY ?? 0,
    rotateZ: options.rotateZ ?? 0,
    props: {},
    hide: false,
    children: (options.children ?? []).map((child) => cloneChartConfig(child)),
    behaviors: {},
    dataset: {
      code: '',
      fields: {},
      script: '',
      params: {},
    },
  }
}

const getSelectedSiblingCharts = (siblings: ChartConfig<unknown>[], selectedIds: string[]): IndexedChart[] => {
  const selectedIdSet = new Set(selectedIds)
  return siblings
    .map((chart, index) => ({ chart, index }))
    .filter(({ chart }) => selectedIdSet.has(chart.id))
}

const getBounds = (charts: ChartConfig<unknown>[]) => {
  const left = Math.min(...charts.map((chart) => chart.x))
  const top = Math.min(...charts.map((chart) => chart.y))
  const right = Math.max(...charts.map((chart) => chart.x + chart.w))
  const bottom = Math.max(...charts.map((chart) => chart.y + chart.h))

  return {
    x: left,
    y: top,
    w: right - left,
    h: bottom - top,
  }
}

export const normalizeGroupBounds = (group: ChartConfig<unknown>): NormalizeGroupBoundsResult => {
  if (!isGroupChart(group) || !Array.isArray(group.children) || group.children.length === 0) {
    return { changed: false }
  }

  const bounds = getBounds(group.children)
  const nextX = group.x + bounds.x
  const nextY = group.y + bounds.y
  const changed = nextX !== group.x || nextY !== group.y || bounds.w !== group.w || bounds.h !== group.h
  if (!changed) {
    return { changed: false }
  }

  group.x = nextX
  group.y = nextY
  group.w = bounds.w
  group.h = bounds.h
  group.children.forEach((child) => {
    child.x -= bounds.x
    child.y -= bounds.y
  })

  return { changed: true }
}

export const groupChartsInParent = (
  siblings: ChartConfig<unknown>[],
  selectedIds: string[],
  title: string,
): GroupChartsResult => {
  const selected = getSelectedSiblingCharts(siblings, selectedIds)

  if (selected.length < 2) {
    return {
      changed: false,
      selectedIds: selected.map(({ chart }) => chart.id),
    }
  }

  const bounds = getBounds(selected.map(({ chart }) => chart))
  const children = selected.map(({ chart }) => {
    const child = cloneChartConfig(chart)
    child.x -= bounds.x
    child.y -= bounds.y
    return child
  })
  const group = createGroupChart({
    title,
    x: bounds.x,
    y: bounds.y,
    w: bounds.w,
    h: bounds.h,
    z: Math.max(...selected.map(({ chart }) => chart.z)),
    children,
  })
  const selectedIndexes = new Set(selected.map(({ index }) => index))
  const insertIndex = Math.min(...selectedIndexes)

  siblings.splice(0, siblings.length, ...siblings.filter((_, index) => !selectedIndexes.has(index)))
  siblings.splice(insertIndex, 0, group)

  return {
    changed: true,
    group,
    selectedIds: [group.id],
  }
}

export const ungroupChartInParent = (
  siblings: ChartConfig<unknown>[],
  groupId: string,
): UngroupChartResult => {
  const groupIndex = siblings.findIndex((chart) => chart.id === groupId)
  const group = siblings[groupIndex]

  if (!group || !isGroupChart(group) || !Array.isArray(group.children)) {
    return {
      changed: false,
      insertedCharts: [],
      selectedIds: [],
    }
  }

  const insertedCharts = group.children.map((child) => {
    const insertedChart = cloneChartConfig(child)
    insertedChart.x += group.x
    insertedChart.y += group.y
    return insertedChart
  })

  siblings.splice(groupIndex, 1, ...insertedCharts)

  return {
    changed: true,
    insertedCharts,
    selectedIds: insertedCharts.map((chart) => chart.id),
  }
}
