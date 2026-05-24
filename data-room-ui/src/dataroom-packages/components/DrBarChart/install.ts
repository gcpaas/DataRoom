import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrBarChartPropsInterface {
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
    type: 'category' | 'time'
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
  /** 系列(柱子)配置 */
  series: {
    /** 展示形式 */
    displayMode: 'group' | 'stack'
    /** 柱子宽度(px), null=自适应 */
    barWidth: number | null
    /** 柱子最大宽度(px) */
    barMaxWidth: number
    /** 类目间距 */
    barCategoryGap: string
    /** 组内间距 */
    barGap: string
    /** 圆角 [左上, 右上, 右下, 左下] */
    borderRadius: [number, number, number, number]
    /** 颜色列表 */
    colors: string[]
    /** 渐变配置 */
    gradient: {
      enabled: boolean
      direction: 'vertical' | 'horizontal'
    }
    /** 柱子标签 */
    label: {
      show: boolean
      position: 'top' | 'inside' | 'bottom' | 'left' | 'right'
      fontSize: number
      color: string
      fontWeight: string
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
export type DrBarChartConfig = ChartConfig<DrBarChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrBarChartConfig => {
  return createChartConfig<DrBarChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrBarChart',
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
        displayMode: 'group',
        barWidth: null,
        barMaxWidth: 40,
        barCategoryGap: '30%',
        barGap: '20%',
        borderRadius: [2, 2, 0, 0],
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
        gradient: {
          enabled: false,
          direction: 'vertical'
        },
        label: {
          show: false,
          position: 'top',
          fontSize: 12,
          color: '#333333',
          fontWeight: 'normal'
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '柱状图',
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
    name: '单击',
    desc: '鼠标点击柱子时触发',
    method: 'click',
    paramsList: [
      {name: 'x', desc: '点击柱子的类目值', type: 'string'},
      {name: 'y', desc: '点击柱子的数值', type: 'number'},
      {name: 'seriesName', desc: '点击柱子的系列名', type: 'string'}
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
