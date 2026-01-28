<script setup lang="ts">
import {getComponent, getComponentInstance, getPanelComponent,} from '@/dataroom-packages/components/AutoInstall.ts'
import {type Component, computed, type ComputedRef, type CSSProperties, defineAsyncComponent, nextTick, onMounted, provide, reactive, ref, shallowRef} from 'vue'
import {debounce} from 'lodash'
import Moveable, {type OnClick, type OnDrag, type OnDragEnd, type OnDragStart, type OnEvent, type OnResize, type OnResizeEnd, type OnRotate, type OnRotateEnd,} from 'vue3-moveable'
import {VueSelecto} from 'vue3-selecto'
import {deleteChartById, extractPositionFromTransform, getChartByElement, getChartById} from '@/dataroom-packages/_common/_utils.ts'
import VanillaSelecto from 'selecto'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {LeftToolBar} from "@/dataroom-packages/PageDesigner/type/LeftToolBar.ts";
import {useRoute, useRouter} from 'vue-router'
import {ElMessage} from 'element-plus'
import {pageApi} from "@/dataroom-packages/page/api.ts";
import type {PageStageEntity} from "@/dataroom-packages/page/type/PageStageEntity.ts";
import {useCanvasInst} from '@/dataroom-packages/hooks/use-canvas-inst'
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

const router = useRouter()
const route = useRoute()
const canvasContainer = ref<HTMLElement | null>(null)
const activeChart = ref<ChartConfig<unknown>>()
const chartList = ref<ChartConfig<unknown>[]>([])
const pageStageEntity = ref<PageStageEntity>()
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
// 记录右侧控制面板是否为页面配置
const rightControlPanelSetting = ref(false)
// 定义水平和垂直线组合的标尺、便于
const verticalGuidelines = ref<number[]>([])
const horizontalGuidelines = ref<number[]>([])
for (let i = 1; i <= 100; i++) {
  verticalGuidelines.value.push(i * 50)
}
for (let i = 1; i <= 100; i++) {
  horizontalGuidelines.value.push(i * 50)
}
/**
 * 被框选中的组件、可以进行拖拽、旋转、缩放
 */
const moveableTargets: ComputedRef<(HTMLElement | null)[]> = computed(() => {
  if (!activeChart.value) {
    return []
  }
  const dom = document.getElementById(activeChart.value.id)
  return [dom]
})

const addChart = (type: string) => {
  const chartInst: ChartConfig<unknown> = getComponentInstance(type)
  chartList.value.push(chartInst)
  return chartInst
}

/**
 * 激活组件
 * @param id
 */
const activeChartById = (id: string) => {
  const chart: ChartConfig<unknown> = getChartById(id, chartList.value)
  activeChart.value = chart
  rightControlPanelSetting.value = false
}

/**
 * 子组件注入使用
 */
const {canvasInst} = useCanvasInst({
  chartList,
  globalVariable,
  addChart,
  activeChartById
})
provide(DrConst.CANVAS_INST, canvasInst)

const ComponentLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLib.vue'))
const ComponentLayer = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLayer.vue'))
const GlobalVariable = defineAsyncComponent(() => import('@/dataroom-packages/_components/GlobalVariable.vue'))
const ResourceLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ResourceLib.vue'))
const ControlPanelWrapper = defineAsyncComponent(() => import('@/dataroom-packages/_components/ControlPanel.vue'))
const ContextMenu = defineAsyncComponent(() => import('@/dataroom-packages/PageDesigner/ContextMenu.vue'))

const leftToolBarList: Array<LeftToolBar> = reactive([
  {
    name: '图层',
    desc: '图层',
    component: shallowRef<Component>(ComponentLayer),
    componentName: 'ComponentLayer',
  },
  {
    name: '组件',
    desc: '组件库',
    component: shallowRef<Component>(ComponentLib),
    componentName: 'ComponentLib',
  },
  {
    name: '素材',
    desc: '素材库',
    component: shallowRef<Component>(ResourceLib),
    componentName: 'ResourceLib',
  },
  {
    name: '变量',
    desc: '全局变量',
    component: shallowRef<Component>(GlobalVariable),
    componentName: 'GlobalVariable',
  },
])
// @ts-expect-error ignore
const activeLeftToolBar = ref<LeftToolBar>(leftToolBarList[1])
const leftToolPanelShow = ref(true)
const rightControlPanelShow = ref(true)

// 核心：使用计算属性生成main区域的样式对象
const mainStyle = computed(() => {
  if (leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'var(--dr-designer-left-tool-bar-width) var(--dr-designer-left-tool-panel-width) auto var(--dr-designer-right-panel-width)',
    }
  } else if (!leftToolPanelShow.value && !rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'var(--dr-designer-left-tool-bar-width) auto',
    }
  } else if (!leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'var(--dr-designer-left-tool-bar-width) auto var(--dr-designer-right-panel-width)',
    }
  } else {
    return {
      gridTemplateColumns: 'var(--dr-designer-left-tool-bar-width) var(--dr-designer-left-tool-panel-width) auto',
    }
  }
})
/**
 * 左侧工具面版样式
 */
const leftToolPanelStyle = computed(() => {
  if (!leftToolPanelShow.value) {
    return {
      display: 'none',
    }
  }
  return {}
})
/**
 * 右侧配置面版样式
 */
const rightControlPanelStyle = computed(() => {
  if (!rightControlPanelShow.value) {
    return {
      display: 'none',
    }
  }
  return {}
})

const switchLeftToolPanel = (open: boolean = true) => {
  leftToolPanelShow.value = open
}

const switchRightControlPanel = (open: boolean = true) => {
  rightControlPanelShow.value = open
}

const switchPageControlPanel = () => {
  switchRightControlPanel(true)
  rightControlPanelSetting.value = true
}

const contextMenuVisible = ref(false)
const contextMenuEvent = ref<MouseEvent>()
/**
 * 组件右击事件
 * @param e
 * @param chart
 */
const onRightClick = (e: MouseEvent, chart: ChartConfig<unknown>) => {
  e.preventDefault()
  contextMenuVisible.value = false
  contextMenuEvent.value = e
  activeChartById(chart.id)
  nextTick(() => {
    contextMenuVisible.value = true
  })
}

/**
 * 删除组件
 * @param chartId
 */
const onChartDeleteClick = (chartId: string) => {
  deleteChartById(chartId, chartList.value)
  activeChart.value = undefined
}

/**
 * 右击菜单样式
 */
const computedContextMenuStyle = computed(() => {
  return {
    position: 'absolute',
    left: contextMenuEvent.value?.clientX + 'px',
    top: contextMenuEvent.value?.clientY + 'px',
  }
})

const onHistory = () => {
  // TODO: 实现历史记录功能
}

/**
 * 页面预览
 */
const onPreview = () => {
  if (!pageStageEntity.value) {
    ElMessage({
      message: '页面信息未加载',
      type: 'error',
    })
    return
  }
  pageApi.updatePageConfig4Preview({
    ...pageStageEntity.value,
    pageConfig: {
      ...pageStageEntity.value.pageConfig,
      chartList: chartList.value,
    }
  }).then((res) => {
    ElMessage({
      message: '保存成功',
      type: 'success',
    })
  })

  // 跳转到 /dataRoom/visualScreenPreview 路由
  const routeData = router.resolve({
    path: `/dataRoom/visualScreenPreview/preview/${pageStageEntity.value.pageCode}`
  })
  window.open(routeData.href, '_blank')
}

/**
 * 保存页面配置
 */
const onSave = () => {
  if (!pageStageEntity.value) {
    ElMessage({
      message: '页面信息未加载',
      type: 'error',
    })
    return
  }
  pageApi.updatePageConfig({
    ...pageStageEntity.value,
    pageConfig: {
      ...pageStageEntity.value.pageConfig,
      chartList: chartList.value,
    }
  }).then((res) => {
    ElMessage({
      message: '保存成功',
      type: 'success',
    })
  })
}

const onActiveLeftToolBar = (leftToolBar: LeftToolBar) => {
  activeLeftToolBar.value = leftToolBar
  switchLeftToolPanel(true)
}

/**
 * 拖拽组件开始
 * @param e
 */
const onDragStart = (e: OnDragStart) => {
  console.log('onDragStart ', e)
}

/**
 * 拖拽组件中
 * @param e
 */
const onDrag = (e: OnDrag) => {
  // console.log('onDrag', e)
  e.target.style.transform = e.transform
  updateTransform(e, e.transform, e.width, e.height)
}
/**
 * 拖拽组件结束
 * @param e
 */
const onDragEnd = (e: OnDragEnd) => {
  console.log('onDragEnd', e)
}

const _updateTransform = (e: OnEvent, transform: string, width: number, height: number) => {
  console.log('updateTransform', width)
  const chart: ChartConfig<unknown> = getChartByElement(e.target, chartList.value)
  const {x, y, rotateX, rotateY, rotateZ} = extractPositionFromTransform(transform)
  chart.x = x
  chart.y = y
  chart.w = width
  chart.h = height
  chart.rotateX = rotateX
  chart.rotateY = rotateY
  chart.rotateZ = rotateZ
}
const updateTransform = debounce((e: OnEvent, transform: string, width: number, height: number) => {
  _updateTransform(e, transform, width, height)
}, 100)
/**
 * 缩放组件中
 * @param e
 */
const onResize = (e: OnResize) => {
  e.target.style.width = `${e.width}px`
  e.target.style.height = `${e.height}px`
  e.target.style.transform = e.drag.transform
  updateTransform(e, e.drag.transform, e.width, e.height)
}
/**
 * 缩放组件结束
 * @param e
 */
const onResizeEnd = (e: OnResizeEnd) => {
  console.log('onResizeEnd', e)
  return null
}
/**
 * 旋转组件中
 * @param e
 */
const onRotate = (e: OnRotate) => {
  console.log('onRotate', e.drag.transform)
  e.target.style.transform = e.drag.transform
}

/**
 * 旋转组件结束
 * @param e
 */
const onRotateEnd = (e: OnRotateEnd) => {
  console.log('onRotateEnd', e)
  const width: number = parseInt(e.target.style.width.replace('px', ''))
  const height: number = parseInt(e.target.style.height.replace('px', ''))
  updateTransform(e, e.target.style.transform, width, height)
}
/**
 * 框选开始
 * @param e
 */
const onSelectDragStart = (e: import('selecto').OnDragStart<VanillaSelecto>) => {
  console.log('onSelectorDragStart ', e)
}
/**
 * 框选结束、包含点击事件
 * @param e
 */
const onSelectEnd = (e: import('selecto').OnSelectEnd<VanillaSelecto>) => {
  console.log('onSelectEnd', e)
  if (e.selected.length <= 0) {
    activeChart.value = undefined
    return
  }
  const target = e.selected[0]
  if (target) {
    const active = getChartByElement(target, chartList.value)
    activeChart.value = active
    rightControlPanelSetting.value = false
  }
}
/**
 * 计算组件坐标样式
 * @param chart
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

const computedToolAnchorStyle = computed(() => {
  if (rightControlPanelShow.value) {
    return {
      position: 'fixed',
      right: 'var(--dr-designer-right-panel-width)',
    }
  }
  return {
    position: 'fixed',
    right: 0,
  }
})

onMounted(() => {
  // 获取路由中code 参数
  const code: string = route.params.pageCode as string
  // 设置 canvas 容器引用
  canvasContainer.value = document.querySelector('.canvas-content')
  // 根据编码获取页面详情
  pageApi.getPageConfig(code, "design").then((res) => {
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    globalVariable.value = res.pageConfig?.globalVariableList || []
  })
})
</script>

<template>
  <div class="dr-vs-editor">
    <div class="header" ref="titleRef">
      <div class="header-left">
        <img src="@/dataroom-packages/assets/logo-small.png" alt="logo" class="logo" @click="router.push('/dataRoom/page/index')"/>
        <div class="title">{{ pageStageEntity?.name }}</div>
      </div>
      <div style="margin-right: 8px">
        <el-button @click="onHistory" size="small">历史</el-button>
        <el-button @click="switchPageControlPanel" size="small">设置</el-button>
        <el-button @click="onPreview" size="small">预览</el-button>
        <el-button @click="onSave" size="small" type="primary">保存</el-button>
      </div>
    </div>
    <div class="main" :style="mainStyle">
      <div class="left-tool-bar">
        <div
          v-for="item in leftToolBarList"
          :key="item.name"
          :class="{ bar: true, active: activeLeftToolBar.componentName === item.componentName }"
          @click="onActiveLeftToolBar(item)"
        >
          {{ item.name }}
        </div>
      </div>
      <div class="left-tool-panel" :style="leftToolPanelStyle">
        <div class="panel-header">
          <div style="position: relative">
            <span class="title">{{ activeLeftToolBar.desc }}</span>
            <el-icon class="close" @click="switchLeftToolPanel(false)">
              <Close/>
            </el-icon>
          </div>
        </div>
        <div class="panel-body">
          <el-scrollbar>
            <component :is="activeLeftToolBar.component"></component>
          </el-scrollbar>
        </div>
      </div>
      <div class="canvas">
        <div class="canvas-main" id="canvas-main">
          <el-scrollbar>
            <div class="canvas-content">
              <div
                class="chart-wrapper"
                v-for="item in chartList"
                :key="item.id"
                :id="item.id"
                :data-dr-id="item.id"
                :style="computedChartStyle(item)"
                @contextmenu="(e: MouseEvent) => onRightClick(e, item)"
              >
                <component :is="getComponent(item.type)" :chart="item"></component>
              </div>
              <Moveable
                ref="moveableRef"
                :draggable="true"
                :rotatable="true"
                :resizable="true"
                :target="moveableTargets"
                :bounds="{ left: 0, top: 0, right: 0, bottom: 0, position: 'css' }"
                :snappable="true"
                :snap-directions="{
                  top: true,
                  left: true,
                  bottom: true,
                  right: true,
                  center: true,
                  middle: true,
                }"
                :verticalGuidelines="verticalGuidelines"
                :horizontalGuidelines="horizontalGuidelines"
                :max-snap-element-guideline-distance="70"
                :element-snap-directions="{
                  top: true,
                  left: true,
                  bottom: true,
                  right: true,
                  center: true,
                  middle: true,
                }"
                :render-directions="['nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w']"
                @drag="onDrag"
                @resize="onResize"
                @rotate="onRotate"
                @dragStart="onDragStart"
                @dragEnd="onDragEnd"
                @resizeEnd="onResizeEnd"
                @rotateEnd="onRotateEnd"
              />
              <VueSelecto
                :container="canvasContainer"
                :selectableTargets="['.chart-wrapper']"
                :selectByClick="true"
                :selectFromInside="false"
                :continueSelect="false"
                :toggleContinueSelect="'shift'"
                :hitRate="100"
                :ratio="0"
                @dragStart="onSelectDragStart"
                @selectEnd="onSelectEnd"
              />
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div class="right-panel" :style="rightControlPanelStyle">
        <el-scrollbar>
          <template v-if="rightControlPanelSetting">
            <!-- TODO: 页面配置面板组件 -->
            <div style="padding: 16px; color: var(--dr-text);">
              页面配置面板（待实现）
            </div>
          </template>
          <template v-else>
            <ControlPanelWrapper v-if="activeChart" :chart="activeChart" :global-variable-list="globalVariable">
              <component :is="getPanelComponent(activeChart?.type)" :chart="activeChart"></component>
            </ControlPanelWrapper>
          </template>
        </el-scrollbar>
      </div>
      <el-icon class="right-panel-tool-anchor" @click="switchRightControlPanel(!rightControlPanelShow)" :style="computedToolAnchorStyle">
        <ArrowRight v-if="rightControlPanelShow"/>
        <ArrowLeft v-else/>
      </el-icon>
    </div>
  </div>
  <ContextMenu v-if="contextMenuVisible" ref="contextMenuRef" :style="computedContextMenuStyle" :chart="activeChart" @switch-right-control-panel="switchRightControlPanel" @delete-chart="onChartDeleteClick"></ContextMenu>
</template>

<style scoped lang="scss">
.dr-vs-editor {
  display: grid;
  grid-template-rows: var(--dr-designer-header-height) auto;
  height: 100vh; // 设置容器高度为视口高度
  & .header {
    background-color: white;
    color: var(--dr-text1);
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--dr-border);

    & .header-left {
      display: flex;
      align-items: center;
      margin-left: 8px;

      & .logo {
        height: 30px;
        object-fit: contain;
        cursor: pointer;
        width: 44px;
      }

      & .title {
        margin-left: 16px;
        font-size: 14px;
      }
    }
  }

  & .main {
    background-color: var(--dr-bg2);
    display: grid;
    grid-template-columns: var(--dr-designer-left-tool-bar-width) var(--dr-designer-left-tool-panel-width) auto var(--dr-designer-right-panel-width);

    & .left-tool-bar {
      background-color: #fff;
      border-right: 1px solid var(--dr-border);

      & .bar {
        font-size: 12px;
        text-align: center;
        margin: 4px auto;
        padding: 8px 0;

        &:hover {
          cursor: pointer;
          background-color: var(--dr-bg2);
        }
      }

      & .active {
        background-color: var(--dr-primary1);
        color: var(--dr-primary);
        position: relative;

        &::before {
          content: '';
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          position: absolute;
          background-color: var(--dr-primary);
        }
      }
    }

    & .left-tool-panel {
      background-color: white;
      display: grid;
      grid-template-rows: 40px auto;
      height: calc(100vh - var(--dr-designer-left-tool-panel-header-height));
      border-right: 1px solid var(--dr-border);

      & .panel-header {
        background-color: var(--dr-bg2);
        box-sizing: border-box;
        border-bottom: 1px solid var(--dr-border);
        font-size: 12px;
        line-height: 40px;
        height: 40px;
        align-self: center;
        padding-left: 8px;
        // 关闭按钮
        & .close {
          position: absolute;
          height: 40px;
          line-height: 40px;
          right: 16px;
          top: 0px;

          & :hover {
            cursor: pointer;
            color: var(--dr-primary);
          }
        }
      }

      & .panel-body {
        background-color: white;
        overflow-y: hidden;
        padding: 8px 4px 16px 4px;
      }
    }

    & .canvas {
      display: grid;
      background-color: var(--dr-bg2);
      grid-template-rows: auto;

      & .canvas-main {
        // 减去header 高度
        height: calc(100vh - var(--dr-designer-header-height));
        // 使用了el-scroll
        overflow: hidden;
        position: relative;
      }

      & .canvas-content {
        position: relative;
        min-width: 100%;
        min-height: 100%;
        width: 3840px;
        height: 2160px;
      }
    }

    & .right-panel {
      background-color: white;
      border-left: 1px solid var(--dr-border);
      height: calc(100vh - var(--dr-designer-header-height));
    }
  }

  .right-panel-tool-anchor {
    position: fixed;
    box-sizing: border-box;
    right: 329px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 50px;
    background-color: white;
    color: var(--dr-text);
    border-radius: 5px 0 0 5px;
    border-top: 1px solid var(--dr-border);
    border-left: 1px solid var(--dr-border);
    border-bottom: 1px solid var(--dr-border);

    &:hover {
      cursor: pointer;
      color: var(--dr-primary);
      background-color: var(--dr-primary1);
    }
  }
}

// 修复默认moveable-control-box层级过大导致右击菜单覆盖问题
:deep(.moveable-control-box) {
  z-index: 1000 !important;
}
</style>
