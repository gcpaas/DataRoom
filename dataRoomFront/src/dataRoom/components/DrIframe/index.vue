<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrIframe',
})
</script>
<script setup lang="ts">
import type { DrIframeConfig } from './install.ts'
import { getSingleDatasetValueByField } from '@/dataRoom/_common/_utils.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const { chart } = defineProps<{
  chart: DrIframeConfig
}>()

const datasetUrl = ref('')
const iframeRef = ref<HTMLIFrameElement | null>(null)
const iframeKey = ref(0)
let refreshTimer: ReturnType<typeof setInterval> | null = null

const currentUrl = computed(() => {
  if (datasetUrl.value) {
    return datasetUrl.value
  }
  return chart.props.basic.url
})

const sandboxAttr = computed(() => {
  const sandbox = chart.props.sandbox
  const permissions: string[] = []
  if (sandbox.allowScripts) permissions.push('allow-scripts')
  if (sandbox.allowSameOrigin) permissions.push('allow-same-origin')
  if (sandbox.allowForms) permissions.push('allow-forms')
  if (sandbox.allowPopups) permissions.push('allow-popups')
  if (sandbox.allowModals) permissions.push('allow-modals')
  if (sandbox.allowFullscreen) permissions.push('allow-presentation')
  return permissions.join(' ')
})

const allowAttr = computed(() => {
  const sandbox = chart.props.sandbox
  const allows: string[] = []
  if (sandbox.allowFullscreen) allows.push('fullscreen')
  if (sandbox.allowCamera) allows.push('camera')
  if (sandbox.allowMicrophone) allows.push('microphone')
  return allows.join('; ')
})

const containerStyle = computed(() => {
  const style = chart.props.style
  const result: Record<string, string> = {
    borderRadius: `${style.borderRadius}px`,
    backgroundColor: style.backgroundColor,
  }
  if (style.border.show) {
    result.border = `${style.border.width}px ${style.border.style} ${style.border.color}`
  }
  return result
})

/**
 * 定义改变数据的逻辑
 */
const changeData = (datasetValue: any) => {
  const url = getSingleDatasetValueByField(chart, 'urlField', datasetValue)
  if (url) {
    const oldUrl = currentUrl.value
    datasetUrl.value = url
    if (oldUrl !== url) {
      canvasInst.triggerChartBehavior(chart.id, 'urlChange', { url: url })
    }
  }
}

const { canvasInst, expose } = useDrComponent({
  chart: chart,
  changeData: changeData,
})

const onIframeLoad = () => {
  canvasInst.triggerChartBehavior(chart.id, 'loaded', { url: currentUrl.value })
}

const onIframeClick = () => {
  canvasInst.triggerChartBehavior(chart.id, 'click', { url: currentUrl.value })
}

/**
 * 刷新iframe
 */
const refreshIframe = () => {
  iframeKey.value++
}

/**
 * 设置自动刷新定时器
 */
const setupAutoRefresh = () => {
  clearAutoRefresh()
  if (chart.props.autoRefresh.enabled && chart.props.autoRefresh.interval > 0) {
    refreshTimer = setInterval(() => {
      refreshIframe()
    }, chart.props.autoRefresh.interval * 1000)
  }
}

/**
 * 清除自动刷新定时器
 */
const clearAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 监听自动刷新配置变化
watch(
  () => [chart.props.autoRefresh.enabled, chart.props.autoRefresh.interval],
  () => {
    setupAutoRefresh()
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearAutoRefresh()
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-iframe" :style="containerStyle" @click="onIframeClick">
    <iframe
      ref="iframeRef"
      :key="iframeKey"
      :src="currentUrl"
      :scrolling="chart.props.basic.scrolling"
      :frameborder="chart.props.basic.frameBorder ? '1' : '0'"
      :sandbox="sandboxAttr"
      :allow="allowAttr"
      class="dr-iframe__frame"
      @load="onIframeLoad"
    />
    <div v-if="!currentUrl" class="dr-iframe__placeholder">
      <span>请配置URL地址</span>
    </div>
  </div>
</template>

<style scoped>
.dr-iframe {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  & .dr-iframe__frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
  }

  & .dr-iframe__placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-text-color-regular);
    font-size: 14px;
    background: var(--el-fill-color-extra-light);
  }
}
</style>
