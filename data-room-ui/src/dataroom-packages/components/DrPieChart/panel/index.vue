<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrPieChartConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrPieChartConfig
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

/** 缓动函数选项 */
const easingOptions = [
  {label: '线性', value: 'linear'},
  {label: '平滑减速', value: 'cubicOut'},
  {label: '弹性', value: 'elasticOut'},
  {label: '弹跳', value: 'bounceOut'},
]

/** 标签位置选项 */
const labelPositionOptions = [
  {label: '内部', value: 'inside'},
  {label: '外部', value: 'outside'},
  {label: '蜘蛛线', value: 'spider'},
]

/** 标签内容选项 */
const labelContentOptions = [
  {label: '名称', value: 'name'},
  {label: '数值', value: 'value'},
  {label: '百分比', value: 'percent'},
  {label: '名称+数值', value: 'name+value'},
  {label: '名称+百分比', value: 'name+percent'},
]

/** 数值格式化选项 */
const valueFormatOptions = [
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
</script>

<template>
  <div class="dr-pie-chart-panel">
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

      <!-- 饼图布局 -->
      <el-collapse>
        <el-collapse-item title="饼图布局">
          <el-form-item label="内半径(%)">
            <el-slider v-model="chartConfig.props.pie.innerRadius" :min="0" :max="90" show-input/>
          </el-form-item>
          <el-form-item label="外半径(%)">
            <el-slider v-model="chartConfig.props.pie.outerRadius" :min="10" :max="100" show-input/>
          </el-form-item>
          <el-form-item label="中心X">
            <el-input v-model="chartConfig.props.pie.center[0]" placeholder="50%"/>
          </el-form-item>
          <el-form-item label="中心Y">
            <el-input v-model="chartConfig.props.pie.center[1]" placeholder="50%"/>
          </el-form-item>
          <el-form-item label="起始角度">
            <el-input-number v-model="chartConfig.props.pie.startAngle" :min="0" :max="360" controls-position="right"/>
          </el-form-item>
          <el-form-item label="玫瑰图">
            <el-select v-model="chartConfig.props.pie.roseType">
              <el-option label="关闭" :value="false"/>
              <el-option label="半径模式" value="radius"/>
              <el-option label="面积模式" value="area"/>
            </el-select>
          </el-form-item>
          <el-form-item label="边框颜色">
            <el-color-picker v-model="chartConfig.props.pie.borderColor" show-alpha/>
          </el-form-item>
          <el-form-item label="边框宽度">
            <el-input-number v-model="chartConfig.props.pie.borderWidth" :min="0" :max="10" controls-position="right"/>
          </el-form-item>
          <el-form-item label="扇形圆角">
            <el-input-number v-model="chartConfig.props.pie.borderRadius" :min="0" :max="30" controls-position="right"/>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 中心内容（仅环形图有效） -->
      <el-collapse v-if="chartConfig.props.pie.innerRadius > 0">
        <el-collapse-item title="中心内容">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.centerContent.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.centerContent.show">
            <el-form-item label="内容类型">
              <el-select v-model="chartConfig.props.centerContent.type">
                <el-option label="文本" value="text"/>
                <el-option label="图片" value="image"/>
              </el-select>
            </el-form-item>

            <!-- 文本模式 -->
            <template v-if="chartConfig.props.centerContent.type === 'text'">
              <div class="sub-title">标题</div>
              <el-form-item label="文本">
                <el-input v-model="chartConfig.props.centerContent.title.text" placeholder="总计"/>
              </el-form-item>
              <el-form-item label="字号">
                <el-input-number v-model="chartConfig.props.centerContent.title.fontSize" :min="10" :max="36" controls-position="right"/>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.centerContent.title.color" show-alpha/>
              </el-form-item>
              <el-form-item label="字重">
                <el-select v-model="chartConfig.props.centerContent.title.fontWeight">
                  <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="Y偏移">
                <el-input-number v-model="chartConfig.props.centerContent.title.offsetY" :min="-100" :max="100" controls-position="right"/>
              </el-form-item>

              <div class="sub-title">数值</div>
              <el-form-item label="字段">
                <el-input v-model="chartConfig.props.centerContent.value.field" placeholder="留空则显示总计"/>
              </el-form-item>
              <el-form-item label="字号">
                <el-input-number v-model="chartConfig.props.centerContent.value.fontSize" :min="10" :max="60" controls-position="right"/>
              </el-form-item>
              <el-form-item label="颜色">
                <el-color-picker v-model="chartConfig.props.centerContent.value.color" show-alpha/>
              </el-form-item>
              <el-form-item label="字重">
                <el-select v-model="chartConfig.props.centerContent.value.fontWeight">
                  <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="Y偏移">
                <el-input-number v-model="chartConfig.props.centerContent.value.offsetY" :min="-100" :max="100" controls-position="right"/>
              </el-form-item>
              <el-form-item label="格式化">
                <el-select v-model="chartConfig.props.centerContent.value.format">
                  <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value"/>
                </el-select>
              </el-form-item>
              <el-form-item label="前缀">
                <el-input v-model="chartConfig.props.centerContent.value.prefix" placeholder="可选"/>
              </el-form-item>
              <el-form-item label="后缀">
                <el-input v-model="chartConfig.props.centerContent.value.suffix" placeholder="可选"/>
              </el-form-item>
            </template>

            <!-- 图片模式 -->
            <template v-if="chartConfig.props.centerContent.type === 'image'">
              <div class="sub-title">图片</div>
              <el-form-item label="图片URL">
                <el-input v-model="chartConfig.props.centerContent.image.url" placeholder="图片地址"/>
              </el-form-item>
              <el-form-item label="宽度">
                <el-input-number v-model="chartConfig.props.centerContent.image.width" :min="10" :max="200" controls-position="right"/>
              </el-form-item>
              <el-form-item label="高度">
                <el-input-number v-model="chartConfig.props.centerContent.image.height" :min="10" :max="200" controls-position="right"/>
              </el-form-item>
            </template>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 标签配置 -->
      <el-collapse>
        <el-collapse-item title="标签">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.label.show"/>
          </el-form-item>
          <template v-if="chartConfig.props.label.show">
            <el-form-item label="位置">
              <el-select v-model="chartConfig.props.label.position">
                <el-option v-for="item in labelPositionOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="内容">
              <el-select v-model="chartConfig.props.label.content">
                <el-option v-for="item in labelContentOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number v-model="chartConfig.props.label.fontSize" :min="10" :max="24" controls-position="right"/>
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.label.color" show-alpha/>
            </el-form-item>
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.label.fontWeight">
                <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
              </el-select>
            </el-form-item>

            <!-- 引导线（仅外部标签时有效） -->
            <template v-if="chartConfig.props.label.position !== 'inside'">
              <div class="sub-title">引导线</div>
              <el-form-item label="显示">
                <el-switch v-model="chartConfig.props.label.guideLine.show"/>
              </el-form-item>
              <template v-if="chartConfig.props.label.guideLine.show">
                <el-form-item label="第一段长">
                  <el-input-number v-model="chartConfig.props.label.guideLine.length" :min="0" :max="60" controls-position="right"/>
                </el-form-item>
                <el-form-item label="第二段长">
                  <el-input-number v-model="chartConfig.props.label.guideLine.length2" :min="0" :max="60" controls-position="right"/>
                </el-form-item>
                <el-form-item label="线宽">
                  <el-input-number v-model="chartConfig.props.label.guideLine.lineWidth" :min="1" :max="5" controls-position="right"/>
                </el-form-item>
                <el-form-item label="颜色">
                  <el-color-picker v-model="chartConfig.props.label.guideLine.color" show-alpha/>
                </el-form-item>
              </template>
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
            <el-form-item label="显示占比">
              <el-switch v-model="chartConfig.props.tooltip.showPercent"/>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 系列配置 -->
      <el-collapse>
        <el-collapse-item title="系列配置">
          <el-form-item label="选中模式">
            <el-select v-model="chartConfig.props.series.selectedMode">
              <el-option label="关闭" :value="false"/>
              <el-option label="单选" value="single"/>
              <el-option label="多选" value="multiple"/>
            </el-select>
          </el-form-item>
          <el-form-item label="选中偏移" v-if="chartConfig.props.series.selectedMode">
            <el-input-number v-model="chartConfig.props.series.selectedOffset" :min="0" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最小角度">
            <el-input-number v-model="chartConfig.props.series.minAngle" :min="0" :max="30" controls-position="right"/>
          </el-form-item>

          <div class="sub-title">小数合并</div>
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.series.merge.enabled"/>
          </el-form-item>
          <template v-if="chartConfig.props.series.merge.enabled">
            <el-form-item label="最大数量">
              <el-input-number v-model="chartConfig.props.series.merge.maxCount" :min="2" :max="50" controls-position="right"/>
            </el-form-item>
            <el-form-item label="合并标签">
              <el-input v-model="chartConfig.props.series.merge.mergeLabel" placeholder="其他"/>
            </el-form-item>
          </template>

          <div class="sub-title">颜色列表</div>
          <div class="color-list">
            <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="color-item">
              <el-color-picker :model-value="color" @update:model-value="(val: string) => updateColor(index, val || color)" show-alpha/>
              <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColor(index)" :disabled="chartConfig.props.series.colors.length <= 1"/>
            </div>
            <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
          </div>
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
.dr-pie-chart-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-weight: 400;
  color: #1d2129;
}

/* ─── Collapse ─── */
.dr-pie-chart-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-pie-chart-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
  background: transparent;
}

.dr-pie-chart-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
  background: transparent;
}

.dr-pie-chart-panel :deep(.el-collapse-item__content) {
  padding-bottom: 4px;
}

/* ─── Form Items ─── */
.dr-pie-chart-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-pie-chart-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

/* ─── Inputs ─── */
.dr-pie-chart-panel :deep(.el-input__wrapper),
.dr-pie-chart-panel :deep(.el-input-number),
.dr-pie-chart-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
}

.dr-pie-chart-panel :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-pie-chart-panel :deep(.el-input__wrapper:focus-within),
.dr-pie-chart-panel :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-pie-chart-panel :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-pie-chart-panel :deep(.el-select__wrapper.is-focused) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-pie-chart-panel :deep(.el-select-dropdown) {
  border-radius: 6px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
}

/* ─── Number inputs (tabular nums for pixel values) ─── */
.dr-pie-chart-panel :deep(.el-input-number .el-input__inner) {
  font-feature-settings: "tnum";
}

/* ─── Color Picker ─── */
.dr-pie-chart-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb;
  border: none;
}

/* ─── Slider ─── */
.dr-pie-chart-panel :deep(.el-slider__runway) {
  background-color: #e5e6eb;
}

.dr-pie-chart-panel :deep(.el-slider__bar) {
  background-color: #3478f6;
}

.dr-pie-chart-panel :deep(.el-slider__button) {
  border-color: #3478f6;
  background-color: #fff;
}

/* ─── Sub-section Title ─── */
.sub-title {
  font-size: 12px;
  color: #4e5969;
  font-weight: 600;
  margin: 12px 0 4px 0;
  padding-top: 12px;
  border-top: 1px solid #f2f3f5;
}

/* ─── Color List ─── */
.color-list {
  padding: 4px 0;
}

.color-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
</style>
