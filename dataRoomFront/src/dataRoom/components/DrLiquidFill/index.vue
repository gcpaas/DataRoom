<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-liquidfill'
import { mockDataset, type DrLiquidFillConfig } from './install'
import { liquidRatio, readLiquidData } from './data'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import { getChartDatasetFieldNames, shouldUseDefaultChartData } from '../_shared/chart-data-defaults'
import type { ComponentExpose } from '../type/ComponentExpose'

defineOptions({ name: 'DrLiquidFill' })
const { chart } = defineProps<{ chart: DrLiquidFillConfig }>()
const chartRef = ref<HTMLElement>()
const source = ref<unknown>(shouldUseDefaultChartData(chart) ? mockDataset.dataset : [])
const data = computed(() =>
  readLiquidData(source.value, getChartDatasetFieldNames(chart, 'valueField', ['value'])[0], getChartDatasetFieldNames(chart, 'titleField', ['title'])[0]),
)
const ratio = computed(() => liquidRatio(data.value.value, chart.props.liquid.min, chart.props.liquid.max))
const valueText = computed(() => {
  if (data.value.value === null) return '—'
  const decimals = Number.isFinite(chart.props.detail.decimals) ? Math.min(10, Math.max(0, Math.trunc(chart.props.detail.decimals))) : 0
  const percent = chart.props.detail.format === 'percent'
  return (percent ? ratio.value * 100 : data.value.value).toFixed(decimals) + (percent ? '%' : '') + chart.props.detail.suffix
})
const { canvasInst, expose } = useDrComponent({
  chart,
  changeData: (input: unknown) => {
    source.value = input
  },
})
let instance: echarts.ECharts | undefined
let observer: ResizeObserver | undefined
function updateChart() {
  const p = chart.props
  instance?.setOption(
    {
      series: [
        {
          type: 'liquidFill',
          shape: p.liquid.shape,
          radius: `${p.liquid.radius}%`,
          data: Array.from({ length: Math.max(1, Math.min(4, p.liquid.waveCount)) }, () => ratio.value),
          color: [p.liquid.color],
          amplitude: p.liquid.amplitude,
          waveAnimation: p.liquid.animated,
          animationDuration: p.liquid.animated ? 1000 : 0,
          animationDurationUpdate: p.liquid.animated ? 500 : 0,
          backgroundStyle: { color: p.liquid.backgroundColor },
          outline: {
            show: p.outline.show,
            borderDistance: p.outline.gap,
            itemStyle: { borderWidth: p.outline.width, borderColor: p.outline.color, shadowBlur: 0 },
          },
          itemStyle: { opacity: 0.65, shadowBlur: 0 },
          label: { show: false },
        },
      ],
    },
    true,
  )
}
watch([() => chart.props, data], updateChart, { deep: true, flush: 'post' })
watch(
  () => chart.dataset.code,
  () => {
    source.value = shouldUseDefaultChartData(chart) ? mockDataset.dataset : []
  },
)
onMounted(() => {
  if (!chartRef.value) return
  instance = echarts.init(chartRef.value)
  instance.on('click', () => {
    if (data.value.value !== null) canvasInst.triggerChartBehavior(chart.id, 'click', { value: data.value.value, percent: ratio.value * 100 })
  })
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
  <div :id="chart.id" class="dr-liquid-fill">
    <div ref="chartRef" class="dr-liquid-fill__chart" />
    <div class="dr-liquid-fill__label" :style="{ gap: `${chart.props.title.gap}px` }">
      <span v-if="chart.props.detail.show" :style="{ fontSize: `${chart.props.detail.fontSize}px`, color: chart.props.detail.color }">{{ valueText }}</span>
      <span v-if="chart.props.title.show" :style="{ fontSize: `${chart.props.title.fontSize}px`, color: chart.props.title.color }">{{ chart.props.title.text || data.title }}</span>
    </div>
  </div>
</template>

<style scoped>
.dr-liquid-fill {
  position: relative;
  width: 100%;
  height: 100%;
}
.dr-liquid-fill__chart {
  width: 100%;
  height: 100%;
}
.dr-liquid-fill__label {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
  letter-spacing: 0;
  font-feature-settings: 'tnum';
  overflow: hidden;
}
</style>
