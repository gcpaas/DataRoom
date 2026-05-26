# Date Time and HTML Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增 `DrDateTime` 时间组件和 `DrHtml` HTML/CSS 渲染组件，并按设计器现有组件规范注册到组件库。

**Architecture:** 两个组件独立实现，分别位于 `components/DrDateTime` 和 `components/DrHtml`。时间组件使用本地浏览器时间和组件内格式化工具；HTML 组件使用 CodeMirror 编辑、iframe sandbox 渲染、组件内模板工具完成数据占位符替换和静态安全处理。

**Tech Stack:** Vue 3, TypeScript, Element Plus, vue-codemirror, CodeMirror language packages, existing `createChartConfig`, existing `useDrComponent`, static Node regression script, `vue-tsc`, ESLint.

---

## File Structure

- Modify `data-room-ui/package.json`: add `@codemirror/lang-html` and `@codemirror/lang-css`.
- Modify `data-room-ui/package-lock.json`: lock the new CodeMirror language packages.
- Create `data-room-ui/src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs`: static regression script for both component directories, exports, registration, and forbidden panel style patterns.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/time-format.ts`: date format union, format options, and browser-local formatter.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/install.ts`: component contract, defaults, behaviors, dataset field list.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/index.vue`: timer-driven date/time rendering.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/panel/index.vue`: Element Plus configuration panel.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/plugin.ts`: component library metadata.
- Create `data-room-ui/src/dataroom-packages/components/DrDateTime/images/time.svg`: thumbnail.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/html-render.ts`: placeholder extraction, dataset substitution, HTML escaping, sanitization, and iframe `srcdoc` generation.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/install.ts`: component contract, defaults, behaviors, dataset field list.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/index.vue`: iframe sandbox rendering and dataset refresh handling.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/panel/index.vue`: summary panel and CodeMirror edit dialog.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/plugin.ts`: component library metadata.
- Create `data-room-ui/src/dataroom-packages/components/DrHtml/images/html.svg`: thumbnail.
- Modify `data-room-ui/src/dataroom-packages/_components/PluginRegister.ts`: import both plugins and add them to `pluginList`.

Existing unrelated worktree changes must be preserved. Before editing `PluginRegister.ts`, read its current content and patch only the new imports and `pluginList` entries.

## Task 1: Dependencies and Static Regression Script

**Files:**
- Modify: `data-room-ui/package.json`
- Modify: `data-room-ui/package-lock.json`
- Create: `data-room-ui/src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs`

- [ ] **Step 1: Install CodeMirror language packages**

Run from `data-room-ui`:

```bash
npm install @codemirror/lang-html @codemirror/lang-css
```

Expected: `package.json` and `package-lock.json` include both packages under dependencies.

- [ ] **Step 2: Write the failing static regression script**

Create `data-room-ui/src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs` with this content:

```js
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message)
  }
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentRoot = __dirname

const components = [
  {
    name: 'DrDateTime',
    title: '时间',
    tag: 'ComponentLibTagTypeConst.TEXT',
    plugin: 'DrDateTimePlugin',
    files: ['time-format.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/time.svg'],
    requiredHelpers: ['formatDateTime', 'dateTimeFormatOptions'],
  },
  {
    name: 'DrHtml',
    title: 'HTML',
    tag: 'ComponentLibTagTypeConst.MEDIA',
    plugin: 'DrHtmlPlugin',
    files: ['html-render.ts', 'install.ts', 'index.vue', 'panel/index.vue', 'plugin.ts', 'images/html.svg'],
    requiredHelpers: ['getPlaceholderPaths', 'substitutePlaceholders', 'sanitizeHtmlFragment', 'buildHtmlSrcdoc'],
  },
]

for (const item of components) {
  const dir = resolve(componentRoot, item.name)
  assert(existsSync(dir), `${item.name} directory must exist`)

  for (const file of item.files) {
    assert(existsSync(resolve(dir, file)), `${item.name} must provide ${file}`)
  }

  const installSource = readFileSync(resolve(dir, 'install.ts'), 'utf8')
  assert(installSource.includes(`'${item.name}'`) || installSource.includes(`"${item.name}"`), `${item.name} install.ts must register its own type`)
  assert(installSource.includes(`title: '${item.title}'`) || installSource.includes(`title: "${item.title}"`), `${item.name} default title must be ${item.title}`)
  assert(/export\s*\{[\s\S]*component[\s\S]*controlPanel[\s\S]*getInstance[\s\S]*behaviors[\s\S]*datasetFields[\s\S]*\}/.test(installSource), `${item.name} install.ts must export auto-install contract`)

  const panelSource = readFileSync(resolve(dir, 'panel/index.vue'), 'utf8')
  assert(panelSource.includes('chartConfigPanel.scss'), `${item.name} panel must import shared config panel styles`)
  assert(!/:deep\(\.el-/.test(panelSource), `${item.name} panel must not override Element Plus internals`)
  assert(!/::v-deep|\/deep\/|>>>/.test(panelSource), `${item.name} panel must not use deprecated deep selectors`)
  assert(!/!important/.test(panelSource), `${item.name} panel must not use !important`)

  const helperSource = readFileSync(resolve(dir, item.name === 'DrDateTime' ? 'time-format.ts' : 'html-render.ts'), 'utf8')
  for (const helper of item.requiredHelpers) {
    assert(helperSource.includes(`export const ${helper}`) || helperSource.includes(`export function ${helper}`), `${item.name} helper file must export ${helper}`)
  }
}

const registerSource = readFileSync(resolve(componentRoot, '../_components/PluginRegister.ts'), 'utf8')
for (const item of components) {
  assert(registerSource.includes(item.plugin), `PluginRegister must import ${item.plugin}`)
  assert(registerSource.includes(`new ${item.plugin}([${item.tag}])`), `PluginRegister must add ${item.plugin} to ${item.tag}`)
}

const packageSource = readFileSync(resolve(componentRoot, '../../../package.json'), 'utf8')
assert(packageSource.includes('"@codemirror/lang-html"'), 'package.json must include @codemirror/lang-html')
assert(packageSource.includes('"@codemirror/lang-css"'), 'package.json must include @codemirror/lang-css')
```

- [ ] **Step 3: Run the static script and verify it fails for missing components**

Run from `data-room-ui`:

```bash
node src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs
```

Expected: FAIL with `DrDateTime directory must exist`.

## Task 2: DrDateTime Component

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/time-format.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/panel/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/plugin.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrDateTime/images/time.svg`

- [ ] **Step 1: Create the date formatting helper**

Create `time-format.ts`:

```ts
export type DateTimeFormat = 'yyyy-MM-dd' | 'yyyy-MM-dd HH:mm' | 'yyyy-MM-dd HH:mm:ss'

export const dateTimeFormatOptions: { label: string; value: DateTimeFormat }[] = [
  { label: 'yyyy-MM-dd', value: 'yyyy-MM-dd' },
  { label: 'yyyy-MM-dd HH:mm', value: 'yyyy-MM-dd HH:mm' },
  { label: 'yyyy-MM-dd HH:mm:ss', value: 'yyyy-MM-dd HH:mm:ss' },
]

const pad2 = (value: number): string => String(value).padStart(2, '0')

export const formatDateTime = (date: Date, format: DateTimeFormat): string => {
  const yyyy = String(date.getFullYear())
  const MM = pad2(date.getMonth() + 1)
  const dd = pad2(date.getDate())
  const HH = pad2(date.getHours())
  const mm = pad2(date.getMinutes())
  const ss = pad2(date.getSeconds())

  if (format === 'yyyy-MM-dd') {
    return `${yyyy}-${MM}-${dd}`
  }
  if (format === 'yyyy-MM-dd HH:mm') {
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}`
  }
  if (format === 'yyyy-MM-dd HH:mm:ss') {
    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
  }
  return ''
}
```

- [ ] **Step 2: Create `install.ts` with the component contract**

Implementation requirements:

- Export `DrDateTimeConfig`.
- Use `createChartConfig<DrDateTimePropsInterface>('DrDateTime', ...)`.
- Default props:
  - `format: 'yyyy-MM-dd HH:mm:ss'`
  - `textStyle.fontSize: 24`
  - `textStyle.fontFamily: 'Microsoft YaHei'`
  - `textStyle.fontWeight: '400'`
  - `textStyle.letterSpacing: 0`
  - `textStyle.color: '#ffffff'`
  - `align: 'center'`
  - `verticalAlign: 'center'`
- Overrides:
  - `title: '时间'`
  - `w: 240`
  - `h: 60`
- Export empty `behaviors` and empty `datasetFields`.

Use this props type:

```ts
interface DrDateTimePropsInterface {
  format: DateTimeFormat
  textStyle: {
    fontSize: number
    fontFamily: string
    fontWeight: string
    letterSpacing: number
    color: string
  }
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'center' | 'bottom'
}
```

- [ ] **Step 3: Create `index.vue`**

Implementation requirements:

- Component name is `DrDateTime`.
- Import `computed`, `onBeforeUnmount`, `onMounted`, and `ref`.
- Do not call `useDrComponent`.
- Store `now = ref(new Date())`.
- Start `setInterval(() => { now.value = new Date() }, 1000)` on mount.
- Clear the interval on unmount.
- Compute display text with `formatDateTime(now.value, chart.props.format)`.
- Render a single root `<div class="dr-date-time" :id="chart.id" :style="dateTimeStyle">{{ displayText }}</div>`.
- Map horizontal alignment to `justifyContent`.
- Map vertical alignment to `alignItems`.
- Apply `fontSize`, `fontFamily`, `fontWeight`, `letterSpacing`, and `color` from props.
- Base style includes `width: 100%`, `height: 100%`, `display: flex`, `boxSizing: border-box`, `whiteSpace: nowrap`, and `fontFeatureSettings: '"tnum"'`.

- [ ] **Step 4: Create `panel/index.vue`**

Implementation requirements:

- Component name is `DrDateTimeControlPanel`.
- Use `computed(() => chart)`.
- Import `dateTimeFormatOptions`.
- Use shared stylesheet: `@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';`.
- Use one `el-collapse` with two items:
  - `基础配置`: format, horizontal alignment, vertical alignment.
  - `文字样式`: font size, font family, font weight, letter spacing, color.
- Use Element Plus controls only:
  - `el-select` for format, font family, font weight, horizontal alignment, vertical alignment.
  - `el-input-number` for font size and letter spacing.
  - `el-color-picker` for color.
- Bind directly to `chartConfig.props`, not to a copied props object.
- Do not use `:deep(.el-*)`, `!important`, or hardcoded panel shell colors.

Use these option arrays:

```ts
const fontFamilyOptions = [
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Courier New', value: 'Courier New' },
]

const fontWeightOptions = [
  { label: '正常 (400)', value: '400' },
  { label: '中等 (500)', value: '500' },
  { label: '半粗 (600)', value: '600' },
  { label: '粗体 (700)', value: '700' },
]
```

- [ ] **Step 5: Create plugin and thumbnail**

Create `plugin.ts`:

```ts
import thumbnail from './images/time.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrDateTimePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrDateTime', '时间', '时间、日期、当前时间、当前日期', thumbnail, tags)
  }
}
```

Create `images/time.svg` as a simple clock thumbnail that uses `currentColor` for strokes and no hardcoded app shell colors.

- [ ] **Step 6: Run type-check for the new component**

Run from `data-room-ui`:

```bash
npm run type-check
```

Expected: PASS for `DrDateTime` files. It may still fail if `DrHtml` imports have not been created in later tasks; if so, fix only `DrDateTime` errors before moving on.

## Task 3: DrHtml Rendering Utilities

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/html-render.ts`

- [ ] **Step 1: Create `html-render.ts`**

```ts
import { getFieldValue, normalizeRows, type DatasetRow } from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

export interface HtmlRenderResult {
  srcdoc: string
  missingPaths: string[]
}

export const getPlaceholderPaths = (html: string): string[] => {
  if (!html) {
    return []
  }
  const matches = [...html.matchAll(/#\{([^}]+)\}/g)]
  return [...new Set(matches.map(match => match[1]?.trim()).filter(Boolean) as string[])]
}

export const escapeHtml = (value: unknown): string => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const getPlaceholderContext = (datasetValue: unknown): DatasetRow | undefined => {
  return normalizeRows(datasetValue)[0]
}

export const substitutePlaceholders = (
  html: string,
  datasetValue: unknown,
): { html: string; missingPaths: string[] } => {
  const context = getPlaceholderContext(datasetValue)
  const missingPaths = new Set<string>()
  const substituted = html.replace(/#\{([^}]+)\}/g, (_match, rawPath: string) => {
    const path = rawPath.trim()
    const value = getFieldValue(context, path)
    if (value === undefined || value === null) {
      missingPaths.add(path)
      return ''
    }
    return escapeHtml(value)
  })
  return {
    html: substituted,
    missingPaths: Array.from(missingPaths),
  }
}

const isJavaScriptUrl = (value: string): boolean => {
  return value.trim().toLowerCase().startsWith('javascript:')
}

export const sanitizeHtmlFragment = (html: string): string => {
  const template = document.createElement('template')
  template.innerHTML = html

  template.content.querySelectorAll('script').forEach(node => node.remove())

  const elements = template.content.querySelectorAll('*')
  elements.forEach(element => {
    for (const attr of Array.from(element.attributes)) {
      const attrName = attr.name.toLowerCase()
      const attrValue = attr.value
      if (attrName.startsWith('on')) {
        element.removeAttribute(attr.name)
        continue
      }
      if ((attrName === 'href' || attrName === 'src' || attrName === 'xlink:href') && isJavaScriptUrl(attrValue)) {
        element.removeAttribute(attr.name)
      }
    }
  })

  return template.innerHTML
}

const protectStyleEndTag = (css: string): string => {
  return css.replace(/<\/style/gi, '<\\/style')
}

export const buildHtmlSrcdoc = (
  html: string,
  css: string,
  datasetValue: unknown,
): HtmlRenderResult => {
  const substituted = substitutePlaceholders(html, datasetValue)
  const sanitizedHtml = sanitizeHtmlFragment(substituted.html)
  const safeCss = protectStyleEndTag(css)

  return {
    srcdoc: `<!doctype html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    html, body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      box-sizing: border-box;
    }
    *, *::before, *::after {
      box-sizing: border-box;
    }
    ${safeCss}
  </style>
</head>
<body>${sanitizedHtml}</body>
</html>`,
    missingPaths: substituted.missingPaths,
  }
}
```

- [ ] **Step 2: Run type-check**

Run from `data-room-ui`:

```bash
npm run type-check
```

Expected: PASS for `html-render.ts`. If TypeScript reports DOM type issues, keep the DOM APIs typed through standard browser types and do not add a new dependency.

## Task 4: DrHtml Component

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/panel/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/plugin.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrHtml/images/html.svg`

- [ ] **Step 1: Create `install.ts`**

Implementation requirements:

- Export `DrHtmlConfig`.
- Use `createChartConfig<DrHtmlPropsInterface>('DrHtml', ...)`.
- Props shape:

```ts
export interface DrHtmlPropsInterface {
  html: string
  css: string
  sandbox: {
    allowScripts: boolean
    allowSameOrigin: boolean
    allowForms: boolean
    allowPopups: boolean
  }
  placeholder: {
    escapeMode: 'text'
  }
}
```

- Defaults:
  - `html: '<div class="html-card"><h3>HTML 组件</h3><p>支持 #{user.name} 占位符</p></div>'`
  - `css` defines `.html-card`, `h3`, and `p` inside the iframe content.
  - `sandbox.allowScripts: false`
  - `sandbox.allowSameOrigin: false`
  - `sandbox.allowForms: false`
  - `sandbox.allowPopups: false`
  - `placeholder.escapeMode: 'text'`
- Overrides:
  - `title: 'HTML'`
  - `w: 400`
  - `h: 300`
- Behaviors:
  - `加载完成`, method `loaded`, param `placeholderCount`
  - `单击`, method `click`, param `placeholderCount`
- Dataset fields:
  - one optional field named `templateContext`, description `模板上下文`, `multiple: false`

- [ ] **Step 2: Create `index.vue`**

Implementation requirements:

- Component name is `DrHtml`.
- Import `computed`, `ref`, and `watch`.
- Use `useDrComponent` with `changeData(datasetValue)` storing `latestDatasetValue.value`.
- Compute `renderResult = buildHtmlSrcdoc(chart.props.html, chart.props.css, latestDatasetValue.value)`.
- Compute `sandboxAttr` with no `allow-scripts` in this release:
  - include `allow-same-origin` only if `chart.props.sandbox.allowSameOrigin` is true.
  - include `allow-forms` only if `chart.props.sandbox.allowForms` is true.
  - include `allow-popups` only if `chart.props.sandbox.allowPopups` is true.
  - ignore `allowScripts` for the actual iframe attribute.
- Watch `renderResult.value.missingPaths.join('|')` and log `console.warn('HTML组件占位符未命中:', chart.id, missingPaths)` when non-empty.
- Render:

```vue
<div class="dr-html" :id="chart.id" @click="onClick">
  <iframe
    class="dr-html__frame"
    :srcdoc="renderResult.srcdoc"
    :sandbox="sandboxAttr"
    referrerpolicy="no-referrer"
    @load="onLoad"
  />
</div>
```

- `onLoad` triggers `loaded` with `{ placeholderCount: getPlaceholderPaths(chart.props.html).length }`.
- `onClick` triggers `click` with `{ placeholderCount: getPlaceholderPaths(chart.props.html).length }`.
- Expose `useDrComponent` methods through `defineExpose<ComponentExpose>`.
- Scoped CSS:
  - `.dr-html` is `width: 100%; height: 100%; overflow: hidden;`
  - `.dr-html__frame` is `width: 100%; height: 100%; border: 0; display: block;`

- [ ] **Step 3: Create `panel/index.vue`**

Implementation requirements:

- Component name is `DrHtmlControlPanel`.
- Use `computed(() => chart)`.
- Import `Codemirror` from `vue-codemirror`.
- Import `html` from `@codemirror/lang-html`.
- Import `css` from `@codemirror/lang-css`.
- Import `eclipse` from `@uiw/codemirror-theme-eclipse`.
- Import `getPlaceholderPaths`.
- Maintain `dialogVisible`, `draftHtml`, and `draftCss`.
- `openEditor()` copies `chartConfig.value.props.html` and `chartConfig.value.props.css` into drafts.
- `cancelEditor()` closes without writing back.
- `applyEditor()` writes draft values back to `chartConfig.value.props.html/css` and closes.
- Summary fields:
  - HTML 字符数: `chartConfig.props.html.length`
  - CSS 字符数: `chartConfig.props.css.length`
  - 占位符数量: `getPlaceholderPaths(chartConfig.props.html).length`
  - 数据集: `chartConfig.dataset?.code ? '已配置' : '未配置'`
- Dialog contains two CodeMirror editors with separate extension arrays:

```ts
const htmlExtensions = [html(), eclipse]
const cssExtensions = [css(), eclipse]
```

- Use Element Plus defaults and shared config styles. CodeMirror wrapper styles may use `:deep(.cm-editor)` because that does not override Element Plus internals.

- [ ] **Step 4: Create plugin and thumbnail**

Create `plugin.ts`:

```ts
import thumbnail from './images/html.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrHtmlPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrHtml', 'HTML', 'html、css、自定义片段、自定义内容', thumbnail, tags)
  }
}
```

Create `images/html.svg` as a simple HTML tag thumbnail that uses `currentColor` for strokes and no hardcoded app shell colors.

- [ ] **Step 5: Run type-check**

Run from `data-room-ui`:

```bash
npm run type-check
```

Expected: PASS for `DrHtml` files after dependency installation.

## Task 5: Component Library Registration

**Files:**
- Modify: `data-room-ui/src/dataroom-packages/_components/PluginRegister.ts`

- [ ] **Step 1: Add imports without disturbing existing user changes**

Read the current file first:

```bash
sed -n '1,180p' src/dataroom-packages/_components/PluginRegister.ts
```

Add imports near the other component imports:

```ts
import {DrDateTimePlugin} from '@/dataroom-packages/components/DrDateTime/plugin.ts'
import {DrHtmlPlugin} from '@/dataroom-packages/components/DrHtml/plugin.ts'
```

- [ ] **Step 2: Register plugins in existing categories**

Add entries to `pluginList`:

```ts
new DrDateTimePlugin([ComponentLibTagTypeConst.TEXT]),
new DrHtmlPlugin([ComponentLibTagTypeConst.MEDIA]),
```

Place `DrDateTimePlugin` near `DrTextPlugin` and `DrHtmlPlugin` near `DrIframePlugin` or other media components.

- [ ] **Step 3: Run the static regression script**

Run from `data-room-ui`:

```bash
node src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs
```

Expected: PASS.

## Task 6: Verification and Commit

**Files:**
- Modify only planned files if verification finds defects.

- [ ] **Step 1: Run front-end type-check**

Run from `data-room-ui`:

```bash
npm run type-check
```

Expected: PASS.

- [ ] **Step 2: Run front-end lint**

Run from `data-room-ui`:

```bash
npm run lint
```

Expected: PASS. If ESLint auto-fixes files, review the diff and keep only fixes under the planned file list unless the tool changed generated files.

- [ ] **Step 3: Review style compliance**

Run from repo root:

```bash
rg -n ":deep\\(\\.el-|::v-deep|/deep/|>>>|!important|--dr-" data-room-ui/src/dataroom-packages/components/DrDateTime data-room-ui/src/dataroom-packages/components/DrHtml
```

Expected: no matches.

- [ ] **Step 4: Review hardcoded shell colors**

Run from repo root:

```bash
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(" data-room-ui/src/dataroom-packages/components/DrDateTime data-room-ui/src/dataroom-packages/components/DrHtml
```

Expected: matches are only user-authored default component content in `DrHtml/install.ts`, default render colors in component props, or SVG authored content. Panel shell styles must not introduce hardcoded UI colors.

- [ ] **Step 5: Review git diff**

Run from repo root:

```bash
git diff -- data-room-ui/package.json data-room-ui/package-lock.json data-room-ui/src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs data-room-ui/src/dataroom-packages/components/DrDateTime data-room-ui/src/dataroom-packages/components/DrHtml data-room-ui/src/dataroom-packages/_components/PluginRegister.ts
```

Expected: diff only covers the planned files and preserves unrelated existing worktree changes.

- [ ] **Step 6: Commit implementation**

Run from repo root:

```bash
git add data-room-ui/package.json data-room-ui/package-lock.json data-room-ui/src/dataroom-packages/components/dateTimeHtmlComponents.spec.mjs data-room-ui/src/dataroom-packages/components/DrDateTime data-room-ui/src/dataroom-packages/components/DrHtml data-room-ui/src/dataroom-packages/_components/PluginRegister.ts
git commit -m "feat: add date time and html components"
```

Expected: one implementation commit containing only the planned files.

## Manual Acceptance Checklist

- Add `DrDateTime` from the `文本` category.
- Switch among `yyyy-MM-dd`, `yyyy-MM-dd HH:mm`, and `yyyy-MM-dd HH:mm:ss`.
- Confirm the displayed value updates every second.
- Change font size, font family, font weight, letter spacing, color, horizontal alignment, and vertical alignment.
- Add `DrHtml` from the `多媒体` category.
- Open the edit dialog, change HTML/CSS, cancel, and confirm config is unchanged.
- Open the edit dialog again, apply changes, and confirm iframe rerenders.
- Configure a dataset returning `{ user: { name: '<b>张三</b>' } }`; use `#{user.name}` and confirm it renders as text, not HTML.
- Configure a dataset returning `[{ user: { name: '李四' } }]`; use `#{user.name}` and confirm it uses the first row.
- Add `<script>`, `onclick`, `onerror`, and `javascript:` content to HTML and confirm scripts do not execute.
