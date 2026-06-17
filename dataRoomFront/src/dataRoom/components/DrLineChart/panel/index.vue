<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrLineChartControlPanel',
})
</script>
<script setup lang="ts">
import type { DrLineChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrLineChartConfig
}>()
const chartConfig = computed(() => chart)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  { label: '正常 (400)', value: 'normal' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '细 (300)', value: '300' },
  { label: '中等 (500)', value: '500' },
  { label: '较粗 (800)', value: '800' },
]

/** 字体族预设选项 */
const fontFamilyOptions = [
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
]

/** 线条样式选项 */
const lineStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]

/** 缓动函数选项 */
const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]

/** 折线类型选项 */
const lineTypeOptions = [
  { label: '直线', value: 'line' },
  { label: '平滑曲线', value: 'smooth' },
  { label: '阶梯线', value: 'step' },
]

/** 数据点标记类型选项 */
const symbolTypeOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '水滴', value: 'pin' },
  { label: '箭头', value: 'arrow' },
  { label: '无', value: 'none' },
]

/** 标签位置选项 */
const labelPositionOptions = [
  { label: '顶部', value: 'top' },
  { label: '底部', value: 'bottom' },
  { label: '左侧', value: 'left' },
  { label: '右侧', value: 'right' },
  { label: '内部', value: 'inside' },
]

/** 标签格式选项 */
const labelFormatOptions = [
  { label: '默认', value: 'default' },
  { label: '整数', value: 'integer' },
  { label: '1位小数', value: 'float1' },
  { label: '2位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '百分比(1位)', value: 'percent1' },
  { label: '千分位', value: 'thousand' },
  { label: '千分位(1位)', value: 'thousand1' },
]

/**
 * 更新颜色列表中的某一项
 */
const updateColor = (index: number, color: string) => {
  chartConfig.value.props.series.colors[index] = color
}

/**
 * 新增颜色
 */
const addColor = () => {
  chartConfig.value.props.series.colors.push(chartConfig.value.props.series.colors[0] || '')
}

/**
 * 删除颜色
 */
const removeColor = (index: number) => {
  if (chartConfig.value.props.series.colors.length > 1) {
    chartConfig.value.props.series.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-line-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="X 轴" name="xAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.xAxis.show" />
          </el-form-item>
          <el-form-item label="数据类型">
            <el-select v-model="chartConfig.props.xAxis.type">
              <el-option label="类目" value="category" />
              <el-option label="时间" value="time" />
              <el-option label="数值" value="value" />
            </el-select>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>轴线</span>
              <el-switch v-model="chartConfig.props.xAxis.axisLine.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.xAxis.axisLine.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.xAxis.axisLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>轴标签</span>
              <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.xAxis.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.xAxis.axisLabel.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字体</span>
                  <el-select v-model="chartConfig.props.xAxis.axisLabel.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">旋转角度</span>
                  <el-input-number v-model="chartConfig.props.xAxis.axisLabel.rotate" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>刻度线</span>
              <el-switch v-model="chartConfig.props.xAxis.axisTick.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">长度</span>
                  <el-input-number v-model="chartConfig.props.xAxis.axisTick.length" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.xAxis.axisTick.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>网格线</span>
              <el-switch v-model="chartConfig.props.xAxis.splitLine.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.xAxis.splitLine.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.xAxis.splitLine.width" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">样式</span>
                  <el-select v-model="chartConfig.props.xAxis.splitLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="Y 轴" name="yAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.yAxis.show" />
          </el-form-item>
          <el-form-item label="轴名称">
            <el-input v-model="chartConfig.props.yAxis.name" placeholder="可选" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示范围</span>
              <el-switch v-model="chartConfig.props.yAxis.range.auto" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最小值</span>
                  <el-input-number v-model="chartConfig.props.yAxis.range.min" class="dr-config-panel__control" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大值</span>
                  <el-input-number v-model="chartConfig.props.yAxis.range.max" class="dr-config-panel__control" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>轴线</span>
              <el-switch v-model="chartConfig.props.yAxis.axisLine.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.yAxis.axisLine.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.yAxis.axisLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>轴标签</span>
              <el-switch v-model="chartConfig.props.yAxis.axisLabel.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.yAxis.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.yAxis.axisLabel.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.yAxis.axisLabel.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字体</span>
                  <el-select v-model="chartConfig.props.yAxis.axisLabel.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>刻度线</span>
              <el-switch v-model="chartConfig.props.yAxis.axisTick.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">长度</span>
                  <el-input-number v-model="chartConfig.props.yAxis.axisTick.length" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.yAxis.axisTick.color" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>网格线</span>
              <el-switch v-model="chartConfig.props.yAxis.splitLine.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.yAxis.splitLine.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.yAxis.splitLine.width" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">样式</span>
                  <el-select v-model="chartConfig.props.yAxis.splitLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="图例" name="legend">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.legend.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">位置</span>
                  <el-select v-model="chartConfig.props.legend.position" class="dr-config-panel__control">
                    <el-option label="顶部" value="top" />
                    <el-option label="底部" value="bottom" />
                    <el-option label="左侧" value="left" />
                    <el-option label="右侧" value="right" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.legend.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.legend.textStyle.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">间距</span>
                  <el-input-number v-model="chartConfig.props.legend.itemGap" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" />
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
                  <span class="dr-config-panel__sub-label">触发方式</span>
                  <el-select v-model="chartConfig.props.tooltip.trigger" class="dr-config-panel__control">
                    <el-option label="坐标轴触发" value="axis" />
                    <el-option label="数据项触发" value="item" />
                  </el-select>
                </div>
              </el-form-item>
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

        <el-collapse-item title="折线样式" name="series">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>线条</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">折线类型</span>
                  <el-select v-model="chartConfig.props.series.lineType" class="dr-config-panel__control">
                    <el-option v-for="item in lineTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">线宽</span>
                  <el-input-number v-model="chartConfig.props.series.lineWidth" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">线条样式</span>
                  <el-select v-model="chartConfig.props.series.lineStyle" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">连接空数据</span>
                  <el-switch v-model="chartConfig.props.series.connectNulls" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>数据点标记</span>
              <el-switch v-model="chartConfig.props.series.symbol.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">形状</span>
                  <el-select v-model="chartConfig.props.series.symbol.type" class="dr-config-panel__control">
                    <el-option v-for="item in symbolTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">大小</span>
                  <el-input-number v-model="chartConfig.props.series.symbol.size" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框宽度</span>
                  <el-input-number v-model="chartConfig.props.series.symbol.borderWidth" class="dr-config-panel__control" :min="0" :max="5" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框颜色</span>
                  <el-color-picker v-model="chartConfig.props.series.symbol.borderColor" show-alpha />
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
                    <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                      <el-color-picker :model-value="color" show-alpha @update:model-value="(val: string | null) => updateColor(index, val || color)" />
                      <el-button type="danger" :icon="'Delete'" circle size="small" :disabled="chartConfig.props.series.colors.length <= 1" @click="removeColor(index)" />
                    </div>
                    <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>面积填充</span>
              <el-switch v-model="chartConfig.props.series.areaStyle.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">透明度</span>
                  <el-input-number v-model="chartConfig.props.series.areaStyle.opacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">渐变</span>
                  <el-switch v-model="chartConfig.props.series.areaStyle.gradient" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>数据标签</span>
              <el-switch v-model="chartConfig.props.series.label.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">位置</span>
                  <el-select v-model="chartConfig.props.series.label.position" class="dr-config-panel__control">
                    <el-option v-for="item in labelPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式</span>
                  <el-select v-model="chartConfig.props.series.label.format" class="dr-config-panel__control">
                    <el-option v-for="item in labelFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.series.label.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.series.label.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.series.label.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
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
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">上边距</span>
                  <el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">右边距</span>
                  <el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">下边距</span>
                  <el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">左边距</span>
                  <el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" />
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
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-line-chart-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-line-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
