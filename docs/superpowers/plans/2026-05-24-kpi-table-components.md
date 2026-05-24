# KPI and Table Components Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five independent big-screen visualization components: `DrMetricCard`, `DrTrendMetricCard`, `DrPeriodCompareCard`, `DrDataTable`, and `DrAnalysisTable`.

**Architecture:** Each component follows the existing auto-registration convention under `data-room-ui/src/dataroom-packages/components/<ComponentName>/` with `install.ts`, `index.vue`, and `panel/index.vue`. Shared data normalization, number formatting, comparison, sorting, aggregation, and conditional-format helpers live in one focused utility module consumed by the five components.

**Tech Stack:** Vue 3, TypeScript, Element Plus, ECharts 6, existing `useDrComponent`, existing `ChartConfig` factory, static Node spec scripts, `vue-tsc`, ESLint.

---

## File Structure

- Create `data-room-ui/src/dataroom-packages/components/_shared/metric-table-utils.ts`: reusable dataset, formatting, date, sorting, comparison, aggregation, and conditional rule helpers.
- Create `data-room-ui/src/dataroom-packages/components/kpiTableComponents.spec.mjs`: static regression test for the five component directories, required exports, panel stylesheet imports, and forbidden Element Plus style overrides.
- Create each component directory with `install.ts`, `index.vue`, and `panel/index.vue`:
  `DrMetricCard`, `DrTrendMetricCard`, `DrPeriodCompareCard`, `DrDataTable`, `DrAnalysisTable`.

## Task 1: Static Regression Test

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/kpiTableComponents.spec.mjs`

- [ ] **Step 1: Write the failing static test**

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
const components = ['DrMetricCard', 'DrTrendMetricCard', 'DrPeriodCompareCard', 'DrDataTable', 'DrAnalysisTable']

for (const name of components) {
  const dir = resolve(componentRoot, name)
  const installPath = resolve(dir, 'install.ts')
  const indexPath = resolve(dir, 'index.vue')
  const panelPath = resolve(dir, 'panel/index.vue')

  assert(existsSync(installPath), `${name} must provide install.ts`)
  assert(existsSync(indexPath), `${name} must provide index.vue`)
  assert(existsSync(panelPath), `${name} must provide panel/index.vue`)

  const installSource = readFileSync(installPath, 'utf8')
  assert(installSource.includes(`'${name}'`) || installSource.includes(`"${name}"`), `${name} install.ts must register its own type`)
  assert(/export\s*\{[\s\S]*component[\s\S]*controlPanel[\s\S]*getInstance[\s\S]*behaviors[\s\S]*datasetFields[\s\S]*\}/.test(installSource), `${name} install.ts must export the auto-install contract`)

  const panelSource = readFileSync(panelPath, 'utf8')
  assert(panelSource.includes('chartConfigPanel.scss'), `${name} panel must import shared config panel styles`)
  assert(!/:deep\(\.el-/.test(panelSource), `${name} panel must not override Element Plus internals`)
  assert(!/!important/.test(panelSource), `${name} panel must not use !important`)
}

const sharedUtils = readFileSync(resolve(componentRoot, '_shared/metric-table-utils.ts'), 'utf8')
for (const helper of ['normalizeRows', 'formatMetricValue', 'calculateChange', 'resolveComparison', 'buildColumnsFromRows', 'aggregateRows', 'matchConditionalRule']) {
  assert(sharedUtils.includes(`export const ${helper}`) || sharedUtils.includes(`export function ${helper}`), `shared utils must export ${helper}`)
}
```

- [ ] **Step 2: Run it to verify it fails**

Run: `node src/dataroom-packages/components/kpiTableComponents.spec.mjs` from `data-room-ui`.
Expected: FAIL because the new component directories and shared utility do not exist yet.

## Task 2: Shared Utility Module

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/_shared/metric-table-utils.ts`

- [ ] **Step 1: Implement helpers**

Implement and export: `normalizeRows`, `getDatasetFieldNames`, `getFieldValue`, `toFiniteNumber`, `formatMetricValue`, `formatDateValue`, `calculateChange`, `resolveComparison`, `buildColumnsFromRows`, `filterRows`, `sortRows`, `aggregateRows`, `summarizeRows`, `matchConditionalRule`, and `getPaginationItems`.

- [ ] **Step 2: Run type-check**

Run: `npm run type-check` from `data-room-ui`.
Expected: PASS.

## Task 3: DrMetricCard

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrMetricCard/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrMetricCard/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrMetricCard/panel/index.vue`

- [ ] **Step 1: Implement install.ts**

Mirror `docs/specs/DrMetricCard.spec.md`: props defaults, title `指标卡`, size `280 x 140`, one `click` behavior, and dataset fields `valueField`, `titleField`, `subtitleField`, `unitField`.

- [ ] **Step 2: Implement index.vue**

Use `useDrComponent`, `normalizeRows`, `formatMetricValue`, and `matchConditionalRule`. Resolve the first dataset row, fall back to `props.value.defaultValue`, render title/value/subtitle/unit, apply global background/border/radius/shadow/padding/layout, and trigger `click` with `{ value, title, unit }`.

- [ ] **Step 3: Implement panel/index.vue**

Use the chart config panel structure, bind directly to `chartConfig.props`, include controls for all spec groups, and import `chartConfigPanel.scss`.

## Task 4: DrTrendMetricCard

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrTrendMetricCard/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrTrendMetricCard/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrTrendMetricCard/panel/index.vue`

- [ ] **Step 1: Implement install.ts**

Mirror `docs/specs/DrTrendMetricCard.spec.md`: props defaults, title `趋势指标卡`, size `360 x 180`, `click` and `pointClick` behaviors, and dataset fields `timeField`, `valueField`, `titleField`, `unitField`.

- [ ] **Step 2: Implement index.vue**

Use `useDrComponent` and ECharts. Normalize dataset rows into `{ time, value }`, compute latest value and previous-point comparison, render the KPI text block, build a line/area option with axis/tooltip/animation settings, and trigger card `click` plus ECharts `pointClick`.

- [ ] **Step 3: Implement panel/index.vue**

Bind controls for global, layout, title, value, timestamp, compare, trend, axis, tooltip, and animation using Element Plus controls without internal overrides.

## Task 5: DrPeriodCompareCard

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrPeriodCompareCard/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrPeriodCompareCard/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrPeriodCompareCard/panel/index.vue`

- [ ] **Step 1: Implement install.ts**

Mirror `docs/specs/DrPeriodCompareCard.spec.md`: props defaults, title `周期对比卡`, size `360 x 160`, one `click` behavior, and all seven dataset fields.

- [ ] **Step 2: Implement index.vue**

Use `resolveComparison` so `fields` uses direct current/previous/change fields, `series` uses sorted series and lag, and `autoFallback` prefers direct fields then falls back to series. Render current value, previous value, change value, change rate, and indicator according to layout and trigger `click`.

- [ ] **Step 3: Implement panel/index.vue**

Bind controls for data mode, current, comparison, indicator, layout, text style, animation, and global style.

## Task 6: DrDataTable

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrDataTable/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrDataTable/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrDataTable/panel/index.vue`

- [ ] **Step 1: Implement install.ts**

Mirror `docs/specs/DrDataTable.spec.md`: props defaults, title `数据表格`, size `640 x 360`, row/cell/page/sort behaviors, and dataset fields `displayFields`, `rowKeyField`.

- [ ] **Step 2: Implement index.vue**

Use Element Plus `el-table` and `el-pagination`. Support auto/manual columns, displayFields binding, search, client sort, client pagination, empty text, index column, row/cell click behavior, sortChange, pageChange, and cell formatting.

- [ ] **Step 3: Implement panel/index.vue**

Provide rich controls for global, table basics, manual column list, header/row/cell styles, search, sort, pagination, and formatting.

## Task 7: DrAnalysisTable

**Files:**
- Create: `data-room-ui/src/dataroom-packages/components/DrAnalysisTable/install.ts`
- Create: `data-room-ui/src/dataroom-packages/components/DrAnalysisTable/index.vue`
- Create: `data-room-ui/src/dataroom-packages/components/DrAnalysisTable/panel/index.vue`

- [ ] **Step 1: Implement install.ts**

Mirror `docs/specs/DrAnalysisTable.spec.md`: props defaults, title `分析表格`, size `760 x 420`, row/cell/selection/page/sort/columnState behaviors, and all dataset fields.

- [ ] **Step 2: Implement index.vue**

Use Element Plus `el-table`, `el-pagination`, and `el-popover`. Support raw/aggregate modes, dimensions/metrics, percent metrics, column hide settings, column resizing, search, client sort, pagination, summary row, cell data bars, basic and custom conditional formatting, and all configured behaviors.

- [ ] **Step 3: Implement panel/index.vue**

Provide controls for global, table basics, analysis fields, column config, search, sort, pagination, summary, cell bars, conditional formatting, header/row/cell styles.

## Task 8: Verification and Review

**Files:**
- Modify only if review finds defects in the files created above.

- [ ] **Step 1: Run static regression test**

Run: `node src/dataroom-packages/components/kpiTableComponents.spec.mjs` from `data-room-ui`.
Expected: PASS.

- [ ] **Step 2: Run type-check**

Run: `npm run type-check` from `data-room-ui`.
Expected: PASS.

- [ ] **Step 3: Run lint**

Run: `npm run lint` from `data-room-ui`.
Expected: PASS or only auto-fixed files under the implemented component paths.

- [ ] **Step 4: Final spec and quality reviews**

Review each component against its corresponding `docs/specs/*.spec.md`, `docs/design/DESIGN.md`, and `docs/design/chart-component-config-panel-spec.md`. Confirm no `:deep(.el-*)`, no `!important`, no panel-local props copies, no missing auto-install exports, and no dependency additions.

