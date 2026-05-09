<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrVideoPlayerConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrVideoPlayerConfig
}>()
const chartConfig = computed(() => chart)

const preloadOptions = [
  { label: '自动', value: 'auto' },
  { label: '仅元数据', value: 'metadata' },
  { label: '不预加载', value: 'none' },
]

const objectFitOptions = [
  { label: '等比适应(contain)', value: 'contain' },
  { label: '等比填充(cover)', value: 'cover' },
  { label: '拉伸填充(fill)', value: 'fill' },
  { label: '原始尺寸(none)', value: 'none' },
]
</script>
<template>
  <div class="dr-video-player-panel">
    <el-form :model="chartConfig" label-width="100px" label-position="left" size="small">

      <!-- 基础播放配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置" name="basic">
          <!-- 视频地址 -->
          <el-form-item label="视频地址">
            <el-input
              v-model="chartConfig.props.basic.url"
              placeholder="请输入视频URL（支持MP4/FLV/M3U8/RTMP）"
              clearable
            >
              <template #prefix>
                <el-icon><VideoPlay /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 封面图 -->
          <el-form-item label="封面图">
            <el-input
              v-model="chartConfig.props.basic.poster"
              placeholder="请输入封面图URL"
              clearable
            >
              <template #prefix>
                <el-icon><Picture /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 自动播放 -->
          <el-form-item label="自动播放">
            <el-switch v-model="chartConfig.props.basic.autoplay" />
            <el-text v-if="chartConfig.props.basic.autoplay && !chartConfig.props.basic.muted" type="warning" size="small" style="margin-left: 8px;">
              建议开启静音
            </el-text>
          </el-form-item>

          <!-- 循环播放 -->
          <el-form-item label="循环播放">
            <el-switch v-model="chartConfig.props.basic.loop" />
          </el-form-item>

          <!-- 静音 -->
          <el-form-item label="静音">
            <el-switch v-model="chartConfig.props.basic.muted" />
          </el-form-item>

          <!-- 显示控制栏 -->
          <el-form-item label="显示控制栏">
            <el-switch v-model="chartConfig.props.basic.controls" />
          </el-form-item>

          <!-- 预加载策略 -->
          <el-form-item label="预加载">
            <el-select v-model="chartConfig.props.basic.preload">
              <el-option
                v-for="item in preloadOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <!-- 样式配置 -->
        <el-collapse-item title="样式配置" name="style">
          <!-- 填充模式 -->
          <el-form-item label="填充模式">
            <el-select v-model="chartConfig.props.style.objectFit">
              <el-option
                v-for="item in objectFitOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <!-- 圆角 -->
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.style.borderRadius"
              :min="0"
              :max="200"
              :step="1"
              controls-position="right"
            />
          </el-form-item>

          <!-- 背景颜色 -->
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
          </el-form-item>
        </el-collapse-item>

        <!-- 音量配置 -->
        <el-collapse-item title="音量配置" name="volume">
          <el-form-item label="默认音量">
            <el-slider
              v-model="chartConfig.props.volume.defaultVolume"
              :min="0"
              :max="1"
              :step="0.05"
              :format-tooltip="(val: number) => `${Math.round(val * 100)}%`"
            />
          </el-form-item>
        </el-collapse-item>

        <!-- 播放速率配置 -->
        <el-collapse-item title="播放速率" name="playbackRate">
          <el-form-item label="默认速率">
            <el-select v-model="chartConfig.props.playbackRate.defaultRate">
              <el-option
                v-for="rate in chartConfig.props.playbackRate.rates"
                :key="rate"
                :label="`${rate}x`"
                :value="rate"
              />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-video-player-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dr-video-player-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-video-player-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-video-player-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.dr-video-player-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.dr-video-player-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-video-player-panel :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-video-player-panel :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-video-player-panel :deep(.el-input-number) {
  font-feature-settings: "tnum";
}

.dr-video-player-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-video-player-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
  border: none;
}
</style>
