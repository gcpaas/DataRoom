import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts"
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrRadarChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** 雷达坐标轴配置 */
  radar: {
    /** 形状 */
    shape: 'polygon' | 'circle'
    /** 半径 */
    radius: string
    /** 起始角度 */
    startAngle: number
    /** 分割段数 */
    splitNumber: number
    /** 轴线 */
    axisLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
    }
    /** 分割线 */
    splitLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
    }
    /** 分割区域 */
    splitArea: {
      show: boolean
      colors: string[]
    }
    /** 轴标签 */
    axisLabel: {
      show: boolean
      fontSize: number
      color: string
    }
  }
  /** 指示器配置 */
  indicator: {
    /** 名称样式 */
    nameStyle: {
      fontSize: number
      color: string
      fontWeight: string
      fontFamily: string
    }
    /** 名称与轴的距离 */
    nameGap: number
    /** 最大值(null=自动) */
    max: number | null
  }
  /** 图例配置 */
  legend: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    textStyle: {
      fontSize: number
      color: string
      fontWeight: string
    }
    itemGap: number
  }
  /** 提示框配置 */
  tooltip: {
    show: boolean
    trigger: 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
  }
  /** 系列配置 */
  series: {
    /** 颜色列表 */
    colors: string[]
    /** 线宽 */
    lineWidth: number
    /** 线条样式 */
    lineStyle: 'solid' | 'dashed' | 'dotted'
    /** 区域填充 */
    areaStyle: {
      show: boolean
      opacity: number
    }
    /** 标记点 */
    symbol: {
      show: boolean
      type: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
      size: number
      borderWidth: number
    }
    /** 数据标签 */
    label: {
      show: boolean
      fontSize: number
      color: string
      format: 'default' | 'integer' | 'float1' | 'float2' | 'percent' | 'percent1' | 'thousand' | 'thousand1'
    }
  }
  /** 动画配置 */
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

/**
 * 定义组件配置类型
 */
export type DrRadarChartConfig = ChartConfig<DrRadarChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrRadarChartConfig => {
  return createChartConfig<DrRadarChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrRadarChart',
    {
      global: {
        padding: [40, 40, 40, 40]
      },
      radar: {
        shape: 'polygon',
        radius: '65%',
        startAngle: 90,
        splitNumber: 5,
        axisLine: {
          show: true,
          color: '#cccccc',
          width: 1,
          type: 'solid'
        },
        splitLine: {
          show: true,
          color: '#dddddd',
          width: 1,
          type: 'solid'
        },
        splitArea: {
          show: false,
          colors: ['rgba(200, 200, 200, 0.1)', 'rgba(200, 200, 200, 0.05)']
        },
        axisLabel: {
          show: false,
          fontSize: 11,
          color: '#999999'
        }
      },
      indicator: {
        nameStyle: {
          fontSize: 12,
          color: '#666666',
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei'
        },
        nameGap: 15,
        max: null
      },
      legend: {
        show: true,
        position: 'top',
        textStyle: {
          fontSize: 12,
          color: '#666666',
          fontWeight: 'normal'
        },
        itemGap: 16
      },
      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        }
      },
      series: {
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
        lineWidth: 2,
        lineStyle: 'solid',
        areaStyle: {
          show: true,
          opacity: 0.3
        },
        symbol: {
          show: true,
          type: 'circle',
          size: 4,
          borderWidth: 1
        },
        label: {
          show: false,
          fontSize: 11,
          color: '#333333',
          format: 'default'
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '雷达图',
      w: 400,
      h: 400
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '区域单击',
    desc: '鼠标点击雷达区域时触发',
    method: 'click',
    paramsList: [
      {name: 'seriesName', desc: '点击区域的系列名', type: 'string'},
      {name: 'values', desc: '该系列的所有维度数值', type: 'number[]'},
      {name: 'indicators', desc: '对应的指示器名称列表', type: 'string[]'}
    ],
  },
  {
    name: '图例点击',
    desc: '点击图例项时触发',
    method: 'legendClick',
    paramsList: [
      {name: 'name', desc: '图例名称', type: 'string'},
      {name: 'selected', desc: '当前图例选中状态', type: 'boolean'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'indicatorField',
    desc: '维度/指示器名称字段（角度轴类目）',
    required: true,
    multiple: false
  },
  {
    name: 'valueField',
    desc: '数值字段（半径轴数值）',
    required: true,
    multiple: false
  },
  {
    name: 'seriesField',
    desc: '系列分组字段（多组数据对比）',
    required: false,
    multiple: false
  }
]

const mockDataset: ChartMockDataset = {
  dataset: [
    {indicator: '性能', value: 86, series: '当前'},
  ],
  fields: [
    {
      name: 'indicatorField',
      bindName: 'indicator',
    },
    {
      name: 'valueField',
      bindName: 'value',
    },
    {
      name: 'seriesField',
      bindName: 'series',
    },
  ],
}

export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
