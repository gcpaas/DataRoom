<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrBarChartConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrBarChartConfig
}>()
const chartConfig = computed(() => chart)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  {label: '正常 (400)', value: 'normal'},
  {label: '粗体 (700)', value: 'bold'},
  {label: '细 (300)', value: '300'},
  {label: '中等 (500)', value: '500'},
  {label: '较粗 (800)', value: '800'},
]

/** 字体族预设选项 */
const fontFamilyOptions = [
  {label: '微软雅黑', value: 'Microsoft YaHei'},
  {label: '宋体', value: 'SimSun'},
  {label: '黑体', value: 'SimHei'},
  {label: 'Arial', value: 'Arial'},
  {label: 'Helvetica', value: 'Helvetica'},
]

/** 线条样式选项 */
const lineStyleOptions = [
  {label: '实线', value: 'solid'},
  {label: '虚线', value: 'dashed'},
  {label: '点线', value: 'dotted'},
]

/** 缓动函数选项 */
const easingOptions = [
  {label: '线性', value: 'linear'},
  {label: '平滑减速', value: 'cubicOut'},
  {label: '弹性', value: 'elasticOut'},
  {label: '弹跳', value: 'bounceOut'},
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
  chartConfig.value.props.series.colors.push('#409eff')
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
  <div class="dr-bar-chart-panel">
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

      <!-- X 轴配置 -->
      <el-collapse>
        <el-collapse-item title="X 轴">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.xAxis.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.xAxis.show">
            <el-form-item label="数据类型">
              <el-select v-model="chartConfig.props.xAxis.type">
                <el-option label="类目" value="category"/>
                <el-option label="时间" value="time"/>
              </el-select>
            </el-form-item>

            <div class="sub-title">轴线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.xAxis.axisLine.show"/>
            </el-form-item>
            <el-form-item label="颜色" v-if="chartConfig.props.xAxis.axisLine.show">
              <el-color-picker v-model="chartConfig.props.xAxis.axisLine.color" show-alpha/>
            </el-form-item>
            <el-form-item label="宽度" v-if="chartConfig.props.xAxis.axisLine.show">
              <el-input-number v-model="chartConfig.props.xAxis.axisLine.width" :min="1" :max="10" controls-position="right"/>
            </el-form-item>

            <div class="sub-title">轴标签</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.xAxis.axisLabel.show"/>
            </el-form-item>
            <template v-if="chartConfig.props.xAxis.axisLabel.show">
              <el-form-item label="字号">
                <el-input-number v-model="chartConfig.props.xAxis.axisLabel.fontSize" :min="10" :max="30" controls-position="right"/>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha/>
              </el-form-item>
              <el-form-item label="字重">
                <el-select v-model="chartConfig.props.xAxis.axisLabel.fontWeight">
                  <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="字体">
                <el-select v-model="chartConfig.props.xAxis.axisLabel.fontFamily" filterable allow-create>
                  <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="旋转角度">
                <el-input-number v-model="chartConfig.props.xAxis.axisLabel.rotate" :min="-90" :max="90" controls-position="right"/>
              </el-form-item>
            </template>

            <div class="sub-title">刻度线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.xAxis.axisTick.show"/>
            </el-form-item>
            <el-form-item label="长度" v-if="chartConfig.props.xAxis.axisTick.show">
              <el-input-number v-model="chartConfig.props.xAxis.axisTick.length" :min="1" :max="20" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色" v-if="chartConfig.props.xAxis.axisTick.show">
              <el-color-picker v-model="chartConfig.props.xAxis.axisTick.color" show-alpha/>
            </el-form-item>

            <div class="sub-title">网格线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.xAxis.splitLine.show"/>
            </el-form-item>
            <template v-if="chartConfig.props.xAxis.splitLine.show">
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.xAxis.splitLine.color" show-alpha/>
              </el-form-item>
              <el-form-item label="宽度">
                <el-input-number v-model="chartConfig.props.xAxis.splitLine.width" :min="1" :max="5" controls-position="right"/>
              </el-form-item>
              <el-form-item label="样式">
                <el-select v-model="chartConfig.props.xAxis.splitLine.type">
                  <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- Y 轴配置 -->
      <el-collapse>
        <el-collapse-item title="Y 轴">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.yAxis.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.yAxis.show">
            <el-form-item label="轴名称">
              <el-input v-model="chartConfig.props.yAxis.name" placeholder="可选"/>
            </el-form-item>

            <div class="sub-title">显示范围</div>
            <el-form-item label="自动">
              <el-switch v-model="chartConfig.props.yAxis.range.auto"/>
            </el-form-item>
            <template v-if="!chartConfig.props.yAxis.range.auto">
              <el-form-item label="最小值">
                <el-input-number v-model="chartConfig.props.yAxis.range.min" controls-position="right"/>
              </el-form-item>
              <el-form-item label="最大值">
                <el-input-number v-model="chartConfig.props.yAxis.range.max" controls-position="right"/>
              </el-form-item>
            </template>

            <div class="sub-title">轴线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.yAxis.axisLine.show"/>
            </el-form-item>
            <el-form-item label="颜色" v-if="chartConfig.props.yAxis.axisLine.show">
              <el-color-picker v-model="chartConfig.props.yAxis.axisLine.color" show-alpha/>
            </el-form-item>
            <el-form-item label="宽度" v-if="chartConfig.props.yAxis.axisLine.show">
              <el-input-number v-model="chartConfig.props.yAxis.axisLine.width" :min="1" :max="10" controls-position="right"/>
            </el-form-item>

            <div class="sub-title">轴标签</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.yAxis.axisLabel.show"/>
            </el-form-item>
            <template v-if="chartConfig.props.yAxis.axisLabel.show">
              <el-form-item label="字号">
                <el-input-number v-model="chartConfig.props.yAxis.axisLabel.fontSize" :min="10" :max="30" controls-position="right"/>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.yAxis.axisLabel.color" show-alpha/>
              </el-form-item>
              <el-form-item label="字重">
                <el-select v-model="chartConfig.props.yAxis.axisLabel.fontWeight">
                  <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="字体">
                <el-select v-model="chartConfig.props.yAxis.axisLabel.fontFamily" filterable allow-create>
                  <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
            </template>

            <div class="sub-title">刻度线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.yAxis.axisTick.show"/>
            </el-form-item>
            <el-form-item label="长度" v-if="chartConfig.props.yAxis.axisTick.show">
              <el-input-number v-model="chartConfig.props.yAxis.axisTick.length" :min="1" :max="20" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色" v-if="chartConfig.props.yAxis.axisTick.show">
              <el-color-picker v-model="chartConfig.props.yAxis.axisTick.color" show-alpha/>
            </el-form-item>

            <div class="sub-title">网格线</div>
            <el-form-item label="显示">
              <el-switch v-model="chartConfig.props.yAxis.splitLine.show"/>
            </el-form-item>
            <template v-if="chartConfig.props.yAxis.splitLine.show">
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.yAxis.splitLine.color" show-alpha/>
              </el-form-item>
              <el-form-item label="宽度">
                <el-input-number v-model="chartConfig.props.yAxis.splitLine.width" :min="1" :max="5" controls-position="right"/>
              </el-form-item>
              <el-form-item label="样式">
                <el-select v-model="chartConfig.props.yAxis.splitLine.type">
                  <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 图例配置 -->
      <el-collapse>
        <el-collapse-item title="图例">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.legend.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.legend.show">
            <el-form-item label="位置">
              <el-select v-model="chartConfig.props.legend.position">
                <el-option label="顶部" value="top"/>
                <el-option label="底部" value="bottom"/>
                <el-option label="左侧" value="left"/>
                <el-option label="右侧" value="right"/>
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.legend.textStyle.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.legend.textStyle.color" show-alpha/>
            </el-form-item>
            <el-form-item label="间距">
              <el-input-number v-model="chartConfig.props.legend.itemGap" :min="0" :max="60" controls-position="right"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 提示框配置 -->
      <el-collapse>
        <el-collapse-item title="提示框">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.tooltip.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.tooltip.show">
            <el-form-item label="触发方式">
              <el-select v-model="chartConfig.props.tooltip.trigger">
                <el-option label="坐标轴触发" value="axis"/>
                <el-option label="数据项触发" value="item"/>
              </el-select>
            </el-form-item>
            <el-form-item label="背景色">
              <el-color-picker v-model="chartConfig.props.tooltip.backgroundColor" show-alpha/>
            </el-form-item>
            <el-form-item label="边框色">
              <el-color-picker v-model="chartConfig.props.tooltip.borderColor" show-alpha/>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.tooltip.textStyle.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="字色">
              <el-color-picker v-model="chartConfig.props.tooltip.textStyle.color" show-alpha/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 系列(柱子)配置 -->
      <el-collapse>
        <el-collapse-item title="柱子样式">
          <el-form-item label="展示形式">
            <el-select v-model="chartConfig.props.series.displayMode">
              <el-option label="分组" value="group"/>
              <el-option label="堆叠" value="stack"/>
            </el-select>
          </el-form-item>
          <el-form-item label="柱子宽度">
            <el-input-number v-model="chartConfig.props.series.barWidth" :min="1" :max="100" controls-position="right" placeholder="自适应"/>
          </el-form-item>
          <el-form-item label="最大宽度">
            <el-input-number v-model="chartConfig.props.series.barMaxWidth" :min="10" :max="200" controls-position="right"/>
          </el-form-item>
          <el-form-item label="类目间距">
            <el-input v-model="chartConfig.props.series.barCategoryGap" placeholder="如 30%"/>
          </el-form-item>
          <el-form-item label="组内间距">
            <el-input v-model="chartConfig.props.series.barGap" placeholder="如 20%"/>
          </el-form-item>

          <div class="sub-title">圆角</div>
          <el-form-item label="左上">
            <el-input-number v-model="chartConfig.props.series.borderRadius[0]" :min="0" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="右上">
            <el-input-number v-model="chartConfig.props.series.borderRadius[1]" :min="0" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="右下">
            <el-input-number v-model="chartConfig.props.series.borderRadius[2]" :min="0" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="左下">
            <el-input-number v-model="chartConfig.props.series.borderRadius[3]" :min="0" :max="50" controls-position="right"/>
          </el-form-item>

          <div class="sub-title">颜色列表</div>
          <div class="color-list">
            <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="color-item">
              <el-color-picker :model-value="color" @update:model-value="(val: string) => updateColor(index, val || color)" show-alpha/>
              <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColor(index)" :disabled="chartConfig.props.series.colors.length <= 1"/>
            </div>
            <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
          </div>

          <div class="sub-title">渐变</div>
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.series.gradient.enabled"/>
          </el-form-item>
          <el-form-item label="方向" v-if="chartConfig.props.series.gradient.enabled">
            <el-select v-model="chartConfig.props.series.gradient.direction">
              <el-option label="纵向" value="vertical"/>
              <el-option label="横向" value="horizontal"/>
            </el-select>
          </el-form-item>

          <div class="sub-title">数据标签</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.series.label.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.series.label.show">
            <el-form-item label="位置">
              <el-select v-model="chartConfig.props.series.label.position">
                <el-option label="顶部" value="top"/>
                <el-option label="内部" value="inside"/>
                <el-option label="底部" value="bottom"/>
                <el-option label="左侧" value="left"/>
                <el-option label="右侧" value="right"/>
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.series.label.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.series.label.color" show-alpha/>
            </el-form-item>
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.series.label.fontWeight">
                <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
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
.dr-bar-chart-panel {
  padding: 12px;
}

.dr-bar-chart-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 8px;
}

.dr-bar-chart-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-bar-chart-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.sub-title {
  font-size: 12px;
  color: #909399;
  font-weight: bold;
  margin: 12px 0 8px 0;
  padding-left: 4px;
  border-left: 3px solid #409eff;
}

.color-list {
  padding: 4px 0;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
</style>
