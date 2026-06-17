<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrProgressBar',
})
</script>
<script setup lang="ts">
import type {DrProgressBarConfig} from './install.ts'
import {ref, computed} from "vue";
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component";
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts";
import {getSingleDatasetValueByField} from "@/dataRoom/_common/_utils.ts";

const {chart} = defineProps<{
  chart: DrProgressBarConfig
}>()

/** 当前进度值（来自数据集或配置） */
const currentValue = ref<number>(chart.props.value.current)
/** 最大值（来自数据集或配置） */
const maxValue = ref<number>(chart.props.value.max)

/**
 * 定义改变数据的逻辑
 * @param datasetValue
 */
const changeData = (datasetValue: any) => {
  const value = getSingleDatasetValueByField(chart, 'valueField', datasetValue)
  if (value !== undefined && value !== null) {
    currentValue.value = Number(value)
  }
  const max = getSingleDatasetValueByField(chart, 'maxField', datasetValue)
  if (max !== undefined && max !== null) {
    maxValue.value = Number(max)
  }
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/** 计算百分比 */
const percent = computed(() => {
  const max = maxValue.value || chart.props.value.max || 100
  const current = currentValue.value ?? chart.props.value.current ?? 0
  if (max <= 0) return 0
  const p = (current / max) * 100
  return Math.min(Math.max(p, 0), 100)
})

/** 格式化标签文本 */
const labelText = computed(() => {
  const labelConfig = chart.props.label
  const current = currentValue.value ?? chart.props.value.current
  const max = maxValue.value || chart.props.value.max
  const pct = percent.value

  switch (labelConfig.format) {
    case 'percent':
      return `${Math.round(pct)}%`
    case 'value':
      return `${current}`
    case 'custom': {
      let template = labelConfig.customFormat || '{percent}%'
      template = template.replace(/\{value}/g, String(current))
      template = template.replace(/\{max}/g, String(max))
      template = template.replace(/\{percent}/g, String(Math.round(pct)))
      return template
    }
    default:
      return `${Math.round(pct)}%`
  }
})

/** 进度条填充背景样式 */
const barFillStyle = computed(() => {
  const barConfig = chart.props.bar
  const style: Record<string, string> = {}

  // 宽度为百分比
  style.width = `${percent.value}%`

  // 高度
  style.height = '100%'

  // 填充颜色或渐变
  if (barConfig.gradient?.enabled) {
    const direction = barConfig.gradient.direction === 'vertical' ? 'to bottom' : 'to right'
    style.background = `linear-gradient(${direction}, ${barConfig.gradient.startColor}, ${barConfig.gradient.endColor})`
  } else {
    style.background = barConfig.fillColor
  }

  // 圆角
  style.borderRadius = `${barConfig.borderRadius}px`

  // 动画
  if (chart.props.animation?.enabled) {
    style.transition = `width ${chart.props.animation.duration}ms ${chart.props.animation.easing}`
  }

  return style
})

/** 轨道样式 */
const trackStyle = computed(() => {
  const trackConfig = chart.props.track
  const barConfig = chart.props.bar
  const borderConfig = chart.props.border
  const style: Record<string, string> = {}

  style.backgroundColor = trackConfig.backgroundColor
  style.borderRadius = `${trackConfig.borderRadius}px`
  style.height = `${barConfig.height}px`

  if (borderConfig?.show) {
    style.border = `${borderConfig.width}px solid ${borderConfig.color}`
  }

  return style
})

/** 标签样式 */
const labelStyle = computed(() => {
  const labelConfig = chart.props.label
  const style: Record<string, string> = {}

  style.fontSize = `${labelConfig.fontSize}px`
  style.color = labelConfig.color
  style.fontWeight = labelConfig.fontWeight

  return style
})

/** 标题样式 */
const titleStyle = computed(() => {
  const titleConfig = chart.props.title
  const style: Record<string, string> = {}

  style.fontSize = `${titleConfig.fontSize}px`
  style.color = titleConfig.color

  if (titleConfig.position === 'left') {
    style.width = `${titleConfig.width}px`
    style.flexShrink = '0'
  }

  return style
})

/** 点击事件 */
const onClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {
    value: currentValue.value,
    percent: percent.value
  })
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-progress-bar" :id="chart.id" @click="onClick">
    <!-- 标题在顶部时的布局 -->
    <div
      v-if="chart.props.title.show && chart.props.title.position === 'top'"
      class="dr-progress-bar__title dr-progress-bar__title--top"
      :style="titleStyle"
    >
      {{ chart.props.title.text }}
    </div>

    <div
      class="dr-progress-bar__main"
      :class="{'dr-progress-bar__main--with-left-title': chart.props.title.show && chart.props.title.position === 'left'}"
    >
      <!-- 标题在左侧时 -->
      <div
        v-if="chart.props.title.show && chart.props.title.position === 'left'"
        class="dr-progress-bar__title dr-progress-bar__title--left"
        :style="titleStyle"
      >
        {{ chart.props.title.text }}
      </div>

      <!-- 标签在顶部 -->
      <div
        v-if="chart.props.label.show && chart.props.label.position === 'top'"
        class="dr-progress-bar__label dr-progress-bar__label--top"
        :style="labelStyle"
      >
        {{ labelText }}
      </div>

      <!-- 进度条区域 -->
      <div class="dr-progress-bar__wrapper">
        <!-- 轨道 -->
        <div class="dr-progress-bar__track" :style="trackStyle">
          <!-- 填充条 -->
          <div class="dr-progress-bar__fill" :style="barFillStyle">
            <!-- 标签在内部 -->
            <span
              v-if="chart.props.label.show && chart.props.label.position === 'inside'"
              class="dr-progress-bar__label dr-progress-bar__label--inside"
              :style="labelStyle"
            >
              {{ labelText }}
            </span>
          </div>
        </div>

        <!-- 标签在外部 -->
        <span
          v-if="chart.props.label.show && chart.props.label.position === 'outside'"
          class="dr-progress-bar__label dr-progress-bar__label--outside"
          :style="labelStyle"
        >
          {{ labelText }}
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dr-progress-bar {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.dr-progress-bar__title--top {
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dr-progress-bar__main {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.dr-progress-bar__main--with-left-title {
  flex-direction: row;
  align-items: center;
}

.dr-progress-bar__title--left {
  margin-right: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dr-progress-bar__label--top {
  margin-bottom: 4px;
  text-align: right;
}

.dr-progress-bar__wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  min-width: 0;
}

.dr-progress-bar__track {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}

.dr-progress-bar__fill {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.dr-progress-bar__label--inside {
  white-space: nowrap;
  line-height: 1;
}

.dr-progress-bar__label--outside {
  margin-left: 8px;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
