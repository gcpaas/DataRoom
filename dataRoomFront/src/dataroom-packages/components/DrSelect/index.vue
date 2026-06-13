<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrSelect',
})
</script>
<script setup lang="ts">
import type { DrSelectConfig } from './install.ts'
import { ref, computed, onMounted } from 'vue'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'

const { chart } = defineProps<{
  chart: DrSelectConfig
}>()

/** 当前选中值 */
const selectedValue = ref<string | string[]>(chart.props.basic.multiple ? [] : '')

/** 动态选项列表（从数据集加载） */
const dynamicOptions = ref<Array<{ label: string; value: string }>>([])

/**
 * 计算最终使用的选项列表：优先使用数据集动态选项，否则使用静态选项
 */
const optionsList = computed(() => {
  if (dynamicOptions.value.length > 0) {
    return dynamicOptions.value
  }
  return chart.props.options.staticOptions || []
})

/**
 * 定义改变数据的逻辑 - 从数据集加载选项
 */
const changeData = (datasetValue: any) => {
  if (!datasetValue) {
    return
  }
  const labelFieldList: string[] | undefined = chart.dataset?.fields?.['labelField']
  const valueFieldList: string[] | undefined = chart.dataset?.fields?.['valueField']

  if (!labelFieldList || labelFieldList.length === 0 || !valueFieldList || valueFieldList.length === 0) {
    return
  }

  const labelFieldName = labelFieldList[0]!
  const valueFieldName = valueFieldList[0]!

  if (Array.isArray(datasetValue)) {
    dynamicOptions.value = datasetValue.map((item: any) => ({
      label: String(item[labelFieldName] ?? ''),
      value: String(item[valueFieldName] ?? ''),
    }))
  }
}

const { canvasInst, expose } = useDrComponent({
  chart: chart,
  changeData: changeData,
})

/**
 * 获取选中项的label
 */
const getSelectedLabel = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.map((v) => {
      const option = optionsList.value.find((opt) => opt.value === v)
      return option ? option.label : v
    })
  }
  const option = optionsList.value.find((opt) => opt.value === value)
  return option ? option.label : value
}

const normalizeGlobalVariableValue = (value: string | string[]) => {
  return Array.isArray(value) ? value.join(',') : value
}

/**
 * 选中值变化时的回调
 */
const onSelectChange = (value: string | string[]) => {
  // 更新全局变量
  const globalVarName = chart.props.globalVar?.globalVarName
  if (globalVarName) {
    canvasInst.updateGlobalVariableValue(globalVarName, normalizeGlobalVariableValue(value))
  }
  // 触发行为事件
  const label = getSelectedLabel(value)
  canvasInst.triggerChartBehavior(chart.id, 'change', { value, label })
}

/**
 * 清空选中时的回调
 */
const onSelectClear = () => {
  // 更新全局变量为空
  const globalVarName = chart.props.globalVar?.globalVarName
  if (globalVarName) {
    canvasInst.updateGlobalVariableValue(globalVarName, '')
  }
  // 触发清空行为事件
  canvasInst.triggerChartBehavior(chart.id, 'clear', {})
}

/**
 * 初始化默认值
 */
onMounted(() => {
  const defaultValue = chart.props.basic.defaultValue
  if (defaultValue) {
    if (chart.props.basic.multiple) {
      selectedValue.value = defaultValue
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v)
    } else {
      selectedValue.value = defaultValue
    }
    // 同步默认值到全局变量
    const globalVarName = chart.props.globalVar?.globalVarName
    if (globalVarName) {
      canvasInst.updateGlobalVariableValue(globalVarName, normalizeGlobalVariableValue(selectedValue.value))
    }
  }
})

/**
 * 生成组件唯一的CSS变量类名
 */
const selectCssVars = computed(() => {
  const style = chart.props.style
  const dropdown = chart.props.dropdown
  const options = chart.props.options
  return {
    '--component-select-font-size': style.fontSize + 'px',
    '--component-select-color': style.color,
    '--component-select-placeholder-color': style.placeholderColor,
    '--component-select-bg-color': style.backgroundColor,
    '--component-select-border-color': style.borderColor,
    '--component-select-border-width': style.borderWidth + 'px',
    '--component-select-border-radius': style.borderRadius + 'px',
    '--component-select-height': style.height + 'px',
    '--component-select-dropdown-max-height': dropdown.maxHeight + 'px',
    '--component-select-dropdown-bg-color': dropdown.backgroundColor,
    '--component-select-dropdown-border-color': dropdown.borderColor,
    '--component-select-dropdown-hover-bg': dropdown.hoverBgColor,
    '--component-select-dropdown-active-bg': dropdown.activeBgColor,
    '--component-select-dropdown-active-color': dropdown.activeColor,
    '--component-select-option-font-size': options.optionFontSize + 'px',
    '--component-select-option-color': options.optionColor,
  } as Record<string, string>
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-select" :id="chart.id" :style="selectCssVars">
    <el-select
      v-model="selectedValue"
      :placeholder="chart.props.basic.placeholder"
      :multiple="chart.props.basic.multiple"
      :clearable="chart.props.basic.clearable"
      :disabled="chart.props.basic.disabled"
      :filterable="chart.props.basic.filterable"
      :size="chart.props.basic.size"
      :teleported="true"
      :popper-class="'dr-select-dropdown-' + chart.id"
      @change="onSelectChange"
      @clear="onSelectClear"
    >
      <el-option v-for="item in optionsList" :key="item.value" :label="item.label" :value="item.value" />
    </el-select>
  </div>
</template>

<style scoped>
.dr-select {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.dr-select :deep(.el-select) {
  width: 100%;
}

.dr-select :deep(.el-select .el-select__wrapper) {
  font-size: var(--component-select-font-size);
  color: var(--component-select-color);
  background-color: var(--component-select-bg-color);
  border: var(--component-select-border-width) solid var(--component-select-border-color);
  border-radius: var(--component-select-border-radius);
  height: var(--component-select-height);
  box-shadow: none;
}

.dr-select :deep(.el-select .el-select__wrapper .el-select__selected-item) {
  color: var(--component-select-color);
}

.dr-select :deep(.el-select .el-select__wrapper .el-select__placeholder) {
  color: var(--component-select-placeholder-color);
}

.dr-select :deep(.el-select .el-select__wrapper .el-select__suffix .el-icon) {
  color: var(--component-select-color);
}

.dr-select :deep(.el-select .el-select__wrapper .el-tag) {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-8);
  color: var(--component-select-color);
}
</style>

<style>
/* 下拉面板样式 - 非scoped，因为下拉面板通过teleport渲染到body */
[class*='dr-select-dropdown-'] .el-select-dropdown {
  background-color: var(--component-select-dropdown-bg-color, var(--el-fill-color-blank));
  border: 1px solid var(--component-select-dropdown-border-color, var(--el-border-color));
}

[class*='dr-select-dropdown-'] .el-select-dropdown__item {
  color: var(--component-select-option-color, var(--el-text-color-primary));
  font-size: var(--component-select-option-font-size, 14px);
}

[class*='dr-select-dropdown-'] .el-select-dropdown__item:hover {
  background-color: var(--component-select-dropdown-hover-bg, var(--el-color-primary-light-9));
}

[class*='dr-select-dropdown-'] .el-select-dropdown__item.is-selected {
  background-color: var(--component-select-dropdown-active-bg, var(--el-color-primary-light-8));
  color: var(--component-select-dropdown-active-color, var(--el-color-primary));
}

[class*='dr-select-dropdown-'] .el-select-dropdown__item.is-selected::after {
  color: var(--component-select-dropdown-active-color, var(--el-color-primary));
}

[class*='dr-select-dropdown-'] .el-scrollbar__wrap {
  max-height: var(--component-select-dropdown-max-height, 200px);
}
</style>
