/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  EditorHistoryManager,
  captureChartLayoutState,
  createChartsLayoutHistoryEntry,
  type ChartHistorySource,
} from './editor-history.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

const createChart = (id: string, overrides: Partial<ChartConfig<unknown>> = {}): ChartConfig<unknown> => ({
  id,
  i: id,
  type: 'DrText',
  title: `${id}-title`,
  w: 100,
  h: 60,
  x: 0,
  y: 0,
  z: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  props: {},
  dataset: {
    code: '',
    fields: {},
    script: '',
    params: {},
  },
  behaviors: {},
  ...overrides,
})

const createHistory = (chartList: ChartConfig<unknown>[], source: ChartHistorySource = 'visual-screen-designer') =>
  new EditorHistoryManager({
    source,
    getChartList: () => chartList,
  })

test('undo and redo batch chart layout updates as one history entry', () => {
  const chartList: ChartConfig<unknown>[] = [
    createChart('a', { x: 0, y: 0 }),
    createChart('b', { x: 50, y: 50 }),
  ]
  const history = createHistory(chartList)
  const before = new Map(chartList.map((item) => [item.id, captureChartLayoutState(item)]))

  chartList[0]!.x = 100
  chartList[0]!.y = 20
  chartList[1]!.x = 150
  chartList[1]!.y = 70
  const after = new Map(chartList.map((item) => [item.id, captureChartLayoutState(item)]))

  history.record(createChartsLayoutHistoryEntry('批量移动组件', 'visual-screen-designer', before, after)!)

  history.undo()
  assert.deepEqual(chartList.map((item) => ({ id: item.id, x: item.x, y: item.y })), [
    { id: 'a', x: 0, y: 0 },
    { id: 'b', x: 50, y: 50 },
  ])

  history.redo()
  assert.deepEqual(chartList.map((item) => ({ id: item.id, x: item.x, y: item.y })), [
    { id: 'a', x: 100, y: 20 },
    { id: 'b', x: 150, y: 70 },
  ])
})

test('does not create batch layout history when layouts are unchanged', () => {
  const chartList: ChartConfig<unknown>[] = [createChart('a')]
  const before = new Map(chartList.map((item) => [item.id, captureChartLayoutState(item)]))
  const after = new Map(chartList.map((item) => [item.id, captureChartLayoutState(item)]))

  assert.equal(createChartsLayoutHistoryEntry('批量移动组件', 'visual-screen-designer', before, after), null)
})
