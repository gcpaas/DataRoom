<script setup lang="ts">
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { computed } from 'vue'

const props = defineProps<{
  chart: ChartConfig<Record<string, never>>
}>()

const groupTitle = computed({
  get: () => props.chart.title,
  set: (value: string) => {
    Reflect.set(props.chart, 'title', value)
  },
})
</script>

<template>
  <el-form class="dr-config-panel dr-config-panel__form" label-width="72px" label-position="left">
    <el-form-item class="config-panel-text" label="名称">
      <template #label><span class="dr-config-panel__field-label">名称</span></template>
      <DrInputField v-model="groupTitle" maxlength="50" />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
</style>
