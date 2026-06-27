# Frontend Action Config Design

## Goal

Improve the component interaction action dialog so designers can configure common actions through forms instead of writing JavaScript for every behavior.

The action dialog should support these action types:

- 显示
- 隐藏
- 显隐切换
- 页面跳转
- 数据刷新
- 更新全局变量
- 代码块

The existing free-form code capability remains available as "代码块", but action-specific fields move into typed configuration objects.

## Non-Goals

- Do not implement the 弹框 action in this phase.
- Do not keep compatibility with the old `ChartAction.code` shape.
- Do not add trigger parameter appending or fixed query parameter builders for page navigation.
- Do not support nested `bep.params` paths such as `row.id` for updating global variables.
- Do not monitor component DOM changes or maintain thumbnail caches.

## Current State

The current `BehaviorConfigDialog.vue` only creates `code` actions. `ChartAction` stores action-specific data directly on the action:

```ts
export interface ChartAction {
  name: string
  type: string | 'code'
  code: string
}
```

Runtime execution is handled by `useCanvasInst().triggerChartAction()`. Code actions run through `new Function('bep', action.code)`, while other action names are delegated to component exposed methods.

The new design keeps the existing behavior list, action ordering, and `bep` object concept, but replaces the action data model with typed action configuration.

## Action Model

`ChartAction` becomes a common shell. Action-specific fields are stored under `chartActionConfig`.

```ts
export interface ChartAction {
  name: string
  type: ChartActionType
  chartActionConfig: ChartActionConfig
}

export type ChartActionType =
  | 'show'
  | 'hide'
  | 'toggleVisibility'
  | 'navigate'
  | 'refreshData'
  | 'updateGlobalVariable'
  | 'code'

export interface ChartActionConfig {
  type: ChartActionType
}
```

Each action type has its own config implementation.

```ts
export interface ShowActionConfig extends ChartActionConfig {
  type: 'show'
  targetChartIds: string[]
}

export interface HideActionConfig extends ChartActionConfig {
  type: 'hide'
  targetChartIds: string[]
}

export interface ToggleVisibilityActionConfig extends ChartActionConfig {
  type: 'toggleVisibility'
  targetChartIds: string[]
}

export interface RefreshDataActionConfig extends ChartActionConfig {
  type: 'refreshData'
  targetChartIds: string[]
}

export interface NavigateActionConfig extends ChartActionConfig {
  type: 'navigate'
  mode: 'external' | 'internal'
  url: string
  target: 'self' | 'blank'
}

export interface UpdateGlobalVariableActionConfig extends ChartActionConfig {
  type: 'updateGlobalVariable'
  globalVariableName: string
  bepName: string
}

export interface CodeBlockActionConfig extends ChartActionConfig {
  type: 'code'
  code: string
}
```

Saved examples:

```ts
{
  name: '显示组件',
  type: 'show',
  chartActionConfig: {
    type: 'show',
    targetChartIds: ['chart_1']
  }
}
```

```ts
{
  name: '代码块',
  type: 'code',
  chartActionConfig: {
    type: 'code',
    code: '// 请输入JS代码\n'
  }
}
```

## Action Dialog UX

`BehaviorConfigDialog.vue` keeps the existing two-column structure:

- Left: action list with add, delete, selection, and drag sorting.
- Right: dynamic form for the currently selected action.

Action type selector:

| Label | Type |
| --- | --- |
| 显示 | `show` |
| 隐藏 | `hide` |
| 显隐切换 | `toggleVisibility` |
| 页面跳转 | `navigate` |
| 数据刷新 | `refreshData` |
| 更新全局变量 | `updateGlobalVariable` |
| 代码块 | `code` |

The action type selector is editable. When the user changes type, the dialog rebuilds `chartActionConfig` with that type's default values.

The add button creates a code block action by default:

```ts
{
  name: '动作1',
  type: 'code',
  chartActionConfig: {
    type: 'code',
    code: '// 请输入JS代码\n'
  }
}
```

### Form Fields

显示, 隐藏, 显隐切换, and 数据刷新 share the same target component form:

- 动作名称
- 动作类型
- 已选目标组件摘要
- 选择组件 button

页面跳转 form:

- 动作名称
- 动作类型
- 跳转方式: 外部链接 or 内部路由
- 跳转地址: direct text input. Users may include query or hash parameters directly.
- 打开方式: 当前窗口 or 新窗口

更新全局变量 form:

- 动作名称
- 动作类型
- 全局变量名称: select from the current page global variable list
- 赋值: select generated from the current behavior's `paramsList`
- 值描述: read-only description for the selected `bepName`

代码块 form:

- 动作名称
- 动作类型
- JS 代码
- `bep.params` parameter help generated from the current behavior's `paramsList`

## Target Component Selector

Target component selection is a reusable dialog used by:

- 显示
- 隐藏
- 显隐切换
- 数据刷新

The action form only shows selected component summaries and a button to open the selector.

The selector has two columns:

- Left: current page layer tree with layer names and checkboxes.
- Right: thumbnail preview for the layer node most recently clicked.

Interaction rules:

- Clicking a layer node updates the right-side thumbnail only.
- Clicking a checkbox selects or deselects that component.
- The selector supports multi-select.
- The confirmed value writes component IDs to `chartActionConfig.targetChartIds`.
- The tree is built from the current `chartList`. Root components and nested `children` are represented as a tree.
- Missing IDs already stored in config should be visible in the action form summary as "组件已不存在" so the designer can correct them.

### Thumbnail Generation

The right-side thumbnail is generated from the component DOM already rendered on the canvas.

Rules:

- Use `html-to-image`.
- On each layer node click, find the corresponding canvas DOM node by `chartId`.
- Generate a data URL from that DOM node and render it with an `img`.
- Take a new screenshot on every layer node click.
- Do not monitor DOM changes.
- Do not maintain a thumbnail cache.
- Do not re-render the component in a separate preview runtime.
- If the component is hidden, its DOM is missing, or screenshot generation fails, show a fallback panel with component name, type, size, and position.
- Thumbnail failure must not block selecting or saving target components.

This requires adding the frontend dependency `html-to-image`.

## Runtime Execution

`useCanvasInst().triggerChartAction()` becomes a unified action executor that dispatches by `action.type`. It reads action-specific fields from `action.chartActionConfig`.

The existing `bep` structure remains:

```ts
{
  canvasInst,
  params: triggerData
}
```

Execution rules:

| Type | Behavior |
| --- | --- |
| `show` | Set each target chart's `hide` to `false`. |
| `hide` | Set each target chart's `hide` to `true`. |
| `toggleVisibility` | Set each target chart's `hide` to `!hide`. Empty `hide` is treated as visible. |
| `refreshData` | Call each target component instance's `autoRefreshData()`. |
| `navigate` | Navigate according to `mode`, `url`, and `target`. |
| `updateGlobalVariable` | Read `bep.params[bepName]` and write it to `globalVariableName`. |
| `code` | Execute `chartActionConfig.code` with `bep`. |

Actions continue to run in list order. If one action fails, log the error and continue with the next action.

### Navigation Rules

- `target = blank`: use `window.open(url, '_blank')`.
- `target = self` and `mode = external`: use `window.location.href = url`.
- `target = self` and `mode = internal`: prefer Vue Router navigation when available; otherwise fall back to current-window path or hash navigation.

### Global Variable Rules

The update global variable action uses only one-level `bep.params` properties:

```ts
bep.params[action.chartActionConfig.bepName]
```

The `bepName` select options are generated from the current behavior's `paramsList`.

Example `paramsList`:

```ts
[
  { name: 'code', type: 'string', desc: '区域编码' },
  { name: 'name', type: 'string', desc: '区域名称' }
]
```

Displayed options:

- `code - 区域编码`
- `name - 区域名称`

If the global variable or parameter is missing, skip the update and log a warning.

## Implementation Surfaces

Expected frontend areas:

- `dataRoomFront/src/dataRoom/components/type/ChartAction.ts`
- `dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue`
- shared target component selector component under `dataRoomFront/src/dataRoom/designer/components/`
- `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`
- `dataRoomFront/src/dataRoom/designer/types/CanvasInst.ts`
- package dependency files for `html-to-image`

The implementation must follow `docs/design/DESIGN.md`:

- Use Element Plus form components and props for controls.
- Use Element Plus CSS variables for custom layout surfaces.
- Do not use hard-coded colors.
- Do not override `.el-*` internals with deep selectors or `!important`.

## Error Handling

- Missing target component: skip and log a warning.
- Missing component instance during data refresh: skip and log a warning.
- Hidden or missing DOM node for thumbnail: show fallback information.
- `html-to-image` failure: show fallback information.
- Navigation with an empty URL: do not navigate; show or log a validation error.
- Code block execution failure: keep the existing user-visible error behavior.

## Validation

Implementation should verify:

- `npm run type-check` passes.
- `npm run lint` passes because the work changes Vue templates and styles.
- Adding, deleting, selecting, and dragging actions still works.
- Changing action type rebuilds the matching `chartActionConfig`.
- 代码块 actions execute with the existing `bep` object shape.
- 显示, 隐藏, and 显隐切换 update target component visibility.
- 数据刷新 calls target components' `autoRefreshData()`.
- 页面跳转 works for current-window and new-window modes.
- 更新全局变量 writes `bep.params[bepName]` to the selected global variable.
- The target component selector shows the layer tree, supports checkbox multi-select, and writes `targetChartIds`.
- Clicking a layer node generates a fresh thumbnail through `html-to-image`.
- Hidden components or screenshot failures show fallback content without blocking selection.
