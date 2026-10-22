/// <reference types="node" />

import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { parse } from '@vue/compiler-sfc'

import {
  createDesignerViewport,
  fitDesignerViewportToVisibleArea,
  getDesignerZoomFromWheel,
  getDesignerZoomPercent,
  isDesignerZoomWheelEvent,
  normalizeDesignerViewport,
  panDesignerViewport,
  panDesignerViewportByPointerDelta,
  updateDesignerViewportSize,
  zoomDesignerViewportAroundPoint,
} from './viewport.ts'

const designerSource = readFileSync(new URL('./VisualScreenDesigner.vue', import.meta.url), 'utf8')
const { descriptor } = parse(designerSource)
const designerStyles = descriptor.styles.map((style) => style.content).join('\n')

test('zoom control stays centered in the available canvas rather than the page edge', () => {
  const controlStyles = designerStyles.match(/& \.canvas-zoom-control\s*\{([^{}]+)/)?.[1] ?? ''
  assert.match(designerStyles, /& \.canvas-main\s*\{[^{}]*position: relative;/)
  assert.match(controlStyles, /position: absolute;/)
  assert.match(controlStyles, /left: 50%;/)
  assert.match(controlStyles, /transform: translateX\(-50%\);/)
  assert.match(controlStyles, /bottom: 16px;/)
  assert.match(controlStyles, /max-width: calc\(100% - 32px\);/)
  assert.doesNotMatch(controlStyles, /(?:right|opacity):/)
  assert.doesNotMatch(designerSource, /computedZoomControlStyle|getDesignerZoomControlRightOffset/)
})

test('zoom background is sixty percent transparent without fading its contents', () => {
  const controlStyles = designerStyles.match(/& \.canvas-zoom-control\s*\{([^{}]+)/)?.[1] ?? ''
  assert.match(controlStyles, /background-color: color-mix\(in srgb, var\(--el-fill-color-blank\) 40%, transparent\);/)
  assert.doesNotMatch(controlStyles, /opacity:/)
})

const size = { canvasWidth: 1920, canvasHeight: 1080, viewportWidth: 1270, viewportHeight: 800 }
const rulerInsets = { top: 40, right: 16, bottom: 16, left: 40 }
const fit = () => fitDesignerViewportToVisibleArea(createDesignerViewport(size), rulerInsets)

for (const viewportWidth of [1270, 1280]) {
  test(`ordinary wheel preserves exact fit scale and ruler offsets at width ${viewportWidth}`, () => {
    const viewport = fitDesignerViewportToVisibleArea(
      createDesignerViewport({ ...size, viewportWidth }),
      rulerInsets,
    )
    assert.notEqual(viewport.scale, getDesignerZoomPercent(viewport.scale) / 100)
    const first = panDesignerViewport(viewport, 0, 100)
    assert.equal(first.scale, viewport.scale)
    assert.deepEqual(first, viewport)
    assert.deepEqual(panDesignerViewport(first, 40, -100), viewport)
  })
}

test('ordinary wheel preserves fit with the ruler hidden', () => {
  const viewport = fitDesignerViewportToVisibleArea(createDesignerViewport(size))
  assert.deepEqual(panDesignerViewport(viewport, 30, 100), viewport)
})

test('zero and non-finite wheel deltas do not change a fitted viewport', () => {
  const viewport = fit()
  assert.deepEqual(panDesignerViewport(viewport, 0, 0), viewport)
  assert.deepEqual(panDesignerViewport(viewport, Number.NaN, Number.POSITIVE_INFINITY), viewport)
})

test('pointer panning preserves fit scale and ruler offsets', () => {
  const viewport = fit()
  assert.deepEqual(panDesignerViewportByPointerDelta(viewport, 50, -100), viewport)
})

test('overflowing axes pan normally without rounding the scale and clamp at both edges', () => {
  const viewport = createDesignerViewport({ ...size, scale: 1.23456, panX: -100, panY: -100 })
  const next = panDesignerViewport(viewport, 30, 40)
  assert.equal(next.scale, 1.23456)
  assert.equal(next.panX, -130)
  assert.equal(next.panY, -140)
  const end = panDesignerViewport(next, 10000, 10000)
  assert.equal(end.panX, size.viewportWidth - size.canvasWidth * viewport.scale)
  assert.equal(end.panY, size.viewportHeight - size.canvasHeight * viewport.scale)
  const start = panDesignerViewport(next, -10000, -10000)
  assert.equal(start.panX, 0)
  assert.equal(start.panY, 0)
  assert.deepEqual(panDesignerViewportByPointerDelta(viewport, -30, -40), next)
})

test('panning only moves the overflowing axis and retains the fitted axis offset', () => {
  const viewport = { ...fit(), canvasWidth: 3000, panX: -100 }
  const next = panDesignerViewport(viewport, 30, 40)
  assert.equal(next.panX, -130)
  assert.equal(next.panY, viewport.panY)
  assert.equal(next.scale, viewport.scale)
})

test('best-fit resize synchronization after wheel is stable', () => {
  const viewport = fit()
  const afterWheel = panDesignerViewport(viewport, 0, 100)
  const afterSync = fitDesignerViewportToVisibleArea(
    updateDesignerViewportSize(afterWheel, size),
    rulerInsets,
  )
  assert.deepEqual(afterSync, afterWheel)
})

test('normalization preserves fractional scale while enforcing valid zoom bounds', () => {
  const viewport = fit()
  assert.equal(normalizeDesignerViewport(viewport).scale, viewport.scale)
  assert.equal(normalizeDesignerViewport({ ...viewport, scale: 0.001 }).scale, 0.01)
  assert.equal(normalizeDesignerViewport({ ...viewport, scale: 5 }).scale, 4)
  for (const scale of [0, -1, Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(normalizeDesignerViewport({ ...viewport, scale }).scale, 1)
  }
})

test('modifier wheel still zooms in five-percent steps', () => {
  assert.equal(isDesignerZoomWheelEvent({ ctrlKey: false, metaKey: false }, 'MacIntel'), false)
  assert.equal(isDesignerZoomWheelEvent({ ctrlKey: false, metaKey: true }, 'MacIntel'), true)
  assert.equal(isDesignerZoomWheelEvent({ ctrlKey: true, metaKey: false }, 'Win32'), true)
  assert.equal(getDesignerZoomFromWheel(63, 100), 58)
  assert.equal(getDesignerZoomFromWheel(63, -100), 68)
  const viewport = zoomDesignerViewportAroundPoint(fit(), 0.58)
  assert.equal(viewport.scale, 0.58)
})
