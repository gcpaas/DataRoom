# VisualScreenDesigner Viewport Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace VisualScreenDesigner's left-top anchored zoom with a viewport model that zooms around the current visible canvas center and preserves user-defined canvas sizes.

**Architecture:** Add a focused `viewport.ts` helper for zoom, pan, and viewport math. `VisualScreenDesigner.vue` owns DOM measurements and user input, while the helper owns scale, pan, clamp, and center-anchor calculations. The first delivery keeps right-drag and space-drag out of scope, but uses `panX` / `panY` so those interactions can be added without changing component coordinates.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Element Plus, vue3-moveable, vue3-selecto, `npx jiti` for lightweight TypeScript spec files, `vue-tsc` for type checking.

---

## File Structure

- Create `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts`
  - Owns zoom constants, percent-to-scale helpers, viewport state, pan clamp, centered zoom, wheel zoom, and right-panel zoom-control offset.
- Create `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts`
  - Fast math tests for viewport behavior without Vue or DOM.
- Modify `dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`
  - Replace scrollbar-centered zoom compensation with viewport state.
  - Bind `transform: translate(...) scale(...)` to the canvas content.
  - Read visible canvas size through a `ResizeObserver`.
  - Keep component data in logical canvas coordinates.
- Modify `dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`
  - Convert the structural spec from scrollbar-centered zoom assertions to viewport-model assertions.
- Delete `dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.ts`
  - Superseded by `viewport.ts`.
- Delete `dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.spec.ts`
  - Superseded by `viewport.spec.ts`.

## Task 1: Add Viewport Math Helper

**Files:**
- Create: `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts`
- Create: `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts`

- [ ] **Step 1: Write the failing viewport math spec**

Create `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts`:

```ts
import {
  clampDesignerZoomPercent,
  createDesignerViewport,
  getDesignerViewportCanvasPoint,
  getDesignerZoomByStep,
  getDesignerZoomControlRightOffset,
  getDesignerZoomFromWheel,
  getDesignerZoomPercent,
  getDesignerZoomScale,
  panDesignerViewport,
  updateDesignerViewportSize,
  zoomDesignerViewportAroundPoint,
  ZOOM_DEFAULT_PERCENT,
  ZOOM_MAX_PERCENT,
  ZOOM_MIN_PERCENT,
} from './viewport'

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const assertClose = (actual: number, expected: number, message: string) => {
  if (Math.abs(actual - expected) > 0.000001) {
    throw new Error(`${message}: expected ${expected}, received ${actual}`)
  }
}

assert(ZOOM_MIN_PERCENT === 1, 'viewport zoom should use a positive minimum percent')
assert(ZOOM_DEFAULT_PERCENT === 100, 'viewport zoom should default to 100 percent')
assert(ZOOM_MAX_PERCENT === 400, 'viewport zoom should clamp at 400 percent')
assert(clampDesignerZoomPercent(-1) === 1, 'zoom percent should clamp below minimum')
assert(clampDesignerZoomPercent(0) === 1, 'zoom percent should not allow zero scale')
assert(clampDesignerZoomPercent(401) === 400, 'zoom percent should clamp above maximum')
assert(clampDesignerZoomPercent(42.6) === 43, 'zoom percent should round fractional values')
assert(getDesignerZoomScale(75) === 0.75, 'zoom scale should map percent to decimal scale')
assert(getDesignerZoomPercent(0.75) === 75, 'zoom percent should map decimal scale to percent')
assert(getDesignerZoomByStep(50, 'in') === 51, 'plus button should increase zoom precisely by 1')
assert(getDesignerZoomByStep(50, 'out') === 49, 'minus button should decrease zoom precisely by 1')
assert(getDesignerZoomFromWheel(50, -120) === 55, 'wheel up should zoom in by wheel step')
assert(getDesignerZoomFromWheel(50, 120) === 45, 'wheel down should zoom out by wheel step')
assert(getDesignerZoomFromWheel(398, -1) === 400, 'wheel zoom should clamp at max')
assert(getDesignerZoomFromWheel(2, 1) === 1, 'wheel zoom should clamp at positive min')
assert(getDesignerZoomControlRightOffset(true) === 316, 'zoom control should sit 16px left of the 300px right panel')
assert(getDesignerZoomControlRightOffset(false) === 16, 'zoom control should sit 16px from page right when panel is hidden')

const viewport = createDesignerViewport({
  canvasWidth: 2000,
  canvasHeight: 1200,
  viewportWidth: 1000,
  viewportHeight: 800,
  scale: 1,
})
assert(viewport.panX === 0, 'larger canvas should start at the left edge')
assert(viewport.panY === 0, 'larger canvas should start at the top edge')

const center = { clientX: 500, clientY: 400 }
const centerBeforeZoom = getDesignerViewportCanvasPoint(viewport, center)
const zoomedIn = zoomDesignerViewportAroundPoint(viewport, 2, center)
const centerAfterZoom = getDesignerViewportCanvasPoint(zoomedIn, center)
assertClose(centerAfterZoom.x, centerBeforeZoom.x, 'zooming in should preserve center canvas x')
assertClose(centerAfterZoom.y, centerBeforeZoom.y, 'zooming in should preserve center canvas y')
assertClose(zoomedIn.panX, -500, 'zooming in should translate canvas horizontally around center')
assertClose(zoomedIn.panY, -400, 'zooming in should translate canvas vertically around center')

const zoomedOut = zoomDesignerViewportAroundPoint(zoomedIn, 1, center)
const centerAfterZoomOut = getDesignerViewportCanvasPoint(zoomedOut, center)
assertClose(centerAfterZoomOut.x, centerBeforeZoom.x, 'zooming out should preserve center canvas x')
assertClose(centerAfterZoomOut.y, centerBeforeZoom.y, 'zooming out should preserve center canvas y')
assertClose(zoomedOut.panX, 0, 'zooming back to 100 percent should restore horizontal pan')
assertClose(zoomedOut.panY, 0, 'zooming back to 100 percent should restore vertical pan')

const customCanvas = createDesignerViewport({
  canvasWidth: 1366,
  canvasHeight: 768,
  viewportWidth: 1000,
  viewportHeight: 600,
  scale: 1,
})
const customZoomed = zoomDesignerViewportAroundPoint(customCanvas, 1.5, { clientX: 500, clientY: 300 })
const customCenter = getDesignerViewportCanvasPoint(customZoomed, { clientX: 500, clientY: 300 })
assertClose(customCenter.x, 500, 'custom canvas width should use current viewport center x')
assertClose(customCenter.y, 300, 'custom canvas height should use current viewport center y')

const smallCanvas = createDesignerViewport({
  canvasWidth: 400,
  canvasHeight: 200,
  viewportWidth: 1000,
  viewportHeight: 600,
  scale: 1,
})
assertClose(smallCanvas.panX, 300, 'small canvas should be centered horizontally')
assertClose(smallCanvas.panY, 200, 'small canvas should be centered vertically')

const panned = panDesignerViewport(viewport, 300, 200)
assertClose(panned.panX, -300, 'positive wheel delta x should move canvas left')
assertClose(panned.panY, -200, 'positive wheel delta y should move canvas up')

const clampedPan = panDesignerViewport(viewport, 5000, 5000)
assertClose(clampedPan.panX, -1000, 'pan should clamp to the right canvas edge')
assertClose(clampedPan.panY, -400, 'pan should clamp to the bottom canvas edge')

const resized = updateDesignerViewportSize(zoomedIn, {
  canvasWidth: 1200,
  canvasHeight: 900,
  viewportWidth: 1000,
  viewportHeight: 800,
})
assert(resized.canvasWidth === 1200, 'viewport should keep updated custom canvas width')
assert(resized.canvasHeight === 900, 'viewport should keep updated custom canvas height')
assert(resized.viewportWidth === 1000, 'viewport should keep updated visible width')
assert(resized.viewportHeight === 800, 'viewport should keep updated visible height')
assert(resized.panX <= 0, 'resized larger canvas should not drift past the left edge')
assert(resized.panY <= 0, 'resized larger canvas should not drift past the top edge')
```

- [ ] **Step 2: Run the viewport spec to verify it fails**

Run from `dataRoomFront`:

```bash
npx jiti src/dataRoom/VisualScreenDesigner/viewport.spec.ts
```

Expected: FAIL with an import error for `./viewport`.

- [ ] **Step 3: Implement the viewport helper**

Create `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts`:

```ts
export const ZOOM_MIN_PERCENT = 1
export const ZOOM_MAX_PERCENT = 400
export const ZOOM_DEFAULT_PERCENT = 100
export const ZOOM_STEP_PERCENT = 1
export const ZOOM_WHEEL_STEP_PERCENT = 5
export const ZOOM_CONTROL_OFFSET_PX = 16
export const RIGHT_PANEL_WIDTH_PX = 300

export type DesignerZoomDirection = 'in' | 'out'

export interface DesignerViewportPoint {
  clientX: number
  clientY: number
}

export interface DesignerViewportState {
  scale: number
  panX: number
  panY: number
  canvasWidth: number
  canvasHeight: number
  viewportWidth: number
  viewportHeight: number
}

export interface DesignerViewportSizeInput {
  canvasWidth: number
  canvasHeight: number
  viewportWidth: number
  viewportHeight: number
  scale?: number
  panX?: number
  panY?: number
}

const clampNumber = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value))
}

const positiveOrFallback = (value: number, fallback: number) => {
  return Number.isFinite(value) && value > 0 ? value : fallback
}

export const clampDesignerZoomPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return ZOOM_MAX_PERCENT
  }
  return Math.min(ZOOM_MAX_PERCENT, Math.max(ZOOM_MIN_PERCENT, Math.round(value)))
}

export const getDesignerZoomScale = (percent: number) => clampDesignerZoomPercent(percent) / 100

export const getDesignerZoomPercent = (scale: number) => clampDesignerZoomPercent(scale * 100)

export const getDesignerZoomByStep = (
  currentPercent: number,
  direction: DesignerZoomDirection,
  step: number = ZOOM_STEP_PERCENT,
) => {
  const delta = direction === 'in' ? step : -step
  return clampDesignerZoomPercent(currentPercent + delta)
}

export const getDesignerZoomFromWheel = (currentPercent: number, deltaY: number) => {
  const direction: DesignerZoomDirection = deltaY < 0 ? 'in' : 'out'
  return getDesignerZoomByStep(currentPercent, direction, ZOOM_WHEEL_STEP_PERCENT)
}

export const getDesignerZoomControlRightOffset = (rightPanelVisible: boolean) => {
  return rightPanelVisible ? RIGHT_PANEL_WIDTH_PX + ZOOM_CONTROL_OFFSET_PX : ZOOM_CONTROL_OFFSET_PX
}

export const normalizeDesignerViewport = (viewport: DesignerViewportState): DesignerViewportState => {
  const scale = positiveOrFallback(viewport.scale, getDesignerZoomScale(ZOOM_DEFAULT_PERCENT))
  const canvasWidth = positiveOrFallback(viewport.canvasWidth, 1)
  const canvasHeight = positiveOrFallback(viewport.canvasHeight, 1)
  const viewportWidth = Math.max(0, positiveOrFallback(viewport.viewportWidth, 0))
  const viewportHeight = Math.max(0, positiveOrFallback(viewport.viewportHeight, 0))
  const scaledCanvasWidth = canvasWidth * scale
  const scaledCanvasHeight = canvasHeight * scale

  const horizontalPan =
    viewportWidth > 0 && scaledCanvasWidth <= viewportWidth
      ? (viewportWidth - scaledCanvasWidth) / 2
      : clampNumber(viewport.panX, Math.min(0, viewportWidth - scaledCanvasWidth), 0)
  const verticalPan =
    viewportHeight > 0 && scaledCanvasHeight <= viewportHeight
      ? (viewportHeight - scaledCanvasHeight) / 2
      : clampNumber(viewport.panY, Math.min(0, viewportHeight - scaledCanvasHeight), 0)

  return {
    scale,
    panX: horizontalPan,
    panY: verticalPan,
    canvasWidth,
    canvasHeight,
    viewportWidth,
    viewportHeight,
  }
}

export const createDesignerViewport = (input: DesignerViewportSizeInput): DesignerViewportState => {
  return normalizeDesignerViewport({
    scale: input.scale ?? getDesignerZoomScale(ZOOM_DEFAULT_PERCENT),
    panX: input.panX ?? 0,
    panY: input.panY ?? 0,
    canvasWidth: input.canvasWidth,
    canvasHeight: input.canvasHeight,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
  })
}

export const updateDesignerViewportSize = (
  viewport: DesignerViewportState,
  size: Pick<DesignerViewportSizeInput, 'canvasWidth' | 'canvasHeight' | 'viewportWidth' | 'viewportHeight'>,
) => {
  return normalizeDesignerViewport({
    ...viewport,
    ...size,
  })
}

export const getDesignerViewportCenterPoint = (viewport: DesignerViewportState): DesignerViewportPoint => {
  return {
    clientX: viewport.viewportWidth / 2,
    clientY: viewport.viewportHeight / 2,
  }
}

export const getDesignerViewportCanvasPoint = (
  viewport: DesignerViewportState,
  point: DesignerViewportPoint,
) => {
  const scale = positiveOrFallback(viewport.scale, getDesignerZoomScale(ZOOM_DEFAULT_PERCENT))
  return {
    x: (point.clientX - viewport.panX) / scale,
    y: (point.clientY - viewport.panY) / scale,
  }
}

export const zoomDesignerViewportAroundPoint = (
  viewport: DesignerViewportState,
  nextScale: number,
  anchor: DesignerViewportPoint,
) => {
  const scale = positiveOrFallback(nextScale, getDesignerZoomScale(ZOOM_MIN_PERCENT))
  const anchorCanvasPoint = getDesignerViewportCanvasPoint(viewport, anchor)

  return normalizeDesignerViewport({
    ...viewport,
    scale,
    panX: anchor.clientX - anchorCanvasPoint.x * scale,
    panY: anchor.clientY - anchorCanvasPoint.y * scale,
  })
}

export const panDesignerViewport = (
  viewport: DesignerViewportState,
  deltaX: number,
  deltaY: number,
) => {
  return normalizeDesignerViewport({
    ...viewport,
    panX: viewport.panX - deltaX,
    panY: viewport.panY - deltaY,
  })
}
```

Keep the existing `zoom.ts` and `zoom.spec.ts` files in place during this task. `VisualScreenDesigner.vue` still imports `./zoom` until Task 2.

- [ ] **Step 4: Run the viewport spec to verify it passes**

Run from `dataRoomFront`:

```bash
npx jiti src/dataRoom/VisualScreenDesigner/viewport.spec.ts
```

Expected: PASS with no output.

- [ ] **Step 5: Commit the viewport helper**

```bash
git add dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts
git commit -m "feat(designer): add viewport zoom math"
```

## Task 2: Wire VisualScreenDesigner To The Viewport Model

**Files:**
- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`
- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`
- Delete: `dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.ts`
- Delete: `dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.spec.ts`

- [ ] **Step 1: Write the failing structural spec**

Replace `dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts` with:

```ts
declare const require: (id: string) => {
  readFileSync: (path: URL, encoding: 'utf-8') => string
}

const { readFileSync } = require('node:fs')

const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(message)
  }
}

const source = readFileSync(new URL('./VisualScreenDesigner.vue', import.meta.url), 'utf-8')

assert(source.includes("from './viewport'"), 'VisualScreenDesigner should use shared viewport helpers')
assert(source.includes('createDesignerViewport'), 'VisualScreenDesigner should create a viewport state object')
assert(source.includes('zoomDesignerViewportAroundPoint'), 'zoom changes should use viewport anchor math')
assert(source.includes('getDesignerViewportCenterPoint'), 'zoom anchor should be the visible viewport center')
assert(source.includes('panDesignerViewport'), 'non-ctrl wheel should pan the viewport through the shared helper')
assert(source.includes('updateDesignerViewportSize'), 'canvas and viewport size changes should normalize viewport state')
assert(source.includes('ResizeObserver'), 'designer viewport should react to visible canvas size changes')
assert(source.includes('ref="canvasViewportRef"'), 'visible canvas area should expose a viewport DOM ref')
assert(source.includes('ref="canvasContainer"'), 'Selecto container should use the transformed canvas content ref')
assert(source.includes('@wheel="onCanvasWheel"'), 'canvas zoom wheel handler must be bound on canvas area only')
assert(!source.includes("window.addEventListener('wheel'"), 'wheel zoom must not be registered globally on window')
assert(!source.includes("document.addEventListener('wheel'"), 'wheel zoom must not be registered globally on document')
assert(source.includes('event.ctrlKey'), 'wheel zoom should require Ctrl on Windows and macOS')
assert(source.includes('event.preventDefault()'), 'canvas wheel should prevent browser/page zoom and preserve canvas navigation')
assert(source.includes('class="canvas-zoom-control"'), 'VisualScreenDesigner should render a floating zoom control')
assert(source.includes('type="range"'), 'floating zoom control should display zoom with a thin range control')
assert(source.includes(':min="ZOOM_MIN_PERCENT"'), 'zoom slider should use the viewport minimum')
assert(source.includes(':max="ZOOM_MAX_PERCENT"'), 'zoom slider should use the viewport maximum')
assert(source.includes('computedZoomRangeStyle'), 'zoom range should show progress with a controlled thin track')
assert(source.includes('@click="decreaseDesignerZoom"'), 'zoom control should provide precise minus zoom')
assert(source.includes('@click="increaseDesignerZoom"'), 'zoom control should provide precise plus zoom')
assert(!source.includes('circle size="small"'), 'zoom precise controls should not render circular plus or minus buttons')
assert(source.includes('computedCanvasContentStyle'), 'canvas content style should be computed from viewport state')
assert(source.includes('translate(${designerViewport.value.panX}px, ${designerViewport.value.panY}px) scale(${designerZoomScale.value})'), 'canvas transform should apply viewport pan and scale')
assert(source.includes('canvasWidth.value'), 'canvas width should come from the current basic config')
assert(source.includes('canvasHeight.value'), 'canvas height should come from the current basic config')
assert(!source.includes('getDesignerZoomCenteredScrollPosition'), 'scroll compensation helper should not remain in viewport model')
assert(!source.includes('canvasScrollbarRef'), 'viewport model should not depend on Element Plus scrollbar refs')
assert(!source.includes('setScrollLeft'), 'viewport model should not drive zoom by setting scrollbar left')
assert(!source.includes('setScrollTop'), 'viewport model should not drive zoom by setting scrollbar top')
assert(source.includes(':zoom="designerZoomScale"'), 'Moveable should receive the current viewport scale')
assert(source.includes('moveableRef.value?.updateRect()'), 'zoom and viewport changes should refresh Moveable')
assert(source.includes(':style="computedZoomControlStyle"'), 'zoom control should use dynamic fixed placement')
assert(source.includes("bottom: '16px'"), 'zoom control should stay fixed 16px above the viewport bottom')
assert(source.includes('getDesignerZoomControlRightOffset(rightControlPanelShow.value)'), 'zoom control should avoid the right config panel by 16px')
assert(source.includes('position: fixed;'), 'zoom control should not scroll away with the canvas')
assert(!source.includes('transparent'), 'zoom control styles should avoid hardcoded color keywords')
```

- [ ] **Step 2: Run the structural spec to verify it fails**

Run from `dataRoomFront`:

```bash
npx jiti src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: FAIL because `VisualScreenDesigner.vue` still imports `./zoom` or still references `canvasScrollbarRef`.

- [ ] **Step 3: Update imports and viewport state in `VisualScreenDesigner.vue`**

Apply these script changes:

```ts
import { computed, type ComputedRef, type CSSProperties, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
```

Replace the `./zoom` import with:

```ts
import {
  createDesignerViewport,
  getDesignerViewportCenterPoint,
  getDesignerZoomByStep,
  getDesignerZoomControlRightOffset,
  getDesignerZoomFromWheel,
  getDesignerZoomPercent,
  getDesignerZoomScale,
  panDesignerViewport,
  updateDesignerViewportSize,
  zoomDesignerViewportAroundPoint,
  ZOOM_DEFAULT_PERCENT,
  ZOOM_MAX_PERCENT,
  ZOOM_MIN_PERCENT,
  ZOOM_STEP_PERCENT,
} from './viewport'
```

Replace the current `canvasScrollbarRef` declaration with:

```ts
const canvasViewportRef = ref<HTMLElement | null>(null)
```

After `basicConfig` is created, add the viewport state:

```ts
const canvasWidth = computed(() => basicConfig.value.size?.width || defaultBasicConfig.size.width)
const canvasHeight = computed(() => basicConfig.value.size?.height || defaultBasicConfig.size.height)
const designerViewport = ref(
  createDesignerViewport({
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value,
    viewportWidth: 0,
    viewportHeight: 0,
    scale: getDesignerZoomScale(ZOOM_DEFAULT_PERCENT),
  }),
)
const designerZoomScale = computed(() => designerViewport.value.scale)
const designerZoomPercent = computed(() => getDesignerZoomPercent(designerViewport.value.scale))
```

Remove the old `const canvasWidth`, `const canvasHeight`, `const designerZoomScale`, and `designerZoomPercent = ref(...)` declarations so each name exists once.

- [ ] **Step 4: Replace old scroll-based zoom functions with viewport functions**

Remove `getCanvasScrollbarWrap`, `preserveCanvasViewportCenter`, and `setDesignerZoomPercent`.

Add these functions in the same area where the removed zoom functions lived:

```ts
let canvasResizeObserver: ResizeObserver | undefined

const updateMoveableRect = () => {
  nextTick(() => {
    moveableRef.value?.updateRect()
  })
}

const syncDesignerViewportSize = () => {
  const rect = canvasViewportRef.value?.getBoundingClientRect()
  designerViewport.value = updateDesignerViewportSize(designerViewport.value, {
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value,
    viewportWidth: rect?.width || 0,
    viewportHeight: rect?.height || 0,
  })
  updateMoveableRect()
}

const setDesignerZoomPercent = (value: number) => {
  const nextScale = getDesignerZoomScale(value)
  designerViewport.value = zoomDesignerViewportAroundPoint(
    designerViewport.value,
    nextScale,
    getDesignerViewportCenterPoint(designerViewport.value),
  )
  updateMoveableRect()
}

const decreaseDesignerZoom = () => {
  setDesignerZoomPercent(getDesignerZoomByStep(designerZoomPercent.value, 'out'))
}

const increaseDesignerZoom = () => {
  setDesignerZoomPercent(getDesignerZoomByStep(designerZoomPercent.value, 'in'))
}

const onCanvasWheel = (event: WheelEvent) => {
  event.preventDefault()
  if (event.ctrlKey) {
    setDesignerZoomPercent(getDesignerZoomFromWheel(designerZoomPercent.value, event.deltaY))
    return
  }
  designerViewport.value = panDesignerViewport(designerViewport.value, event.deltaX, event.deltaY)
  updateMoveableRect()
}
```

Keep `onDesignerZoomRangeInput`, but make sure it calls `setDesignerZoomPercent(Number(target.value))`.

- [ ] **Step 5: Update computed styles and watchers**

Replace `computedCanvasScalerStyle` with no code; it is no longer needed.

Update `computedZoomRangeStyle` so it uses the computed percent:

```ts
const computedZoomRangeStyle = computed<CSSProperties>(() => {
  const progress = `${(designerZoomPercent.value / ZOOM_MAX_PERCENT) * 100}%`
  return {
    background: `linear-gradient(to right, var(--el-color-primary) 0%, var(--el-color-primary) ${progress}, var(--el-border-color) ${progress}, var(--el-border-color) 100%)`,
  }
})
```

Update `computedCanvasContentStyle`:

```ts
const computedCanvasContentStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,
    transform: `translate(${designerViewport.value.panX}px, ${designerViewport.value.panY}px) scale(${designerZoomScale.value})`,
    transformOrigin: 'left top',
  }
  const background = basicConfig.value.background
  if (!background) {
    return styles
  }
  if (background.fill === 'color' && background.color) {
    styles.backgroundColor = background.color
  } else if (background.fill === 'image' && background.url) {
    styles.backgroundImage = `url(${getResourceUrl(background.url)})`
    styles.backgroundRepeat = background.repeat || 'no-repeat'
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    if (background.opacity !== undefined && background.opacity !== 100) {
      styles.opacity = background.opacity / 100
    }
    if (background.color) {
      styles.backgroundColor = background.color
    }
  }
  return styles
})
```

Replace the old `watch(designerZoomPercent, ...)` with:

```ts
watch([canvasWidth, canvasHeight], () => {
  nextTick(syncDesignerViewportSize)
})

watch([leftToolPanelShow, rightControlPanelShow], () => {
  nextTick(syncDesignerViewportSize)
})
```

- [ ] **Step 6: Update mounted and unmounted lifecycle**

Update `onMounted` so the canvas refs are direct Vue refs and the resize observer keeps viewport dimensions current:

```ts
onMounted(() => {
  const code: string = route.params.pageCode as string
  nextTick(() => {
    syncDesignerViewportSize()
    if (canvasViewportRef.value) {
      canvasResizeObserver = new ResizeObserver(() => {
        syncDesignerViewportSize()
      })
      canvasResizeObserver.observe(canvasViewportRef.value)
    }
  })
  pageApi.getPageConfig(code, 'design').then((res) => {
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    globalVariable.value = res.pageConfig?.globalVariableList || []
    if (res.pageConfig?.basicConfig) {
      const loaded = res.pageConfig.basicConfig as Partial<VisualScreenPageBasicConfig>
      basicConfig.value = {
        background: { ...defaultBasicConfig.background, ...loaded.background },
        size: { ...defaultBasicConfig.size, ...loaded.size },
        timers: loaded.timers || [],
      }
      nextTick(syncDesignerViewportSize)
    }
  })
})

onBeforeUnmount(() => {
  canvasResizeObserver?.disconnect()
})
```

- [ ] **Step 7: Update the template canvas structure**

Replace the canvas body under `<div class="canvas-main" ...>` with this structure:

```vue
<div class="canvas-main" id="canvas-main" ref="canvasViewportRef" @wheel="onCanvasWheel">
  <div class="canvas-viewport">
    <div ref="canvasContainer" class="canvas-content" :style="computedCanvasContentStyle">
      <div
        class="chart-wrapper"
        v-for="item in chartList"
        :key="item.id"
        :id="item.id"
        :data-dr-id="item.id"
        :style="computedChartStyle(item)"
        @contextmenu="(e: MouseEvent) => onRightClick(e, item)"
      >
        <component :is="getComponent(item.type)" :chart="item"></component>
      </div>
      <Moveable
        ref="moveableRef"
        :draggable="true"
        :rotatable="true"
        :resizable="true"
        :target="moveableTargets"
        :zoom="designerZoomScale"
        :bounds="{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }"
        :snappable="true"
        :snap-directions="{
          top: true,
          left: true,
          bottom: true,
          right: true,
          center: true,
          middle: true,
        }"
        :verticalGuidelines="verticalGuidelines"
        :horizontalGuidelines="horizontalGuidelines"
        :max-snap-element-guideline-distance="70"
        :element-snap-directions="{
          top: true,
          left: true,
          bottom: true,
          right: true,
          center: true,
          middle: true,
        }"
        :render-directions="['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']"
        @drag="onDrag"
        @resize="onResize"
        @rotate="onRotate"
        @dragStart="onDragStart"
        @dragEnd="onDragEnd"
        @resizeEnd="onResizeEnd"
        @rotateEnd="onRotateEnd"
      />
      <VueSelecto
        :container="canvasContainer"
        :selectableTargets="['.chart-wrapper']"
        :selectByClick="true"
        :selectFromInside="false"
        :continueSelect="false"
        :toggleContinueSelect="'shift'"
        :hitRate="100"
        :ratio="0"
        @dragStart="onSelectDragStart"
        @selectEnd="onSelectEnd"
      />
    </div>
  </div>
  <div class="canvas-zoom-control" :style="computedZoomControlStyle" role="group" aria-label="画布缩放">
    <button class="zoom-step-button" type="button" aria-label="缩小画布" title="缩小画布" @click="decreaseDesignerZoom">
      <el-icon><Minus /></el-icon>
    </button>
    <input
      class="zoom-range"
      type="range"
      :value="designerZoomPercent"
      :min="ZOOM_MIN_PERCENT"
      :max="ZOOM_MAX_PERCENT"
      :step="ZOOM_STEP_PERCENT"
      :style="computedZoomRangeStyle"
      aria-label="画布缩放比例"
      @input="onDesignerZoomRangeInput"
    />
    <button class="zoom-step-button" type="button" aria-label="放大画布" title="放大画布" @click="increaseDesignerZoom">
      <el-icon><Plus /></el-icon>
    </button>
    <span class="zoom-value">{{ designerZoomPercent }}%</span>
  </div>
</div>
```

- [ ] **Step 8: Update canvas styles**

Remove `.canvas-scrollbar`, `.canvas-scroll-content`, and `.canvas-scaler` rules.

Use these canvas viewport rules:

```scss
& .canvas-main {
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
}

& .canvas-viewport {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

& .canvas-content {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}
```

Keep the existing `.canvas-zoom-control`, `.zoom-step-button`, `.zoom-range`, and `.zoom-value` rules unchanged.

- [ ] **Step 9: Run specs for the component wiring**

Delete the superseded files after `VisualScreenDesigner.vue` imports `./viewport`:

```text
dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.ts
dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.spec.ts
```

Run from `dataRoomFront`:

```bash
npx jiti src/dataRoom/VisualScreenDesigner/viewport.spec.ts
npx jiti src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: both commands PASS with no output.

- [ ] **Step 10: Commit the component wiring**

```bash
git add dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
git add -u dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.ts \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/zoom.spec.ts
git commit -m "feat(designer): use viewport-centered canvas zoom"
```

## Task 3: Verify And Document Manual Checks

**Files:**
- Modify: no source file unless verification exposes a defect.

- [ ] **Step 1: Run targeted specs**

Run from `dataRoomFront`:

```bash
npx jiti src/dataRoom/VisualScreenDesigner/viewport.spec.ts
npx jiti src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: both commands PASS with no output.

- [ ] **Step 2: Run frontend type check**

Run from `dataRoomFront`:

```bash
npm run type-check
```

Expected: PASS with `vue-tsc --build` completing successfully.

- [ ] **Step 3: Run lint only if type check passes**

Run from `dataRoomFront`:

```bash
npm run lint
```

Expected: PASS. ESLint may rewrite files because the project script includes `--fix`; inspect `git diff` after it finishes.

- [ ] **Step 4: Start the dev server for manual validation**

Run from `dataRoomFront`:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 5: Manually validate the designer**

Open the VisualScreenDesigner route in the running app:

```text
http://127.0.0.1:5173/#/dataRoom/visualScreenDesigner/test
```

Check these behaviors:

- The zoom control starts at `100%`.
- Clicking `+` keeps the currently visible canvas center anchored.
- Clicking `-` keeps the currently visible canvas center anchored.
- Dragging the range input keeps the currently visible canvas center anchored.
- `Ctrl + wheel` over the canvas zooms in or out around the visible center.
- Wheel without Ctrl pans the canvas and does not zoom.
- A selected component's Moveable box stays aligned after zooming.
- Changing the page canvas size in the right settings panel recenters or clamps the viewport based on the new custom size.

- [ ] **Step 6: Stop the dev server**

Stop the Vite process with `Ctrl+C` in the terminal session running `npm run dev`.

Expected: dev server process exits.

- [ ] **Step 7: Commit lint or verification fixes**

If `npm run lint` changed files or verification required fixes, commit only the changed planned files:

```bash
git add dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts \
  dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts
git commit -m "chore(designer): verify viewport zoom"
```

If no files changed after verification, do not create an empty commit.

## Self-Review Notes

- Spec coverage: Task 1 implements viewport math, positive zoom minimum, custom canvas dimensions, center anchoring, pan, and size normalization. Task 2 wires the model into VisualScreenDesigner and keeps Moveable on the current scale. Task 3 covers type check, lint, and manual designer validation.
- Placeholder scan: this plan contains concrete paths, commands, expected results, and code snippets for each code-changing step.
- Type consistency: helper names are consistent across tests, implementation, and Vue wiring: `createDesignerViewport`, `zoomDesignerViewportAroundPoint`, `panDesignerViewport`, `updateDesignerViewportSize`, and `getDesignerViewportCenterPoint`.
