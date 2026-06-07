<script setup lang="ts">
import { getComponent, getComponentInstance, getPanelComponent } from '@/dataroom-packages/components/AutoInstall.ts'
import { computed, type CSSProperties, defineAsyncComponent, nextTick, onMounted, onUnmounted, provide, reactive, ref, watch } from 'vue'
import { GridItem, GridLayout } from 'vue-grid-layout-v3'
import { v4 as uuidv4 } from 'uuid'
import { getChartById, getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { pageApi } from '@/dataroom-packages/page/api.ts'
import { useCanvasInst } from '@/dataroom-packages/hooks/use-canvas-inst'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { PageStageEntity } from '@/dataroom-packages/page/type/PageStageEntity.ts'
import type { PageBasicConfig } from '@/dataroom-packages/PageDesigner/type/PageBasicConfig.ts'
import type { GlobalVariable } from '@/dataroom-packages/PageDesigner/type/GlobalVariable.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import { useTimerManager } from '@/dataroom-packages/hooks/use-timer-manager'
import { handleSaveBeforeLeaveAction, type SaveBeforeLeaveAction } from '@/dataroom-packages/_common/save-before-leave'
import type { ChartLayerMoveDirection } from '@/dataroom-packages/PageDesigner/type/CanvasInst.ts'
import {
  ChartLayoutBaselineTracker,
  EditorHistoryManager,
  captureChartLayoutState,
  createAddChartHistoryEntry,
  createChartLayoutHistoryEntry,
  createRemoveChartHistoryEntry,
  createReorderChartHistoryEntry,
  findChartReference,
  getChartListByParent,
  getEditorHistoryShortcutAction,
  isNativeTextEditingTarget,
  removeChartWithLocation,
  reorderChartWithinParent,
} from '@/dataroom-packages/_common/editor-history.ts'

const router = useRouter()
const route = useRoute()
const activeChart = ref<ChartConfig<unknown>>()
const pageStageEntity = ref<PageStageEntity>()
const chartList = ref<ChartConfig<unknown>[]>([])
const pageBasicConfig = ref<PageBasicConfig>({} as PageBasicConfig)
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
const leftToolPanelShow = ref(false)
const rightControlPanelShow = ref(true)
// 记录右侧控制面板是否为页面配置
const rightControlPanelSetting = ref(true)
const editorHistory = reactive(
  new EditorHistoryManager({
    source: 'page-designer',
    getChartList: () => chartList.value,
  }),
)
const chartLayoutBaselineTracker = new ChartLayoutBaselineTracker()
const ContextMenu = defineAsyncComponent(() => import('@/dataroom-packages/PageDesigner/ContextMenu.vue'))
const ControlPanelWrapper = defineAsyncComponent(() => import('@/dataroom-packages/_components/ControlPanel.vue'))
const ControlPanel = defineAsyncComponent(() => import('@/dataroom-packages/PageDesigner/ControlPanel.vue'))
const ComponentLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLib.vue'))
const ComponentLayer = defineAsyncComponent(() => import('@/dataroom-packages/_components/ComponentLayer.vue'))
const GlobalVariableComponent = defineAsyncComponent(() => import('@/dataroom-packages/_components/GlobalVariable.vue'))
const ResourceLib = defineAsyncComponent(() => import('@/dataroom-packages/_components/ResourceLib.vue'))
const SaveBeforeLeaveDialog = defineAsyncComponent(() => import('@/dataroom-packages/_components/SaveBeforeLeaveDialog.vue'))

type InsertCommand = 'component' | 'resource'

const syncActiveChartReference = () => {
  if (!activeChart.value) {
    return
  }

  const reference = findChartReference(activeChart.value.id, chartList.value)
  if (!reference) {
    activeChart.value = undefined
    rightControlPanelSetting.value = true
    return
  }

  activeChart.value = reference.chart
}

const rebuildChartLayoutBaselines = () => {
  chartLayoutBaselineTracker.rebuild(chartList.value)
}

const getChartLayoutBaseline = (chart: ChartConfig<unknown>) => {
  return chartLayoutBaselineTracker.get(chart)
}

const rememberChartLayoutBaseline = (chart: ChartConfig<unknown>) => {
  chartLayoutBaselineTracker.remember(chart)
}

const commitChartLayoutHistory = (chart: ChartConfig<unknown>, label: string) => {
  const before = getChartLayoutBaseline(chart)
  const after = captureChartLayoutState(chart)
  editorHistory.record(createChartLayoutHistoryEntry(label, 'page-designer', chart.id, before, after))
  rememberChartLayoutBaseline(chart)
}

const commitChartAdd = (chart: ChartConfig<unknown>, label: string = '新增组件') => {
  const reference = findChartReference(chart.id, chartList.value)
  if (!reference) {
    return
  }

  editorHistory.record(createAddChartHistoryEntry(label, 'page-designer', reference.chart, reference.parent, reference.index))
  rememberChartLayoutBaseline(reference.chart)
}

const deleteChartWithHistory = (chartId: string, label: string = '删除组件') => {
  const removed = removeChartWithLocation(chartId, chartList.value)
  if (!removed) {
    return false
  }

  editorHistory.record(createRemoveChartHistoryEntry(label, 'page-designer', removed.parent, removed.index, removed.chart))
  chartLayoutBaselineTracker.forget(chartId)
  syncActiveChartReference()
  return true
}

const moveChartLayer = (chartId: string, direction: ChartLayerMoveDirection) => {
  const reference = findChartReference(chartId, chartList.value)
  if (!reference) {
    return false
  }

  const siblingList = getChartListByParent(chartList.value, reference.parent)
  if (!siblingList || siblingList.length <= 1) {
    return false
  }

  let targetIndex = reference.index
  let label = '调整图层顺序'
  if (direction === 'top') {
    targetIndex = 0
    label = '图层置顶'
  } else if (direction === 'up') {
    targetIndex = Math.max(0, reference.index - 1)
    label = '图层上移'
  } else if (direction === 'down') {
    targetIndex = Math.min(siblingList.length - 1, reference.index + 1)
    label = '图层下移'
  } else if (direction === 'bottom') {
    targetIndex = siblingList.length - 1
    label = '图层置底'
  }

  const reordered = reorderChartWithinParent(chartList.value, {
    parent: reference.parent,
    chartId,
    toIndex: targetIndex,
  })
  if (!reordered || targetIndex === reference.index) {
    return false
  }

  editorHistory.record(createReorderChartHistoryEntry(label, 'page-designer', reference.parent, chartId, reference.index, targetIndex))
  rebuildChartLayoutBaselines()
  syncActiveChartReference()
  return true
}

const applyHistoryAction = (action: 'undo' | 'redo') => {
  const changed = action === 'undo' ? editorHistory.undo() : editorHistory.redo()
  if (!changed) {
    return false
  }

  contextMenuVisible.value = false
  rebuildChartLayoutBaselines()
  syncActiveChartReference()
  return true
}

const onHistoryKeyDown = (event: KeyboardEvent) => {
  const action = getEditorHistoryShortcutAction(event)
  if (!action || isNativeTextEditingTarget(event.target)) {
    return
  }

  const handled = applyHistoryAction(action)
  if (handled) {
    event.preventDefault()
  }
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
 * 右侧配置面板开关
 * @param open
 */
const switchRightControlPanel = (open: boolean = true) => {
  rightControlPanelShow.value = open
}
const switchPageControlPanel = () => {
  switchRightControlPanel(true)
  rightControlPanelSetting.value = true
}
/**
 * 添加组件到画布中、默认添加到左上角
 * @param type
 */
const addChart = (type: string) => {
  const chartInst: ChartConfig<unknown> = getComponentInstance(type)
  chartInst.i = uuidv4()
  chartInst.id = chartInst.i
  chartInst.x = 0
  chartInst.y = 0
  chartInst.w = 16
  chartInst.h = 5
  chartList.value.push(chartInst)
  rememberChartLayoutBaseline(chartInst)
  nextTick(() => {
    const reference = findChartReference(chartInst.id, chartList.value)
    if (!reference) {
      return
    }
    activeChart.value = reference.chart
  })
  return chartInst
}

const { canvasInst } = useCanvasInst({
  chartList,
  globalVariable,
  addChart,
  activeChartById,
  commitChartAdd,
  undo: () => applyHistoryAction('undo'),
  redo: () => applyHistoryAction('redo'),
  canUndo: () => editorHistory.canUndo,
  canRedo: () => editorHistory.canRedo,
  moveChartLayer,
})

const { timerManager } = useTimerManager({
  canvasInst,
  basicConfig: pageBasicConfig,
})

provide(DrConst.CANVAS_INST, canvasInst)

/**
 * 左侧工具面版样式
 */
const computedLeftToolPanelStyle = computed(() => {
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
const computedRightControlPanelStyle = computed(() => {
  if (!rightControlPanelShow.value) {
    return {
      display: 'none',
    }
  }
  return {}
})

/**
 * 左侧工具面板开关
 * @param open
 */
const switchLeftToolPanel = (open: boolean = true) => {
  leftToolPanelShow.value = open
}

const componentLibVisible = ref(false)
const resourceLibVisible = ref(false)
const globalVariableVisible = ref(false)
const contextMenuVisible = ref(false)
/**
 * 打开组件库弹框
 */
const openComponentLib = () => {
  componentLibVisible.value = false
  nextTick(() => {
    componentLibVisible.value = true
  })
}

/**
 * 打开素材库弹框
 */
const openResourceLib = () => {
  resourceLibVisible.value = false
  nextTick(() => {
    resourceLibVisible.value = true
  })
}

/**
 * 打开全局变量弹框
 */
const openGlobalVariable = () => {
  globalVariableVisible.value = false
  nextTick(() => {
    globalVariableVisible.value = true
  })
}

/**
 * 打开左侧图层面板
 */
const openLayerPanel = () => {
  switchLeftToolPanel(true)
}

/**
 * 顶部插入菜单命令
 * @param command
 */
const onInsertCommand = (command: InsertCommand) => {
  if (command === 'component') {
    openComponentLib()
    return
  }
  openResourceLib()
}
/**
 * 计算组件坐标样式
 * @param chart
 */
const computedChartStyle = (chart: ChartConfig<unknown>): CSSProperties => {
  // 暂时无用
  if (chart) {
    return {}
  }
  return {}
}
const computedToolAnchorStyle = computed(() => {
  if (rightControlPanelShow.value) {
    return {
      position: 'fixed',
      right: '330px',
    }
  }
  return {
    position: 'fixed',
    right: 0,
  }
})
/**
 * 组件大小改变结束
 * @param i
 * @param newH
 * @param newW
 */
const onResized = (i: string, newH: number, newW: number) => {
  const chart: ChartConfig<unknown> = getChartById(i, chartList.value)
  chart.w = newW
  chart.h = newH
  commitChartLayoutHistory(chart, '调整组件大小')
}
/**
 * 组件位置改变结束
 * @param i
 * @param newX
 * @param newY
 */
const onMoved = (i: string, newX: number, newY: number) => {
  const chart: ChartConfig<unknown> = getChartById(i, chartList.value)
  chart.x = newX
  chart.y = newY
  commitChartLayoutHistory(chart, '移动组件')
}

/**
 * 图表点击
 * @param chart
 */
const onChartClick = (chart: ChartConfig<unknown>) => {
  activeChartById(chart.id)
}

/**
 * 画布空白区域点击，切换到画布配置面板
 */
const onCanvasClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (target.closest('.vue-grid-item')) {
    return
  }
  activeChart.value = undefined
  rightControlPanelSetting.value = true
}

const contextMenuEvent = ref<MouseEvent>()
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
  deleteChartWithHistory(chartId)
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
        basicConfig: pageBasicConfig.value,
      },
    })
    .then(() => {
      const routeData = router.resolve({
        path: `/dataRoom/pagePreviewer/preview/${pageStageEntity.value?.pageCode}`,
      })
      window.open(routeData.href, '_blank')
    })
}

const getPageConfigPayload = () => {
  if (!pageStageEntity.value) {
    ElMessage({
      message: '页面信息未加载',
      type: 'error',
    })
    return null
  }

  return {
    ...pageStageEntity.value,
    pageConfig: {
      ...pageStageEntity.value.pageConfig,
      chartList: chartList.value,
      basicConfig: pageBasicConfig.value,
    },
  }
}
/**
 * 保存
 */
const savePageConfig = async () => {
  const payload = getPageConfigPayload()
  if (!payload) {
    return false
  }

  await pageApi.updatePageConfig(payload)
  ElMessage({
    message: '保存成功',
    type: 'success',
  })
  return true
}

const onSave = async () => {
  await savePageConfig()
}

const onUndo = () => {
  applyHistoryAction('undo')
}

const onRedo = () => {
  applyHistoryAction('redo')
}

// 重命名对话框
const renameDialogVisible = ref(false)
const renameInput = ref('')
const onTitleClick = () => {
  renameInput.value = pageStageEntity.value?.name || ''
  renameDialogVisible.value = true
}
const onRenameConfirm = () => {
  const name = renameInput.value.trim()
  if (!name) {
    ElMessage.warning('名称不能为空')
    return
  }
  const code = route.params.pageCode as string
  pageApi.updateName(code, name).then(() => {
    if (pageStageEntity.value) {
      pageStageEntity.value.name = name
    }
    ElMessage.success('修改成功')
    renameDialogVisible.value = false
  })
}

const saveBeforeLeaveDialogVisible = ref(false)

const navigateToPageIndex = () => {
  router.push('/dataRoom/page/index')
}

const onBackByLogo = () => {
  saveBeforeLeaveDialogVisible.value = true
}

const onSaveBeforeLeaveAction = async (action: SaveBeforeLeaveAction) => {
  if (action === 'cancel') {
    return
  }

  try {
    await handleSaveBeforeLeaveAction(action, {
      save: async () => {
        const saved = await savePageConfig()
        if (!saved) {
          throw new Error('page config is not ready')
        }
      },
      navigate: navigateToPageIndex,
    })
  } catch {
    saveBeforeLeaveDialogVisible.value = true
  }
}

const computedMainStyle = computed(() => {
  if (leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: '240px auto 330px',
    }
  } else if (!leftToolPanelShow.value && !rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'auto',
    }
  } else if (!leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'auto 330px',
    }
  } else {
    return {
      gridTemplateColumns: '240px auto',
    }
  }
})

const computedCanvasMainContainerStyle = computed(() => {
  const background = pageBasicConfig.value.background
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

/**
 * 监听定时器配置变化
 */
watch(
  () => pageBasicConfig.value.timers,
  (newTimers) => {
    if (!timerManager) {
      return
    }
    if (!newTimers) {
      // 如果定时器配置被清空，停止所有定时器
      timerManager.clearAllTimers()
      return
    }
    // 重新加载所有定时器
    timerManager.reloadAllTimers()
  },
  { deep: true },
)

onMounted(() => {
  window.addEventListener('keydown', onHistoryKeyDown)
  // 获取路由中code 参数
  const code: string = route.params.pageCode as string
  // 根据编码获取页面详情
  pageApi.getPageConfig(code, 'design').then((res) => {
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    rebuildChartLayoutBaselines()
    pageBasicConfig.value = res.pageConfig?.basicConfig || {}
    if (!pageBasicConfig.value.timers) {
      pageBasicConfig.value.timers = []
    }
    globalVariable.value = res.pageConfig?.globalVariableList || []
    // 页面加载完成后，初始化并启动所有启用的定时器
    nextTick(() => {
      timerManager.reloadAllTimers()
    })
  })
})

/**
 * 组件卸载时清理所有定时器
 */
onUnmounted(() => {
  window.removeEventListener('keydown', onHistoryKeyDown)
  if (timerManager) {
    timerManager.clearAllTimers()
  }
})
</script>

<template>
  <div class="dr-page-designer">
    <div class="header" ref="titleRef">
      <div class="header-left">
        <img src="@/dataroom-packages/assets/logo-small.png" alt="logo" class="logo" @click="onBackByLogo" />
        <div class="title" @click="onTitleClick">{{ pageStageEntity?.name }}</div>
      </div>
      <div class="header-right">
        <div class="header-action">
          <el-button size="small" :disabled="!editorHistory.canUndo" aria-label="回退" title="回退" @click="onUndo">
            <el-icon><RefreshLeft /></el-icon>
          </el-button>
        </div>
        <div class="header-action">
          <el-button size="small" :disabled="!editorHistory.canRedo" aria-label="重做" title="重做" @click="onRedo">
            <el-icon><RefreshRight /></el-icon>
          </el-button>
        </div>
        <div class="header-action">
          <el-dropdown trigger="click" @command="onInsertCommand">
            <el-button size="small">插入</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="component">组件</el-dropdown-item>
                <el-dropdown-item command="resource">素材</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="header-action">
          <el-button @click="openGlobalVariable" size="small">变量</el-button>
        </div>
        <div class="header-action">
          <el-button @click="openLayerPanel" size="small">图层</el-button>
        </div>
        <div class="header-action">
          <el-button @click="switchPageControlPanel" size="small">设置</el-button>
        </div>
        <div class="header-action">
          <el-button @click="onPreview" size="small">预览</el-button>
        </div>
        <div class="header-action">
          <el-button @click="onSave" size="small" type="primary">保存</el-button>
        </div>
      </div>
    </div>
    <div class="main" :style="computedMainStyle">
      <div class="left-tool-panel" :style="computedLeftToolPanelStyle">
        <div class="panel-header">
          <div class="panel-header-inner">
            <span class="title">图层</span>
            <el-icon class="close" @click="switchLeftToolPanel(false)">
              <Close />
            </el-icon>
          </div>
        </div>
        <div class="panel-body">
          <el-scrollbar>
            <ComponentLayer />
          </el-scrollbar>
        </div>
      </div>
      <div class="canvas">
        <div class="canvas-main" id="canvas-main" :style="computedCanvasMainContainerStyle" @click="onCanvasClick">
          <el-scrollbar>
            <GridLayout v-model:layout="chartList" :col-num="48" :row-height="16" :is-draggable="true" :is-resizable="true" :vertical-compact="true" :use-css-transforms="true">
              <GridItem
                v-for="item in chartList"
                :key="item.id"
                :static="false"
                :x="item.x"
                :y="item.y"
                :w="item.w"
                :h="item.h"
                :i="item.id"
                @resized="onResized"
                @moved="onMoved"
                @click="onChartClick(item)"
                @contextmenu="(e: MouseEvent) => onRightClick(e, item)"
              >
                <div class="chart-wrapper" :key="item.id" :id="item.id" :data-dr-id="item.id" :style="computedChartStyle(item)">
                  <component :is="getComponent(item.type)" :chart="item"></component>
                </div>
              </GridItem>
            </GridLayout>
          </el-scrollbar>
        </div>
      </div>
      <div class="right-panel" :style="computedRightControlPanelStyle">
        <el-scrollbar class="right-panel-scrollbar" height="100%">
          <div class="right-panel-scroll-content">
            <ControlPanel v-if="rightControlPanelSetting" :basicConfig="pageBasicConfig"></ControlPanel>
            <ControlPanelWrapper v-else :chart="activeChart!" :global-variable-list="globalVariable">
              <component :is="getPanelComponent(activeChart?.type)" :chart="activeChart"></component>
            </ControlPanelWrapper>
          </div>
        </el-scrollbar>
      </div>
      <el-icon class="right-panel-tool-anchor" @click="switchRightControlPanel(!rightControlPanelShow)" :style="computedToolAnchorStyle">
        <ArrowRight v-if="rightControlPanelShow" />
        <ArrowLeft v-else />
      </el-icon>
    </div>
  </div>
  <ComponentLib v-if="componentLibVisible" @close="componentLibVisible = false"></ComponentLib>
  <ResourceLib v-if="resourceLibVisible" ref="resourceLibRef"></ResourceLib>
  <GlobalVariableComponent v-if="globalVariableVisible" ref="globalVariableRef" :globalVariable="globalVariable"></GlobalVariableComponent>
  <ContextMenu
    v-if="contextMenuVisible"
    ref="contextMenuRef"
    :style="computedContextMenuStyle"
    :chart="activeChart"
    @switch-right-control-panel="switchRightControlPanel"
    @delete-chart="onChartDeleteClick"
  ></ContextMenu>
  <el-dialog v-model="renameDialogVisible" title="修改页面名称" width="400px" :close-on-click-modal="false">
    <el-input v-model="renameInput" placeholder="请输入页面名称" maxlength="50" @keyup.enter="onRenameConfirm"></el-input>
    <template #footer>
      <el-button @click="renameDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onRenameConfirm">确定</el-button>
    </template>
  </el-dialog>
  <SaveBeforeLeaveDialog v-model="saveBeforeLeaveDialogVisible" @action="onSaveBeforeLeaveAction" />
</template>

<style scoped lang="scss">
@use './assets/index.scss';

:deep(.vue-grid-item.vue-grid-placeholder) {
  background: var(--el-color-primary-light-9);
  opacity: 0.15;
  border-radius: 6px;
}

:deep(.vue-grid-item.vue-grid-item.resizing),
:deep(.vue-grid-item.vue-grid-item.vue-draggable-dragging) {
  outline: 1px solid var(--el-color-primary);
  outline-offset: 0;
  z-index: 10;
}

:deep(.vue-grid-item:hover:not(.resizing):not(.vue-draggable-dragging)) {
  outline: 1px dashed var(--el-border-color);
  outline-offset: 0;
}

:deep(.vue-grid-item > .vue-resizable-handle) {
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border: none;
  border-radius: 0;
}

.dr-page-designer {
  display: grid;
  grid-template-rows: 48px 1fr;
  height: 100vh;
  overflow: hidden;
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
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    & .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-right: 8px;

      & .header-action {
        display: inline-flex;
        align-items: center;
      }
    }
  }

  & .main {
    background-color: var(--el-bg-color-page);
    display: grid;
    min-height: 0;
    grid-template-columns: 240px auto 330px;

    & .left-tool-panel {
      background-color: var(--el-bg-color);
      display: grid;
      grid-template-rows: 40px auto;
      height: calc(100vh - 48px);
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
          transition: color 0.2s;

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
        height: calc(100vh - 48px);
        overflow: hidden;

        & .chart-wrapper {
          background-color: var(--el-fill-color-blank);
          height: 100%;
          width: 100%;
          border-radius: 4px;
        }
      }
    }

    & .right-panel {
      box-sizing: border-box;
      min-width: 0;
      overflow: hidden;
      background-color: var(--el-bg-color);
      box-shadow: inset 1px 0 0 0 var(--el-border-color-light);
      height: calc(100vh - 48px);

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
    right: 329px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 50px;
    background-color: var(--el-bg-color);
    color: var(--el-text-color-secondary);
    border-radius: 4px 0 0 4px;
    border: 1px solid var(--el-border-color-light);
    transition: all 0.2s;

    &:hover {
      cursor: pointer;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }
}
</style>
