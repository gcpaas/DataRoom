<script setup lang="ts">
import { ElFormItem } from 'element-plus'

withDefaults(defineProps<{
  label: string
  paired?: boolean
  variant?: 'equal' | 'number-color' | 'wide-equal'
}>(), { paired: false, variant: 'equal' })
</script>

<template>
  <ElFormItem :label="label" label-width="72px" label-position="left" class="config-panel-text dr-field-row">
    <template #label><span class="dr-config-panel__field-label">{{ label }}</span></template>
    <div class="dr-field-row__container" role="group" :aria-label="label">
      <div v-if="paired" class="dr-field-row__pair" :class="`dr-field-row__pair--${variant}`">
        <div class="dr-field-row__cell"><slot name="first" /></div>
        <div class="dr-field-row__cell"><slot name="second" /></div>
      </div>
      <slot v-else />
    </div>
  </ElFormItem>
</template>

<style scoped>
.dr-field-row {
  width: 100%;
  min-width: 0;
}

.dr-field-row__container {
  width: 100%;
  min-width: 0;
  container-type: inline-size;
  container-name: dr-field-row;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.dr-field-row__pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  align-items: center;
}

.dr-field-row__cell {
  min-width: 0;
}

@container dr-field-row (min-width: 180px) {
  .dr-field-row__pair--equal {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .dr-field-row__pair--number-color {
    grid-template-columns: 80px minmax(0, 1fr);
  }
}
/* 长精度数值需更宽的输入空间，窄侧栏保持单列。 */
@container dr-field-row (min-width: 320px) {
  .dr-field-row__pair--wide-equal {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
