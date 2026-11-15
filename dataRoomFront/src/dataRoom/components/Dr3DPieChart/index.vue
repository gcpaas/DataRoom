<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { Dr3DPieChartConfig } from './install'
import { mockDataset } from './install'
import { toPieData, sliceData } from './data'
import { buildPieOption } from './option'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '../type/ComponentExpose'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'

defineOptions({ name: 'Dr3DPieChart' })
const { chart } = defineProps<{ chart: Dr3DPieChartConfig }>()
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
  const name = getChartDatasetFieldNames(chart, 'nameField', ['name'])[0] || ''
  const value = getChartDatasetFieldNames(chart, 'valueField', ['value'])[0] || ''
  const data = toPieData(rows, name, value)
  selected = Object.fromEntries(data.map((item) => [item.name, selected[item.name] !== false]))
  instance.setOption(buildPieOption(chart.props, data, instance.getWidth(), instance.getHeight(), selected), { replaceMerge: ['series'] })
}

function resize() {
  if (chartRef.value?.clientWidth && chartRef.value.clientHeight) {
    instance?.resize()
    updateChart()
  }
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
    if (params.componentType !== 'series') return
    const name = getChartDatasetFieldNames(chart, 'nameField', ['name'])[0] || ''
    const value = getChartDatasetFieldNames(chart, 'valueField', ['value'])[0] || ''
    const slice = sliceData(toPieData(rows, name, value), selected, chart.props.pie.rotation - 90, chart.props.pie.gap).find((item) => item.name === params.seriesName)
    if (slice) canvasInst.triggerChartBehavior(chart.id, 'click', { name: slice.name, value: slice.value, percent: slice.percent })
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
  <div :id="chart.id" ref="chartRef" class="dr-3d-pie-chart"></div>
</template>

<style scoped>
.dr-3d-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
