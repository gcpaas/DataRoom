<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { onClickOutside } from '@vueuse/core'
import {
  ElButton,
  ElColorPickerPanel,
  ElPopover,
  useFormDisabled,
  type ColorPickerPanelProps,
  type InputInstance,
} from 'element-plus'
import DrInputField from './DrInputField.vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue?: string | null
  showAlpha?: boolean
  colorFormat?: ColorPickerPanelProps['colorFormat']
  predefine?: string[]
  disabled?: boolean
}>(), { disabled: undefined })

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  change: [value: string | null]
  activeChange: [value: string]
}>()

const effectiveDisabled = useFormDisabled()
const id = useId()
const dialogId = `dr-color-dialog-${id}`
const inputId = `dr-color-input-${id}`
const anchorRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const inputRef = ref<InputInstance>()
defineExpose({
  inputRef,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
})
const visible = ref(false)
const draft = ref<string | null>(props.modelValue ?? null)

const open = () => {
  if (effectiveDisabled.value || visible.value) return
  draft.value = props.modelValue ?? null
  visible.value = true
}

const cancel = (restoreFocus = false) => {
  visible.value = false
  draft.value = props.modelValue ?? null
  if (restoreFocus) inputRef.value?.focus()
}

const onDraftChange = (value: string | null) => {
  if (effectiveDisabled.value || !visible.value || value === draft.value) return
  draft.value = value
  emit('activeChange', value ?? '')
}

const commit = (value: string | null) => {
  if (effectiveDisabled.value || !visible.value) return
  visible.value = false
  emit('update:modelValue', value)
  emit('change', value)
  inputRef.value?.focus()
}

const confirm = async () => {
  // 等待面板文本输入失焦后的颜色解析同步到 draft，再提交。
  await nextTick()
  commit(draft.value)
}

const onKeydown = (event: Event | KeyboardEvent) => {
  if (!('key' in event) || event.isComposing) return
  if (event.key === 'Escape' && visible.value) {
    event.preventDefault()
    event.stopPropagation()
    cancel(true)
  } else if (event.currentTarget === anchorRef.value && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault()
    event.stopPropagation()
    open()
  }
}

const focusDialog = () => {
  if (visible.value) contentRef.value?.focus({ preventScroll: true })
}

// 只传 visible，不监听 update:visible：Element Plus 才会停止内置 trigger toggle。
// 外部点击不抢走目标焦点；确认、取消和 ESC 则归还输入框焦点。
onClickOutside(contentRef, () => {
  if (visible.value) cancel()
}, { ignore: [anchorRef] })

watch(effectiveDisabled, (value) => {
  if (value) cancel()
})
watch(() => props.modelValue, (value) => {
  draft.value = value ?? null
})
</script>

<template>
  <ElPopover
    :visible="visible"
    :disabled="effectiveDisabled"
    :persistent="false"
    :trigger-keys="[]"
    trigger="click"
    placement="bottom-start"
    width="auto"
    role="dialog"
    @after-enter="focusDialog"
  >
    <template #reference>
      <div ref="anchorRef" class="dr-color-field" @click="open" @keydown="onKeydown">
        <DrInputField
          ref="inputRef"
          :id="inputId"
          aria-label="颜色"
          v-bind="$attrs"
          :model-value="modelValue ?? ''"
          :disabled="effectiveDisabled"
          :validate-event="false"
          readonly
          role="button"
          aria-haspopup="dialog"
          :aria-expanded="visible"
          :aria-controls="visible ? dialogId : undefined"
        >
          <template v-for="name in Object.keys($slots).filter(name => name !== 'prefix')" #[name]="scope">
            <slot :name="name" v-bind="scope || {}" />
          </template>
          <template #prefix="scope">
            <slot name="prefix" v-bind="scope || {}">
              <span
                class="dr-color-field__swatch"
                :style="{ backgroundColor: modelValue || undefined }"
                aria-hidden="true"
              />
            </slot>
          </template>
        </DrInputField>
      </div>
    </template>
    <div
      :id="dialogId"
      ref="contentRef"
      role="dialog"
      aria-label="选择颜色"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <ElColorPickerPanel
        v-if="visible"
        :model-value="draft"
        :show-alpha="showAlpha"
        :color-format="colorFormat"
        :predefine="predefine"
        :disabled="effectiveDisabled"
        :validate-event="false"
        :border="false"
        @update:model-value="onDraftChange"
      />
      <div class="dr-color-field__actions">
        <ElButton size="small" :disabled="effectiveDisabled" @click="commit(null)">清空</ElButton>
        <ElButton size="small" :disabled="effectiveDisabled" @click="cancel(true)">取消</ElButton>
        <ElButton size="small" type="primary" :disabled="effectiveDisabled" @click="confirm">确认</ElButton>
      </div>
    </div>
  </ElPopover>
</template>

<style scoped lang="scss">
.dr-color-field {
  width: 100%;
  min-width: 0;
  font-size: 12px;
}

.dr-color-field__swatch {
  display: inline-block;
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-small);
  background-color: var(--el-fill-color-blank);
}

.dr-color-field__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
