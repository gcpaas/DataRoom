<!-- 公共数字输入框：按前缀自动对齐，可显式指定 align，保留数字编辑和步进语义。 -->
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CaretBottom, CaretTop } from '@element-plus/icons-vue'
import { ElIcon, useFormDisabled, type InputInstance, type InputProps } from 'element-plus'
import DrInputField from './DrInputField.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: number | null
  label?: string
  align?: 'left' | 'center' | 'right'
  inputStyle?: InputProps['inputStyle']
  min?: number
  max?: number
  step?: number
  precision?: number
  disabled?: boolean
  readonly?: boolean
  controls?: boolean
  // 兼容原面板属性；公共组件统一使用右侧上下按钮。
  controlsPosition?: '' | 'right'
  stepStrictly?: boolean
  valueOnClear?: number | 'min' | 'max' | null
  size?: '' | 'small' | 'default' | 'large'
  placeholder?: string
}>(), { step: 1, controls: true, disabled: undefined })

const emit = defineEmits<{
  'update:modelValue': [value: number]
  change: [value: number, oldValue: number | undefined]
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
  // 编辑开始时捕获快照，提交后再开始编辑时重新捕获。
  editStart: []
  editCommit: []
}>()

const inputRef = ref<InputInstance>()
defineExpose({
  inputRef,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  select: () => inputRef.value?.select(),
})

const precision = computed(() => Number.isInteger(props.precision) && props.precision! >= 0 && props.precision! <= 100 ? props.precision : undefined)
const effectiveDisabled = useFormDisabled()
const locked = computed(() => effectiveDisabled.value || props.readonly)
const finiteValue = (value: number | null | undefined) => typeof value === 'number' && Number.isFinite(value) ? value : undefined
const formatValue = (value: number | undefined) => {
  if (value === undefined) return ''
  if (precision.value === undefined) return String(value)
  const formatted = value.toFixed(precision.value)
  // 区间没有精度网格时优先守住边界，显示实际值，不把显示值再次舍入到区间外。
  return Number(formatted) === value ? formatted : String(value)
}
const currentValue = ref<number>()
const inputValue = ref('')
let editing = false

const parseValue = (raw: string) => {
  const value = raw.trim()
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value)) return undefined
  return finiteValue(Number(value))
}

const decimalPlaces = (value: number) => {
  const [coefficient = '0', exponent = '0'] = value.toString().split('e')
  return Math.max(0, (coefficient.split('.')[1]?.length ?? 0) - Number(exponent))
}

const roundDecimal = (value: number, digits: number, mode: 'round' | 'ceil' | 'floor' = 'round') => {
  if (!Number.isFinite(value) || decimalPlaces(value) <= digits) return value
  const [coefficient = '0', exponent = '0'] = value.toString().split('e')
  const shiftedExponent = Number(exponent) + digits
  // 超出安全整数范围时保留原始运算结果，不通过超大缩放或有效位截断损失精度。
  if (shiftedExponent > 308) return value
  const shifted = Number(`${coefficient}e${shiftedExponent}`)
  if (!Number.isFinite(shifted) || Math.abs(shifted) > Number.MAX_SAFE_INTEGER) return value
  const rounded = mode === 'round'
    ? Math.sign(value) * Math.round(Math.abs(shifted))
    : mode === 'ceil' ? Math.ceil(shifted) : Math.floor(shifted)
  const [roundedCoefficient, roundedExponent = '0'] = rounded.toString().split('e')
  return Number(`${roundedCoefficient}e${Number(roundedExponent) - digits}`)
}

const valueBounds = computed(() => {
  const min = props.min ?? -Infinity
  const max = props.max ?? Infinity
  const lower = precision.value === undefined ? min : roundDecimal(min, precision.value, 'ceil')
  const upper = precision.value === undefined ? max : roundDecimal(max, precision.value, 'floor')
  // 没有可用精度网格时仅钳制原始边界，放弃本次精度/严格步长约束，保证回写幂等。
  return lower <= upper ? { min: lower, max: upper, hasGrid: true } : { min, max, hasGrid: false }
})

const normalizeValue = (value: number) => {
  const { min, max, hasGrid } = valueBounds.value
  // 边界钳制结果是固定点；严格步长不能在父级回写后把边界重新吸附到区间内部。
  if (value === min || value === max) return finiteValue(Math.min(max, Math.max(min, value)))
  let next = value
  if (hasGrid) {
    if (props.stepStrictly && props.step > 0 && Number.isFinite(props.step)) {
      const count = Math.round(next / props.step)
      if (Number.isSafeInteger(count)) {
        next = roundDecimal(count * props.step, decimalPlaces(props.step))
      }
    }
    if (precision.value !== undefined) next = roundDecimal(next, precision.value)
  }
  const clamped = Math.min(max, Math.max(min, next))
  return finiteValue(clamped === 0 ? 0 : clamped)
}

watch(
  () => [props.modelValue, props.min, props.max, precision.value, props.step, props.stepStrictly] as const,
  () => {
    const value = finiteValue(props.modelValue)
    const next = value === undefined ? undefined : normalizeValue(value)
    currentValue.value = next
    inputValue.value = formatValue(next)
    // 外部同步只纠正模型，不作为用户编辑记录；父级回写相同值时不再发送。
    if (next !== undefined && next !== props.modelValue) emit('update:modelValue', next)
  },
  { immediate: true },
)

const restoreValue = () => {
  inputValue.value = formatValue(currentValue.value)
}

const startEdit = () => {
  if (locked.value || editing) return
  editing = true
  emit('editStart')
}

const applyValue = (value: number) => {
  const next = normalizeValue(value)
  if (next === undefined) {
    restoreValue()
    return
  }
  inputValue.value = formatValue(next)
  const previous = currentValue.value
  if (next === previous) return
  startEdit()
  currentValue.value = next
  emit('update:modelValue', next)
  emit('change', next, previous)
  emit('editCommit')
  editing = false
}

const onInput = (raw: string) => {
  if (locked.value) return
  // 允许负号、小数点及科学计数法的编辑中间态，不接受其他字符。
  if (/^[+-]?(?:\d*(?:\.\d*)?)(?:e[+-]?\d*)?$/i.test(raw)) {
    startEdit()
    inputValue.value = raw
  }
}

const commitValue = (raw: string) => {
  if (locked.value) {
    restoreValue()
    return
  }
  let parsed = parseValue(raw)
  if (raw.trim() === '' && props.valueOnClear != null) {
    parsed = finiteValue(props.valueOnClear === 'min' ? props.min : props.valueOnClear === 'max' ? props.max : props.valueOnClear)
  }
  if (parsed === undefined) {
    restoreValue()
    return
  }
  applyValue(parsed)
}

const stepDisabled = (direction: 1 | -1) => {
  if (locked.value) return true
  const base = parseValue(inputValue.value) ?? currentValue.value
  return base !== undefined && (direction === 1 ? props.max !== undefined && base >= props.max : props.min !== undefined && base <= props.min)
}

const onStep = (direction: 1 | -1) => {
  if (stepDisabled(direction)) return
  const base = parseValue(inputValue.value) ?? currentValue.value ?? 0
  const next = roundDecimal(base + direction * props.step, Math.max(decimalPlaces(base), decimalPlaces(props.step)))
  applyValue(next)
}

const onKeydown = (event: Event | KeyboardEvent) => {
  if (!('key' in event) || event.isComposing || locked.value) return
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault()
    onStep(event.key === 'ArrowUp' ? 1 : -1)
  } else if (event.key === 'Enter') {
    commitValue(inputValue.value)
  }
}

const onFocus = (event: FocusEvent) => {
  startEdit()
  emit('focus', event)
}

const onBlur = (event: FocusEvent) => {
  commitValue(inputValue.value)
  editing = false
  emit('blur', event)
}
</script>

<template>
  <div class="dr-number-field" :class="$attrs.class" :style="$attrs.style">
    <DrInputField
      ref="inputRef"
      v-bind="{ ...$attrs, class: undefined, style: undefined }"
      :model-value="inputValue"
      :input-style="[inputStyle, { textAlign: align ?? (label || $slots.prefix || $attrs.prefixIcon || $attrs['prefix-icon'] ? 'center' : 'left') }]"
      :disabled="effectiveDisabled"
      :readonly="readonly"
      :size="size"
      :placeholder="placeholder"
      inputmode="decimal"
      role="spinbutton"
      :aria-valuenow="currentValue"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-readonly="readonly || undefined"
      @update:model-value="onInput"
      @focus="onFocus"
      @blur="onBlur"
      @change="commitValue"
      @keydown="onKeydown"
    >
      <template v-for="name in Object.keys($slots).filter(name => name !== 'prefix' && name !== 'suffix')" #[name]="scope">
        <slot :name="name" v-bind="scope || {}" />
      </template>
      <template v-if="label || $slots.prefix" #prefix="scope"><slot name="prefix" v-bind="scope || {}">{{ label }}</slot></template>
      <template #suffix="scope">
        <slot name="suffix" v-bind="scope || {}" />
        <span v-if="controls" class="dr-number-field__steppers">
          <button type="button" class="dr-number-field__stepper" aria-label="增加" :disabled="stepDisabled(1)" @mousedown.prevent @click="onStep(1)">
            <ElIcon><CaretTop /></ElIcon>
          </button>
          <button type="button" class="dr-number-field__stepper" aria-label="减少" :disabled="stepDisabled(-1)" @mousedown.prevent @click="onStep(-1)">
            <ElIcon><CaretBottom /></ElIcon>
          </button>
        </span>
      </template>
    </DrInputField>
  </div>
</template>

<style scoped lang="scss">
.dr-number-field {
  width: 100%;
  min-width: 0;
  font-size: 12px;

  .dr-number-field__steppers {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    visibility: hidden;
  }

  &:hover .dr-number-field__steppers,
  &:focus-within .dr-number-field__steppers {
    visibility: visible;
  }

  .dr-number-field__stepper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 0;
    background: transparent;
    padding: 0;
    font-size: 10px;
    line-height: 1;
    color: var(--el-text-color-secondary);
    cursor: pointer;

    &:hover:not(:disabled) {
      color: var(--el-color-primary);
    }

    &:focus-visible {
      outline: 1px solid var(--el-color-primary);
      outline-offset: 1px;
    }

    &:disabled {
      color: var(--el-disabled-text-color);
      cursor: not-allowed;
    }
  }
}
</style>
