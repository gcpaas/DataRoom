/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  EditorHistoryManager,
  cloneChartConfig,
  createReplaceChartChildrenHistoryEntry,
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

test('undo and redo replacing root sibling list', () => {
  const before = [createChart('a'), createChart('b')]
  const after = [
    createChart('group', {
      type: 'DrGroup',
      x: 10,
      y: 20,
      children: [createChart('a'), createChart('b')],
    }),
  ]
  const chartList = before.map((item) => cloneChartConfig(item))
  const history = createHistory(chartList, 'visual-screen-designer')

  chartList.splice(0, chartList.length, ...after.map((item) => cloneChartConfig(item)))
  history.record(createReplaceChartChildrenHistoryEntry('组合', 'visual-screen-designer', { parentType: 'root-chart-list' }, before, after))

  assert.deepEqual(chartList.map((item) => item.id), ['group'])
  history.undo()
  assert.deepEqual(chartList.map((item) => item.id), ['a', 'b'])
  history.redo()
  assert.deepEqual(chartList.map((item) => item.id), ['group'])
  assert.deepEqual(chartList[0]?.children?.map((item) => item.id), ['a', 'b'])
})

test('undo and redo replacing nested sibling list', () => {
  const parent = createChart('parent', {
    type: 'DrGroup',
    children: [createChart('child-a'), createChart('child-b')],
  })
  const chartList = [createChart('root'), parent]
  const before = parent.children!.map((item) => cloneChartConfig(item))
  const after = [
    createChart('nested-group', {
      type: 'DrGroup',
      children: [createChart('child-a'), createChart('child-b')],
    }),
  ]
  const history = createHistory(chartList, 'visual-screen-designer')

  parent.children!.splice(0, parent.children!.length, ...after.map((item) => cloneChartConfig(item)))
  history.record(
    createReplaceChartChildrenHistoryEntry('组合', 'visual-screen-designer', { parentType: 'chart-children', parentId: 'parent' }, before, after),
  )

  assert.deepEqual(parent.children?.map((item) => item.id), ['nested-group'])
  history.undo()
  assert.deepEqual(parent.children?.map((item) => item.id), ['child-a', 'child-b'])
  history.redo()
  assert.deepEqual(parent.children?.map((item) => item.id), ['nested-group'])
  assert.deepEqual(parent.children?.[0]?.children?.map((item) => item.id), ['child-a', 'child-b'])
})
