<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrIframeControlPanel',
})
</script>
<script setup lang="ts">
import type { DrIframeConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrIframeConfig
}>()
const chartConfig = computed(() => chart)

const scrollingOptions = [
  { label: '自动', value: 'auto' },
  { label: '始终显示', value: 'yes' },
  { label: '始终隐藏', value: 'no' },
]

const borderStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]
</script>

<template>
  <div class="dr-config-panel dr-iframe-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <el-form-item label="页面地址">
            <el-input v-model="chartConfig.props.basic.url" placeholder="请输入 URL 地址" clearable>
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="滚动条">
            <el-select v-model="chartConfig.props.basic.scrolling">
              <el-option v-for="item in scrollingOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="原生边框">
            <el-switch v-model="chartConfig.props.basic.frameBorder" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="自动刷新" name="autoRefresh">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.autoRefresh.enabled" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>刷新策略</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">间隔(秒)</span>
                  <el-input-number v-model="chartConfig.props.autoRefresh.interval" class="dr-config-panel__control" :min="5" :max="3600" :step="5" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="样式配置" name="style">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>容器样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>边框</span>
              <el-switch v-model="chartConfig.props.style.border.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.style.border.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.style.border.width" class="dr-config-panel__control" :min="1" :max="20" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">样式</span>
                  <el-select v-model="chartConfig.props.style.border.style" class="dr-config-panel__control">
                    <el-option v-for="item in borderStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
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
          <el-form-item label="允许模态">
            <el-switch v-model="chartConfig.props.sandbox.allowModals" />
          </el-form-item>
          <el-form-item label="允许全屏">
            <el-switch v-model="chartConfig.props.sandbox.allowFullscreen" />
          </el-form-item>
          <el-form-item label="允许摄像头">
            <el-switch v-model="chartConfig.props.sandbox.allowCamera" />
          </el-form-item>
          <el-form-item label="允许麦克风">
            <el-switch v-model="chartConfig.props.sandbox.allowMicrophone" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-iframe-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-iframe-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
