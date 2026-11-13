<script setup lang="ts">
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import { PluginKey } from '@tiptap/pm/state'
import { useEventListener } from '@vueuse/core'
import { Link } from '@element-plus/icons-vue'
import { ElMessage, useZIndex } from 'element-plus'
import type { DrRichTextConfig } from '../install'
import { createRichTextExtensions } from '../extensions'
import { isSafeRichTextLink } from '../rich-text-template'
import '../rich-text.scss'

defineOptions({ name: 'DrRichTextControlPanel' })
const { chart } = defineProps<{ chart: DrRichTextConfig }>()
const chartConfig = computed(() => chart)
const revision = ref(0)
const editorBody = ref<HTMLElement>()
const toolbarZIndex = useZIndex().nextZIndex()
const toolbarContainer = () => document.body
const toolbar = ref<InstanceType<typeof BubbleMenu>>()
const toolbarKey = new PluginKey('richTextToolbar')
const horizontalOptions = [
  { value: 'left', label: '左对齐', path: 'M4 5h16M4 10h10M4 15h16M4 20h10' },
  { value: 'center', label: '水平居中', path: 'M4 5h16M7 10h10M4 15h16M7 20h10' },
  { value: 'right', label: '右对齐', path: 'M4 5h16M10 10h10M4 15h16M10 20h10' },
] as const
const verticalOptions = [
  { value: 'top', label: '顶部对齐', path: 'M3 4h18M8 8v12M16 8v8M6 10l2-2 2 2M14 10l2-2 2 2' },
  { value: 'center', label: '垂直居中', path: 'M3 12h18M8 3v6M6 7l2 2 2-2M16 21v-6M14 17l2-2 2 2' },
  { value: 'bottom', label: '底部对齐', path: 'M3 20h18M8 4v12M16 8v8M6 14l2 2 2-2M14 14l2 2 2-2' },
] as const
const linkVisible = ref(false)
const linkUrl = ref('')
const editor = useEditor({
  extensions: createRichTextExtensions(),
  content: chart.props.content,
  editorProps: { attributes: { class: 'dr-rich-text-content', 'aria-label': '富文本编辑区' } },
  onUpdate: ({ editor }) => { chartConfig.value.props.content = editor.getJSON() },
  onTransaction: () => { revision.value++ },
})
let selecting = false
let selectionFrame = 0
const shouldShowToolbar = () => {
  const instance = editor.value
  if (!instance || instance.isDestroyed || selecting || !instance.isEditable) return false
  const { from, to, empty } = instance.state.selection
  const menu = toolbar.value?.$el as HTMLElement | undefined
  return !empty && !!instance.state.doc.textBetween(from, to).length
    && (instance.isFocused || !!menu?.contains(document.activeElement))
}
const beginSelection = (event: PointerEvent) => {
  if (event.button !== 0 || !(event.target instanceof Node) || !editorBody.value?.contains(event.target)) return
  cancelAnimationFrame(selectionFrame)
  selecting = true
  editor.value?.commands.setMeta(toolbarKey, 'hide')
}
const finishSelection = () => {
  if (!selecting) return
  // 等浏览器和 ProseMirror 同步最终选区后再显示，拖选途中始终隐藏。
  selectionFrame = requestAnimationFrame(() => {
    selecting = false
    if (!shouldShowToolbar()) return
    editor.value?.commands.setMeta(toolbarKey, 'show')
    editor.value?.commands.setMeta(toolbarKey, 'updatePosition')
  })
}
const cancelSelection = () => {
  cancelAnimationFrame(selectionFrame)
  selecting = false
  editor.value?.commands.setMeta(toolbarKey, 'hide')
}
useEventListener(document, 'pointerdown', beginSelection, { capture: true })
useEventListener(document, 'pointerup', finishSelection)
useEventListener(document, 'pointercancel', cancelSelection)
useEventListener(window, 'blur', cancelSelection)
// 将工具条和其颜色弹层视作同一个编辑区域，外部点击或键盘移焦时收起。
const dismissToolbarOutside = (event: Event) => {
  const target = event.target
  const menu = toolbar.value?.$el as HTMLElement | undefined
  if (!(target instanceof Node) || !menu || linkVisible.value) return
  if (editorBody.value?.contains(target) || menu.contains(target)) return
  const popupTriggers = menu.querySelectorAll('[aria-controls]')
  for (const trigger of popupTriggers) {
    const ids = trigger.getAttribute('aria-controls')?.split(/\s+/) ?? []
    if (ids.some(id => document.getElementById(id)?.contains(target))) return
  }
  editor.value?.commands.setMeta(toolbarKey, 'hide')
}
useEventListener(document, 'pointerdown', dismissToolbarOutside)
useEventListener(document, 'focusin', dismissToolbarOutside)
// 支持组件切换、撤销/重做及外部配置更新，不在输入时重置光标。
watch(() => chart.props.content, (content) => {
  if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(content)) {
    editor.value.commands.setContent(content, { emitUpdate: false })
  }
}, { deep: true })
watch(() => chart.id, () => {
  cancelSelection()
  linkVisible.value = false
  editor.value?.commands.setContent(chart.props.content, { emitUpdate: false })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(selectionFrame)
  editor.value?.destroy()
})
const current = computed(() => {
  void revision.value
  const instance = editor.value
  const attributes = instance?.getAttributes('textStyle') || {}
  return {
    bold: instance?.isActive('bold'), italic: instance?.isActive('italic'),
    underline: instance?.isActive('underline'), link: instance?.isActive('link'),
    fontSize: attributes.fontSize ? Number.parseFloat(attributes.fontSize) : 14,
    color: attributes.color || chart.props.color || '',
    lineHeight: chart.props.lineHeight ?? 1.6,
  }
})
const setFontSize = (size: number | undefined) => {
  if (size && Number.isFinite(size)) editor.value?.chain().focus().setFontSize(`${size}px`).run()
}
const setColor = (color: string | null) => {
  if (color) editor.value?.chain().focus().setColor(color).run()
  else editor.value?.chain().focus().unsetColor().run()
}
const lineHeightOptions = [
  { label: '单倍', value: 1 },
  { label: '1.15 倍', value: 1.15 },
  { label: '1.5 倍', value: 1.5 },
  { label: '1.6 倍', value: 1.6 },
  { label: '2 倍', value: 2 },
]
const setLineHeight = (value: number | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) chartConfig.value.props.lineHeight = value
}
const showLink = () => {
  linkUrl.value = editor.value?.getAttributes('link').href || ''
  linkVisible.value = true
}
const applyLink = () => {
  const href = linkUrl.value.trim()
  if (href && !isSafeRichTextLink(href)) {
    ElMessage.warning('请输入 http(s)、mailto、tel、以 / 开头的相对链接或 # 锚点')
    return
  }
  const chain = editor.value?.chain().focus().extendMarkRange('link')
  if (href) chain?.setLink({ href }).run()
  else chain?.unsetLink().run()
  linkVisible.value = false
}
</script>

<template>
  <div class="dr-rich-text-panel">
    <div class="rich-editor">
      <BubbleMenu
        v-if="editor && editorBody"
        ref="toolbar"
        :plugin-key="toolbarKey"
        :editor="editor"
        :append-to="toolbarContainer"
        :update-delay="0"
        :should-show="shouldShowToolbar"
        :options="{ strategy: 'fixed', placement: 'top', offset: 8, shift: { padding: 8 }, flip: true, scrollTarget: editorBody }"
        class="rich-toolbar"
        :style="{ zIndex: toolbarZIndex }"
        role="toolbar"
        aria-label="选中文字格式"
      >
        <button type="button" title="加粗" aria-label="加粗" :aria-pressed="!!current.bold" :class="{ active: current.bold }" @mousedown.prevent @click="editor?.chain().focus().toggleBold().run()"><strong>B</strong></button>
        <button type="button" title="倾斜" aria-label="倾斜" :aria-pressed="!!current.italic" :class="{ active: current.italic }" @mousedown.prevent @click="editor?.chain().focus().toggleItalic().run()"><em>I</em></button>
        <button type="button" title="下划线" aria-label="下划线" :aria-pressed="!!current.underline" :class="{ active: current.underline }" @mousedown.prevent @click="editor?.chain().focus().toggleUnderline().run()"><u>U</u></button>
        <button type="button" title="超链接" aria-label="超链接" :class="{ active: current.link }" @mousedown.prevent @click="showLink"><el-icon><Link /></el-icon></button>
        <el-popover placement="bottom" :width="180" trigger="click" :teleported="false">
          <template #reference>
            <button type="button" :title="`行间距：${current.lineHeight} 倍`" aria-label="行间距" @mousedown.prevent>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 3v18M2 6l3-3 3 3M2 18l3 3 3-3M12 5h10M12 12h10M12 19h10" />
              </svg>
            </button>
          </template>
          <div class="line-height-options">
            <button v-for="option in lineHeightOptions" :key="option.value" type="button" :class="{ active: current.lineHeight === option.value }" :aria-pressed="current.lineHeight === option.value" @mousedown.prevent @click="setLineHeight(option.value)">{{ option.label }}</button>
            <el-input-number class="line-height-options__input" :model-value="current.lineHeight" :min="0.5" :max="5" :step="0.1" :precision="2" size="small" controls-position="right" aria-label="自定义行间距倍数" @change="setLineHeight" />
          </div>
        </el-popover>
        <div class="text-style-controls">
          <DrNumberField :model-value="current.fontSize" :min="8" :max="200" :step="1" controls-position="right" aria-label="字体大小" @change="setFontSize">
            <template #suffix>px</template>
          </DrNumberField>
          <DrColorField :model-value="current.color" show-alpha aria-label="字体颜色" @change="setColor" />
        </div>
      </BubbleMenu>
      <div ref="editorBody" class="rich-editor__body" :style="{ textAlign: chart.props.align, '--dr-rich-text-line-height': current.lineHeight }">
        <EditorContent :editor="editor" />
      </div>
    </div>
    <el-form label-width="72px" label-position="left" class="alignment-form">
      <el-form-item class="config-panel-text" label="水平对齐">
        <template #label><span class="dr-config-panel__field-label">水平对齐</span></template>
        <div class="alignment-options" role="group" aria-label="水平对齐">
          <button v-for="option in horizontalOptions" :key="option.value" type="button" :title="option.label" :aria-label="option.label" :aria-pressed="chart.props.align === option.value" :class="{ active: chart.props.align === option.value }" @click="chartConfig.props.align = option.value">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="option.path" /></svg>
          </button>
        </div>
      </el-form-item>
      <el-form-item class="config-panel-text" label="垂直对齐">
        <template #label><span class="dr-config-panel__field-label">垂直对齐</span></template>
        <div class="alignment-options" role="group" aria-label="垂直对齐">
          <button v-for="option in verticalOptions" :key="option.value" type="button" :title="option.label" :aria-label="option.label" :aria-pressed="chart.props.verticalAlign === option.value" :class="{ active: chart.props.verticalAlign === option.value }" @click="chartConfig.props.verticalAlign = option.value">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path :d="option.path" /></svg>
          </button>
        </div>
      </el-form-item>
    </el-form>
    <div class="dataset-help">
      在“数据”页签绑定数据集后，直接输入 <code>#{字段key}</code>，无需字段映射。数组取第一行；缺失字段保留占位符，空值显示为空。请选中整个占位符设置样式，替换值继承占位符起始位置的格式。
    </div>
    <el-dialog v-model="linkVisible" title="设置超链接" width="420px" append-to-body :close-on-click-modal="false">
      <el-input v-model="linkUrl" placeholder="https://example.com，留空可移除链接" aria-label="链接地址" @keyup.enter="applyLink" />
      <template #footer>
        <el-button @click="linkVisible = false">取消</el-button>
        <el-button type="primary" @click="applyLink">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dr-rich-text-panel { min-width: 0; padding: 0; }
.rich-editor { border: 1px solid var(--el-border-color); border-radius: 4px; overflow: hidden; }
.rich-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px;
  width: 260px; max-width: calc(100vw - 16px); box-sizing: border-box;
  background: var(--el-bg-color-overlay); border: 1px solid var(--el-border-color-darker);
  border-radius: var(--el-border-radius-base); box-shadow: var(--el-box-shadow-light);
  button {
    display: inline-flex; align-items: center; justify-content: center;
    height: 30px; min-width: 30px; padding: 0 6px; background: none;
    border: 0; border-radius: 3px; color: var(--el-text-color-primary); cursor: pointer;
    &:hover, &.active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
}
.line-height-options {
  display: flex; flex-direction: column; gap: 4px;
  button {
    height: 30px; padding: 0 8px; text-align: left; border: 0; border-radius: 3px;
    color: var(--el-text-color-primary); background: none; cursor: pointer;
    &:hover, &.active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
  .line-height-options__input { width: 100%; margin-top: 4px; }
}
.text-style-controls {
  display: grid; grid-template-columns: 88px minmax(0, 1fr); gap: 6px; width: 100%;
}
.rich-editor__body {
  min-height: 200px; max-height: 360px; overflow: auto; background: var(--el-bg-color);
  :deep(.dr-rich-text-content) { min-height: 200px; padding: 10px; box-sizing: border-box; }
}
.alignment-form { margin-top: 14px; }
.alignment-options {
  display: flex; align-items: center; gap: 12px;
  button {
    display: inline-flex; align-items: center; justify-content: center;
    width: 30px; height: 30px; padding: 0; border: 0;
    border-radius: var(--el-border-radius-base); background: none;
    color: var(--el-text-color-regular); cursor: pointer;
    &:hover, &.active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
    &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
  }
}
.dataset-help { font-size: 12px; line-height: 1.7; color: var(--el-text-color-secondary); }
.dataset-help code { color: var(--el-color-primary); overflow-wrap: anywhere; }
</style>
