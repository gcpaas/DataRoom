<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrGaugeConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrGaugeConfig
}>()
const chartConfig = computed(() => chart)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  {label: '正常 (400)', value: 'normal'},
  {label: '粗体 (700)', value: 'bold'},
  {label: '更粗 (800)', value: 'bolder'},
]

/** 缓动函数选项 */
const easingOptions = [
  {label: '线性', value: 'linear'},
  {label: '平滑减速', value: 'cubicOut'},
  {label: '弹性', value: 'elasticOut'},
  {label: '弹跳', value: 'bounceOut'},
]

/** 指针形状选项 */
const pointerTypeOptions = [
  {label: '默认', value: 'default'},
  {label: '箭头', value: 'arrow'},
  {label: '三角', value: 'triangle'},
  {label: '矩形', value: 'rect'},
]

/** 数值格式化选项 */
const formatOptions = [
  {label: '原始值', value: 'value'},
  {label: '百分比', value: 'percent'},
  {label: '整数', value: 'integer'},
  {label: '一位小数', value: 'float1'},
  {label: '两位小数', value: 'float2'},
]

/**
 * 更新轴线颜色中的位置值
 */
const updateColorPosition = (index: number, position: number) => {
  ;(chartConfig.value as any).props.axisLine.colors[index][0] = position
}

/**
 * 更新轴线颜色中的颜色值
 */
const updateColorValue = (index: number, color: string) => {
  ;(chartConfig.value as any).props.axisLine.colors[index][1] = color
}

/**
 * 添加轴线颜色段
 */
const addColorSegment = () => {
  const colors = (chartConfig.value as any).props.axisLine.colors
  const lastPos = colors.length > 0 ? colors[colors.length - 1][0] : 0
  const newPos = Math.min(lastPos + 0.2, 1)
  ;(chartConfig.value as any).props.axisLine.colors.push([newPos, '#409eff'])
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
  <div class="dr-gauge-panel">
    <el-form :model="chartConfig" label-width="90px" size="small" label-position="left">

      <!-- 全局配置 -->
      <el-collapse>
        <el-collapse-item title="全局配置">
          <el-form-item label="上边距">
            <el-input-number v-model="chartConfig.props.global.padding[0]" :min="0" :max="200" controls-position="right"/>
          </el-form-item>
          <el-form-item label="右边距">
            <el-input-number v-model="chartConfig.props.global.padding[1]" :min="0" :max="200" controls-position="right"/>
          </el-form-item>
          <el-form-item label="下边距">
            <el-input-number v-model="chartConfig.props.global.padding[2]" :min="0" :max="200" controls-position="right"/>
          </el-form-item>
          <el-form-item label="左边距">
            <el-input-number v-model="chartConfig.props.global.padding[3]" :min="0" :max="200" controls-position="right"/>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 仪表盘基础配置 -->
      <el-collapse>
        <el-collapse-item title="仪表盘基础">
          <el-form-item label="起始角度">
            <el-input-number v-model="chartConfig.props.gauge.startAngle" :min="0" :max="360" controls-position="right"/>
          </el-form-item>
          <el-form-item label="结束角度">
            <el-input-number v-model="chartConfig.props.gauge.endAngle" :min="-360" :max="360" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最小值">
            <el-input-number v-model="chartConfig.props.gauge.min" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number v-model="chartConfig.props.gauge.max" controls-position="right"/>
          </el-form-item>
          <el-form-item label="分割段数">
            <el-input-number v-model="chartConfig.props.gauge.splitNumber" :min="1" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="顺时针">
            <el-switch v-model="chartConfig.props.gauge.clockwise"/>
          </el-form-item>
          <el-form-item label="半径">
            <el-input v-model="chartConfig.props.gauge.radius" placeholder="如 75%"/>
          </el-form-item>
          <el-form-item label="中心X">
            <el-input v-model="chartConfig.props.gauge.center[0]" placeholder="如 50%"/>
          </el-form-item>
          <el-form-item label="中心Y">
            <el-input v-model="chartConfig.props.gauge.center[1]" placeholder="如 55%"/>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 轴线配置 -->
      <el-collapse>
        <el-collapse-item title="轴线">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.axisLine.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.axisLine.show">
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.axisLine.width" :min="1" :max="60" controls-position="right"/>
            </el-form-item>
            <el-form-item label="圆角端点">
              <el-switch v-model="chartConfig.props.axisLine.roundCap"/>
            </el-form-item>

            <div class="sub-title">渐变色段</div>
            <div class="color-segment-list">
              <div v-for="(segment, index) in chartConfig.props.axisLine.colors" :key="index" class="color-segment-item">
                <el-input-number
                  :model-value="segment[0]"
                  @update:model-value="(val: number) => updateColorPosition(index, val)"
                  :min="0"
                  :max="1"
                  :step="0.1"
                  :precision="2"
                  controls-position="right"
                  style="width: 100px"
                />
                <el-color-picker
                  :model-value="segment[1]"
                  @update:model-value="(val: string) => updateColorValue(index, val || segment[1])"
                  show-alpha
                />
                <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColorSegment(index)" :disabled="chartConfig.props.axisLine.colors.length <= 1"/>
              </div>
              <el-button type="primary" size="small" @click="addColorSegment">添加色段</el-button>
            </div>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 刻度线配置 -->
      <el-collapse>
        <el-collapse-item title="刻度线">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.axisTick.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.axisTick.show">
            <el-form-item label="段内刻度数">
              <el-input-number v-model="chartConfig.props.axisTick.splitNumber" :min="1" :max="20" controls-position="right"/>
            </el-form-item>
            <el-form-item label="长度">
              <el-input-number v-model="chartConfig.props.axisTick.length" :min="1" :max="30" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="chartConfig.props.axisTick.color" placeholder="auto 表示跟随轴线"/>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.axisTick.width" :min="1" :max="5" controls-position="right"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 分割线配置 -->
      <el-collapse>
        <el-collapse-item title="分割线">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.splitLine.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.splitLine.show">
            <el-form-item label="长度">
              <el-input-number v-model="chartConfig.props.splitLine.length" :min="1" :max="40" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="chartConfig.props.splitLine.color" placeholder="auto 表示跟随轴线"/>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.splitLine.width" :min="1" :max="10" controls-position="right"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 刻度标签配置 -->
      <el-collapse>
        <el-collapse-item title="刻度标签">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.axisLabel.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.axisLabel.show">
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.axisLabel.fontSize" :min="10" :max="30" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.axisLabel.color" show-alpha/>
            </el-form-item>
            <el-form-item label="距离">
              <el-input-number v-model="chartConfig.props.axisLabel.distance" :min="0" :max="60" controls-position="right"/>
            </el-form-item>
            <el-form-item label="格式化">
              <el-input v-model="chartConfig.props.axisLabel.formatter" placeholder="{value}"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 指针配置 -->
      <el-collapse>
        <el-collapse-item title="指针">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.pointer.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.pointer.show">
            <el-form-item label="长度">
              <el-input v-model="chartConfig.props.pointer.length" placeholder="如 60%"/>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.pointer.width" :min="1" :max="20" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="chartConfig.props.pointer.color" placeholder="auto 表示跟随轴线"/>
            </el-form-item>
            <el-form-item label="形状">
              <el-select v-model="chartConfig.props.pointer.type">
                <el-option v-for="item in pointerTypeOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 锚点配置 -->
      <el-collapse>
        <el-collapse-item title="锚点">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.anchor.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.anchor.show">
            <el-form-item label="大小">
              <el-input-number v-model="chartConfig.props.anchor.size" :min="0" :max="30" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.anchor.color" show-alpha/>
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number v-model="chartConfig.props.anchor.borderWidth" :min="0" :max="10" controls-position="right"/>
            </el-form-item>
            <el-form-item label="边框颜色">
              <el-color-picker v-model="chartConfig.props.anchor.borderColor" show-alpha/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 进度条配置 -->
      <el-collapse>
        <el-collapse-item title="进度条">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.progress.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.progress.show">
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.progress.width" :min="1" :max="60" controls-position="right"/>
            </el-form-item>
            <el-form-item label="圆角端点">
              <el-switch v-model="chartConfig.props.progress.roundCap"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.progress.color" show-alpha/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 数值显示配置 -->
      <el-collapse>
        <el-collapse-item title="数值显示">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.detail.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.detail.show">
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.detail.fontSize" :min="12" :max="72" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-input v-model="chartConfig.props.detail.color" placeholder="auto 表示跟随轴线"/>
            </el-form-item>
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.detail.fontWeight">
                <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="格式化">
              <el-select v-model="chartConfig.props.detail.format">
                <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="纵向偏移">
              <el-input-number v-model="chartConfig.props.detail.offsetY" :min="-100" :max="100" controls-position="right"/>
            </el-form-item>
            <el-form-item label="前缀">
              <el-input v-model="chartConfig.props.detail.prefix" placeholder="可选"/>
            </el-form-item>
            <el-form-item label="后缀">
              <el-input v-model="chartConfig.props.detail.suffix" placeholder="可选"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 标题配置 -->
      <el-collapse>
        <el-collapse-item title="标题">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.title.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.title.show">
            <el-form-item label="文字">
              <el-input v-model="chartConfig.props.title.text" placeholder="留空则使用数据集标题字段"/>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.title.fontSize" :min="10" :max="36" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.title.color" show-alpha/>
            </el-form-item>
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.title.fontWeight">
                <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="纵向偏移">
              <el-input-number v-model="chartConfig.props.title.offsetY" :min="-100" :max="100" controls-position="right"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 动画配置 -->
      <el-collapse>
        <el-collapse-item title="动画">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.animation.enabled"/>
          </el-form-item>
          <template v-if="chartConfig.props.animation.enabled">
            <el-form-item label="时长(ms)">
              <el-input-number v-model="chartConfig.props.animation.duration" :min="0" :max="5000" :step="100" controls-position="right"/>
            </el-form-item>
            <el-form-item label="缓动">
              <el-select v-model="chartConfig.props.animation.easing">
                <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-gauge-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #1d2129;
}

/* Collapse group spacing */
.dr-gauge-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

/* Section headings: 12px weight 600 color #1d2129 */
.dr-gauge-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-gauge-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

/* Group separator between collapse sections */
.dr-gauge-panel :deep(.el-collapse-item__wrap .el-collapse-item__content) {
  padding-bottom: 4px;
}

/* Form item compact rows: 4px vertical gap */
.dr-gauge-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

/* Labels: 12px weight 500 color #4e5969 */
.dr-gauge-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

/* Inputs: border 1px solid #e5e6eb, radius 6px */
.dr-gauge-panel :deep(.el-input__wrapper),
.dr-gauge-panel :deep(.el-input-number),
.dr-gauge-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
}

.dr-gauge-panel :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-gauge-panel :deep(.el-input__wrapper:focus-within),
.dr-gauge-panel :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

/* Number inputs: tabular nums for pixel values */
.dr-gauge-panel :deep(.el-input-number .el-input__inner) {
  font-feature-settings: "tnum";
}

/* Select dropdown */
.dr-gauge-panel :deep(.el-select-dropdown) {
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* Color pickers: radius 6px, shadow-border */
.dr-gauge-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb;
  border: none;
}

/* Slider/range: track #e5e6eb, active #3478f6, thumb white with #3478f6 border */
.dr-gauge-panel :deep(.el-slider__runway) {
  background-color: #e5e6eb;
}

.dr-gauge-panel :deep(.el-slider__bar) {
  background-color: #3478f6;
}

.dr-gauge-panel :deep(.el-slider__button) {
  background-color: #fff;
  border-color: #3478f6;
}

/* Sub-section titles */
.sub-title {
  font-size: 12px;
  color: #4e5969;
  font-weight: 600;
  margin: 12px 0 8px 0;
  padding-left: 8px;
  border-left: 3px solid #3478f6;
  line-height: 1;
}

/* Group separator line */
.sub-title::before {
  content: '';
  display: block;
  height: 1px;
  background: #f2f3f5;
  margin-bottom: 12px;
  margin-left: -8px;
}

.color-segment-list {
  padding: 4px 0;
}

.color-segment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
</style>
