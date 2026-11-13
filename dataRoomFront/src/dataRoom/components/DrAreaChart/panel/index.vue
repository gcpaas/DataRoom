<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrAreaChartControlPanel',
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
import type { DrAreaChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrAreaChartConfig
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

const symbolTypeOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '无', value: 'none' },
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
  <div class="dr-config-panel dr-area-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="X 轴" name="xAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.xAxis.show" />
          </el-form-item>
          <el-form-item label="数据类型">
            <DrSelectField v-model="chartConfig.props.xAxis.type">
              <el-option label="类目" value="category" />
              <el-option label="时间" value="time" />
              <el-option label="数值" value="value" />
            </DrSelectField>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴线</span></template>
              <el-switch v-model="chartConfig.props.xAxis.axisLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.xAxis.axisLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.xAxis.axisLine.color" show-alpha aria-label="X 轴轴线颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props.xAxis.axisLabel.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.xAxis.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" label="字" aria-label="X 轴标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha aria-label="X 轴标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.xAxis.axisLabel.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字体</span>
                  <DrSelectField v-model="chartConfig.props.xAxis.axisLabel.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">旋转角度</span>
                  <DrNumberField v-model="chartConfig.props.xAxis.axisLabel.rotate" class="dr-config-panel__control" :min="-90" :max="90" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="刻度线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">刻度线</span></template>
              <el-switch v-model="chartConfig.props.xAxis.axisTick.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="刻度" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.xAxis.axisTick.length" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" label="长" /></template>
                <template #second><DrColorField v-model="chartConfig.props.xAxis.axisTick.color" show-alpha aria-label="X 轴刻度颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="网格线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">网格线</span></template>
              <el-switch v-model="chartConfig.props.xAxis.splitLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.xAxis.splitLine.width" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.xAxis.splitLine.color" show-alpha aria-label="X 轴网格线颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrSelectField v-model="chartConfig.props.xAxis.splitLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="Y 轴" name="yAxis">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.yAxis.show" />
          </el-form-item>
          <el-form-item label="轴名称">
            <DrInputField v-model="chartConfig.props.yAxis.name" placeholder="可选" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示范围" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">显示范围</span></template>
              <el-switch v-model="chartConfig.props.yAxis.range.auto" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="范围" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.range.min" class="dr-config-panel__control" controls-position="right" label="最小" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.yAxis.range.max" class="dr-config-panel__control" controls-position="right" label="最大" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴线</span></template>
              <el-switch v-model="chartConfig.props.yAxis.axisLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.axisLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.axisLine.color" show-alpha aria-label="Y 轴轴线颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props.yAxis.axisLabel.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" label="字" aria-label="Y 轴标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.axisLabel.color" show-alpha aria-label="Y 轴标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.yAxis.axisLabel.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字体</span>
                  <DrSelectField v-model="chartConfig.props.yAxis.axisLabel.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="刻度线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">刻度线</span></template>
              <el-switch v-model="chartConfig.props.yAxis.axisTick.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="刻度" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.axisTick.length" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" label="长" /></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.axisTick.color" show-alpha aria-label="Y 轴刻度颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="网格线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">网格线</span></template>
              <el-switch v-model="chartConfig.props.yAxis.splitLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.splitLine.width" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.splitLine.color" show-alpha aria-label="Y 轴网格线颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrSelectField v-model="chartConfig.props.yAxis.splitLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="图例" name="legend">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.legend.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.legend.position" class="dr-config-panel__control">
                    <el-option label="顶部" value="top" />
                    <el-option label="底部" value="bottom" />
                    <el-option label="左侧" value="left" />
                    <el-option label="右侧" value="right" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.legend.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="图例字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.legend.textStyle.color" show-alpha aria-label="图例文字颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.legend.textStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间距</span>
                  <DrNumberField v-model="chartConfig.props.legend.itemGap" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" />
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
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">触发方式</span>
                  <DrSelectField v-model="chartConfig.props.tooltip.trigger" class="dr-config-panel__control">
                    <el-option label="坐标轴触发" value="axis" />
                    <el-option label="数据项触发" value="item" />
                  </DrSelectField>
                </div>
              </el-form-item>
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
                <template #first><DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="提示框字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="区域样式" name="series">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>线条</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">展示形式</span>
                  <DrSelectField v-model="chartConfig.props.series.displayMode" class="dr-config-panel__control">
                    <el-option label="普通" value="normal" />
                    <el-option label="堆叠" value="stack" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">折线类型</span>
                  <DrSelectField v-model="chartConfig.props.series.lineType" class="dr-config-panel__control">
                    <el-option label="直线" value="line" />
                    <el-option label="平滑曲线" value="smooth" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">折线宽度</span>
                  <DrNumberField v-model="chartConfig.props.series.lineWidth" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">折线样式</span>
                  <DrSelectField v-model="chartConfig.props.series.lineStyle" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">连接空值</span>
                  <el-switch v-model="chartConfig.props.series.connectNulls" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>区域填充</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">透明度</span>
                  <DrNumberField v-model="chartConfig.props.series.areaStyle.opacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item label="渐变填充" label-width="72px" label-position="left">
                <template #label><span class="dr-config-panel__group-title">渐变填充</span></template>
                <el-switch v-model="chartConfig.props.series.areaStyle.gradient.enabled" />
              </el-form-item>
              <DrFieldRow label="渐变透明度" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.series.areaStyle.gradient.topOpacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" label="顶" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.series.areaStyle.gradient.bottomOpacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" label="底" /></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="数据点符号" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">数据点符号</span></template>
              <el-switch v-model="chartConfig.props.series.symbol.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">类型</span>
                  <DrSelectField v-model="chartConfig.props.series.symbol.type" class="dr-config-panel__control">
                    <el-option v-for="item in symbolTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">大小</span>
                  <DrNumberField v-model="chartConfig.props.series.symbol.size" class="dr-config-panel__control" :min="2" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item label="不透明度">
                <DrNumberField v-model="chartConfig.props.series.symbol.fillOpacity" :min="0" :max="1" :step="0.05" controls-position="right" />
              </el-form-item>

              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">边框宽度</span>
                  <DrNumberField v-model="chartConfig.props.series.symbol.borderWidth" class="dr-config-panel__control" :min="0" :max="5" controls-position="right" />
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
                    <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                      <DrColorField :model-value="color" show-alpha @update:model-value="(val: string | null) => updateColor(index, val || color)" />
                      <el-button class="config-panel-text" text size="small" aria-label="删除颜色" title="删除颜色" :icon="'Delete'" :disabled="chartConfig.props.series.colors.length <= 1" @click="removeColor(index)" />
                    </div>
                    <el-button class="config-panel-text" plain @click="addColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="数据标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">数据标签</span></template>
              <el-switch v-model="chartConfig.props.series.label.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.series.label.position" class="dr-config-panel__control">
                    <el-option label="顶部" value="top" />
                    <el-option label="底部" value="bottom" />
                    <el-option label="内部" value="inside" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.series.label.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="数据标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.series.label.color" show-alpha aria-label="数据标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.series.label.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
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

.dr-area-chart-config-panel {
  padding: 0;
}

.dr-area-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
