<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, unref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst, ChartLayerMoveDirection } from '@/dataRoom/designer/types/CanvasInst.ts'
import { findChartReference, getChartListByParent, sortChartsByLayerDesc } from '@/dataRoom/designer/utils/editor-history.ts'

const props = defineProps<{
  chart?: ChartConfig<unknown>
}>()
// 确保拿到的chart非空
const chart = props.chart!

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const emit = defineEmits<{
  switchRightControlPanel: [open: boolean]
  deleteChart: [chartId: string]
}>()

onMounted(() => {
  document.addEventListener('click', onOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onOutsideClick)
})

const contextMenuRef = ref()
const contextMenuVisible = ref(true)
/**
 * 点击其他位置后，隐藏菜单
 * @param e
 */
const onOutsideClick = (e: MouseEvent) => {
  if (contextMenuRef.value) {
    if (!contextMenuRef.value.contains(e.target as Node)) {
      contextMenuVisible.value = false
    }
  }
}

/**
 * 点击配置
 */
const onChartConfigClick = () => {
  emit('switchRightControlPanel', true)
  contextMenuVisible.value = false
}
/**
 * 删除组件
 */
const onChartDeleteClick = () => {
  ElMessageBox.confirm('确定要删除这个组件吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      emit('switchRightControlPanel', false)
      emit('deleteChart', chart.id)
      contextMenuVisible.value = false
    })
    .catch(() => {
      // 用户取消删除
    })
}
/**
 * 复制组件
 */
const onChartCopyClick = () => {
  ElMessage.warning('功能开发中...')
  contextMenuVisible.value = false
}
/**
 * 隐藏组件
 */
const onChartHideClick = () => {
  canvasInst.setChartHidden(chart.id, !chart.hide)
  contextMenuVisible.value = false
}

/**
 * 当前组件在同级中的图层可操作状态（层级按 z 值降序排序判断）
 */
const layerMenuState = computed(() => {
  const charts = unref(canvasInst.chartList)
  const reference = findChartReference(chart.id, charts)
  const siblings = reference ? getChartListByParent(charts, reference.parent) : null
  if (!reference || !siblings || siblings.length <= 1) {
    return { canMoveUp: false, canMoveDown: false }
  }
  const sorted = sortChartsByLayerDesc(siblings)
  const position = sorted.findIndex((item) => item.id === chart.id)
  return {
    canMoveUp: position > 0,
    canMoveDown: position >= 0 && position < sorted.length - 1,
  }
})

const isLayerDirectionDisabled = (direction: ChartLayerMoveDirection) => {
  if (direction === 'top' || direction === 'up') {
    return !layerMenuState.value.canMoveUp
  }
  return !layerMenuState.value.canMoveDown
}

/**
 * 调整图层顺序：置顶/上移一层/下移一层/置底
 */
const onLayerMoveClick = (direction: ChartLayerMoveDirection) => {
  if (isLayerDirectionDisabled(direction)) {
    return
  }
  canvasInst.moveChartLayer(chart.id, direction)
  contextMenuVisible.value = false
}
</script>

<template>
  <div class="dr-context-menu-wrapper" ref="contextMenuRef" v-if="contextMenuVisible">
    <div class="menu" @click="onChartConfigClick">配置</div>
    <div class="menu" :class="{ 'menu--disabled': isLayerDirectionDisabled('top') }" @click="onLayerMoveClick('top')">置顶</div>
    <div class="menu" :class="{ 'menu--disabled': isLayerDirectionDisabled('up') }" @click="onLayerMoveClick('up')">上移一层</div>
    <div class="menu" :class="{ 'menu--disabled': isLayerDirectionDisabled('down') }" @click="onLayerMoveClick('down')">下移一层</div>
    <div class="menu" :class="{ 'menu--disabled': isLayerDirectionDisabled('bottom') }" @click="onLayerMoveClick('bottom')">置底</div>
    <div class="menu" @click="onChartDeleteClick">删除</div>
    <div class="menu" @click="onChartCopyClick">复制并粘贴</div>
    <div class="menu" @click="onChartHideClick">{{ chart.hide ? '设为显示' : '设为隐藏' }}</div>
  </div>
</template>

<style scoped>
.dr-context-menu-wrapper {
  width: 200px;
  background: var(--el-fill-color-blank);
  padding: 8px 0;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  color: var(--el-text-color-regular);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
  font-size: 14px;
  font-weight: 400;
  z-index: 2000;

  & .menu {
    padding: 8px 16px;
    transition: all 0.15s;

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      cursor: pointer;
    }
  }

  & .menu--disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;

    &:hover {
      color: var(--el-text-color-disabled);
      background-color: transparent;
      cursor: not-allowed;
    }
  }
}
</style>
