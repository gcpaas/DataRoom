<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrRadarChart',
})
</script>
<script setup lang="ts">
import type {DrRadarChartConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataRoom/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataRoom/components/type/ComponentExpose.ts"
import {getChartDatasetFieldNames, shouldUseDefaultChartData} from "@/dataRoom/components/_shared/chart-data-defaults.ts"

const {chart} = defineProps<{
  chart: DrRadarChartConfig
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
 * 格式化数值标签
 */
const formatLabel = (value: number, format: string): string => {
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
  const indicatorFieldNames = getChartDatasetFieldNames(chart, 'indicatorField', ['indicator'])
  const valueFieldNames = getChartDatasetFieldNames(chart, 'valueField', ['value'])
  const seriesFieldNames = getChartDatasetFieldNames(chart, 'seriesField')
  const indicatorFieldName = indicatorFieldNames[0] || 'indicator'
  const valueFieldName = valueFieldNames[0] || 'value'
  const seriesFieldName = seriesFieldNames[0] || ''

  // 提取指示器（维度）列表
  const indicators = [...new Set(data.map((item: any) => item[indicatorFieldName]))]

  // 构建指示器配置
  const indicatorConfig = indicators.map(name => {
    // 如果设置了全局max则使用，否则自动计算
    if (props.indicator.max !== null) {
      return {name: String(name), max: props.indicator.max}
    }
    // 自动计算该维度的最大值
    const maxVal = Math.max(...data
      .filter((item: any) => item[indicatorFieldName] === name)
      .map((item: any) => Number(item[valueFieldName]) || 0)
    )
    return {name: String(name), max: maxVal > 0 ? Math.ceil(maxVal * 1.2) : 100}
  })

  // 构建系列数据
  let radarData: any[] = []

  if (seriesFieldName && data.some((item: any) => item[seriesFieldName])) {
    // 有分组字段 - 按分组生成多个系列数据
    const seriesNames = [...new Set(data.map((item: any) => item[seriesFieldName]))]
    radarData = seriesNames.map((sName, idx) => {
      const values = indicators.map(ind => {
        const item = data.find((d: any) => d[indicatorFieldName] === ind && d[seriesFieldName] === sName)
        return item ? Number(item[valueFieldName]) || 0 : 0
      })
      const colorIndex = idx % props.series.colors.length
      return {
        name: String(sName),
        value: values,
        lineStyle: {
          width: props.series.lineWidth,
          type: props.series.lineStyle,
          color: props.series.colors[colorIndex]
        },
        areaStyle: props.series.areaStyle.show ? {
          opacity: props.series.areaStyle.opacity,
          color: props.series.colors[colorIndex]
        } : undefined,
        itemStyle: {
          color: props.series.colors[colorIndex],
          borderWidth: props.series.symbol.borderWidth
        },
        symbol: props.series.symbol.show ? props.series.symbol.type : 'none',
        symbolSize: props.series.symbol.size,
        label: {
          show: props.series.label.show,
          fontSize: props.series.label.fontSize,
          color: props.series.label.color,
          formatter: (params: any) => {
            return formatLabel(params.value, props.series.label.format)
          }
        }
      }
    })
  } else {
    // 无分组字段 - 所有数据作为单系列
    const values = indicators.map(ind => {
      const item = data.find((d: any) => d[indicatorFieldName] === ind)
      return item ? Number(item[valueFieldName]) || 0 : 0
    })
    radarData = [{
      name: valueFieldName,
      value: values,
      lineStyle: {
        width: props.series.lineWidth,
        type: props.series.lineStyle,
        color: props.series.colors[0]
      },
      areaStyle: props.series.areaStyle.show ? {
        opacity: props.series.areaStyle.opacity,
        color: props.series.colors[0]
      } : undefined,
      itemStyle: {
        color: props.series.colors[0],
        borderWidth: props.series.symbol.borderWidth
      },
      symbol: props.series.symbol.show ? props.series.symbol.type : 'none',
      symbolSize: props.series.symbol.size,
      label: {
        show: props.series.label.show,
        fontSize: props.series.label.fontSize,
        color: props.series.label.color,
        formatter: (params: any) => {
          return formatLabel(params.value, props.series.label.format)
        }
      }
    }]
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
    radar: {
      shape: props.radar.shape,
      radius: props.radar.radius,
      startAngle: props.radar.startAngle,
      splitNumber: props.radar.splitNumber,
      center: ['50%', '50%'],
      indicator: indicatorConfig,
      axisLine: {
        show: props.radar.axisLine.show,
        lineStyle: {
          color: props.radar.axisLine.color,
          width: props.radar.axisLine.width,
          type: props.radar.axisLine.type
        }
      },
      splitLine: {
        show: props.radar.splitLine.show,
        lineStyle: {
          color: props.radar.splitLine.color,
          width: props.radar.splitLine.width,
          type: props.radar.splitLine.type
        }
      },
      splitArea: {
        show: props.radar.splitArea.show,
        areaStyle: {
          color: props.radar.splitArea.colors
        }
      },
      axisLabel: {
        show: props.radar.axisLabel.show,
        fontSize: props.radar.axisLabel.fontSize,
        color: props.radar.axisLabel.color
      },
      axisName: {
        fontSize: props.indicator.nameStyle.fontSize,
        color: props.indicator.nameStyle.color,
        fontWeight: props.indicator.nameStyle.fontWeight as any,
        fontFamily: props.indicator.nameStyle.fontFamily
      },
      nameGap: props.indicator.nameGap,
    } as any,
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
    series: [{
      type: 'radar',
      data: radarData
    }],
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
  chartInstance.on('click', (params: any) => {
    const indicatorFieldNames = getChartDatasetFieldNames(chart, 'indicatorField', ['indicator'])
    const indicatorFieldName = indicatorFieldNames[0] || 'indicator'
    const indicators = [...new Set(chartData.value.map((item: any) => item[indicatorFieldName]))]

    canvasInst.triggerChartBehavior(chart.id, 'click', {
      seriesName: params.name,
      values: params.value,
      indicators: indicators.map(String)
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
      {indicator: '攻击', value: 80, series: '战士'},
      {indicator: '防御', value: 90, series: '战士'},
      {indicator: '速度', value: 60, series: '战士'},
      {indicator: '智力', value: 40, series: '战士'},
      {indicator: '生命', value: 85, series: '战士'},
      {indicator: '攻击', value: 50, series: '法师'},
      {indicator: '防御', value: 40, series: '法师'},
      {indicator: '速度', value: 70, series: '法师'},
      {indicator: '智力', value: 95, series: '法师'},
      {indicator: '生命', value: 55, series: '法师'},
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
  <div class="dr-radar-chart" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-radar-chart {
  width: 100%;
  height: 100%;
}
</style>
