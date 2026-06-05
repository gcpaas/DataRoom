<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrHorizontalBarChartControlPanel',
})
</script>
<script setup lang="ts">
import type { DrHorizontalBarChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrHorizontalBarChartConfig
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
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
]

const lineStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]

const formatOptions = [
  { label: '默认', value: 'default' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '百分比（一位）', value: 'percent1' },
  { label: '千分位', value: 'thousand' },
  { label: '千分位（一位）', value: 'thousand1' },
]

const updateColor = (index: number, color: string) => {
  chartConfig.value.props.series.colors[index] = color
}

const addColor = () => {
  chartConfig.value.props.series.colors.push(chartConfig.value.props.series.colors[0] || '')
}

const removeColor = (index: number) => {
  if (chartConfig.value.props.series.colors.length > 1) {
    chartConfig.value.props.series.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-horizontal-bar-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="X 轴" name="xAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.xAxis.show" />
          </el-form-item>
          <el-form-item label="轴名称">
            <el-input v-model="chartConfig.props.xAxis.name" placeholder="可选" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示范围</span>
              <el-switch v-model="chartConfig.props.xAxis.range.auto" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最小值</span>
                  <el-input-number v-model="chartConfig.props.xAxis.range.min" class="dr-config-panel__control" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大值</span>
                  <el-input-number v-model="chartConfig.props.xAxis.range.max" class="dr-config-panel__control" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

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
                  <span class="dr-config-panel__sub-label">格式化</span>
                  <el-select v-model="chartConfig.props.xAxis.axisLabel.format" class="dr-config-panel__control">
                    <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
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
          <el-form-item label="数据类型">
            <el-select v-model="chartConfig.props.yAxis.type">
              <el-option label="类目" value="category" />
              <el-option label="数值" value="value" />
              <el-option label="时间" value="time" />
            </el-select>
          </el-form-item>

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
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大宽度</span>
                  <el-input-number v-model="chartConfig.props.yAxis.axisLabel.maxWidth" class="dr-config-panel__control" :min="20" :max="200" controls-position="right" />
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
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.legend.textStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
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

        <el-collapse-item title="条形样式" name="series">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>基础样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">展示形式</span>
                  <el-select v-model="chartConfig.props.series.displayMode" class="dr-config-panel__control">
                    <el-option label="分组" value="group" />
                    <el-option label="堆叠" value="stack" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">条形宽度</span>
                  <el-input-number
                    v-model="chartConfig.props.series.barWidth"
                    class="dr-config-panel__control"
                    :min="1"
                    :max="100"
                    controls-position="right"
                    placeholder="自适应"
                  />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大宽度</span>
                  <el-input-number v-model="chartConfig.props.series.barMaxWidth" class="dr-config-panel__control" :min="10" :max="200" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">类目间距</span>
                  <el-input v-model="chartConfig.props.series.barCategoryGap" class="dr-config-panel__control" placeholder="如 30%" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">组内间距</span>
                  <el-input v-model="chartConfig.props.series.barGap" class="dr-config-panel__control" placeholder="如 20%" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>圆角</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-for="(label, index) in ['左上', '右上', '右下', '左下']" :key="label" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">{{ label }}</span>
                  <el-input-number v-model="chartConfig.props.series.borderRadius[index]" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
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
              <span>渐变</span>
              <el-switch v-model="chartConfig.props.series.gradient.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">方向</span>
                  <el-select v-model="chartConfig.props.series.gradient.direction" class="dr-config-panel__control">
                    <el-option label="横向" value="horizontal" />
                    <el-option label="纵向" value="vertical" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>背景条</span>
              <el-switch v-model="chartConfig.props.series.backgroundBar.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.series.backgroundBar.color" show-alpha />
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
                    <el-option label="右侧" value="right" />
                    <el-option label="内部" value="inside" />
                    <el-option label="左侧" value="left" />
                    <el-option label="顶部" value="top" />
                    <el-option label="底部" value="bottom" />
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
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式化</span>
                  <el-select v-model="chartConfig.props.series.label.format" class="dr-config-panel__control">
                    <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
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

.dr-horizontal-bar-chart-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-horizontal-bar-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
