# Visual Screen Designer Ruler Design

## Context

`/dataRoom/visualScreenDesigner/:pageCode` is the pixel-level large-screen designer. It already supports canvas zoom, canvas panning, Selecto selection, and Moveable-based dragging, resizing, rotating, and snapping.

The new ruler feature adds Axure-like horizontal and vertical rulers, user-created guide lines, and guide management. The feature is editor-only and must not affect preview rendering.

## Goals

- Show a horizontal ruler at the top of the canvas viewport and a vertical ruler at the left of the canvas viewport.
- Keep ruler ticks and labels synchronized with the designer canvas coordinate system while zooming and panning.
- Show mouse position indicators on the rulers while the pointer is over the canvas viewport.
- Allow users to drag guide lines from rulers:
  - Drag from the top horizontal ruler to create a vertical guide at an X coordinate.
  - Drag from the left vertical ruler to create a horizontal guide at a Y coordinate.
- Allow guide lines to participate in Moveable snapping.
- Allow users to show, hide, lock, clear, delete, and precisely edit guide lines.
- Persist ruler settings and guide lines under `pageConfig.basicConfig.ruler`.
- Preserve compatibility with current Moveable, Selecto, zoom, and pan behavior.

## Non-Goals

- Do not render rulers or guide lines in preview mode.
- Do not introduce a third-party ruler or guide-line library.
- Do not replace Moveable snapping with a custom snapping engine.
- Do not change existing chart position, size, rotation, or page publishing data structures.
- Do not add theme-specific colors or custom design tokens.

## Data Model

The ruler configuration is stored under `pageConfig.basicConfig.ruler`, at the same level as `pageConfig.basicConfig.zoom` and `pageConfig.basicConfig.timers`.

```ts
interface VisualScreenRulerConfig {
  visible: boolean
  guidesVisible: boolean
  guidesLocked: boolean
  verticalGuides: VisualScreenGuide[]
  horizontalGuides: VisualScreenGuide[]
}

interface VisualScreenGuide {
  id: string
  position: number
  locked: boolean
}
```

Field meanings:

- `visible`: Shows or hides the top and left rulers. When hidden, ruler mouse-position indicators are also hidden.
- `guidesVisible`: Shows or hides user-created guide lines. When hidden, guide data is retained, but user guide lines are not displayed and are not passed to Moveable for snapping.
- `guidesLocked`: Globally locks all guide lines. Locked guides still display and still participate in Moveable snapping, but cannot be dragged, deleted, or edited by coordinate input.
- `verticalGuides`: Vertical guide-line list. Each entry represents `x = position` in canvas coordinates.
- `horizontalGuides`: Horizontal guide-line list. Each entry represents `y = position` in canvas coordinates.
- `id`: Stable guide identifier used for rendering, updates, and deletion.
- `position`: Canvas coordinate in px. It is independent of current zoom or pan.
- `locked`: Per-guide lock. A guide is treated as locked when either `guidesLocked` or the guide's own `locked` value is true.

Old pages that do not contain `basicConfig.ruler` use default ruler settings when loaded.

Default settings:

```ts
{
  visible: true,
  guidesVisible: true,
  guidesLocked: false,
  verticalGuides: [],
  horizontalGuides: [],
}
```

## UI Behavior

### Ruler Layout

- The horizontal ruler is fixed to the top edge of the canvas viewport.
- The vertical ruler is fixed to the left edge of the canvas viewport.
- The top-left corner contains a ruler corner block.
- The ruler layer is positioned over the viewport, not inside `.canvas-content`, so it is not transformed by the canvas scale transform.
- The actual canvas content remains inside the existing pan and zoom transform container.

### Tick Rendering

- Ruler ticks are generated from canvas coordinates and projected to viewport coordinates using the current `designerViewport.panX`, `designerViewport.panY`, and `designerZoomScale`.
- Tick labels show canvas coordinates, not screen coordinates.
- Tick density adapts to zoom level so labels remain readable.
- Tick rendering uses Element Plus CSS variables and follows `docs/design/DESIGN.md`:
  - background: `var(--el-fill-color-light)`
  - tick lines: `var(--el-border-color)`
  - labels: `var(--el-text-color-secondary)`
  - active position: `var(--el-color-primary)` with opacity
  - labels use mono 10px and tabular numbers

### Mouse Position

- While the pointer is inside the canvas viewport, the ruler layer shows the current X position on the horizontal ruler and current Y position on the vertical ruler.
- The displayed position uses canvas coordinates.
- The indicator follows pan and zoom without changing persisted state.

### Guide Creation

- Dragging down from the horizontal ruler creates a vertical guide.
- Dragging right from the vertical ruler creates a horizontal guide.
- During drag, a temporary guide preview follows the pointer.
- Releasing inside the canvas bounds creates a guide at the computed canvas coordinate.
- Releasing outside valid canvas bounds cancels creation.
- If `guidesLocked` is enabled, guide creation is disabled.

### Guide Editing

- Existing unlocked guides can be dragged to a new coordinate.
- Locked guides cannot be dragged.
- Dragging a guide outside the canvas bounds does not create invalid persisted coordinates.
- Selected or hovered guides expose their coordinate in the page configuration panel.
- The page configuration panel supports precise coordinate input.
- Coordinate edits clamp to the canvas width for vertical guides and canvas height for horizontal guides.

### Guide Visibility, Locking, and Clearing

- Users can toggle ruler visibility.
- Users can toggle guide visibility separately from ruler visibility.
- Users can globally lock or unlock all guides.
- Users can lock or unlock a single guide.
- Users can delete an unlocked single guide.
- Clearing guides removes only unlocked guides by default. Locked guides are preserved.

## Configuration Panel

The existing Visual Screen page configuration panel adds a "Ruler / Guides" section.

Controls:

- Ruler visibility switch.
- Guide visibility switch.
- Global guide lock switch.
- Clear unlocked guides action.
- Vertical guide list with coordinate input, lock toggle, and delete action.
- Horizontal guide list with coordinate input, lock toggle, and delete action.

Element Plus form components keep their default internal styles. Business styles only manage spacing, grouping, and scroll layout.

## Moveable Compatibility

The current `Moveable` instance already accepts `verticalGuidelines` and `horizontalGuidelines`. The new design keeps Moveable as the snapping engine.

Guide-line arrays passed to Moveable are computed from:

- Existing built-in fixed spacing guidelines, currently generated every 50 px.
- User-created guides from `basicConfig.ruler.verticalGuides` and `basicConfig.ruler.horizontalGuides` when `guidesVisible` is true.

The computed guidelines remain in canvas coordinates. `Moveable` continues to receive the existing `:zoom="designerZoomScale"` prop. Existing drag, resize, rotate, bounds, and element snapping settings are not replaced.

When guide lines are hidden, user guide lines are not passed to Moveable. Built-in fixed spacing guidelines may continue to work as they do today.

## Interaction Compatibility

Ruler and guide pointer interactions must not conflict with existing canvas interactions.

- While dragging from a ruler or dragging a guide, Selecto selection is disabled for that pointer operation.
- While dragging from a ruler or dragging a guide, canvas panning does not start.
- Existing space-key canvas panning continues to work when the pointer interaction does not start on a ruler or guide.
- Existing Moveable target selection and control boxes remain anchored to chart components.
- The ruler layer does not become a Moveable target.

## Loading and Saving

On page load:

- `pageConfig.basicConfig.ruler` is normalized with defaults.
- Missing arrays become empty arrays.
- Invalid guide positions are ignored or clamped to the current canvas bounds.

On save:

- `basicConfig.ruler` is included in the existing `pageApi.updatePageConfig` payload.
- No separate API endpoint is required.

Preview:

- `VisualScreenPreview.vue` may tolerate the field as part of `basicConfig`, but it does not render rulers or guides.

## Component Structure

Implementation should keep the main designer readable by extracting focused helpers or components:

- A ruler/guide overlay component for ruler rendering, guide rendering, and pointer interactions.
- A small type/default helper for normalizing `basicConfig.ruler`.
- Computed guideline arrays in the designer that bridge ruler data into Moveable.
- A configuration-panel subsection for the ruler and guide management UI.

## Testing

Unit or source-level tests should cover:

- Default ruler config normalization for pages without `basicConfig.ruler`.
- Invalid or missing guide arrays do not break loading.
- Guide positions are clamped to canvas bounds.
- Computed Moveable guideline arrays include user guides only when guides are visible.
- Locked guide semantics: global lock or per-guide lock prevents drag, delete, and coordinate edit.

Manual verification should cover:

- Rulers remain aligned after zooming, fitting to viewport, wheel zooming, and panning.
- Mouse-position indicators show canvas coordinates.
- Dragging from top ruler creates vertical guides.
- Dragging from left ruler creates horizontal guides.
- Guides snap Moveable-managed components.
- Guide dragging does not trigger Selecto or canvas panning.
- Locked guides still participate in snapping.
- Saving and reopening the same page restores ruler settings and guide lines.

## Acceptance Criteria

- The designer displays top and left rulers when `pageConfig.basicConfig.ruler.visible` is true.
- The rulers stay aligned with canvas coordinates across zoom and pan.
- Users can create, move, lock, delete, clear, and precisely edit horizontal and vertical guides.
- Guide settings persist under `pageConfig.basicConfig.ruler`.
- User-created visible guides are passed to Moveable snapping without changing existing Moveable component behavior.
- Locked guides remain visible and snappable but cannot be dragged, deleted, or edited.
- Hiding guides hides them and removes them from Moveable user-guide snapping without deleting them.
- Existing pages without ruler config continue loading with default ruler settings.
- The implementation follows `docs/design/DESIGN.md` and does not add hard-coded UI colors, `--dr-*` color variables, Element Plus internal overrides, `!important`, or negative letter spacing.
