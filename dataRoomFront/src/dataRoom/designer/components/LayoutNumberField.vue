<!-- 布局数值输入框：前缀字母内嵌输入框左侧，悬停时显示上下步进按钮，数字左对齐 -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { CaretBottom, CaretTop } from '@element-plus/icons-vue'

const props = defineProps<{
  modelValue: number
  // 输入框左侧前缀字母，如 X/Y/W/H；不传则无前缀
  label?: string
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
  // 编辑开始（聚焦或步进点击），供外部捕获快照
  editStart: []
  // 编辑提交（值已变化），供外部记录历史
  editCommit: []
}>()

const inputValue = ref(String(props.modelValue))

watch(
  () => props.modelValue,
  (value) => {
    inputValue.value = String(value)
  },
)

const clampValue = (value: number) => {
  let next = value
  if (props.min !== undefined) {
    next = Math.max(props.min, next)
  }
  if (props.max !== undefined) {
    next = Math.min(props.max, next)
  }
  return next
}

const commitValue = (raw: string) => {
  const trimmed = raw.trim()
  const parsed = Number(trimmed)
  if (trimmed === '' || !Number.isFinite(parsed)) {
    // 非法输入回显当前值
    inputValue.value = String(props.modelValue)
    return
  }
  const next = clampValue(Math.round(parsed))
  inputValue.value = String(next)
  if (next === props.modelValue) {
    return
  }
  emit('update:modelValue', next)
  emit('editCommit')
}

const onStep = (direction: 1 | -1) => {
  // 步进按钮点击时输入框未必聚焦，先通知外部进入编辑态
  emit('editStart')
  const next = clampValue(Math.round((Number(props.modelValue) || 0) + direction * (props.step ?? 1)))
  if (next === props.modelValue) {
    return
  }
  emit('update:modelValue', next)
  emit('editCommit')
}
</script>

<template>
  <div class="layout-number-field">
    <el-input v-model="inputValue" :input-style="{ textAlign: 'center' }" @focus="emit('editStart')" @change="commitValue">
      <template v-if="label" #prefix>{{ label }}</template>
      <template #suffix>
        <span class="layout-number-field__steppers">
          <button type="button" class="layout-number-field__stepper" aria-label="增加" @click="onStep(1)">
            <el-icon><CaretTop /></el-icon>
          </button>
          <button type="button" class="layout-number-field__stepper" aria-label="减少" @click="onStep(-1)">
            <el-icon><CaretBottom /></el-icon>
          </button>
        </span>
      </template>
    </el-input>
  </div>
</template>

<style scoped lang="scss">
.layout-number-field {
  width: 100%;
  min-width: 0;

  .layout-number-field__steppers {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    visibility: hidden;
  }

  &:hover .layout-number-field__steppers {
    visibility: visible;
  }

  .layout-number-field__stepper {
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

    &:hover {
      color: var(--el-color-primary);
    }
  }
}
</style>
