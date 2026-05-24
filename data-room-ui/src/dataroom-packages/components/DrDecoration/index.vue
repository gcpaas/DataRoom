<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>

<script setup lang="ts">
import {computed, defineAsyncComponent} from 'vue'
import type {AsyncComponentLoader, Component} from 'vue'
import type {DrDecorationConfig} from './install.ts'
import {buildDecorationDatavProps, defaultDecorationType, normalizeDecorationType, type DrDecorationType} from './options.ts'

const {chart} = defineProps<{
  chart: DrDecorationConfig
}>()

const decorationModules = import.meta.glob<Component>('../../datav/components/Decoration*/src/index.vue', {
  import: 'default',
})

const getDecorationLoader = (decorationType: DrDecorationType): AsyncComponentLoader<Component> => {
  const path = `../../datav/components/${decorationType}/src/index.vue`
  const defaultPath = `../../datav/components/${defaultDecorationType}/src/index.vue`
  return (decorationModules[path] || decorationModules[defaultPath]) as AsyncComponentLoader<Component>
}

const currentDecorationType = computed(() => normalizeDecorationType(chart.props.decorationType))
const currentComponent = computed(() => defineAsyncComponent(getDecorationLoader(currentDecorationType.value)))
const currentDatavProps = computed(() => buildDecorationDatavProps(chart.props))
</script>

<template>
  <div class="dr-decoration" :id="chart.id">
    <component :is="currentComponent" v-bind="currentDatavProps" />
  </div>
</template>

<style scoped>
.dr-decoration {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
