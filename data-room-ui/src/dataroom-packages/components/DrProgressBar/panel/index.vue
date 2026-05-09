<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrProgressBarConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrProgressBarConfig
}>()
const chartConfig = computed(() => chart)

/** 标签位置选项 */
const labelPositionOptions = [
  { label: '内部', value: 'inside' },
  { label: '外部', value: 'outside' },
  { label: '顶部', value: 'top' },
]

/** 标签格式选项 */
const labelFormatOptions = [
  { label: '百分比', value: 'percent' },
  { label: '数值', value: 'value' },
  { label: '自定义', value: 'custom' },
]

/** 字重选项 */
const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

/** 标题位置选项 */
const titlePositionOptions = [
  { label: '左侧', value: 'left' },
  { label: '顶部', value: 'top' },
]

/** 渐变方向选项 */
const gradientDirectionOptions = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
]

/** 动画缓动选项 */
const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '缓动', value: 'ease' },
  { label: '缓入', value: 'ease-in' },
  { label: '缓出', value: 'ease-out' },
  { label: '缓入缓出', value: 'ease-in-out' },
]
</script>
<template>
  <div class="dr-progress-bar-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 数值配置 -->
      <el-collapse>
        <el-collapse-item title="数值配置">
          <el-form-item label="当前值">
            <el-input-number
              v-model="chartConfig.props.value.current"
              :min="0"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="最大值">
            <el-input-number
              v-model="chartConfig.props.value.max"
              :min="1"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 进度条样式 -->
      <el-collapse>
        <el-collapse-item title="进度条样式">
          <el-form-item label="高度">
            <el-input-number
              v-model="chartConfig.props.bar.height"
              :min="4"
              :max="60"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="填充颜色">
            <el-color-picker v-model="chartConfig.props.bar.fillColor" show-alpha />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.bar.borderRadius"
              :min="0"
              :max="30"
              :step="1"
              controls-position="right"
            />
          </el-form-item>

          <!-- 渐变配置 -->
          <el-form-item label="启用渐变">
            <el-switch v-model="chartConfig.props.bar.gradient.enabled" />
          </el-form-item>
          <template v-if="chartConfig.props.bar.gradient.enabled">
            <el-form-item label="起始颜色">
              <el-color-picker v-model="chartConfig.props.bar.gradient.startColor" show-alpha />
            </el-form-item>
            <el-form-item label="结束颜色">
              <el-color-picker v-model="chartConfig.props.bar.gradient.endColor" show-alpha />
            </el-form-item>
            <el-form-item label="渐变方向">
              <el-select v-model="chartConfig.props.bar.gradient.direction">
                <el-option
                  v-for="item in gradientDirectionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 标签配置 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">标签配置</span>
              <el-switch v-model="chartConfig.props.label.show" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.label.show">
            <el-form-item label="位置">
              <el-select v-model="chartConfig.props.label.position">
                <el-option
                  v-for="item in labelPositionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number
                v-model="chartConfig.props.label.fontSize"
                :min="10"
                :max="36"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.label.color" show-alpha />
            </el-form-item>
            <el-form-item label="字重">
              <el-select v-model="chartConfig.props.label.fontWeight">
                <el-option
                  v-for="item in fontWeightOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="格式">
              <el-select v-model="chartConfig.props.label.format">
                <el-option
                  v-for="item in labelFormatOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item v-if="chartConfig.props.label.format === 'custom'" label="自定义模板">
              <el-input
                v-model="chartConfig.props.label.customFormat"
                placeholder="{percent}%"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 轨道配置 -->
      <el-collapse>
        <el-collapse-item title="轨道配置">
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.track.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.track.borderRadius"
              :min="0"
              :max="30"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 边框配置 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">边框配置</span>
              <el-switch v-model="chartConfig.props.border.show" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.border.show">
            <el-form-item label="边框颜色">
              <el-color-picker v-model="chartConfig.props.border.color" show-alpha />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                v-model="chartConfig.props.border.width"
                :min="0"
                :max="5"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 标题配置 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">标题配置</span>
              <el-switch v-model="chartConfig.props.title.show" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.title.show">
            <el-form-item label="标题文字">
              <el-input v-model="chartConfig.props.title.text" placeholder="请输入标题" />
            </el-form-item>
            <el-form-item label="位置">
              <el-select v-model="chartConfig.props.title.position">
                <el-option
                  v-for="item in titlePositionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="字号">
              <el-input-number
                v-model="chartConfig.props.title.fontSize"
                :min="10"
                :max="24"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.title.color" show-alpha />
            </el-form-item>
            <el-form-item v-if="chartConfig.props.title.position === 'left'" label="标题宽度">
              <el-input-number
                v-model="chartConfig.props.title.width"
                :min="30"
                :max="200"
                :step="5"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 动画配置 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">动画配置</span>
              <el-switch v-model="chartConfig.props.animation.enabled" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.animation.enabled">
            <el-form-item label="时长(ms)">
              <el-input-number
                v-model="chartConfig.props.animation.duration"
                :min="0"
                :max="5000"
                :step="100"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="缓动函数">
              <el-select v-model="chartConfig.props.animation.easing">
                <el-option
                  v-for="item in easingOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-progress-bar-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dr-progress-bar-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-progress-bar-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-progress-bar-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.dr-progress-bar-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.dr-progress-bar-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-progress-bar-panel :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-progress-bar-panel :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-progress-bar-panel :deep(.el-input-number) {
  font-feature-settings: "tnum";
}

.dr-progress-bar-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-progress-bar-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
  border: none;
}

.collapse-title-text {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
}

.collapse-title-switch {
  display: flex;
  align-items: center;
  width: 100%;
}

.collapse-title-switch :deep(.el-switch) {
  margin-left: auto;
  margin-right: 32px;
}
</style>
