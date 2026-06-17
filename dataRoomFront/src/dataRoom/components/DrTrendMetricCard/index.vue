<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrTrendMetricCard',
})
</script>
<script setup lang="ts">
import type { DrTrendMetricCardConfig } from './install.ts'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'
import {
  calculateChange,
  formatDateValue,
  formatMetricValue,
  getDatasetFieldNames,
  getFieldValue,
  normalizeRows,
  toFiniteNumber,
  type DatasetRow,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'

interface TrendPoint {
  time: string
  value: number
  row?: DatasetRow
}

const { chart } = defineProps<{
  chart: DrTrendMetricCardConfig
}>()

const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

const trendData = ref<TrendPoint[]>([])
const latestTitle = ref('')
const latestUnit = ref('')

const fields = computed(() => chart.dataset?.fields)

const resolveFieldName = (key: string, fallback: string): string => {
  return getDatasetFieldNames(fields.value, key)[0] || fallback
}

const buildFallbackData = (): TrendPoint[] => {
  const base = toFiniteNumber(chart.props.value.defaultValue) ?? 0
  return [
    { time: '1', value: Math.round(base * 0.72) },
    { time: '2', value: Math.round(base * 0.8) },
    { time: '3', value: Math.round(base * 0.76) },
    { time: '4', value: Math.round(base * 0.9) },
    { time: '5', value: Math.round(base * 0.88) },
    { time: '6', value: Math.round(base * 0.96) },
    { time: '7', value: base },
  ]
}

const resolveTrendData = (datasetValue: unknown): TrendPoint[] => {
  const rows = normalizeRows(datasetValue)
  if (!rows.length) {
    latestTitle.value = ''
    latestUnit.value = ''
    return buildFallbackData()
  }

  const timeField = resolveFieldName('timeField', 'time')
  const valueField = resolveFieldName('valueField', 'value')
  const titleField = resolveFieldName('titleField', 'title')
  const unitField = resolveFieldName('unitField', 'unit')
  const points = rows
    .map<TrendPoint | undefined>((row, index) => {
      const value = toFiniteNumber(getFieldValue(row, valueField))
      if (value === undefined) {
        return undefined
      }
      const rawTime = getFieldValue(row, timeField)
      return {
        time: rawTime === undefined || rawTime === null || rawTime === '' ? String(index + 1) : String(rawTime),
        value,
        row,
      }
    })
    .filter((point): point is TrendPoint => point !== undefined)

  const latestRow = points[points.length - 1]?.row ?? rows[rows.length - 1]
  const titleValue = getFieldValue(latestRow, titleField)
  const unitValue = getFieldValue(latestRow, unitField)
  latestTitle.value = titleValue === undefined || titleValue === null ? '' : String(titleValue)
  latestUnit.value = unitValue === undefined || unitValue === null ? '' : String(unitValue)

  return points.length ? points : buildFallbackData()
}

const changeData = (datasetValue: unknown) => {
  trendData.value = resolveTrendData(datasetValue)
  updateChart()
}

const { canvasInst, expose } = useDrComponent({
  chart: chart,
  changeData: changeData,
})

const latestPoint = computed(() => trendData.value[trendData.value.length - 1] ?? buildFallbackData()[buildFallbackData().length - 1])
const previousPoint = computed(() => trendData.value[trendData.value.length - 2])
const changeInfo = computed(() => calculateChange(latestPoint.value?.value, previousPoint.value?.value, 'zero'))

const displayTitle = computed(() => latestTitle.value || chart.props.title.text)
const displayValue = computed(() =>
  formatMetricValue(latestPoint.value?.value, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
  }),
)
const displayTimestamp = computed(() => {
  const time = latestPoint.value?.time
  return time ? `${chart.props.timestamp.prefix}${formatDateValue(time, chart.props.timestamp.format)}` : ''
})

const compareColor = computed(() => {
  if (changeInfo.value.trend === 'up') {
    return chart.props.compare.positiveColor
  }
  if (changeInfo.value.trend === 'down') {
    return chart.props.compare.negativeColor
  }
  return chart.props.compare.neutralColor
})

const formatSignedValue = (value: number | undefined): string => {
  if (value === undefined) {
    return '--'
  }
  const formatted = formatMetricValue(Math.abs(value), {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
  })
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatted}`
}

const formatSignedRate = (value: number | undefined): string => {
  if (value === undefined) {
    return '--'
  }
  if (!Number.isFinite(value)) {
    return value > 0 ? '+∞' : '-∞'
  }
  const formatted = formatMetricValue(Math.abs(value), {
    format: 'percent',
    decimalPlaces: 2,
  })
  return `${value > 0 ? '+' : value < 0 ? '-' : ''}${formatted}`
}

const compareText = computed(() => {
  if (changeInfo.value.trend === 'empty') {
    return '--'
  }
  const changeValue = formatSignedValue(changeInfo.value.changeValue)
  const changeRate = formatSignedRate(changeInfo.value.changeRate)
  if (chart.props.compare.mode === 'value') {
    return changeValue
  }
  if (chart.props.compare.mode === 'both') {
    return `${changeValue} (${changeRate})`
  }
  return changeRate
})

const rootStyle = computed(() => ({
  padding: `${chart.props.global.padding[0]}px ${chart.props.global.padding[1]}px ${chart.props.global.padding[2]}px ${chart.props.global.padding[3]}px`,
  backgroundColor: chart.props.global.backgroundColor,
  borderColor: chart.props.global.borderColor,
  borderWidth: `${chart.props.global.borderWidth}px`,
  borderRadius: `${chart.props.global.borderRadius}px`,
  textAlign: chart.props.layout.horizontalAlign,
  gap: `${chart.props.layout.gap}px`,
}))

const contentJustify = computed(() => {
  if (chart.props.layout.horizontalAlign === 'center') {
    return 'center'
  }
  if (chart.props.layout.horizontalAlign === 'right') {
    return 'flex-end'
  }
  return 'flex-start'
})

const chartPaneStyle = computed(() => {
  if (chart.props.layout.trendPosition === 'right') {
    return {
      width: `${chart.props.layout.trendWidth}px`,
      minWidth: `${chart.props.layout.trendWidth}px`,
    }
  }
  return {
    height: `${chart.props.layout.trendHeight}px`,
    minHeight: `${chart.props.layout.trendHeight}px`,
  }
})

const buildOption = (): echarts.EChartsOption => {
  const props = chart.props
  const data = trendData.value.length ? trendData.value : buildFallbackData()
  const formattedValues = data.map((item) =>
    formatMetricValue(item.value, {
      format: props.value.format,
      decimalPlaces: props.value.decimalPlaces,
      prefix: props.value.prefix,
      suffix: props.value.suffix,
    }),
  )

  return {
    grid: {
      top: props.axis.showMinMaxLabel ? 18 : 4,
      right: props.axis.showYAxis ? 26 : 4,
      bottom: props.axis.showXAxis ? 18 : 4,
      left: props.axis.showYAxis ? 30 : 4,
      containLabel: false,
    },
    xAxis: {
      show: props.axis.showXAxis,
      type: 'category',
      boundaryGap: false,
      data: data.map((item) => item.time),
      axisLine: { show: props.axis.showXAxis },
      axisTick: { show: props.axis.showXAxis },
      axisLabel: {
        color: props.axis.labelColor,
        fontSize: props.axis.labelFontSize,
      },
    },
    yAxis: {
      show: props.axis.showYAxis,
      type: 'value',
      min: props.trend.startYAxisAtZero ? 0 : undefined,
      axisLine: { show: props.axis.showYAxis },
      axisTick: { show: props.axis.showYAxis },
      splitLine: { show: props.axis.showYAxis },
      axisLabel: {
        color: props.axis.labelColor,
        fontSize: props.axis.labelFontSize,
      },
    },
    tooltip: {
      show: props.tooltip.show,
      trigger: 'axis',
      formatter: (params: unknown) => {
        const point = Array.isArray(params) ? params[0] : params
        const dataIndex = typeof point === 'object' && point && 'dataIndex' in point ? Number(point.dataIndex) : 0
        const item = data[dataIndex]
        return props.tooltip.formatter
          .replace(/\{time\}/g, item?.time ?? '')
          .replace(/\{value\}/g, formattedValues[dataIndex] ?? '')
      },
    },
    series: [
      {
        type: 'line',
        data: data.map((item) => item.value),
        smooth: props.trend.smooth,
        symbol: props.trend.showSymbol ? 'circle' : 'none',
        symbolSize: props.trend.symbolSize,
        lineStyle: {
          width: props.trend.lineWidth,
          color: props.trend.lineColor,
        },
        itemStyle: {
          color: props.trend.lineColor,
        },
        areaStyle:
          props.trend.chartType === 'area'
            ? {
                color: props.trend.areaColor,
                opacity: props.trend.areaOpacity,
              }
            : undefined,
        markPoint: props.axis.showMinMaxLabel
          ? {
              symbolSize: 1,
              label: {
                color: props.axis.labelColor,
                fontSize: props.axis.labelFontSize,
              },
              data: [
                { type: 'max', name: 'max' },
                { type: 'min', name: 'min' },
              ],
            }
          : undefined,
      },
    ],
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationEasing: props.animation.easing,
  }
}

const updateChart = () => {
  if (!chartInstance) {
    return
  }
  chartInstance.setOption(buildOption(), true)
  chartInstance.resize()
}

const handleCardClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: latestPoint.value?.value,
    changeValue: changeInfo.value.changeValue,
    changeRate: changeInfo.value.changeRate,
  })
}

const initChart = () => {
  if (!chartRef.value) {
    return
  }
  chartInstance = echarts.init(chartRef.value)
  chartInstance.on('click', (params) => {
    if (params.componentType !== 'series' || typeof params.dataIndex !== 'number') {
      return
    }
    const point = trendData.value[params.dataIndex]
    if (!point) {
      return
    }
    canvasInst.triggerChartBehavior(chart.id, 'pointClick', {
      time: point.time,
      value: point.value,
      index: params.dataIndex,
    })
  })
  if (!trendData.value.length) {
    trendData.value = buildFallbackData()
  }
  updateChart()
}

const handleResize = () => {
  chartInstance?.resize()
}

watch(
  () => chart.props,
  () => {
    nextTick(() => updateChart())
  },
  { deep: true },
)

watch(
  () => [chart.w, chart.h, chart.props.layout.trendPosition, chart.props.layout.trendHeight, chart.props.layout.trendWidth],
  () => {
    nextTick(() => handleResize())
  },
)

onMounted(() => {
  nextTick(() => initChart())
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div
    class="dr-trend-metric-card"
    :class="`dr-trend-metric-card--${chart.props.layout.trendPosition}`"
    :id="chart.id"
    :style="rootStyle"
    @click="handleCardClick"
  >
    <div class="dr-trend-metric-card__content">
      <div v-if="chart.props.title.show" class="dr-trend-metric-card__title">
        {{ displayTitle }}
      </div>
      <div class="dr-trend-metric-card__value-row">
        <span class="dr-trend-metric-card__value">{{ displayValue }}</span>
        <span v-if="latestUnit" class="dr-trend-metric-card__unit">{{ latestUnit }}</span>
      </div>
      <div class="dr-trend-metric-card__meta">
        <span
          v-if="chart.props.compare.show"
          class="dr-trend-metric-card__compare"
          :style="{ color: compareColor, fontSize: `${chart.props.compare.fontSize}px` }"
        >
          {{ compareText }}
        </span>
        <span
          v-if="chart.props.timestamp.show && displayTimestamp"
          class="dr-trend-metric-card__timestamp"
          :style="{ color: chart.props.timestamp.color, fontSize: `${chart.props.timestamp.fontSize}px` }"
        >
          {{ displayTimestamp }}
        </span>
      </div>
    </div>
    <div v-if="chart.props.trend.show" class="dr-trend-metric-card__chart-pane" :style="chartPaneStyle">
      <div ref="chartRef" class="dr-trend-metric-card__chart"></div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dr-trend-metric-card {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-style: solid;
  color: var(--el-text-color-primary);
  letter-spacing: 0;
}

.dr-trend-metric-card--bottom {
  flex-direction: column;
}

.dr-trend-metric-card--right {
  flex-direction: row;
  align-items: stretch;
}

.dr-trend-metric-card__content {
  display: flex;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 0;
  flex-direction: column;
  justify-content: center;
}

.dr-trend-metric-card__title {
  overflow: hidden;
  color: v-bind('chart.props.title.color');
  font-size: v-bind('`${chart.props.title.fontSize}px`');
  font-weight: v-bind('chart.props.title.fontWeight');
  line-height: 1.4;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-trend-metric-card__value-row {
  display: flex;
  min-width: 0;
  align-items: baseline;
  justify-content: v-bind(contentJustify);
  margin-top: 6px;
  gap: 6px;
}

.dr-trend-metric-card__value {
  overflow: hidden;
  color: v-bind('chart.props.value.color');
  font-feature-settings: 'tnum';
  font-size: v-bind('`${chart.props.value.fontSize}px`');
  font-weight: v-bind('chart.props.value.fontWeight');
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-trend-metric-card__unit {
  flex: 0 0 auto;
  color: var(--el-text-color-secondary);
  font-feature-settings: 'tnum';
  font-size: 12px;
  line-height: 1.2;
}

.dr-trend-metric-card__meta {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: v-bind(contentJustify);
  margin-top: 8px;
  gap: 8px;
  line-height: 1.3;
}

.dr-trend-metric-card__compare,
.dr-trend-metric-card__timestamp {
  overflow: hidden;
  font-feature-settings: 'tnum';
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-trend-metric-card__chart-pane {
  flex: 0 0 auto;
  min-width: 0;
  min-height: 0;
}

.dr-trend-metric-card--bottom .dr-trend-metric-card__chart-pane {
  width: 100%;
}

.dr-trend-metric-card__chart {
  width: 100%;
  height: 100%;
}
</style>
