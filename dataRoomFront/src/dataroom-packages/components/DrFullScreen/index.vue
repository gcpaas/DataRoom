<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrFullScreen',
})
</script>
<script setup lang="ts">
import type {DrFullScreenConfig} from './install.ts'
import {ref, computed, onMounted, onBeforeUnmount} from "vue"
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"
import {FullScreen, ScaleToOriginal} from '@element-plus/icons-vue'

const {chart} = defineProps<{
  chart: DrFullScreenConfig
}>()

/**
 * 纯交互组件，不需要数据集，changeData 为空操作
 */
const changeData = (_datasetValue: any) => {
  // 纯交互组件，无数据集处理逻辑
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/** 当前是否处于全屏状态 */
const isFullscreen = ref(false)
/** 鼠标是否悬停 */
const isHovered = ref(false)

/**
 * 监听 fullscreenchange 事件更新状态
 */
const onFullscreenChange = () => {
  const wasFullscreen = isFullscreen.value
  isFullscreen.value = !!document.fullscreenElement

  // 触发对应的交互事件
  if (isFullscreen.value && !wasFullscreen) {
    canvasInst.triggerChartBehavior(chart.id, 'enterFullscreen', {isFullscreen: true})
  } else if (!isFullscreen.value && wasFullscreen) {
    canvasInst.triggerChartBehavior(chart.id, 'exitFullscreen', {isFullscreen: false})
  }
}

/**
 * 切换全屏状态
 */
const toggleFullscreen = async () => {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  } catch (err) {
    console.warn('全屏切换失败:', err)
  }
  // 触发单击交互事件
  canvasInst.triggerChartBehavior(chart.id, 'click', {isFullscreen: isFullscreen.value})
}

onMounted(() => {
  // 初始化全屏状态
  isFullscreen.value = !!document.fullscreenElement
  // 监听全屏变化
  document.addEventListener('fullscreenchange', onFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener('fullscreenchange', onFullscreenChange)
})

/**
 * 根据配置计算容器样式
 */
const containerStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: props.style.cursor || 'pointer',
    backgroundColor: props.style.backgroundColor || 'rgba(0, 0, 0, 0.5)',
    borderRadius: props.style.borderRadius + '%',
    padding: props.style.padding + 'px',
    transition: 'opacity 0.3s ease',
    boxSizing: 'border-box',
  }

  // 边框配置
  if (props.style.border?.show) {
    style.border = `${props.style.border.width}px solid ${props.style.border.color}`
  }

  // 是否常驻显示
  if (!props.style.alwaysShow && !isHovered.value) {
    style.opacity = '0'
  } else {
    style.opacity = '1'
  }

  return style
})

/**
 * 计算图标颜色（悬停时变色）
 */
const iconColor = computed(() => {
  return isHovered.value ? chart.props.icon.hoverColor : chart.props.icon.iconColor
})

/**
 * 计算当前提示文字
 */
const tooltipText = computed(() => {
  return isFullscreen.value ? chart.props.tooltip.exitText : chart.props.tooltip.enterText
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div
    class="dr-fullscreen"
    :id="chart.id"
    :style="containerStyle"
    @click="toggleFullscreen"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <el-tooltip
      :content="tooltipText"
      :disabled="!chart.props.tooltip.show"
      placement="bottom"
    >
      <el-icon
        :size="chart.props.icon.iconSize"
        :color="iconColor"
        class="dr-fullscreen__icon"
      >
        <FullScreen v-if="!isFullscreen" />
        <ScaleToOriginal v-else />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<style scoped>
.dr-fullscreen {
  width: 100%;
  height: 100%;
  user-select: none;
}

.dr-fullscreen__icon {
  transition: color 0.2s ease;
}
</style>
