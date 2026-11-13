<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrHtmlControlPanel',
})
</script>
<script setup lang="ts">
import { computed, ref } from 'vue'
import { Codemirror } from 'vue-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import beautify from 'js-beautify'
import type { DrHtmlConfig } from '../install.ts'

const { chart } = defineProps<{
  chart: DrHtmlConfig
}>()
const chartConfig = computed(() => chart)

const dialogVisible = ref(false)
const draftHtml = ref('')
const draftCss = ref('')
const htmlExtensions = [html(), eclipse]
const cssExtensions = [css(), eclipse]

const openEditor = () => {
  draftHtml.value = chartConfig.value.props.html
  draftCss.value = chartConfig.value.props.css
  dialogVisible.value = true
}

const cancelEditor = () => {
  dialogVisible.value = false
}

const formatHtml = () => {
  draftHtml.value = beautify.html(draftHtml.value, {
    indent_size: 2,
    end_with_newline: true,
  })
}

const formatCss = () => {
  draftCss.value = beautify.css(draftCss.value, {
    indent_size: 2,
    end_with_newline: true,
  })
}

const applyEditor = () => {
  chartConfig.value.props.html = draftHtml.value
  chartConfig.value.props.css = draftCss.value
  dialogVisible.value = false
}
</script>

<template>
  <div class="dr-config-panel dr-html-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <el-form-item label="HTML">
        <el-button size="small" plain @click="openEditor">编辑</el-button>
      </el-form-item>
      <el-form-item label="允许同源">
        <el-switch v-model="chartConfig.props.sandbox.allowSameOrigin" />
      </el-form-item>
      <el-form-item label="允许表单">
        <el-switch v-model="chartConfig.props.sandbox.allowForms" />
      </el-form-item>
      <el-form-item label="允许弹窗">
        <el-switch v-model="chartConfig.props.sandbox.allowPopups" />
      </el-form-item>
    </el-form>

    <el-dialog v-model="dialogVisible" title="编辑 HTML" width="920px" top="5vh" append-to-body>
      <div class="dr-html-config-panel__editor-layout">
        <section class="dr-html-config-panel__editor-section">
          <div class="dr-html-config-panel__editor-title">
            <span>HTML</span>
            <el-button size="small" @click="formatHtml">格式化</el-button>
          </div>
          <Codemirror
            v-model="draftHtml"
            class="dr-html-config-panel__editor"
            :extensions="htmlExtensions"
            :indent-with-tab="true"
            :tab-size="2"
          />
        </section>
        <section class="dr-html-config-panel__editor-section">
          <div class="dr-html-config-panel__editor-title">
            <span>CSS</span>
            <el-button size="small" @click="formatCss">格式化</el-button>
          </div>
          <Codemirror
            v-model="draftCss"
            class="dr-html-config-panel__editor"
            :extensions="cssExtensions"
            :indent-with-tab="true"
            :tab-size="2"
          />
        </section>
      </div>
      <template #footer>
        <el-button @click="cancelEditor">取消</el-button>
        <el-button type="primary" @click="applyEditor">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

.dr-html-config-panel__editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  height: min(520px, calc(100vh - 260px));
  min-height: 0;
  max-height: calc(100vh - 260px);
  overflow: hidden;
}

.dr-html-config-panel__editor-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}

.dr-html-config-panel__editor-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.dr-html-config-panel__editor {
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.dr-html-config-panel__editor :deep(.cm-editor) {
  height: 100%;
  font-size: 13px;
}

.dr-html-config-panel__editor :deep(.cm-scroller) {
  overflow: auto;
  font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
}
</style>
