/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DR_GROUP_TYPE,
  createGroupChart,
  groupChartsInParent,
  isGroupChart,
  normalizeGroupBounds,
  ungroupChartInParent,
} from './index.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

const chart = (id: string, overrides: Partial<ChartConfig<unknown>> = {}): ChartConfig<unknown> => ({
  id,
  i: id,
  type: 'DrText',
  title: `${id}-title`,
  x: 0,
  y: 0,
  w: 100,
  h: 60,
  z: 0,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  props: {},
  dataset: { code: '', fields: {}, script: '', params: {} },
  behaviors: {},
  ...overrides,
})

test('createGroupChart creates a structural group node', () => {
  const group = createGroupChart({
    title: '组合 1',
    x: 10,
    y: 20,
    w: 300,
    h: 160,
    children: [chart('a')],
  })

  assert.equal(group.type, DR_GROUP_TYPE)
  assert.equal(group.title, '组合 1')
  assert.equal(group.x, 10)
  assert.equal(group.y, 20)
  assert.equal(group.w, 300)
  assert.equal(group.h, 160)
  assert.equal(group.children.length, 1)
  assert.equal(isGroupChart(group), true)
})

test('groups same-parent charts and converts children to group-relative coordinates', () => {
  const siblings = [
    chart('a', { x: 100, y: 80, w: 120, h: 60 }),
    chart('b', { x: 260, y: 120, w: 80, h: 100 }),
    chart('c', { x: 500, y: 200, w: 90, h: 70 }),
  ]

  const result = groupChartsInParent(siblings, ['a', 'b'], '组合')

  assert.equal(result.changed, true)
  assert.equal(result.group?.type, DR_GROUP_TYPE)
  assert.deepEqual(siblings.map((item) => item.id), [result.group!.id, 'c'])
  assert.equal(result.group?.x, 100)
  assert.equal(result.group?.y, 80)
  assert.equal(result.group?.w, 240)
  assert.equal(result.group?.h, 140)
  assert.deepEqual(result.group?.children?.map((item) => [item.id, item.x, item.y]), [
    ['a', 0, 0],
    ['b', 160, 40],
  ])
})

test('groups existing group with another same-parent chart', () => {
  const existingGroup = createGroupChart({
    title: '已有组合',
    x: 50,
    y: 40,
    w: 200,
    h: 120,
    children: [chart('inside')],
  })
  const siblings = [existingGroup, chart('outside', { x: 300, y: 100, w: 80, h: 60 })]

  const result = groupChartsInParent(siblings, [existingGroup.id, 'outside'], '外层组合')

  assert.equal(result.changed, true)
  assert.equal(siblings.length, 1)
  assert.equal(siblings[0]?.type, DR_GROUP_TYPE)
  assert.deepEqual(siblings[0]?.children?.map((item) => item.type), [DR_GROUP_TYPE, 'DrText'])
  assert.deepEqual(siblings[0]?.children?.map((item) => [item.id, item.x, item.y]), [
    [existingGroup.id, 0, 0],
    ['outside', 250, 60],
  ])
})

test('does not group fewer than two existing same-parent charts', () => {
  const siblings = [chart('a'), chart('b')]
  const result = groupChartsInParent(siblings, ['a', 'missing'], '组合')
  assert.equal(result.changed, false)
  assert.deepEqual(siblings.map((item) => item.id), ['a', 'b'])
})

test('ungroups one level and converts direct children to parent coordinates', () => {
  const group = createGroupChart({
    title: '组合',
    x: 100,
    y: 50,
    w: 220,
    h: 120,
    children: [
      chart('a', { x: 0, y: 10, w: 100, h: 40 }),
      chart('nested', {
        type: DR_GROUP_TYPE,
        x: 120,
        y: 20,
        w: 80,
        h: 60,
        children: [chart('inner')],
      }),
    ],
  })
  const siblings = [chart('before'), group, chart('after')]

  const result = ungroupChartInParent(siblings, group.id)

  assert.equal(result.changed, true)
  assert.deepEqual(siblings.map((item) => item.id), ['before', 'a', 'nested', 'after'])
  assert.deepEqual(siblings.slice(1, 3).map((item) => [item.id, item.x, item.y]), [
    ['a', 100, 60],
    ['nested', 220, 70],
  ])
  assert.equal(siblings[2]?.type, DR_GROUP_TYPE)
})

test('recognizes persisted group without children but refuses to ungroup it', () => {
  const malformedGroup = chart('group-without-children', {
    type: DR_GROUP_TYPE,
    x: 40,
    y: 30,
  })
  const siblings = [chart('before'), malformedGroup, chart('after')]
  const originalSiblings = [...siblings]

  assert.equal(isGroupChart(malformedGroup), true)

  const result = ungroupChartInParent(siblings, malformedGroup.id)

  assert.equal(result.changed, false)
  assert.deepEqual(result.insertedCharts, [])
  assert.deepEqual(result.selectedIds, [])
  assert.deepEqual(siblings, originalSiblings)
})

test('normalizes group bounds after direct children move outside current group box', () => {
  const group = createGroupChart({
    title: '组合',
    x: 100,
    y: 80,
    w: 200,
    h: 120,
    children: [
      chart('a', { x: -30, y: 20, w: 80, h: 40 }),
      chart('b', { x: 150, y: -10, w: 100, h: 90 }),
    ],
  })

  const result = normalizeGroupBounds(group)

  assert.equal(result.changed, true)
  assert.deepEqual([group.x, group.y, group.w, group.h], [70, 70, 280, 90])
  assert.deepEqual(group.children.map((item) => [item.id, item.x, item.y]), [
    ['a', 0, 30],
    ['b', 180, 0],
  ])
})

test('normalizing group bounds is a no-op when children already fill the box', () => {
  const group = createGroupChart({
    title: '组合',
    x: 100,
    y: 80,
    w: 200,
    h: 120,
    children: [
      chart('a', { x: 0, y: 0, w: 80, h: 40 }),
      chart('b', { x: 150, y: 60, w: 50, h: 60 }),
    ],
  })

  const result = normalizeGroupBounds(group)

  assert.equal(result.changed, false)
  assert.deepEqual([group.x, group.y, group.w, group.h], [100, 80, 200, 120])
  assert.deepEqual(group.children.map((item) => [item.id, item.x, item.y]), [
    ['a', 0, 0],
    ['b', 150, 60],
  ])
})
