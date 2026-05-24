<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrVideoPlayer',
})
</script>
<script setup lang="ts">
import type {DrVideoPlayerConfig} from './install.ts'
import {getSingleDatasetValueByField} from "@/dataroom-packages/_common/_utils.ts";
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component";
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts";
import {computed, ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue";

const {chart} = defineProps<{
  chart: DrVideoPlayerConfig
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const datasetUrl = ref('')
const datasetPoster = ref('')

/** 计算最终使用的视频URL */
const videoUrl = computed(() => {
  if (datasetUrl.value) {
    return datasetUrl.value
  }
  return chart.props.basic.url
})

/** 计算最终使用的封面图URL */
const posterUrl = computed(() => {
  if (datasetPoster.value) {
    return datasetPoster.value
  }
  return chart.props.basic.poster
})

/** 容器样式 */
const containerStyle = computed(() => {
  const styleProps = chart.props.style
  return {
    borderRadius: `${styleProps.borderRadius}px`,
    backgroundColor: styleProps.backgroundColor,
  }
})

/** 视频元素样式 */
const videoStyle = computed(() => {
  const styleProps = chart.props.style
  return {
    objectFit: styleProps.objectFit,
    borderRadius: `${styleProps.borderRadius}px`,
  }
})

/**
 * 定义改变数据的逻辑
 */
const changeData = (datasetValue: any) => {
  const url = getSingleDatasetValueByField(chart, 'urlField', datasetValue)
  if (url) {
    datasetUrl.value = url
  }
  const poster = getSingleDatasetValueByField(chart, 'posterField', datasetValue)
  if (poster) {
    datasetPoster.value = poster
  }
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/** 初始化视频播放器配置 */
const initVideoSettings = () => {
  const video = videoRef.value
  if (!video) return
  video.volume = chart.props.volume.defaultVolume
  video.playbackRate = chart.props.playbackRate.defaultRate
}

/** 视频事件处理 */
const onPlay = () => {
  const video = videoRef.value
  if (!video) return
  canvasInst.triggerChartBehavior(chart.id, 'play', {currentTime: video.currentTime})
}

const onPause = () => {
  const video = videoRef.value
  if (!video) return
  canvasInst.triggerChartBehavior(chart.id, 'pause', {currentTime: video.currentTime})
}

const onEnded = () => {
  const video = videoRef.value
  if (!video) return
  canvasInst.triggerChartBehavior(chart.id, 'ended', {duration: video.duration})
}

const onTimeUpdate = () => {
  const video = videoRef.value
  if (!video) return
  canvasInst.triggerChartBehavior(chart.id, 'timeupdate', {
    currentTime: video.currentTime,
    duration: video.duration
  })
}

const onVideoClick = () => {
  const video = videoRef.value
  if (!video) return
  canvasInst.triggerChartBehavior(chart.id, 'click', {currentTime: video.currentTime})
}

/** 监听视频URL变化，重新加载视频 */
watch(videoUrl, () => {
  nextTick(() => {
    const video = videoRef.value
    if (video) {
      video.load()
    }
  })
})

/** 监听音量配置变化 */
watch(() => chart.props.volume.defaultVolume, (newVolume) => {
  const video = videoRef.value
  if (video) {
    video.volume = newVolume
  }
})

/** 监听播放速率配置变化 */
watch(() => chart.props.playbackRate.defaultRate, (newRate) => {
  const video = videoRef.value
  if (video) {
    video.playbackRate = newRate
  }
})

onMounted(() => {
  nextTick(() => {
    initVideoSettings()
  })
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-video-player" :style="containerStyle">
    <video
      ref="videoRef"
      class="dr-video-player__video"
      :style="videoStyle"
      :src="videoUrl || undefined"
      :poster="posterUrl || undefined"
      :autoplay="chart.props.basic.autoplay"
      :loop="chart.props.basic.loop"
      :muted="chart.props.basic.muted"
      :controls="chart.props.basic.controls"
      :preload="chart.props.basic.preload"
      @play="onPlay"
      @pause="onPause"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @click="onVideoClick"
    />
    <div v-if="!videoUrl" class="dr-video-player__placeholder">
      <div class="placeholder-icon">
        <svg viewBox="0 0 48 48" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="10" width="36" height="28" rx="3" stroke="currentColor" stroke-width="2"/>
          <polygon points="20,17 20,31 32,24" fill="currentColor"/>
        </svg>
      </div>
      <span class="placeholder-text">请配置视频地址</span>
    </div>
  </div>
</template>

<style scoped>
.dr-video-player {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dr-video-player__video {
  width: 100%;
  height: 100%;
  display: block;
}

.dr-video-player__placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  gap: 12px;
}

.placeholder-icon {
  opacity: 0.6;
}

.placeholder-text {
  font-size: 14px;
  opacity: 0.8;
}
</style>
