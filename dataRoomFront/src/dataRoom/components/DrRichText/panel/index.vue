<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { Link } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { DrRichTextConfig } from '../install'
import { createRichTextExtensions } from '../extensions'
import { isSafeRichTextLink } from '../rich-text-template'
import '../rich-text.scss'

defineOptions({ name: 'DrRichTextControlPanel' })
const { chart } = defineProps<{ chart: DrRichTextConfig }>()
const revision = ref(0)
const linkVisible = ref(false)
const linkUrl = ref('')
const editor = useEditor({
  extensions: createRichTextExtensions(),
  content: chart.props.content,
  editorProps: { attributes: { class: 'dr-rich-text-content', 'aria-label': '富文本编辑区' } },
  onUpdate: ({ editor }) => { chart.props.content = editor.getJSON() },
  onTransaction: () => { revision.value++ },
})
// 支持组件切换、撤销/重做及外部配置更新，不在输入时重置光标。
watch(() => chart.props.content, (content) => {
  if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(content)) {
    editor.value.commands.setContent(content, { emitUpdate: false })
  }
}, { deep: true })
watch(() => chart.id, () => {
  linkVisible.value = false
  editor.value?.commands.setContent(chart.props.content, { emitUpdate: false })
})
onBeforeUnmount(() => editor.value?.destroy())
const current = computed(() => {
  void revision.value
  const instance = editor.value
  const attributes = instance?.getAttributes('textStyle') || {}
  return {
    bold: instance?.isActive('bold'), italic: instance?.isActive('italic'),
    underline: instance?.isActive('underline'), link: instance?.isActive('link'),
    fontSize: attributes.fontSize ? Number.parseFloat(attributes.fontSize) : 14,
    fontFamily: attributes.fontFamily || 'Microsoft YaHei', color: attributes.color || '#303133',
    lineHeight: chart.props.lineHeight ?? 1.6,
  }
})
const fonts = [
  { label: '微软雅黑', value: 'Microsoft YaHei' }, { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' }, { label: '楷体', value: 'KaiTi' },
  { label: 'Arial', value: 'Arial' }, { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
]
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
  if (typeof value === 'number' && Number.isFinite(value)) chart.props.lineHeight = value
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
      <div class="rich-toolbar" role="toolbar" aria-label="文本格式">
        <button type="button" title="加粗" aria-label="加粗" :aria-pressed="!!current.bold" :class="{ active: current.bold }" @mousedown.prevent @click="editor?.chain().focus().toggleBold().run()"><strong>B</strong></button>
        <button type="button" title="倾斜" aria-label="倾斜" :aria-pressed="!!current.italic" :class="{ active: current.italic }" @mousedown.prevent @click="editor?.chain().focus().toggleItalic().run()"><em>I</em></button>
        <button type="button" title="下划线" aria-label="下划线" :aria-pressed="!!current.underline" :class="{ active: current.underline }" @mousedown.prevent @click="editor?.chain().focus().toggleUnderline().run()"><u>U</u></button>
        <button type="button" title="超链接" aria-label="超链接" :class="{ active: current.link }" @mousedown.prevent @click="showLink"><el-icon><Link /></el-icon></button>
        <el-popover placement="bottom" :width="180" trigger="click">
          <template #reference>
            <button type="button" :title="`行间距：${current.lineHeight} 倍`" aria-label="行间距" @mousedown.prevent>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M5 3v18M2 6l3-3 3 3M2 18l3 3 3-3M12 5h10M12 12h10M12 19h10" />
              </svg>
            </button>
          </template>
          <div class="line-height-options">
            <button v-for="option in lineHeightOptions" :key="option.value" type="button" :class="{ active: current.lineHeight === option.value }" :aria-pressed="current.lineHeight === option.value" @mousedown.prevent @click="setLineHeight(option.value)">{{ option.label }}</button>
            <el-input-number :model-value="current.lineHeight" :min="0.5" :max="5" :step="0.1" :precision="2" size="small" controls-position="right" aria-label="自定义行间距倍数" @change="setLineHeight" />
          </div>
        </el-popover>
        <el-color-picker :model-value="current.color" size="small" show-alpha aria-label="字体颜色" @change="setColor" />
        <div class="font-controls">
          <el-select :model-value="current.fontFamily" size="small" aria-label="字体" @change="(value: string) => editor?.chain().focus().setFontFamily(value).run()">
            <el-option v-for="font in fonts" :key="font.value" :label="font.label" :value="font.value" />
          </el-select>
          <el-input-number :model-value="current.fontSize" :min="8" :max="200" :step="1" size="small" controls-position="right" aria-label="字体大小" @change="setFontSize" />
        </div>
      </div>
      <EditorContent :editor="editor" class="rich-editor__body" :style="{ textAlign: chart.props.align, '--dr-rich-text-line-height': current.lineHeight }" />
    </div>
    <el-form label-width="64px" size="small" label-position="left" class="alignment-form">
      <el-form-item label="水平对齐">
        <el-radio-group v-model="chart.props.align">
          <el-radio-button value="left">左对齐</el-radio-button>
          <el-radio-button value="center">居中</el-radio-button>
          <el-radio-button value="right">右对齐</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="垂直对齐">
        <el-radio-group v-model="chart.props.verticalAlign">
          <el-radio-button value="top">上对齐</el-radio-button>
          <el-radio-button value="center">中对齐</el-radio-button>
          <el-radio-button value="bottom">底对齐</el-radio-button>
        </el-radio-group>
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
.dr-rich-text-panel { min-width: 0; }
.rich-editor { border: 1px solid var(--el-border-color); border-radius: 4px; overflow: hidden; }
.rich-toolbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px;
  background: var(--el-fill-color-light); border-bottom: 1px solid var(--el-border-color);
  button {
    display: inline-flex; align-items: center; justify-content: center;
    height: 30px; min-width: 30px; padding: 0 6px; background: transparent;
    border: 1px solid transparent; border-radius: 3px; color: var(--el-text-color-primary); cursor: pointer;
    &:hover, &.active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); border-color: var(--el-color-primary-light-7); }
  }
}
.line-height-options {
  display: flex; flex-direction: column; gap: 4px;
  button {
    height: 30px; padding: 0 8px; text-align: left; border: 0; border-radius: 3px;
    color: var(--el-text-color-primary); background: transparent; cursor: pointer;
    &:hover, &.active { color: var(--el-color-primary); background: var(--el-color-primary-light-9); }
  }
  .el-input-number { width: 100%; margin-top: 4px; }
}
.font-controls {
  display: flex; gap: 6px; width: 100%; margin-top: 2px;
  .el-select { flex: 1; min-width: 0; }
  .el-input-number { width: 88px; flex-shrink: 0; }
}
.rich-editor__body {
  min-height: 200px; max-height: 360px; overflow: auto; background: var(--el-bg-color);
  :deep(.dr-rich-text-content) { min-height: 200px; padding: 10px; box-sizing: border-box; }
}
.alignment-form { margin-top: 14px; }
.alignment-form :deep(.el-form-item) { min-height: 36px; margin-bottom: 6px; align-items: center; }
.alignment-form :deep(.el-radio-button__inner) { padding: 7px 8px; }
.dataset-help { font-size: 12px; line-height: 1.7; color: var(--el-text-color-secondary); }
.dataset-help code { color: var(--el-color-primary); overflow-wrap: anywhere; }
</style>
