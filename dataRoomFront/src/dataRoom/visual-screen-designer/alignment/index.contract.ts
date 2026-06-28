/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'

import { applyVisualScreenAlignment, getVisualScreenAlignmentItems, type VisualScreenAlignmentChart } from './index.ts'

const chart = (id: string, x: number, y: number, w: number, h: number): VisualScreenAlignmentChart => ({ id, x, y, w, h })

test('aligns selected charts to the left edge of the selection bounds', () => {
  const charts = [chart('a', 20, 10, 40, 30), chart('b', 80, 50, 20, 30)]
  const result = applyVisualScreenAlignment(charts, 'left')
  assert.equal(result.changed, true)
  assert.deepEqual(charts.map((item) => item.x), [20, 20])
})

test('aligns selected charts to the horizontal center of the selection bounds', () => {
  const charts = [chart('a', 0, 0, 20, 20), chart('b', 80, 20, 40, 20)]
  applyVisualScreenAlignment(charts, 'horizontal-center')
  assert.deepEqual(charts.map((item) => item.x), [50, 40])
})

test('aligns selected charts to the right edge of the selection bounds', () => {
  const charts = [chart('a', 0, 0, 20, 20), chart('b', 80, 20, 40, 20)]
  applyVisualScreenAlignment(charts, 'right')
  assert.deepEqual(charts.map((item) => item.x), [100, 80])
})

test('aligns selected charts to top, vertical center, and bottom bounds', () => {
  const topCharts = [chart('a', 0, 10, 20, 20), chart('b', 80, 60, 40, 40)]
  applyVisualScreenAlignment(topCharts, 'top')
  assert.deepEqual(topCharts.map((item) => item.y), [10, 10])

  const centerCharts = [chart('a', 0, 10, 20, 20), chart('b', 80, 60, 40, 40)]
  applyVisualScreenAlignment(centerCharts, 'vertical-center')
  assert.deepEqual(centerCharts.map((item) => item.y), [45, 35])

  const bottomCharts = [chart('a', 0, 10, 20, 20), chart('b', 80, 60, 40, 40)]
  applyVisualScreenAlignment(bottomCharts, 'bottom')
  assert.deepEqual(bottomCharts.map((item) => item.y), [80, 60])
})

test('distributes charts horizontally with fixed outer charts', () => {
  const charts = [chart('a', 0, 0, 10, 20), chart('b', 30, 0, 20, 20), chart('c', 100, 0, 10, 20)]
  applyVisualScreenAlignment(charts, 'horizontal-distribute')
  assert.deepEqual(charts.map((item) => item.x), [0, 45, 100])
})

test('distributes charts vertically with fixed outer charts', () => {
  const charts = [chart('a', 0, 0, 10, 10), chart('b', 0, 30, 10, 20), chart('c', 0, 100, 10, 10)]
  applyVisualScreenAlignment(charts, 'vertical-distribute')
  assert.deepEqual(charts.map((item) => item.y), [0, 45, 100])
})

test('allows negative spacing during distribution', () => {
  const charts = [chart('a', 0, 0, 80, 10), chart('b', 50, 0, 80, 10), chart('c', 100, 0, 80, 10)]
  applyVisualScreenAlignment(charts, 'horizontal-distribute')
  assert.deepEqual(charts.map((item) => item.x), [0, 50, 100])
})

test('does not change distribution with fewer than three charts', () => {
  const charts = [chart('a', 0, 0, 10, 10), chart('b', 40, 0, 10, 10)]
  const result = applyVisualScreenAlignment(charts, 'horizontal-distribute')
  assert.equal(result.changed, false)
  assert.deepEqual(charts.map((item) => item.x), [0, 40])
})

test('reports no-op alignment when positions do not change', () => {
  const charts = [chart('a', 0, 0, 10, 10), chart('b', 0, 20, 20, 10)]
  const result = applyVisualScreenAlignment(charts, 'left')
  assert.equal(result.changed, false)
})

test('returns toolbar items with distribution hidden until three selected charts', () => {
  assert.deepEqual(
    getVisualScreenAlignmentItems(2)
      .filter((item) => item.kind === 'distribution')
      .map((item) => item.command),
    [],
  )
  assert.deepEqual(
    getVisualScreenAlignmentItems(3)
      .filter((item) => item.kind === 'distribution')
      .map((item) => item.command),
    ['horizontal-distribute', 'vertical-distribute'],
  )
})
