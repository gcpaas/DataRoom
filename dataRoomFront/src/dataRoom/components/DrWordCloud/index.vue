<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrWordCloud',
})
</script>
<script setup lang="ts">
import {mockDataset, type DrWordCloudConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import 'echarts-wordcloud'
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts"
import {getChartDatasetFieldNames, shouldUseDefaultChartData} from "@/dataRoom/components/_shared/chart-data-defaults.ts"

const {chart} = defineProps<{
  chart: DrWordCloudConfig
}>()

// ECharts 实例引用
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 图表数据
const chartData = ref<any[]>([])

/**
 * 定义改变数据的逻辑
 */
const changeData = (datasetValue: any) => {
  if (Array.isArray(datasetValue)) {
    chartData.value = datasetValue
  } else if (datasetValue && Array.isArray(datasetValue.data)) {
    chartData.value = datasetValue.data
  } else {
    chartData.value = []
  }
  updateChart()
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/**
 * 根据数据和配置构建 ECharts option
 */
const buildOption = () => {
  const props = chart.props
  const data = chartData.value

  // 解析数据集字段映射
  const wordFieldNames = getChartDatasetFieldNames(chart, 'wordField', ['word'])
  const valueFieldNames = getChartDatasetFieldNames(chart, 'valueField', ['value'])
  const wordFieldName = wordFieldNames[0] || 'word'
  const valueFieldName = valueFieldNames[0] || 'value'

  // 构建词云数据
  const seriesData = data.map((item: any) => ({
    name: String(item[wordFieldName] || ''),
    value: Number(item[valueFieldName]) || 0
  }))

  // 颜色列表
  const colors = props.wordStyle.colors

  const option: echarts.EChartsOption = {
    tooltip: {
      show: props.tooltip.show,
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: {
        fontSize: props.tooltip.textStyle.fontSize,
        color: props.tooltip.textStyle.color
      }
    },
    series: [
      {
        type: 'wordCloud',
        shape: props.shape.type,
        left: props.global.padding[3],
        top: props.global.padding[0],
        right: props.global.padding[1],
        bottom: props.global.padding[2],
        width: '100%',
        height: '100%',
        sizeRange: props.wordStyle.fontSizeRange,
        rotationRange: props.wordStyle.rotationRange,
        rotationStep: props.wordStyle.rotationStep,
        gridSize: props.layout.gridSize,
        drawOutOfBound: props.layout.drawOutOfBound,
        textStyle: {
          fontFamily: props.wordStyle.fontFamily,
          fontWeight: props.wordStyle.fontWeight as any,
          color: () => {
            return colors[Math.floor(Math.random() * colors.length)]
          }
        },
        emphasis: {
          focus: props.emphasis.focus as any,
          textStyle: {
            shadowBlur: props.emphasis.textStyle.shadowBlur,
            shadowColor: props.emphasis.textStyle.shadowColor
          }
        },
        data: seriesData
      } as any
    ],
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationEasing: props.animation.easing as any
  }

  return option
}

/**
 * 更新图表
 */
const updateChart = () => {
  if (!chartInstance) return
  const option = buildOption()
  chartInstance.setOption(option, true)
}

/**
 * 初始化 ECharts 实例
 */
const initChart = () => {
  if (!chartRef.value) return
  chartInstance = echarts.init(chartRef.value)

  // 绑定点击事件
  chartInstance.on('click', (params: any) => {
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      word: params.name,
      value: params.value
    })
  })

  // 绑定悬停事件
  chartInstance.on('mouseover', (params: any) => {
    canvasInst.triggerChartBehavior(chart.id, 'hover', {
      word: params.name,
      value: params.value
    })
  })

  // 使用组件模拟数据集渲染设计态默认数据
  if (shouldUseDefaultChartData(chart) && chartData.value.length === 0) {
    chartData.value = [...mockDataset.dataset]
  }
  updateChart()
}

/**
 * 窗口大小变化时重绘
 */
const handleResize = () => {
  chartInstance?.resize()
}

// 监听 props 变化时刷新图表
watch(
  () => chart.props,
  () => {
    nextTick(() => updateChart())
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
  chartInstance?.dispose()
  chartInstance = null
})

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-word-cloud" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-word-cloud {
  width: 100%;
  height: 100%;
}
</style>
