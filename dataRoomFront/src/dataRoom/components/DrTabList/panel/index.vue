<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrTabListControlPanel',
})
</script>
<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">默认项</span>
                  <DrNumberField
                    v-model="chartConfig.props.basic.defaultIndex"
                    class="dr-config-panel__control"
                    :min="0"
                    :max="chartConfig.props.options.staticTabs.length - 1"
                    :step="1"
                    controls-position="right"
                  />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">禁用</span>
                  <el-switch v-model="chartConfig.props.basic.disabled" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局配置" name="layout">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="排列" paired variant="equal">
                <template #first>
                  <DrSelectField v-model="chartConfig.props.layout.direction" class="dr-config-panel__control" aria-label="标签排列方向">
                    <el-option label="水平" value="horizontal" />
                    <el-option label="垂直" value="vertical" />
                  </DrSelectField>
                </template>
                <template #second>
                  <DrSelectField v-model="chartConfig.props.layout.align" class="dr-config-panel__control" aria-label="标签对齐方式">
                    <el-option label="起始" value="start" />
                    <el-option label="居中" value="center" />
                    <el-option label="末尾" value="end" />
                    <el-option label="拉伸" value="stretch" />
                  </DrSelectField>
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标签样式" name="tabStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.tabStyle.fontSize" class="dr-config-panel__control" :min="12" :max="40" :step="1" controls-position="right" aria-label="标签字号">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.tabStyle.color" show-alpha aria-label="标签文字颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中色</span>
                  <DrColorField v-model="chartConfig.props.tabStyle.activeColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>容器</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.tabStyle.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中背景</span>
                  <DrColorField v-model="chartConfig.props.tabStyle.activeBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.tabStyle.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间距</span>
                  <DrNumberField v-model="chartConfig.props.tabStyle.gap" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">高度</span>
                  <DrNumberField v-model="chartConfig.props.tabStyle.height" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="底部边框" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">底部边框</span></template>
              <el-switch v-model="chartConfig.props.tabStyle.borderBottom.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.tabStyle.borderBottom.width" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" aria-label="底部边框宽度">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.tabStyle.borderBottom.color" show-alpha aria-label="底部边框颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="指示器" name="indicator">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>启用</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">显示</span>
                  <el-switch v-model="chartConfig.props.indicator.show" />
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.indicator.height" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" aria-label="指示器粗细">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.indicator.color" show-alpha aria-label="指示器颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.indicator.borderRadius" class="dr-config-panel__control" :min="0" :max="10" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标签配置" name="options">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">标签列表</span>
                  <div class="dr-config-panel__stack">
                    <div v-for="(tab, index) in chartConfig.props.options.staticTabs" :key="index" class="dr-config-panel__inline">
                      <DrInputField v-model="tab.label" placeholder="标签名" />
                      <DrInputField v-model="tab.value" placeholder="标签值" />
                      <el-button class="config-panel-text" type="danger" :icon="'Delete'" circle @click="removeStaticTab(index)" />
                    </div>
                    <el-button class="dr-tab-list-config-panel__add-button config-panel-text" type="primary" @click="addStaticTab">添加标签</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="全局变量" name="globalVar">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">变量名</span>
                  <DrInputField v-model="chartConfig.props.globalVar.globalVarName" class="dr-config-panel__control" placeholder="输入全局变量名称" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-tab-list-config-panel {
  padding: 0;
}

.dr-tab-list-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-tab-list-config-panel__add-button {
  width: 100%;
  margin-top: 8px;
}
</style>
