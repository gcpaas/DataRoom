<!-- 图层 -->
<script setup lang="ts">
import { computed, type ComputedRef, inject, ref, watch } from 'vue'
import type { FilterNodeMethodFunction, TreeInstance, TreeNodeData, TreeOptionProps } from 'element-plus'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { CanvasInst } from '@/dataroom-packages/PageDesigner/type/CanvasInst.ts'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const layerTreeProps: TreeOptionProps = {
  label: 'title',
  children: 'children',
}
const chartList: ComputedRef<Array<ChartConfig<unknown>>> = computed(() => {
  return canvasInst.chartList.value
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
  return String(data.title || '').includes(String(value))
}

watch(layerName, (val) => {
  layerTreeRef.value!.filter(val)
})

const onLayerClick = (data: TreeNodeData) => {
  const chart = data as ChartConfig<unknown>
  console.log('点击图层', chart.id)
  canvasInst.activeChartById(chart.id)
}

const moveLayer = (chart: ChartConfig<unknown>, direction: 'top' | 'up' | 'down' | 'bottom', event: MouseEvent) => {
  event.stopPropagation()
  const moved = canvasInst.moveChartLayer(chart.id, direction)
  if (moved) {
    canvasInst.activeChartById(chart.id)
  }
}
</script>

<template>
  <div class="component-layer-wrapper">
    <el-input v-model="layerName" size="small" placeholder="请输入组件标题" />
    <el-tree
      class="dr-layer-tree"
      ref="layerTreeRef"
      :data="chartList"
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
        <div class="layer-node">
          <span class="layer-node__title">{{ data.title }}</span>
          <div class="layer-node__actions">
            <el-button size="small" text @click="(event: MouseEvent) => moveLayer(data, 'top', event)">顶</el-button>
            <el-button size="small" text @click="(event: MouseEvent) => moveLayer(data, 'up', event)">上</el-button>
            <el-button size="small" text @click="(event: MouseEvent) => moveLayer(data, 'down', event)">下</el-button>
            <el-button size="small" text @click="(event: MouseEvent) => moveLayer(data, 'bottom', event)">底</el-button>
          </div>
        </div>
      </template>
    </el-tree>
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

.layer-node__title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.layer-node__actions {
  display: flex;
  flex-shrink: 0;
  gap: 2px;
}
</style>
