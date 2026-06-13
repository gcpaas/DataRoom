<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrPieChart',
})
</script>
<script setup lang="ts">
import type {DrPieChartConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"
import {getChartDatasetFieldNames, shouldUseDefaultChartData} from "@/dataroom-packages/components/_shared/chart-data-defaults.ts"

const {chart} = defineProps<{
  chart: DrPieChartConfig
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
      return value.toString()
  }
}

/**
 * 处理数据合并（小数合并）
 */
const getMergedData = (data: any[], nameField: string, valueField: string) => {
  const props = chart.props
  let pieData = data.map(item => ({
    name: item[nameField] || '',
    value: Number(item[valueField]) || 0
  }))

  // 按值降序排序
  pieData.sort((a, b) => b.value - a.value)

  if (props.series.merge.enabled && pieData.length > props.series.merge.maxCount) {
    const mainData = pieData.slice(0, props.series.merge.maxCount - 1)
    const restData = pieData.slice(props.series.merge.maxCount - 1)
    const restSum = restData.reduce((sum, item) => sum + item.value, 0)
    mainData.push({name: props.series.merge.mergeLabel, value: restSum})
    pieData = mainData
  }

  return pieData
}

/**
 * 构建标签 formatter
 */
const buildLabelFormatter = (content: string): string | ((params: any) => string) => {
  switch (content) {
    case 'name':
      return '{b}'
    case 'value':
      return '{c}'
    case 'percent':
      return '{d}%'
    case 'name+value':
      return (params: any) => `${params.name}\n${params.value}`
    case 'name+percent':
      return (params: any) => `${params.name}\n${params.percent}%`
    default:
      return '{b}'
  }
}

/**
 * 根据数据和配置构建 ECharts option
 */
const buildOption = () => {
  const props = chart.props
  const data = chartData.value

  // 解析数据集字段映射
  const nameFieldNames = getChartDatasetFieldNames(chart, 'nameField', ['name'])
  const valueFieldNames = getChartDatasetFieldNames(chart, 'valueField', ['value'])
  const nameField = nameFieldNames[0] || 'name'
  const valueField = valueFieldNames[0] || 'value'

  // 获取饼图数据（含合并处理）
  const pieData = getMergedData(data, nameField, valueField)

  // 图例位置映射
  const legendPositionMap: Record<string, any> = {
    top: {top: 'auto', bottom: 'auto', left: 'center', orient: 'horizontal'},
    bottom: {top: 'auto', bottom: 0, left: 'center', orient: 'horizontal'},
    left: {top: 'center', left: 0, orient: 'vertical'},
    right: {top: 'center', right: 0, orient: 'vertical'},
  }
  const legendPos = legendPositionMap[props.legend.position] || legendPositionMap.bottom

  // 标签位置映射
  const labelPosition = props.label.position === 'spider' ? 'outside' : props.label.position

  // 构建系列
  const seriesOption: any = {
    type: 'pie',
    radius: [props.pie.innerRadius + '%', props.pie.outerRadius + '%'],
    center: props.pie.center,
    startAngle: props.pie.startAngle,
    roseType: props.pie.roseType || undefined,
    selectedMode: props.series.selectedMode || false,
    selectedOffset: props.series.selectedOffset,
    minAngle: props.series.minAngle,
    data: pieData,
    itemStyle: {
      borderColor: props.pie.borderColor,
      borderWidth: props.pie.borderWidth,
      borderRadius: props.pie.borderRadius
    },
    label: {
      show: props.label.show,
      position: labelPosition,
      formatter: buildLabelFormatter(props.label.content),
      fontSize: props.label.fontSize,
      color: props.label.color || undefined,
      fontWeight: props.label.fontWeight as any
    },
    labelLine: {
      show: props.label.show && props.label.guideLine.show && props.label.position !== 'inside',
      length: props.label.guideLine.length,
      length2: props.label.guideLine.length2,
      lineStyle: {
        width: props.label.guideLine.lineWidth,
        color: props.label.guideLine.color || undefined
      }
    },
    labelLayout: props.label.position === 'spider' ? {
      alignTo: 'labelLine',
      hideOverlap: true
    } : undefined,
    color: props.series.colors
  }

  // 构建 graphic (中心内容，仅环形图有效)
  let graphic: any[] = []
  if (props.pie.innerRadius > 0 && props.centerContent.show) {
    if (props.centerContent.type === 'text') {
      // 计算中心数值
      let centerValueText = ''
      if (props.centerContent.value.field) {
        const fieldData = data.find((item: any) => item[nameField] === props.centerContent.value.field)
        if (fieldData) {
          centerValueText = formatValue(Number(fieldData[valueField]) || 0, props.centerContent.value.format)
        }
      } else {
        // 默认显示总计
        const total = pieData.reduce((sum, item) => sum + item.value, 0)
        centerValueText = formatValue(total, props.centerContent.value.format)
      }
      centerValueText = props.centerContent.value.prefix + centerValueText + props.centerContent.value.suffix

      graphic = [
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: props.centerContent.title.text,
            fontSize: props.centerContent.title.fontSize,
            fill: props.centerContent.title.color,
            fontWeight: props.centerContent.title.fontWeight,
            textAlign: 'center',
            y: props.centerContent.title.offsetY
          }
        },
        {
          type: 'text',
          left: 'center',
          top: 'middle',
          style: {
            text: centerValueText,
            fontSize: props.centerContent.value.fontSize,
            fill: props.centerContent.value.color,
            fontWeight: props.centerContent.value.fontWeight,
            textAlign: 'center',
            y: props.centerContent.value.offsetY
          }
        }
      ]
    } else if (props.centerContent.type === 'image' && props.centerContent.image.url) {
      graphic = [
        {
          type: 'image',
          left: 'center',
          top: 'middle',
          style: {
            image: props.centerContent.image.url,
            width: props.centerContent.image.width,
            height: props.centerContent.image.height,
            x: -props.centerContent.image.width / 2,
            y: -props.centerContent.image.height / 2
          }
        }
      ]
    }
  }

  // tooltip formatter
  const tooltipFormatter = props.tooltip.showPercent
    ? (params: any) => `${params.marker} ${params.name}: ${params.value} (${params.percent}%)`
    : (params: any) => `${params.marker} ${params.name}: ${params.value}`

  const option: echarts.EChartsOption = {
    tooltip: {
      show: props.tooltip.show,
      trigger: props.tooltip.trigger,
      backgroundColor: props.tooltip.backgroundColor,
      borderColor: props.tooltip.borderColor,
      textStyle: {
        fontSize: props.tooltip.textStyle.fontSize,
        color: props.tooltip.textStyle.color
      },
      formatter: tooltipFormatter
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
    series: [seriesOption],
    graphic: graphic.length > 0 ? graphic : undefined,
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
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      name: params.name,
      value: params.value,
      percent: params.percent
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
      {name: '分类A', value: 335},
      {name: '分类B', value: 310},
      {name: '分类C', value: 234},
      {name: '分类D', value: 135},
      {name: '分类E', value: 148},
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
  <div class="dr-pie-chart" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-pie-chart {
  width: 100%;
  height: 100%;
}
</style>
