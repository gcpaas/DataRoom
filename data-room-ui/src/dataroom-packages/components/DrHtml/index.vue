<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrHtml',
})
</script>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { DrHtmlConfig } from './install.ts'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'
import { buildHtmlSrcdoc, getPlaceholderPaths } from './html-render.ts'

const { chart } = defineProps<{
  chart: DrHtmlConfig
}>()

const latestDatasetValue = ref<unknown>()

const changeData = (datasetValue: unknown) => {
  latestDatasetValue.value = datasetValue
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const renderResult = computed(() => buildHtmlSrcdoc(chart.props.html, chart.props.css, latestDatasetValue.value))

const sandboxAttr = computed(() => {
  const sandbox = chart.props.sandbox
  const permissions: string[] = []
  if (sandbox.allowSameOrigin) permissions.push('allow-same-origin')
  if (sandbox.allowForms) permissions.push('allow-forms')
  if (sandbox.allowPopups) permissions.push('allow-popups')
  return permissions.join(' ')
})

const placeholderCount = computed(() => getPlaceholderPaths(chart.props.html).length)

watch(
  () => renderResult.value.missingPaths.join('|'),
  () => {
    const missingPaths = renderResult.value.missingPaths
    if (missingPaths.length > 0) {
      console.warn('HTML组件占位符未命中:', chart.id, missingPaths)
    }
  }
)

const onLoad = () => {
  canvasInst.triggerChartBehavior(chart.id, 'loaded', { placeholderCount: placeholderCount.value })
}

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', { placeholderCount: placeholderCount.value })
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-html" :id="chart.id" @click="onClick">
    <iframe
      class="dr-html__frame"
      :srcdoc="renderResult.srcdoc"
      :sandbox="sandboxAttr"
      referrerpolicy="no-referrer"
      @load="onLoad"
    />
  </div>
</template>

<style scoped>
.dr-html {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.dr-html__frame {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
</style>
