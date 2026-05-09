import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrLineChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** X 轴配置 */
  xAxis: {
    /** 是否显示 */
    show: boolean
    /** 数据类型 */
    type: 'category' | 'time' | 'value'
    /** 轴线 */
    axisLine: {
      show: boolean
      color: string
      width: number
    }
    /** 轴标签 */
    axisLabel: {
      show: boolean
      fontSize: number
      color: string
      fontWeight: string
      fontFamily: string
      /** 旋转角度 */
      rotate: number
    }
    /** 刻度线 */
    axisTick: {
      show: boolean
      length: number
      color: string
    }
    /** 网格线 */
    splitLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
    }
  }
  /** Y 轴配置 */
  yAxis: {
    /** 是否显示 */
    show: boolean
    /** 轴名称 */
    name: string
    /** 显示范围 */
    range: {
      auto: boolean
      min: number
      max: number
    }
    /** 轴线 */
    axisLine: {
      show: boolean
      color: string
      width: number
    }
    /** 轴标签 */
    axisLabel: {
      show: boolean
      fontSize: number
      color: string
      fontWeight: string
      fontFamily: string
    }
    /** 刻度线 */
    axisTick: {
      show: boolean
      length: number
      color: string
    }
    /** 网格线 */
    splitLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
    }
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
    trigger: 'axis' | 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
  }
  /** 系列(折线)配置 */
  series: {
    /** 折线类型 */
    lineType: 'line' | 'smooth' | 'step'
    /** 线宽 */
    lineWidth: number
    /** 线条样式 */
    lineStyle: 'solid' | 'dashed' | 'dotted'
    /** 颜色列表 */
    colors: string[]
    /** 数据点标记 */
    symbol: {
      show: boolean
      type: 'circle' | 'rect' | 'triangle' | 'diamond' | 'pin' | 'arrow' | 'none'
      size: number
      borderWidth: number
      borderColor: string
    }
    /** 数据标签 */
    label: {
      show: boolean
      position: 'top' | 'bottom' | 'left' | 'right' | 'inside'
      fontSize: number
      color: string
      fontWeight: string
      format: 'default' | 'integer' | 'float1' | 'float2' | 'percent' | 'percent1' | 'thousand' | 'thousand1'
    }
    /** 面积填充 */
    areaStyle: {
      show: boolean
      opacity: number
      gradient: boolean
    }
    /** 连接空数据 */
    connectNulls: boolean
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
export type DrLineChartConfig = ChartConfig<DrLineChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrLineChartConfig => {
  return createChartConfig<DrLineChartPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      global: {
        padding: [40, 20, 30, 40]
      },
      xAxis: {
        show: true,
        type: 'category',
        axisLine: {
          show: true,
          color: '#cccccc',
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: '#999999',
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
          rotate: 0
        },
        axisTick: {
          show: true,
          length: 5,
          color: '#cccccc'
        },
        splitLine: {
          show: false,
          color: '#eeeeee',
          width: 1,
          type: 'dashed'
        }
      },
      yAxis: {
        show: true,
        name: '',
        range: {
          auto: true,
          min: 0,
          max: 100
        },
        axisLine: {
          show: false,
          color: '#cccccc',
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: '#999999',
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei'
        },
        axisTick: {
          show: false,
          length: 5,
          color: '#cccccc'
        },
        splitLine: {
          show: true,
          color: '#eeeeee',
          width: 1,
          type: 'dashed'
        }
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
        trigger: 'axis',
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        }
      },
      series: {
        lineType: 'line',
        lineWidth: 2,
        lineStyle: 'solid',
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
        symbol: {
          show: true,
          type: 'circle',
          size: 4,
          borderWidth: 1,
          borderColor: ''
        },
        label: {
          show: false,
          position: 'top',
          fontSize: 12,
          color: '#333333',
          fontWeight: 'normal',
          format: 'default'
        },
        areaStyle: {
          show: false,
          opacity: 0.3,
          gradient: true
        },
        connectNulls: false
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '折线图',
      w: 400,
      h: 300
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '数据点单击',
    desc: '鼠标点击折线数据点时触发',
    method: 'click',
    paramsList: [
      {name: 'x', desc: '点击数据点的类目值', type: 'string'},
      {name: 'y', desc: '点击数据点的数值', type: 'number'},
      {name: 'seriesName', desc: '点击数据点的系列名', type: 'string'}
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
    name: 'xField',
    desc: 'X轴/类目字段（维度）',
    required: true,
    multiple: false
  },
  {
    name: 'yField',
    desc: 'Y轴/数值字段（指标）',
    required: true,
    multiple: true
  },
  {
    name: 'seriesField',
    desc: '系列分组字段',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
