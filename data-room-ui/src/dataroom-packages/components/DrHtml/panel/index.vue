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
import type { DrHtmlConfig } from '../install.ts'
import { getPlaceholderPaths } from '../html-render.ts'

const { chart } = defineProps<{
  chart: DrHtmlConfig
}>()
const chartConfig = computed(() => chart)

const dialogVisible = ref(false)
const draftHtml = ref('')
const draftCss = ref('')
const htmlExtensions = [html(), eclipse]
const cssExtensions = [css(), eclipse]

const placeholderCount = computed(() => getPlaceholderPaths(chartConfig.value.props.html).length)
const datasetStatus = computed(() => chartConfig.value.dataset?.code ? '已配置' : '未配置')

const openEditor = () => {
  draftHtml.value = chartConfig.value.props.html
  draftCss.value = chartConfig.value.props.css
  dialogVisible.value = true
}

const cancelEditor = () => {
  dialogVisible.value = false
}

const applyEditor = () => {
  chartConfig.value.props.html = draftHtml.value
  chartConfig.value.props.css = draftCss.value
  dialogVisible.value = false
}
</script>

<template>
  <div class="dr-config-panel dr-html-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="内容配置" name="content">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>代码摘要</span>
              <el-button type="primary" size="small" @click="openEditor">编辑代码</el-button>
            </div>
            <div class="dr-html-config-panel__summary">
              <div class="dr-html-config-panel__summary-item">
                <span class="dr-html-config-panel__summary-label">HTML 字符数</span>
                <span class="dr-html-config-panel__summary-value">{{ chartConfig.props.html.length }}</span>
              </div>
              <div class="dr-html-config-panel__summary-item">
                <span class="dr-html-config-panel__summary-label">CSS 字符数</span>
                <span class="dr-html-config-panel__summary-value">{{ chartConfig.props.css.length }}</span>
              </div>
              <div class="dr-html-config-panel__summary-item">
                <span class="dr-html-config-panel__summary-label">占位符数量</span>
                <span class="dr-html-config-panel__summary-value">{{ placeholderCount }}</span>
              </div>
              <div class="dr-html-config-panel__summary-item">
                <span class="dr-html-config-panel__summary-label">数据集</span>
                <span class="dr-html-config-panel__summary-value">{{ datasetStatus }}</span>
              </div>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="安全沙箱" name="sandbox">
          <el-form-item label="允许脚本">
            <el-switch v-model="chartConfig.props.sandbox.allowScripts" />
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
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <el-dialog v-model="dialogVisible" title="编辑 HTML" width="920px" append-to-body>
      <div class="dr-html-config-panel__editor-layout">
        <section class="dr-html-config-panel__editor-section">
          <div class="dr-html-config-panel__editor-title">HTML</div>
          <Codemirror
            v-model="draftHtml"
            class="dr-html-config-panel__editor"
            :extensions="htmlExtensions"
            :indent-with-tab="true"
            :tab-size="2"
          />
        </section>
        <section class="dr-html-config-panel__editor-section">
          <div class="dr-html-config-panel__editor-title">CSS</div>
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
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-html-config-panel__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 12px;
}

.dr-html-config-panel__summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}

.dr-html-config-panel__summary-label {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.5;
}

.dr-html-config-panel__summary-value {
  color: var(--el-text-color-primary);
  font-size: 12px;
  font-feature-settings: "tnum";
  line-height: 1.5;
}

.dr-html-config-panel__editor-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 12px;
  min-height: 420px;
}

.dr-html-config-panel__editor-section {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dr-html-config-panel__editor-title {
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
}

.dr-html-config-panel__editor {
  min-height: 380px;
}

.dr-html-config-panel__editor :deep(.cm-editor) {
  min-height: 380px;
  font-size: 13px;
}

.dr-html-config-panel__editor :deep(.cm-scroller) {
  font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
}
</style>
