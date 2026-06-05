<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrWordCloudControlPanel',
})
</script>
<script setup lang="ts">
import type { DrWordCloudConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrWordCloudConfig
}>()
const chartConfig = computed(() => chart)

const fontWeightOptions = [
  { label: '正常 (400)', value: 'normal' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '细 (300)', value: '300' },
  { label: '中等 (500)', value: '500' },
  { label: '较粗 (800)', value: '800' },
]

const fontFamilyOptions = [
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '楷体', value: 'KaiTi' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
]

const shapeOptions = [
  { label: '圆形', value: 'circle' },
  { label: '心形', value: 'cardioid' },
  { label: '菱形', value: 'diamond' },
  { label: '三角形(右)', value: 'triangle-forward' },
  { label: '三角形', value: 'triangle' },
  { label: '五边形', value: 'pentagon' },
  { label: '星形', value: 'star' },
]

const focusOptions = [
  { label: '无', value: 'none' },
  { label: '自身', value: 'self' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]

const updateColor = (index: number, color: string) => {
  chartConfig.value.props.wordStyle.colors[index] = color
}

const addColor = () => {
  chartConfig.value.props.wordStyle.colors.push(chartConfig.value.props.wordStyle.colors[0] || '')
}

const removeColor = (index: number) => {
  if (chartConfig.value.props.wordStyle.colors.length > 1) {
    chartConfig.value.props.wordStyle.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-word-cloud-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="文字样式" name="wordStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>字体</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字体</span>
                  <el-select v-model="chartConfig.props.wordStyle.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.wordStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>字号范围</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最小字号</span>
                  <el-input-number v-model="chartConfig.props.wordStyle.fontSizeRange[0]" class="dr-config-panel__control" :min="8" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大字号</span>
                  <el-input-number v-model="chartConfig.props.wordStyle.fontSizeRange[1]" class="dr-config-panel__control" :min="8" :max="200" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>旋转角度</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最小角度</span>
                  <el-input-number v-model="chartConfig.props.wordStyle.rotationRange[0]" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大角度</span>
                  <el-input-number v-model="chartConfig.props.wordStyle.rotationRange[1]" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">角度步长</span>
                  <el-input-number v-model="chartConfig.props.wordStyle.rotationStep" class="dr-config-panel__control" :min="0" :max="90" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">颜色列表</span>
                  <div class="dr-config-panel__color-list">
                    <div v-for="(color, index) in chartConfig.props.wordStyle.colors" :key="index" class="dr-config-panel__inline">
                      <el-color-picker :model-value="color" show-alpha @update:model-value="(val: string) => updateColor(index, val || color)" />
                      <el-button type="danger" :icon="'Delete'" circle size="small" :disabled="chartConfig.props.wordStyle.colors.length <= 1" @click="removeColor(index)" />
                    </div>
                    <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="词云形状" name="shape">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>形状</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">形状</span>
                  <el-select v-model="chartConfig.props.shape.type" class="dr-config-panel__control">
                    <el-option v-for="item in shapeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>排布</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">网格大小</span>
                  <el-input-number v-model="chartConfig.props.layout.gridSize" class="dr-config-panel__control" :min="1" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">超出边界</span>
                  <el-switch v-model="chartConfig.props.layout.drawOutOfBound" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="提示框" name="tooltip">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.tooltip.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.tooltip.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.tooltip.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字色</span>
                  <el-color-picker v-model="chartConfig.props.tooltip.textStyle.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="高亮交互" name="emphasis">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字阴影</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">聚焦模式</span>
                  <el-select v-model="chartConfig.props.emphasis.focus" class="dr-config-panel__control">
                    <el-option v-for="item in focusOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影模糊</span>
                  <el-input-number v-model="chartConfig.props.emphasis.textStyle.shadowBlur" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影颜色</span>
                  <el-color-picker v-model="chartConfig.props.emphasis.textStyle.shadowColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.animation.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长(ms)</span>
                  <el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">缓动</span>
                  <el-select v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
                    <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="全局配置" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>图表边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-for="(label, index) in ['上边距', '右边距', '下边距', '左边距']" :key="label" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">{{ label }}</span>
                  <el-input-number v-model="chartConfig.props.global.padding[index]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" />
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

.dr-word-cloud-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-word-cloud-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
