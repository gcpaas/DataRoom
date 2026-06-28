<script setup lang="ts">
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
  <el-form label-width="80px" size="small">
    <el-form-item label="名称">
      <el-input v-model="groupTitle" maxlength="50" />
    </el-form-item>
  </el-form>
</template>
