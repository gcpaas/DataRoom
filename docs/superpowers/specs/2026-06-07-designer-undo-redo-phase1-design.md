# Designer Undo/Redo Phase 1 Design

## Context

DataRoom currently has two editor surfaces:

- `PageDesigner`: grid-based dashboard designer at `/dataRoom/pageDesigner/:pageCode`
- `VisualScreenDesigner`: free-layout large-screen designer at `/dataRoom/visualScreenDesigner/:pageCode`

Both editors keep document state mainly in:

- `chartList`
- `basicConfig` or `pageBasicConfig`
- `globalVariable`

The current editor behavior directly mutates component layout state in many event handlers and directly mutates configuration objects in some panels. The previous backup idea stored the full page configuration after each change. That approach is too heavy for frequent editor operations because:

- page payloads grow with component count and nested props
- drag, resize, and rotate operations happen frequently
- full snapshots waste memory and serialization work for small layout edits

Phase 1 only needs in-session undo/redo for structure and layout operations. It does not need persisted history, cross-refresh recovery, or config-panel field history.

## Goals

- Add in-session `undo` and `redo` to both designers without refreshing the page.
- Cover the following operations in Phase 1:
  - add chart
  - delete chart
  - move chart
  - resize chart
  - rotate chart
  - reorder layer
- Keep history entries small by storing reversible operation records instead of full page snapshots.
- Reuse one history model for both designers.
- Keep save behavior unchanged: saving persists current `pageConfig` only, not history stacks.

## Non-Goals

- Do not persist undo/redo history to backend.
- Do not restore history after refresh or re-entering a page.
- Do not record config-panel field changes in Phase 1.
- Do not record page viewport state such as zoom, pan, panel open/close state, or selection state.
- Do not introduce a full command-only editor architecture in this phase.
- Do not redesign component config panels or global variable editing in this phase.

## Scope

### Included

- `PageDesigner.vue`
- `VisualScreenDesigner.vue`
- shared history manager and shared chart-tree helpers
- editor toolbar buttons and keyboard shortcuts for undo/redo
- layer reorder operations based on array order

### Excluded

- `_components/ControlPanel.vue` field edits
- `PageDesigner/ControlPanel.vue` field edits
- `VisualScreenDesigner/ControlPanel.vue` field edits
- `_components/GlobalVariable.vue`
- `TimerConfigDialog.vue`

## Product Rules

### Session-only history

Undo/redo is only valid during the current editor session. When the user refreshes the page, leaves the designer, or reopens the page later, history is cleared.

### No page refresh

Undo and redo only replay local reactive state changes. They must not trigger route navigation or browser refresh.

### Linear history

History is linear, not branching.

Rules:

- `undo` moves one step back in the current history line.
- `redo` re-applies the most recently undone step.
- If the user performs a new editing operation after one or more `undo` actions, `redoStack` must be cleared.

Reason:

- old redo entries describe the abandoned future of the previous history line
- after a new edit, the current state is now on a new branch
- keeping stale redo entries would replay invalid or misleading future operations

This matches mainstream editor behavior in tools such as Figma, Axure, PPT, VS Code, and Word.

### Semantic granularity

History entries are created per user-intent operation, not per reactive field mutation.

Examples:

- one drag gesture ending creates one history entry
- one resize gesture ending creates one history entry
- one rotate gesture ending creates one history entry
- one delete action creates one history entry
- one layer move up/down/to-top/to-bottom creates one history entry

## Why delete history needs parent, index, and full node

Delete undo cannot rely on `id` only.

It must restore:

- what was deleted
- where it belonged
- in what order it belonged

The current chart model is a tree:

- root-level nodes are stored in `chartList`
- container components may store child nodes in `children`
- delete logic is recursive in [dataRoomFront/src/dataroom-packages/_common/_utils.ts](/Users/liuchengbiao/devWork/sts-works/idea-work/gcpaas开源/社区版/DataRoom/dataRoomFront/src/dataroom-packages/_common/_utils.ts:59)

Therefore delete history must record:

- full chart snapshot
- parent location
- original index

Without that information, undo delete would not know:

- the original chart config and nested children
- whether the chart belonged to root `chartList` or a container `children`
- the exact order to restore for layer semantics

## Data Model

Phase 1 history only needs chart-tree structure and layout history.

```ts
interface EditorHistoryState {
  undoStack: HistoryEntry[]
  redoStack: HistoryEntry[]
  isApplyingHistory: boolean
  maxEntries: number
}

type HistoryEntry =
  | AddChartEntry
  | RemoveChartEntry
  | UpdateChartLayoutEntry
  | ReorderChartEntry

interface BaseHistoryEntry {
  id: string
  label: string
  timestamp: number
  source: 'page-designer' | 'visual-screen-designer'
}

interface ChartParentRef {
  parentType: 'root-chart-list' | 'chart-children'
  parentId?: string
}

interface ChartLayoutState {
  x: number
  y: number
  w: number
  h: number
  rotateX: number
  rotateY: number
  rotateZ: number
}

interface AddChartEntry extends BaseHistoryEntry {
  type: 'add-chart'
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

interface RemoveChartEntry extends BaseHistoryEntry {
  type: 'remove-chart'
  parent: ChartParentRef
  index: number
  chart: ChartConfig<unknown>
}

interface UpdateChartLayoutEntry extends BaseHistoryEntry {
  type: 'update-chart-layout'
  chartId: string
  before: ChartLayoutState
  after: ChartLayoutState
}

interface ReorderChartEntry extends BaseHistoryEntry {
  type: 'reorder-chart'
  parent: ChartParentRef
  chartId: string
  beforeIndex: number
  afterIndex: number
}
```

Notes:

- `chart` must be stored as a detached deep copy, not a live reactive reference.
- `UpdateChartLayoutEntry` is used by move, resize, and rotate.
- `ReorderChartEntry` is based on array order, not `z`.

## Layer Ordering Rule

Phase 1 layer ordering must follow list order:

- root layer order uses `chartList`
- container layer order uses `chart.children`

The current codebase defines a `z` field on `ChartConfig`, but it is not the active layer model used by the current editor flow. The current layer panel in [dataRoomFront/src/dataroom-packages/_components/ComponentLayer.vue](/Users/liuchengbiao/devWork/sts-works/idea-work/gcpaas开源/社区版/DataRoom/dataRoomFront/src/dataroom-packages/_components/ComponentLayer.vue:1) reads the chart tree from `canvasInst.chartList.value`.

Therefore Phase 1 reorder history must treat list order as the source of truth.

## Shared Architecture

Add one shared editor-session history module for both designers.

Suggested responsibilities:

### `EditorHistoryManager`

Responsibilities:

- hold `undoStack` and `redoStack`
- push new entries
- clear redo on new edit
- apply undo
- apply redo
- expose `canUndo` and `canRedo`
- guard replay via `isApplyingHistory`

### Chart-tree helper utilities

Responsibilities:

- find a chart and its parent reference
- insert a chart at a specific parent and index
- remove a chart while returning parent, index, and chart snapshot
- reorder a chart within a parent list
- clone chart nodes safely

These helpers should be shared so `PageDesigner` and `VisualScreenDesigner` do not duplicate tree mutation logic.

## Operation Design

### 1. Add chart

When a chart is created:

- create the chart instance as today
- determine its parent location
- insert it into the list
- push one `AddChartEntry`

Undo:

- remove that chart from the recorded parent and index

Redo:

- insert the recorded chart snapshot back into the recorded parent and index

### 2. Delete chart

When a chart is deleted:

- resolve the chart's current parent
- resolve the chart's current index
- clone the full chart node
- remove it from the tree
- push one `RemoveChartEntry`

Undo:

- insert the recorded chart snapshot back into the recorded parent and original index

Redo:

- remove the chart again by id from the recorded parent

### 3. Move chart

Move history is only created at gesture end.

During drag:

- update live visual state only

At drag end:

- capture `before` from the chart state before the gesture
- capture `after` from the final chart state
- if coordinates changed, push one `UpdateChartLayoutEntry`

If `before` and `after` are identical, do not create a history entry.

### 4. Resize chart

Resize history also uses `UpdateChartLayoutEntry`.

At resize end:

- capture `before` and `after`
- compare `x/y/w/h`
- push one history entry only when changed

### 5. Rotate chart

Rotate history also uses `UpdateChartLayoutEntry`.

At rotate end:

- capture `before` and `after`
- compare `rotateX/rotateY/rotateZ`
- if the editor also changes position or size as part of the gesture result, keep them in the same entry

### 6. Reorder layer

Phase 1 should support explicit reorder actions:

- move up
- move down
- move to top
- move to bottom

Each reorder action creates one `ReorderChartEntry`.

Undo:

- move the chart back to `beforeIndex`

Redo:

- move the chart to `afterIndex`

The reorder operation must stay within the same parent list in Phase 1. Cross-parent drag-and-drop is out of scope.

## Editor Integration Points

### `PageDesigner`

Relevant file: [dataRoomFront/src/dataroom-packages/PageDesigner/PageDesigner.vue](/Users/liuchengbiao/devWork/sts-works/idea-work/gcpaas开源/社区版/DataRoom/dataRoomFront/src/dataroom-packages/PageDesigner/PageDesigner.vue)

Phase 1 integration points:

- `addChart`
- `onChartDeleteClick`
- `onMoved`
- `onResized`
- new layer reorder actions

Behavior notes:

- `onMoved` should use current chart layout as `before` and event result as `after`
- `onResized` should use current chart layout as `before` and event result as `after`

### `VisualScreenDesigner`

Relevant file: [dataRoomFront/src/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue](/Users/liuchengbiao/devWork/sts-works/idea-work/gcpaas开源/社区版/DataRoom/dataRoomFront/src/dataroom-packages/VisualScreenDesigner/VisualScreenDesigner.vue)

Phase 1 integration points:

- `addChart`
- `onChartDeleteClick`
- `onDragStart`
- `onDragEnd`
- `onResizeEnd`
- `onRotateEnd`
- new layer reorder actions

Behavior notes:

- store gesture-start layout state when drag starts
- store gesture-start layout state when resize starts if available, otherwise cache current state just before first resize mutation
- store gesture-start layout state when rotate starts if available, otherwise cache current state just before first rotate mutation
- only push history at gesture end

## Keyboard Shortcuts

Supported shortcuts:

- `Cmd/Ctrl + Z`: undo
- `Shift + Cmd/Ctrl + Z`: redo
- `Cmd/Ctrl + Y`: redo

Rules:

- call `preventDefault()` when the shortcut is handled by the editor
- only handle shortcuts when the current focus context belongs to the designer canvas/editor shell
- when focus is inside a normal text input, textarea, or editable field, do not hijack native text undo/redo behavior

## Toolbar Behavior

Both designers should expose visible undo/redo actions near existing editor actions.

Rules:

- place the `undo` and `redo` icon buttons on the top toolbar, immediately to the left of the existing `插入` button
- keep the two buttons adjacent, with `undo` first and `redo` second
- in the current toolbar layout, these actions replace the need for a generic top-level `历史` button in Phase 1
- disable undo when `undoStack` is empty
- disable redo when `redoStack` is empty
- action labels should be stable and user-readable

Phase 1 does not require a full history panel.

## Replay Rules

When applying history:

- set `isApplyingHistory = true`
- do not record new history entries while replaying
- apply the tree or layout mutation
- restore `isApplyingHistory = false`

When a new edit occurs:

- append to `undoStack`
- clear `redoStack`
- trim stack length to `maxEntries`

Recommended `maxEntries`:

- default `100`
- may be raised to `200` later if needed

## State Change Rules

### Changes that must enter history

- add chart
- delete chart
- move chart
- resize chart
- rotate chart
- reorder layer

### Changes that must not enter history

- active chart selection
- left or right panel open state
- component library dialog open state
- zoom percentage
- viewport pan offset
- ruler hover state
- temporary drag preview state
- preview action
- save action itself

## Failure and Safety Rules

- If replay cannot find a required parent container, the operation should fail safely and log an error rather than corrupting the tree.
- If a chart id no longer exists when undoing a layout change, skip the replay and surface a visible warning in development logs.
- History entry creation must use deep-cloned chart snapshots for add/delete to avoid reactive reference pollution.
- Reorder operations must verify target indexes are valid before applying changes.

## Acceptance Criteria

- Users can undo and redo add, delete, move, resize, rotate, and layer reorder operations in both designers during the current session.
- Undo and redo do not refresh the page.
- Drag, resize, and rotate only create one history entry per completed gesture.
- Delete undo restores the full chart node to the original parent and original index.
- Layer reorder undo restores the original order within the same parent list.
- After one or more `undo` actions, any new edit clears `redoStack`.
- Undo and redo buttons correctly reflect enabled and disabled states.
- Save still persists only current page config and does not send history stacks to backend.

## Implementation Plan

### Milestone 1: Shared history foundation

- add shared history entry types
- add `EditorHistoryManager`
- add chart-tree helper utilities for find, clone, insert, remove, reorder
- add shared layout-state helper

### Milestone 2: PageDesigner integration

- wire add/delete history
- wire move/resize history
- add undo/redo buttons and shortcuts
- add layer reorder actions and history

### Milestone 3: VisualScreenDesigner integration

- wire add/delete history
- wire drag/resize/rotate history
- add undo/redo buttons and shortcuts
- add layer reorder actions and history

### Milestone 4: Verification

- verify stacks are cleared correctly
- verify history replay does not create nested history
- verify save payload remains unchanged

## Testing

### Manual checks

- add one component, undo, redo
- delete one root component, undo, redo
- delete one nested child component inside a container, undo, redo
- drag a component several times and verify one undo step per gesture
- resize a component and undo size change
- rotate a component and undo rotation
- reorder layers up/down/top/bottom and undo each action
- perform `undo`, then create a new edit, then verify redo is disabled
- save after several edits and confirm the page config remains correct

### Source-level checks

- chart-tree helper tests for remove/insert/reorder by parent and index
- history manager tests for push, undo, redo, and redo clearing
- layout equality checks to avoid empty history entries

## Open Follow-up for Phase 2

Phase 2 may extend history coverage to:

- config-panel field edits
- page basic config edits
- global variable changes
- timer edits
- ruler and guide edits in `VisualScreenDesigner`

Phase 2 should reuse the same history infrastructure but add finer-grained value patch entries.
