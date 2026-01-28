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

<style scoped>
.dr-layer-tree {
  margin-top: 8px;
}
</style>
