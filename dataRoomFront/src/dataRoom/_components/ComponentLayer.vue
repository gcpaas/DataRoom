<!-- 图层 -->
<script setup lang="ts">
import { computed, type ComputedRef, type CSSProperties, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { ElMessageBox, type FilterNodeMethodFunction } from 'element-plus'
import type { TreeInstance, TreeNodeData, TreeOptionProps } from 'element-plus'
import { DrConst } from '@/dataRoom/constant/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/PageDesigner/type/CanvasInst.ts'
import { createLayerNodes, type LayerNode } from '@/dataRoom/_components/component-layer.ts'

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const layerTreeProps: TreeOptionProps = {
  label: 'title',
  children: 'children',
}

const layerList: ComputedRef<LayerNode[]> = computed(() => {
  return createLayerNodes(canvasInst.chartList)
})

const layerTreeRef = ref<TreeInstance>()
const layerName = ref('')
const layerContextMenuVisible = ref(false)
const layerContextMenuRef = ref<HTMLElement>()
const layerContextMenuEvent = ref<MouseEvent>()
const layerContextMenuNode = ref<LayerNode>()

/**
 * 根据标题过滤图层
 * @param value
 * @param data
 */
const filterLayer: FilterNodeMethodFunction = (value, data) => {
  if (!value) return true
  const layerData = data as LayerNode
  return layerData.title.includes(String(value))
}

watch(layerName, (val) => {
  layerTreeRef.value?.filter(val)
})

const closeLayerContextMenu = () => {
  layerContextMenuVisible.value = false
  layerContextMenuNode.value = undefined
}

const syncLayerSelection = (layerNode: LayerNode) => {
  layerTreeRef.value?.setCurrentKey(layerNode.id)
  canvasInst.activeChartById(layerNode.chart.id)
}

const onLayerClick = (data: TreeNodeData) => {
  const layerData = data as LayerNode
  closeLayerContextMenu()
  syncLayerSelection(layerData)
}

const onLayerContextMenu = (event: MouseEvent, layerNode: LayerNode) => {
  event.preventDefault()
  event.stopPropagation()
  syncLayerSelection(layerNode)
  layerContextMenuEvent.value = event
  layerContextMenuNode.value = layerNode
  layerContextMenuVisible.value = true
}

const deleteLayerChart = async () => {
  const layerNode = layerContextMenuNode.value
  if (!layerNode) {
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除这个组件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    canvasInst.deleteChart(layerNode.chart.id)
    closeLayerContextMenu()
  } catch {
    // 用户取消删除
  }
}

const updateLayerChartHidden = (hidden: boolean) => {
  const layerNode = layerContextMenuNode.value
  if (!layerNode) {
    return
  }
  const updated = canvasInst.setChartHidden(layerNode.chart.id, hidden)
  if (updated) {
    canvasInst.activeChartById(layerNode.chart.id)
  }
  closeLayerContextMenu()
}

const computedLayerContextMenuStyle = computed<CSSProperties>(() => {
  return {
    position: 'fixed',
    left: `${layerContextMenuEvent.value?.clientX || 0}px`,
    top: `${layerContextMenuEvent.value?.clientY || 0}px`,
  }
})

const onDocumentClick = (event: MouseEvent) => {
  if (!layerContextMenuRef.value?.contains(event.target as Node)) {
    closeLayerContextMenu()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div class="component-layer-wrapper">
    <el-input v-model="layerName" size="small" placeholder="请输入组件标题" />
    <el-tree
      class="dr-layer-tree"
      ref="layerTreeRef"
      :data="layerList"
      :props="layerTreeProps"
      empty-text="未找到组件"
      node-key="id"
      :indent="12"
      highlight-current
      default-expand-all
      :expand-on-click-node="true"
      :filter-node-method="filterLayer"
      @node-click="onLayerClick"
    >
      <template #default="{ data }">
        <div class="layer-node" :class="{ 'layer-node--hidden': data.hidden }" @contextmenu="(event: MouseEvent) => onLayerContextMenu(event, data)">
          <div class="layer-node__info">
            <span class="layer-node__title">{{ data.title }}</span>
          </div>
        </div>
      </template>
    </el-tree>
    <div v-if="layerContextMenuVisible" ref="layerContextMenuRef" class="layer-context-menu" :style="computedLayerContextMenuStyle">
      <button class="layer-context-menu__item" type="button" @click="deleteLayerChart">删除</button>
      <button v-if="layerContextMenuNode?.hidden" class="layer-context-menu__item" type="button" @click="updateLayerChartHidden(false)">显示</button>
      <button v-else class="layer-context-menu__item" type="button" @click="updateLayerChartHidden(true)">隐藏</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.component-layer-wrapper {
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.dr-layer-tree {
  margin-top: 8px;
  background: var(--el-fill-color-light);
}

.layer-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

.layer-node--hidden {
  opacity: 0.6;
}

.layer-node__info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.layer-node__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-context-menu {
  min-width: 140px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  box-shadow: var(--el-box-shadow-light);
  padding: 8px 0;
  z-index: 2000;
}

.layer-context-menu__item {
  display: block;
  width: 100%;
  border: 0;
  background: transparent;
  color: var(--el-text-color-regular);
  text-align: left;
  padding: 8px 16px;
  letter-spacing: 0;

  &:hover {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}
</style>
