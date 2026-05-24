<template>
  <div ref="chartsContainerRef" class="dv-charts-container">
    <div ref="chartRef" class="charts-canvas-container" />
  </div>
</template>

<script setup>
import Charts from '@jiaminghi/charts'
import autoResize from '@/dataroom-packages/datav/utils/autoResize'

const props = defineProps({
  option: {
    type: Object,
    default: () => ({}),
  },
})

const chartsContainerRef = ref(null)
const chartRef = ref(null)

let chart = reactive({})

autoResize(chartRef, onResize, afterAutoResizeMixinInit)

watch(() => props.option, () => {
  if (!chart)
    return

  chart.setOption(props.option, true)
}, { deep: true })

function afterAutoResizeMixinInit() {
  initChart()
}

function initChart() {
  chart = new Charts(chartRef.value)

  if (!props.option)
    return

  chart.setOption(props.option)
}

function onResize() {
  if (!chart)
    return

  chart.resize()
}
</script>

<style lang="less">
.dv-charts-container {
  position: relative;
  width: 100%;
  height: 100%;

  .charts-canvas-container {
    width: 100%;
    height: 100%;
  }
}
</style>
