<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrBorderControlPanel',
})
</script>

<script setup lang="ts">
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrTypePreviewPicker from '@/dataRoom/designer/components/DrTypePreviewPicker.vue'
import DrBorder from '../index.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import { computed } from 'vue'
import type { DrBorderConfig } from '../install.ts'
import { borderTypeOptions, isBorderPropSupported, normalizeBorderType } from '../options.ts'

const { chart } = defineProps<{
  chart: DrBorderConfig
}>()

const chartConfig = computed(() => chart)
const currentBorderType = computed(() => normalizeBorderType(chartConfig.value.props.borderType))

const addColor = () => {
  const colors = chartConfig.value.props.colors
  const lastColor = colors[colors.length - 1]
  const themeColor = getComputedStyle(document.documentElement).getPropertyValue('--el-color-primary').trim()
  const nextColor = lastColor || themeColor
  if (nextColor) {
    colors.push(nextColor)
  }
}

const removeColor = (index: number) => {
  chartConfig.value.props.colors.splice(index, 1)
}
</script>

<template>
  <div class="dr-config-panel dr-border-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="边框类型" name="type">
          <el-form-item label-width="0">
            <DrTypePreviewPicker v-model="chartConfig.props.borderType" :options="borderTypeOptions" class="dr-config-panel__control">
              <template #preview="{ value }">
                <DrBorder :chart="{ ...chartConfig, id: `${chartConfig.id}-preview-${value}`, props: { ...chartConfig.props, borderType: value, titleWidth: 180 } }" />
              </template>
            </DrTypePreviewPicker>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-border-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-border-config-panel__color-row">
                <DrColorField v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button class="config-panel-text" text size="small" aria-label="删除颜色" title="删除颜色" :icon="'Delete'" @click="removeColor(index)" />
              </div>
              <el-empty class="config-panel-text" v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button class="config-panel-text" plain @click="addColor">添加颜色</el-button>
            </div>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="背景配置" name="background">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'reverse')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'dur')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">时长</span>
                  <DrNumberField v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'title')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">标题</span>
                  <DrInputField v-model="chartConfig.props.title" class="dr-config-panel__control" placeholder="请输入标题" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'titleWidth')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">标题宽度</span>
                  <DrNumberField v-model="chartConfig.props.titleWidth" class="dr-config-panel__control" :min="80" :max="800" :step="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'animate')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">动画</span>
                  <el-switch v-model="chartConfig.props.animate" />
                </div>
              </el-form-item>
              <el-empty
                class="config-panel-text"
                v-if="
                  !isBorderPropSupported(currentBorderType, 'reverse') &&
                  !isBorderPropSupported(currentBorderType, 'dur') &&
                  !isBorderPropSupported(currentBorderType, 'title') &&
                  !isBorderPropSupported(currentBorderType, 'titleWidth') &&
                  !isBorderPropSupported(currentBorderType, 'animate')
                "
                description="当前类型无专属配置"
                :image-size="48"
              />
            </el-form>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-border-config-panel {
  padding: 0;
}

.dr-border-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-border-config-panel__colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dr-border-config-panel__color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
