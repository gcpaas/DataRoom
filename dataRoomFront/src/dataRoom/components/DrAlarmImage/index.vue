<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAlarmImage',
})
</script>
<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref } from 'vue'
import type { DrAlarmImageConfig } from './install.ts'
import { getResourceUrl } from '@/dataRoom/_common/_utils.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'
import {
  formatMetricValue,
  getFirstFieldValue,
  normalizeRows,
  toFiniteNumber,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'
import { resolveAlarmImageItem } from './alarm-condition.ts'

const { chart } = defineProps<{
  chart: DrAlarmImageConfig
}>()

const datasetValue = ref<unknown>(undefined)

const changeData = (value: unknown) => {
  const row = normalizeRows(value)[0]
  const nextValue = getFirstFieldValue(row, chart.dataset?.fields, 'valueField')
  datasetValue.value = nextValue === undefined ? undefined : nextValue
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const rawValue = computed(() => (datasetValue.value === undefined ? chart.props.value.defaultValue : datasetValue.value))

const currentImageItem = computed(() =>
  resolveAlarmImageItem({
    items: chart.props.image.items,
    defaultItemId: chart.props.image.defaultItemId,
    value: rawValue.value,
    chartId: chart.id,
  }),
)

const formattedValue = computed(() =>
  formatMetricValue(rawValue.value, {
    format: chart.props.value.format,
    decimalPlaces: chart.props.value.decimalPlaces,
    thousandSeparator: chart.props.value.thousandSeparator,
    prefix: chart.props.value.prefix,
    suffix: chart.props.value.suffix,
    emptyText: chart.props.value.emptyText,
  }),
)

const rootStyle = computed<CSSProperties>(() => {
  const horizontalAlignMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  } as const
  const verticalAlignMap = {
    top: 'flex-start',
    center: 'center',
    bottom: 'flex-end',
  } as const
  const isHorizontal = chart.props.layout.direction === 'horizontal'
  return {
    flexDirection: isHorizontal ? 'row' : 'column',
    alignItems: isHorizontal
      ? verticalAlignMap[chart.props.layout.verticalAlign]
      : horizontalAlignMap[chart.props.layout.horizontalAlign],
    justifyContent: isHorizontal
      ? horizontalAlignMap[chart.props.layout.horizontalAlign]
      : verticalAlignMap[chart.props.layout.verticalAlign],
    gap: `${chart.props.layout.gap}px`,
  }
})

const imageStyle = computed<CSSProperties>(() => {
  const style: CSSProperties = {
    borderRadius: `${chart.props.image.borderRadius}px`,
  }
  const url = currentImageItem.value?.url ? getResourceUrl(currentImageItem.value.url) : ''
  if (url) {
    style.backgroundImage = `url(${url})`
  }
  if (chart.props.layout.imageSize === 'contain') {
    style.flex = '1 1 auto'
  }
  if (chart.props.animation.enabled) {
    style.transition = `background-image ${chart.props.animation.duration}ms ease, opacity ${chart.props.animation.duration}ms ease`
  }
  switch (chart.props.image.repeatMode) {
    case 'no-repeat-stretch':
      style.backgroundSize = '100% 100%'
      style.backgroundRepeat = 'no-repeat'
      break
    case 'no-repeat-contain':
      style.backgroundSize = 'contain'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'no-repeat-center':
      style.backgroundSize = 'auto'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'repeat':
      style.backgroundRepeat = 'repeat'
      break
    case 'repeat-x':
      style.backgroundRepeat = 'repeat-x'
      break
    case 'repeat-y':
      style.backgroundRepeat = 'repeat-y'
      break
  }
  return style
})

const valueStyle = computed<CSSProperties>(() => ({
  fontSize: `${chart.props.value.fontSize}px`,
  color: chart.props.value.color,
  fontWeight: chart.props.value.fontWeight,
  lineHeight: chart.props.value.lineHeight,
}))

const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: toFiniteNumber(rawValue.value) ?? rawValue.value,
    formattedValue: formattedValue.value,
    imageName: currentImageItem.value?.name ?? '',
    imageUrl: currentImageItem.value?.url ?? '',
    condition: currentImageItem.value?.condition ?? '',
  })
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-alarm-image" :id="chart.id" :style="rootStyle" @click="onClick">
    <div v-if="currentImageItem?.url" class="dr-alarm-image__image" :style="imageStyle"></div>
    <div v-else class="dr-alarm-image__error">图片加载失败</div>
    <div v-if="chart.props.value.show" class="dr-alarm-image__value" :style="valueStyle">
      {{ formattedValue }}
    </div>
  </div>
</template>

<style scoped>
.dr-alarm-image {
  box-sizing: border-box;
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.dr-alarm-image__image {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.dr-alarm-image__error {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  letter-spacing: 0;
}

.dr-alarm-image__value {
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  font-feature-settings: "tnum";
  letter-spacing: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
