<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrHorizontalBarChart',
})
</script>
<script setup lang="ts">
import type {DrHorizontalBarChartConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts"
import {getChartDatasetFieldNames, shouldUseDefaultChartData} from "@/dataRoom/components/_shared/chart-data-defaults.ts"

const {chart} = defineProps<{
  chart: DrHorizontalBarChartConfig
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
 * 格式化数值
 */
const formatValue = (value: number, format: string): string => {
  switch (format) {
    case 'integer':
      return Math.round(value).toString()
    case 'float1':
      return value.toFixed(1)
    case 'float2':
      return value.toFixed(2)
    case 'percent':
      return Math.round(value) + '%'
    case 'percent1':
      return value.toFixed(1) + '%'
    case 'thousand':
      return Math.round(value).toLocaleString()
    case 'thousand1':
      return value.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
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
  // 注意：对于横向条形图，xField 是数值字段，yField 是类目字段
  const xFieldNames = getChartDatasetFieldNames(chart, 'xField', ['x'])
  const yFieldNames = getChartDatasetFieldNames(chart, 'yField', ['y'])
  const seriesFieldNames = getChartDatasetFieldNames(chart, 'seriesField')
  const yFieldName = yFieldNames[0] || 'y'
  const seriesFieldName = seriesFieldNames[0] || ''

  // 提取类目数据（Y轴类目）
  const categories = [...new Set(data.map((item: any) => item[yFieldName]))]

  // 构建系列数据
  let seriesList: echarts.BarSeriesOption[] = []

  if (seriesFieldName && data.some((item: any) => item[seriesFieldName])) {
    // 有分组字段 - 按分组生成多个系列
    const seriesNames = [...new Set(data.map((item: any) => item[seriesFieldName]))]
    const xFieldNameFirst = xFieldNames[0] || 'x'

    seriesList = seriesNames.map((sName, idx) => {
      const seriesData = categories.map(cat => {
        const item = data.find((d: any) => d[yFieldName] === cat && d[seriesFieldName] === sName)
        return item ? Number(item[xFieldNameFirst]) || 0 : 0
      })
      return buildSeriesItem(String(sName), seriesData, idx)
    })
  } else {
    // 无分组字段 - 每个 xField 作为一个系列
    seriesList = xFieldNames.map((fieldName, idx) => {
      const seriesData = categories.map(cat => {
        const item = data.find((d: any) => d[yFieldName] === cat)
        return item ? Number(item[fieldName]) || 0 : 0
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

  // X轴标签格式化
  const xAxisLabelFormat = props.xAxis.axisLabel.format
  const xAxisLabelFormatter = xAxisLabelFormat !== 'default'
    ? (value: number) => formatValue(value, xAxisLabelFormat)
    : undefined

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
      type: 'value',
      name: props.xAxis.name || undefined,
      min: props.xAxis.range.auto ? undefined : props.xAxis.range.min,
      max: props.xAxis.range.auto ? undefined : props.xAxis.range.max,
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
        formatter: xAxisLabelFormatter as any
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
      type: props.yAxis.type as any,
      data: categories,
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
        fontFamily: props.yAxis.axisLabel.fontFamily,
        width: props.yAxis.axisLabel.maxWidth,
        overflow: 'truncate',
        ellipsis: '...'
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
const buildSeriesItem = (name: string, data: number[], index: number): echarts.BarSeriesOption => {
  const props = chart.props
  const colorIndex = index % props.series.colors.length
  const baseColor = props.series.colors[colorIndex] || '#5470c6'

  // 颜色处理（支持渐变）
  let itemColor: any = baseColor
  if (props.series.gradient.enabled) {
    const gradientConfig = props.series.gradient.direction === 'horizontal'
      ? {x: 0, y: 0, x2: 1, y2: 0}
      : {x: 0, y: 0, x2: 0, y2: 1}
    itemColor = {
      type: 'linear',
      ...gradientConfig,
      colorStops: [
        {offset: 0, color: baseColor},
        {offset: 1, color: adjustColorOpacity(baseColor, 0.3)}
      ]
    }
  }

  // 标签格式化
  const labelFormat = props.series.label.format
  const labelFormatter = labelFormat !== 'default'
    ? (params: any) => formatValue(params.value, labelFormat)
    : undefined

  const seriesItem: echarts.BarSeriesOption = {
    name: name,
    type: 'bar',
    data: data,
    stack: props.series.displayMode === 'stack' ? 'total' : undefined,
    barWidth: props.series.barWidth || undefined,
    barMaxWidth: props.series.barMaxWidth,
    barCategoryGap: props.series.barCategoryGap,
    barGap: props.series.barGap,
    showBackground: props.series.backgroundBar.show,
    backgroundStyle: {
      color: props.series.backgroundBar.color
    },
    itemStyle: {
      color: itemColor,
      borderRadius: props.series.borderRadius
    },
    label: {
      show: props.series.label.show,
      position: props.series.label.position,
      fontSize: props.series.label.fontSize,
      color: props.series.label.color,
      fontWeight: props.series.label.fontWeight as any,
      formatter: labelFormatter as any
    }
  }

  return seriesItem
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
      x: params.value,
      y: params.name,
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
  if (shouldUseDefaultChartData(chart) && chartData.value.length === 0) {
    chartData.value = [
      {y: '产品A', x: 120},
      {y: '产品B', x: 200},
      {y: '产品C', x: 150},
      {y: '产品D', x: 80},
      {y: '产品E', x: 170},
      {y: '产品F', x: 110},
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
  <div class="dr-horizontal-bar-chart" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-horizontal-bar-chart {
  width: 100%;
  height: 100%;
}
</style>
