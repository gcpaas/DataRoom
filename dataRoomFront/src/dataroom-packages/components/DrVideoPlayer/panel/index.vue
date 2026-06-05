<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrVideoPlayerControlPanel',
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
  <div class="dr-config-panel dr-video-player-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <el-form-item label="视频地址">
            <el-input v-model="chartConfig.props.basic.url" placeholder="请输入视频 URL" clearable>
              <template #prefix>
                <el-icon><VideoPlay /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="封面图">
            <el-input v-model="chartConfig.props.basic.poster" placeholder="请输入封面图 URL" clearable>
              <template #prefix>
                <el-icon><Picture /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="自动播放">
            <div class="dr-config-panel__inline">
              <el-switch v-model="chartConfig.props.basic.autoplay" />
              <el-text v-if="chartConfig.props.basic.autoplay && !chartConfig.props.basic.muted" type="warning" size="small">建议开启静音</el-text>
            </div>
          </el-form-item>
          <el-form-item label="循环播放">
            <el-switch v-model="chartConfig.props.basic.loop" />
          </el-form-item>
          <el-form-item label="静音">
            <el-switch v-model="chartConfig.props.basic.muted" />
          </el-form-item>
          <el-form-item label="控制栏">
            <el-switch v-model="chartConfig.props.basic.controls" />
          </el-form-item>
          <el-form-item label="预加载">
            <el-select v-model="chartConfig.props.basic.preload">
              <el-option v-for="item in preloadOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="样式配置" name="style">
          <el-form-item label="填充模式">
            <el-select v-model="chartConfig.props.style.objectFit">
              <el-option v-for="item in objectFitOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>容器样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="音量配置" name="volume">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>默认音量</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">音量</span>
                  <el-input-number v-model="chartConfig.props.volume.defaultVolume" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="播放速率" name="playbackRate">
          <el-form-item label="默认速率">
            <el-select v-model="chartConfig.props.playbackRate.defaultRate">
              <el-option v-for="rate in chartConfig.props.playbackRate.rates" :key="rate" :label="`${rate}x`" :value="rate" />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-video-player-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-video-player-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
