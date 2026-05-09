<!-- 图层 -->
<script setup lang="ts">
import { computed, type ComputedRef, inject, type Ref, ref, watch } from 'vue'
import type { TreeInstance } from 'element-plus'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const layerTreeProps = {
  label: 'title',
  children: 'children',
}
const chartList: ComputedRef<Ref<Array<ChartConfig<unknown>>>> = computed(() => {
  return canvasInst.chartList
})

const layerTreeRef = ref<TreeInstance>()
const layerName = ref('')

interface Tree {
  title: string
}

/**
 * 根据标题过滤图层
 * @param value
 * @param data
 */
const filterLayer = (value: string, data: Tree) => {
  if (!value) return true
  return data.title.includes(value)
}

watch(layerName, (val) => {
  layerTreeRef.value!.filter(val)
})

const onLayerClick = (data: ChartConfig<unknown>) => {
  console.log('点击图层', data.id)
  canvasInst.activeChartById(data.id)
}
</script>

<template>
  <div>
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
    />
  </div>
</template>

<style scoped lang="scss">
.dr-layer-tree {
  margin-top: var(--space-2);
  background: var(--dr-gray-50);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  :deep(.el-tree-node__content) {
    height: 32px;
    border-radius: var(--radius-sm);
    transition: background-color 0.15s ease;

    &:hover {
      background-color: var(--dr-gray-100);
    }
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content) {
    background-color: var(--dr-blue-soft);
    color: var(--dr-blue);
  }

  :deep(.el-tree-node__label) {
    font-size: 13px;
    font-weight: 400;
    color: var(--dr-gray-700);
  }

  :deep(.el-tree-node.is-current > .el-tree-node__content .el-tree-node__label) {
    color: var(--dr-blue);
    font-weight: 500;
  }

  :deep(.el-tree-node__expand-icon) {
    color: var(--dr-gray-400);
    font-size: 12px;

    &:hover {
      color: var(--dr-gray-700);
    }
  }

  :deep(.el-icon) {
    color: var(--dr-gray-700);
  }
}
</style>
