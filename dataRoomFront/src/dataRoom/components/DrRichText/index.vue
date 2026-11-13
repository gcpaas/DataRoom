<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import type { DrRichTextConfig } from './install'
import type { ComponentExpose } from '../type/ComponentExpose'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import { createRichTextExtensions } from './extensions'
import { isSafeRichTextLink, resolveRichTextContent } from './rich-text-template'
import './rich-text.scss'

defineOptions({ name: 'DrRichText' })
const { chart } = defineProps<{ chart: DrRichTextConfig }>()
const data = shallowRef<unknown>()
const { expose } = useDrComponent({ chart, changeData: (value) => { data.value = value } })
// 切换/解除数据集时不能展示上一份数据。
watch(() => chart.dataset?.code, () => { data.value = undefined }, { flush: 'sync' })
const resolvedContent = computed(() => resolveRichTextContent(chart.props.content, data.value))
const editor = useEditor({
  extensions: createRichTextExtensions(),
  content: resolvedContent.value,
  editable: false,
  editorProps: { attributes: { class: 'dr-rich-text-content', tabindex: '-1' } },
})
watch(resolvedContent, (content) => editor.value?.commands.setContent(content, { emitUpdate: false }), { deep: true })
onBeforeUnmount(() => editor.value?.destroy())
const alignment = computed(() => ({
  textAlign: chart.props.align,
  '--el-text-color-primary': chart.props.color ?? 'var(--el-text-color-regular)',
  '--dr-rich-text-line-height': chart.props.lineHeight ?? 1.6,
  justifyContent: { top: 'flex-start', center: 'center', bottom: 'flex-end' }[chart.props.verticalAlign],
}))
const openLink = (event: MouseEvent) => {
  const link = (event.target as HTMLElement).closest('a')
  if (!link) return
  event.preventDefault()
  const href = link.getAttribute('href') || ''
  if (isSafeRichTextLink(href)) window.open(href, '_blank', 'noopener,noreferrer')
}
defineExpose<ComponentExpose>({ ...expose })
</script>

<template>
  <div :id="chart.id" class="dr-rich-text" :style="alignment" @click="openLink">
    <EditorContent :editor="editor" class="dr-rich-text__document" />
  </div>
</template>

<style scoped>
.dr-rich-text {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: auto;
}
.dr-rich-text__document { width: 100%; flex-shrink: 0; min-width: 0; }
</style>
