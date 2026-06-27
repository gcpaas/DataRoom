# Negative Ruler Guides Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让视觉大屏设计器标尺显示负坐标，并允许用户在可见负坐标区域创建、拖动、编辑和保存参考线。

**Architecture:** 改动集中在 `visual-screen-designer` 的标尺纯函数、标尺覆盖层和页面配置面板。`ruler.ts` 负责坐标换算、刻度生成和参考线数值清洗；`RulerOverlay.vue` 负责拖拽创建/移动的可见范围限制；`ControlPanel.vue` 负责允许负数输入并保留配置。页面配置结构、保存流程、后端接口不变。

**Tech Stack:** Vue 3、TypeScript、Element Plus、Vite、vue3-moveable。

---

## File Structure

- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts`
  - 支持负刻度生成。
  - 拆分参考线清洗：加载/属性面板编辑只清洗为有限整数；拖拽/创建按当前可见视口边界限制。
  - 保持内置吸附线只生成在画布内部。
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue`
  - 创建和拖动参考线时允许负坐标。
  - 只把拖拽结果限制在当前可见工作区对应的画布坐标范围。
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue`
  - 参考线位置输入允许负值。
  - 输入值只做有限数值清洗，不再按画布 `0..宽高` 夹取。
- Verify only: `docs/design/DESIGN.md`
  - 本次不需要改样式；如实施时改了样式，必须检查设计规范并运行 lint。

---

### Task 1: Update Ruler Coordinate Helpers

**Files:**
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts`

- [ ] **Step 1: Inspect existing exported API**

Run:

```bash
rg -n "clampVisualScreenGuidePosition|normalizeGuideList|getRulerTicks|getCanvasCoordinateFromViewportPoint|getViewportPointFromCanvasCoordinate" dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts dataRoomFront/src/dataRoom/visual-screen-designer
```

Expected: current callers are `RulerOverlay.vue`, `ControlPanel.vue`, and `VisualScreenDesigner.vue`.

- [ ] **Step 2: Replace guide clamp with two explicit helpers**

In `dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts`, replace the current `getCanvasLimitByAxis` and `clampVisualScreenGuidePosition` block with:

```ts
export interface VisualScreenGuideBounds {
  min: number
  max: number
}

const normalizeGuidePosition = (position: number, fallback: number = 0) => {
  return Math.round(finiteOrFallback(position, fallback))
}

const normalizeGuideBounds = (bounds: VisualScreenGuideBounds): VisualScreenGuideBounds => {
  const min = finiteOrFallback(bounds.min, 0)
  const max = finiteOrFallback(bounds.max, min)
  return min <= max ? { min, max } : { min: max, max: min }
}

export const normalizeVisualScreenGuidePosition = (position: number, fallback: number = 0) => {
  return normalizeGuidePosition(position, fallback)
}

export const clampVisualScreenGuidePositionToBounds = (position: number, bounds: VisualScreenGuideBounds) => {
  const safeBounds = normalizeGuideBounds(bounds)
  const safePosition = normalizeGuidePosition(position, safeBounds.min)
  return Math.min(safeBounds.max, Math.max(safeBounds.min, safePosition))
}
```

Expected: `clampVisualScreenGuidePosition` no longer exists after later caller updates.

- [ ] **Step 3: Add viewport bounds helper**

In the same file, after `getViewportPointFromCanvasCoordinate`, add:

```ts
export const getVisibleCanvasCoordinateBounds = (
  viewport: DesignerViewportState,
  axis: VisualScreenRulerAxis,
  startViewportPosition: number,
  endViewportPosition: number,
): VisualScreenGuideBounds => {
  const start = getCanvasCoordinateFromViewportPoint(viewport, axis, startViewportPosition)
  const end = getCanvasCoordinateFromViewportPoint(viewport, axis, endViewportPosition)
  return normalizeGuideBounds({ min: start, max: end })
}
```

Expected: callers can compute visible x/y coordinate ranges from the current overlay viewport.

- [ ] **Step 4: Update guide normalization to preserve negative finite values**

In `normalizeGuideList`, change the mapped `position` from the old canvas clamp to:

```ts
position: normalizeVisualScreenGuidePosition(Number(guide.position)),
```

Expected: saved negative reference lines survive `normalizeVisualScreenRulerConfig()`.

- [ ] **Step 5: Update tick generation to include negative values**

In `getRulerTicks`, replace the coordinate range and loop setup with:

```ts
const startCoordinate = getCanvasCoordinateFromViewportPoint(viewport, axis, rulerOffset)
const endCoordinate = getCanvasCoordinateFromViewportPoint(viewport, axis, safeViewportLength)
const minCoordinate = Math.min(startCoordinate, endCoordinate)
const maxCoordinate = Math.max(startCoordinate, endCoordinate)
const firstTick = Math.floor(minCoordinate / step) * step
const ticks: VisualScreenRulerTick[] = []
for (let value = firstTick; value <= maxCoordinate + step; value += step) {
  const tickIndex = Math.round(value / step)
  const major = tickIndex % labelEvery === 0
  ticks.push({
    key: `${axis}-${value}`,
    value,
    viewportPosition: getViewportPointFromCanvasCoordinate(viewport, axis, value),
    size: major ? 12 : 6,
    major,
    label: major ? String(Math.round(value)) : '',
  })
}
```

Expected: no `value < 0` skip remains.

- [ ] **Step 6: Type-check this stage**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: FAIL because `RulerOverlay.vue` and `ControlPanel.vue` still import `clampVisualScreenGuidePosition`. This failure confirms the next tasks need to update callers.

---

### Task 2: Allow Negative Guide Dragging In Ruler Overlay

**Files:**
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue`

- [ ] **Step 1: Update imports**

Replace:

```ts
  clampVisualScreenGuidePosition,
```

with:

```ts
  clampVisualScreenGuidePositionToBounds,
  getVisibleCanvasCoordinateBounds,
```

Expected: the overlay imports the new helpers from `./ruler`.

- [ ] **Step 2: Add visible bounds helper in component script**

After `getRawGuidePositionFromPointer`, add:

```ts
const getVisibleGuideBounds = (axis: VisualScreenGuideAxis) => {
  if (axis === 'vertical') {
    return getVisibleCanvasCoordinateBounds(props.viewport, 'x', RULER_SIZE_PX, props.viewport.viewportWidth)
  }
  return getVisibleCanvasCoordinateBounds(props.viewport, 'y', RULER_SIZE_PX, props.viewport.viewportHeight)
}
```

Expected: vertical reference lines use visible x bounds; horizontal reference lines use visible y bounds.

- [ ] **Step 3: Clamp drag coordinates to visible bounds**

Replace `getGuidePositionFromPointer` with:

```ts
const getGuidePositionFromPointer = (event: PointerEvent, axis: VisualScreenGuideAxis) => {
  const coordinate = getRawGuidePositionFromPointer(event, axis)
  return clampVisualScreenGuidePositionToBounds(coordinate, getVisibleGuideBounds(axis))
}
```

Expected: dragging can produce negative positions when negative coordinates are visible.

- [ ] **Step 4: Rename and update creation hit test**

Replace `isPointerInsideCanvasBounds` with:

```ts
const isPointerInsideVisibleGuideBounds = (event: PointerEvent, axis: VisualScreenGuideAxis) => {
  const point = getPointerViewportPoint(event)
  if (!point) {
    return false
  }
  const position = getRawGuidePositionFromPointer(event, axis)
  const bounds = getVisibleGuideBounds(axis)
  const crossedRuler = axis === 'vertical' ? point.viewportY >= RULER_SIZE_PX : point.viewportX >= RULER_SIZE_PX
  return crossedRuler && position >= bounds.min && position <= bounds.max
}
```

Then update the pointer-up condition:

```ts
if (state.mode === 'create' && isPointerInsideVisibleGuideBounds(event, state.axis)) {
  createGuide(state.axis, position)
}
```

Expected: creating a guide is allowed in visible negative space after crossing the relevant ruler.

- [ ] **Step 5: Run type-check for overlay stage**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: FAIL only if `ControlPanel.vue` still imports the removed clamp helper. There should be no `RulerOverlay.vue` errors.

---

### Task 3: Allow Negative Guide Editing In Control Panel

**Files:**
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue`

- [ ] **Step 1: Update imports**

Replace:

```ts
import { clampVisualScreenGuidePosition, isVisualScreenGuideLocked, normalizeVisualScreenRulerConfig, type VisualScreenGuide, type VisualScreenGuideAxis } from './ruler'
```

with:

```ts
import { isVisualScreenGuideLocked, normalizeVisualScreenGuidePosition, normalizeVisualScreenRulerConfig, type VisualScreenGuide, type VisualScreenGuideAxis } from './ruler'
```

Expected: the panel uses finite numeric normalization instead of canvas clamp.

- [ ] **Step 2: Update panel edit behavior**

Replace `updateGuidePosition` with:

```ts
const updateGuidePosition = (_axis: VisualScreenGuideAxis, guide: VisualScreenGuide, value: number | undefined) => {
  if (isGuideLocked(guide)) {
    return
  }
  guide.position = normalizeVisualScreenGuidePosition(Number(value))
}
```

Expected: `axis` remains accepted because existing template calls pass it, but input editing is no longer clamped to `0..canvasSize`.

- [ ] **Step 3: Remove min/max from vertical guide inputs**

In the vertical guide `el-input-number`, remove:

```vue
:min="0"
:max="basicConfig.size.width"
```

Expected: Element Plus accepts negative x positions.

- [ ] **Step 4: Remove min/max from horizontal guide inputs**

In the horizontal guide `el-input-number`, remove:

```vue
:min="0"
:max="basicConfig.size.height"
```

Expected: Element Plus accepts negative y positions.

- [ ] **Step 5: Run type-check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

---

### Task 4: Verify Behavior And Guard Against Regressions

**Files:**
- Verify: `dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts`
- Verify: `dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue`
- Verify: `dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue`

- [ ] **Step 1: Search for stale clamp references**

Run:

```bash
rg -n "clampVisualScreenGuidePosition|getCanvasLimitByAxis|value < 0|Math\\.max\\(0, getCanvasCoordinateFromViewportPoint|:min=\"0\"|:max=\"basicConfig\\.size\\.(width|height)\"" dataRoomFront/src/dataRoom/visual-screen-designer
```

Expected: no matches for removed ruler clamp behavior in ruler/overlay/panel. Matches outside the ruler feature must be inspected before ignoring.

- [ ] **Step 2: Verify built-in guidelines remain canvas-only**

Run:

```bash
sed -n '100,145p' dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts
```

Expected: `getBuiltInGuidelines()` still starts at `BUILT_IN_GUIDE_INTERVAL_PX` and stops at the non-negative canvas limit; `getVisualScreenMoveableGuidelines()` still pushes user guide positions after built-ins.

- [ ] **Step 3: Run final type-check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 4: Run lint only if styles changed**

If `git diff --name-only` shows changes to `.scss`, style blocks, or CSS-like files, run:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS. If no styles changed, record that lint was not required because this implementation only changed TypeScript logic and template props.

- [ ] **Step 5: Manual browser verification**

Run the front-end dev server:

```bash
cd dataRoomFront
npm run dev
```

Expected: Vite prints a local URL.

Manual checks:

- Open the visual screen designer route for an existing page.
- Pan the canvas left/up until the visible work area includes negative x or y coordinates.
- Confirm horizontal and vertical rulers display negative labels.
- Drag a vertical guide into negative x space and confirm it stays there.
- Drag a horizontal guide into negative y space and confirm it stays there.
- Edit guide positions in the right panel to negative values and confirm the lines move.
- Save and reload the page; negative guide positions remain.
- Confirm built-in snapping still appears only at canvas-internal 50px intervals, while custom negative guides can snap components.

---

### Task 5: Commit Implementation

**Files:**
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts`
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue`
- Modify: `dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue`

- [ ] **Step 1: Review diff**

Run:

```bash
git diff -- dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue
```

Expected: diff only covers negative ruler ticks, negative guide dragging, and negative guide input.

- [ ] **Step 2: Check unrelated worktree changes**

Run:

```bash
git status --short
```

Expected: unrelated existing changes, such as `dataRoomFront/src/dataRoom/page/index.vue`, remain unstaged unless they belong to this task.

- [ ] **Step 3: Stage only implementation files**

Run:

```bash
git add dataRoomFront/src/dataRoom/visual-screen-designer/ruler.ts dataRoomFront/src/dataRoom/visual-screen-designer/RulerOverlay.vue dataRoomFront/src/dataRoom/visual-screen-designer/ControlPanel.vue
```

Expected: only the three implementation files are staged.

- [ ] **Step 4: Commit**

Run:

```bash
git commit -m "feat(front): support negative ruler guides"
```

Expected: commit succeeds.

---

## Self-Review

- Spec coverage: covered negative ruler ticks, negative guide creation/dragging/editing/loading, custom guide snapping, canvas-only built-in guidelines, no back-end changes, no page lifecycle changes.
- Placeholder scan: no placeholder terms are intentionally left in executable steps.
- Type consistency: helper names are consistent across tasks:
  - `normalizeVisualScreenGuidePosition`
  - `clampVisualScreenGuidePositionToBounds`
  - `getVisibleCanvasCoordinateBounds`
