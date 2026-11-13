<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrWordCloudControlPanel',
})
</script>
<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="文字样式" name="wordStyle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>字体</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字体</span>
                  <DrSelectField v-model="chartConfig.props.wordStyle.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.wordStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>字号范围</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="最小 / 最大" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.wordStyle.fontSizeRange[0]" class="dr-config-panel__control" :min="8" :max="100" controls-position="right" aria-label="最小字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.wordStyle.fontSizeRange[1]" class="dr-config-panel__control" :min="8" :max="200" controls-position="right" aria-label="最大字号"><template #suffix>px</template></DrNumberField>
                </template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>旋转角度</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="最小 / 最大" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.wordStyle.rotationRange[0]" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" aria-label="最小角度"><template #suffix>°</template></DrNumberField>
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.wordStyle.rotationRange[1]" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" aria-label="最大角度"><template #suffix>°</template></DrNumberField>
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">角度步长</span>
                  <DrNumberField v-model="chartConfig.props.wordStyle.rotationStep" class="dr-config-panel__control" :min="0" :max="90" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>颜色列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">颜色列表</span>
                  <div class="dr-config-panel__color-list">
                    <div v-for="(color, index) in chartConfig.props.wordStyle.colors" :key="index" class="dr-config-panel__inline">
                      <DrColorField :model-value="color" show-alpha @update:model-value="(val: string | null) => updateColor(index, val || color)" />
                      <el-button class="config-panel-text" text size="small" aria-label="删除颜色" title="删除颜色" :icon="'Delete'" :disabled="chartConfig.props.wordStyle.colors.length <= 1" @click="removeColor(index)" />
                    </div>
                    <el-button class="config-panel-text" plain @click="addColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="词云形状" name="shape">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">形状</span>
                  <DrSelectField v-model="chartConfig.props.shape.type" class="dr-config-panel__control">
                    <el-option v-for="item in shapeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局" name="layout">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">网格大小</span>
                  <DrNumberField v-model="chartConfig.props.layout.gridSize" class="dr-config-panel__control" :min="1" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">超出边界</span>
                  <el-switch v-model="chartConfig.props.layout.drawOutOfBound" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="提示框" name="tooltip">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.tooltip.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">边框色</span>
                  <DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" aria-label="提示框字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="高亮交互" name="emphasis">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文字阴影</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">聚焦模式</span>
                  <DrSelectField v-model="chartConfig.props.emphasis.focus" class="dr-config-panel__control">
                    <el-option v-for="item in focusOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="模糊 / 色" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.emphasis.textStyle.shadowBlur" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" aria-label="阴影模糊"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.emphasis.textStyle.shadowColor" show-alpha aria-label="阴影颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.animation.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">时长</span>
                  <DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right"><template #suffix>ms</template></DrNumberField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">缓动</span>
                  <DrSelectField v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
                    <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="右" /></template>
          </DrFieldRow>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-word-cloud-config-panel {
  padding: 0;
}

.dr-word-cloud-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
