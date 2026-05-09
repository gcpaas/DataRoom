<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrLineChartConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"

const {chart} = defineProps<{
  chart: DrLineChartConfig
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
 * 格式化标签值
 */
const formatLabelValue = (value: number, format: string): string => {
  switch (format) {
    case 'integer':
      return Math.round(value).toString()
    case 'float1':
      return value.toFixed(1)
    case 'float2':
      return value.toFixed(2)
    case 'percent':
      return Math.round(value * 100) + '%'
    case 'percent1':
      return (value * 100).toFixed(1) + '%'
    case 'thousand':
      return Math.round(value).toLocaleString()
    case 'thousand1':
      return value.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1})
    default:
      return String(value)
  }
}

/**
 * 根据数据和配置构建 ECharts option
 */
const buildOption = () => {
  const props = chart.props
  const data = chartData.value

  // 解析数据集字段映射
  const xFieldNames = chart.dataset?.fields?.xField || ['x']
  const yFieldNames = chart.dataset?.fields?.yField || ['y']
  const seriesFieldNames = chart.dataset?.fields?.seriesField || []
  const xFieldName = xFieldNames[0] || 'x'
  const seriesFieldName = seriesFieldNames[0] || ''

  // 提取类目数据
  const categories = [...new Set(data.map((item: any) => item[xFieldName]))]

  // 构建系列数据
  let seriesList: echarts.LineSeriesOption[] = []

  if (seriesFieldName && data.some((item: any) => item[seriesFieldName])) {
    // 有分组字段 - 按分组生成多个系列
    const seriesNames = [...new Set(data.map((item: any) => item[seriesFieldName]))]
    const yFieldName = yFieldNames[0] || 'y'

    seriesList = seriesNames.map((sName, idx) => {
      const seriesData = categories.map(cat => {
        const item = data.find((d: any) => d[xFieldName] === cat && d[seriesFieldName] === sName)
        return item ? (item[yFieldName] != null ? Number(item[yFieldName]) : null) : null
      })
      return buildSeriesItem(String(sName), seriesData, idx)
    })
  } else {
    // 无分组字段 - 每个 yField 作为一个系列
    seriesList = yFieldNames.map((fieldName, idx) => {
      const seriesData = categories.map(cat => {
        const item = data.find((d: any) => d[xFieldName] === cat)
        return item ? (item[fieldName] != null ? Number(item[fieldName]) : null) : null
      })
      return buildSeriesItem(fieldName, seriesData, idx)
    })
  }

  // 图例位置映射
  const legendPositionMap: Record<string, any> = {
    top: {top: 'auto', bottom: 'auto', left: 'center', orient: 'horizontal'},
    bottom: {top: 'auto', bottom: 0, left: 'center', orient: 'horizontal'},
    left: {top: 'center', left: 0, orient: 'vertical'},
    right: {top: 'center', right: 0, orient: 'vertical'},
  }
  const legendPos = legendPositionMap[props.legend.position] || legendPositionMap.top

  const option: echarts.EChartsOption = {
    grid: {
      top: props.global.padding[0],
      right: props.global.padding[1],
      bottom: props.global.padding[2],
      left: props.global.padding[3],
      containLabel: true
    },
    xAxis: {
      show: props.xAxis.show,
      type: props.xAxis.type,
      data: categories,
      axisLine: {
        show: props.xAxis.axisLine.show,
        lineStyle: {
          color: props.xAxis.axisLine.color,
          width: props.xAxis.axisLine.width
        }
      },
      axisLabel: {
        show: props.xAxis.axisLabel.show,
        fontSize: props.xAxis.axisLabel.fontSize,
        color: props.xAxis.axisLabel.color,
        fontWeight: props.xAxis.axisLabel.fontWeight as any,
        fontFamily: props.xAxis.axisLabel.fontFamily,
        rotate: props.xAxis.axisLabel.rotate
      },
      axisTick: {
        show: props.xAxis.axisTick.show,
        length: props.xAxis.axisTick.length,
        lineStyle: {
          color: props.xAxis.axisTick.color
        }
      },
      splitLine: {
        show: props.xAxis.splitLine.show,
        lineStyle: {
          color: props.xAxis.splitLine.color,
          width: props.xAxis.splitLine.width,
          type: props.xAxis.splitLine.type
        }
      }
    },
    yAxis: {
      show: props.yAxis.show,
      name: props.yAxis.name || undefined,
      min: props.yAxis.range.auto ? undefined : props.yAxis.range.min,
      max: props.yAxis.range.auto ? undefined : props.yAxis.range.max,
      axisLine: {
        show: props.yAxis.axisLine.show,
        lineStyle: {
          color: props.yAxis.axisLine.color,
          width: props.yAxis.axisLine.width
        }
      },
      axisLabel: {
        show: props.yAxis.axisLabel.show,
        fontSize: props.yAxis.axisLabel.fontSize,
        color: props.yAxis.axisLabel.color,
        fontWeight: props.yAxis.axisLabel.fontWeight as any,
        fontFamily: props.yAxis.axisLabel.fontFamily
      },
      axisTick: {
        show: props.yAxis.axisTick.show,
        length: props.yAxis.axisTick.length,
        lineStyle: {
          color: props.yAxis.axisTick.color
        }
      },
      splitLine: {
        show: props.yAxis.splitLine.show,
        lineStyle: {
          color: props.yAxis.splitLine.color,
          width: props.yAxis.splitLine.width,
          type: props.yAxis.splitLine.type
        }
      }
    },
    legend: {
      show: props.legend.show,
      ...legendPos,
      textStyle: {
        fontSize: props.legend.textStyle.fontSize,
        color: props.legend.textStyle.color,
        fontWeight: props.legend.textStyle.fontWeight as any
      },
      itemGap: props.legend.itemGap
    },
    tooltip: {
      show: props.tooltip.show,
      trigger: props.tooltip.trigger,
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: {
        fontSize: props.tooltip.textStyle.fontSize,
        color: props.tooltip.textStyle.color
      }
    },
    series: seriesList,
    animation: props.animation.enabled,
    animationDuration: props.animation.duration,
    animationEasing: props.animation.easing
  }

  return option
}

/**
 * 构建单个系列配置
 */
const buildSeriesItem = (name: string, data: (number | null)[], index: number): echarts.LineSeriesOption => {
  const props = chart.props
  const colorIndex = index % props.series.colors.length
  const baseColor = props.series.colors[colorIndex] || '#5470c6'

  // 折线类型处理
  const isSmooth = props.series.lineType === 'smooth'
  const isStep = props.series.lineType === 'step'

  // 数据点标记配置
  const symbolType = props.series.symbol.show ? props.series.symbol.type : 'none'
  const symbolSize = props.series.symbol.show ? props.series.symbol.size : 0

  // 面积样式
  let areaStyle: any = undefined
  if (props.series.areaStyle.show) {
    if (props.series.areaStyle.gradient) {
      areaStyle = {
        opacity: props.series.areaStyle.opacity,
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {offset: 0, color: adjustColorOpacity(baseColor, props.series.areaStyle.opacity)},
            {offset: 1, color: adjustColorOpacity(baseColor, 0.05)}
          ]
        }
      }
    } else {
      areaStyle = {
        opacity: props.series.areaStyle.opacity,
        color: adjustColorOpacity(baseColor, props.series.areaStyle.opacity)
      }
    }
  }

  // 标签格式化
  const labelFormatter = props.series.label.format !== 'default'
    ? (params: any) => formatLabelValue(params.value, props.series.label.format)
    : undefined

  return {
    name: name,
    type: 'line',
    data: data,
    smooth: isSmooth,
    step: isStep ? 'start' : undefined,
    lineStyle: {
      width: props.series.lineWidth,
      type: props.series.lineStyle,
      color: baseColor
    },
    itemStyle: {
      color: baseColor,
      borderWidth: props.series.symbol.borderWidth,
      borderColor: props.series.symbol.borderColor || baseColor
    },
    symbol: symbolType,
    symbolSize: symbolSize,
    areaStyle: areaStyle,
    connectNulls: props.series.connectNulls,
    label: {
      show: props.series.label.show,
      position: props.series.label.position,
      fontSize: props.series.label.fontSize,
      color: props.series.label.color,
      fontWeight: props.series.label.fontWeight as any,
      formatter: labelFormatter
    }
  }
}

/**
 * 调整颜色透明度
 */
const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }
  return color
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
      x: params.name,
      y: params.value,
      seriesName: params.seriesName
    })
  })

  // 绑定图例点击事件
  chartInstance.on('legendselectchanged', (params: any) => {
    canvasInst.triggerChartBehavior(chart.id, 'legendClick', {
      name: params.name,
      selected: params.selected[params.name]
    })
  })

  // 使用默认示例数据渲染
  if (chartData.value.length === 0) {
    chartData.value = [
      {x: '一月', y: 120, s: '系列1'},
      {x: '二月', y: 200, s: '系列1'},
      {x: '三月', y: 150, s: '系列1'},
      {x: '四月', y: 80, s: '系列1'},
      {x: '五月', y: 170, s: '系列1'},
      {x: '六月', y: 110, s: '系列1'},
    ]
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
  <div class="dr-line-chart" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-line-chart {
  width: 100%;
  height: 100%;
}
</style>
