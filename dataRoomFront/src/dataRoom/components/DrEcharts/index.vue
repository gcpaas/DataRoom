<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrEcharts',
})
</script>
<script setup lang="ts">
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from 'vue'
import * as echarts from 'echarts'
import {ElMessage} from 'element-plus'
import {useDrComponent} from '@/dataRoom/hooks/use-dr-component'
import type {ComponentExpose} from '@/dataRoom/components/type/ComponentExpose.ts'
import type {DrEchartsConfig} from './install.ts'

const {chart} = defineProps<{
  chart: DrEchartsConfig
}>()

// ECharts 实例引用
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 最近一次数据集返回的数据（已经过数据处理脚本）
const chartData = ref<unknown>([])

// 当前一次 option 求值产生的定时器与自定义清理函数，重求值或卸载时统一回收
let trackedIntervals: number[] = []
let trackedTimeouts: number[] = []
let trackedRafs: number[] = []
let cleanupFns: Array<() => void> = []

/**
 * 回收上一次 option 求值产生的全部副作用：
 * 定时器自动清理，用户在代码中通过 ctx.onCleanup 注册的清理函数统一执行
 */
const runCleanups = () => {
  trackedIntervals.forEach((id) => window.clearInterval(id))
  trackedTimeouts.forEach((id) => window.clearTimeout(id))
  trackedRafs.forEach((id) => window.cancelAnimationFrame(id))
  trackedIntervals = []
  trackedTimeouts = []
  trackedRafs = []
  cleanupFns.forEach((fn) => {
    try {
      fn()
    } catch (error) {
      console.error(`组件${chart.type}: ${chart.id} onCleanup 清理函数执行失败:`, error)
    }
  })
  cleanupFns = []
}

/**
 * 求值 option 代码并渲染。
 * 定时器函数通过影子参数包装注入，用户从官网复制的代码原样可运行且不会泄漏；
 * 求值失败时保留上一次成功渲染的 option，不白屏。
 */
const renderOption = () => {
  if (!chartInstance) return
  const code = chart.props.option?.trim()
  if (!code) return
  // 先回收上一次求值的副作用，再执行新代码
  runCleanups()
  const ctx = {
    data: chartData.value,
    chart,
    canvasInst,
    onCleanup: (fn: () => void) => {
      cleanupFns.push(fn)
    },
  }
  const wrappedSetInterval = (handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    const id = window.setInterval(handler, timeout, ...args)
    trackedIntervals.push(id)
    return id
  }
  const wrappedSetTimeout = (handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    const id = window.setTimeout(handler, timeout, ...args)
    trackedTimeouts.push(id)
    return id
  }
  const wrappedRequestAnimationFrame = (callback: FrameRequestCallback) => {
    const id = window.requestAnimationFrame(callback)
    trackedRafs.push(id)
    return id
  }
  try {
    const optionFn = new Function(
      'ctx',
      'echarts',
      'setInterval',
      'setTimeout',
      'requestAnimationFrame',
      code,
    ) as (
      ctx: unknown,
      echartsNs: unknown,
      setIntervalFn: typeof wrappedSetInterval,
      setTimeoutFn: typeof wrappedSetTimeout,
      rafFn: typeof wrappedRequestAnimationFrame,
    ) => unknown
    const option = optionFn(ctx, echarts, wrappedSetInterval, wrappedSetTimeout, wrappedRequestAnimationFrame)
    if (!option || typeof option !== 'object') {
      console.warn(`组件${chart.type}: ${chart.id} option 代码未返回 option 对象`)
      return
    }
    chartInstance.setOption(option as echarts.EChartsOption, true)
  } catch (error) {
    console.error(`组件${chart.type}: ${chart.id} option 代码执行失败:`, error)
    ElMessage.error('option 代码执行失败，请检查代码语法')
  }
}

/**
 * 同步自定义交互事件绑定：
 * 事件名即 chart.behaviors 的键，对应 ECharts 原生事件名，仅绑定已启用的事件
 */
const boundEventNames = new Set<string>()
const syncEventBindings = () => {
  if (!chartInstance) return
  boundEventNames.forEach((eventName) => chartInstance?.off(eventName))
  boundEventNames.clear()
  const behaviorsConfig = chart.behaviors || {}
  Object.keys(behaviorsConfig).forEach((eventName) => {
    const config = behaviorsConfig[eventName]
    if (!config || config.disabled) return
    chartInstance?.on(eventName, (params: unknown) => {
      canvasInst.triggerChartBehavior(chart.id, eventName, params)
    })
    boundEventNames.add(eventName)
  })
}

/**
 * 定义改变数据的逻辑
 */
const changeData = (datasetValue: unknown) => {
  chartData.value = datasetValue
  renderOption()
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/**
 * 初始化 ECharts 实例
 */
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)
  syncEventBindings()
  renderOption()
}

/**
 * 窗口大小变化时重绘
 */
const handleResize = () => {
  chartInstance?.resize()
}

// 监听 option 代码变化时重新求值渲染
watch(
  () => chart.props.option,
  () => {
    nextTick(() => renderOption())
  }
)

// 监听交互配置变化，重新绑定自定义事件
watch(
  () => chart.behaviors,
  () => {
    syncEventBindings()
  },
  {deep: true}
)

// 监听组件尺寸变化
watch(
  () => [chart.w, chart.h],
  () => {
    nextTick(() => handleResize())
  }
)

onMounted(() => {
  nextTick(() => initChart())
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  runCleanups()
  chartInstance?.dispose()
  chartInstance = null
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-echarts" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-echarts {
  width: 100%;
  height: 100%;
}
</style>
