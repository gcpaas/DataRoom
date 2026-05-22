<script setup lang="ts">
import {computed} from 'vue'

type SpacingObject = {
  top?: number
  right?: number
  bottom?: number
  left?: number
}

type SpacingValue = number[] | SpacingObject

const props = withDefaults(defineProps<{
  modelValue: SpacingValue
  ariaLabel?: string
  min?: number
  max?: number
  step?: number
}>(), {
  ariaLabel: '边距配置',
  min: 0,
  max: 200,
  step: 1,
})

const emit = defineEmits<{
  'update:modelValue': [value: SpacingValue]
}>()

const sides = [
  {key: 'top', index: 0, className: 'top', label: '上边距'},
  {key: 'right', index: 1, className: 'right', label: '右边距'},
  {key: 'bottom', index: 2, className: 'bottom', label: '下边距'},
  {key: 'left', index: 3, className: 'left', label: '左边距'},
] as const

const normalizedValue = computed<[number, number, number, number]>(() => {
  if (Array.isArray(props.modelValue)) {
    return [
      Number(props.modelValue[0] ?? 0),
      Number(props.modelValue[1] ?? 0),
      Number(props.modelValue[2] ?? 0),
      Number(props.modelValue[3] ?? 0),
    ]
  }
  return [
    Number(props.modelValue.top ?? 0),
    Number(props.modelValue.right ?? 0),
    Number(props.modelValue.bottom ?? 0),
    Number(props.modelValue.left ?? 0),
  ]
})

const formatValue = (value: number) => {
  return Number.isFinite(value) ? String(value) : '0'
}

const normalizeInput = (rawValue: string) => {
  const value = Number(rawValue)
  if (!Number.isFinite(value)) {
    return props.min
  }
  return Math.min(props.max, Math.max(props.min, value))
}

const updateValue = (index: number, key: keyof SpacingObject, rawValue: string) => {
  const nextValue = normalizeInput(rawValue)
  const nextValues: [number, number, number, number] = [...normalizedValue.value]
  nextValues[index] = nextValue

  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', nextValues)
    return
  }

  emit('update:modelValue', {
    ...props.modelValue,
    [key]: nextValue,
  })
}
</script>

<template>
  <div class="padding-box-editor">
    <div class="padding-box" role="group" :aria-label="ariaLabel">
      <div class="padding-band padding-band-top"></div>
      <div class="padding-band padding-band-right"></div>
      <div class="padding-band padding-band-bottom"></div>
      <div class="padding-band padding-band-left"></div>
      <div class="padding-content"></div>

      <label
        v-for="side in sides"
        :key="side.key"
        class="padding-value"
        :class="`is-${side.className}`"
        :title="side.label"
      >
        <span class="sr-only">{{ side.label }}</span>
        <input
          type="number"
          :min="min"
          :max="max"
          :step="step"
          :value="formatValue(normalizedValue[side.index])"
          @input="updateValue(side.index, side.key, ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </div>
</template>

<style scoped>
.padding-box-editor {
  width: 100%;
}

.padding-box {
  --padding-fill: var(--dr-blue-soft);
  --padding-content-bg: var(--dr-white);
  --padding-text: var(--dr-gray-700);
  --padding-text-hover: var(--dr-gray-900);
  --padding-x: 38px;
  --padding-y: 30px;

  position: relative;
  width: 100%;
  min-width: 180px;
  height: 128px;
  overflow: hidden;
  background: var(--dr-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--dr-shadow-border);
  isolation: isolate;
}

.padding-band,
.padding-content,
.padding-value {
  position: absolute;
}

.padding-band {
  background: var(--padding-fill);
  z-index: 1;
}

.padding-band-top {
  top: 0;
  left: 0;
  width: 100%;
  height: var(--padding-y);
  clip-path: polygon(0 0, 100% 0, calc(100% - var(--padding-x)) 100%, var(--padding-x) 100%);
}

.padding-band-right {
  top: 0;
  right: 0;
  width: var(--padding-x);
  height: 100%;
  clip-path: polygon(0 var(--padding-y), 100% 0, 100% 100%, 0 calc(100% - var(--padding-y)));
}

.padding-band-bottom {
  right: 0;
  bottom: 0;
  width: 100%;
  height: var(--padding-y);
  clip-path: polygon(var(--padding-x) 0, calc(100% - var(--padding-x)) 0, 100% 100%, 0 100%);
}

.padding-band-left {
  top: 0;
  left: 0;
  width: var(--padding-x);
  height: 100%;
  clip-path: polygon(0 0, 100% var(--padding-y), 100% calc(100% - var(--padding-y)), 0 100%);
}

.padding-content {
  top: var(--padding-y);
  right: var(--padding-x);
  bottom: var(--padding-y);
  left: var(--padding-x);
  z-index: 2;
  background: var(--padding-content-bg);
  box-shadow: var(--dr-shadow-border);
}

.padding-value {
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 24px;
}

.padding-value input {
  width: 42px;
  height: 22px;
  padding: 0;
  outline: none;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--padding-text);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 22px;
  text-align: center;
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
  transition: color 0.16s ease, background-color 0.16s ease, box-shadow 0.16s ease;
}

.padding-value input:hover {
  color: var(--padding-text-hover);
  background: rgba(255, 255, 255, 0.72);
}

.padding-value input:focus-visible {
  color: var(--dr-gray-900);
  background: var(--dr-white);
  box-shadow: var(--dr-shadow-focus);
}

.padding-value input::-webkit-outer-spin-button,
.padding-value input::-webkit-inner-spin-button {
  margin: 0;
  -webkit-appearance: none;
}

.padding-value input[type='number'] {
  -moz-appearance: textfield;
}

.padding-value.is-top {
  top: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.padding-value.is-right {
  top: 50%;
  right: 0;
  transform: translateY(-50%);
}

.padding-value.is-bottom {
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
}

.padding-value.is-left {
  top: 50%;
  left: 0;
  transform: translateY(-50%);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
