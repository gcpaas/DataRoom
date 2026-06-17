# VisualScreenDesigner Space Pan Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Space + left mouse drag panning to the VisualScreenDesigner editor canvas.

**Architecture:** Keep the feature inside `VisualScreenDesigner.vue` and reuse the existing `designerViewport.panX/panY` state. Add one small viewport helper for mouse-delta panning so direction and bounds are tested independently from Vue.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, vue3-moveable, vue3-selecto, existing lightweight `npx tsx` specs, Element Plus design variables.

---

### Task 1: Viewport Helper

**Files:**
- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts`
- Test: `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.spec.ts`

- [ ] **Step 1: Write the failing helper test**

Add assertions showing direct drag deltas move the canvas in the same direction:

```ts
const mouseDraggedViewport = panDesignerViewportByPointerDelta(viewport, 120, 80)
assertClose(mouseDraggedViewport.panX, 120, 'mouse drag right should move the canvas right')
assertClose(mouseDraggedViewport.panY, 80, 'mouse drag down should move the canvas down')
```

- [ ] **Step 2: Run the viewport spec and verify RED**

Run: `npx tsx src/dataRoom/VisualScreenDesigner/viewport.spec.ts` from `dataRoomFront`.
Expected: FAIL because `panDesignerViewportByPointerDelta` is not exported.

- [ ] **Step 3: Implement the helper**

Add to `viewport.ts`:

```ts
export const panDesignerViewportByPointerDelta = (
  viewport: DesignerViewportState,
  deltaX: number,
  deltaY: number,
) => {
  const safeDeltaX = finiteOrFallback(deltaX, 0)
  const safeDeltaY = finiteOrFallback(deltaY, 0)
  return normalizeDesignerViewport({
    ...viewport,
    panX: viewport.panX + safeDeltaX,
    panY: viewport.panY + safeDeltaY,
  })
}
```

- [ ] **Step 4: Run the viewport spec and verify GREEN**

Run: `npx tsx src/dataRoom/VisualScreenDesigner/viewport.spec.ts` from `dataRoomFront`.
Expected: PASS.

### Task 2: VisualScreenDesigner Interaction

**Files:**
- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`
- Test: `dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

- [ ] **Step 1: Write the failing static interaction test**

Add assertions that the SFC includes the Space key state, pointer handlers, helper call, and Moveable/Selecto disable conditions:

```ts
assert(source.includes('spacePressed'), 'designer should track Space key state for canvas panning')
assert(source.includes('onCanvasPanPointerDown'), 'designer should start canvas panning from pointerdown')
assert(source.includes('onCanvasPanPointerMove'), 'designer should update canvas panning from pointermove')
assert(source.includes('panDesignerViewportByPointerDelta'), 'designer should pan by pointer movement deltas')
assert(source.includes(':draggable="!isCanvasPanModeActive"'), 'Moveable dragging should be disabled during canvas pan mode')
assert(source.includes(':selectByClick="!isCanvasPanModeActive"'), 'Selecto click selection should be disabled during canvas pan mode')
```

- [ ] **Step 2: Run the static spec and verify RED**

Run: `npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts` from `dataRoomFront`.
Expected: FAIL because the Space + pointer handlers are missing.

- [ ] **Step 3: Implement Space + pointer panning**

In `VisualScreenDesigner.vue`, add state and handlers:

```ts
const spacePressed = ref(false)
const isCanvasPanning = ref(false)
const canvasPanPointerId = ref<number | null>(null)
const lastCanvasPanPoint = ref<DesignerViewportPoint | null>(null)
const isCanvasPanModeActive = computed(() => spacePressed.value || isCanvasPanning.value)
```

Use `window` key listeners, `.canvas-main` pointer listeners, `setPointerCapture`, `releasePointerCapture`, and `panDesignerViewportByPointerDelta`. End panning on mouse release, pointer cancel, lost capture, Space key release, window blur, and component unmount.

- [ ] **Step 4: Run static spec and type-check**

Run: `npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts` from `dataRoomFront`.
Expected: PASS.

Run: `npm run type-check` from `dataRoomFront`.
Expected: PASS.

### Task 3: Final Verification

**Files:**
- Verify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`
- Verify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/viewport.ts`

- [ ] **Step 1: Run focused specs**

Run:

```bash
npx tsx src/dataRoom/VisualScreenDesigner/viewport.spec.ts
npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts
```

Expected: both PASS.

- [ ] **Step 2: Run frontend type check**

Run: `npm run type-check` from `dataRoomFront`.
Expected: PASS.

- [ ] **Step 3: Inspect style constraints**

Run: `rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(|--dr-|!important|letter-spacing:\\s*-" dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`.
Expected: no new violations from the Space pan implementation.
