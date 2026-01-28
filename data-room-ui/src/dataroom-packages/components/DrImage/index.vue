<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrImageConfig} from './install.ts'
import {getResourceUrl, getSingleDatasetValueByField} from "@/dataroom-packages/_common/_utils.ts";
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component";
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts";
import {computed, ref} from "vue";

const {chart} = defineProps<{
  chart: DrImageConfig
}>()

const datasetImageUrl = ref('')

const imageUrl = computed(() => {
  if (datasetImageUrl.value) {
    return datasetImageUrl.value
  }
  return chart.props.url
})

/**
 * 定义改变数据的逻辑，每个组件逻辑不一样
 * @param datasetValue
 */
const changeData = (datasetValue: any) => {
  const url = getSingleDatasetValueByField(chart, 'url', datasetValue)
  if (url) {
    datasetImageUrl.value = url
  }
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

const onImageClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {url: imageUrl.value})
}

defineExpose<ComponentExpose>({
  ...expose,
})

</script>

<template>
  <div class="dr-image" @click="onImageClick">
    <el-image :src="getResourceUrl(imageUrl)" lazy>
      <template #error>
        <div class="image-error-slot">
          图片加载失败
        </div>
      </template>
    </el-image>
  </div>
</template>

<style scoped>
.dr-image {
  width: 100%;
  height: 100%;

  & .el-image {
    width: 100%;
    height: 100%;
  }

  & .image-error-slot {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--dr-text);
  }
}
</style>
