<script setup lang="ts">
import { getComponent } from '@/dataRoom/components/AutoInstall.ts'
import { computed, type CSSProperties, type Ref, nextTick, onMounted, onUnmounted, provide, ref } from 'vue'
import { pageApi } from '@/dataRoom/page/api.ts'
import { useRoute } from 'vue-router'
import { getResourceUrl } from '@/dataRoom/utils/index.ts'
import { useCanvasInst } from '@/dataRoom/hooks/use-canvas-inst'
import type { PageStageEntity } from '@/dataRoom/page/type/PageStageEntity.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { PageBasicConfig } from '@/dataRoom/page-designer/type/PageBasicConfig.ts'
import type { VisualScreenPageBasicConfig } from '@/dataRoom/page-designer/type/VisualScreenPageBasicConfig.ts'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import { useTimerManager } from '@/dataRoom/hooks/use-timer-manager'
import { filterVisibleCharts } from '@/dataRoom/designer/utils/chart-visibility.ts'
import { useRealtimeDataset } from '@/dataRoom/hooks/use-realtime-dataset'

const pageStageEntity = ref<PageStageEntity>()
const chartList = ref<ChartConfig<unknown>[]>([])
const defaultBasicConfig: VisualScreenPageBasicConfig = {
  background: { fill: 'color', color: '#0d1e42', url: '', opacity: 100, repeat: 'no-repeat' },
  size: { width: 1920, height: 1080, zoom: 'contain' },
  timers: [],
}
const basicConfig = ref<VisualScreenPageBasicConfig>({ ...defaultBasicConfig })
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
const route = useRoute()

// 视口尺寸响应式
const viewportWidth = ref(window.innerWidth)
const viewportHeight = ref(window.innerHeight)
const visibleChartList = computed(() => filterVisibleCharts(chartList.value))

/**
 * 创建画布实例供子组件使用
 */
const { canvasInst } = useCanvasInst({
  chartList,
  globalVariable,
  basicConfig: basicConfig as unknown as Ref<PageBasicConfig>,
})
provide(DrConst.CANVAS_INST, canvasInst)

// 定时器管理器
const { timerManager } = useTimerManager({
  canvasInst,
  basicConfig: basicConfig as unknown as Ref<PageBasicConfig>,
})
const { realtimeDatasetManager } = useRealtimeDataset({
  canvasInst,
})

onMounted(() => {
  // 获取路由参数
  const code: string = route.params.pageCode as string
  const pageStatus: string = route.params.pageStatus as string
  // 根据编码获取页面详情
  pageApi.getPageConfig(code, pageStatus).then((res) => {
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    globalVariable.value = res.pageConfig?.globalVariableList || []
    if (res.pageConfig?.basicConfig) {
      const loaded = res.pageConfig.basicConfig as Partial<VisualScreenPageBasicConfig>
      basicConfig.value = {
        background: { ...defaultBasicConfig.background, ...loaded.background },
        size: { ...defaultBasicConfig.size, ...loaded.size },
        timers: loaded.timers || [],
      }
    }
    nextTick(() => {
      timerManager.reloadAllTimers()
      realtimeDatasetManager.reload()
    })
  })
  // 监听窗口大小变化
  window.addEventListener('resize', onResize)
})

/**
 * 组件卸载时清理
 */
onUnmounted(() => {
  timerManager.clearAllTimers()
  realtimeDatasetManager.close()
  window.removeEventListener('resize', onResize)
})

const onResize = () => {
  viewportWidth.value = window.innerWidth
  viewportHeight.value = window.innerHeight
}

/**
 * 计算组件坐标样式（与设计器一致）
 */
const computedChartStyle = (chart: ChartConfig<unknown>): CSSProperties => {
  let transform = `translate(${chart.x}px,${chart.y}px)`
  if (chart.rotateX) {
    transform += ` rotateX(${chart.rotateX}deg)`
  }
  if (chart.rotateY) {
    transform += ` rotateY(${chart.rotateY}deg)`
  }
  if (chart.rotateZ) {
    transform += ` rotateZ(${chart.rotateZ}deg)`
  }
  return {
    position: 'absolute',
    transform: transform,
    width: `${chart.w}px`,
    height: `${chart.h}px`,
  }
}

/**
 * 画布尺寸和背景动态样式（与设计器一致）
 */
const computedCanvasContentStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: `${basicConfig.value.size?.width || 1920}px`,
    height: `${basicConfig.value.size?.height || 1080}px`,
  }
  const background = basicConfig.value.background
  if (!background) {
    return styles
  }
  if (background.fill === 'color' && background.color) {
    styles.backgroundColor = background.color
  } else if (background.fill === 'image' && background.url) {
    styles.backgroundImage = `url(${getResourceUrl(background.url)})`
    styles.backgroundRepeat = background.repeat || 'no-repeat'
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    if (background.opacity !== undefined && background.opacity !== 100) {
      styles.opacity = background.opacity / 100
    }
    if (background.color) {
      styles.backgroundColor = background.color
    }
  }
  return styles
})

/**
 * 根据缩放模式计算缩放样式
 */
const computedScalerStyle = computed<CSSProperties>(() => {
  const vw = viewportWidth.value
  const vh = viewportHeight.value
  const cw = basicConfig.value.size?.width || 1920
  const ch = basicConfig.value.size?.height || 1080
  const zoom = basicConfig.value.size?.zoom || 'contain'

  let scaleX = 1
  let scaleY = 1

  switch (zoom) {
    case 'fitWidth':
      scaleX = scaleY = vw / cw
      break
    case 'fitHeight':
      scaleX = scaleY = vh / ch
      break
    case 'cover':
      scaleX = vw / cw
      scaleY = vh / ch
      break
    case 'contain':
      scaleX = scaleY = Math.min(vw / cw, vh / ch)
      break
    case 'none':
      scaleX = scaleY = 1
      break
  }

  // 居中偏移
  const offsetX = (vw - cw * scaleX) / 2
  const offsetY = (vh - ch * scaleY) / 2

  return {
    position: 'absolute',
    transformOrigin: '0 0',
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scaleX}, ${scaleY})`,
    width: `${cw}px`,
    height: `${ch}px`,
  }
})
</script>

<template>
  <div class="vs-preview-viewport">
    <div class="vs-preview-scaler" :style="computedScalerStyle">
      <div class="canvas-content" :style="computedCanvasContentStyle">
        <div class="chart-wrapper" v-for="item in visibleChartList" :key="item.id" :id="item.id" :data-dr-id="item.id" :style="computedChartStyle(item)">
          <component :is="getComponent(item.type)" :chart="item"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.vs-preview-viewport {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: var(--el-text-color-primary);
  position: relative;
  margin: 0;
  padding: 0;

  .vs-preview-scaler {
    will-change: transform;

    .canvas-content {
      position: relative;
      min-width: 100%;
      min-height: 100%;
    }
  }
}
</style>
