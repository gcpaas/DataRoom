<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrBorder',
})
</script>

<script setup lang="ts">
import {computed, defineAsyncComponent} from 'vue'
import type {AsyncComponentLoader, Component} from 'vue'
import type {DrBorderConfig} from './install.ts'
import {buildBorderDatavProps, defaultBorderType, normalizeBorderType, type DrBorderType} from './options.ts'

const {chart} = defineProps<{
  chart: DrBorderConfig
}>()

const borderModules = import.meta.glob<Component>('../../datav/components/BorderBox*/src/BorderBox*.tsx', {
  import: 'default',
})

const getBorderLoader = (borderType: DrBorderType): AsyncComponentLoader<Component> => {
  const path = `../../datav/components/${borderType}/src/${borderType}.tsx`
  const defaultPath = `../../datav/components/${defaultBorderType}/src/${defaultBorderType}.tsx`
  return (borderModules[path] || borderModules[defaultPath]) as AsyncComponentLoader<Component>
}

const currentBorderType = computed(() => normalizeBorderType(chart.props.borderType))
const currentComponent = computed(() => defineAsyncComponent(getBorderLoader(currentBorderType.value)))
const currentDatavProps = computed(() => buildBorderDatavProps(chart.props))
</script>

<template>
  <div class="dr-border" :id="chart.id">
    <component :is="currentComponent" v-bind="currentDatavProps" />
  </div>
</template>

<style scoped>
.dr-border {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
