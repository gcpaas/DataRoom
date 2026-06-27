# Frontend Action Config Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add typed, form-driven interaction actions to the frontend component behavior dialog, including target component selection with `html-to-image` thumbnails.

**Architecture:** Convert `ChartAction` into a common action shell with per-type `chartActionConfig` objects. Keep action execution centralized in the canvas instance, and keep the dialog focused by moving action labels/defaults and target-selection behavior into reusable helpers/components.

**Tech Stack:** Vue 3, TypeScript, Element Plus, Vite, `html-to-image`, existing DataRoom canvas/component APIs.

---

## File Structure

- Modify `dataRoomFront/package.json` and lockfile: add `html-to-image`.
- Modify `dataRoomFront/src/dataRoom/components/type/ChartAction.ts`: define action type union, config interfaces, labels, defaults, and type guards.
- Modify `dataRoomFront/src/dataRoom/designer/types/CanvasInst.ts`: keep `triggerChartAction` signature and use the new `ChartAction` model.
- Modify `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`: dispatch action execution by `action.type`.
- Create `dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue`: reusable two-column target component picker with layer tree and thumbnail preview.
- Modify `dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue`: editable action type selector and dynamic forms for each action config.
- Reuse `dataRoomFront/src/dataRoom/designer/components/component-layer.ts`: create layer tree data for the selector.
- Reuse `dataRoomFront/src/router/index.ts`: internal navigation for `navigate` actions.

## Task 1: Add `html-to-image`

**Files:**
- Modify: `dataRoomFront/package.json`
- Modify: `dataRoomFront/package-lock.json`

- [ ] **Step 1: Install dependency**

Run:

```bash
cd dataRoomFront
npm install html-to-image
```

Expected:

- `html-to-image` appears under `dependencies` in `package.json`.
- `package-lock.json` is updated.

- [ ] **Step 2: Verify package metadata**

Run:

```bash
cd dataRoomFront
npm ls html-to-image
```

Expected: npm prints a dependency tree containing `html-to-image`.

- [ ] **Step 3: Commit**

```bash
git add dataRoomFront/package.json dataRoomFront/package-lock.json
git commit -m "chore: add html-to-image dependency"
```

## Task 2: Define Typed Chart Actions

**Files:**
- Modify: `dataRoomFront/src/dataRoom/components/type/ChartAction.ts`

- [ ] **Step 1: Replace `ChartAction.ts` with typed action model**

Use this file content:

```ts
export type ChartActionType = 'show' | 'hide' | 'toggleVisibility' | 'navigate' | 'refreshData' | 'updateGlobalVariable' | 'code'

export type NavigateMode = 'external' | 'internal'

export type NavigateTarget = 'self' | 'blank'

export interface ChartActionConfig {
  type: ChartActionType
}

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
  mode: NavigateMode
  url: string
  target: NavigateTarget
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

export type TargetChartActionConfig = ShowActionConfig | HideActionConfig | ToggleVisibilityActionConfig | RefreshDataActionConfig

export type TypedChartActionConfig = TargetChartActionConfig | NavigateActionConfig | UpdateGlobalVariableActionConfig | CodeBlockActionConfig

export interface ChartAction {
  name: string
  type: ChartActionType
  chartActionConfig: TypedChartActionConfig
}

export const CHART_ACTION_TYPE_OPTIONS: Array<{ label: string; value: ChartActionType }> = [
  { label: '显示', value: 'show' },
  { label: '隐藏', value: 'hide' },
  { label: '显隐切换', value: 'toggleVisibility' },
  { label: '页面跳转', value: 'navigate' },
  { label: '数据刷新', value: 'refreshData' },
  { label: '更新全局变量', value: 'updateGlobalVariable' },
  { label: '代码块', value: 'code' },
]

export const getChartActionTypeLabel = (type: ChartActionType | string): string => {
  return CHART_ACTION_TYPE_OPTIONS.find((item) => item.value === type)?.label || String(type || '')
}

export const isTargetChartActionConfig = (config: TypedChartActionConfig): config is TargetChartActionConfig => {
  return config.type === 'show' || config.type === 'hide' || config.type === 'toggleVisibility' || config.type === 'refreshData'
}

export const createDefaultChartActionConfig = (type: ChartActionType): TypedChartActionConfig => {
  if (type === 'navigate') {
    return {
      type,
      mode: 'external',
      url: '',
      target: 'self',
    }
  }
  if (type === 'updateGlobalVariable') {
    return {
      type,
      globalVariableName: '',
      bepName: '',
    }
  }
  if (type === 'code') {
    return {
      type,
      code: '// 请输入JS代码\n',
    }
  }
  return {
    type,
    targetChartIds: [],
  }
}

export const createDefaultChartAction = (index: number): ChartAction => {
  return {
    name: `动作${index}`,
    type: 'code',
    chartActionConfig: createDefaultChartActionConfig('code'),
  }
}
```

- [ ] **Step 2: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: this may fail because call sites still read `action.code`. Continue to Task 3 and Task 5 to update call sites.

## Task 3: Update Runtime Action Execution

**Files:**
- Modify: `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`
- Modify: `dataRoomFront/src/dataRoom/designer/types/CanvasInst.ts`

- [ ] **Step 1: Add router and action config imports**

In `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`, add:

```ts
import router from '@/router'
import { ElMessage } from 'element-plus'
import {
  type ChartAction,
  type CodeBlockActionConfig,
  type NavigateActionConfig,
  type TargetChartActionConfig,
  type UpdateGlobalVariableActionConfig,
  isTargetChartActionConfig,
} from '@/dataRoom/components/type/ChartAction.ts'
```

Keep the existing `ElMessage` import if present; do not duplicate it.

- [ ] **Step 2: Add local runtime helpers above `useCanvasInst`**

Add these helpers in `index.ts` before `export function useCanvasInst(...)`:

```ts
const warnAction = (message: string) => {
  console.warn(message)
}

const executeTargetVisibilityAction = (chartList: Ref<ChartConfig<unknown>[]>, config: TargetChartActionConfig) => {
  for (const chartId of config.targetChartIds) {
    try {
      const targetChart = getChartById(chartId, chartList.value)
      if (config.type === 'show') {
        targetChart.hide = false
        continue
      }
      if (config.type === 'hide') {
        targetChart.hide = true
        continue
      }
      if (config.type === 'toggleVisibility') {
        targetChart.hide = targetChart.hide !== true
      }
    } catch (error) {
      warnAction(`动作目标组件不存在: ${chartId}`)
    }
  }
}

const executeNavigateAction = async (config: NavigateActionConfig) => {
  const url = config.url.trim()
  if (!url) {
    ElMessage.warning('页面跳转地址不能为空')
    return
  }
  if (config.target === 'blank') {
    window.open(url, '_blank')
    return
  }
  if (config.mode === 'internal') {
    await router.push(url)
    return
  }
  window.location.href = url
}

const executeCodeBlockAction = (config: CodeBlockActionConfig, behaviorEventParam: BehaviorEventParam) => {
  const func = new Function('bep', `${config.code}`)
  func(behaviorEventParam)
}

const executeUpdateGlobalVariableAction = (
  canvasInst: CanvasInst,
  config: UpdateGlobalVariableActionConfig,
  triggerData: unknown,
) => {
  if (!config.globalVariableName) {
    warnAction(`更新全局变量动作未选择全局变量`)
    return
  }
  if (!config.bepName) {
    warnAction(`更新全局变量动作未选择赋值参数`)
    return
  }
  const params = triggerData && typeof triggerData === 'object' ? (triggerData as Record<string, unknown>) : {}
  if (!(config.bepName in params)) {
    warnAction(`bep.params 中不存在 ${config.bepName}`)
    return
  }
  const value = params[config.bepName]
  canvasInst.updateGlobalVariableValue(config.globalVariableName, value == null ? '' : String(value))
}
```

- [ ] **Step 3: Update `CanvasInst` action method return types**

In `dataRoomFront/src/dataRoom/designer/types/CanvasInst.ts`, update these method signatures:

```ts
triggerChartAction: (charId: string, action: ChartAction, data: unknown) => Promise<void>
triggerChartBehavior: (charId: string, behaviorEventName: string, triggerData: unknown) => Promise<void>
```

- [ ] **Step 4: Replace `triggerChartAction` implementation**

Replace the current `triggerChartAction` body in `useCanvasInst` with:

```ts
triggerChartAction: async (charId: string = 'unknown', action: ChartAction, data: unknown) => {
  try {
    const config = action.chartActionConfig
    if (!config || config.type !== action.type) {
      warnAction(`动作 [${action.name}] 配置类型不匹配`)
      return
    }
    const behaviorEventParam: BehaviorEventParam = {
      canvasInst: canvasInst,
      params: data,
    }
    if (isTargetChartActionConfig(config)) {
      if (config.type === 'refreshData') {
        for (const targetChartId of config.targetChartIds) {
          try {
            const chartInstance = canvasInst.getChartInstanceById(targetChartId)
            await chartInstance.exposed?.autoRefreshData?.()
          } catch (error) {
            console.warn(`刷新目标组件 ${targetChartId} 失败`, error)
          }
        }
        return
      }
      executeTargetVisibilityAction(chartList, config)
      return
    }
    if (config.type === 'navigate') {
      await executeNavigateAction(config)
      return
    }
    if (config.type === 'updateGlobalVariable') {
      executeUpdateGlobalVariableAction(canvasInst, config, data)
      return
    }
    if (config.type === 'code') {
      executeCodeBlockAction(config, behaviorEventParam)
      return
    }
  } catch (error) {
    console.error(`动作 [${action.name}] 执行失败:`, error)
    ElMessage.error(`动作 [${action.name}] 执行失败: ${error}`)
  }
},
```

- [ ] **Step 5: Make behavior execution await action dispatch**

Change the `triggerChartBehavior` method declaration to `async` and await each action in order:

```ts
triggerChartBehavior: async (charId: string, behaviorName: string, triggerData: unknown) => {
  let chart: ChartConfig<unknown>
  try {
    chart = getChartById(charId, chartList.value)
  } catch {
    return
  }
  if (!chart?.behaviors) {
    return
  }
  const behavior = chart.behaviors[behaviorName]
  if (!behavior || behavior.disabled || !behavior.actions || behavior.actions.length === 0) {
    return
  }
  for (let i = 0; i < behavior.actions.length; i++) {
    const action = behavior.actions[i]
    if (!action) {
      continue
    }
    await canvasInst.triggerChartAction(chart.id, action, triggerData)
  }
},
```

Expected: actions run in configured order, including asynchronous data refresh and internal navigation actions.

- [ ] **Step 6: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: remaining failures should be in `BehaviorConfigDialog.vue` because the form still references old `action.code`.

- [ ] **Step 7: Commit**

```bash
git add dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts dataRoomFront/src/dataRoom/designer/types/CanvasInst.ts dataRoomFront/src/dataRoom/components/type/ChartAction.ts
git commit -m "feat: add typed chart action runtime"
```

## Task 4: Build Target Component Selector Dialog

**Files:**
- Create: `dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue`

- [ ] **Step 1: Create the dialog component**

Create `TargetChartSelectorDialog.vue` with this structure:

```vue
<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { toPng } from 'html-to-image'
import type { TreeNodeData, TreeOptionProps } from 'element-plus'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
import { createLayerNodes, type LayerNode } from '@/dataRoom/designer/components/component-layer.ts'

const props = defineProps<{
  modelValue: boolean
  selectedChartIds: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [value: string[]]
}>()

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const checkedChartIds = ref<string[]>([])
const activeLayerNode = ref<LayerNode>()
const thumbnailUrl = ref('')
const thumbnailLoading = ref(false)
const thumbnailError = ref('')

const layerTreeProps: TreeOptionProps = {
  label: 'title',
  children: 'children',
}

const layerList = computed(() => createLayerNodes(canvasInst.chartList))

const findChartDom = (chartId: string): HTMLElement | null => {
  return document.querySelector(`[data-dr-id="${CSS.escape(chartId)}"]`)
}

const captureLayerThumbnail = async (layerNode: LayerNode) => {
  activeLayerNode.value = layerNode
  thumbnailUrl.value = ''
  thumbnailError.value = ''
  const chartDom = findChartDom(layerNode.chart.id)
  if (!chartDom) {
    thumbnailError.value = '组件当前未在画布中渲染'
    return
  }
  thumbnailLoading.value = true
  try {
    thumbnailUrl.value = await toPng(chartDom, {
      cacheBust: true,
      pixelRatio: 1,
    })
  } catch (error) {
    console.warn(`组件 ${layerNode.chart.id} 缩略图生成失败`, error)
    thumbnailError.value = '缩略图生成失败'
  } finally {
    thumbnailLoading.value = false
  }
}

const onLayerClick = (data: TreeNodeData) => {
  void captureLayerThumbnail(data as LayerNode)
}

const onCheckChange = (data: TreeNodeData, checked: boolean) => {
  const layerNode = data as LayerNode
  if (checked) {
    if (!checkedChartIds.value.includes(layerNode.chart.id)) {
      checkedChartIds.value.push(layerNode.chart.id)
    }
    return
  }
  checkedChartIds.value = checkedChartIds.value.filter((chartId) => chartId !== layerNode.chart.id)
}

const confirmSelection = () => {
  emit('confirm', [...checkedChartIds.value])
  dialogVisible.value = false
}

watch(
  () => props.modelValue,
  (visible) => {
    if (visible) {
      checkedChartIds.value = [...props.selectedChartIds]
      activeLayerNode.value = undefined
      thumbnailUrl.value = ''
      thumbnailError.value = ''
    }
  },
)
</script>

<template>
  <el-dialog v-model="dialogVisible" title="选择目标组件" width="860px" :close-on-click-modal="false">
    <div class="target-chart-selector">
      <div class="target-chart-selector__tree">
        <el-tree
          :data="layerList"
          :props="layerTreeProps"
          node-key="id"
          show-checkbox
          default-expand-all
          :default-checked-keys="checkedChartIds"
          :expand-on-click-node="false"
          @node-click="onLayerClick"
          @check-change="onCheckChange"
        >
          <template #default="{ data }">
            <span class="target-chart-selector__node" :class="{ 'target-chart-selector__node--hidden': data.hidden }">
              {{ data.title || data.chart.id }}
            </span>
          </template>
        </el-tree>
      </div>
      <div class="target-chart-selector__preview">
        <div v-if="thumbnailLoading" class="target-chart-selector__empty">正在生成缩略图</div>
        <img v-else-if="thumbnailUrl" class="target-chart-selector__image" :src="thumbnailUrl" alt="组件缩略图" />
        <div v-else class="target-chart-selector__empty">
          <div>{{ thumbnailError || '点击左侧图层查看缩略图' }}</div>
          <div v-if="activeLayerNode" class="target-chart-selector__meta">
            {{ activeLayerNode.title || activeLayerNode.chart.id }} / {{ activeLayerNode.chart.type }} /
            {{ activeLayerNode.chart.w }} x {{ activeLayerNode.chart.h }}
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="confirmSelection">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.target-chart-selector {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 16px;
  min-height: 420px;
}

.target-chart-selector__tree,
.target-chart-selector__preview {
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  background: var(--el-fill-color-blank);
  padding: 12px;
}

.target-chart-selector__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.target-chart-selector__node {
  color: var(--el-text-color-primary);
}

.target-chart-selector__node--hidden {
  color: var(--el-text-color-secondary);
}

.target-chart-selector__image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border: 1px solid var(--el-border-color-lighter);
}

.target-chart-selector__empty {
  color: var(--el-text-color-secondary);
  text-align: center;
  line-height: 1.6;
}

.target-chart-selector__meta {
  margin-top: 8px;
  font-feature-settings: 'tnum';
}
</style>
```

- [ ] **Step 2: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: this may still fail until `html-to-image` is installed and `BehaviorConfigDialog.vue` is updated.

- [ ] **Step 3: Commit**

```bash
git add dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue
git commit -m "feat: add target chart selector dialog"
```

## Task 5: Convert Behavior Config Dialog to Dynamic Forms

**Files:**
- Modify: `dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue`

- [ ] **Step 1: Update imports**

Add these imports and remove the old direct-only `ChartAction` usage:

```ts
import TargetChartSelectorDialog from '@/dataRoom/designer/components/TargetChartSelectorDialog.vue'
import {
  CHART_ACTION_TYPE_OPTIONS,
  createDefaultChartAction,
  createDefaultChartActionConfig,
  getChartActionTypeLabel,
  isTargetChartActionConfig,
  type ChartAction,
  type ChartActionType,
  type CodeBlockActionConfig,
  type NavigateActionConfig,
  type TargetChartActionConfig,
  type UpdateGlobalVariableActionConfig,
} from '@/dataRoom/components/type/ChartAction.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
```

- [ ] **Step 2: Add `globalVariableList` prop**

Change props to:

```ts
const props = defineProps<{
  modelValue: boolean
  behavior: Behavior
  chart: ChartConfig<unknown>
  globalVariableList?: GlobalVariable[]
}>()
```

- [ ] **Step 3: Update add action**

Replace `addAction` new action creation with:

```ts
const addAction = () => {
  const config = getBehaviorConfig()
  if (!config) {
    return
  }
  const newAction = createDefaultChartAction(config.actions.length + 1)
  config.actions.push(newAction)
  activeActionIndex.value = config.actions.length - 1
  ElMessage.success('已添加新的动作')
}
```

- [ ] **Step 4: Add form computed helpers**

Add these helpers in the script:

```ts
const targetSelectorVisible = ref(false)
const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const currentTargetConfig = computed<TargetChartActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config && isTargetChartActionConfig(config) ? config : null
})

const currentNavigateConfig = computed<NavigateActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'navigate' ? config : null
})

const currentUpdateGlobalVariableConfig = computed<UpdateGlobalVariableActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'updateGlobalVariable' ? config : null
})

const currentCodeBlockConfig = computed<CodeBlockActionConfig | null>(() => {
  const config = currentAction.value?.chartActionConfig
  return config?.type === 'code' ? config : null
})

const selectedBepParam = computed(() => {
  const bepName = currentUpdateGlobalVariableConfig.value?.bepName
  return props.behavior.paramsList.find((param) => param.name === bepName)
})

const findChartInList = (charts: ChartConfig<unknown>[] | undefined, chartId: string): ChartConfig<unknown> | undefined => {
  if (!charts) return undefined
  for (const chart of charts) {
    if (chart.id === chartId) return chart
    const child = findChartInList(chart.children, chartId)
    if (child) return child
  }
  return undefined
}

const resolveChartTitle = (chartId: string): string => {
  const found = findChartInList(canvasInst.chartList.value, chartId)
  return found?.title || (found ? found.id : `组件已不存在: ${chartId}`)
}

const selectedTargetSummary = computed(() => {
  const ids = currentTargetConfig.value?.targetChartIds || []
  if (ids.length === 0) {
    return '未选择目标组件'
  }
  return ids.map(resolveChartTitle).join('、')
})

const onActionTypeChange = (type: ChartActionType) => {
  if (!currentAction.value) {
    return
  }
  currentAction.value.type = type
  currentAction.value.chartActionConfig = createDefaultChartActionConfig(type)
}

const onTargetChartConfirm = (targetChartIds: string[]) => {
  if (!currentTargetConfig.value) {
    return
  }
  currentTargetConfig.value.targetChartIds = targetChartIds
}
```

If `CanvasInst` and `DrConst` are not already imported, import them. Add `inject` to the existing Vue import instead of creating a duplicate Vue import:

```ts
import { computed, inject, ref, watch } from 'vue'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
```

- [ ] **Step 5: Replace action type rendering**

In the action list, replace old type text with:

```vue
<div class="action-type">{{ getChartActionTypeLabel(action.type) }}</div>
```

- [ ] **Step 6: Replace right-side form**

Replace the old disabled type select and code textarea section with dynamic sections:

```vue
<el-form v-if="currentAction" label-width="110px" label-position="left" size="default">
  <el-form-item label="动作名称">
    <el-input v-model="currentAction.name" placeholder="请输入动作名称" clearable />
  </el-form-item>
  <el-form-item label="动作类型">
    <el-select :model-value="currentAction.type" @change="(value: ChartActionType) => onActionTypeChange(value)">
      <el-option v-for="item in CHART_ACTION_TYPE_OPTIONS" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </el-form-item>

  <template v-if="currentTargetConfig">
    <el-form-item label="目标组件">
      <div class="target-chart-field">
        <span class="target-chart-field__summary">{{ selectedTargetSummary }}</span>
        <el-button size="small" @click="targetSelectorVisible = true">选择组件</el-button>
      </div>
    </el-form-item>
  </template>

  <template v-else-if="currentNavigateConfig">
    <el-form-item label="跳转方式">
      <el-select v-model="currentNavigateConfig.mode">
        <el-option label="外部链接" value="external" />
        <el-option label="内部路由" value="internal" />
      </el-select>
    </el-form-item>
    <el-form-item label="跳转地址">
      <el-input v-model="currentNavigateConfig.url" placeholder="请输入跳转地址" clearable />
    </el-form-item>
    <el-form-item label="打开方式">
      <el-select v-model="currentNavigateConfig.target">
        <el-option label="当前窗口" value="self" />
        <el-option label="新窗口" value="blank" />
      </el-select>
    </el-form-item>
  </template>

  <template v-else-if="currentUpdateGlobalVariableConfig">
    <el-form-item label="全局变量名称">
      <el-select v-model="currentUpdateGlobalVariableConfig.globalVariableName" placeholder="请选择全局变量">
        <el-option v-for="item in props.globalVariableList || []" :key="item.id" :label="item.name" :value="item.name" />
      </el-select>
    </el-form-item>
    <el-form-item label="赋值">
      <el-select v-model="currentUpdateGlobalVariableConfig.bepName" placeholder="请选择赋值参数">
        <el-option v-for="param in behavior.paramsList" :key="param.name" :label="`${param.name} - ${param.desc}`" :value="param.name" />
      </el-select>
    </el-form-item>
    <el-form-item label="值描述">
      <el-alert type="info" :closable="false">
        {{ selectedBepParam ? `${selectedBepParam.name} (${selectedBepParam.type}): ${selectedBepParam.desc}` : '请选择赋值参数' }}
      </el-alert>
    </el-form-item>
  </template>

  <template v-else-if="currentCodeBlockConfig">
    <el-form-item label="JS代码">
      <el-input v-model="currentCodeBlockConfig.code" type="textarea" :rows="12" placeholder="请输入JavaScript代码" />
    </el-form-item>
    <el-form-item label="说明">
      <el-alert type="info" :closable="false">
        <template #default>
          <div class="param-help-title">bep.params对象属性说明</div>
          <div v-for="param in behavior.paramsList" :key="param.name" class="param-help-row">
            <strong>{{ param.name }}</strong> ({{ param.type }}): {{ param.desc }}
          </div>
          <div v-if="behavior.paramsList.length === 0" class="param-help-empty">无参数</div>
        </template>
      </el-alert>
    </el-form-item>
  </template>
</el-form>
```

- [ ] **Step 7: Mount target selector dialog**

Add this near the existing dialog footer:

```vue
<TargetChartSelectorDialog
  v-if="targetSelectorVisible && currentTargetConfig"
  v-model="targetSelectorVisible"
  :selected-chart-ids="currentTargetConfig.targetChartIds"
  @confirm="onTargetChartConfirm"
/>
```

- [ ] **Step 8: Add form layout styles**

Add to the scoped style:

```scss
.target-chart-field {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.target-chart-field__summary {
  flex: 1;
  min-width: 0;
  color: var(--el-text-color-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

- [ ] **Step 9: Pass global variables from control panel**

In `dataRoomFront/src/dataRoom/designer/components/ControlPanel.vue`, update the dialog mount:

```vue
<BehaviorConfigDialog
  v-if="behaviorConfigDialogVisible && currentBehavior"
  v-model="behaviorConfigDialogVisible"
  :behavior="currentBehavior"
  :chart="chartConfig"
  :global-variable-list="globalVariableList"
/>
```

- [ ] **Step 10: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS, or concrete failures about imports/typing in the modified files that should be fixed before continuing.

- [ ] **Step 11: Commit**

```bash
git add dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue dataRoomFront/src/dataRoom/designer/components/ControlPanel.vue
git commit -m "feat: add typed behavior action forms"
```

## Task 6: Polish Runtime and Selector Edge Cases

**Files:**
- Modify: `dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue`
- Modify: `dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts`
- Modify: `dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue`

- [ ] **Step 1: Add `CSS.escape` fallback**

Add this helper in `TargetChartSelectorDialog.vue`:

```ts
const escapeCssValue = (value: string): string => {
  return typeof CSS !== 'undefined' && typeof CSS.escape === 'function' ? CSS.escape(value) : value.replace(/"/g, '\\"')
}
```

Then update `findChartDom`:

```ts
const findChartDom = (chartId: string): HTMLElement | null => {
  return document.querySelector(`[data-dr-id="${escapeCssValue(chartId)}"]`)
}
```

- [ ] **Step 2: Verify no Element Plus internals are overridden**

Run:

```bash
rg -n ":deep\\(\\.el-|::v-deep|/deep/|>>>|!important|#[0-9a-fA-F]{3,8}|rgb\\(|hsl\\(" dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue
```

Expected: no matches.

- [ ] **Step 3: Run lint**

Run:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS. If lint rewrites files, review `git diff` before committing.

- [ ] **Step 4: Commit**

```bash
git add dataRoomFront/src/dataRoom/designer/components/TargetChartSelectorDialog.vue dataRoomFront/src/dataRoom/hooks/use-canvas-inst/index.ts dataRoomFront/src/dataRoom/designer/components/BehaviorConfigDialog.vue
git commit -m "fix: handle action config edge cases"
```

## Task 7: Final Validation

**Files:**
- All files changed by Tasks 1-6

- [ ] **Step 1: Run final type check**

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 2: Run final lint**

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS.

- [ ] **Step 3: Build frontend**

```bash
cd dataRoomFront
npm run build
```

Expected: PASS and Vite emits the production build to `dataRoomFront/dataRoom/`.

- [ ] **Step 4: Manual smoke test in development server**

Run:

```bash
cd dataRoomFront
npm run dev
```

Manual checks:

- Open a designer page.
- Open a component interaction behavior.
- Add a new action and confirm it defaults to 代码块.
- Change action type to 显示, 隐藏, 显隐切换, 数据刷新, 页面跳转, 更新全局变量, and 代码块; each form switches correctly.
- Use the target component selector; checkboxes change target IDs and clicking a layer node refreshes the thumbnail.
- Trigger a behavior and verify target component visibility, data refresh, navigation, global variable update, and code block execution.

- [ ] **Step 5: Commit any final lint/build changes**

```bash
git status --short
git add dataRoomFront
git commit -m "test: validate frontend action config"
```

Only run this commit if validation commands changed tracked files. If there are no changes, do not create an empty commit.

## Self-Review

- Spec coverage: action model, all in-scope action forms, target selector, `html-to-image` thumbnail behavior, runtime execution, non-goals, and validation are covered.
- Placeholder scan: no unresolved placeholder markers are intentionally left in this plan.
- Type consistency: `ChartAction.type`, `chartActionConfig`, `bepName`, `targetChartIds`, and action type string values match the approved spec.
