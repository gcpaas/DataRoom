import { toRaw } from 'vue'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

export type ChartHistorySource = 'page-designer' | 'visual-screen-designer'

export interface ChartParentRef {
  parentType: 'root-chart-list' | 'chart-children'
  parentId?: string
}

export interface ChartLayoutState {
  x: number
  y: number
  w: number
  h: number
  rotateX: number
  rotateY: number
  rotateZ: number
}

interface BaseHistoryEntry {
  id: string
  label: string
  timestamp: number
  source: ChartHistorySource
}

export interface AddChartEntry extends BaseHistoryEntry {
  type: 'add-chart'
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

export interface RemoveChartEntry extends BaseHistoryEntry {
  type: 'remove-chart'
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

export interface UpdateChartLayoutEntry extends BaseHistoryEntry {
  type: 'update-chart-layout'
  chartId: string
  before: ChartLayoutState
  after: ChartLayoutState
}

export interface ReorderChartEntry extends BaseHistoryEntry {
  type: 'reorder-chart'
  parent: ChartParentRef
  chartId: string
  beforeIndex: number
  afterIndex: number
}

export type HistoryEntry = AddChartEntry | RemoveChartEntry | UpdateChartLayoutEntry | ReorderChartEntry

interface EditorHistoryManagerOptions {
  source: ChartHistorySource
  getChartList: () => ChartConfig<unknown>[]
  maxEntries?: number
}

interface ChartListResolverResult {
  list: ChartConfig<unknown>[]
  parentChart?: ChartConfig<unknown>
}

interface ChartNodeLocation extends ChartListResolverResult {
  chart: ChartConfig<unknown>
  parent: ChartParentRef
  index: number
}

export interface ChartNodeReference {
  chart: ChartConfig<unknown>
  parent: ChartParentRef
  index: number
}

export interface RemoveChartResult {
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

export interface InsertChartOptions {
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

export interface ReorderChartOptions {
  parent: ChartParentRef
  chartId: string
  toIndex: number
}

export const cloneChartConfig = <T>(chart: ChartConfig<T>): ChartConfig<T> => {
  return structuredClone(toRaw(chart))
}

export const captureChartLayoutState = (chart: Pick<ChartConfig<unknown>, 'x' | 'y' | 'w' | 'h' | 'rotateX' | 'rotateY' | 'rotateZ'>): ChartLayoutState => {
  return {
    x: chart.x,
    y: chart.y,
    w: chart.w,
    h: chart.h,
    rotateX: chart.rotateX,
    rotateY: chart.rotateY,
    rotateZ: chart.rotateZ,
  }
}

export const applyChartLayoutState = (
  chart: Pick<ChartConfig<unknown>, 'x' | 'y' | 'w' | 'h' | 'rotateX' | 'rotateY' | 'rotateZ'>,
  layout: ChartLayoutState,
) => {
  chart.x = layout.x
  chart.y = layout.y
  chart.w = layout.w
  chart.h = layout.h
  chart.rotateX = layout.rotateX
  chart.rotateY = layout.rotateY
  chart.rotateZ = layout.rotateZ
}

export const hasChartLayoutChange = (before: ChartLayoutState, after: ChartLayoutState) => {
  return before.x !== after.x
    || before.y !== after.y
    || before.w !== after.w
    || before.h !== after.h
    || before.rotateX !== after.rotateX
    || before.rotateY !== after.rotateY
    || before.rotateZ !== after.rotateZ
}

export const createChartLayoutHistoryEntry = (
  label: string,
  source: ChartHistorySource,
  chartId: string,
  before: ChartLayoutState,
  after: ChartLayoutState,
): UpdateChartLayoutEntry | null => {
  if (!hasChartLayoutChange(before, after)) {
    return null
  }

  return {
    type: 'update-chart-layout',
    id: `${chartId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: Date.now(),
    source,
    chartId,
    before: structuredClone(before),
    after: structuredClone(after),
  }
}

export const createAddChartHistoryEntry = (
  label: string,
  source: ChartHistorySource,
  chart: ChartConfig<unknown>,
  parent: ChartParentRef,
  index: number,
): AddChartEntry => {
  return {
    type: 'add-chart',
    id: `${chart.id}-add-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: Date.now(),
    source,
    parent: structuredClone(parent),
    index,
    chart: cloneChartConfig(chart),
  }
}

export const createRemoveChartHistoryEntry = (
  label: string,
  source: ChartHistorySource,
  parent: ChartParentRef,
  index: number,
  chart: ChartConfig<unknown>,
): RemoveChartEntry => {
  return {
    type: 'remove-chart',
    id: `${chart.id}-remove-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: Date.now(),
    source,
    parent: structuredClone(parent),
    index,
    chart: cloneChartConfig(chart),
  }
}

export const createReorderChartHistoryEntry = (
  label: string,
  source: ChartHistorySource,
  parent: ChartParentRef,
  chartId: string,
  beforeIndex: number,
  afterIndex: number,
): ReorderChartEntry | null => {
  if (beforeIndex === afterIndex) {
    return null
  }

  return {
    type: 'reorder-chart',
    id: `${chartId}-reorder-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: Date.now(),
    source,
    parent: structuredClone(parent),
    chartId,
    beforeIndex,
    afterIndex,
  }
}

export class ChartLayoutBaselineTracker {
  private readonly baselines = new Map<string, ChartLayoutState>()

  rebuild(chartList: ChartConfig<unknown>[]) {
    this.baselines.clear()
    for (const chart of chartList) {
      this.remember(chart)
    }
  }

  remember(chart: ChartConfig<unknown>) {
    this.baselines.set(chart.id, captureChartLayoutState(chart))
  }

  forget(chartId: string) {
    this.baselines.delete(chartId)
  }

  get(chart: ChartConfig<unknown>) {
    return this.baselines.get(chart.id) ?? captureChartLayoutState(chart)
  }
}

export const getEditorHistoryShortcutAction = (event: KeyboardEvent): 'undo' | 'redo' | null => {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) {
    return null
  }

  if (event.key.toLowerCase() !== 'z' && event.key.toLowerCase() !== 'y') {
    return null
  }

  if (event.key.toLowerCase() === 'y') {
    return 'redo'
  }

  return event.shiftKey ? 'redo' : 'undo'
}

export const isNativeTextEditingTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return false
  }

  return Boolean(
    target.closest(
      'input, textarea, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], .el-input__inner, .el-textarea__inner',
    ),
  )
}

const clampIndex = (index: number, length: number) => {
  if (index <= 0) {
    return 0
  }
  if (index >= length) {
    return length
  }
  return index
}

const findChartNodeLocation = (
  chartId: string,
  chartList: ChartConfig<unknown>[],
  parent: ChartParentRef = { parentType: 'root-chart-list' },
): ChartNodeLocation | null => {
  for (let index = 0; index < chartList.length; index++) {
    const chart = chartList[index]!
    if (chart.id === chartId) {
      return {
        chart,
        parent,
        index,
        list: chartList,
      }
    }

    if (chart.children && chart.children.length > 0) {
      const childResult = findChartNodeLocation(chartId, chart.children, {
        parentType: 'chart-children',
        parentId: chart.id,
      })
      if (childResult) {
        return childResult
      }
    }
  }

  return null
}

export const findChartReference = (chartId: string, chartList: ChartConfig<unknown>[]): ChartNodeReference | null => {
  const location = findChartNodeLocation(chartId, chartList)
  if (!location) {
    return null
  }

  return {
    chart: location.chart,
    parent: structuredClone(location.parent),
    index: location.index,
  }
}

const resolveChartListByParent = (
  chartList: ChartConfig<unknown>[],
  parent: ChartParentRef,
): ChartListResolverResult | null => {
  if (parent.parentType === 'root-chart-list') {
    return {
      list: chartList,
    }
  }

  if (!parent.parentId) {
    return null
  }

  const parentLocation = findChartNodeLocation(parent.parentId, chartList)
  if (!parentLocation) {
    return null
  }

  if (!parentLocation.chart.children) {
    parentLocation.chart.children = []
  }

  return {
    list: parentLocation.chart.children,
    parentChart: parentLocation.chart,
  }
}

export const getChartListByParent = (chartList: ChartConfig<unknown>[], parent: ChartParentRef) => {
  const resolved = resolveChartListByParent(chartList, parent)
  return resolved?.list ?? null
}

export const insertChartAtLocation = (chartList: ChartConfig<unknown>[], options: InsertChartOptions) => {
  const resolved = resolveChartListByParent(chartList, options.parent)
  if (!resolved) {
    return false
  }

  const index = clampIndex(options.index, resolved.list.length)
  resolved.list.splice(index, 0, options.chart)
  return true
}

export const removeChartWithLocation = (chartId: string, chartList: ChartConfig<unknown>[]): RemoveChartResult | null => {
  const location = findChartNodeLocation(chartId, chartList)
  if (!location) {
    return null
  }

  location.list.splice(location.index, 1)

  return {
    parent: location.parent,
    index: location.index,
    chart: cloneChartConfig(location.chart),
  }
}

export const reorderChartWithinParent = (chartList: ChartConfig<unknown>[], options: ReorderChartOptions) => {
  const resolved = resolveChartListByParent(chartList, options.parent)
  if (!resolved) {
    return false
  }

  const fromIndex = resolved.list.findIndex((item) => item.id === options.chartId)
  if (fromIndex < 0) {
    return false
  }

  const boundedTargetIndex = clampIndex(options.toIndex, Math.max(resolved.list.length - 1, 0))
  if (fromIndex === boundedTargetIndex) {
    return true
  }

  const [chart] = resolved.list.splice(fromIndex, 1)
  if (!chart) {
    return false
  }
  resolved.list.splice(boundedTargetIndex, 0, chart)
  return true
}

const removeChartByEntry = (chartList: ChartConfig<unknown>[], entry: AddChartEntry | RemoveChartEntry) => {
  const location = findChartNodeLocation(entry.chart.id, chartList)
  if (!location) {
    return false
  }
  location.list.splice(location.index, 1)
  return true
}

const restoreChartByEntry = (chartList: ChartConfig<unknown>[], entry: AddChartEntry | RemoveChartEntry) => {
  return insertChartAtLocation(chartList, {
    parent: entry.parent,
    index: entry.index,
    chart: cloneChartConfig(entry.chart),
  })
}

export class EditorHistoryManager {
  private readonly options: EditorHistoryManagerOptions

  readonly source: ChartHistorySource
  readonly maxEntries: number
  readonly undoStack: HistoryEntry[] = []
  readonly redoStack: HistoryEntry[] = []

  isApplyingHistory = false

  constructor(options: EditorHistoryManagerOptions) {
    this.options = options
    this.source = options.source
    this.maxEntries = options.maxEntries ?? 100
  }

  get canUndo() {
    return this.undoStack.length > 0
  }

  get canRedo() {
    return this.redoStack.length > 0
  }

  record(entry: HistoryEntry | null) {
    if (!entry || this.isApplyingHistory) {
      return false
    }

    this.undoStack.push(entry)
    this.redoStack.length = 0
    if (this.undoStack.length > this.maxEntries) {
      this.undoStack.splice(0, this.undoStack.length - this.maxEntries)
    }
    return true
  }

  undo() {
    const entry = this.undoStack.pop()
    if (!entry) {
      return false
    }

    const applied = this.applyEntry(entry, 'undo')
    if (!applied) {
      this.undoStack.push(entry)
      return false
    }

    this.redoStack.push(entry)
    return true
  }

  redo() {
    const entry = this.redoStack.pop()
    if (!entry) {
      return false
    }

    const applied = this.applyEntry(entry, 'redo')
    if (!applied) {
      this.redoStack.push(entry)
      return false
    }

    this.undoStack.push(entry)
    return true
  }

  private applyEntry(entry: HistoryEntry, direction: 'undo' | 'redo') {
    const chartList = this.options.getChartList()
    this.isApplyingHistory = true
    try {
      switch (entry.type) {
        case 'add-chart':
          return direction === 'undo'
            ? removeChartByEntry(chartList, entry)
            : restoreChartByEntry(chartList, entry)
        case 'remove-chart':
          return direction === 'undo'
            ? restoreChartByEntry(chartList, entry)
            : removeChartByEntry(chartList, entry)
        case 'update-chart-layout': {
          const location = findChartNodeLocation(entry.chartId, chartList)
          if (!location) {
            return false
          }
          applyChartLayoutState(location.chart, direction === 'undo' ? entry.before : entry.after)
          return true
        }
        case 'reorder-chart':
          return reorderChartWithinParent(chartList, {
            parent: entry.parent,
            chartId: entry.chartId,
            toIndex: direction === 'undo' ? entry.beforeIndex : entry.afterIndex,
          })
        default:
          return false
      }
    } finally {
      this.isApplyingHistory = false
    }
  }
}
