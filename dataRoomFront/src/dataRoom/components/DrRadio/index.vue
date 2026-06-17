<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrRadio',
})
</script>
<script setup lang="ts">
import type {DrRadioConfig} from './install.ts'
import {ref, computed, watch, onMounted} from "vue"
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts"

const {chart} = defineProps<{
  chart: DrRadioConfig
}>()

/** 当前选中值 */
const selectedValue = ref<string>(chart.props.basic.defaultValue || '')

/** 选项列表（可能来自静态配置或数据集） */
const optionsList = ref<Array<{ label: string; value: string }>>(
  [...chart.props.options.staticOptions]
)

/**
 * 数据集数据变化时更新选项列表
 */
const changeData = (datasetValue: any) => {
  if (!datasetValue) return

  const labelFieldList: string[] | undefined = chart.dataset?.fields?.['labelField']
  const valueFieldList: string[] | undefined = chart.dataset?.fields?.['valueField']

  if (!labelFieldList || labelFieldList.length === 0 || !valueFieldList || valueFieldList.length === 0) {
    return
  }

  const labelFieldName = labelFieldList[0]!
  const valueFieldName = valueFieldList[0]!

  if (Array.isArray(datasetValue)) {
    optionsList.value = datasetValue.map((item: any) => ({
      label: String(item[labelFieldName] ?? ''),
      value: String(item[valueFieldName] ?? '')
    }))
  }
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/**
 * 选中项变化处理
 */
const onSelectOption = (option: { label: string; value: string }) => {
  if (chart.props.basic.disabled) return
  if (selectedValue.value === option.value) return

  selectedValue.value = option.value

  // 更新全局变量
  if (chart.props.globalVar.globalVarName) {
    canvasInst.updateGlobalVariableValue(chart.props.globalVar.globalVarName, option.value)
  }

  // 触发行为事件
  canvasInst.triggerChartBehavior(chart.id, 'change', {
    value: option.value,
    label: option.label
  })
}

/**
 * 容器样式
 */
const containerStyle = computed(() => {
  const layout = chart.props.layout
  const style: Record<string, string> = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: layout.gap + 'px',
    width: '100%',
    height: '100%',
    alignItems: 'center'
  }
  if (layout.direction === 'vertical') {
    style.flexDirection = 'column'
    style.alignItems = 'flex-start'
  } else {
    style.flexDirection = 'row'
  }
  return style
})

/**
 * 获取选项按钮样式
 */
const getOptionStyle = (option: { label: string; value: string }) => {
  const styleConfig = chart.props.style
  const isActive = selectedValue.value === option.value
  const padding = styleConfig.padding

  const style: Record<string, string> = {
    fontSize: styleConfig.fontSize + 'px',
    borderRadius: styleConfig.borderRadius + 'px',
    padding: `${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px`,
    cursor: chart.props.basic.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    whiteSpace: 'nowrap'
  }

  if (isActive) {
    style.color = styleConfig.activeColor
    style.backgroundColor = styleConfig.activeBgColor
  } else {
    style.color = styleConfig.inactiveColor
    style.backgroundColor = styleConfig.inactiveBgColor
  }

  if (chart.props.basic.disabled) {
    style.opacity = '0.5'
  }

  return style
}

/**
 * 监听静态选项变化，在未绑定数据集时同步
 */
watch(
  () => chart.props.options.staticOptions,
  (newOptions) => {
    if (!chart.dataset?.code) {
      optionsList.value = [...newOptions]
    }
  },
  {deep: true}
)

/**
 * 监听默认值变化
 */
watch(
  () => chart.props.basic.defaultValue,
  (newVal) => {
    if (newVal !== selectedValue.value) {
      selectedValue.value = newVal
      // 同步到全局变量
      if (chart.props.globalVar.globalVarName) {
        canvasInst.updateGlobalVariableValue(chart.props.globalVar.globalVarName, newVal)
      }
    }
  }
)

/**
 * 初始化时同步默认值到全局变量
 */
onMounted(() => {
  if (chart.props.basic.defaultValue && chart.props.globalVar.globalVarName) {
    canvasInst.updateGlobalVariableValue(
      chart.props.globalVar.globalVarName,
      chart.props.basic.defaultValue
    )
  }
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-radio" :id="chart.id" :style="containerStyle">
    <div
      v-for="option in optionsList"
      :key="option.value"
      class="dr-radio-option"
      :style="getOptionStyle(option)"
      @click="onSelectOption(option)"
    >
      {{ option.label }}
    </div>
  </div>
</template>

<style scoped>
.dr-radio {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.dr-radio-option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
</style>
