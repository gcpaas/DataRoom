<script lang="ts">
import { defineComponent } from 'vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrBarChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrBarChartConfig
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
  <div class="dr-config-panel dr-bar-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <!-- X 轴配置 -->
        <el-collapse-item title="X 轴" name="xAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.xAxis.show" />
          </el-form-item>
          <template v-if="chartConfig.props.xAxis.show">
            <el-form-item label="数据类型">
              <el-select v-model="chartConfig.props.xAxis.type">
                <el-option label="类目" value="category" />
                <el-option label="时间" value="time" />
              </el-select>
            </el-form-item>

            <div class="dr-config-panel__sub-section">
              <div class="dr-config-panel__sub-title">
                <span>轴线</span>
                <el-switch v-model="chartConfig.props.xAxis.axisLine.show" />
              </div>
              <el-form v-if="chartConfig.props.xAxis.axisLine.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" />
              </div>
              <el-form v-if="chartConfig.props.xAxis.axisLabel.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.xAxis.axisTick.show" />
              </div>
              <el-form v-if="chartConfig.props.xAxis.axisTick.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.xAxis.splitLine.show" />
              </div>
              <el-form v-if="chartConfig.props.xAxis.splitLine.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
          </template>
        </el-collapse-item>

        <!-- Y 轴配置 -->
        <el-collapse-item title="Y 轴" name="yAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.yAxis.show" />
          </el-form-item>
          <template v-if="chartConfig.props.yAxis.show">
            <el-form-item label="轴名称">
              <el-input v-model="chartConfig.props.yAxis.name" placeholder="可选" />
            </el-form-item>

            <div class="dr-config-panel__sub-section">
              <div class="dr-config-panel__sub-title">
                <span>显示范围</span>
                <el-switch v-model="chartConfig.props.yAxis.range.auto" />
              </div>
              <el-form v-if="!chartConfig.props.yAxis.range.auto" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.yAxis.axisLine.show" />
              </div>
              <el-form v-if="chartConfig.props.yAxis.axisLine.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.yAxis.axisLabel.show" />
              </div>
              <el-form v-if="chartConfig.props.yAxis.axisLabel.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.yAxis.axisTick.show" />
              </div>
              <el-form v-if="chartConfig.props.yAxis.axisTick.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                <el-switch v-model="chartConfig.props.yAxis.splitLine.show" />
              </div>
              <el-form v-if="chartConfig.props.yAxis.splitLine.show" class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
          </template>
        </el-collapse-item>

        <!-- 图例配置 -->
        <el-collapse-item title="图例" name="legend">
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">显示</span>
              <el-switch v-model="chartConfig.props.legend.show" />
            </div>
          </el-form-item>
          <template v-if="chartConfig.props.legend.show">
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
          </template>
        </el-collapse-item>

        <!-- 提示框配置 -->
        <el-collapse-item title="提示框" name="tooltip">
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">显示</span>
              <el-switch v-model="chartConfig.props.tooltip.show" />
            </div>
          </el-form-item>
          <template v-if="chartConfig.props.tooltip.show">
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
          </template>
        </el-collapse-item>

        <!-- 系列(柱子)配置 -->
        <el-collapse-item title="柱子样式" name="series">
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
              <span class="dr-config-panel__sub-label">柱子宽度</span>
              <el-input-number v-model="chartConfig.props.series.barWidth" class="dr-config-panel__control" :min="1" :max="100" controls-position="right" placeholder="自适应" />
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

          <div class="dr-config-panel__sub-title">圆角</div>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">左上</span>
              <el-input-number v-model="chartConfig.props.series.borderRadius[0]" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">右上</span>
              <el-input-number v-model="chartConfig.props.series.borderRadius[1]" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">右下</span>
              <el-input-number v-model="chartConfig.props.series.borderRadius[2]" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
            </div>
          </el-form-item>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">左下</span>
              <el-input-number v-model="chartConfig.props.series.borderRadius[3]" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
            </div>
          </el-form-item>

          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
              <span class="dr-config-panel__sub-label">颜色列表</span>
              <div class="dr-config-panel__color-list">
                <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                  <el-color-picker :model-value="color" @update:model-value="(val: string) => updateColor(index, val || color)" show-alpha />
                  <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColor(index)" :disabled="chartConfig.props.series.colors.length <= 1" />
                </div>
                <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
              </div>
            </div>
          </el-form-item>

          <div class="dr-config-panel__sub-title">渐变</div>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">启用</span>
              <el-switch v-model="chartConfig.props.series.gradient.enabled" />
            </div>
          </el-form-item>
          <el-form-item v-if="chartConfig.props.series.gradient.enabled" class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">方向</span>
              <el-select v-model="chartConfig.props.series.gradient.direction" class="dr-config-panel__control">
                <el-option label="纵向" value="vertical" />
                <el-option label="横向" value="horizontal" />
              </el-select>
            </div>
          </el-form-item>

          <div class="dr-config-panel__sub-title">数据标签</div>
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">显示</span>
              <el-switch v-model="chartConfig.props.series.label.show" />
            </div>
          </el-form-item>
          <template v-if="chartConfig.props.series.label.show">
            <el-form-item class="dr-config-panel__sub-form-item">
              <div class="dr-config-panel__sub-row">
                <span class="dr-config-panel__sub-label">位置</span>
                <el-select v-model="chartConfig.props.series.label.position" class="dr-config-panel__control">
                  <el-option label="顶部" value="top" />
                  <el-option label="内部" value="inside" />
                  <el-option label="底部" value="bottom" />
                  <el-option label="左侧" value="left" />
                  <el-option label="右侧" value="right" />
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
          </template>
        </el-collapse-item>

        <!-- 动画配置 -->
        <el-collapse-item title="动画" name="animation">
          <el-form-item class="dr-config-panel__sub-form-item">
            <div class="dr-config-panel__sub-row">
              <span class="dr-config-panel__sub-label">启用</span>
              <el-switch v-model="chartConfig.props.animation.enabled" />
            </div>
          </el-form-item>
          <template v-if="chartConfig.props.animation.enabled">
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
          </template>
        </el-collapse-item>

        <!-- 全局配置 -->
        <el-collapse-item title="全局配置" name="global">
          <div class="dr-config-panel__sub-title">图表边距</div>
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
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-bar-chart-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-bar-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
