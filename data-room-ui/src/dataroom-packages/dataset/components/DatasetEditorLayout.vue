<script setup lang="ts">
import DatasetPreviewTable from './DatasetPreviewTable.vue'

defineProps<{
  previewData?: unknown
}>()
</script>

<template>
  <div class="dataset-editor-layout">
    <div class="dataset-editor-layout__main">
      <slot name="before-panel" />
      <section class="dataset-editor-panel">
        <div class="dataset-editor-panel__title">基础设置</div>
        <div class="dataset-editor-panel__body">
          <slot />
        </div>
      </section>
    </div>
    <DatasetPreviewTable :data="previewData" />
  </div>
</template>

<style scoped lang="scss">
.dataset-editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 45%);
  align-items: stretch;
  gap: 24px;
  padding: 20px 24px;
}

.dataset-editor-layout__main {
  display: flex;
  align-items: stretch;
  gap: 16px;
  min-width: 0;
  min-height: 0;
}

.dataset-editor-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  min-height: 0;
  padding: 16px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-sizing: border-box;

  &__title {
    margin-bottom: 12px;
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.57;
  }

  &__body {
    min-width: 0;
    min-height: 0;
  }
}
</style>
