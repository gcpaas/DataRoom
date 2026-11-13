<script setup lang="ts">
import { computed } from 'vue'
import { javascript } from '@codemirror/lang-javascript'
import { EditorView } from '@codemirror/view'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import { Codemirror } from 'vue-codemirror'

const {
  modelValue,
  rows = 10,
  showActions = true,
  showFullscreenAction = true,
  panelText = false,
} = defineProps<{
  modelValue: string
  rows?: number
  showActions?: boolean
  showFullscreenAction?: boolean
  panelText?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  apply: []
  fullscreen: []
  help: []
}>()

const editorExtensions = computed(() => [
  javascript(),
  EditorView.theme({
    '&': {
      height: '100%',
      maxWidth: '100%',
      fontFamily: "'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace",
      fontSize: panelText ? '12px' : '13px',
      lineHeight: '1.5',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: 'var(--el-text-color-primary)',
    },
    '.cm-scroller': { overflow: 'auto' },
  }),
  eclipse,
])
const lineHeightPx = 20

const editorHeight = computed(() => `${Math.max(rows, 1) * lineHeightPx}px`)

const editorStyle = computed(() => ({
  height: editorHeight.value,
  maxHeight: editorHeight.value,
}))

const handleUpdate = (value: string) => {
  emit('update:modelValue', value)
}

const handleApply = () => {
  emit('apply')
}

const handleFullscreen = () => {
  emit('fullscreen')
}
</script>

<template>
  <div class="data-transform-script-editor">
    <div class="data-transform-script-editor__body" :style="editorStyle">
      <Codemirror
        class="data-transform-script-editor__codemirror"
        :model-value="modelValue"
        :extensions="editorExtensions"
        :indent-with-tab="true"
        :tab-size="2"
        placeholder="请输入数据处理 JS 脚本"
        @update:model-value="handleUpdate"
      />
    </div>
    <div class="data-transform-script-editor__actions" v-if="showActions">
      <el-button size="small" type="primary" plain @click="handleApply">应用</el-button>
      <el-button v-if="showFullscreenAction" size="small" plain @click="handleFullscreen">放大</el-button>
      <el-button size="small" text @click="emit('help')">帮助</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.data-transform-script-editor {
  position: relative;
  width: 100%;
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-fill-color-blank);
}

.data-transform-script-editor__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 8px;
}

.data-transform-script-editor__body {
  min-width: 0;
}

.data-transform-script-editor__codemirror {
  height: 100%;
}

</style>
