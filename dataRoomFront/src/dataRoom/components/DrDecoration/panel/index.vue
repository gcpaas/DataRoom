<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrDecorationControlPanel',
})
</script>

<script setup lang="ts">
import DrTypePreviewPicker from '@/dataRoom/designer/components/DrTypePreviewPicker.vue'
import DrDecoration from '../index.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import { computed } from 'vue'
import type { DrDecorationConfig } from '../install.ts'
import { decorationTypeOptions, isDecorationPropSupported, normalizeDecorationType } from '../options.ts'

const { chart } = defineProps<{
  chart: DrDecorationConfig
}>()

const chartConfig = computed(() => chart)
const currentDecorationType = computed(() => normalizeDecorationType(chartConfig.value.props.decorationType))

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
  <div class="dr-config-panel dr-decoration-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="装饰类型" name="type">
          <el-form-item label-width="0">
            <DrTypePreviewPicker v-model="chartConfig.props.decorationType" :options="decorationTypeOptions" class="dr-config-panel__control">
              <template #preview="{ value }">
                <DrDecoration :chart="{ ...chartConfig, id: `${chartConfig.id}-preview-${value}`, props: { ...chartConfig.props, decorationType: value } }" />
              </template>
            </DrTypePreviewPicker>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-decoration-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-decoration-config-panel__color-row">
                <DrColorField v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button class="config-panel-text" text size="small" aria-label="删除颜色" title="删除颜色" :icon="'Delete'" @click="removeColor(index)" />
              </div>
              <el-empty class="config-panel-text" v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button class="config-panel-text" plain @click="addColor">添加颜色</el-button>
            </div>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'reverse')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'dur')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">时长</span>
                  <DrNumberField v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'scanDur')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">扫描时长</span>
                  <DrNumberField v-model="chartConfig.props.scanDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'haloDur')" class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">光晕时长</span>
                  <DrNumberField v-model="chartConfig.props.haloDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-empty
                class="config-panel-text"
                v-if="
                  !isDecorationPropSupported(currentDecorationType, 'reverse') &&
                  !isDecorationPropSupported(currentDecorationType, 'dur') &&
                  !isDecorationPropSupported(currentDecorationType, 'scanDur') &&
                  !isDecorationPropSupported(currentDecorationType, 'haloDur')
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

.dr-decoration-config-panel {
  padding: 0;
}

.dr-decoration-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-decoration-config-panel__colors {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dr-decoration-config-panel__color-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
