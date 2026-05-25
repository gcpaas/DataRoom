<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrImage',
})
</script>
<script setup lang="ts">
import type { DrImageConfig } from './install.ts'
import { getResourceUrl, getSingleDatasetValueByField } from '@/dataroom-packages/_common/_utils.ts'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'
import { computed, ref } from 'vue'

const { chart } = defineProps<{
  chart: DrImageConfig
}>()

const datasetImageUrl = ref('')

const imageUrl = computed(() => {
  if (datasetImageUrl.value) {
    return datasetImageUrl.value
  }
  return chart.props.url
})

const containerStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    borderRadius: `${props.borderRadius}px`,
  }
  if (props.hyperlink?.cursorPointer) {
    style.cursor = 'pointer'
  }
  return style
})

const backgroundStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    borderRadius: `${props.borderRadius}px`,
  }
  const url = getResourceUrl(imageUrl.value)
  style.backgroundImage = `url(${url})`
  switch (props.repeatMode) {
    case 'no-repeat-stretch':
      style.backgroundSize = '100% 100%'
      style.backgroundRepeat = 'no-repeat'
      break
    case 'no-repeat-contain':
      style.backgroundSize = 'contain'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'no-repeat-center':
      style.backgroundSize = 'auto'
      style.backgroundRepeat = 'no-repeat'
      style.backgroundPosition = 'center'
      break
    case 'repeat':
      style.backgroundRepeat = 'repeat'
      break
    case 'repeat-x':
      style.backgroundRepeat = 'repeat-x'
      break
    case 'repeat-y':
      style.backgroundRepeat = 'repeat-y'
      break
  }
  return style
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

const { canvasInst, expose } = useDrComponent({
  chart: chart,
  changeData: changeData,
})

const onImageClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', { url: imageUrl.value })
  if (chart.props.hyperlink?.url) {
    if (chart.props.hyperlink.openNewWindow) {
      window.open(chart.props.hyperlink.url, '_blank')
    } else {
      window.location.href = chart.props.hyperlink.url
    }
  }
}

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-image" :style="containerStyle" @click="onImageClick">
    <div v-if="chart.props.imageType === 'svg'" class="dr-image__svg">
      <el-image :src="getResourceUrl(imageUrl)" :style="{ borderRadius: `${chart.props.borderRadius}px` }">
        <template #error>
          <div class="image-error-slot">图片加载失败</div>
        </template>
      </el-image>
    </div>
    <div v-else class="dr-image__bitmap" :style="backgroundStyle">
      <div v-if="!imageUrl" class="image-error-slot">图片加载失败</div>
    </div>
  </div>
</template>

<style scoped>
.dr-image {
  width: 100%;
  height: 100%;
  overflow: hidden;

  & .dr-image__svg {
    width: 100%;
    height: 100%;

    & .el-image {
      width: 100%;
      height: 100%;
    }
  }

  & .dr-image__bitmap {
    width: 100%;
    height: 100%;
  }

  & .image-error-slot {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-text-color-regular);
  }
}
</style>
