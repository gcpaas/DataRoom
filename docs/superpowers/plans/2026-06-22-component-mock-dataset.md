# Component Mock Dataset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable "数据样例" button in the component data panel and make the bar chart's default render data share the same `mockDataset` source shown in the sample dialog.

**Architecture:** Components optionally export `mockDataset` from `install.ts`. `AutoInstall.ts` registers that metadata and exposes a getter. `ControlPanel.vue` renders a generic dialog from the registered metadata, while `DrBarChart/index.vue` imports its own `mockDataset.dataset` for default data when no dataset is configured.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vite, Element Plus, existing DataRoom component auto-registration.

---

## File Structure

- Modify `dataRoomFront/src/dataRoom/components/type/ChartMockDataset.ts`
  - New focused type file for the optional mock dataset contract.
- Modify `dataRoomFront/src/dataRoom/components/AutoInstall.ts`
  - Register optional `mockDataset` exports and expose `getComponentMockDataset`.
- Modify `dataRoomFront/src/dataRoom/_components/ControlPanel.vue`
  - Add the "数据样例" button below the dataset picker.
  - Add the sample dialog, JSON formatting, and mapping table data.
- Modify `dataRoomFront/src/dataRoom/components/DrBarChart/install.ts`
  - Export `mockDataset` using the agreed `dataset` and `fields` structure.
- Modify `dataRoomFront/src/dataRoom/components/DrBarChart/index.vue`
  - Reuse `mockDataset.dataset` for default rendering when no dataset is configured.

---

### Task 1: Add Mock Dataset Type And Registry

**Files:**
- Create: `dataRoomFront/src/dataRoom/components/type/ChartMockDataset.ts`
- Modify: `dataRoomFront/src/dataRoom/components/AutoInstall.ts`

- [ ] **Step 1: Add the mock dataset type**

Create `dataRoomFront/src/dataRoom/components/type/ChartMockDataset.ts`:

```ts
/**
 * Component mock dataset definition.
 *
 * dataset is the raw sample data shown in the data sample dialog and reused
 * by components as their design-time default data when no dataset is configured.
 *
 * fields maps component dataset field names to fields in dataset rows.
 */
export interface ChartMockDataset {
  dataset: unknown[]
  fields: ChartMockDatasetField[]
}

export interface ChartMockDatasetField {
  name: string
  bindName: string
}
```

- [ ] **Step 2: Register optional `mockDataset` exports**

In `dataRoomFront/src/dataRoom/components/AutoInstall.ts`, add the type import near the other type imports:

```ts
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts";
```

Add the map type near `datasetFieldMap`:

```ts
type MockDatasetMap = {
  [key: string]: ChartMockDataset
}
```

Widen the `installModules` generic so TypeScript accepts optional `mockDataset`:

```ts
const installModules = import.meta.glob<{
  [key: string]: Component | (() => ChartConfig<unknown>) | Behavior[] | ChartDatasetField[] | ChartMockDataset
}>('./**/install.ts', {eager: true})
```

Add storage near the existing maps:

```ts
const mockDatasets: MockDatasetMap = {}
```

Add registration inside `Object.entries(installModules).forEach` after dataset fields registration:

```ts
  // 注册组件模拟数据集定义
  const mockDatasetDefineName = `mockDataset`
  if (module[mockDatasetDefineName]) {
    mockDatasets[componentName] = module[mockDatasetDefineName] as ChartMockDataset
  }
```

Add getter near `getComponentDatasetFields`:

```ts
const getComponentMockDataset = (name: string): ChartMockDataset | null => {
  return mockDatasets[name] || null
}
```

Export the new getter and map:

```ts
export {
  components,
  panelComponents,
  componentInstances,
  getComponentBehaviors,
  getComponent,
  getPanelComponent,
  getComponentInstance,
  getComponentDatasetFields,
  getComponentMockDataset,
  mockDatasets
}
```

- [ ] **Step 3: Run type check for registry changes**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: TypeScript may fail because no component exports `mockDataset` yet only if the import or union type is wrong. Fix syntax or type errors in the files changed by this task before continuing.

- [ ] **Step 4: Commit**

```bash
git add dataRoomFront/src/dataRoom/components/type/ChartMockDataset.ts dataRoomFront/src/dataRoom/components/AutoInstall.ts
git commit -m "feat(front): register component mock datasets"
```

---

### Task 2: Add Bar Chart Mock Dataset

**Files:**
- Modify: `dataRoomFront/src/dataRoom/components/DrBarChart/install.ts`

- [ ] **Step 1: Import the mock dataset type**

In `dataRoomFront/src/dataRoom/components/DrBarChart/install.ts`, add:

```ts
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts"
```

- [ ] **Step 2: Export `mockDataset` after `datasetFields`**

Add this after the existing `datasetFields` declaration:

```ts
/**
 * 组件内置模拟数据集。
 *
 * dataset 用于数据样例弹窗和未配置数据集时的设计态默认渲染。
 * fields 表示组件字段默认绑定到模拟数据中的哪个字段。
 */
const mockDataset: ChartMockDataset = {
  dataset: [
    {
      time: '2024-06-05',
      value: 100,
    },
    {
      time: '2024-06-06',
      value: 90,
    },
    {
      time: '2024-06-07',
      value: 120,
    },
    {
      time: '2024-06-08',
      value: 80,
    },
    {
      time: '2024-06-09',
      value: 150,
    },
    {
      time: '2024-06-10',
      value: 110,
    },
  ],
  fields: [
    {
      name: 'xField',
      bindName: 'time',
    },
    {
      name: 'yField',
      bindName: 'value',
    },
  ],
}
```

Update the final export:

```ts
export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
```

- [ ] **Step 3: Run type check for the new export**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: TypeScript should pass for `DrBarChart/install.ts`. If it fails on import formatting or the final export, correct only this task's files.

- [ ] **Step 4: Commit**

```bash
git add dataRoomFront/src/dataRoom/components/DrBarChart/install.ts
git commit -m "feat(front): add bar chart mock dataset"
```

---

### Task 3: Reuse Bar Chart Mock Dataset For Default Rendering

**Files:**
- Modify: `dataRoomFront/src/dataRoom/components/DrBarChart/index.vue`

- [ ] **Step 1: Import `mockDataset` with the existing bar chart config type**

Change the import:

```ts
import type {DrBarChartConfig} from './install.ts'
```

to:

```ts
import {mockDataset, type DrBarChartConfig} from './install.ts'
```

- [ ] **Step 2: Replace inline default data**

Replace this block:

```ts
  // 使用默认示例数据渲染
  if (shouldUseDefaultChartData(chart) && chartData.value.length === 0) {
    chartData.value = [
      {x: '一月', y: 120, s: '系列1'},
      {x: '二月', y: 200, s: '系列1'},
      {x: '三月', y: 150, s: '系列1'},
      {x: '四月', y: 80, s: '系列1'},
      {x: '五月', y: 170, s: '系列1'},
      {x: '六月', y: 110, s: '系列1'},
    ]
  }
```

with:

```ts
  // 使用组件模拟数据集渲染设计态默认数据
  if (shouldUseDefaultChartData(chart) && chartData.value.length === 0) {
    chartData.value = [...mockDataset.dataset]
  }
```

- [ ] **Step 3: Ensure default field names still match the mock data**

Replace these lines in `buildOption`:

```ts
  const xFieldNames = getChartDatasetFieldNames(chart, 'xField', ['x'])
  const yFieldNames = getChartDatasetFieldNames(chart, 'yField', ['y'])
```

with:

```ts
  const xFieldNames = getChartDatasetFieldNames(chart, 'xField', ['time'])
  const yFieldNames = getChartDatasetFieldNames(chart, 'yField', ['value'])
```

- [ ] **Step 4: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: TypeScript passes. The component should still compile because `mockDataset.dataset` is `unknown[]` and `chartData` is `any[]`.

- [ ] **Step 5: Commit**

```bash
git add dataRoomFront/src/dataRoom/components/DrBarChart/index.vue
git commit -m "feat(front): reuse bar chart mock dataset"
```

---

### Task 4: Add Data Sample Dialog To Control Panel

**Files:**
- Modify: `dataRoomFront/src/dataRoom/_components/ControlPanel.vue`

- [ ] **Step 1: Import registry getter and type**

Change the AutoInstall import:

```ts
import { getComponentBehaviors, getComponentDatasetFields } from '@/dataRoom/components/AutoInstall.ts'
```

to:

```ts
import { getComponentBehaviors, getComponentDatasetFields, getComponentMockDataset } from '@/dataRoom/components/AutoInstall.ts'
```

Add this type import near the other component type imports:

```ts
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'
```

- [ ] **Step 2: Add state and computed values**

Add these declarations after `const datasetFields = ref<ChartDatasetField[]>([])`:

```ts
const mockDataset = ref<ChartMockDataset | null>(null)
const mockDatasetDialogVisible = ref(false)
```

Add these computed values after `dataFormRules`:

```ts
const mockDatasetJson = computed(() => {
  if (!mockDataset.value) {
    return ''
  }
  return JSON.stringify(mockDataset.value.dataset, null, 2)
})

const mockDatasetFieldRows = computed(() => {
  if (!mockDataset.value) {
    return []
  }
  return mockDataset.value.fields.map((mockField) => {
    const fieldMeta = datasetFields.value.find((field) => field.name === mockField.name)
    return {
      name: mockField.name,
      bindName: mockField.bindName,
      desc: fieldMeta?.desc || mockField.name,
      required: fieldMeta?.required ? '是' : '否',
    }
  })
})
```

- [ ] **Step 3: Load component mock dataset during component metadata initialization**

In `initComponentData`, change:

```ts
  datasetFields.value = getComponentDatasetFields(chart.type)
  behaviors.value = getComponentBehaviors(chart.type)
```

to:

```ts
  datasetFields.value = getComponentDatasetFields(chart.type)
  mockDataset.value = getComponentMockDataset(chart.type)
  behaviors.value = getComponentBehaviors(chart.type)
```

- [ ] **Step 4: Add the open dialog handler**

Add this function near `openDatasetDialog`:

```ts
// 打开组件数据样例对话框
const openMockDatasetDialog = () => {
  mockDatasetDialogVisible.value = true
}
```

- [ ] **Step 5: Add the button below the dataset picker**

In the "数据集选择" collapse item, replace:

```vue
                  <el-form-item label="数据集">
                    <el-input v-model="datasetName" placeholder="请选择数据集" :suffix-icon="Pointer" readonly @click="openDatasetDialog" class="dataset-picker-input"></el-input>
                  </el-form-item>
```

with:

```vue
                  <el-form-item label="数据集">
                    <el-input v-model="datasetName" placeholder="请选择数据集" :suffix-icon="Pointer" readonly @click="openDatasetDialog" class="dataset-picker-input"></el-input>
                  </el-form-item>
                  <el-form-item label=" ">
                    <el-button size="small" @click="openMockDatasetDialog">数据样例</el-button>
                  </el-form-item>
```

- [ ] **Step 6: Add the dialog template**

Add this dialog after the existing dataset selection dialog and before the behavior config dialog:

```vue
    <!-- 组件数据样例对话框 -->
    <el-dialog v-model="mockDatasetDialogVisible" title="数据样例" width="720px" :close-on-click-modal="false">
      <template v-if="mockDataset">
        <div class="mock-dataset-dialog">
          <div class="mock-dataset-json">{{ mockDatasetJson }}</div>
          <el-table class="mock-dataset-table" :data="mockDatasetFieldRows" border>
            <el-table-column prop="name" label="组件字段" min-width="140" />
            <el-table-column prop="bindName" label="样例字段" min-width="140" />
            <el-table-column prop="desc" label="字段说明" min-width="220" />
            <el-table-column prop="required" label="必填" width="80" />
          </el-table>
        </div>
      </template>
      <el-empty v-else description="该组件暂未提供数据样例" :image-size="120" />
    </el-dialog>
```

- [ ] **Step 7: Add scoped layout styles without overriding Element Plus internals**

Add these styles inside the existing scoped style:

```scss
.mock-dataset-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mock-dataset-json {
  max-height: 320px;
  overflow: auto;
  padding: 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  color: var(--el-text-color-primary);
  font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
  font-size: 13px;
  line-height: 1.5;
  white-space: pre;
}

.mock-dataset-table {
  width: 100%;
}
```

- [ ] **Step 8: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: TypeScript passes. If Vue template typing fails for computed data, keep `mockDatasetFieldRows` returning objects with `name`, `bindName`, `desc`, and `required` string properties.

- [ ] **Step 9: Commit**

```bash
git add dataRoomFront/src/dataRoom/_components/ControlPanel.vue
git commit -m "feat(front): show component data samples"
```

---

### Task 5: Final Validation

**Files:**
- Verify changed frontend files only.

- [ ] **Step 1: Run full frontend type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 2: Run frontend lint**

Run:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS or only auto-fixed formatting changes. If lint auto-fixes files touched by this plan, inspect and commit those formatting changes.

- [ ] **Step 3: Start the dev server for manual verification**

Run:

```bash
cd dataRoomFront
npm run dev
```

Expected: Vite prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 4: Manually verify the configured behaviors**

Open the designer route in the browser, select or add a bar chart, and verify:

- The data tab's "数据集选择" section shows "数据样例" below the dataset picker input.
- Clicking "数据样例" opens a dialog with formatted JSON containing `time` and `value`.
- The mapping table shows `xField -> time` and `yField -> value`.
- A component without `mockDataset` opens the dialog with "该组件暂未提供数据样例".
- A new bar chart with no configured dataset renders using the `time` and `value` mock data.

- [ ] **Step 5: Commit validation fixes if any**

If validation changed files, commit them:

```bash
git add dataRoomFront/src/dataRoom
git commit -m "fix(front): polish component data sample validation"
```

If no files changed, do not create an empty commit.

---

## Self-Review

- Spec coverage: The plan covers the `mockDataset` component contract, registry getter, control panel button and dialog, bar chart mock dataset export, default rendering reuse, unsupported component empty state, and frontend validation.
- Placeholder scan: The plan contains no `TBD`, no unfilled sections, and no vague implementation steps.
- Type consistency: The property names are consistent across tasks: `mockDataset`, `dataset`, `fields`, `name`, `bindName`, and `getComponentMockDataset`.
