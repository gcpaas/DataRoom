<script setup lang="ts" generic="T extends string">
import { Check } from '@element-plus/icons-vue'

defineProps<{
  options: Array<{ label: string; value: T }>
}>()
const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="dr-type-preview-picker" role="group" aria-label="选择样式类型">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="dr-type-preview-picker__card"
      :class="{ 'is-selected': option.value === model }"
      :aria-pressed="option.value === model"
      :aria-label="option.label"
      @click="model = option.value"
    >
      <span class="dr-type-preview-picker__preview" aria-hidden="true">
        <span class="dr-type-preview-picker__canvas">
          <slot name="preview" :value="option.value" />
        </span>
      </span>
      <span class="dr-type-preview-picker__label">
        {{ option.label }}
        <el-icon v-if="option.value === model"><Check /></el-icon>
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
.dr-type-preview-picker {
  min-width: 0;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 2px;
}

.dr-type-preview-picker__card {
  min-width: 0;
  padding: 8px;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font: inherit;
  letter-spacing: 0;
  cursor: pointer;

  &:hover,
  &.is-selected {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 1px;
  }
}

.dr-type-preview-picker__preview {
  display: block;
  width: 100%;
  aspect-ratio: 5 / 3;
  margin: 0 auto;
  overflow: hidden;
  pointer-events: none;
}

.dr-type-preview-picker__canvas {
  display: block;
  width: 200%;
  aspect-ratio: 5 / 3;
  transform: scale(0.5);
  transform-origin: top left;
}

.dr-type-preview-picker__label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 8px;
}
</style>
