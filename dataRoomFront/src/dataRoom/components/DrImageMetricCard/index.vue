<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrImageMetricCard',
})
</script>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { getResourceUrl } from '@/dataRoom/utils/index.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'
import {
  formatMetricValue,
  normalizeRows,
  toFiniteNumber,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'
import type { DrImageMetricCardConfig } from './install.ts'
import {
  getImageMetricBackgroundStyle,
  getImageMetricTextShadow,
  resolveImageMetricValue,
} from './runtime.ts'

const { chart } = defineProps<{
  chart: DrImageMetricCardConfig
}>()

const datasetValue = ref<unknown>(undefined)
const animatedValue = ref(chart.props.value.defaultValue)
let animationFrame = 0

const changeData = (value: unknown) => {
  const row = normalizeRows(value)[0]
  datasetValue.value = resolveImageMetricValue(row, chart.dataset?.fields, chart.props.value.defaultValue)
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const rawValue = computed(() => datasetValue.value ?? chart.props.value.defaultValue)
const numericValue = computed(() => {
  const numeric = toFiniteNumber(rawValue.value)
  return numeric === undefined ? chart.props.value.defaultValue : numeric
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
  { immediate: true },
)

const formattedValue = computed(() => {
  const displayValue = toFiniteNumber(rawValue.value) === undefined ? rawValue.value : animatedValue.value
  return formatMetricValue(displayValue, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    thousandSeparator: chart.props.value.thousandSeparator,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
    emptyText: chart.props.value.emptyText,
  })
})

const fallbackColor = (value: string, fallback: string) => value || fallback

const rootStyle = computed<CSSProperties>(() => {
  const global = chart.props.global
  const [top, right, bottom, left] = global.padding
  const style: CSSProperties = {
    padding: `${top}px ${right}px ${bottom}px ${left}px`,
    borderRadius: `${global.borderRadius}px`,
  }
  if (global.backgroundColor) {
    style.backgroundColor = global.backgroundColor
  }
  if (global.borderWidth > 0) {
    style.border = `${global.borderWidth}px solid ${global.borderColor || 'var(--el-border-color)'}`
  }
  if (global.shadow.enabled) {
    style.boxShadow = `${global.shadow.offsetX}px ${global.shadow.offsetY}px ${global.shadow.blur}px ${global.shadow.color || 'var(--el-border-color)'}`
  }
  return style
})

const contentStyle = computed<CSSProperties>(() => {
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  } as const
  return {
    flexDirection: chart.props.layout.imagePosition === 'left' ? 'row' : 'row-reverse',
    alignItems: verticalAlignMap[chart.props.layout.verticalAlign],
    gap: `${chart.props.layout.gap}px`,
  }
})

const imageFrameStyle = computed<CSSProperties>(() => ({
  width: `${chart.props.image.width}px`,
  height: `${chart.props.image.height}px`,
  borderRadius: `${chart.props.image.borderRadius}px`,
}))

const imageStyle = computed<CSSProperties>(() =>
  getImageMetricBackgroundStyle(
    getResourceUrl(chart.props.image.url),
    chart.props.image.repeatMode,
    chart.props.image.borderRadius,
  ),
)

const textStackStyle = computed<CSSProperties>(() => ({
  gap: `${chart.props.layout.rowGap}px`,
  alignItems:
    chart.props.layout.horizontalAlign === 'left'
      ? 'flex-start'
      : chart.props.layout.horizontalAlign === 'right'
        ? 'flex-end'
        : 'center',
  justifyContent:
    chart.props.layout.verticalAlign === 'top'
      ? 'flex-start'
      : chart.props.layout.verticalAlign === 'bottom'
        ? 'flex-end'
        : 'center',
  textAlign: chart.props.layout.horizontalAlign,
}))

const descriptionStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.description.fontSize}px`,
  color: fallbackColor(chart.props.description.color, 'var(--el-text-color-secondary)'),
  fontWeight: chart.props.description.fontWeight,
  lineHeight: chart.props.description.lineHeight,
  textAlign: chart.props.description.align,
}))

const valueStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.value.fontSize}px`,
  color: fallbackColor(chart.props.value.color, 'var(--el-text-color-primary)'),
  fontWeight: chart.props.value.fontWeight,
  lineHeight: chart.props.value.lineHeight,
  textAlign: chart.props.value.align,
  textShadow: getImageMetricTextShadow(chart.props.value.glow),
}))

const unitStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.unit.fontSize}px`,
  color: fallbackColor(chart.props.unit.color, 'var(--el-text-color-secondary)'),
  fontWeight: chart.props.unit.fontWeight,
  lineHeight: chart.props.unit.lineHeight,
}))

const inlineUnitStyle = computed<CSSProperties>(() => {
  const gap = `${chart.props.unit.gap}px`
  return {
    ...unitStyle.value,
    marginLeft: chart.props.unit.position === 'descriptionSuffix' || chart.props.unit.position === 'valueSuffix' ? gap : undefined,
    marginRight: chart.props.unit.position === 'valuePrefix' ? gap : undefined,
  }
})

const rows = computed(() => {
  const descriptionRow = 'description'
  const valueRow = 'value'
  return chart.props.layout.contentOrder === 'descriptionFirst' ? [descriptionRow, valueRow] : [valueRow, descriptionRow]
})

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: rawValue.value,
    formattedValue: formattedValue.value,
    description: chart.props.description.text,
    unit: chart.props.unit.text,
    imageUrl: chart.props.image.url,
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
  <div class="dr-image-metric-card" :id="chart.id" :style="rootStyle" @click="onClick">
    <div class="dr-image-metric-card__content" :style="contentStyle">
      <div class="dr-image-metric-card__image-frame" :style="imageFrameStyle">
        <div v-if="chart.props.image.url" class="dr-image-metric-card__image" :style="imageStyle"></div>
        <div v-else class="dr-image-metric-card__image-empty">图片加载失败</div>
      </div>

      <div class="dr-image-metric-card__text-stack" :style="textStackStyle">
        <template v-for="row in rows" :key="row">
          <div v-if="row === 'description'" class="dr-image-metric-card__description-row" :style="descriptionStyle">
            <span class="dr-image-metric-card__text">{{ chart.props.description.text }}</span>
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'descriptionSuffix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
          </div>

          <div v-else class="dr-image-metric-card__value-row" :style="valueStyle">
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'valuePrefix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
            <span class="dr-image-metric-card__value">{{ formattedValue }}</span>
            <span
              v-if="chart.props.unit.text && chart.props.unit.position === 'valueSuffix'"
              class="dr-image-metric-card__unit"
              :style="inlineUnitStyle"
            >
              {{ chart.props.unit.text }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dr-image-metric-card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-image-metric-card__content {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dr-image-metric-card__image-frame {
  flex: 0 0 auto;
  overflow: hidden;
}

.dr-image-metric-card__image,
.dr-image-metric-card__image-empty {
  width: 100%;
  height: 100%;
}

.dr-image-metric-card__image-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  letter-spacing: 0;
}

.dr-image-metric-card__text-stack {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  height: 100%;
}

.dr-image-metric-card__description-row,
.dr-image-metric-card__value-row {
  display: flex;
  align-items: baseline;
  max-width: 100%;
  min-width: 0;
  letter-spacing: 0;
}

.dr-image-metric-card__text,
.dr-image-metric-card__unit,
.dr-image-metric-card__value {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: 0;
}

.dr-image-metric-card__value {
  font-feature-settings: "tnum";
}
</style>
