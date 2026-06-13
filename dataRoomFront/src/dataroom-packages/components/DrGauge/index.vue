<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrGauge',
})
</script>
<script setup lang="ts">
import type {DrGaugeConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"
import {getChartDatasetFieldNames, shouldUseDefaultChartData} from "@/dataroom-packages/components/_shared/chart-data-defaults.ts"

const {chart} = defineProps<{
  chart: DrGaugeConfig
}>()

// ECharts 实例引用
const chartRef = ref<HTMLElement>()
let chartInstance: echarts.ECharts | null = null

// 仪表盘数据
const gaugeValue = ref<number>(0)
const gaugeTitle = ref<string>('')

/**
 * 定义改变数据的逻辑
 */
const changeData = (datasetValue: any) => {
  let data: any[] = []
  if (Array.isArray(datasetValue)) {
    data = datasetValue
  } else if (datasetValue && Array.isArray(datasetValue.data)) {
    data = datasetValue.data
  }

  if (data.length > 0) {
    const item = data[0]
    // 解析数值字段
    const valueFieldNames = getChartDatasetFieldNames(chart, 'valueField', ['value'])
    const titleFieldNames = getChartDatasetFieldNames(chart, 'titleField', ['title'])
    const valueFieldName = valueFieldNames[0] || 'value'
    const titleFieldName = titleFieldNames[0] || 'title'

    const val = Number(item[valueFieldName])
    gaugeValue.value = isNaN(val) ? 0 : val

    if (titleFieldName && item[titleFieldName] !== undefined) {
      gaugeTitle.value = String(item[titleFieldName])
    }
  } else {
    gaugeValue.value = 0
    gaugeTitle.value = ''
  }
  updateChart()
}

const {canvasInst, expose} = useDrComponent({
  chart: chart,
  changeData: changeData
})

/**
 * 格式化数值显示
 */
const formatValue = (value: number): string => {
  const props = chart.props.detail
  let formatted: string

  switch (props.format) {
    case 'percent':
      formatted = ((value / chart.props.gauge.max) * 100).toFixed(1) + '%'
      break
    case 'integer':
      formatted = Math.round(value).toString()
      break
    case 'float1':
      formatted = value.toFixed(1)
      break
    case 'float2':
      formatted = value.toFixed(2)
      break
    case 'value':
    default:
      formatted = String(value)
      break
  }

  return props.prefix + formatted + props.suffix
}

/**
 * 根据数据和配置构建 ECharts option
 */
const buildOption = () => {
  const props = chart.props
  const value = gaugeValue.value

  // 构建轴线颜色
  const axisLineColors = props.axisLine.colors.map(([pos, color]) => [pos, color] as [number, string])

  // 构建标题文本
  const titleText = gaugeTitle.value || props.title.text || ''

  const option: echarts.EChartsOption = {
    series: [
      {
        type: 'gauge',
        startAngle: props.gauge.startAngle,
        endAngle: props.gauge.endAngle,
        min: props.gauge.min,
        max: props.gauge.max,
        splitNumber: props.gauge.splitNumber,
        clockwise: props.gauge.clockwise,
        radius: props.gauge.radius,
        center: props.gauge.center,
        // 轴线
        axisLine: {
          show: props.axisLine.show,
          roundCap: props.axisLine.roundCap,
          lineStyle: {
            width: props.axisLine.width,
            color: axisLineColors
          }
        },
        // 刻度线
        axisTick: {
          show: props.axisTick.show,
          splitNumber: props.axisTick.splitNumber,
          length: props.axisTick.length,
          lineStyle: {
            color: props.axisTick.color,
            width: props.axisTick.width
          }
        },
        // 分割线
        splitLine: {
          show: props.splitLine.show,
          length: props.splitLine.length,
          lineStyle: {
            color: props.splitLine.color,
            width: props.splitLine.width
          }
        },
        // 刻度标签
        axisLabel: {
          show: props.axisLabel.show,
          fontSize: props.axisLabel.fontSize,
          color: props.axisLabel.color,
          distance: props.axisLabel.distance,
          formatter: props.axisLabel.formatter
        },
        // 指针
        pointer: {
          show: props.pointer.show,
          length: props.pointer.length,
          width: props.pointer.width,
          itemStyle: {
            color: props.pointer.color
          }
        },
        // 锚点
        anchor: {
          show: props.anchor.show,
          size: props.anchor.size,
          itemStyle: {
            color: props.anchor.color,
            borderWidth: props.anchor.borderWidth,
            borderColor: props.anchor.borderColor
          }
        },
        // 进度条
        progress: {
          show: props.progress.show,
          width: props.progress.width,
          roundCap: props.progress.roundCap,
          itemStyle: {
            color: props.progress.color
          }
        },
        // 数值显示
        detail: {
          show: props.detail.show,
          fontSize: props.detail.fontSize,
          color: props.detail.color,
          fontWeight: props.detail.fontWeight,
          offsetCenter: [0, props.detail.offsetY + '%'],
          valueAnimation: props.animation.enabled,
          formatter: (val: number) => formatValue(val)
        },
        // 标题
        title: {
          show: props.title.show,
          fontSize: props.title.fontSize,
          color: props.title.color,
          fontWeight: props.title.fontWeight,
          offsetCenter: [0, props.title.offsetY + '%']
        },
        data: [
          {
            value: value,
            name: titleText
          }
        ]
      }
    ],
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationEasing: props.animation.easing
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
  chartInstance.on('click', () => {
    const value = gaugeValue.value
    const percent = chart.props.gauge.max > 0
      ? (value / chart.props.gauge.max) * 100
      : 0
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      value: value,
      percent: parseFloat(percent.toFixed(2))
    })
  })

  // 使用默认示例数据渲染
  if (shouldUseDefaultChartData(chart) && gaugeValue.value === 0) {
    gaugeValue.value = 58.6
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
  <div class="dr-gauge" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-gauge {
  width: 100%;
  height: 100%;
}
</style>
