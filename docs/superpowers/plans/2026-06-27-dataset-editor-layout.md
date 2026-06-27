# Dataset Editor Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework dataset edit dialogs into a unified layout with optional left metadata, collapsible right-side settings, and collapsible preview tabs for data and fields.

**Architecture:** `DatasetEditorLayout.vue` becomes the shared shell for all dataset editors. Each editor keeps its own state, validation, test, parse, and save behavior, but moves field-list rendering into the layout's `fields` slot and wraps ordinary settings in a two-column grid with full-width rows for editors and tables.

**Tech Stack:** Vue 3 `<script setup>`, TypeScript, Element Plus, SCSS scoped styles, CodeMirror, existing `datasetApi` and `dataSourceApi`.

---

## File Structure

- Modify: `dataRoomFront/src/dataRoom/dataset/components/DatasetEditorLayout.vue`
  - Owns optional metadata slot, settings collapse state, preview collapse state, data/fields tabs, shared two-column layout classes, and preview table placement.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/DatasetPreviewTable.vue`
  - Removes its outer card title styling so it can render cleanly inside the new preview tab body.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/JsonEditor.vue`
  - Moves field table into the `fields` slot and applies settings grid/full-row classes.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue`
  - Moves field table into the `fields` slot and applies settings grid/full-row classes.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/SqlEditor.vue`
  - Renames metadata slot usage, moves field table into the `fields` slot, and applies settings grid/full-row classes.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/ExcelEditor.vue`
  - Renames metadata slot usage, moves field table into the `fields` slot, and applies settings grid/full-row classes while keeping the Excel metadata tree.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/EsEditor.vue`
  - Moves field table into the `fields` slot and applies settings grid/full-row classes.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/WebSocketEditor.vue`
  - Moves field table into the `fields` slot and applies settings grid/full-row classes.
- Modify: `dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue`
  - Moves generated output fields into the `fields` slot while keeping MQTT field mappings in settings.
- Do not modify: `dataRoomFront/src/dataRoom/data-source/index.vue`
  - It has unrelated local changes in the current worktree.

## Task 1: Rebuild The Shared Dataset Layout

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/components/DatasetEditorLayout.vue`

- [ ] **Step 1: Replace the component script with collapse and tab state**

Use this script:

```vue
<script setup lang="ts">
import { computed, ref, useSlots } from 'vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import DatasetPreviewTable from './DatasetPreviewTable.vue'

defineProps<{
  previewData?: unknown
}>()

const slots = useSlots()
const settingsExpanded = ref(true)
const previewExpanded = ref(true)
const activePreviewTab = ref<'data' | 'fields'>('data')
const hasMetadata = computed(() => Boolean(slots.metadata))

const toggleSettings = () => {
  settingsExpanded.value = !settingsExpanded.value
}

const togglePreview = () => {
  previewExpanded.value = !previewExpanded.value
}
</script>
```

- [ ] **Step 2: Replace the template with optional metadata, collapsible settings, and tabs**

Use this template:

```vue
<template>
  <div class="dataset-editor-layout" :class="{ 'dataset-editor-layout--with-metadata': hasMetadata }">
    <div v-if="hasMetadata" class="dataset-editor-layout__metadata">
      <slot name="metadata" />
    </div>

    <div class="dataset-editor-layout__workspace">
      <section class="dataset-editor-panel" :class="{ 'dataset-editor-panel--collapsed': !settingsExpanded }">
        <button class="dataset-editor-panel__header" type="button" @click="toggleSettings">
          <span class="dataset-editor-panel__title">基础设置</span>
          <el-icon class="dataset-editor-panel__icon">
            <ArrowDown v-if="settingsExpanded" />
            <ArrowRight v-else />
          </el-icon>
        </button>
        <div v-show="settingsExpanded" class="dataset-editor-panel__body">
          <slot />
        </div>
      </section>

      <section class="dataset-editor-panel dataset-editor-preview" :class="{ 'dataset-editor-panel--collapsed': !previewExpanded }">
        <button class="dataset-editor-panel__header" type="button" @click="togglePreview">
          <span class="dataset-editor-panel__title">数据预览</span>
          <el-icon class="dataset-editor-panel__icon">
            <ArrowDown v-if="previewExpanded" />
            <ArrowRight v-else />
          </el-icon>
        </button>
        <div v-show="previewExpanded" class="dataset-editor-panel__body dataset-editor-preview__body">
          <el-tabs v-model="activePreviewTab" class="dataset-editor-preview__tabs">
            <el-tab-pane label="数据" name="data">
              <div class="dataset-editor-preview__tab-content">
                <DatasetPreviewTable :data="previewData" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="字段" name="fields">
              <div class="dataset-editor-preview__tab-content">
                <slot name="fields" />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </section>
    </div>
  </div>
</template>
```

- [ ] **Step 3: Replace the scoped styles**

Use these styles. They only style outer layout and use Element Plus variables:

```scss
<style scoped lang="scss">
.dataset-editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-height: 640px;
  padding: 20px 24px;
  box-sizing: border-box;
}

.dataset-editor-layout--with-metadata {
  grid-template-columns: 260px minmax(0, 1fr);
}

.dataset-editor-layout__metadata,
.dataset-editor-layout__workspace {
  min-width: 0;
  min-height: 0;
}

.dataset-editor-layout__workspace {
  display: grid;
  grid-template-rows: minmax(280px, 1.1fr) minmax(220px, 0.9fr);
  gap: 16px;
}

.dataset-editor-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-sizing: border-box;
}

.dataset-editor-panel--collapsed {
  min-height: 48px;
}

.dataset-editor-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  width: 100%;
  min-height: 48px;
  padding: 0 16px;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-blank);
  border: 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-sizing: border-box;
}

.dataset-editor-panel__title {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.57;
  letter-spacing: 0;
}

.dataset-editor-panel__icon {
  color: var(--el-text-color-secondary);
}

.dataset-editor-panel__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  overflow: auto;
  box-sizing: border-box;
}

.dataset-editor-preview__body {
  display: flex;
  padding-top: 8px;
  overflow: hidden;
}

.dataset-editor-preview__tabs {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

:deep(.dataset-editor-form-grid) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 0;
  align-items: start;
}

:deep(.dataset-editor-form-grid__full) {
  grid-column: 1 / -1;
}

:deep(.dataset-form-section) {
  width: 100%;
  min-width: 0;
}

:deep(.dataset-form-toolbar) {
  margin-bottom: 8px;
}

:deep(.dataset-form-table) {
  width: 100%;
  font-feature-settings: 'tnum';
}

:deep(.dataset-form-table--spaced) {
  margin-top: 8px;
}

.dataset-editor-preview__tab-content {
  height: 360px;
  min-height: 0;
  overflow: auto;
}
</style>
```

- [ ] **Step 4: Run type check for the shared layout change**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: it may fail because editors still use the old `before-panel` slot. Continue to Task 2 if the only errors are slot/template references from dataset editors.

## Task 2: Simplify Dataset Preview Table For Tab Embedding

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/components/DatasetPreviewTable.vue`

- [ ] **Step 1: Replace the template outer title with a content-only section**

Use this template:

```vue
<template>
  <section class="dataset-preview-table-panel">
    <div class="dataset-preview-table-wrap">
      <el-table
        v-if="previewColumns.length > 0"
        class="dataset-preview-table"
        :data="previewRows"
        border
        height="100%"
      >
        <el-table-column
          v-for="column in previewColumns"
          :key="column"
          :prop="column"
          :label="column"
          min-width="120"
          show-overflow-tooltip
          :formatter="formatPreviewCell"
        />
      </el-table>
      <el-empty
        v-else
        class="dataset-preview-empty"
        description="点击【仅测试】来显示数据"
        :image-size="100"
      />
    </div>
  </section>
</template>
```

- [ ] **Step 2: Replace the styles with content-only styles**

Use this style block:

```scss
<style scoped lang="scss">
.dataset-preview-table-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.dataset-preview-table-wrap {
  flex: 1;
  min-height: 0;
}

.dataset-preview-table {
  width: 100%;
  font-feature-settings: 'tnum';
}

.dataset-preview-empty {
  height: 100%;
}
</style>
```

- [ ] **Step 3: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: remaining failures should only be from editors not yet migrated.

## Task 3: Migrate JSON And HTTP Editors

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/components/JsonEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue`

- [ ] **Step 1: Update `JsonEditor.vue` form classes**

Change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="100px">
```

Set `JSON数据` to full width:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="JSON数据">
```

- [ ] **Step 2: Move JSON field list into the layout `fields` slot**

Remove the `字段列表` form item from the default slot and add this before `</DatasetEditorLayout>`:

```vue
<template #fields>
  <div class="dataset-form-section">
    <div class="dataset-form-toolbar">
      <el-button type="primary" size="small" @click="parseFields">字段解析</el-button>
    </div>
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击「字段解析」按钮自动解析字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 3: Update `HttpEditor.vue` form classes and full-width items**

Change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="120px">
```

Add `class="dataset-editor-form-grid__full"` to the `请求头`, `请求体`, and `入参配置` `el-form-item` tags:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="请求头">
<el-form-item class="dataset-editor-form-grid__full" label="请求体">
<el-form-item class="dataset-editor-form-grid__full" label="入参配置">
```

- [ ] **Step 4: Move HTTP field list into the layout `fields` slot**

Remove the `字段列表` form item from the default slot and add:

```vue
<template #fields>
  <div class="dataset-form-section">
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击测试按钮获取字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 5: Remove duplicated local shared styles**

In both files, remove local definitions for these selectors if they duplicate layout-level styles:

```scss
.dataset-form-section
.dataset-form-toolbar
.dataset-form-table
.dataset-form-table--spaced
```

Keep editor-specific styles such as `.json-editor-shell`, `.json-format-action`, and `.codemirror-wrapper`.

- [ ] **Step 6: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: remaining failures should only be from unmigrated editors.

- [ ] **Step 7: Commit JSON and HTTP migration**

Run:

```bash
git add dataRoomFront/src/dataRoom/dataset/components/DatasetEditorLayout.vue dataRoomFront/src/dataRoom/dataset/components/DatasetPreviewTable.vue dataRoomFront/src/dataRoom/dataset/components/JsonEditor.vue dataRoomFront/src/dataRoom/dataset/components/HttpEditor.vue
git commit -m "feat(front): add dataset editor preview tabs"
```

## Task 4: Migrate SQL And Excel Editors

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/components/SqlEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/dataset/components/ExcelEditor.vue`

- [ ] **Step 1: Rename metadata slots**

In both files, change:

```vue
<template #before-panel>
```

to:

```vue
<template #metadata>
```

- [ ] **Step 2: Update SQL form classes and full-width items**

In `SqlEditor.vue`, change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="100px">
```

Add full-width class to `SQL语句` and `入参配置`:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="SQL语句">
<el-form-item class="dataset-editor-form-grid__full" label="入参配置">
```

- [ ] **Step 3: Move SQL field list into the layout `fields` slot**

Remove the `字段列表` form item from the default slot and add:

```vue
<template #fields>
  <div class="dataset-form-section">
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击测试按钮获取字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 4: Update Excel form classes and full-width items**

In `ExcelEditor.vue`, change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="100px">
```

Add full-width class to `SQL语句` and `入参配置`:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="SQL语句">
<el-form-item class="dataset-editor-form-grid__full" label="入参配置">
```

- [ ] **Step 5: Move Excel field list into the layout `fields` slot**

Remove the `字段列表` form item from the default slot and add:

```vue
<template #fields>
  <div class="dataset-form-section">
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击测试按钮获取字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 6: Remove duplicated local shared styles**

In both files, remove duplicated local definitions for:

```scss
.dataset-form-section
.dataset-form-table
.dataset-form-table--spaced
```

Keep metadata tree styles, SQL editor shell styles, CodeMirror styles, and datasource option styles.

- [ ] **Step 7: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: remaining failures should only be from unmigrated ES/WebSocket/MQTT editors.

- [ ] **Step 8: Commit SQL and Excel migration**

Run:

```bash
git add dataRoomFront/src/dataRoom/dataset/components/SqlEditor.vue dataRoomFront/src/dataRoom/dataset/components/ExcelEditor.vue
git commit -m "feat(front): migrate sql excel dataset editors"
```

## Task 5: Migrate ES, WebSocket, And MQTT Editors

**Files:**
- Modify: `dataRoomFront/src/dataRoom/dataset/components/EsEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/dataset/components/WebSocketEditor.vue`
- Modify: `dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue`

- [ ] **Step 1: Update ES settings grid**

In `EsEditor.vue`, change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="110px">
```

Add full-width class to `查询报文` and `入参配置`:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="查询报文">
<el-form-item class="dataset-editor-form-grid__full" label="入参配置">
```

- [ ] **Step 2: Move ES field list into the layout `fields` slot**

Use this markup:

```vue
<template #fields>
  <div class="dataset-form-section">
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击测试按钮获取字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 3: Update WebSocket settings grid**

In `WebSocketEditor.vue`, change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="120px">
```

Add full-width class to `消息处理脚本` and `测试样本`:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="消息处理脚本">
<el-form-item class="dataset-editor-form-grid__full" label="测试样本">
```

- [ ] **Step 4: Move WebSocket field list into the layout `fields` slot**

Remove the `字段列表` form item from the default slot and add this complete slot:

```vue
<template #fields>
  <div class="dataset-form-section">
    <div class="dataset-form-toolbar">
      <el-button type="primary" size="small" @click="test">解析测试样本</el-button>
    </div>
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击「解析测试样本」按钮执行脚本并自动解析字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 5: Update MQTT settings grid**

In `MqttEditor.vue`, change the form opening tag to:

```vue
<el-form class="dataset-editor-form dataset-editor-form-grid" ref="formRef" :model="formData" :rules="rules" label-width="120px">
```

Add full-width class to `测试样本` and `字段映射`:

```vue
<el-form-item class="dataset-editor-form-grid__full" label="测试样本">
<el-form-item class="dataset-editor-form-grid__full" label="字段映射">
```

- [ ] **Step 6: Add MQTT output fields slot**

Keep the MQTT `字段映射` table in settings. Add this `#fields` slot for output fields:

```vue
<template #fields>
  <div class="dataset-form-section">
    <el-table class="dataset-form-table" :data="formData.outputList" border>
      <el-table-column prop="name" label="字段名" width="200" />
      <el-table-column label="类型" width="150">
        <template #default="{ row }">
          <el-select v-model="row.type" size="small" placeholder="类型">
            <el-option label="String" value="String" />
            <el-option label="Number" value="Number" />
            <el-option label="Boolean" value="Boolean" />
            <el-option label="Object" value="Object" />
            <el-option label="Array" value="Array" />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column label="描述">
        <template #default="{ row }">
          <el-input v-model="row.desc" size="small" placeholder="描述" />
        </template>
      </el-table-column>
    </el-table>
    <el-empty
      v-if="!formData.outputList || formData.outputList.length === 0"
      description="请点击测试按钮获取字段列表"
      :image-size="100"
    />
  </div>
</template>
```

- [ ] **Step 7: Remove duplicated local shared styles**

In all three files, remove duplicated local definitions for:

```scss
.dataset-form-section
.dataset-form-toolbar
.dataset-form-table
.dataset-form-table--spaced
```

Keep datasource option styles and CodeMirror wrapper styles.

- [ ] **Step 8: Run type check**

Run:

```bash
cd dataRoomFront
npm run type-check
```

Expected: PASS.

- [ ] **Step 9: Commit ES, WebSocket, and MQTT migration**

Run:

```bash
git add dataRoomFront/src/dataRoom/dataset/components/EsEditor.vue dataRoomFront/src/dataRoom/dataset/components/WebSocketEditor.vue dataRoomFront/src/dataRoom/dataset/components/MqttEditor.vue
git commit -m "feat(front): migrate realtime dataset editors"
```

## Task 6: Validate Styling And Dialog Usability

**Files:**
- Modify only if verification finds layout defects:
  - `dataRoomFront/src/dataRoom/dataset/components/DatasetEditorLayout.vue`
  - migrated editor files from Tasks 3-5

- [ ] **Step 1: Run lint**

Run:

```bash
cd dataRoomFront
npm run lint
```

Expected: PASS.

- [ ] **Step 2: Search for forbidden style patterns introduced in dataset editors**

Run:

```bash
rg -n "#[0-9a-fA-F]{3,8}|rgb\\(|rgba\\(|hsl\\(|hsla\\(|--dr-|!important|:deep\\(\\.el-|::v-deep|/deep/|>>>" dataRoomFront/src/dataRoom/dataset/components
```

Expected: no new violations. Existing CodeMirror selectors under `.codemirror-wrapper :deep(.cm-...)` are acceptable because they do not target Element Plus internals.

- [ ] **Step 3: Start the frontend dev server**

Run:

```bash
cd dataRoomFront
npm run dev
```

Expected: Vite prints a local URL, typically `http://localhost:5173/`.

- [ ] **Step 4: Manually verify dataset dialogs**

In the browser, open the DataRoom dataset management UI and verify:

```text
SQL: left table structure visible; settings and preview panels expanded by default; SQL and input params are full-width.
Excel: left table structure visible; settings and preview panels expanded by default; SQL and input params are full-width.
JSON: no left structure; settings and preview span full width; JSON editor is full-width.
HTTP: no left structure; request headers, body, and input params are full-width.
ES: no left structure; query body and input params are full-width.
WebSocket: no left structure; script and sample data are full-width.
MQTT: no left structure; sample data and field mappings are full-width.
All types: settings title toggles collapse; preview title toggles collapse; Data tab shows preview data; Fields tab shows editable fields.
```

- [ ] **Step 5: Stop the dev server**

Stop the `npm run dev` process with `Ctrl-C`.

- [ ] **Step 6: Commit validation fixes**

If Task 6 required code changes, run:

```bash
git add dataRoomFront/src/dataRoom/dataset/components
git commit -m "fix(front): polish dataset editor layout"
```

If Task 6 required no code changes, do not create an empty commit.

## Task 7: Final Verification

**Files:**
- Read: `docs/superpowers/specs/2026-06-27-dataset-editor-layout-design.md`
- Verify: all modified dataset component files

- [ ] **Step 1: Confirm spec coverage**

Read the spec and verify each requirement has been implemented:

```text
Optional SQL/Excel metadata area.
No metadata area for JSON/HTTP/ES/WebSocket/MQTT.
Right-side settings and preview are stacked vertically.
Settings and preview panels are collapsible by title click and default expanded.
Ordinary fields use two columns.
Large editors, tables, and input params use full-width rows.
Preview area has Data and Fields tabs.
Data tab keeps DatasetPreviewTable behavior.
Fields tab keeps editable field-list behavior.
```

- [ ] **Step 2: Run final frontend checks**

Run:

```bash
cd dataRoomFront
npm run type-check
npm run lint
```

Expected: both PASS.

- [ ] **Step 3: Check git diff**

Run:

```bash
git status --short
git diff --stat
```

Expected:

```text
Only intended dataset editor files are modified.
dataRoomFront/src/dataRoom/data-source/index.vue may still appear as a pre-existing unrelated modification and must not be included in commits for this task.
```

- [ ] **Step 4: Summarize implementation**

Prepare a final summary including:

```text
Changed DatasetEditorLayout into the shared metadata/settings/preview-tab shell.
Moved field lists to the Fields tab for all dataset types.
Preserved existing test, parse, format, and save behavior.
Ran npm run type-check and npm run lint.
```
