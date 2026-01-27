<script setup lang="ts">
import {getComponent} from '@/dataroom-packages/components/AutoInstall.ts'
import {computed, type CSSProperties, nextTick, onMounted, onUnmounted, provide, ref} from 'vue'
import {GridItem, GridLayout} from 'vue-grid-layout-v3'
import {pageApi} from "@/dataroom-packages/page/api.ts";
import {useRoute} from "vue-router";
import {getResourceUrl} from "@/dataroom-packages/_common/_utils.ts";
import {useCanvasInst} from '@/dataroom-packages/hooks/use-canvas-inst'
import type {PageStageEntity} from "@/dataroom-packages/page/type/PageStageEntity.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {PageBasicConfig} from "@/dataroom-packages/PageDesigner/type/PageBasicConfig.ts";
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import {useTimerManager} from "@/dataroom-packages/hooks/use-timer-manager";

const pageStageEntity = ref<PageStageEntity>()
const chartList = ref<ChartConfig<unknown>[]>([])
const basicConfig = ref<PageBasicConfig>({} as PageBasicConfig)
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
const route = useRoute()

/**
 * 创建画布实例供子组件使用
 */
const {canvasInst} = useCanvasInst({
  chartList,
  globalVariable
})
provide(DrConst.CANVAS_INST, canvasInst)

// 定时器管理器
const {timerManager} = useTimerManager({
  canvasInst,
  basicConfig,
})

onMounted(() => {
  // 获取路由参数
  const code: string = route.params.pageCode as string
  const pageStatus: string = route.params.pageStatus as string
  // 根据编码获取页面详情
  pageApi.getPageConfig(code, pageStatus).then((res) => {
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    basicConfig.value = res.pageConfig?.basicConfig || {}
    globalVariable.value = res.pageConfig?.globalVariableList || []
    nextTick(() => {
      timerManager.reloadAllTimers()
    })
  })
})

/**
 * 组件卸载时清理所有定时器
 */
onUnmounted(() => {
  timerManager.clearAllTimers()
})

/**
 * 计算画布样式
 */
const computedCanvasMainContainerStyle = computed(() => {
  const background = basicConfig.value.background
  if (!background) {
    return {}
  }
  const styles: CSSProperties = {}
  if (background.fill === 'color' && background.color) {
    // 纯色背景
    styles.backgroundColor = background.color
  } else if (background.fill === 'image' && background.url) {
    // 图片背景
    styles.backgroundImage = `url(${getResourceUrl(background.url)})`
    styles.backgroundRepeat = background.repeat || 'no-repeat'
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    // 设置透明度
    if (background.opacity !== undefined && background.opacity !== 1) {
      styles.opacity = background.opacity
    }
    // 如果有背景色，作为图片的底色
    if (background.color) {
      styles.backgroundColor = background.color
    }
  }
  return styles
})
</script>

<template>
  <div class="dr-page-preview" :style="computedCanvasMainContainerStyle">
    <GridLayout
      v-model:layout="chartList"
      :col-num="48"
      :row-height="16"
      :is-draggable="false"
      :is-resizable="false"
      :vertical-compact="true"
      :use-css-transforms="true"
    >
      <GridItem
        v-for="(item, index) in chartList"
        :key="index"
        :static="false"
        :x="item.x"
        :y="item.y"
        :w="item.w"
        :h="item.h"
        :i="item.id"
      >
        <div class="chart-wrapper" :key="item.id" :id="item.id" :data-dr-id="item.id">
          <component :is="getComponent(item.type)" :chart="item"></component>
        </div>
      </GridItem>
    </GridLayout>
  </div>
</template>

<style scoped lang="scss">
.dr-page-preview {
  width: 100%;
  height: calc(100vh);
  background-color: #f5f7fa;

  & .chart-wrapper {
    background-color: white;
    height: 100%;
    width: 100%;
  }
}
</style>
