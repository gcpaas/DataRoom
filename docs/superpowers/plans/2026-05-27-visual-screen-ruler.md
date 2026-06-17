# Visual Screen Ruler Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Axure-like rulers and persisted guide-line management to `/dataRoom/visualScreenDesigner/:pageCode`.

**Architecture:** Add a focused ruler model helper for defaults, normalization, projection math, and Moveable guideline bridging. Add a ruler overlay component that renders editor-only rulers and guide lines over the canvas viewport without entering the scaled `.canvas-content`. Extend the Visual Screen page control panel to edit `pageConfig.basicConfig.ruler`.

**Tech Stack:** Vue 3 Composition API, TypeScript, Element Plus, vue3-moveable, vue3-selecto, Vite source-level tests.

---

### Task 1: Ruler Model And Coordinate Helpers

**Files:**

- Modify: `dataRoomFront/src/dataRoom/PageDesigner/type/VisualScreenPageBasicConfig.ts`
- Create: `dataRoomFront/src/dataRoom/VisualScreenDesigner/ruler.ts`
- Create: `dataRoomFront/src/dataRoom/VisualScreenDesigner/ruler.spec.ts`

- [ ] **Step 1: Add failing tests for ruler defaults, normalization, projection, and guideline bridging**

Create `ruler.spec.ts` with assertions for missing config defaults, invalid arrays, clamping, lock semantics, viewport projection, and Moveable guideline output.

- [ ] **Step 2: Run the ruler test and verify it fails**

Run: `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/ruler.spec.ts`

Expected: FAIL because `ruler.ts` does not exist.

- [ ] **Step 3: Add `VisualScreenRulerConfig`, `VisualScreenGuide`, and helper functions**

Implement `DEFAULT_VISUAL_SCREEN_RULER_CONFIG`, `normalizeVisualScreenRulerConfig`, `isVisualScreenGuideLocked`, `getCanvasCoordinateFromViewportPoint`, `getViewportPointFromCanvasCoordinate`, `clampVisualScreenGuidePosition`, `getVisualScreenMoveableGuidelines`, and tick generation helpers in `ruler.ts`.

- [ ] **Step 4: Extend `VisualScreenPageBasicConfig`**

Import and add `ruler?: VisualScreenRulerConfig` under `basicConfig`, next to `zoom` and `timers`.

- [ ] **Step 5: Run the ruler test and verify it passes**

Run: `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/ruler.spec.ts`

Expected: PASS.

### Task 2: Ruler Overlay Component

**Files:**

- Create: `dataRoomFront/src/dataRoom/VisualScreenDesigner/RulerOverlay.vue`
- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/VisualScreenDesigner.vue`
- Test: `dataRoomFront/src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

- [ ] **Step 1: Add source-level checks for overlay integration**

Extend `visualScreenDesignerZoom.spec.ts` to assert that `RulerOverlay` is imported/rendered, receives `designerViewport`, emits interaction state, and that Moveable guidelines come from computed ruler-aware arrays.

- [ ] **Step 2: Run source-level test and verify it fails**

Run: `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

Expected: FAIL because overlay is not integrated yet.

- [ ] **Step 3: Implement `RulerOverlay.vue`**

Render top and left rulers, mouse coordinate indicators, persisted guides, guide drag creation, guide dragging, guide deletion by double click for unlocked guides, and interaction start/end events. Use only Element Plus CSS variables and scoped business styles.

- [ ] **Step 4: Integrate overlay into `VisualScreenDesigner.vue`**

Normalize `basicConfig.ruler` defaults, render overlay inside `.canvas-main`, add `isRulerInteracting`, include it in pan/Selecto/Moveable disable logic, and compute Moveable guidelines from built-in 50px guides plus visible user guides.

- [ ] **Step 5: Run source-level test and verify it passes**

Run: `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

Expected: PASS.

### Task 3: Page Configuration Panel

**Files:**

- Modify: `dataRoomFront/src/dataRoom/VisualScreenDesigner/ControlPanel.vue`
- Test: `dataRoomFront/src/dataRoom/VisualScreenDesigner/ruler.spec.ts`

- [ ] **Step 1: Add panel controls**

Add a "标尺 / 参考线" section with Element Plus controls for ruler visibility, guide visibility, global lock, clear unlocked, vertical guide list, and horizontal guide list. Coordinate inputs clamp through ruler helpers.

- [ ] **Step 2: Run tests**

Run: `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/ruler.spec.ts`

Expected: PASS.

### Task 4: Verification

**Files:**

- Existing frontend files touched above.

- [ ] **Step 1: Run focused tests**

Run:

- `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/ruler.spec.ts`
- `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/viewport.spec.ts`
- `cd dataRoomFront && npx tsx src/dataRoom/VisualScreenDesigner/visualScreenDesignerZoom.spec.ts`

Expected: all PASS.

- [ ] **Step 2: Run type check**

Run: `cd dataRoomFront && npm run type-check`

Expected: PASS, unless unrelated pre-existing type errors appear. Report any failures with exact output.

- [ ] **Step 3: Inspect style compliance**

Search changed Vue and TS files for hard-coded UI colors, `--dr-*`, `!important`, negative letter spacing, and forbidden Element Plus internal selectors.

Expected: no new violations from ruler work.
