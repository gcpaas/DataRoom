<script setup lang="ts">
import { UP_COLOR } from './defaults'
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useDrComponent } from '../../hooks/use-dr-component'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'
import type { ComponentExpose } from '../type/ComponentExpose'
import { mockDataset, type DrCandlestickChartConfig } from './install'
import { buildCandlestickData, buildCandlestickOption, type CandleFields } from './option'

defineOptions({ name: 'DrCandlestickChart' })
const { chart } = defineProps<{ chart: DrCandlestickChartConfig }>()
const chartRef = ref<HTMLElement>()
const chartData = ref<unknown>(shouldUseDefaultChartData(chart) ? mockDataset.dataset : [])
let instance: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
// Canvas 不支持 CSS var()，读取 Element Plus 变量后再传给 ECharts。
const updateChart = () => {
  if (!instance || !chartRef.value) return
  const style = getComputedStyle(chartRef.value)
  const css = (name: string) => style.getPropertyValue(name).trim()
  const fields = Object.fromEntries(['time', 'open', 'close', 'low', 'high'].map(name => [name, getChartDatasetFieldNames(chart, name, [name])[0] || ''])) as CandleFields
  instance.setOption(buildCandlestickOption(chart.props, buildCandlestickData(chartData.value, fields), {
    border: css('--el-border-color'),
    hollow: echarts.color.modifyAlpha(UP_COLOR, 0) || '',
  }), true)
}
const changeData = (value: unknown) => {
  chartData.value = value && typeof value === 'object' && 'data' in value ? value.data : value
  updateChart()
}
const { expose } = useDrComponent({ chart, changeData })
watch(() => [chart.props, chart.dataset?.fields], () => { void nextTick(updateChart) }, { deep: true })
watch(() => chart.dataset?.code, () => {
  chartData.value = shouldUseDefaultChartData(chart) ? mockDataset.dataset : []
  updateChart()
})
watch(() => [chart.w, chart.h], () => { void nextTick(() => instance?.resize()) })
onMounted(() => {
  if (!chartRef.value) return
  instance = echarts.init(chartRef.value)
  observer = new ResizeObserver(() => instance?.resize())
  observer.observe(chartRef.value)
  updateChart()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  instance?.dispose()
  instance = undefined
})
defineExpose<ComponentExpose>({ ...expose })
</script>

<template>
  <div :id="chart.id" ref="chartRef" class="dr-candlestick-chart"></div>
</template>

<style scoped>
.dr-candlestick-chart {
  width: 100%;
  height: 100%;
}
</style>
