# Designer Undo/Redo Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add maintainable in-session undo/redo for add, delete, move, resize, rotate, and layer reorder in both designers without page refresh.

**Architecture:** Implement a shared editor-history module plus shared chart-tree helpers, then wire both designers to record semantic history entries at operation boundaries. Keep config-panel edits out of scope so Phase 1 stays focused on chart structure and layout state.

**Tech Stack:** Vue 3, TypeScript, node:test, Element Plus, vue-grid-layout-v3, vue3-moveable

---

### Task 1: Shared history and chart-tree utilities

**Files:**
- Create: `dataRoomFront/src/dataroom-packages/_common/editor-history.ts`
- Create: `dataRoomFront/src/dataroom-packages/_common/editor-history.spec.ts`

- [ ] Define chart layout snapshot, parent reference, and history entry types for add/delete/layout/reorder.
- [ ] Write failing `node:test` cases for push/undo/redo, redo clearing, remove+restore by parent/index, and reorder replay.
- [ ] Implement minimal pure TypeScript helpers for cloning chart nodes, finding parents, inserting/removing nodes, and replaying history entries.
- [ ] Run the new history tests until they pass.

### Task 2: Canvas instance history and layer APIs

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/PageDesigner/type/CanvasInst.ts`
- Modify: `dataRoomFront/src/dataroom-packages/hooks/use-canvas-inst/index.ts`
- Modify: `dataRoomFront/src/dataroom-packages/_components/ComponentLayer.vue`

- [ ] Extend `CanvasInst` with optional undo/redo state and reorder operations required by the layer panel.
- [ ] Keep preview-mode `CanvasInst` safe by using no-op defaults where history is absent.
- [ ] Add layer action UI hooks for move up/down/to top/to bottom without introducing config-history coupling.

### Task 3: PageDesigner integration

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/PageDesigner/PageDesigner.vue`

- [ ] Record add and delete history in `addChart` and `onChartDeleteClick`.
- [ ] Record move and resize history from `onMoved` and `onResized` using before/after layout snapshots.
- [ ] Add top-toolbar undo/redo icon buttons immediately left of `插入`.
- [ ] Remove or replace the placeholder `历史` entry so the toolbar reflects actual behavior.
- [ ] Wire keyboard shortcuts for undo/redo with proper focus guards and `preventDefault()`.

### Task 4: VisualScreenDesigner integration

**Files:**
- Modify: `dataRoomFront/src/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue`

- [ ] Record add and delete history in `addChart` and `onChartDeleteClick`.
- [ ] Capture gesture-start layout state and record move/resize/rotate history only on gesture end.
- [ ] Add top-toolbar undo/redo icon buttons immediately left of `插入`.
- [ ] Remove or replace the placeholder `历史` entry so the toolbar reflects actual behavior.
- [ ] Wire keyboard shortcuts for undo/redo with proper focus guards and `preventDefault()`.

### Task 5: Verification

**Files:**
- Test: `dataRoomFront/src/dataroom-packages/_common/editor-history.spec.ts`

- [ ] Run the new shared history tests.
- [ ] Run `npm run type-check` in `dataRoomFront`.
- [ ] If type-check passes, run targeted lint only if the touched files introduce lint findings that need cleanup.
- [ ] Manually inspect changed toolbar placement and ensure undo/redo buttons sit left of `插入` in both designers.
