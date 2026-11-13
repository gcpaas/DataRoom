<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrGaugeControlPanel',
})
</script>
<script setup lang="ts">
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import type { DrGaugeConfig, DrGaugePropsInterface } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrGaugeConfig
}>()
const chartConfig = computed(() => chart)
type GaugeColorSegment = DrGaugePropsInterface['axisLine']['colors'][number]
const axisLineColors = computed(() => chartConfig.value.props.axisLine.colors)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  { label: '正常 (400)', value: 'normal' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '细 (300)', value: 300 },
  { label: '中等 (500)', value: 500 },
  { label: '较粗 (800)', value: 800 },
]

/** 缓动函数选项 */
const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]

/** 指针形状选项 */
const pointerTypeOptions = [
  { label: '默认', value: 'default' },
  { label: '箭头', value: 'arrow' },
  { label: '三角', value: 'triangle' },
  { label: '矩形', value: 'rect' },
]

/** 数值格式化选项 */
const formatOptions = [
  { label: '原始值', value: 'value' },
  { label: '百分比', value: 'percent' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
]

/**
 * 更新轴线颜色中的位置值
 */
const updateColorPosition = (index: number, position: number | undefined) => {
  const colorSegment = axisLineColors.value[index]
  if (colorSegment && position !== undefined) {
    colorSegment[0] = position
  }
}

/**
 * 更新轴线颜色中的颜色值
 */
const updateColorValue = (index: number, color: string | null) => {
  const colorSegment = axisLineColors.value[index]
  if (colorSegment && color) {
    colorSegment[1] = color
  }
}

/**
 * 添加轴线颜色段
 */
const addColorSegment = () => {
  const colors = axisLineColors.value
  const lastPos = colors[colors.length - 1]?.[0] ?? 0
  const newPos = Math.min(lastPos + 0.2, 1)
  const fallbackColor = colors[0]?.[1] || ''
  const colorSegment: GaugeColorSegment = [newPos, fallbackColor]
  axisLineColors.value.push(colorSegment)
}

/**
 * 删除轴线颜色段
 */
const removeColorSegment = (index: number) => {
  if (chartConfig.value.props.axisLine.colors.length > 1) {
    chartConfig.value.props.axisLine.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-gauge-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="仪表盘基础" name="gauge">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>数值范围</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="角度范围" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.gauge.startAngle" class="dr-config-panel__control" :min="0" :max="360" controls-position="right" label="起" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.gauge.endAngle" class="dr-config-panel__control" :min="-360" :max="360" controls-position="right" label="止" /></template>
              </DrFieldRow>
              <DrFieldRow label="数值范围" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.gauge.min" class="dr-config-panel__control" controls-position="right" label="最小" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.gauge.max" class="dr-config-panel__control" controls-position="right" label="最大" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">分割段数</span>
                  <DrNumberField v-model="chartConfig.props.gauge.splitNumber" class="dr-config-panel__control" :min="1" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">顺时针</span>
                  <el-switch v-model="chartConfig.props.gauge.clockwise" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>布局</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">半径</span>
                  <DrInputField v-model="chartConfig.props.gauge.radius" class="dr-config-panel__control" placeholder="如 75%" />
                </div>
              </el-form-item>
              <DrFieldRow label="中心" paired variant="equal">
                <template #first><DrInputField v-model="chartConfig.props.gauge.center[0]" class="dr-config-panel__control" placeholder="如 50%" aria-label="中心 X"><template #prefix>X</template></DrInputField></template>
                <template #second><DrInputField v-model="chartConfig.props.gauge.center[1]" class="dr-config-panel__control" placeholder="如 55%" aria-label="中心 Y"><template #prefix>Y</template></DrInputField></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="轴线" name="axisLine">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.axisLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">宽度</span>
                  <DrNumberField v-model="chartConfig.props.axisLine.width" class="dr-config-panel__control" :min="1" :max="60" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角端点</span>
                  <el-switch v-model="chartConfig.props.axisLine.roundCap" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>渐变色段</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">色段</span>
                  <div class="dr-config-panel__color-list">
                    <div v-for="(segment, index) in chartConfig.props.axisLine.colors" :key="index" class="dr-config-panel__inline">
                      <DrNumberField
                        :model-value="segment[0]"
                        class="dr-config-panel__control"
                        :min="0"
                        :max="1"
                        :step="0.1"
                        :precision="2"
                        controls-position="right"
                        @update:model-value="(val: number | undefined) => updateColorPosition(index, val)"
                      />
                      <DrColorField :model-value="segment[1]" show-alpha @update:model-value="(val: string | null) => updateColorValue(index, val || segment[1])" />
                      <el-button class="config-panel-text" text size="small" aria-label="删除色段" title="删除色段" :icon="'Delete'" :disabled="chartConfig.props.axisLine.colors.length <= 1" @click="removeColorSegment(index)" />
                    </div>
                    <el-button class="config-panel-text" plain @click="addColorSegment">添加色段</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="刻度线" name="axisTick">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.axisTick.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">段内刻度数</span>
                  <DrNumberField v-model="chartConfig.props.axisTick.splitNumber" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">长度</span>
                  <DrNumberField v-model="chartConfig.props.axisTick.length" class="dr-config-panel__control" :min="1" :max="30" controls-position="right" />
                </div>
              </el-form-item>
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.axisTick.width" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" label="宽" /></template>
                <template #second><DrInputField v-model="chartConfig.props.axisTick.color" class="dr-config-panel__control" placeholder="auto 表示跟随轴线" aria-label="刻度线颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="分割线" name="splitLine">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.splitLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">长度</span>
                  <DrNumberField v-model="chartConfig.props.splitLine.length" class="dr-config-panel__control" :min="1" :max="40" controls-position="right" />
                </div>
              </el-form-item>
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.splitLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrInputField v-model="chartConfig.props.splitLine.color" class="dr-config-panel__control" placeholder="auto 表示跟随轴线" aria-label="分割线颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="刻度标签" name="axisLabel">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.axisLabel.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" label="字" aria-label="刻度标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.axisLabel.color" show-alpha aria-label="刻度标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">距离</span>
                  <DrNumberField v-model="chartConfig.props.axisLabel.distance" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式化</span>
                  <DrInputField v-model="chartConfig.props.axisLabel.formatter" class="dr-config-panel__control" placeholder="{value}" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="指针" name="pointer">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.pointer.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">长度</span>
                  <DrInputField v-model="chartConfig.props.pointer.length" class="dr-config-panel__control" placeholder="如 60%" />
                </div>
              </el-form-item>
              <DrFieldRow label="指针" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.pointer.width" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" label="宽" /></template>
                <template #second><DrInputField v-model="chartConfig.props.pointer.color" class="dr-config-panel__control" placeholder="auto 表示跟随轴线" aria-label="指针颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">形状</span>
                  <DrSelectField v-model="chartConfig.props.pointer.type" class="dr-config-panel__control">
                    <el-option v-for="item in pointerTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="锚点" name="anchor">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.anchor.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="锚点" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.anchor.size" class="dr-config-panel__control" :min="0" :max="30" controls-position="right" label="大小" /></template>
                <template #second><DrColorField v-model="chartConfig.props.anchor.color" show-alpha aria-label="锚点颜色" /></template>
              </DrFieldRow>
              <DrFieldRow label="边框" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.anchor.borderWidth" class="dr-config-panel__control" :min="0" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.anchor.borderColor" show-alpha aria-label="锚点边框颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="进度条" name="progress">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.progress.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.progress.width" class="dr-config-panel__control" :min="1" :max="60" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.progress.color" show-alpha aria-label="进度条颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角端点</span>
                  <el-switch v-model="chartConfig.props.progress.roundCap" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="数值显示" name="detail">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.detail.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.detail.fontSize" class="dr-config-panel__control" :min="12" :max="72" controls-position="right" label="字" aria-label="数值字号" /></template>
                <template #second><DrInputField v-model="chartConfig.props.detail.color" class="dr-config-panel__control" placeholder="auto 表示跟随轴线" aria-label="数值颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.detail.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式化</span>
                  <DrSelectField v-model="chartConfig.props.detail.format" class="dr-config-panel__control">
                    <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">纵向偏移</span>
                  <DrNumberField v-model="chartConfig.props.detail.offsetY" class="dr-config-panel__control" :min="-100" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">前缀</span>
                  <DrInputField v-model="chartConfig.props.detail.prefix" class="dr-config-panel__control" placeholder="可选" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">后缀</span>
                  <DrInputField v-model="chartConfig.props.detail.suffix" class="dr-config-panel__control" placeholder="可选" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标题" name="title">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.title.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">文字</span>
                  <DrInputField v-model="chartConfig.props.title.text" class="dr-config-panel__control" placeholder="留空则使用数据集标题字段" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.title.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" label="字" aria-label="标题字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.title.color" show-alpha aria-label="标题颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.title.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">纵向偏移</span>
                  <DrNumberField v-model="chartConfig.props.title.offsetY" class="dr-config-panel__control" :min="-100" :max="100" controls-position="right" />
                </div>
              </el-form-item>
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

.dr-gauge-config-panel {
  padding: 0;
}

.dr-gauge-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
