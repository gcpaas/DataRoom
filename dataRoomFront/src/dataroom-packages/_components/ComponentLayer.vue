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
    />
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
</style>
