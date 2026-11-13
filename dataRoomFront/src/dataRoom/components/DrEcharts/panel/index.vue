<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrEchartsControlPanel',
})
</script>
<script setup lang="ts">
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import {computed, ref} from 'vue'
import {Codemirror} from 'vue-codemirror'
import {javascript} from '@codemirror/lang-javascript'
import {eclipse} from '@uiw/codemirror-theme-eclipse'
import beautify from 'js-beautify'
import type {DrEchartsConfig} from '../install.ts'

const {chart} = defineProps<{
  chart: DrEchartsConfig
}>()
const chartConfig = computed(() => chart)

const dialogVisible = ref(false)
const draftOption = ref('')
const optionExtensions = [javascript(), eclipse]

const optionLength = computed(() => chartConfig.value.props.option.length)
const datasetStatus = computed(() => chartConfig.value.dataset?.code ? '已配置' : '未配置')

const openEditor = () => {
  draftOption.value = chartConfig.value.props.option
  dialogVisible.value = true
}

const cancelEditor = () => {
  dialogVisible.value = false
}

const formatOption = () => {
  draftOption.value = beautify.js(draftOption.value, {
    indent_size: 2,
    end_with_newline: true,
  })
}

const applyEditor = () => {
  chartConfig.value.props.option = draftOption.value
  dialogVisible.value = false
}
</script>

<template>
  <div class="dr-config-panel dr-echarts-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="Option 配置" name="option">
          <div class="dr-config-panel__sub-section">
            <el-form-item label-width="0">
              <el-button class="config-panel-text" type="primary" @click="openEditor">编辑 Option</el-button>
            </el-form-item>
            <div class="dr-echarts-config-panel__summary">
              <div class="dr-echarts-config-panel__summary-item">
                <span class="dr-echarts-config-panel__summary-label dr-config-panel__field-label">代码字符数</span>
                <span class="dr-echarts-config-panel__summary-value">{{ optionLength }}</span>
              </div>
              <div class="dr-echarts-config-panel__summary-item">
                <span class="dr-echarts-config-panel__summary-label dr-config-panel__field-label">数据集</span>
                <span class="dr-echarts-config-panel__summary-value">{{ datasetStatus }}</span>
              </div>
            </div>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>

    <el-dialog v-model="dialogVisible" title="编辑 Option" width="80%" :close-on-click-modal="false" append-to-body>
      <div class="dr-echarts-config-panel__editor-layout">
        <div class="dr-echarts-config-panel__editor">
          <Codemirror
            v-model="draftOption"
            :extensions="optionExtensions"
            :indent-with-tab="true"
            :tab-size="2"
            placeholder="请编写 ECharts option 代码，最后 return option 对象"
          />
        </div>
        <div class="dr-echarts-config-panel__help">
          <div class="dr-echarts-config-panel__help-title">帮助说明</div>
          <ul class="dr-echarts-config-panel__help-list">
            <li>代码最后必须 <code>return</code> 一个 ECharts option 对象；官网示例中的 <code>myChart.setOption(option)</code> 改为 <code>return option</code></li>
            <li>通过 <code>ctx.data</code> 获取数据集返回数据（已经过数据处理脚本）</li>
            <li>通过 <code>ctx.chart</code> 获取当前组件配置，<code>ctx.canvasInst</code> 获取画布实例</li>
            <li>已注入 <code>echarts</code> 命名空间，可直接使用 <code>echarts.graphic.LinearGradient</code> 等能力</li>
            <li><code>setInterval</code>、<code>setTimeout</code>、<code>requestAnimationFrame</code> 已自动托管，重新渲染或组件卸载时自动清理</li>
            <li>其他副作用（如 <code>addEventListener</code>）请通过 <code>ctx.onCleanup(() =&gt; { ... })</code> 注册清理函数</li>
            <li>代码执行失败时保留上一次成功渲染的图表，并在控制台输出错误详情</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <el-button @click="cancelEditor">取消</el-button>
        <el-button @click="formatOption">格式化</el-button>
        <el-button type="primary" @click="applyEditor">应用</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">

.dr-echarts-config-panel {
  padding: 0;
}

.dr-echarts-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-echarts-config-panel__summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dr-echarts-config-panel__summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.dr-echarts-config-panel__summary-label {
  flex: 0 0 64px;
  width: 64px;
  line-height: 1.5;
}

.dr-echarts-config-panel__summary-value {
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-feature-settings: "tnum";
  line-height: 1.5;
}

.dr-echarts-config-panel__editor-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  // 为对话框标题、页脚及外边距预留空间，不让代码长度影响内容区高度。
  height: calc(80vh - 220px);
  min-height: 0;
  overflow: hidden;
}

.dr-echarts-config-panel__editor {
  flex: 1 1 auto;
  min-height: 0;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
}

// 编辑器高度占满外层容器，代码超出时滚动条出现在编辑器内部
.dr-echarts-config-panel__editor :deep(.cm-editor) {
  height: 100%;
  font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
  font-size: 13px;
}

.dr-echarts-config-panel__editor :deep(.cm-scroller) {
  overflow: auto;
}

.dr-echarts-config-panel__help {
  flex: 0 0 auto;
  max-height: min(150px, 40%);
  box-sizing: border-box;
  overflow-y: auto;
  overflow-wrap: anywhere;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-fill-color-extra-light);
  color: var(--el-text-color-regular);
}

.dr-echarts-config-panel__help-title {
  margin-bottom: 8px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

.dr-echarts-config-panel__help-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.7;
  letter-spacing: 0;
}
</style>
