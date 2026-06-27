<script setup lang="ts">
import { computed, nextTick, ref, useSlots } from 'vue'
import { ArrowDown, ArrowRight } from '@element-plus/icons-vue'
import DatasetPreviewTable from './DatasetPreviewTable.vue'

defineProps<{
  previewData?: unknown
}>()

const slots = useSlots()
const settingsExpanded = ref(true)
const previewExpanded = ref(true)
const activePreviewTab = ref<'data' | 'fields'>('data')
const previewPanelRef = ref<HTMLElement>()
const hasMetadata = computed(() => Boolean(slots.metadata || slots['before-panel']))
const workspaceRows = computed(() => {
  if (settingsExpanded.value && previewExpanded.value) {
    return 'minmax(280px, 1.1fr) minmax(220px, 0.9fr)'
  }
  if (!settingsExpanded.value && previewExpanded.value) {
    return '48px minmax(220px, 1fr)'
  }
  if (settingsExpanded.value && !previewExpanded.value) {
    return 'minmax(280px, 1fr) 48px'
  }
  return '48px 48px'
})

const toggleSettings = () => {
  settingsExpanded.value = !settingsExpanded.value
}

const togglePreview = () => {
  previewExpanded.value = !previewExpanded.value
}

const revealPreview = async () => {
  previewExpanded.value = true
  activePreviewTab.value = 'data'
  await nextTick()
  previewPanelRef.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

defineExpose({
  revealPreview,
})
</script>

<template>
  <div class="dataset-editor-layout" :class="{ 'dataset-editor-layout--with-metadata': hasMetadata }">
    <div v-if="hasMetadata" class="dataset-editor-layout__metadata">
      <slot v-if="slots.metadata" name="metadata" />
      <slot v-else name="before-panel" />
    </div>

    <div class="dataset-editor-layout__workspace" :style="{ gridTemplateRows: workspaceRows }">
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

      <section ref="previewPanelRef" class="dataset-editor-panel dataset-editor-preview" :class="{ 'dataset-editor-panel--collapsed': !previewExpanded }">
        <button class="dataset-editor-panel__header" type="button" @click="togglePreview">
          <span class="dataset-editor-panel__title">数据预览</span>
          <el-icon class="dataset-editor-panel__icon">
            <ArrowDown v-if="previewExpanded" />
            <ArrowRight v-else />
          </el-icon>
        </button>
        <div v-show="previewExpanded" class="dataset-editor-panel__body dataset-editor-preview__body">
          <div class="dataset-editor-preview__tabs">
            <div class="dataset-editor-preview__tab-nav" role="tablist" aria-label="数据预览">
              <button
                class="dataset-editor-preview__tab"
                :class="{ 'dataset-editor-preview__tab--active': activePreviewTab === 'data' }"
                type="button"
                role="tab"
                :aria-selected="activePreviewTab === 'data'"
                @click="activePreviewTab = 'data'"
              >
                数据
              </button>
              <button
                class="dataset-editor-preview__tab"
                :class="{ 'dataset-editor-preview__tab--active': activePreviewTab === 'fields' }"
                type="button"
                role="tab"
                :aria-selected="activePreviewTab === 'fields'"
                @click="activePreviewTab = 'fields'"
              >
                字段
              </button>
            </div>
            <div v-show="activePreviewTab === 'data'" class="dataset-editor-preview__tab-content" role="tabpanel">
              <DatasetPreviewTable :data="previewData" />
            </div>
            <div v-show="activePreviewTab === 'fields'" class="dataset-editor-preview__tab-content" role="tabpanel">
              <slot name="fields" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dataset-editor-layout {
  --dataset-editor-layout-gap: 16px;

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: var(--dataset-editor-layout-gap);
  min-height: 640px;
  padding: 20px 24px;
  box-sizing: border-box;
}

.dataset-editor-layout--with-metadata {
  grid-template-columns: max-content minmax(0, 1fr);
}

.dataset-editor-layout__workspace {
  min-width: 0;
  min-height: 0;
}

.dataset-editor-layout__metadata {
  display: flex;
  min-width: 0;
  min-height: 0;
}

:deep(.sql-metadata-panel),
:deep(.excel-metadata-panel) {
  width: 260px;
}

:deep(.sql-metadata-collapsed),
:deep(.excel-metadata-collapsed) {
  width: 40px;
}

.dataset-editor-layout__workspace {
  display: grid;
  row-gap: var(--dataset-editor-layout-gap);
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

.dataset-editor-preview__tab-nav {
  display: flex;
  flex-shrink: 0;
  gap: 4px;
  min-height: 40px;
  margin-bottom: 12px;
}

.dataset-editor-preview__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 0 12px;
  color: var(--el-text-color-secondary);
  background: transparent;
  border: 0;
  font: inherit;
  font-weight: 500;
  letter-spacing: 0;
  cursor: pointer;
  box-sizing: border-box;
}

.dataset-editor-preview__tab--active {
  color: var(--el-text-color-primary);
}

.dataset-editor-preview__tab--active::after {
  position: absolute;
  right: 12px;
  bottom: 0;
  left: 12px;
  height: 2px;
  background: var(--el-color-primary);
  content: '';
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
  flex: 1;
  height: 360px;
  min-height: 0;
  overflow: auto;
}
</style>
