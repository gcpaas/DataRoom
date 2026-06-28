<script setup lang="ts">
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'

defineProps<{
  chart: ChartConfig<Record<string, never>>
}>()
</script>

<template>
  <div class="dr-group-component" aria-label="组合"></div>
</template>

<style scoped lang="scss">
.dr-group-component {
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
