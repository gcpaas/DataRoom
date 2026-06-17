<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrDecorationControlPanel',
})
</script>

<script setup lang="ts">
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

const clearColors = () => {
  chartConfig.value.props.colors.splice(0, chartConfig.value.props.colors.length)
}
</script>

<template>
  <div class="dr-config-panel dr-decoration-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="装饰类型" name="type">
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.decorationType" class="dr-config-panel__control">
              <el-option v-for="item in decorationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="颜色配置" name="colors">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色列表</span>
              <el-button size="small" @click="addColor">添加</el-button>
            </div>
            <div class="dr-decoration-config-panel__colors">
              <div v-for="(color, index) in chartConfig.props.colors" :key="index" class="dr-decoration-config-panel__color-row">
                <el-color-picker v-model="chartConfig.props.colors[index]" show-alpha />
                <el-button size="small" @click="removeColor(index)">删除</el-button>
              </div>
              <el-empty v-if="chartConfig.props.colors.length === 0" description="使用默认颜色" :image-size="48" />
              <el-button v-else size="small" @click="clearColors">清空颜色</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="专属配置" name="specific">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>当前类型</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'reverse')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">反向</span>
                  <el-switch v-model="chartConfig.props.reverse" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'dur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.dur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'scanDur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">扫描时长</span>
                  <el-input-number v-model="chartConfig.props.scanDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item v-if="isDecorationPropSupported(currentDecorationType, 'haloDur')" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">光晕时长</span>
                  <el-input-number v-model="chartConfig.props.haloDur" class="dr-config-panel__control" :min="0.1" :max="60" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-empty
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
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

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
