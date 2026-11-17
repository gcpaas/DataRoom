<script setup lang="ts">
import { upgradeHeatmapProps } from './heatmap-config'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { mockDataset, type DrHeatmapChartConfig } from './install'
import { buildHeatmapOption } from './heatmap-option'
import { shouldUseDefaultChartData } from '../_shared/chart-data-defaults'
import { useDrComponent } from '../../hooks/use-dr-component'
import type { ComponentExpose } from '../type/ComponentExpose'

defineOptions({ name: 'DrHeatmapChart' })
const { chart } = defineProps<{ chart: DrHeatmapChartConfig }>()
upgradeHeatmapProps(chart.props)
const chartRef = ref<HTMLElement>()
const errorMessage = ref('')
let chartInstance: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
let chartData: unknown = []
let hasReceivedData = false

const updateChart = () => {
  if (!chartInstance) return
  try {
    const rows = !hasReceivedData && shouldUseDefaultChartData(chart) ? mockDataset.dataset : chartData
    chartInstance.setOption(buildHeatmapOption(chart, rows), true)
    errorMessage.value = ''
  } catch (error) {
    console.error('热力图配置错误', error)
    chartInstance.clear()
    errorMessage.value = error instanceof Error ? error.message : '热力图配置无效'
  }
}
const { canvasInst, expose } = useDrComponent({
  chart,
  changeData: (data: unknown) => {
    chartData = data
    hasReceivedData = true
    updateChart()
  },
})
watch(
  () => [chart.props, chart.dataset.fields],
  () => {
    void nextTick(updateChart)
  },
  { deep: true },
)
watch(
  () => chart.dataset.code,
  () => {
    chartData = []
    hasReceivedData = false
    updateChart()
  },
)
watch(
  () => [chart.w, chart.h],
  () => {
    void nextTick(() => chartInstance?.resize())
  },
)
onMounted(() => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  chartInstance.on('click', (params) => {
    const value = params.value
    if (!Array.isArray(value)) return
    const option = chartInstance?.getOption()
    const axes = option as { xAxis?: { data?: string[] }[]; yAxis?: { data?: string[] }[] }
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      x: axes.xAxis?.[0]?.data?.[Number(value[0])] ?? '',
      y: axes.yAxis?.[0]?.data?.[Number(value[1])] ?? '',
      value: value[2],
    })
  })
  observer = new ResizeObserver(() => chartInstance?.resize())
  observer.observe(chartRef.value)
  updateChart()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  chartInstance?.dispose()
  chartInstance = undefined
})
defineExpose<ComponentExpose>(expose)
</script>

<template>
  <div :id="chart.id" class="dr-heatmap-chart">
    <div ref="chartRef" class="dr-heatmap-chart__canvas"></div>
    <div v-if="errorMessage" class="dr-heatmap-chart__error" role="alert">{{ errorMessage }}</div>
  </div>
</template>

<style scoped>
.dr-heatmap-chart {
  position: relative;
  width: 100%;
  height: 100%;
}
.dr-heatmap-chart__canvas {
  width: 100%;
  height: 100%;
}
.dr-heatmap-chart__error {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 16px;
  color: var(--el-color-danger);
  font-size: 12px;
  letter-spacing: 0;
}
</style>
