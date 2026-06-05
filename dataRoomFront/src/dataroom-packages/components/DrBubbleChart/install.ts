import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrBubbleChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** X 轴配置 */
  xAxis: {
    /** 是否显示 */
    show: boolean
    /** 轴名称 */
    name: string
    /** 数据类型 */
    type: 'value' | 'category' | 'time'
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
    trigger: 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
  }
  /** 系列(气泡)配置 */
  series: {
    /** 气泡大小范围 [最小, 最大] (px) */
    sizeRange: [number, number]
    /** 颜色列表 */
    colors: string[]
    /** 透明度 */
    opacity: number
    /** 边框宽度 */
    borderWidth: number
    /** 边框颜色 */
    borderColor: string
    /** 形状 */
    shape: 'circle' | 'rect' | 'triangle' | 'diamond'
    /** 数据标签 */
    label: {
      show: boolean
      content: 'name' | 'value' | 'x' | 'y' | 'size'
      fontSize: number
      color: string
      fontWeight: string
    }
    /** 高亮(hover)效果 */
    emphasis: {
      scale: number
      borderWidth: number
      shadowBlur: number
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
export type DrBubbleChartConfig = ChartConfig<DrBubbleChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrBubbleChartConfig => {
  return createChartConfig<DrBubbleChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrBubbleChart',
    {
      global: {
        padding: [40, 30, 30, 50]
      },
      xAxis: {
        show: true,
        name: '',
        type: 'value',
        range: {
          auto: true,
          min: 0,
          max: 100
        },
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
          show: true,
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
          show: true,
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
          show: true,
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
        trigger: 'item',
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        }
      },
      series: {
        sizeRange: [10, 60],
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
        opacity: 0.7,
        borderWidth: 1,
        borderColor: '',
        shape: 'circle',
        label: {
          show: false,
          content: 'name',
          fontSize: 11,
          color: '#333333',
          fontWeight: 'normal'
        },
        emphasis: {
          scale: 1.2,
          borderWidth: 2,
          shadowBlur: 10
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '气泡图',
      w: 450,
      h: 350
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '气泡单击',
    desc: '鼠标点击气泡时触发',
    method: 'click',
    paramsList: [
      {name: 'x', desc: '点击气泡的X轴值', type: 'number'},
      {name: 'y', desc: '点击气泡的Y轴值', type: 'number'},
      {name: 'size', desc: '点击气泡的大小值', type: 'number'},
      {name: 'name', desc: '点击气泡的分类名', type: 'string'}
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
    desc: 'X轴数值字段',
    required: true,
    multiple: false
  },
  {
    name: 'yField',
    desc: 'Y轴数值字段',
    required: true,
    multiple: false
  },
  {
    name: 'sizeField',
    desc: '气泡大小映射字段',
    required: false,
    multiple: false
  },
  {
    name: 'colorField',
    desc: '颜色分组/映射字段',
    required: false,
    multiple: false
  },
  {
    name: 'nameField',
    desc: '数据项名称字段',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
