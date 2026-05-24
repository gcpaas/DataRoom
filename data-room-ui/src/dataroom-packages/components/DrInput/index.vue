<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrInput',
})
</script>
<script setup lang="ts">
import type {DrInputConfig} from './install.ts'
import {ref, computed, watch, onMounted} from "vue"
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"

const {chart} = defineProps<{
  chart: DrInputConfig
}>()

/**
 * 输入框不消费数据集，changeData 为空实现
 */
const changeData = (_datasetValue: any) => {
  // 输入框组件不消费数据集
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/** 当前输入值 */
const inputValue = ref('')
/** 是否聚焦 */
const isFocused = ref(false)

/**
 * 初始化默认值并同步到全局变量
 */
onMounted(() => {
  if (chart.props.basic.defaultValue) {
    inputValue.value = chart.props.basic.defaultValue
    syncGlobalVariable(inputValue.value)
  }
})

/**
 * 监听 defaultValue 变化，同步更新
 */
watch(() => chart.props.basic.defaultValue, (newVal) => {
  inputValue.value = newVal
  syncGlobalVariable(newVal)
})

/**
 * 同步值到全局变量
 */
const syncGlobalVariable = (value: string) => {
  const varName = chart.props.globalVar.globalVarName
  if (varName) {
    canvasInst.updateGlobalVariableValue(varName, value)
  }
}

/**
 * 触发值变化行为事件
 */
const emitValueChange = (value: string) => {
  syncGlobalVariable(value)
  canvasInst.triggerChartBehavior(chart.id, 'valueChange', {value})
}

/**
 * 输入事件处理
 */
const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  inputValue.value = target.value
  if (chart.props.globalVar.triggerOnInput) {
    emitValueChange(target.value)
  }
}

/**
 * 回车事件处理
 */
const onKeydownEnter = () => {
  if (!chart.props.globalVar.triggerOnInput) {
    emitValueChange(inputValue.value)
  }
  canvasInst.triggerChartBehavior(chart.id, 'enterPress', {value: inputValue.value})
}

/**
 * 聚焦事件处理
 */
const onFocus = () => {
  isFocused.value = true
  canvasInst.triggerChartBehavior(chart.id, 'focus', {})
}

/**
 * 失焦事件处理
 */
const onBlur = () => {
  isFocused.value = false
  if (!chart.props.globalVar.triggerOnInput) {
    emitValueChange(inputValue.value)
  }
  canvasInst.triggerChartBehavior(chart.id, 'blur', {value: inputValue.value})
}

/**
 * 清空输入内容
 */
const onClear = () => {
  inputValue.value = ''
  emitValueChange('')
}

/**
 * 是否显示清空按钮
 */
const showClearBtn = computed(() => {
  return chart.props.basic.clearable && inputValue.value && !chart.props.basic.disabled && !chart.props.basic.readonly
})

/**
 * 输入框容器样式
 */
const wrapperStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    width: '100%',
    height: props.style.height + 'px',
    backgroundColor: props.style.backgroundColor,
    borderWidth: props.style.borderWidth + 'px',
    borderStyle: 'solid',
    borderColor: isFocused.value ? props.focus.borderColor : props.style.borderColor,
    borderRadius: props.style.borderRadius + 'px',
    padding: `${props.style.padding[0]}px ${props.style.padding[1]}px ${props.style.padding[2]}px ${props.style.padding[3]}px`,
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }
  if (isFocused.value) {
    style.boxShadow = `0 0 0 ${props.focus.shadowSize}px ${props.focus.shadowColor}`
  }
  if (props.basic.disabled) {
    style.opacity = '0.6'
    style.cursor = 'not-allowed'
  }
  return style
})

/**
 * 输入框样式
 */
const inputStyle = computed(() => {
  const props = chart.props
  const style: Record<string, string> = {
    width: '100%',
    height: '100%',
    border: 'none',
    outline: 'none',
    backgroundColor: 'transparent',
    fontSize: props.style.fontSize + 'px',
    color: props.style.color,
    lineHeight: 'normal',
  }
  if (props.basic.disabled) {
    style.cursor = 'not-allowed'
  }
  return style
})

/**
 * placeholder 颜色通过 CSS 变量注入
 */
const cssVars = computed(() => {
  return {
    '--dr-input-placeholder-color': chart.props.style.placeholderColor
  }
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-input" :id="chart.id" :style="cssVars">
    <div class="dr-input__wrapper" :style="wrapperStyle">
      <input
        :type="chart.props.basic.inputType"
        :value="inputValue"
        :placeholder="chart.props.basic.placeholder"
        :disabled="chart.props.basic.disabled"
        :readonly="chart.props.basic.readonly"
        :maxlength="chart.props.basic.maxLength > 0 ? chart.props.basic.maxLength : undefined"
        :style="inputStyle"
        class="dr-input__inner"
        @input="onInput"
        @keydown.enter="onKeydownEnter"
        @focus="onFocus"
        @blur="onBlur"
      />
      <span
        v-if="showClearBtn"
        class="dr-input__clear"
        @mousedown.prevent
        @click="onClear"
      >
        <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor">
          <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359c-1.2-1.5-1.9-3.3-1.9-5.2 0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z"/>
        </svg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.dr-input {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
}

.dr-input__wrapper {
  position: relative;
}

.dr-input__inner {
  font-family: inherit;
}

.dr-input__inner::placeholder {
  color: var(--dr-input-placeholder-color, #999999);
}

.dr-input__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: #999999;
  cursor: pointer;
  flex-shrink: 0;
  transition: color 0.2s;
}

.dr-input__clear:hover {
  color: #ffffff;
}
</style>
