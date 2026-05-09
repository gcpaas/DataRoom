<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrWordCloudConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrWordCloudConfig
}>()
const chartConfig = computed(() => chart)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  {label: '正常 (normal)', value: 'normal'},
  {label: '粗体 (bold)', value: 'bold'},
  {label: '更粗 (bolder)', value: 'bolder'},
  {label: '细体 (lighter)', value: 'lighter'},
]

/** 字体族预设选项 */
const fontFamilyOptions = [
  {label: '微软雅黑', value: 'Microsoft YaHei'},
  {label: '宋体', value: 'SimSun'},
  {label: '黑体', value: 'SimHei'},
  {label: '楷体', value: 'KaiTi'},
  {label: 'Arial', value: 'Arial'},
  {label: 'sans-serif', value: 'sans-serif'},
]

/** 词云形状选项 */
const shapeOptions = [
  {label: '圆形', value: 'circle'},
  {label: '心形', value: 'cardioid'},
  {label: '菱形', value: 'diamond'},
  {label: '三角形(右)', value: 'triangle-forward'},
  {label: '三角形', value: 'triangle'},
  {label: '五边形', value: 'pentagon'},
  {label: '星形', value: 'star'},
]

/** 高亮聚焦模式选项 */
const focusOptions = [
  {label: '无', value: 'none'},
  {label: '自身', value: 'self'},
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
  chartConfig.value.props.wordStyle.colors[index] = color
}

/**
 * 新增颜色
 */
const addColor = () => {
  chartConfig.value.props.wordStyle.colors.push('#409eff')
}

/**
 * 删除颜色
 */
const removeColor = (index: number) => {
  if (chartConfig.value.props.wordStyle.colors.length > 1) {
    chartConfig.value.props.wordStyle.colors.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-word-cloud-panel">
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

      <!-- 文字样式配置 -->
      <el-collapse>
        <el-collapse-item title="文字样式">
          <el-form-item label="字体">
            <el-select v-model="chartConfig.props.wordStyle.fontFamily" filterable allow-create>
              <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.wordStyle.fontWeight">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>

          <div class="sub-title">字号范围</div>
          <el-form-item label="最小字号">
            <el-input-number v-model="chartConfig.props.wordStyle.fontSizeRange[0]" :min="8" :max="100" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最大字号">
            <el-input-number v-model="chartConfig.props.wordStyle.fontSizeRange[1]" :min="8" :max="200" controls-position="right"/>
          </el-form-item>

          <div class="sub-title">旋转角度</div>
          <el-form-item label="最小角度">
            <el-input-number v-model="chartConfig.props.wordStyle.rotationRange[0]" :min="-90" :max="90" controls-position="right"/>
          </el-form-item>
          <el-form-item label="最大角度">
            <el-input-number v-model="chartConfig.props.wordStyle.rotationRange[1]" :min="-90" :max="90" controls-position="right"/>
          </el-form-item>
          <el-form-item label="角度步长">
            <el-input-number v-model="chartConfig.props.wordStyle.rotationStep" :min="0" :max="90" controls-position="right"/>
          </el-form-item>

          <div class="sub-title">颜色列表</div>
          <div class="color-list">
            <div v-for="(color, index) in chartConfig.props.wordStyle.colors" :key="index" class="color-item">
              <el-color-picker :model-value="color" @update:model-value="(val: string) => updateColor(index, val || color)" show-alpha/>
              <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeColor(index)" :disabled="chartConfig.props.wordStyle.colors.length <= 1"/>
            </div>
            <el-button type="primary" size="small" @click="addColor">添加颜色</el-button>
          </div>
        </el-collapse-item>
      </el-collapse>

      <!-- 形状配置 -->
      <el-collapse>
        <el-collapse-item title="词云形状">
          <el-form-item label="形状">
            <el-select v-model="chartConfig.props.shape.type">
              <el-option v-for="item in shapeOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 布局配置 -->
      <el-collapse>
        <el-collapse-item title="布局">
          <el-form-item label="网格大小">
            <el-input-number v-model="chartConfig.props.layout.gridSize" :min="1" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="超出边界">
            <el-switch v-model="chartConfig.props.layout.drawOutOfBound"/>
          </el-form-item>
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

      <!-- 高亮配置 -->
      <el-collapse>
        <el-collapse-item title="高亮交互">
          <el-form-item label="聚焦模式">
            <el-select v-model="chartConfig.props.emphasis.focus">
              <el-option v-for="item in focusOptions" :key="item.value" :label="item.label" :value="item.value"/>
            </el-select>
          </el-form-item>
          <el-form-item label="阴影模糊">
            <el-input-number v-model="chartConfig.props.emphasis.textStyle.shadowBlur" :min="0" :max="50" controls-position="right"/>
          </el-form-item>
          <el-form-item label="阴影颜色">
            <el-color-picker v-model="chartConfig.props.emphasis.textStyle.shadowColor" show-alpha/>
          </el-form-item>
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
.dr-word-cloud-panel {
  padding: 12px;
}

.dr-word-cloud-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 8px;
}

.dr-word-cloud-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-word-cloud-panel :deep(.el-collapse-item__wrap) {
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
