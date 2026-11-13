<script setup lang="ts">
import { computed, inject, useId } from 'vue'
import { ElCollapseTransition } from 'element-plus'
import { configCollapseKey, type ConfigCollapseName } from './ConfigCollapse.vue'

const props = withDefaults(defineProps<{
  name?: ConfigCollapseName
  title?: string
  disabled?: boolean
}>(), { title: '', disabled: false })
const id = useId()
const collapse = inject(configCollapseKey)
const itemName = computed(() => props.name ?? id)
const expanded = computed(() => collapse?.activeNames.value.includes(itemName.value) ?? false)
const toggle = () => {
  if (!props.disabled) collapse?.toggle(itemName.value)
}
</script>

<template>
  <div class="config-collapse-item">
    <button
      :id="`${id}-header`"
      class="config-collapse-item__header dr-config-panel__section-title"
      type="button"
      :disabled="disabled"
      :aria-expanded="expanded"
      :aria-controls="`${id}-content`"
      @click="toggle"
    >
      <span><slot name="title">{{ title }}</slot></span>
      <svg class="config-collapse-item__arrow" :class="{ 'is-expanded': expanded }" viewBox="0 0 16 16" aria-hidden="true">
        <path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.5" />
      </svg>
    </button>
    <ElCollapseTransition>
      <div v-show="expanded" :id="`${id}-content`" class="config-collapse-item__content" role="region" :aria-labelledby="`${id}-header`">
        <slot />
      </div>
    </ElCollapseTransition>
  </div>
</template>

<style scoped>
.config-collapse-item {
  min-width: 0;
}

.config-collapse-item__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 8px 0;
  border: 0;
  background: none;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}

.config-collapse-item__header:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: -2px;
}

.config-collapse-item__header:disabled {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.config-collapse-item__arrow {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  transition: transform var(--el-transition-duration) var(--el-transition-function-ease-in-out-bezier);
}

.config-collapse-item__arrow.is-expanded {
  transform: rotate(90deg);
}

.config-collapse-item__content {
  min-width: 0;
  padding: 0 0 12px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
</style>
