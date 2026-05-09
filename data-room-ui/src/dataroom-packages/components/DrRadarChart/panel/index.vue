<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrRadarChartConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrRadarChartConfig
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

/** 标记点形状选项 */
const symbolTypeOptions = [
  {label: '圆形', value: 'circle'},
  {label: '矩形', value: 'rect'},
  {label: '三角形', value: 'triangle'},
  {label: '菱形', value: 'diamond'},
  {label: '无', value: 'none'},
]

/** 数值格式选项 */
const labelFormatOptions = [
  {label: '默认', value: 'default'},
  {label: '整数', value: 'integer'},
  {label: '1位小数', value: 'float1'},
  {label: '2位小数', value: 'float2'},
  {label: '百分比', value: 'percent'},
  {label: '百分比(1位)', value: 'percent1'},
  {label: '千分位', value: 'thousand'},
  {label: '千分位(1位)', value: 'thousand1'},
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
  chartConfig.value.props.radar.splitArea.colors.push('rgba(200, 200, 200, 0.1)')
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
  <div class="dr-radar-chart-panel">
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

      <!-- 雷达坐标轴配置 -->
      <el-collapse>
        <el-collapse-item title="雷达坐标轴">
          <el-form-item label="形状">
            <el-select v-model="chartConfig.props.radar.shape">
              <el-option label="多边形" value="polygon"/>
              <el-option label="圆形" value="circle"/>
            </el-select>
          </el-form-item>
          <el-form-item label="半径">
            <el-input v-model="chartConfig.props.radar.radius" placeholder="如 65%"/>
          </el-form-item>
          <el-form-item label="起始角度">
            <el-input-number v-model="chartConfig.props.radar.startAngle" :min="0" :max="360" controls-position="right"/>
          </el-form-item>
          <el-form-item label="分割段数">
            <el-input-number v-model="chartConfig.props.radar.splitNumber" :min="1" :max="20" controls-position="right"/>
          </el-form-item>

          <div class="sub-title">轴线</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.radar.axisLine.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.radar.axisLine.show">
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.radar.axisLine.color" show-alpha/>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.radar.axisLine.width" :min="1" :max="10" controls-position="right"/>
            </el-form-item>
            <el-form-item label="样式">
              <el-select v-model="chartConfig.props.radar.axisLine.type">
                <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
          </template>

          <div class="sub-title">分割线</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.radar.splitLine.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.radar.splitLine.show">
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.radar.splitLine.color" show-alpha/>
            </el-form-item>
            <el-form-item label="宽度">
              <el-input-number v-model="chartConfig.props.radar.splitLine.width" :min="1" :max="10" controls-position="right"/>
            </el-form-item>
            <el-form-item label="样式">
              <el-select v-model="chartConfig.props.radar.splitLine.type">
                <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
          </template>

          <div class="sub-title">分割区域</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.radar.splitArea.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.radar.splitArea.show">
            <div class="color-list">
              <div v-for="(color, index) in chartConfig.props.radar.splitArea.colors" :key="index" class="color-item">
                <el-color-picker :model-value="color" @update:model-value="(val: string) => updateSplitAreaColor(index, val || color)" show-alpha/>
                <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeSplitAreaColor(index)" :disabled="chartConfig.props.radar.splitArea.colors.length <= 1"/>
              </div>
              <el-button type="primary" size="small" @click="addSplitAreaColor">添加颜色</el-button>
            </div>
          </template>

          <div class="sub-title">轴标签</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.radar.axisLabel.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.radar.axisLabel.show">
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.radar.axisLabel.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.radar.axisLabel.color" show-alpha/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 指示器配置 -->
      <el-collapse>
        <el-collapse-item title="指示器">
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.indicator.nameStyle.fontSize" :min="10" :max="30" controls-position="right"/>
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.indicator.nameStyle.color" show-alpha/>
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.indicator.nameStyle.fontWeight">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="chartConfig.props.indicator.nameStyle.fontFamily" filterable allow-create>
              <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="名称间距">
            <el-input-number v-model="chartConfig.props.indicator.nameGap" :min="0" :max="60" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number v-model="chartConfig.props.indicator.max" :min="0" :max="99999" controls-position="right" placeholder="自动"/>
          </el-form-item>
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
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.legend.textStyle.fontWeight">
                <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
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

      <!-- 系列样式配置 -->
      <el-collapse>
        <el-collapse-item title="系列样式">
          <div class="sub-title">颜色列表</div>
          <div class="color-list">
            <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="color-item">
              <el-color-picker :model-value="color" @update:model-value="(val: string) => updateColor(index, val || color)" show-alpha/>
              <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColor(index)" :disabled="chartConfig.props.series.colors.length <= 1"/>
            </div>
            <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
          </div>

          <div class="sub-title">线条</div>
          <el-form-item label="线宽">
            <el-input-number v-model="chartConfig.props.series.lineWidth" :min="1" :max="10" controls-position="right"/>
          </el-form-item>
          <el-form-item label="线条样式">
            <el-select v-model="chartConfig.props.series.lineStyle">
              <el-option v-for="item in lineStyleOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>

          <div class="sub-title">区域填充</div>
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.series.areaStyle.show"/>
          </el-form-item>
          <el-form-item label="透明度" v-if="chartConfig.props.series.areaStyle.show">
            <el-slider v-model="chartConfig.props.series.areaStyle.opacity" :min="0" :max="1" :step="0.05" show-input :show-input-controls="false"/>
          </el-form-item>

          <div class="sub-title">标记点</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.series.symbol.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.series.symbol.show">
            <el-form-item label="形状">
              <el-select v-model="chartConfig.props.series.symbol.type">
                <el-option v-for="item in symbolTypeOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="大小">
              <el-input-number v-model="chartConfig.props.series.symbol.size" :min="1" :max="20" controls-position="right"/>
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number v-model="chartConfig.props.series.symbol.borderWidth" :min="0" :max="5" controls-position="right"/>
            </el-form-item>
          </template>

          <div class="sub-title">数据标签</div>
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.series.label.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.series.label.show">
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.series.label.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.series.label.color" show-alpha/>
            </el-form-item>
            <el-form-item label="格式化">
              <el-select v-model="chartConfig.props.series.label.format">
                <el-option v-for="item in labelFormatOptions" :key="item.value" :label="item.label" :value="item.value"/>
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
.dr-radar-chart-panel {
  padding: 12px;
}

.dr-radar-chart-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 8px;
}

.dr-radar-chart-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-radar-chart-panel :deep(.el-collapse-item__wrap) {
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
