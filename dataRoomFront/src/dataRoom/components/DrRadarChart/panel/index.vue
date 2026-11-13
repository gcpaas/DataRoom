<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrRadarChartControlPanel',
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
import type { DrRadarChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrRadarChartConfig
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

/** 标记点形状选项 */
const symbolTypeOptions = [
  { label: '圆形', value: 'circle' },
  { label: '矩形', value: 'rect' },
  { label: '三角形', value: 'triangle' },
  { label: '菱形', value: 'diamond' },
  { label: '无', value: 'none' },
]

/** 数值格式选项 */
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

/**
 * 更新分割区域颜色列表中的某一项
 */
const updateSplitAreaColor = (index: number, color: string) => {
  chartConfig.value.props.radar.splitArea.colors[index] = color
}

/**
 * 新增分割区域颜色
 */
const addSplitAreaColor = () => {
  chartConfig.value.props.radar.splitArea.colors.push(chartConfig.value.props.radar.splitArea.colors[0] || '')
}

/**
 * 删除分割区域颜色
 */
const removeSplitAreaColor = (index: number) => {
  if (chartConfig.value.props.radar.splitArea.colors.length > 1) {
    chartConfig.value.props.radar.splitArea.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-radar-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="雷达坐标轴" name="radar">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>基础布局</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">形状</span>
                  <DrSelectField v-model="chartConfig.props.radar.shape" class="dr-config-panel__control">
                    <el-option label="多边形" value="polygon" />
                    <el-option label="圆形" value="circle" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">半径</span>
                  <DrInputField v-model="chartConfig.props.radar.radius" class="dr-config-panel__control" placeholder="如 65%" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">起始角度</span>
                  <DrNumberField v-model="chartConfig.props.radar.startAngle" class="dr-config-panel__control" :min="0" :max="360" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">分割段数</span>
                  <DrNumberField v-model="chartConfig.props.radar.splitNumber" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴线</span></template>
              <el-switch v-model="chartConfig.props.radar.axisLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.radar.axisLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.radar.axisLine.color" show-alpha aria-label="雷达轴线颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrSelectField v-model="chartConfig.props.radar.axisLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="分割线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">分割线</span></template>
              <el-switch v-model="chartConfig.props.radar.splitLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.radar.splitLine.width" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.radar.splitLine.color" show-alpha aria-label="雷达分割线颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">样式</span>
                  <DrSelectField v-model="chartConfig.props.radar.splitLine.type" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="分割区域" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">分割区域</span></template>
              <el-switch v-model="chartConfig.props.radar.splitArea.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">颜色列表</span>
                  <div class="dr-config-panel__color-list">
                    <div v-for="(color, index) in chartConfig.props.radar.splitArea.colors" :key="index" class="dr-config-panel__inline">
                      <DrColorField :model-value="color" show-alpha @update:model-value="(val: string | null) => updateSplitAreaColor(index, val || color)" />
                      <el-button
                        class="config-panel-text"
                        text
                        size="small"
                        aria-label="删除颜色"
                        title="删除颜色"
                        :icon="'Delete'"
                        :disabled="chartConfig.props.radar.splitArea.colors.length <= 1"
                        @click="removeSplitAreaColor(index)"
                      />
                    </div>
                    <el-button class="config-panel-text" plain @click="addSplitAreaColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props.radar.axisLabel.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.radar.axisLabel.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="雷达轴标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.radar.axisLabel.color" show-alpha aria-label="雷达轴标签颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="指示器" name="indicator">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>名称样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.indicator.nameStyle.fontSize" class="dr-config-panel__control" :min="10" :max="30" controls-position="right" label="字" aria-label="指示器名称字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.indicator.nameStyle.color" show-alpha aria-label="指示器名称颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.indicator.nameStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字体</span>
                  <DrSelectField v-model="chartConfig.props.indicator.nameStyle.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>指标范围</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">名称间距</span>
                  <DrNumberField v-model="chartConfig.props.indicator.nameGap" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">最大值</span>
                  <DrNumberField v-model="chartConfig.props.indicator.max" class="dr-config-panel__control" :min="0" :max="99999" controls-position="right" placeholder="自动" />
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

        <ConfigCollapseItem title="系列样式" name="series">
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
            <div class="dr-config-panel__group-title">
              <span>线条</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">线宽</span>
                  <DrNumberField v-model="chartConfig.props.series.lineWidth" class="dr-config-panel__control" :min="1" :max="10" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">线条样式</span>
                  <DrSelectField v-model="chartConfig.props.series.lineStyle" class="dr-config-panel__control">
                    <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="区域填充" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">区域填充</span></template>
              <el-switch v-model="chartConfig.props.series.areaStyle.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">透明度</span>
                  <DrNumberField v-model="chartConfig.props.series.areaStyle.opacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="标记点" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">标记点</span></template>
              <el-switch v-model="chartConfig.props.series.symbol.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">形状</span>
                  <DrSelectField v-model="chartConfig.props.series.symbol.type" class="dr-config-panel__control">
                    <el-option v-for="item in symbolTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">大小</span>
                  <DrNumberField v-model="chartConfig.props.series.symbol.size" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
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
            <el-form-item label="数据标签" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">数据标签</span></template>
              <el-switch v-model="chartConfig.props.series.label.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.series.label.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="数据标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.series.label.color" show-alpha aria-label="数据标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式化</span>
                  <DrSelectField v-model="chartConfig.props.series.label.format" class="dr-config-panel__control">
                    <el-option v-for="item in labelFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
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

.dr-radar-chart-config-panel {
  padding: 0;
}

.dr-radar-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
