<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrIframeControlPanel',
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="基础配置" name="basic">
          <el-form-item label="页面地址">
            <DrInputField v-model="chartConfig.props.basic.url" placeholder="请输入 URL 地址" clearable>
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </DrInputField>
          </el-form-item>
          <el-form-item label="滚动条">
            <DrSelectField v-model="chartConfig.props.basic.scrolling">
              <el-option v-for="item in scrollingOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="原生边框">
            <el-switch v-model="chartConfig.props.basic.frameBorder" />
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="自动刷新" name="autoRefresh">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.autoRefresh.enabled" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间隔</span>
                  <DrNumberField v-model="chartConfig.props.autoRefresh.interval" class="dr-config-panel__control" :min="5" :max="3600" :step="5" controls-position="right" aria-label="自动刷新间隔">
                    <template #suffix>秒</template>
                  </DrNumberField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="样式配置" name="style">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>容器样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.style.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="边框" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">边框</span></template>
              <el-switch v-model="chartConfig.props.style.border.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.style.border.width" class="dr-config-panel__control" :min="1" :max="20" :step="1" controls-position="right" aria-label="边框宽度">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.style.border.color" show-alpha aria-label="边框颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrSelectField v-model="chartConfig.props.style.border.style" class="dr-config-panel__control">
                    <el-option v-for="item in borderStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="安全沙箱" name="sandbox">
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
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-iframe-config-panel {
  padding: 0;
}

.dr-iframe-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
