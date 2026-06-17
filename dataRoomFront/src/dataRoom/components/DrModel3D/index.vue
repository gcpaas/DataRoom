<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrModel3D',
})
</script>
<script setup lang="ts">
import type {DrModel3DConfig} from './install.ts'
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component";
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts";
import {computed} from "vue";
import { Box } from '@element-plus/icons-vue'
import ThreeModelViewer from '@/dataRoom/three/ThreeModelViewer.vue'
import { getResourceUrl } from '@/dataRoom/_common/_utils.ts'

const props = defineProps<{
  chart: DrModel3DConfig
}>()

const {canvasInst, expose} = useDrComponent({
  chart: props.chart,
  changeData: () => {}
})

const modelUrl = computed(() => {
  return getResourceUrl(props.chart.props.modelUrl)
})

const coverImage = computed(() => {
  return getResourceUrl(props.chart.props.coverImage)
})

const onClick = () => {
  canvasInst.triggerChartBehavior(props.chart.id, 'click', {})
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-model-3d" @click="onClick">
    <ThreeModelViewer
      v-if="modelUrl"
      :model-url="modelUrl"
      :cover-image="coverImage"
      :auto-rotate="chart.props.autoRotate"
      :interaction-enabled="chart.props.interactionEnabled"
      :material-config="chart.props.material"
      :lighting-config="chart.props.lighting"
      :background-config="chart.props.background"
    />
    <div v-else class="placeholder">
      <el-icon :size="48"><Box /></el-icon>
      <span>请配置3D模型</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dr-model-3d {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;

  .placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #1a1a2e;
    color: #666;
    gap: 12px;
  }
}
</style>
