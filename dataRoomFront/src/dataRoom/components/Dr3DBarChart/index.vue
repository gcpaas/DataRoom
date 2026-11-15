<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { Dr3DBarChartConfig } from './install'
import { mockDataset } from './install'
import { buildBarData } from './data'
import { buildBarOption } from './option'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '../type/ComponentExpose'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'

defineOptions({ name: 'Dr3DBarChart' })
const { chart } = defineProps<{ chart: Dr3DBarChartConfig }>()
const chartRef = ref<HTMLElement>()
let instance: echarts.ECharts | null = null
let observer: ResizeObserver | null = null
let rows: unknown[] = []
let selected: Record<string, boolean> = {}
let disposed = false

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData(value: unknown) {
    const data = value && typeof value === 'object' && 'data' in value ? value.data : value
    rows = Array.isArray(data) ? data : []
    updateChart()
  },
})

function updateChart() {
  if (!instance || disposed) return
  const x = getChartDatasetFieldNames(chart, 'xField', ['time'])[0] || ''
  const y = getChartDatasetFieldNames(chart, 'yField', ['value', 'compareValue'])
  const group = getChartDatasetFieldNames(chart, 'seriesField')[0]
  const data = buildBarData(rows, x, y, group)
  selected = Object.fromEntries(data.series.map((series) => [series.name, selected[series.name] !== false]))
  // 合并保留 custom 图形动画，用 replaceMerge 清除已移除的数据系列。
  instance.setOption(buildBarOption(chart.props, data, selected), { replaceMerge: ['series'] })
}

function resize() {
  if (chartRef.value?.clientWidth && chartRef.value.clientHeight) instance?.resize()
}

watch(
  () => chart.props,
  () => nextTick(updateChart),
  { deep: true },
)
watch(
  () => chart.dataset,
  () => nextTick(updateChart),
  { deep: true },
)
watch(
  () => [chart.w, chart.h],
  () => nextTick(resize),
)
onMounted(async () => {
  await nextTick()
  if (disposed || !chartRef.value) return
  instance = echarts.init(chartRef.value)
  instance.on('click', (params) => {
    if (params.componentType !== 'series' || !Array.isArray(params.value)) return
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      x: params.name,
      y: params.value[1],
      seriesName: params.seriesName,
    })
  })
  instance.on('legendselectchanged', (event: unknown) => {
    const params = event as { name: string; selected: Record<string, boolean> }
    selected = { ...params.selected }
    updateChart()
    canvasInst.triggerChartBehavior(chart.id, 'legendClick', { name: params.name, selected: params.selected[params.name] })
  })
  if (shouldUseDefaultChartData(chart) && rows.length === 0) rows = [...mockDataset.dataset]
  updateChart()
  observer = new ResizeObserver(resize)
  observer.observe(chartRef.value)
})
onBeforeUnmount(() => {
  disposed = true
  observer?.disconnect()
  instance?.dispose()
  instance = null
})
defineExpose<ComponentExpose>({ ...expose })
</script>

<template>
  <div :id="chart.id" ref="chartRef" class="dr-3d-bar-chart"></div>
</template>

<style scoped>
.dr-3d-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
