<script setup lang="ts">
import { DEFAULT_NEUTRAL_COLOR, TOOLTIP_TEXT_COLOR } from '../../theme/defaults'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { mockDataset, type DrFunnelChartConfig } from './install'
import { toFunnelData } from './data'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '../type/ComponentExpose'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'

defineOptions({ name: 'DrFunnelChart' })
const { chart } = defineProps<{ chart: DrFunnelChartConfig }>()
const chartRef = ref<HTMLElement>()
const rows = ref<unknown[]>([])
let instance: echarts.ECharts | null = null
let observer: ResizeObserver | undefined
const { canvasInst, expose } = useDrComponent({
  chart,
  changeData(value: unknown) {
    rows.value = Array.isArray(value) ? value
      : value && typeof value === 'object' && 'data' in value && Array.isArray(value.data) ? value.data : []
  },
})
const data = computed(() => toFunnelData(
  shouldUseDefaultChartData(chart) ? mockDataset.dataset : rows.value,
  getChartDatasetFieldNames(chart, 'nameField', ['name'])[0],
  getChartDatasetFieldNames(chart, 'valueField', ['value'])[0],
))
function updateChart() {
  const { funnel, label, series } = chart.props
  const outside = label.show && label.position === 'outside'
  const option: echarts.EChartsOption = {
    color: series.colors,
    tooltip: { ...chart.props.tooltip, textStyle: { color: TOOLTIP_TEXT_COLOR, ...chart.props.tooltip?.textStyle }, trigger: 'item', renderMode: 'richText', confine: true, formatter: '{b}: {c}' },
    series: [{
      type: 'funnel',
      left: '10%', right: outside ? '30%' : '10%', top: 20, bottom: 20,
      min: 0, sort: funnel.sort, gap: funnel.gap,
      itemStyle: { borderWidth: 0 },
      label: {
        color: label.color ?? DEFAULT_NEUTRAL_COLOR,
        show: label.show, position: label.position === 'outside' ? 'right' : 'inside',
        formatter: label.content === 'name' ? '{b}' : label.content === 'value' ? '{c}' : '{b}: {c}',
      },
      labelLine: { show: outside, length: 12, lineStyle: { color: DEFAULT_NEUTRAL_COLOR } },
      data: data.value,
    }],
  }
  instance?.setOption(option, true)
}
watch([data, () => chart.props], updateChart, { deep: true, flush: 'post' })
watch(() => chart.dataset.code, () => { rows.value = [] }, { flush: 'sync' })
onMounted(() => {
  if (!chartRef.value) return
  instance = echarts.init(chartRef.value)
  instance.on('click', params => {
    canvasInst.triggerChartBehavior(chart.id, 'click', { name: params.name, value: params.value })
  })
  observer = new ResizeObserver(() => instance?.resize())
  observer.observe(chartRef.value)
  updateChart()
})
onBeforeUnmount(() => {
  observer?.disconnect()
  instance?.dispose()
  instance = null
})
defineExpose<ComponentExpose>({ ...expose })
</script>

<template>
  <div :id="chart.id" ref="chartRef" class="dr-funnel-chart"></div>
</template>

<style scoped>
.dr-funnel-chart {
  width: 100%;
  height: 100%;
}
</style>
