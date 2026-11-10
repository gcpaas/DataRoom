/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'

import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { getVisualScreenChartWrapperStyle } from './index.ts'

const chart = (overrides: Partial<ChartConfig<unknown>> = {}): ChartConfig<unknown> => ({
  id: 'chart-a',
  i: 'chart-a',
  type: 'DrText',
  title: 'chart-a-title',
  x: 120,
  y: 80,
  w: 300,
  h: 160,
  z: 7,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  props: {},
  dataset: { code: '', fields: {}, script: '', params: {} },
  behaviors: {},
  ...overrides,
})

test('computes wrapper layout from visual screen chart geometry', () => {
  const style = getVisualScreenChartWrapperStyle(chart())

  assert.equal(style.position, 'absolute')
  assert.equal(style.transform, 'translate(120px,80px)')
  assert.equal(style.width, '300px')
  assert.equal(style.height, '160px')
  assert.equal(style.zIndex, 7)
})

test('preserves negative layer values', () => {
  for (const z of [-1, -100, -2147483648]) {
    assert.equal(getVisualScreenChartWrapperStyle(chart({ z })).zIndex, z)
  }
})

// 静态契约防止层叠隔离被移除，不代替浏览器真实命中测试。
for (const [file, container] of [
  ['../VisualScreenDesigner.vue', 'canvas-capture-content'],
  ['../preview/VisualScreenPreview.vue', 'canvas-content'],
]) {
  test(`${file} isolates chart layers and keeps the background non-interactive`, () => {
    const source = readFileSync(new URL(file!, import.meta.url), 'utf8')
    const containerStyle = source.match(new RegExp(`\\.${container}\\s*\\{([^}]+)\\}`))?.[1]
    const backgroundStyle = source.match(/\.canvas-background-layer\s*\{([^}]+)\}/)?.[1]
    assert.match(containerStyle ?? '', /isolation:\s*isolate/)
    assert.match(backgroundStyle ?? '', /pointer-events:\s*none/)
  })
}

test('keeps rotation in the wrapper transform', () => {
  const style = getVisualScreenChartWrapperStyle(chart({ rotateX: 10, rotateY: 20, rotateZ: 30 }))

  assert.equal(style.transform, 'translate(120px,80px) rotateX(10deg) rotateY(20deg) rotateZ(30deg)')
})
