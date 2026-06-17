<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrMetricCard',
})
</script>
<script setup lang="ts">
import type {CSSProperties} from 'vue'
import {computed, onBeforeUnmount, ref, watch} from 'vue'
import type {DrMetricCardConfig} from './install.ts'
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts"
import {
  formatMetricValue,
  getFirstFieldValue,
  matchConditionalRule,
  normalizeRows,
  toFiniteNumber,
} from "@/dataRoom/components/_shared/metric-table-utils.ts"

const {chart} = defineProps<{
  chart: DrMetricCardConfig
}>()

const datasetValue = ref<unknown>(undefined)
const datasetTitle = ref('')
const datasetSubtitle = ref('')
const datasetUnit = ref('')
const animatedValue = ref(chart.props.value.defaultValue)
let animationFrame = 0

const changeData = (value: unknown) => {
  const row = normalizeRows(value)[0]
  const nextValue = getFirstFieldValue(row, chart.dataset?.fields, 'valueField')
  const nextTitle = getFirstFieldValue(row, chart.dataset?.fields, 'titleField')
  const nextSubtitle = getFirstFieldValue(row, chart.dataset?.fields, 'subtitleField')
  const nextUnit = getFirstFieldValue(row, chart.dataset?.fields, 'unitField')

  datasetValue.value = nextValue === undefined ? undefined : nextValue
  datasetTitle.value = nextTitle === undefined || nextTitle === null ? '' : String(nextTitle)
  datasetSubtitle.value = nextSubtitle === undefined || nextSubtitle === null ? '' : String(nextSubtitle)
  datasetUnit.value = nextUnit === undefined || nextUnit === null ? '' : String(nextUnit)
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

const rawValue = computed(() => datasetValue.value === undefined ? chart.props.value.defaultValue : datasetValue.value)
const numericValue = computed(() => {
  const numeric = toFiniteNumber(rawValue.value)
  if (numeric !== undefined) {
    return numeric
  }
  return rawValue.value === undefined ? chart.props.value.defaultValue : 0
})
const displayTitle = computed(() => datasetTitle.value || chart.props.title.text)
const displaySubtitle = computed(() => datasetSubtitle.value || chart.props.subtitle.text)
const displayUnit = computed(() => datasetUnit.value || chart.props.unit.text)
const conditionalRule = computed(() => {
  if (!chart.props.conditional.enabled) {
    return undefined
  }
  return chart.props.conditional.rules.find(rule => matchConditionalRule(rawValue.value, rule))
})

const easingProgress = (progress: number) => {
  switch (chart.props.animation.easing) {
    case 'cubicOut':
      return 1 - Math.pow(1 - progress, 3)
    case 'elasticOut':
      return progress === 0 || progress === 1
        ? progress
        : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1
    case 'bounceOut': {
      const n1 = 7.5625
      const d1 = 2.75
      if (progress < 1 / d1) return n1 * progress * progress
      if (progress < 2 / d1) return n1 * (progress -= 1.5 / d1) * progress + 0.75
      if (progress < 2.5 / d1) return n1 * (progress -= 2.25 / d1) * progress + 0.9375
      return n1 * (progress -= 2.625 / d1) * progress + 0.984375
    }
    case 'linear':
    default:
      return progress
  }
}

watch(
  numericValue,
  (nextValue, previousValue) => {
    window.cancelAnimationFrame(animationFrame)
    if (!chart.props.animation.enabled || chart.props.animation.duration <= 0 || previousValue === undefined) {
      animatedValue.value = nextValue
      return
    }
    const startValue = animatedValue.value
    const diff = nextValue - startValue
    const startTime = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / chart.props.animation.duration, 1)
      animatedValue.value = startValue + diff * easingProgress(progress)
      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(tick)
      }
    }
    animationFrame = window.requestAnimationFrame(tick)
  },
  {immediate: true}
)

const formattedValue = computed(() => {
  const value = toFiniteNumber(rawValue.value) === undefined ? rawValue.value : animatedValue.value
  return formatMetricValue(value, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    thousandSeparator: chart.props.value.thousandSeparator,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
    emptyText: chart.props.value.emptyText
  })
})

const rootStyle = computed<CSSProperties>(() => {
  const global = chart.props.global
  const conditional = conditionalRule.value
  const padding = global.padding
  const style: CSSProperties = {
    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
    backgroundColor: conditional?.backgroundColor ?? global.backgroundColor,
    border: `${global.borderWidth}px solid ${conditional?.borderColor ?? global.borderColor}`,
    borderRadius: `${global.borderRadius}px`,
  }
  if (global.shadow.enabled) {
    style.boxShadow = `${global.shadow.offsetX}px ${global.shadow.offsetY}px ${global.shadow.blur}px ${global.shadow.color}`
  }
  return style
})

const contentStyle = computed<CSSProperties>(() => {
  const {direction, horizontalAlign, verticalAlign, gap} = chart.props.layout
  const horizontalAlignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  } as const
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end'
  } as const
  const isHorizontal = direction === 'horizontal'
  return {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: isHorizontal ? verticalAlignMap[verticalAlign] : horizontalAlignMap[horizontalAlign],
    justifyContent: isHorizontal ? horizontalAlignMap[horizontalAlign] : verticalAlignMap[verticalAlign],
    gap: `${gap}px`,
    textAlign: horizontalAlign,
  }
})

const titleStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.title.fontSize}px`,
  color: chart.props.title.color,
  fontWeight: chart.props.title.fontWeight,
}))

const valueStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.value.fontSize}px`,
  color: conditionalRule.value?.valueColor ?? chart.props.value.color,
  fontWeight: chart.props.value.fontWeight,
  lineHeight: chart.props.value.lineHeight,
}))

const subtitleStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.subtitle.fontSize}px`,
  color: chart.props.subtitle.color,
  fontWeight: chart.props.subtitle.fontWeight,
}))

const unitStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.unit.fontSize}px`,
  color: chart.props.unit.color,
}))

const inlineUnitStyle = computed<CSSProperties>(() => {
  const gap = `${chart.props.unit.gap}px`
  return chart.props.unit.position === 'prefix'
    ? {marginRight: gap, ...unitStyle.value}
    : {marginLeft: gap, ...unitStyle.value}
})

const stackedUnitStyle = computed<CSSProperties>(() => ({
  marginBottom: chart.props.unit.position === 'top' ? `${chart.props.unit.gap}px` : undefined,
  marginTop: chart.props.unit.position === 'bottom' ? `${chart.props.unit.gap}px` : undefined,
  ...unitStyle.value
}))

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: numericValue.value,
    title: displayTitle.value,
    unit: displayUnit.value
  })
}

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame)
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-metric-card" :id="chart.id" :style="rootStyle" @click="onClick">
    <div class="dr-metric-card__content" :style="contentStyle">
      <div
        v-if="chart.props.title.show"
        class="dr-metric-card__title"
        :style="titleStyle"
      >
        {{ displayTitle }}
      </div>

      <div class="dr-metric-card__metric">
        <div
          v-if="chart.props.unit.show && displayUnit && chart.props.unit.position === 'top'"
          class="dr-metric-card__unit"
          :style="stackedUnitStyle"
        >
          {{ displayUnit }}
        </div>
        <div class="dr-metric-card__value-row">
          <span
            v-if="chart.props.unit.show && displayUnit && chart.props.unit.position === 'prefix'"
            class="dr-metric-card__unit"
            :style="inlineUnitStyle"
          >
            {{ displayUnit }}
          </span>
          <span class="dr-metric-card__value" :style="valueStyle">{{ formattedValue }}</span>
          <span
            v-if="chart.props.unit.show && displayUnit && chart.props.unit.position === 'suffix'"
            class="dr-metric-card__unit"
            :style="inlineUnitStyle"
          >
            {{ displayUnit }}
          </span>
        </div>
        <div
          v-if="chart.props.unit.show && displayUnit && chart.props.unit.position === 'bottom'"
          class="dr-metric-card__unit"
          :style="stackedUnitStyle"
        >
          {{ displayUnit }}
        </div>
      </div>

      <div
        v-if="chart.props.subtitle.show"
        class="dr-metric-card__subtitle"
        :style="subtitleStyle"
      >
        {{ displaySubtitle }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.dr-metric-card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-metric-card__content {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dr-metric-card__title,
.dr-metric-card__subtitle,
.dr-metric-card__unit,
.dr-metric-card__value {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0;
}

.dr-metric-card__metric {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  min-width: 0;
}

.dr-metric-card__value-row {
  display: flex;
  align-items: baseline;
  max-width: 100%;
  min-width: 0;
}

.dr-metric-card__value {
  font-feature-settings: "tnum";
}
</style>
