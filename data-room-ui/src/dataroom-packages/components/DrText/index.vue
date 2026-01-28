<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrTextConfig} from './install.ts'
import {ref} from "vue";
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component";
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts";
import {getSingleDatasetValueByField} from "@/dataroom-packages/_common/_utils.ts";

const {chart} = defineProps<{
  chart: DrTextConfig
}>()

/**
 * 定义改变数据的逻辑，每个组件逻辑不一样
 * @param datasetValue
 */
const changeData = (datasetValue: any) => {
  const textContent = getSingleDatasetValueByField(chart, 'text', datasetValue)
  if (textContent) {
    textValue.value = textContent
  }
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

const textValue = ref('')

const onTextClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', {text: textValue.value})
}

defineExpose<ComponentExpose>({
  ...expose,
})

</script>

<template>
  <div class="dr-text" :id="chart.id" @click="onTextClick">{{ textValue || chart.props.text }}</div>
</template>

<style scoped>
.dr-text {
  width: 100%;
  height: 100%;
}
</style>
