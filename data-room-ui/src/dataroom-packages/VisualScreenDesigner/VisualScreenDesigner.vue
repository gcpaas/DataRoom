<script setup lang="ts">
import { getComponent, getComponentInstance, getPanelComponent } from '@/dataroom-packages/components/AutoInstall.ts'
import { type Component, computed, type ComputedRef, type CSSProperties, defineAsyncComponent, nextTick, onMounted, provide, reactive, ref, shallowRef } from 'vue'
import { debounce } from 'lodash'
import Moveable, { type OnDrag, type OnDragEnd, type OnDragStart, type OnEvent, type OnResize, type OnResizeEnd, type OnRotate, type OnRotateEnd } from 'vue3-moveable'
import { VueSelecto } from 'vue3-selecto'
import { deleteChartById, extractPositionFromTransform, getChartByElement, getChartById, getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'
import VanillaSelecto from 'selecto'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { LeftToolBar } from '@/dataroom-packages/PageDesigner/type/LeftToolBar.ts'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pageApi } from '@/dataroom-packages/page/api.ts'
import type { PageStageEntity } from '@/dataroom-packages/page/type/PageStageEntity.ts'
import { useCanvasInst } from '@/dataroom-packages/hooks/use-canvas-inst'
import type { GlobalVariable } from '@/dataroom-packages/PageDesigner/type/GlobalVariable.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { VisualScreenPageBasicConfig } from '@/dataroom-packages/PageDesigner/type/VisualScreenPageBasicConfig.ts'

const router = useRouter()
const route = useRoute()
const canvasContainer = ref<HTMLElement | null>(null)
const activeChart = ref<ChartConfig<unknown>>()
const chartList = ref<ChartConfig<unknown>[]>([])
const pageStageEntity = ref<PageStageEntity>()
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
const defaultBasicConfig: VisualScreenPageBasicConfig = {
  background: { fill: 'color', color: '#0d1e42', url: '', opacity: 100, repeat: 'no-repeat' },
  size: { width: 1920, height: 1080, zoom: 'contain' },
  timers: [],
}
const basicConfig = ref<VisualScreenPageBasicConfig>({ ...defaultBasicConfig })
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
const { canvasInst } = useCanvasInst({
  chartList,
  globalVariable,
  addChart,
  activeChartById,
})
provide(DrConst.CANVAS_INST, canvasInst)

const ComponentLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLib.vue'))
const ComponentLayer = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLayer.vue'))
const GlobalVariable = defineAsyncComponent(() => import('@/dataroom-packages/_components/GlobalVariable.vue'))
const ResourceLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ResourceLib.vue'))
const ControlPanelWrapper = defineAsyncComponent(() => import('@/dataroom-packages/_components/ControlPanel.vue'))
const VisualScreenControlPanel = defineAsyncComponent(() => import('./ControlPanel.vue'))
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
// 激活的左侧工具条项
const activeLeftToolBar = ref<LeftToolBar>(leftToolBarList[1]!)
const leftToolPanelShow = ref(true)
const rightControlPanelShow = ref(true)

// 弹框显示状态（素材、变量）
const resourceLibDialogVisible = ref(false)
const globalVariableDialogVisible = ref(false)

// 核心：使用计算属性生成main区域的样式对象
const mainStyle = computed(() => {
  if (leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: '60px 240px auto 300px',
    }
  } else if (!leftToolPanelShow.value && !rightControlPanelShow.value) {
    return {
      gridTemplateColumns: '60px auto',
    }
  } else if (!leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: '60px auto 300px',
    }
  } else {
    return {
      gridTemplateColumns: '60px 240px auto',
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
  pageApi
    .updatePageConfig4Preview({
      ...pageStageEntity.value,
      pageConfig: {
        ...pageStageEntity.value.pageConfig,
        chartList: chartList.value,
        basicConfig: basicConfig.value,
        globalVariableList: globalVariable.value,
      },
    })
    .then(() => {
      const routeData = router.resolve({
        path: `/dataRoom/visualScreenPreview/preview/${pageStageEntity.value!.pageCode}`,
      })
      window.open(routeData.href, '_blank')
    })
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
  pageApi
    .updatePageConfig({
      ...pageStageEntity.value,
      pageConfig: {
        ...pageStageEntity.value.pageConfig,
        chartList: chartList.value,
        basicConfig: basicConfig.value,
        globalVariableList: globalVariable.value,
      },
    })
    .then(() => {
      ElMessage({
        message: '保存成功',
        type: 'success',
      })
    })
}

/**
 * 左侧工具条激活
 * @param leftToolBar
 */
const onActiveLeftToolBar = (leftToolBar: LeftToolBar) => {
  activeLeftToolBar.value = leftToolBar
  if (leftToolBar.componentName === 'ComponentLayer') {
    leftToolPanelShow.value = true
  } else if (leftToolBar.componentName === 'ResourceLib') {
    resourceLibDialogVisible.value = false
    nextTick(() => {
      resourceLibDialogVisible.value = true
    })
  } else if (leftToolBar.componentName === 'GlobalVariable') {
    globalVariableDialogVisible.value = false
    nextTick(() => {
      globalVariableDialogVisible.value = true
    })
  } else if (leftToolBar.componentName === 'ComponentLib') {
    leftToolPanelShow.value = true
  }
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
  const { x, y, rotateX, rotateY, rotateZ } = extractPositionFromTransform(transform)
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

/**
 * 画布尺寸和背景动态样式
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

const computedToolAnchorStyle = computed(() => {
  if (rightControlPanelShow.value) {
    return {
      position: 'fixed',
      right: '300px',
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
  pageApi.getPageConfig(code, 'design').then((res) => {
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
  })
})
</script>

<template>
  <div class="dr-vs-editor">
    <div class="header" ref="titleRef">
      <div class="header-left">
        <img src="@/dataroom-packages/assets/logo-small.png" alt="logo" class="logo" @click="router.push('/dataRoom/page/index')" />
        <div class="title">{{ pageStageEntity?.name }}</div>
      </div>
      <div class="header-right">
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
          <div class="panel-header-inner">
            <span class="title">{{ activeLeftToolBar.desc }}</span>
            <el-icon class="close" @click="switchLeftToolPanel(false)">
              <Close />
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
            <div class="canvas-content" :style="computedCanvasContentStyle">
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
        <el-scrollbar class="right-panel-scrollbar" height="100%">
          <div class="right-panel-scroll-content">
            <template v-if="rightControlPanelSetting">
              <VisualScreenControlPanel :basicConfig="basicConfig" />
            </template>
            <template v-else>
              <ControlPanelWrapper v-if="activeChart" :chart="activeChart" :global-variable-list="globalVariable">
                <component :is="getPanelComponent(activeChart?.type)" :chart="activeChart"></component>
              </ControlPanelWrapper>
            </template>
          </div>
        </el-scrollbar>
      </div>
      <el-icon class="right-panel-tool-anchor" @click="switchRightControlPanel(!rightControlPanelShow)" :style="computedToolAnchorStyle">
        <ArrowRight v-if="rightControlPanelShow" />
        <ArrowLeft v-else />
      </el-icon>
    </div>
  </div>
  <ContextMenu
    v-if="contextMenuVisible"
    ref="contextMenuRef"
    :style="computedContextMenuStyle"
    :chart="activeChart"
    @switch-right-control-panel="switchRightControlPanel"
    @delete-chart="onChartDeleteClick"
  ></ContextMenu>

  <!-- 素材库（组件自带弹框，用 v-if 控制挂载） -->
  <ResourceLib v-if="resourceLibDialogVisible" @close="resourceLibDialogVisible = false" />

  <!-- 全局变量（组件自带弹框，用 v-if 控制挂载） -->
  <GlobalVariable v-if="globalVariableDialogVisible" :global-variable="globalVariable" @close="globalVariableDialogVisible = false" />
</template>

<style scoped lang="scss">
.dr-vs-editor {
  display: grid;
  grid-template-rows: 48px 1fr;
  height: 100vh;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  & .header {
    background-color: var(--el-bg-color);
    color: var(--el-text-color-primary);
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--el-border-color);
    position: relative;
    z-index: 10;

    & .header-left {
      display: flex;
      align-items: center;
      margin-left: 8px;
      flex-shrink: 0;

      & .logo {
        height: 30px;
        object-fit: contain;
        cursor: pointer;
        width: 44px;
      }

      & .title {
        margin-left: 16px;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        color: var(--el-text-color-primary);
      }
    }

    & .header-right {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-right: 8px;
    }
  }

  & .main {
    display: grid;
    grid-template-columns: 60px 240px auto 300px;

    & .left-tool-bar {
      background-color: var(--el-bg-color);
      box-shadow: inset -1px 0 0 0 var(--el-border-color-light);

      & .bar {
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        margin: 4px auto;
        padding: 8px 0;
        color: var(--el-text-color-secondary);
        transition: all 0.2s;

        &:hover {
          cursor: pointer;
          background-color: var(--el-fill-color-lighter);
          color: var(--el-text-color-regular);
        }
      }

      & .active {
        background-color: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        position: relative;

        &:hover {
          color: var(--el-color-primary);
        }

        &::before {
          content: '';
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          position: absolute;
          background-color: var(--el-color-primary);
          border-radius: 0 2px 2px 0;
        }
      }
    }

    & .left-tool-panel {
      background-color: var(--el-bg-color);
      display: grid;
      grid-template-rows: 40px auto;
      height: 100vh;
      box-shadow: inset -1px 0 0 0 var(--el-border-color-light);

      & .panel-header {
        background-color: var(--el-fill-color-light);
        box-sizing: border-box;
        box-shadow: inset 0 -1px 0 0 var(--el-border-color-light);
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--el-text-color-secondary);
        line-height: 40px;
        height: 40px;
        align-self: center;
        padding-left: 12px;

        & .panel-header-inner {
          position: relative;
        }

        & .title {
          letter-spacing: 0;
        }

        & .close {
          position: absolute;
          height: 40px;
          line-height: 40px;
          right: 16px;
          top: 0px;
          color: var(--el-text-color-secondary);

          &:hover {
            cursor: pointer;
            color: var(--el-color-primary);
          }
        }
      }

      & .panel-body {
        background-color: var(--el-bg-color);
        overflow-y: hidden;
        padding: 8px 4px 16px 4px;
      }
    }

    & .canvas {
      display: grid;
      background-color: var(--el-bg-color-page);
      grid-template-rows: auto;
      background-image: radial-gradient(circle, var(--el-border-color) 1px, var(--el-bg-color-page) 1px);
      background-size: 16px 16px;

      & .canvas-main {
        height: 100%;
        overflow: hidden;
        position: relative;
      }

      & .canvas-content {
        position: relative;
        min-width: 100%;
        min-height: 100%;
      }
    }

    & .right-panel {
      box-sizing: border-box;
      min-width: 0;
      overflow: hidden;
      background-color: var(--el-bg-color);
      box-shadow: inset 1px 0 0 0 var(--el-border-color-light);
      height: 100vh;
      position: relative;
      z-index: 5;

      & .right-panel-scrollbar,
      & .right-panel-scroll-content {
        width: 100%;
        height: 100%;
        max-width: 100%;
        overflow: hidden;
      }
    }
  }

  .right-panel-tool-anchor {
    position: fixed;
    box-sizing: border-box;
    right: 300px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 50px;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-regular);
    border-radius: 4px 0 0 4px;
    border: 1px solid var(--el-border-color-light);

    &:hover {
      cursor: pointer;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}

:deep(.moveable-control-box) {
  z-index: 1000;

  .moveable-control {
    width: 8px;
    height: 8px;
    border-radius: 0;
    background: var(--el-fill-color-blank);
    border: 2px solid var(--el-color-primary);
    margin-top: -4px;
    margin-left: -4px;

    &:active,
    &.moveable-origin {
      background: var(--el-color-primary);
    }
  }

  .moveable-line {
    background: var(--el-color-primary);
    height: 1px;
    width: 1px;
  }

  .moveable-guideline {
    background: var(--el-color-danger);
  }
}

:deep(.selecto-selection) {
  border: 1px dashed var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.chart-wrapper:hover:not(.moveable-target) {
  outline: 1px dashed var(--el-border-color);
}
</style>
