/// <reference types="node" />

import assert from 'node:assert/strict'
import test from 'node:test'

import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import * as selectionState from './index.ts'
import {
  getVisualScreenControlPanelSelectionState,
  getRenderableSelectedChartIds,
  getVisualScreenRenderableSelectedTargets,
  isVisualScreenMoveableEventTarget,
  shouldStopVisualScreenSelectoDragStart,
  shouldHandleVisualScreenChartTreeClick,
  shouldToggleVisualScreenChartTreeClickSelection,
  getVisualScreenScopedChartIdByElement,
  getVisualScreenScopedChartIdsByElements,
  normalizeVisualScreenSelectedChartIds,
} from './index.ts'

type IframeInteractionSelectionState = typeof selectionState & {
  shouldBlockVisualScreenIframeInteraction?: (mode: 'designer' | 'preview', chartType: string, iframeInteractionEnabled: boolean) => boolean
}

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

test('keeps selected ids unique and scoped to visible charts only', () => {
  assert.deepEqual(
    normalizeVisualScreenSelectedChartIds(['a', 'hidden', 'a', 'missing', 'b'], [
      chart('a'),
      chart('hidden', { hide: true }),
      chart('b'),
    ]),
    ['a', 'b'],
  )
})

test('removes a hidden selected group so floating toolbar actions cannot target invisible DOM', () => {
  assert.deepEqual(
    normalizeVisualScreenSelectedChartIds(['group'], [
      chart('group', {
        type: 'DrGroup',
        hide: true,
        children: [chart('child')],
      }),
    ]),
    [],
  )
})

test('returns an empty selection when every selected chart is hidden or outside the current scope', () => {
  assert.deepEqual(normalizeVisualScreenSelectedChartIds(['hidden', 'outside'], [chart('hidden', { hide: true }), chart('visible')]), [])
})

test('resolves selected chart ids from wrapper elements and their descendants', () => {
  const wrapper = {
    getAttribute: (name: string) => {
      if (name === 'data-dr-id') {
        return 'chart-a'
      }
      if (name === 'data-dr-scope-child') {
        return 'true'
      }
      return null
    },
    closest: () => wrapper,
  } as unknown as Element
  const child = {
    getAttribute: () => null,
    closest: () => wrapper,
  } as unknown as Element

  assert.equal(getVisualScreenScopedChartIdByElement(wrapper), 'chart-a')
  assert.equal(getVisualScreenScopedChartIdByElement(child), 'chart-a')
  assert.deepEqual(getVisualScreenScopedChartIdsByElements([child, wrapper]), ['chart-a'])
})

test('keeps toolbar executable counts tied to rendered selected targets', () => {
  assert.deepEqual(getRenderableSelectedChartIds(['a', 'b', 'c'], ['a', 'c']), ['a', 'c'])
  assert.deepEqual(getRenderableSelectedChartIds(['a', 'b'], []), [])
})

test('mirrors application selection to rendered targets without stale Selecto targets', () => {
  const target = (id: string) =>
    ({
      getAttribute: (name: string) => (name === 'data-dr-id' ? id : null),
    }) as Element
  const a = target('a')
  const b = target('b')
  const c = target('c')
  const d = target('d')

  assert.deepEqual(getVisualScreenRenderableSelectedTargets(['c'], [a, b, c, d]), [c])
  assert.deepEqual(getVisualScreenRenderableSelectedTargets(['d', 'c'], [a, b, c, d]), [d, c])
})

test('lets chart click own modifier clicks when Selecto only owns drag selection', () => {
  assert.equal(shouldHandleVisualScreenChartTreeClick({ ctrlKey: true, metaKey: false }), true)
  assert.equal(shouldHandleVisualScreenChartTreeClick({ ctrlKey: false, metaKey: true }), true)
  assert.equal(shouldHandleVisualScreenChartTreeClick({ ctrlKey: false, metaKey: false }), true)
  assert.equal(shouldToggleVisualScreenChartTreeClickSelection({ ctrlKey: true, metaKey: false }), true)
  assert.equal(shouldToggleVisualScreenChartTreeClickSelection({ ctrlKey: false, metaKey: true }), true)
  assert.equal(shouldToggleVisualScreenChartTreeClickSelection({ ctrlKey: false, metaKey: false }), false)
})

test('stops Selecto drag start from selected chart targets so Moveable owns direct dragging', () => {
  assert.equal(shouldStopVisualScreenSelectoDragStart('a', ['a', 'b', 'c']), true)
  assert.equal(shouldStopVisualScreenSelectoDragStart('a', ['a', 'b', 'c'], { ctrlKey: true }), true)
  assert.equal(shouldStopVisualScreenSelectoDragStart('a', ['a', 'b', 'c'], { metaKey: true }), true)
  assert.equal(shouldStopVisualScreenSelectoDragStart('d', ['a', 'b', 'c']), false)
  assert.equal(shouldStopVisualScreenSelectoDragStart(null, ['a', 'b', 'c']), false)
})

test('blocks iframe content only while designer iframe interaction is disabled', () => {
  const shouldBlock = (selectionState as IframeInteractionSelectionState).shouldBlockVisualScreenIframeInteraction

  assert.equal(typeof shouldBlock, 'function')
  if (!shouldBlock) {
    return
  }

  assert.equal(shouldBlock('designer', 'DrIframe', false), true)
  assert.equal(shouldBlock('designer', 'DrIframe', true), false)
  assert.equal(shouldBlock('designer', 'DrHtml', false), true)
  assert.equal(shouldBlock('designer', 'DrHtml', true), false)
  assert.equal(shouldBlock('designer', 'DrText', false), false)
  assert.equal(shouldBlock('preview', 'DrIframe', false), false)
  assert.equal(shouldBlock('preview', 'DrHtml', false), false)
})

test('treats Moveable control layers as Moveable-owned interaction targets', () => {
  const moveableAreaTarget = {
    closest: (selector: string) => (selector.includes('[class*="moveable-"]') ? moveableAreaTarget : null),
  } as unknown as Element
  const moveablePaddingTarget = {
    closest: (selector: string) => (selector.includes('[class*="moveable-"]') ? moveablePaddingTarget : null),
  } as unknown as Element
  const moveableEdgeDraggableTarget = {
    closest: (selector: string) => (selector.includes('[class*="moveable-"]') ? moveableEdgeDraggableTarget : null),
  } as unknown as Element
  const normalTarget = {
    closest: () => null,
  } as unknown as Element

  assert.equal(isVisualScreenMoveableEventTarget(moveableAreaTarget), true)
  assert.equal(isVisualScreenMoveableEventTarget(moveablePaddingTarget), true)
  assert.equal(isVisualScreenMoveableEventTarget(moveableEdgeDraggableTarget), true)
  assert.equal(isVisualScreenMoveableEventTarget(normalTarget), false)
  assert.equal(isVisualScreenMoveableEventTarget(null), false)
})

test('keeps an already open component panel visible when selection becomes multi-chart', () => {
  assert.deepEqual(
    getVisualScreenControlPanelSelectionState({
      selectedChartCount: 2,
      panelVisible: true,
      showingPageSettings: false,
    }),
    {
      panelVisible: true,
      showingPageSettings: false,
    },
  )
})

test('does not reopen a manually closed component panel when selection becomes multi-chart', () => {
  assert.deepEqual(
    getVisualScreenControlPanelSelectionState({
      selectedChartCount: 2,
      panelVisible: false,
      showingPageSettings: false,
    }),
    {
      panelVisible: false,
      showingPageSettings: false,
    },
  )
})
