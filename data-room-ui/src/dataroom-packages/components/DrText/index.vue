<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrTextConfig} from './install.ts'
import {ref, computed} from "vue";
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
  // 如果配置了超链接，则跳转
  if (chart.props.hyperlink?.url) {
    if (chart.props.hyperlink.openNewWindow) {
      window.open(chart.props.hyperlink.url, '_blank')
    } else {
      window.location.href = chart.props.hyperlink.url
    }
  }
  canvasInst.triggerChartBehavior(chart.id, 'click', {text: textValue.value})
}

/**
 * 根据配置计算组件内联样式
 */
const textStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {}

  // 文本样式
  if (props.textStyle) {
    style.fontSize = props.textStyle.fontSize + 'px'
    style.fontWeight = props.textStyle.fontWeight
    style.fontFamily = props.textStyle.fontFamily
    style.color = props.textStyle.color
  }

  // 对齐方式
  if (props.align) {
    style.textAlign = props.align
  }

  // 垂直对齐（通过 flexbox 实现）
  if (props.verticalAlign) {
    style.display = 'flex'
    if (props.verticalAlign === 'top') {
      style.alignItems = 'flex-start'
    } else if (props.verticalAlign === 'center') {
      style.alignItems = 'center'
    } else if (props.verticalAlign === 'bottom') {
      style.alignItems = 'flex-end'
    }
  }

  // 文字间隔
  if (props.letterSpacing) {
    style.letterSpacing = props.letterSpacing + 'px'
  }

  // 背景样式
  if (props.background?.enabled) {
    style.backgroundColor = props.background.color
    style.borderRadius = props.background.borderRadius + 'px'
    if (props.background.border && props.background.border.style !== 'none') {
      style.border = `${props.background.border.width}px ${props.background.border.style} ${props.background.border.color}`
    }
  }

  // 省略号
  if (props.ellipsis) {
    style.overflow = 'hidden'
    style.textOverflow = 'ellipsis'
    style.whiteSpace = 'nowrap'
  }

  // 超链接样式：有链接时显示手型光标
  if (props.hyperlink?.url) {
    style.cursor = 'pointer'
  }

  return style
})

defineExpose<ComponentExpose>({
  ...expose,
})

</script>

<template>
  <div class="dr-text" :id="chart.id" :style="textStyle" @click="onTextClick">{{ textValue || chart.props.text }}</div>
</template>

<style scoped>
.dr-text {
  width: 100%;
  height: 100%;
}
</style>
