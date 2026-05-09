<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE,
})
</script>
<script setup lang="ts">
import type {DrBubbleChartConfig} from './install.ts'
import {ref, watch, onMounted, onBeforeUnmount, nextTick} from "vue"
import * as echarts from 'echarts'
import {useDrComponent} from "@/dataroom-packages/hooks/use-dr-component"
import type {ComponentExpose} from "@/dataroom-packages/components/type/ComponentExpose.ts"

const {chart} = defineProps<{
  chart: DrBubbleChartConfig
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
 * 根据 sizeField 值映射到气泡像素大小
 */
const mapSizeToPixel = (value: number, minVal: number, maxVal: number): number => {
  const props = chart.props
  const [minSize, maxSize] = props.series.sizeRange
  if (maxVal === minVal) return (minSize + maxSize) / 2
  const ratio = (value - minVal) / (maxVal - minVal)
  return minSize + ratio * (maxSize - minSize)
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
  const sizeFieldNames = chart.dataset?.fields?.sizeField || ['size']
  const colorFieldNames = chart.dataset?.fields?.colorField || []
  const nameFieldNames = chart.dataset?.fields?.nameField || []

  const xFieldName = xFieldNames[0] || 'x'
  const yFieldName = yFieldNames[0] || 'y'
  const sizeFieldName = sizeFieldNames[0] || 'size'
  const colorFieldName = colorFieldNames[0] || ''
  const nameFieldName = nameFieldNames[0] || ''

  // 计算 sizeField 的范围（用于映射气泡大小）
  let sizeMin = Infinity
  let sizeMax = -Infinity
  data.forEach((item: any) => {
    const sizeVal = Number(item[sizeFieldName])
    if (!isNaN(sizeVal)) {
      if (sizeVal < sizeMin) sizeMin = sizeVal
      if (sizeVal > sizeMax) sizeMax = sizeVal
    }
  })
  if (!isFinite(sizeMin)) sizeMin = 0
  if (!isFinite(sizeMax)) sizeMax = 1

  // 形状映射
  const symbolMap: Record<string, string> = {
    circle: 'circle',
    rect: 'rect',
    triangle: 'triangle',
    diamond: 'diamond'
  }
  const symbol = symbolMap[props.series.shape] || 'circle'

  // 构建系列数据（按 colorField 分组）
  let seriesList: echarts.ScatterSeriesOption[] = []

  if (colorFieldName && data.some((item: any) => item[colorFieldName] !== undefined)) {
    // 有分组字段 - 按分组生成多个系列
    const groups = [...new Set(data.map((item: any) => item[colorFieldName]))]
    seriesList = groups.map((groupName, idx) => {
      const groupData = data
        .filter((item: any) => item[colorFieldName] === groupName)
        .map((item: any) => {
          const xVal = Number(item[xFieldName]) || 0
          const yVal = Number(item[yFieldName]) || 0
          const sizeVal = Number(item[sizeFieldName]) || 0
          const nameVal = nameFieldName ? (item[nameFieldName] || '') : ''
          return [xVal, yVal, sizeVal, nameVal]
        })

      const colorIndex = idx % props.series.colors.length
      const baseColor = props.series.colors[colorIndex] || '#5470c6'

      return {
        name: String(groupName),
        type: 'scatter' as const,
        data: groupData,
        symbol: symbol,
        symbolSize: (dataItem: any) => {
          const sizeVal = Array.isArray(dataItem) ? dataItem[2] : 0
          return mapSizeToPixel(sizeVal, sizeMin, sizeMax)
        },
        itemStyle: {
          color: baseColor,
          opacity: props.series.opacity,
          borderWidth: props.series.borderWidth,
          borderColor: props.series.borderColor || baseColor
        },
        label: {
          show: props.series.label.show,
          formatter: (params: any) => {
            const d = params.data
            switch (props.series.label.content) {
              case 'name': return Array.isArray(d) ? d[3] : ''
              case 'value': return Array.isArray(d) ? `${d[0]}, ${d[1]}` : ''
              case 'x': return Array.isArray(d) ? String(d[0]) : ''
              case 'y': return Array.isArray(d) ? String(d[1]) : ''
              case 'size': return Array.isArray(d) ? String(d[2]) : ''
              default: return ''
            }
          },
          fontSize: props.series.label.fontSize,
          color: props.series.label.color,
          fontWeight: props.series.label.fontWeight as any
        },
        emphasis: {
          scale: props.series.emphasis.scale,
          itemStyle: {
            borderWidth: props.series.emphasis.borderWidth,
            shadowBlur: props.series.emphasis.shadowBlur,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    })
  } else {
    // 无分组字段 - 所有数据作为一个系列
    const seriesData = data.map((item: any) => {
      const xVal = Number(item[xFieldName]) || 0
      const yVal = Number(item[yFieldName]) || 0
      const sizeVal = Number(item[sizeFieldName]) || 0
      const nameVal = nameFieldName ? (item[nameFieldName] || '') : ''
      return [xVal, yVal, sizeVal, nameVal]
    })

    const baseColor = props.series.colors[0] || '#5470c6'

    seriesList = [{
      name: '气泡',
      type: 'scatter' as const,
      data: seriesData,
      symbol: symbol,
      symbolSize: (dataItem: any) => {
        const sizeVal = Array.isArray(dataItem) ? dataItem[2] : 0
        return mapSizeToPixel(sizeVal, sizeMin, sizeMax)
      },
      itemStyle: {
        color: baseColor,
        opacity: props.series.opacity,
        borderWidth: props.series.borderWidth,
        borderColor: props.series.borderColor || baseColor
      },
      label: {
        show: props.series.label.show,
        formatter: (params: any) => {
          const d = params.data
          switch (props.series.label.content) {
            case 'name': return Array.isArray(d) ? d[3] : ''
            case 'value': return Array.isArray(d) ? `${d[0]}, ${d[1]}` : ''
            case 'x': return Array.isArray(d) ? String(d[0]) : ''
            case 'y': return Array.isArray(d) ? String(d[1]) : ''
            case 'size': return Array.isArray(d) ? String(d[2]) : ''
            default: return ''
          }
        },
        fontSize: props.series.label.fontSize,
        color: props.series.label.color,
        fontWeight: props.series.label.fontWeight as any
      },
      emphasis: {
        scale: props.series.emphasis.scale,
        itemStyle: {
          borderWidth: props.series.emphasis.borderWidth,
          shadowBlur: props.series.emphasis.shadowBlur,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
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
      },
      formatter: (params: any) => {
        const d = params.data
        if (!Array.isArray(d)) return ''
        let html = `<strong>${params.seriesName}</strong><br/>`
        html += `X: ${d[0]}<br/>`
        html += `Y: ${d[1]}<br/>`
        html += `Size: ${d[2]}`
        if (d[3]) html += `<br/>Name: ${d[3]}`
        return html
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
    const d = params.data
    canvasInst.triggerChartBehavior(chart.id, 'click', {
      x: Array.isArray(d) ? d[0] : 0,
      y: Array.isArray(d) ? d[1] : 0,
      size: Array.isArray(d) ? d[2] : 0,
      name: Array.isArray(d) ? d[3] : ''
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
      {x: 10, y: 20, size: 30, name: 'A', group: '组1'},
      {x: 25, y: 45, size: 60, name: 'B', group: '组1'},
      {x: 40, y: 30, size: 45, name: 'C', group: '组1'},
      {x: 55, y: 65, size: 80, name: 'D', group: '组2'},
      {x: 70, y: 50, size: 25, name: 'E', group: '组2'},
      {x: 85, y: 75, size: 55, name: 'F', group: '组2'},
      {x: 30, y: 80, size: 40, name: 'G', group: '组3'},
      {x: 60, y: 35, size: 70, name: 'H', group: '组3'},
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
  <div class="dr-bubble-chart" :id="chart.id" ref="chartRef"></div>
</template>

<style scoped>
.dr-bubble-chart {
  width: 100%;
  height: 100%;
}
</style>
