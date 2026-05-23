<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrTabListConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrTabListConfig
}>()
const chartConfig = computed(() => chart)

const addStaticTab = () => {
  const tabs = chartConfig.value.props.options.staticTabs
  const index = tabs.length + 1
  tabs.push({ label: `标签${index}`, value: `tab${index}` })
}

const removeStaticTab = (index: number) => {
  if (chartConfig.value.props.options.staticTabs.length > 1) {
    chartConfig.value.props.options.staticTabs.splice(index, 1)
  }
}
</script>
<template>
  <div class="dr-config-panel dr-tab-list-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>默认状态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认项</span>
                  <el-input-number v-model="chartConfig.props.basic.defaultIndex" class="dr-config-panel__control" :min="0" :max="chartConfig.props.options.staticTabs.length - 1" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">禁用</span>
                  <el-switch v-model="chartConfig.props.basic.disabled" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局配置" name="layout">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>排列</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">方向</span>
                  <el-select v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
                    <el-option label="水平" value="horizontal" />
                    <el-option label="垂直" value="vertical" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">对齐</span>
                  <el-select v-model="chartConfig.props.layout.align" class="dr-config-panel__control">
                    <el-option label="起始" value="start" />
                    <el-option label="居中" value="center" />
                    <el-option label="末尾" value="end" />
                    <el-option label="拉伸" value="stretch" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="标签样式" name="tabStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.tabStyle.fontSize" class="dr-config-panel__control" :min="12" :max="40" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本色</span>
                  <el-color-picker v-model="chartConfig.props.tabStyle.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中色</span>
                  <el-color-picker v-model="chartConfig.props.tabStyle.activeColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>容器</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.tabStyle.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中背景</span>
                  <el-color-picker v-model="chartConfig.props.tabStyle.activeBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.tabStyle.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">间距</span>
                  <el-input-number v-model="chartConfig.props.tabStyle.gap" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">高度</span>
                  <el-input-number v-model="chartConfig.props.tabStyle.height" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>底部边框</span>
              <el-switch v-model="chartConfig.props.tabStyle.borderBottom.show" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.tabStyle.borderBottom.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.tabStyle.borderBottom.width" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="指示器" name="indicator">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">显示</span>
                  <el-switch v-model="chartConfig.props.indicator.show" />
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.indicator.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">粗细</span>
                  <el-input-number v-model="chartConfig.props.indicator.height" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.indicator.borderRadius" class="dr-config-panel__control" :min="0" :max="10" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="标签配置" name="options">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>标签列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">标签列表</span>
                  <div class="dr-config-panel__stack">
                    <div v-for="(tab, index) in chartConfig.props.options.staticTabs" :key="index" class="dr-config-panel__inline">
                      <el-input v-model="tab.label" placeholder="标签名" />
                      <el-input v-model="tab.value" placeholder="标签值" />
                      <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeStaticTab(index)" />
                    </div>
                    <el-button class="dr-tab-list-config-panel__add-button" type="primary" size="small" @click="addStaticTab">添加标签</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="全局变量" name="globalVar">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>变量绑定</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">变量名</span>
                  <el-input v-model="chartConfig.props.globalVar.globalVarName" class="dr-config-panel__control" placeholder="输入全局变量名称" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-tab-list-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-tab-list-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-tab-list-config-panel__add-button {
  width: 100%;
  margin-top: var(--space-2);
}
</style>
