<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrBorderControlPanel',
})
</script>

<script setup lang="ts">
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

const clearColors = () => {
  chartConfig.value.props.colors.splice(0, chartConfig.value.props.colors.length)
}
</script>

<template>
  <div class="dr-config-panel dr-border-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="边框类型" name="type">
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.borderType" class="dr-config-panel__control">
              <el-option v-for="item in borderTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色列表</span>
              <el-button size="small" @click="addColor">添加</el-button>
            </div>
            <div class="dr-border-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-border-config-panel__color-row">
                <el-color-picker v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button size="small" @click="removeColor(index)">删除</el-button>
              </div>
              <el-empty v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button v-else size="small" @click="clearColors">清空颜色</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="背景配置" name="background">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>背景</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>当前类型</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'reverse')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'dur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'title')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">标题</span>
                  <el-input v-model="chartConfig.props.title" class="dr-config-panel__control" placeholder="请输入标题" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'titleWidth')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">标题宽度</span>
                  <el-input-number v-model="chartConfig.props.titleWidth" class="dr-config-panel__control" :min="80" :max="800" :step="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isBorderPropSupported(currentBorderType, 'animate')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">动画</span>
                  <el-switch v-model="chartConfig.props.animate" />
                </div>
              </el-form-item>
              <el-empty
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
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

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
