<script setup lang="ts">
import { getComponent, getComponentInstance, getPanelComponent } from '@/dataRoom/components/AutoInstall.ts'
import { computed, type ComputedRef, type CSSProperties, defineAsyncComponent, nextTick, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from 'vue'
import Moveable, { type OnDrag, type OnDragEnd, type OnDragStart, type OnEvent, type OnResize, type OnResizeEnd, type OnRotate, type OnRotateEnd } from 'vue3-moveable'
import { VueSelecto } from 'vue3-selecto'
import { applyChartTransformState, getChartByElement, getChartById, getResourceUrl } from '@/dataRoom/utils/index.ts'
import VanillaSelecto from 'selecto'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Minus, Plus, ScaleToOriginal } from '@element-plus/icons-vue'
import { pageApi } from '@/dataRoom/page/api.ts'
import type { PageStageEntity } from '@/dataRoom/page/type/PageStageEntity.ts'
import { useCanvasInst } from '@/dataRoom/hooks/use-canvas-inst'
import type { GlobalVariable } from '@/dataRoom/designer/types/GlobalVariable.ts'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { VisualScreenPageBasicConfig } from '@/dataRoom/page-designer/type/VisualScreenPageBasicConfig.ts'
import type { ChartLayerMoveDirection } from '@/dataRoom/designer/types/CanvasInst.ts'
import {
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
} from '@/dataRoom/designer/utils/editor-history.ts'
import RulerOverlay from './RulerOverlay.vue'
import {
  createDesignerViewport,
  fitDesignerViewportToVisibleArea,
  getDesignerViewportCenterPoint,
  getDesignerZoomByStep,
  getDesignerZoomControlRightOffset,
  getDesignerZoomFromWheel,
  getDesignerZoomPercent,
  getDesignerZoomScale,
  isDesignerZoomWheelEvent,
  normalizeDesignerZoomPreference,
  panDesignerViewport,
  panDesignerViewportByPointerDelta,
  type DesignerViewportPoint,
  type DesignerZoomPreferenceMode,
  updateDesignerViewportSize,
  zoomDesignerViewportAroundPoint,
  ZOOM_DEFAULT_PERCENT,
  ZOOM_FIT_PADDING_PX,
  ZOOM_MAX_PERCENT,
  ZOOM_MIN_PERCENT,
  ZOOM_STEP_PERCENT,
} from './viewport'
import { getVisualScreenMoveableGuidelines, normalizeVisualScreenRulerConfig, RULER_SIZE_PX, type VisualScreenRulerConfig } from './ruler'
import { handleSaveBeforeLeaveAction, type SaveBeforeLeaveAction } from '@/dataRoom/designer/utils/save-before-leave'
import {
  createDesignerHistoryAutoBackupController,
  createDesignerHistoryHash,
  hasUnsavedChanges,
} from '@/dataRoom/designer/utils/designer-history-backup.ts'
import { filterVisibleCharts } from '@/dataRoom/designer/utils/chart-visibility.ts'
import { PAGE_HISTORY_REMARKS } from '@/dataRoom/designer/utils/page-history-remark.ts'
import {
  applySavedDesignerHistoryState,
  createAliveGuard,
  createCoalescedLatestAsyncTask,
  createLatestDesignerHashSync,
  createPageHistoryBackupPayload,
  savePageWithHistoryBackup,
} from '@/dataRoom/designer/utils/designer-history-save.ts'
import {
  captureAndUpdatePageThumbnail,
  getPageThumbnailFailureMessage,
  type PageThumbnailSaveFailure,
} from '@/dataRoom/designer/utils/page-thumbnail-save.ts'
import { createVisualScreenPageConfigPayload } from './visual-screen-designer-history.ts'

const router = useRouter()
const route = useRoute()
const canvasContainer = ref<HTMLElement | null>(null)
const canvasCaptureTargetRef = ref<HTMLElement | null>(null)
const moveableRef = ref<{ updateRect: () => void } | null>(null)
const canvasViewportRef = ref<HTMLElement | null>(null)
const activeChart = ref<ChartConfig<unknown>>()
const chartList = ref<ChartConfig<unknown>[]>([])
const pageStageEntity = ref<PageStageEntity>()
const globalVariable = ref<GlobalVariable[]>([] as GlobalVariable[])
const defaultBasicConfig: VisualScreenPageBasicConfig = {
  background: { fill: 'color', color: '#0d1e42', url: '', opacity: 100, repeat: 'no-repeat' },
  size: { width: 1920, height: 1080, zoom: 'contain' },
  zoom: { mode: 'best', value: ZOOM_DEFAULT_PERCENT, visiable: true },
  ruler: normalizeVisualScreenRulerConfig(undefined, 1920, 1080),
  timers: [],
}
const basicConfig = ref<VisualScreenPageBasicConfig>({ ...defaultBasicConfig })
const canvasWidth = computed(() => basicConfig.value.size?.width || defaultBasicConfig.size.width)
const canvasHeight = computed(() => basicConfig.value.size?.height || defaultBasicConfig.size.height)
const designerViewport = ref(
  createDesignerViewport({
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value,
    viewportWidth: 0,
    viewportHeight: 0,
    scale: getDesignerZoomScale(ZOOM_DEFAULT_PERCENT),
  }),
)
const designerZoomScale = computed(() => designerViewport.value.scale)
const designerZoomPercent = computed(() => getDesignerZoomPercent(designerViewport.value.scale))
const spacePressed = ref(false)
const isCanvasPanning = ref(false)
const canvasPanPointerId = ref<number | null>(null)
const lastCanvasPanPoint = ref<DesignerViewportPoint | null>(null)
const rulerPointerPosition = ref<DesignerViewportPoint | null>(null)
const isRulerInteracting = ref(false)
const isCanvasPanModeActive = computed(() => spacePressed.value || isCanvasPanning.value)
const isCanvasInteractionBlocked = computed(() => isCanvasPanModeActive.value || isRulerInteracting.value)
// 记录右侧控制面板是否为页面配置
const rightControlPanelSetting = ref(true)
const editorHistory = reactive(
  new EditorHistoryManager({
    source: 'visual-screen-designer',
    getChartList: () => chartList.value,
  }),
)
const gestureStartLayoutState = new Map<string, ReturnType<typeof captureChartLayoutState>>()
const visualScreenRuler = computed(() => normalizeVisualScreenRulerConfig(basicConfig.value.ruler, canvasWidth.value, canvasHeight.value))
const moveableGuidelines = computed(() => getVisualScreenMoveableGuidelines(visualScreenRuler.value, canvasWidth.value, canvasHeight.value))
const moveableVerticalGuidelines = computed(() => moveableGuidelines.value.verticalGuidelines)
const moveableHorizontalGuidelines = computed(() => moveableGuidelines.value.horizontalGuidelines)
const designerFitInsets = computed(() => {
  const rulerInset = visualScreenRuler.value.visible ? RULER_SIZE_PX : 0
  return {
    top: ZOOM_FIT_PADDING_PX + rulerInset,
    right: ZOOM_FIT_PADDING_PX,
    bottom: ZOOM_FIT_PADDING_PX,
    left: ZOOM_FIT_PADDING_PX + rulerInset,
  }
})
const rulerVisible = computed({
  get: () => visualScreenRuler.value.visible,
  set: (visible: boolean) => {
    updateVisualScreenRulerConfig({
      ...visualScreenRuler.value,
      visible,
    })
  },
})
const designerZoomVisible = computed({
  get: () => normalizeDesignerZoomPreference(basicConfig.value.zoom).visiable,
  set: (visiable: boolean) => {
    basicConfig.value.zoom = normalizeDesignerZoomPreference({
      ...basicConfig.value.zoom,
      visiable,
    })
  },
})
/**
 * 被框选中的组件、可以进行拖拽、旋转、缩放
 */
const moveableTargets: ComputedRef<(HTMLElement | null)[]> = computed(() => {
  if (!activeChart.value) {
    return []
  }
  const dom = document.getElementById(activeChart.value.id)
  return dom ? [dom] : []
})
const visibleChartList = computed(() => filterVisibleCharts(chartList.value))

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

const commitChartAdd = (chart: ChartConfig<unknown>, label: string = '新增组件') => {
  const reference = findChartReference(chart.id, chartList.value)
  if (!reference) {
    return
  }

  editorHistory.record(createAddChartHistoryEntry(label, 'visual-screen-designer', reference.chart, reference.parent, reference.index))
}

const deleteChartWithHistory = (chartId: string, label: string = '删除组件') => {
  const removed = removeChartWithLocation(chartId, chartList.value)
  if (!removed) {
    return false
  }

  editorHistory.record(createRemoveChartHistoryEntry(label, 'visual-screen-designer', removed.parent, removed.index, removed.chart))
  syncActiveChartReference()
  return true
}

const setChartHidden = (chartId: string, hidden: boolean) => {
  const reference = findChartReference(chartId, chartList.value)
  if (!reference || reference.chart.hide === hidden) {
    return false
  }

  reference.chart.hide = hidden
  syncActiveChartReference()
  updateMoveableRect()
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

  editorHistory.record(createReorderChartHistoryEntry(label, 'visual-screen-designer', reference.parent, chartId, reference.index, targetIndex))
  syncActiveChartReference()
  return true
}

const applyHistoryAction = (action: 'undo' | 'redo') => {
  const changed = action === 'undo' ? editorHistory.undo() : editorHistory.redo()
  if (!changed) {
    return false
  }

  contextMenuVisible.value = false
  syncActiveChartReference()
  updateMoveableRect()
  return true
}

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
  rightControlPanelShow.value = true
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
  commitChartAdd,
  undo: () => applyHistoryAction('undo'),
  redo: () => applyHistoryAction('redo'),
  canUndo: () => editorHistory.canUndo,
  canRedo: () => editorHistory.canRedo,
  moveChartLayer,
  deleteChart: deleteChartWithHistory,
  setChartHidden,
})
provide(DrConst.CANVAS_INST, canvasInst)

const ComponentLib = defineAsyncComponent(() => import('@/dataRoom/designer/components/ComponentLib.vue'))
const ComponentLayer = defineAsyncComponent(() => import('@/dataRoom/designer/components/ComponentLayer.vue'))
const GlobalVariable = defineAsyncComponent(() => import('@/dataRoom/designer/components/GlobalVariable.vue'))
const ResourceLib = defineAsyncComponent(() => import('@/dataRoom/designer/components/ResourceLib.vue'))
const ControlPanelWrapper = defineAsyncComponent(() => import('@/dataRoom/designer/components/ControlPanel.vue'))
const VisualScreenControlPanel = defineAsyncComponent(() => import('./ControlPanel.vue'))
const ContextMenu = defineAsyncComponent(() => import('@/dataRoom/page-designer/ContextMenu.vue'))
const SaveBeforeLeaveDialog = defineAsyncComponent(() => import('@/dataRoom/designer/components/SaveBeforeLeaveDialog.vue'))
const PageHistoryDialog = defineAsyncComponent(() => import('@/dataRoom/designer/components/PageHistoryDialog.vue'))

const lastSavedHash = ref<string>()
const lastAutoBackupHash = ref<string>()
const currentPageConfigHash = ref<string>()
const historyDialogVisible = ref(false)

const visualScreenDesignerAliveGuard = createAliveGuard()
const currentPageConfigHashSync = createLatestDesignerHashSync((hash) => {
  currentPageConfigHash.value = hash
})

const leftToolPanelShow = ref(false)
const rightControlPanelShow = ref(true)

// 弹框显示状态（组件、素材、变量）
const componentLibVisible = ref(false)
const resourceLibDialogVisible = ref(false)
const globalVariableDialogVisible = ref(false)

// 核心：使用计算属性生成main区域的样式对象
const mainStyle = computed(() => {
  if (leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: '240px auto 300px',
    }
  } else if (!leftToolPanelShow.value && !rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'auto',
    }
  } else if (!leftToolPanelShow.value && rightControlPanelShow.value) {
    return {
      gridTemplateColumns: 'auto 300px',
    }
  } else {
    return {
      gridTemplateColumns: '240px auto',
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

const togglePageControlPanel = () => {
  if (rightControlPanelShow.value && rightControlPanelSetting.value) {
    switchRightControlPanel(false)
    return
  }

  rightControlPanelSetting.value = true
  switchRightControlPanel(true)
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

/**
 * 页面预览
 */
const onPreview = () => {
  const payload = getPageConfigPayload()
  if (!payload) {
    return
  }
  pageApi
    .updatePageConfig4Preview(payload)
    .then(() => {
      const routeData = router.resolve({
        path: `/dataRoom/visualScreenPreview/preview/${pageStageEntity.value!.pageCode}`,
      })
      window.open(routeData.href, '_blank')
    })
}

const getPageConfigPayload = (showLoadError: boolean = true) => {
  const payload = createVisualScreenPageConfigPayload({
    pageStageEntity: pageStageEntity.value,
    chartList: chartList.value,
    basicConfig: basicConfig.value,
    globalVariableList: globalVariable.value,
  })

  if (!payload && showLoadError) {
    ElMessage({
      message: '页面信息未加载',
      type: 'error',
    })
  }

  return payload
}

const computePageConfigHash = async (payload: PageStageEntity | null = getPageConfigPayload(false)) => {
  if (!payload) {
    return null
  }
  return createDesignerHistoryHash(payload.pageConfig)
}

const syncCurrentPageConfigHash = async (payload: PageStageEntity | null = getPageConfigPayload(false)) => {
  return currentPageConfigHashSync.sync(async () => computePageConfigHash(payload))
}

const currentPageConfigHashSyncTask = createCoalescedLatestAsyncTask(
  async () => {
    await syncCurrentPageConfigHash()
  },
  {
    onError: (error) => {
      console.error(error)
    },
  },
)

const historyAutoBackupController = createDesignerHistoryAutoBackupController({
  getCurrentHash: async () => computePageConfigHash(),
  getLastAutoBackupHash: () => lastAutoBackupHash.value,
  setLastAutoBackupHash: (hash: string) => {
    lastAutoBackupHash.value = hash
  },
  backup: async () => {
    const payload = getPageConfigPayload(false)
    if (!payload) {
      throw new Error('page config is not ready')
    }
    await pageApi.historyBackup(createPageHistoryBackupPayload(payload, PAGE_HISTORY_REMARKS.autoBackup))
  },
  onError: (error) => {
    console.error(error)
  },
})

const hasPageConfigUnsavedChanges = computed(() => {
  return hasUnsavedChanges(currentPageConfigHash.value, lastSavedHash.value)
})

/**
 * 保存页面配置
 */
const savePageConfig = async (options: { updateThumbnail?: boolean } = {}) => {
  const payload = getPageConfigPayload()
  if (!payload) {
    return false
  }

  let thumbnailFailure: PageThumbnailSaveFailure | undefined
  if (options.updateThumbnail) {
    try {
      const thumbnailResult = await captureAndUpdatePageThumbnail({
        pageCode: payload.pageCode,
        target: canvasCaptureTargetRef.value,
      })
      if (!thumbnailResult.ok) {
        thumbnailFailure = thumbnailResult
        console.error(thumbnailResult.error)
      }
    } catch (error) {
      thumbnailFailure = { ok: false, stage: 'capture', error }
      console.error(error)
    }
  }

  const savedHash = await savePageWithHistoryBackup({
    payload,
    updatePageConfig: pageApi.updatePageConfig,
    historyBackup: pageApi.historyBackup,
  })

  if (savedHash.status === 'design_save_failed') {
    return savedHash
  }

  applySavedDesignerHistoryState({
    savedHash: savedHash.hash,
    historyBackupSucceeded: savedHash.status === 'saved_with_history',
    setLastSavedHash: (hash) => {
      lastSavedHash.value = hash
    },
    setLastAutoBackupHash: (hash) => {
      lastAutoBackupHash.value = hash
    },
    invalidateCurrentHash: currentPageConfigHashSync.invalidate,
    triggerCurrentHashSync: currentPageConfigHashSyncTask.trigger,
  })

  if (savedHash.status === 'saved_without_history') {
    console.error(savedHash.historyBackupError)
    ElMessage({
      message: '保存成功，但历史备份失败，请稍后重试',
      type: 'warning',
    })
    return savedHash
  }

  ElMessage({
    message: thumbnailFailure ? getPageThumbnailFailureMessage(thumbnailFailure) : '保存成功',
    type: thumbnailFailure ? 'warning' : 'success',
  })
  return savedHash
}

const onSave = async () => {
  await savePageConfig({ updateThumbnail: true })
}

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
  resourceLibDialogVisible.value = false
  nextTick(() => {
    resourceLibDialogVisible.value = true
  })
}

/**
 * 打开全局变量弹框
 */
const openGlobalVariable = () => {
  globalVariableDialogVisible.value = false
  nextTick(() => {
    globalVariableDialogVisible.value = true
  })
}

/**
 * 打开左侧图层面板
 */
const openLayerPanel = () => {
  switchLeftToolPanel(!leftToolPanelShow.value)
}

const rememberGestureStartLayout = (chartId: string) => {
  if (gestureStartLayoutState.has(chartId)) {
    return
  }
  const reference = findChartReference(chartId, chartList.value)
  if (!reference) {
    return
  }
  gestureStartLayoutState.set(chartId, captureChartLayoutState(reference.chart))
}

const finalizeGestureHistory = (chartId: string, label: string) => {
  const before = gestureStartLayoutState.get(chartId)
  gestureStartLayoutState.delete(chartId)
  if (!before) {
    return
  }

  const reference = findChartReference(chartId, chartList.value)
  if (!reference) {
    return
  }

  editorHistory.record(createChartLayoutHistoryEntry(label, 'visual-screen-designer', chartId, before, captureChartLayoutState(reference.chart)))
}

/**
 * 拖拽组件开始
 * @param e
 */
const onDragStart = (e: OnDragStart) => {
  const chart = getChartByElement(e.target, chartList.value)
  rememberGestureStartLayout(chart.id)
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
  const chart = getChartByElement(e.target, chartList.value)
  finalizeGestureHistory(chart.id, '移动组件')
}

const updateTransform = (e: OnEvent, transform: string, width?: number, height?: number) => {
  const chart: ChartConfig<unknown> = getChartByElement(e.target, chartList.value)
  applyChartTransformState(chart, {
    transform,
    width,
    height,
  })
}
/**
 * 缩放组件中
 * @param e
 */
const onResize = (e: OnResize) => {
  const chart = getChartByElement(e.target, chartList.value)
  rememberGestureStartLayout(chart.id)
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
  const chart = getChartByElement(e.target, chartList.value)
  finalizeGestureHistory(chart.id, '调整组件大小')
}
/**
 * 旋转组件中
 * @param e
 */
const onRotate = (e: OnRotate) => {
  const chart = getChartByElement(e.target, chartList.value)
  rememberGestureStartLayout(chart.id)
  e.target.style.transform = e.transform
  updateTransform(e, e.transform)
}

/**
 * 旋转组件结束
 * @param e
 */
const onRotateEnd = (e: OnRotateEnd) => {
  const transform = e.lastEvent?.transform || e.target.style.transform
  updateTransform(e, transform)
  const chart = getChartByElement(e.target, chartList.value)
  finalizeGestureHistory(chart.id, '旋转组件')
}
/**
 * 框选开始
 * @param e
 */
const onSelectDragStart = (e: import('selecto').OnDragStart<VanillaSelecto>) => {
  console.log('onSelectorDragStart ', e)
  if (isCanvasInteractionBlocked.value) {
    e.stop()
    return
  }
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
    activeChartById(active.id)
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

let canvasResizeObserver: ResizeObserver | undefined

const updateMoveableRect = () => {
  nextTick(() => {
    moveableRef.value?.updateRect()
  })
}

const setDesignerZoomPreferenceMode = (mode: DesignerZoomPreferenceMode) => {
  basicConfig.value.zoom = normalizeDesignerZoomPreference({
    ...basicConfig.value.zoom,
    value: designerZoomPercent.value,
    mode,
  })
}

const getDesignerViewportWithCurrentSize = () => {
  const rect = canvasViewportRef.value?.getBoundingClientRect()
  return updateDesignerViewportSize(designerViewport.value, {
    canvasWidth: canvasWidth.value,
    canvasHeight: canvasHeight.value,
    viewportWidth: rect?.width || designerViewport.value.viewportWidth,
    viewportHeight: rect?.height || designerViewport.value.viewportHeight,
  })
}

const syncDesignerViewportSize = () => {
  const nextViewport = getDesignerViewportWithCurrentSize()
  if (basicConfig.value.zoom?.mode === 'best') {
    designerViewport.value = fitDesignerViewportToVisibleArea(nextViewport, designerFitInsets.value)
    setDesignerZoomPreferenceMode('best')
  } else {
    designerViewport.value = nextViewport
  }
  updateMoveableRect()
}

const setDesignerZoomPercent = (value: number, persistPreference: boolean = true) => {
  const nextScale = getDesignerZoomScale(value)
  designerViewport.value = zoomDesignerViewportAroundPoint(designerViewport.value, nextScale, getDesignerViewportCenterPoint(designerViewport.value))
  if (persistPreference) {
    setDesignerZoomPreferenceMode('fixed')
  }
  updateMoveableRect()
}

const decreaseDesignerZoom = () => {
  setDesignerZoomPercent(getDesignerZoomByStep(designerZoomPercent.value, 'out'))
}

const increaseDesignerZoom = () => {
  setDesignerZoomPercent(getDesignerZoomByStep(designerZoomPercent.value, 'in'))
}

const fitDesignerZoomToViewport = (persistPreference: boolean | Event = true) => {
  const shouldPersistPreference = persistPreference !== false
  designerViewport.value = fitDesignerViewportToVisibleArea(getDesignerViewportWithCurrentSize(), designerFitInsets.value)
  if (shouldPersistPreference) {
    setDesignerZoomPreferenceMode('best')
  }
  updateMoveableRect()
}

const applySavedDesignerZoomPreference = () => {
  const preference = normalizeDesignerZoomPreference(basicConfig.value.zoom)
  basicConfig.value.zoom = preference
  if (preference.mode === 'best') {
    fitDesignerZoomToViewport()
    return
  }
  designerViewport.value = getDesignerViewportWithCurrentSize()
  setDesignerZoomPercent(preference.value, false)
  setDesignerZoomPreferenceMode('fixed')
}

const isCanvasPanKeyIgnoredTarget = (target: EventTarget | null) => {
  if (!(target instanceof Element)) {
    return false
  }
  return Boolean(
    target.closest(
      'input, textarea, select, button, [contenteditable="true"], [contenteditable=""], [contenteditable="plaintext-only"], .el-input, .el-textarea, .el-select, .canvas-zoom-control',
    ),
  )
}

const clearCanvasPanning = (releasePointer: boolean = true) => {
  const pointerId = canvasPanPointerId.value
  const viewport = canvasViewportRef.value
  if (releasePointer && pointerId !== null && viewport?.hasPointerCapture(pointerId)) {
    viewport.releasePointerCapture(pointerId)
  }
  isCanvasPanning.value = false
  canvasPanPointerId.value = null
  lastCanvasPanPoint.value = null
  updateMoveableRect()
}

const resetCanvasPanState = () => {
  spacePressed.value = false
  clearCanvasPanning()
}

const updateRulerPointerPosition = (event: PointerEvent) => {
  const rect = canvasViewportRef.value?.getBoundingClientRect()
  if (!rect) {
    rulerPointerPosition.value = null
    return
  }
  rulerPointerPosition.value = {
    viewportX: event.clientX - rect.left,
    viewportY: event.clientY - rect.top,
  }
}

const clearRulerPointerPosition = () => {
  rulerPointerPosition.value = null
}

const updateVisualScreenRulerConfig = (ruler: VisualScreenRulerConfig) => {
  basicConfig.value.ruler = normalizeVisualScreenRulerConfig(ruler, canvasWidth.value, canvasHeight.value)
}

const onWindowKeyDown = (event: KeyboardEvent) => {
  const historyAction = getEditorHistoryShortcutAction(event)
  if (historyAction && !isNativeTextEditingTarget(event.target)) {
    const handled = applyHistoryAction(historyAction)
    if (handled) {
      event.preventDefault()
      return
    }
  }

  if (event.code !== 'Space' || isCanvasPanKeyIgnoredTarget(event.target)) {
    return
  }
  event.preventDefault()
  spacePressed.value = true
}

const onCanvasPanKeyUp = (event: KeyboardEvent) => {
  if (event.code !== 'Space') {
    return
  }
  if (spacePressed.value || isCanvasPanning.value) {
    event.preventDefault()
  }
  spacePressed.value = false
  clearCanvasPanning()
}

const onCanvasPanPointerDown = (event: PointerEvent) => {
  if (!spacePressed.value || event.button !== 0) {
    return
  }
  if (event.target instanceof Element && event.target.closest('.canvas-zoom-control, .ruler-overlay')) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  isCanvasPanning.value = true
  canvasPanPointerId.value = event.pointerId
  lastCanvasPanPoint.value = {
    viewportX: event.clientX,
    viewportY: event.clientY,
  }
  if (event.currentTarget instanceof HTMLElement) {
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  updateMoveableRect()
}

const onCanvasPanPointerMove = (event: PointerEvent) => {
  if (!isCanvasPanning.value || canvasPanPointerId.value !== event.pointerId || !lastCanvasPanPoint.value) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  const deltaX = event.clientX - lastCanvasPanPoint.value.viewportX
  const deltaY = event.clientY - lastCanvasPanPoint.value.viewportY
  lastCanvasPanPoint.value = {
    viewportX: event.clientX,
    viewportY: event.clientY,
  }
  designerViewport.value = panDesignerViewportByPointerDelta(designerViewport.value, deltaX, deltaY)
  updateMoveableRect()
}

const onCanvasPointerMove = (event: PointerEvent) => {
  updateRulerPointerPosition(event)
  onCanvasPanPointerMove(event)
}

const onCanvasPanPointerUp = (event: PointerEvent) => {
  if (canvasPanPointerId.value !== event.pointerId) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  clearCanvasPanning()
}

const onCanvasPanPointerCancel = (event: PointerEvent) => {
  if (canvasPanPointerId.value !== event.pointerId) {
    return
  }
  event.preventDefault()
  event.stopPropagation()
  clearCanvasPanning()
}

const onCanvasPanLostPointerCapture = (event: PointerEvent) => {
  if (canvasPanPointerId.value === event.pointerId) {
    clearCanvasPanning(false)
  }
}

const canStartSelectoDrag = () => {
  return !isCanvasInteractionBlocked.value
}

const getCurrentPlatform = () => {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } }
  return nav.userAgentData?.platform || nav.platform || ''
}

const onCanvasWheel = (event: WheelEvent) => {
  if (event.target instanceof Element && event.target.closest('.canvas-zoom-control')) {
    return
  }
  event.preventDefault()
  if (isDesignerZoomWheelEvent(event, getCurrentPlatform())) {
    setDesignerZoomPercent(getDesignerZoomFromWheel(designerZoomPercent.value, event.deltaY))
    return
  }
  designerViewport.value = panDesignerViewport(designerViewport.value, event.deltaX, event.deltaY)
  updateMoveableRect()
}

const computedZoomControlStyle = computed<CSSProperties>(() => {
  return {
    bottom: '16px',
    right: `${getDesignerZoomControlRightOffset(rightControlPanelShow.value)}px`,
  }
})

const computedZoomRangeStyle = computed<CSSProperties>(() => {
  const progress = `${(designerZoomPercent.value / ZOOM_MAX_PERCENT) * 100}%`
  return {
    background: `linear-gradient(to right, var(--el-color-primary) 0%, var(--el-color-primary) ${progress}, var(--el-border-color) ${progress}, var(--el-border-color) 100%)`,
  }
})

const onDesignerZoomRangeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  setDesignerZoomPercent(Number(target.value))
}

/**
 * 画布尺寸和背景动态样式
 */
const computedCanvasContentStyle = computed<CSSProperties>(() => {
  return {
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,
    transform: `translate(${designerViewport.value.panX}px, ${designerViewport.value.panY}px) scale(${designerZoomScale.value})`,
    transformOrigin: 'left top',
  }
})

const computedCanvasCaptureContentStyle = computed<CSSProperties>(() => {
  const styles: CSSProperties = {
    width: `${canvasWidth.value}px`,
    height: `${canvasHeight.value}px`,
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

watch([canvasWidth, canvasHeight], () => {
  basicConfig.value.ruler = normalizeVisualScreenRulerConfig(basicConfig.value.ruler, canvasWidth.value, canvasHeight.value)
  nextTick(syncDesignerViewportSize)
})

watch([leftToolPanelShow, rightControlPanelShow], () => {
  nextTick(syncDesignerViewportSize)
})

watch(
  [chartList, basicConfig, globalVariable],
  () => {
    currentPageConfigHashSyncTask.trigger()
  },
  { deep: true },
)

watch(rulerVisible, () => {
  if (basicConfig.value.zoom?.mode === 'best') {
    nextTick(() => fitDesignerZoomToViewport(false))
  }
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
        const saved = await savePageConfig({ updateThumbnail: true })
        if (!saved || saved.status === 'design_save_failed') {
          throw new Error('page config is not ready')
        }
      },
      navigate: navigateToPageIndex,
    })
  } catch {
    saveBeforeLeaveDialogVisible.value = true
  }
}

const onHistoryRolledBack = () => {
  window.location.reload()
}

onMounted(() => {
  window.addEventListener('keydown', onWindowKeyDown)
  window.addEventListener('keyup', onCanvasPanKeyUp)
  window.addEventListener('blur', resetCanvasPanState)
  const code: string = route.params.pageCode as string
  nextTick(() => {
    syncDesignerViewportSize()
    if (canvasViewportRef.value) {
      canvasResizeObserver = new ResizeObserver(() => {
        syncDesignerViewportSize()
      })
      canvasResizeObserver.observe(canvasViewportRef.value)
    }
  })
  void pageApi.getPageConfig(code, 'design').then(async (res) => {
    if (!visualScreenDesignerAliveGuard.isAlive()) {
      return
    }
    pageStageEntity.value = res
    chartList.value = res.pageConfig?.chartList || []
    globalVariable.value = res.pageConfig?.globalVariableList || []
    if (res.pageConfig?.basicConfig) {
      const loaded = res.pageConfig.basicConfig as Partial<VisualScreenPageBasicConfig>
      basicConfig.value = {
        background: { ...defaultBasicConfig.background, ...loaded.background },
        size: { ...defaultBasicConfig.size, ...loaded.size },
        zoom: normalizeDesignerZoomPreference(loaded.zoom),
        ruler: normalizeVisualScreenRulerConfig(loaded.ruler, loaded.size?.width || defaultBasicConfig.size.width, loaded.size?.height || defaultBasicConfig.size.height),
        timers: loaded.timers || [],
      }
    }
    await nextTick()
    if (!visualScreenDesignerAliveGuard.isAlive()) {
      return
    }
    applySavedDesignerZoomPreference()
    const initialHash = await syncCurrentPageConfigHash()
    if (!visualScreenDesignerAliveGuard.isAlive()) {
      return
    }
    if (initialHash) {
      lastSavedHash.value = initialHash
      lastAutoBackupHash.value = initialHash
    }
    historyAutoBackupController.start()
  })
})

onBeforeUnmount(() => {
  visualScreenDesignerAliveGuard.dispose()
  window.removeEventListener('keydown', onWindowKeyDown)
  window.removeEventListener('keyup', onCanvasPanKeyUp)
  window.removeEventListener('blur', resetCanvasPanState)
  historyAutoBackupController.stop()
  gestureStartLayoutState.clear()
  resetCanvasPanState()
  canvasResizeObserver?.disconnect()
})
</script>

<template>
  <div class="dr-vs-editor">
    <div class="header" ref="titleRef">
      <div class="header-left">
        <img src="@/dataRoom/assets/logo-small.png" alt="logo" class="logo" @click="onBackByLogo" />
        <div class="title" @click="onTitleClick">{{ pageStageEntity?.name }}</div>
      </div>
      <div class="header-actions header-actions--primary">
        <div class="header-action">
          <el-button size="small" type="primary" @click="openComponentLib">组件</el-button>
        </div>
        <div class="header-action">
          <el-button size="small" @click="openResourceLib">素材</el-button>
        </div>
        <div class="header-action">
          <el-button @click="openGlobalVariable" size="small">变量</el-button>
        </div>
        <div class="header-action">
          <el-button @click="openLayerPanel" size="small">图层</el-button>
        </div>
        <div class="header-action">
          <el-dropdown trigger="click" :hide-on-click="false">
            <el-button size="small">工具</el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <div class="tool-menu-row" @click.stop>
                    <span>标尺</span>
                    <el-switch v-model="rulerVisible" size="small" />
                  </div>
                </el-dropdown-item>
                <el-dropdown-item>
                  <div class="tool-menu-row" @click.stop>
                    <span>缩放</span>
                    <el-switch v-model="designerZoomVisible" size="small" />
                  </div>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="header-action">
          <el-button size="small" :disabled="!editorHistory.canUndo" aria-label="回退" title="回退" @click="onUndo">
            撤销
          </el-button>
        </div>
        <div class="header-action">
          <el-button size="small" :disabled="!editorHistory.canRedo" aria-label="重做" title="重做" @click="onRedo">
            恢复
          </el-button>
        </div>
      </div>
      <div class="header-actions header-actions--secondary">
        <div class="header-action">
          <el-button @click="togglePageControlPanel" size="small">设置</el-button>
        </div>
        <div class="header-action">
          <el-button @click="historyDialogVisible = true" size="small">历史</el-button>
        </div>
        <div class="header-action">
          <el-button @click="onPreview" size="small">预览</el-button>
        </div>
        <div class="header-action">
          <el-button @click="onSave" size="small" type="primary">保存</el-button>
        </div>
      </div>
    </div>
    <div class="main" :style="mainStyle">
      <div class="left-tool-panel" :style="leftToolPanelStyle">
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
        <div
          class="canvas-main"
          :class="{ 'canvas-main--pan-ready': spacePressed, 'canvas-main--panning': isCanvasPanning }"
          id="canvas-main"
          ref="canvasViewportRef"
          @wheel="onCanvasWheel"
          @pointerdown.capture="onCanvasPanPointerDown"
          @pointermove="onCanvasPointerMove"
          @pointerup="onCanvasPanPointerUp"
          @pointercancel="onCanvasPanPointerCancel"
          @pointerleave="clearRulerPointerPosition"
          @lostpointercapture="onCanvasPanLostPointerCapture"
        >
          <RulerOverlay
            :ruler="visualScreenRuler"
            :viewport="designerViewport"
            :pointer-position="rulerPointerPosition"
            @update:ruler="updateVisualScreenRulerConfig"
            @interaction-start="isRulerInteracting = true"
            @interaction-end="isRulerInteracting = false"
          />
          <div class="canvas-viewport">
            <div ref="canvasContainer" class="canvas-content" :style="computedCanvasContentStyle">
              <div ref="canvasCaptureTargetRef" class="canvas-capture-content" :style="computedCanvasCaptureContentStyle">
                <div
                  class="chart-wrapper"
                  v-for="item in visibleChartList"
                  :key="item.id"
                  :id="item.id"
                  :data-dr-id="item.id"
                  :style="computedChartStyle(item)"
                  @contextmenu="(e: MouseEvent) => onRightClick(e, item)"
                >
                  <component :is="getComponent(item.type)" :chart="item"></component>
                </div>
              </div>
              <Moveable
                ref="moveableRef"
                :draggable="!isCanvasInteractionBlocked"
                :rotatable="!isCanvasInteractionBlocked"
                :resizable="!isCanvasInteractionBlocked"
                :target="moveableTargets"
                :zoom="designerZoomScale"
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
                :verticalGuidelines="moveableVerticalGuidelines"
                :horizontalGuidelines="moveableHorizontalGuidelines"
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
            </div>
            <VueSelecto
              :container="canvasViewportRef"
              :dragContainer="canvasViewportRef"
              :rootContainer="canvasViewportRef"
              :selectableTargets="['.chart-wrapper']"
              :selectByClick="!isCanvasInteractionBlocked"
              :selectFromInside="false"
              :continueSelect="false"
              :toggleContinueSelect="'shift'"
              :hitRate="100"
              :ratio="0"
              :dragCondition="canStartSelectoDrag"
              @dragStart="onSelectDragStart"
              @selectEnd="onSelectEnd"
            />
          </div>
          <div v-if="designerZoomVisible" class="canvas-zoom-control" :style="computedZoomControlStyle" role="group" aria-label="画布缩放">
            <button
              class="zoom-step-button"
              :class="{ 'zoom-step-button--active': basicConfig.zoom?.mode === 'best' }"
              type="button"
              aria-label="适配画布到可视区域"
              title="适配画布到可视区域"
              @click="fitDesignerZoomToViewport"
            >
              <el-icon><ScaleToOriginal /></el-icon>
            </button>
            <button class="zoom-step-button" type="button" aria-label="缩小画布" title="缩小画布" @click="decreaseDesignerZoom">
              <el-icon><Minus /></el-icon>
            </button>
            <input
              class="zoom-range"
              type="range"
              :value="designerZoomPercent"
              :min="ZOOM_MIN_PERCENT"
              :max="ZOOM_MAX_PERCENT"
              :step="ZOOM_STEP_PERCENT"
              :style="computedZoomRangeStyle"
              aria-label="画布缩放比例"
              @input="onDesignerZoomRangeInput"
            />
            <button class="zoom-step-button" type="button" aria-label="放大画布" title="放大画布" @click="increaseDesignerZoom">
              <el-icon><Plus /></el-icon>
            </button>
            <span class="zoom-value">{{ designerZoomPercent }}%</span>
          </div>
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

  <!-- 组件库 -->
  <ComponentLib v-if="componentLibVisible" @close="componentLibVisible = false" />

  <!-- 素材库（组件自带弹框，用 v-if 控制挂载） -->
  <ResourceLib v-if="resourceLibDialogVisible" @close="resourceLibDialogVisible = false" />

  <!-- 全局变量（组件自带弹框，用 v-if 控制挂载） -->
  <GlobalVariable v-if="globalVariableDialogVisible" :global-variable="globalVariable" @close="globalVariableDialogVisible = false" />
  <el-dialog v-model="renameDialogVisible" title="修改页面名称" width="400px" :close-on-click-modal="false">
    <el-input v-model="renameInput" placeholder="请输入页面名称" maxlength="50" @keyup.enter="onRenameConfirm"></el-input>
    <template #footer>
      <el-button @click="renameDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="onRenameConfirm">确定</el-button>
    </template>
  </el-dialog>
  <PageHistoryDialog
    v-model="historyDialogVisible"
    :page-code="pageStageEntity?.pageCode || ''"
    :has-unsaved-changes="hasPageConfigUnsavedChanges"
    @rolled-back="onHistoryRolledBack"
  />
  <SaveBeforeLeaveDialog v-model="saveBeforeLeaveDialogVisible" @action="onSaveBeforeLeaveAction" />
</template>

<style scoped lang="scss">
.dr-vs-editor {
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
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    border-bottom: 1px solid var(--el-border-color);
    position: relative;
    z-index: 10;
    column-gap: 16px;
    padding: 0 8px;

    & .header-left {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      min-width: 0;

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
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }

    & .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;

      & .header-action {
        display: inline-flex;
        align-items: center;
      }
    }

    & .header-actions--primary {
      justify-self: center;
    }

    & .header-actions--secondary {
      justify-self: end;
    }
  }

  & .main {
    display: grid;
    grid-template-columns: 240px auto 300px;
    min-width: 0;
    min-height: 0;
    overflow: hidden;

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
      background-color: #f5f5f5;
      grid-template-rows: auto;
      min-width: 0;
      min-height: 0;
      overflow: hidden;

      & .canvas-main {
        height: 100%;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
        position: relative;

        &.canvas-main--pan-ready {
          cursor: grab;
        }

        &.canvas-main--panning {
          cursor: grabbing;
          user-select: none;
        }

        &.canvas-main--pan-ready .canvas-content,
        &.canvas-main--panning .canvas-content {
          cursor: inherit;
        }
      }

      & .canvas-viewport {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      & .canvas-content {
        position: absolute;
        top: 0;
        left: 0;
        will-change: transform;
      }

      & .canvas-capture-content {
        position: relative;
        width: 100%;
        height: 100%;
      }

      & .canvas-zoom-control {
        position: fixed;
        z-index: 4;
        display: flex;
        align-items: center;
        gap: 8px;
        box-sizing: border-box;
        width: 280px;
        padding: 8px 12px;
        border: 1px solid var(--el-border-color);
        border-radius: 8px;
        background-color: var(--el-fill-color-blank);
        box-shadow: var(--el-box-shadow-light);

        & .zoom-step-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 24px;
          width: 24px;
          height: 24px;
          padding: 0;
          border: 0;
          border-radius: 4px;
          background-color: var(--el-fill-color-blank);
          color: var(--el-text-color-regular);
          cursor: pointer;

          &:hover,
          &:focus-visible {
            background-color: var(--el-fill-color-lighter);
            color: var(--el-color-primary);
            outline: none;
          }

          &.zoom-step-button--active {
            background-color: var(--el-color-primary-light-9);
            color: var(--el-color-primary);
          }
        }

        & .zoom-range {
          appearance: none;
          flex: 1;
          min-width: 0;
          height: 2px;
          margin: 0;
          border-radius: 9999px;
          cursor: pointer;

          &::-webkit-slider-runnable-track {
            height: 2px;
            border-radius: 9999px;
            background: inherit;
          }

          &::-webkit-slider-thumb {
            appearance: none;
            width: 10px;
            height: 10px;
            margin-top: -4px;
            border: 1px solid var(--el-color-primary);
            border-radius: 9999px;
            background-color: var(--el-fill-color-blank);
          }

          &::-moz-range-track {
            height: 2px;
            border-radius: 9999px;
            background: inherit;
          }

          &::-moz-range-thumb {
            width: 10px;
            height: 10px;
            border: 1px solid var(--el-color-primary);
            border-radius: 9999px;
            background-color: var(--el-fill-color-blank);
          }
        }

        & .zoom-value {
          min-width: 40px;
          color: var(--el-text-color-secondary);
          font-size: 12px;
          font-weight: 500;
          line-height: 1;
          text-align: right;
          letter-spacing: 0;
          font-feature-settings: 'tnum';
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

.tool-menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-width: 120px;
  width: 100%;
  color: var(--el-text-color-primary);
  letter-spacing: 0;
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
  position: relative;
  border: 1px dashed var(--el-color-primary);
  background: none;

  &::before {
    position: absolute;
    inset: 0;
    background-color: var(--el-fill-color-darker);
    content: '';
    opacity: 0.32;
    pointer-events: none;
  }
}

.chart-wrapper:hover:not(.moveable-target) {
  outline: 1px dashed var(--el-border-color);
}
</style>
