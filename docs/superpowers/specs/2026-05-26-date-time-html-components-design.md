# Date Time and HTML Components Design

## Context

DataRoom front-end visual components follow the existing convention:

- Each component lives under `dataRoomFront/src/dataroom-packages/components/<ComponentName>/`.
- `install.ts` exports the async component, control panel, default instance factory, behaviors, and dataset field definitions.
- `index.vue` renders the component on the designer canvas.
- `panel/index.vue` renders the right-side configuration panel.
- `plugin.ts` makes the component visible in the component library through `PluginRegister.ts`.

This design adds two independent components:

- `DrDateTime`: displays the current browser-local date/time.
- `DrHtml`: renders user-authored HTML and CSS in an isolated iframe.

The components are intentionally separate. Time display has a small timer-driven rendering model, while HTML rendering needs sandboxing, code editing, and dataset placeholder substitution.

## Goals

- Add a time component for displaying the current date/time.
- Support three fixed date formats: `yyyy-MM-dd`, `yyyy-MM-dd HH:mm`, and `yyyy-MM-dd HH:mm:ss`.
- Allow the time component to configure font size, font family, font weight, letter spacing, text color, horizontal alignment, and vertical alignment.
- Add an HTML component where users can edit HTML and CSS snippets.
- Render HTML/CSS through iframe sandbox isolation so user CSS cannot affect the designer or other components.
- Let the HTML snippet use `#{a.b.c}` placeholders populated from the component dataset result.
- Treat substituted dataset values as escaped plain text.
- Preserve a future configuration shape for HTML script capabilities, while keeping JavaScript execution unavailable in this release.

## Non-Goals

- No implementation of JavaScript execution inside the HTML component.
- No custom date format input.
- No server-time or timezone selection for the time component.
- No dataset binding for the time component.
- No array loop templating for the HTML component.
- No expression language, default values, functions, or filters in HTML placeholders.
- No backend changes.

## Component Structure

### DrDateTime

Directory:

`dataRoomFront/src/dataroom-packages/components/DrDateTime/`

Files:

- `install.ts`
- `index.vue`
- `panel/index.vue`
- `plugin.ts`
- `images/time.svg`

Registration:

- Component type: `DrDateTime`
- Component title: `时间`
- Component library category: `ComponentLibTagTypeConst.TEXT`
- Manual registration in `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`

### DrHtml

Directory:

`dataRoomFront/src/dataroom-packages/components/DrHtml/`

Files:

- `install.ts`
- `index.vue`
- `panel/index.vue`
- `plugin.ts`
- `images/html.svg`

Registration:

- Component type: `DrHtml`
- Component title: `HTML`
- Component library category: `ComponentLibTagTypeConst.MEDIA`
- Manual registration in `dataRoomFront/src/dataroom-packages/_components/PluginRegister.ts`

## DrDateTime Design

### Configuration

`DrDateTime` props contain:

- `format`: one of `yyyy-MM-dd`, `yyyy-MM-dd HH:mm`, `yyyy-MM-dd HH:mm:ss`
- `textStyle.fontSize`: number, pixels
- `textStyle.fontFamily`: string
- `textStyle.fontWeight`: string
- `textStyle.letterSpacing`: number, pixels
- `textStyle.color`: string
- `align`: `left | center | right`
- `verticalAlign`: `top | center | bottom`

Default instance:

- Recommended default size: `w: 240`, `h: 60`
- Default format: `yyyy-MM-dd HH:mm:ss`
- Default alignment: horizontal center, vertical center

### Rendering Behavior

- Uses the browser local time.
- Starts a timer on mount.
- Refreshes once per second for all supported formats for predictable behavior.
- Clears the timer on component unmount.
- Formats dates with a small component-local formatter; no date library is needed.
- Does not call `useDrComponent` for dataset refresh because it has no dataset dependency.

### Control Panel

The control panel uses Element Plus controls and the shared configuration panel style conventions:

- Format: `el-select`
- Font size and letter spacing: `el-input-number`
- Font family and font weight: `el-select`
- Color: `el-color-picker`
- Alignment: `el-select`

The panel does not include background, border, hyperlink, timezone, or dataset controls.

## DrHtml Design

### Configuration

`DrHtml` props contain:

- `html`: user-authored HTML fragment
- `css`: user-authored CSS
- `sandbox`: future-facing script-related settings stored in config but not exposed in the UI for this release
- `placeholder.escapeMode`: fixed to text escaping in this release

Default instance:

- Recommended default size: `w: 400`, `h: 300`
- Default HTML shows a small static example.
- Default CSS is scoped by iframe isolation, not by designer DOM classes.

### Editing Experience

The right-side control panel shows a compact summary:

- HTML character count
- CSS character count
- Placeholder count detected from the HTML fragment
- Dataset configured or not configured

The panel provides an `编辑代码` action that opens a dialog.

The dialog contains two CodeMirror editors:

- HTML editor using `@codemirror/lang-html`
- CSS editor using `@codemirror/lang-css`

The project already uses CodeMirror for SQL and JSON editors. This feature adds the HTML and CSS language packages and reuses the existing CodeMirror dependency pattern.

The dialog uses an apply/cancel model:

- Opening the dialog copies current `chart.props.html` and `chart.props.css` to local draft state.
- `取消` closes the dialog without writing back.
- `应用` writes the drafts back to `chart.props`.

### Rendering Isolation

`DrHtml` renders through an iframe:

- Uses `srcdoc` for the generated document.
- Uses `sandbox` without `allow-scripts` in this release.
- Writes user CSS into a `<style>` tag.
- Writes sanitized and substituted HTML into the `<body>`.
- Keeps user CSS inside the iframe document so it cannot affect the designer shell or other components.

### Dataset Placeholder Flow

`DrHtml` uses the existing component dataset refresh path through `useDrComponent`.

Flow:

1. The component is mounted.
2. `useDrComponent` registers the instance and triggers dataset refresh when a dataset is configured.
3. `changeData(datasetValue)` stores the latest dataset value in component state.
4. Rendering builds a placeholder context:
   - If `datasetValue` is an array, use the first row.
   - If `datasetValue` is an object, use it directly.
   - Otherwise use an empty object.
5. The HTML fragment is scanned for placeholders matching `#{path.to.value}`.
6. Each placeholder resolves by dot path against the context object.
7. Resolved values are converted to strings and HTML-escaped.
8. Missing paths resolve to an empty string and log one concise warning per missing placeholder path during a render update.
9. The final HTML is sanitized and injected into the iframe `srcdoc`.

Supported placeholder syntax:

- `#{name}`
- `#{user.name}`
- `#{a.b.c}`

Unsupported syntax:

- Array indexing
- Loops
- Conditionals
- Functions
- Default values
- Arithmetic or string expressions

### Security Rules

The HTML component is designed as static HTML/CSS rendering in this release.

Before rendering, the component removes or neutralizes dangerous content:

- `<script>` tags are removed.
- Inline event handler attributes such as `onclick` and `onerror` are removed.
- `javascript:` URLs are removed or replaced with inert values.
- Dataset placeholder values are always escaped as text before insertion.
- The iframe sandbox does not allow scripts.

The stored `sandbox` config can reserve future script-related fields, but no UI control enables scripts in this release.

## Data Flow Summary

### DrDateTime

`browser Date -> format function -> computed display text -> styled component container`

No dataset, no backend request, no global state dependency.

### DrHtml

`datasetApi.run4Chart -> useDrComponent.changeData -> placeholder context -> escaped substitution -> sanitize HTML -> iframe srcdoc`

If no dataset is configured, the component renders the configured HTML/CSS with unresolved placeholders replaced by empty strings.

## Error Handling

- `DrDateTime` falls back to an empty string only if an unknown format appears in stored config; the panel only exposes valid formats.
- `DrHtml` keeps rendering even when placeholders are missing.
- Invalid or unsupported placeholder paths do not break the canvas.
- Empty HTML renders an empty iframe body rather than an error state.
- Dataset absence is allowed for `DrHtml`; placeholder substitution simply has no data context.

## Styling and Design System Compliance

- Configuration panels use Element Plus controls with default internal styling.
- Business CSS only controls layout, spacing, wrappers, and editor containers.
- New panel styles must follow `docs/design/DESIGN.md`.
- No `--dr-*` color variables are introduced.
- No hardcoded UI shell colors are introduced outside user-authored component content.
- No `:deep(.el-*)`, `/deep/`, `>>>`, global `.el-*`, or `!important` overrides are used for Element Plus internals.
- User-authored HTML/CSS is considered rendered content, isolated inside the iframe, and is not part of the designer shell styling rules.

## Dependencies

Add front-end dependencies:

- `@codemirror/lang-html`
- `@codemirror/lang-css`

The project already has:

- `codemirror`
- `vue-codemirror`
- `@uiw/codemirror-theme-eclipse`

## Testing Plan

Minimum verification:

- Run `npm run type-check` in `dataRoomFront`.
- Run `npm run lint` in `dataRoomFront` because this adds Vue panels and styles.

Manual verification:

- Time component appears in the component library under `文本`.
- HTML component appears in the component library under `多媒体`.
- Both components can be added to the canvas.
- Time component renders the three supported formats.
- Time component updates every second and clears its timer after unmount.
- Time style controls update the canvas display.
- HTML edit dialog supports separate HTML and CSS editors.
- Canceling the dialog leaves component config unchanged.
- Applying the dialog updates component config and rerenders the iframe.
- HTML/CSS render inside the iframe and do not affect surrounding designer UI.
- `#{a.b.c}` resolves from an object dataset result.
- `#{a.b.c}` resolves from the first row of an array dataset result.
- Placeholder values containing HTML are escaped and shown as text.
- `<script>`, inline event handlers, and `javascript:` links do not execute.

## Acceptance Criteria

- `DrDateTime` and `DrHtml` follow the existing component directory conventions.
- Both components are visible in the component library in the agreed categories.
- `DrDateTime` has no dataset field binding and no dataset execution.
- `DrHtml` supports dataset-based placeholder substitution in HTML only.
- `DrHtml` uses iframe sandbox rendering without script execution.
- The HTML editor dialog uses CodeMirror with HTML and CSS language support.
- The feature passes front-end type checking.
- Any lint issues introduced by the feature are resolved.
