<!-- 图层 -->
<script setup lang="ts">
import { computed, type ComputedRef, inject, ref, watch } from 'vue'
import type { FilterNodeMethodFunction } from 'element-plus'
import type { TreeInstance, TreeNodeData, TreeOptionProps } from 'element-plus'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'
import { createLayerNodes, type LayerNode } from '@/dataRoom/designer/components/component-layer.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import DrInputField from './DrInputField.vue'

const props = defineProps<{
  activeChartId?: string
}>()

const emit = defineEmits<{
  contextmenu: [event: MouseEvent, chart: ChartConfig<unknown>]
}>()

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

// 只镜像画布主激活状态；不调用 activeChartById，避免反向激活或破坏多选。
watch(
  [() => props.activeChartId, layerTreeRef, layerList],
  ([activeChartId, tree]) => {
    if (!tree) return
    const nextKey = activeChartId && tree.getNode(activeChartId) ? activeChartId : null
    if (tree.getCurrentKey() !== nextKey) {
      tree.setCurrentKey(nextKey)
    }
  },
  { immediate: true, flush: 'post' },
)

const syncLayerSelection = (layerNode: LayerNode) => {
  layerTreeRef.value?.setCurrentKey(layerNode.id)
  canvasInst.activeChartById(layerNode.chart.id)
}

const onLayerClick = (data: TreeNodeData) => {
  const layerData = data as LayerNode
  syncLayerSelection(layerData)
}

const onLayerContextMenu = (event: MouseEvent, layerNode: LayerNode) => {
  event.preventDefault()
  event.stopPropagation()
  syncLayerSelection(layerNode)
  emit('contextmenu', event, layerNode.chart)
}
</script>

<template>
  <div class="component-layer-wrapper">
    <div class="layer-search">
      <DrInputField v-model="layerName" size="small" placeholder="请输入组件标题" />
    </div>
    <div class="layer-list">
      <el-scrollbar height="100%">
        <el-tree
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
                <span class="layer-node__title" :title="data.title">{{ data.title }}</span>
              </div>
              <span v-if="data.hidden" class="layer-node__status">已隐藏</span>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>

  </div>
</template>

<style scoped lang="scss">
.component-layer-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.layer-search {
  flex: none;
}

.layer-list {
  flex: 1;
  min-width: 0;
  min-height: 0;
}

.layer-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.layer-node--hidden {
  color: var(--el-text-color-secondary);
}

.layer-node__status {
  flex: none;
  font-size: var(--el-font-size-extra-small);
}

.layer-node__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.layer-node__title {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>
