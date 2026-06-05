<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrPeriodCompareCard',
})
</script>
<script setup lang="ts">
import type {CSSProperties} from 'vue'
import type {DrPeriodCompareCardConfig} from './install.ts'
import type {ComponentExpose} from '@/dataroom-packages/components/type/ComponentExpose.ts'
import {computed, ref} from 'vue'
import {useDrComponent} from '@/dataroom-packages/hooks/use-dr-component'
import {
  formatMetricValue,
  normalizeRows,
  resolveComparison,
  type ChangeResult,
  type ComparisonTrend,
} from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

const {chart} = defineProps<{
  chart: DrPeriodCompareCardConfig
}>()

const comparisonData = ref<ChangeResult & {title?: string}>({
  current: chart.props.current.defaultValue,
  previous: undefined,
  changeValue: undefined,
  changeRate: undefined,
  trend: 'empty',
})

const changeData = (datasetValue: unknown) => {
  comparisonData.value = resolveComparison(normalizeRows(datasetValue), chart.dataset?.fields, chart.props)
}

const {canvasInst, expose} = useDrComponent({
  chart,
  changeData,
})

const normalizedTrend = computed<Exclude<ComparisonTrend, 'empty'>>(() => {
  return comparisonData.value.trend === 'empty' ? 'flat' : comparisonData.value.trend
})

const currentValue = computed(() => comparisonData.value.current ?? chart.props.current.defaultValue)
const previousValue = computed(() => comparisonData.value.previous)
const changeValue = computed(() => comparisonData.value.changeValue)
const changeRate = computed(() => comparisonData.value.changeRate)
const displayTitle = computed(() => comparisonData.value.title || chart.props.title.text)

const rootStyle = computed<CSSProperties>(() => {
  const {global, layout, animation} = chart.props
  return {
    '--period-compare-gap': `${layout.gap}px`,
    padding: global.padding.map(item => `${item}px`).join(' '),
    backgroundColor: global.backgroundColor,
    border: `${global.borderWidth}px solid ${global.borderColor}`,
    borderRadius: `${global.borderRadius}px`,
    gap: `${layout.gap}px`,
    textAlign: layout.horizontalAlign,
    transition: animation.enabled
      ? `color ${animation.duration}ms ease-out, border-color ${animation.duration}ms ease-out, background-color ${animation.duration}ms ease-out`
      : undefined,
  } as CSSProperties
})

const titleStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.title.fontSize}px`,
  color: chart.props.title.color,
  fontWeight: chart.props.title.fontWeight,
}))

const currentStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.current.fontSize}px`,
  color: chart.props.current.color,
  fontWeight: chart.props.current.fontWeight,
}))

const labelStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.textStyle.labelFontSize}px`,
  color: chart.props.textStyle.labelColor,
  width: chart.props.layout.labelWidth > 0 ? `${chart.props.layout.labelWidth}px` : undefined,
}))

const compareStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.textStyle.compareFontSize}px`,
  fontWeight: chart.props.textStyle.compareFontWeight,
}))

const currentText = computed(() => {
  const {current} = chart.props
  return formatMetricValue(currentValue.value, {
    format: current.format,
    prefix: current.prefix,
    suffix: current.suffix,
  })
})

const previousText = computed(() => {
  return formatMetricValue(previousValue.value, {
    format: chart.props.current.format,
    prefix: chart.props.current.prefix,
    suffix: chart.props.current.suffix,
  })
})

const changeValueText = computed(() => {
  const value = changeValue.value
  const sign = typeof value === 'number' && value > 0 ? '+' : ''
  return `${sign}${formatMetricValue(value, {
    format: chart.props.current.format,
    prefix: chart.props.comparison.changeValuePrefix,
    suffix: chart.props.comparison.changeValueSuffix,
  })}`
})

const changeRateText = computed(() => {
  const value = changeRate.value
  if (value === Number.POSITIVE_INFINITY) {
    return '+∞'
  }
  if (value === Number.NEGATIVE_INFINITY) {
    return '-∞'
  }
  const sign = typeof value === 'number' && value > 0 ? '+' : ''
  return `${sign}${formatMetricValue(value, {
    format: chart.props.comparison.rateFormat,
  })}`
})

const trendColor = computed(() => {
  const {indicator} = chart.props
  if (indicator.positiveDirection === 'neutral' || normalizedTrend.value === 'flat') {
    return indicator.neutralColor
  }
  const isPositive =
    (indicator.positiveDirection === 'increaseGood' && normalizedTrend.value === 'up') ||
    (indicator.positiveDirection === 'decreaseGood' && normalizedTrend.value === 'down')
  return isPositive ? indicator.positiveColor : indicator.negativeColor
})

const indicatorText = computed(() => {
  const trend = normalizedTrend.value
  if (chart.props.indicator.type === 'text') {
    return trend === 'up' ? '上升' : trend === 'down' ? '下降' : '持平'
  }
  if (chart.props.indicator.type === 'triangle') {
    return trend === 'up' ? '▲' : trend === 'down' ? '▼' : '▬'
  }
  return trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'
})

const indicatorStyle = computed<CSSProperties>(() => ({
  color: trendColor.value,
  fontSize: `${chart.props.indicator.iconSize}px`,
}))

const showIndicator = computed(() => chart.props.indicator.show && chart.props.indicator.type !== 'none')

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    currentValue: currentValue.value,
    previousValue: previousValue.value,
    changeValue: changeValue.value,
    changeRate: changeRate.value,
    trend: normalizedTrend.value,
  })
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div
    :id="chart.id"
    class="dr-period-compare-card"
    :class="[
      `dr-period-compare-card--${chart.props.layout.mode}`,
      `dr-period-compare-card--align-${chart.props.layout.horizontalAlign}`,
    ]"
    :style="rootStyle"
    @click="onClick"
  >
    <div
      v-if="chart.props.title.show"
      class="dr-period-compare-card__title"
      :style="titleStyle"
    >
      {{ displayTitle }}
    </div>

    <div class="dr-period-compare-card__body">
      <div class="dr-period-compare-card__current">
        <span class="dr-period-compare-card__label" :style="labelStyle">{{ chart.props.current.label }}</span>
        <span class="dr-period-compare-card__value" :style="currentStyle">{{ currentText }}</span>
      </div>

      <div class="dr-period-compare-card__compare-list">
        <div
          v-if="chart.props.comparison.showPreviousValue"
          class="dr-period-compare-card__compare-item"
        >
          <span class="dr-period-compare-card__label" :style="labelStyle">{{ chart.props.comparison.label }}</span>
          <span class="dr-period-compare-card__compare-value" :style="compareStyle">{{ previousText }}</span>
        </div>

        <div
          v-if="chart.props.comparison.showChangeValue"
          class="dr-period-compare-card__compare-item"
        >
          <span class="dr-period-compare-card__label" :style="labelStyle">变化值</span>
          <span
            class="dr-period-compare-card__compare-value"
            :style="[compareStyle, {color: trendColor}]"
          >
            {{ changeValueText }}
          </span>
        </div>

        <div
          v-if="chart.props.comparison.showChangeRate"
          class="dr-period-compare-card__compare-item"
        >
          <span class="dr-period-compare-card__label" :style="labelStyle">变化率</span>
          <span
            class="dr-period-compare-card__rate"
            :style="[compareStyle, {color: trendColor}]"
          >
            <span v-if="showIndicator" class="dr-period-compare-card__indicator" :style="indicatorStyle">
              {{ indicatorText }}
            </span>
            {{ changeRateText }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dr-period-compare-card {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-period-compare-card__title,
.dr-period-compare-card__label,
.dr-period-compare-card__value,
.dr-period-compare-card__compare-value,
.dr-period-compare-card__rate {
  min-width: 0;
  letter-spacing: 0;
}

.dr-period-compare-card__title {
  flex: 0 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-period-compare-card__body {
  display: flex;
  flex: 1 1 auto;
  gap: inherit;
  min-height: 0;
}

.dr-period-compare-card__current {
  display: flex;
  min-width: 0;
}

.dr-period-compare-card__label {
  flex: 0 0 auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-period-compare-card__value,
.dr-period-compare-card__compare-value,
.dr-period-compare-card__rate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-feature-settings: "tnum";
}

.dr-period-compare-card__compare-list {
  display: flex;
  min-width: 0;
  gap: calc(var(--period-compare-gap) / 2);
}

.dr-period-compare-card__compare-item {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 4px;
}

.dr-period-compare-card__rate {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.dr-period-compare-card__indicator {
  flex: 0 0 auto;
  line-height: 1;
}

.dr-period-compare-card--compact .dr-period-compare-card__body,
.dr-period-compare-card--vertical .dr-period-compare-card__body {
  flex-direction: column;
  justify-content: center;
}

.dr-period-compare-card--compact .dr-period-compare-card__current,
.dr-period-compare-card--vertical .dr-period-compare-card__current {
  flex-direction: column;
  gap: 4px;
}

.dr-period-compare-card--compact .dr-period-compare-card__compare-list {
  flex-direction: row;
  flex-wrap: wrap;
}

.dr-period-compare-card--vertical .dr-period-compare-card__compare-list {
  flex-direction: column;
}

.dr-period-compare-card--horizontal .dr-period-compare-card__body {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.dr-period-compare-card--horizontal .dr-period-compare-card__current {
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
}

.dr-period-compare-card--horizontal .dr-period-compare-card__compare-list {
  flex: 0 1 auto;
  flex-direction: column;
}

.dr-period-compare-card--align-left {
  align-items: flex-start;
}

.dr-period-compare-card--align-center {
  align-items: center;
}

.dr-period-compare-card--align-right {
  align-items: flex-end;
}

.dr-period-compare-card--align-left .dr-period-compare-card__body,
.dr-period-compare-card--align-left .dr-period-compare-card__compare-list {
  align-items: flex-start;
}

.dr-period-compare-card--align-center .dr-period-compare-card__body,
.dr-period-compare-card--align-center .dr-period-compare-card__compare-list {
  align-items: center;
}

.dr-period-compare-card--align-right .dr-period-compare-card__body,
.dr-period-compare-card--align-right .dr-period-compare-card__compare-list {
  align-items: flex-end;
}
</style>
