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

export interface DrGaugePropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** 仪表盘基础配置 */
  gauge: {
    /** 起始角度（正上方为90，顺时针减小） */
    startAngle: number
    /** 结束角度 */
    endAngle: number
    /** 最小刻度值 */
    min: number
    /** 最大刻度值 */
    max: number
    /** 仪表盘刻度分割段数 */
    splitNumber: number
    /** 是否顺时针增长 */
    clockwise: boolean
    /** 仪表盘半径（百分比或像素值） */
    radius: string
    /** 中心位置 [x, y] */
    center: [string, string]
  }
  /** 轴线（表盘弧线）配置 */
  axisLine: {
    /** 是否显示轴线 */
    show: boolean
    /** 轴线宽度(px) */
    width: number
    /** 轴线两端是否显示为圆形 */
    roundCap: boolean
    /** 轴线渐变色段 [[位置, 颜色], ...]，位置为0~1之间的值 */
    colors: [number, string][]
  }
  /** 刻度线配置 */
  axisTick: {
    /** 是否显示刻度线 */
    show: boolean
    /** 每个分割段内的刻度数 */
    splitNumber: number
    /** 刻度线长度(px) */
    length: number
    /** 刻度线颜色，auto表示自动取轴线颜色 */
    color: string
    /** 刻度线宽度(px) */
    width: number
  }
  /** 分割线配置（大刻度线） */
  splitLine: {
    /** 是否显示分割线 */
    show: boolean
    /** 分割线长度(px) */
    length: number
    /** 分割线颜色，auto表示自动取轴线颜色 */
    color: string
    /** 分割线宽度(px) */
    width: number
  }
  /** 刻度标签配置 */
  axisLabel: {
    /** 是否显示刻度标签 */
    show: boolean
    /** 字号(px) */
    fontSize: number
    /** 标签颜色 */
    color: string
    /** 标签到轴线的距离(px) */
    distance: number
    /** 标签格式化模板，{value}为数值占位符 */
    formatter: string
  }
  /** 指针配置 */
  pointer: {
    /** 是否显示指针 */
    show: boolean
    /** 指针长度（百分比相对于半径） */
    length: string
    /** 指针宽度(px) */
    width: number
    /** 指针颜色，auto表示跟随轴线颜色 */
    color: string
    /** 指针形状类型 */
    type: 'default' | 'arrow' | 'triangle' | 'rect'
  }
  /** 指针锚点（圆心装饰）配置 */
  anchor: {
    /** 是否显示锚点 */
    show: boolean
    /** 锚点大小(px) */
    size: number
    /** 锚点颜色 */
    color: string
    /** 锚点边框宽度(px) */
    borderWidth: number
    /** 锚点边框颜色 */
    borderColor: string
  }
  /** 进度条配置（ECharts 5+） */
  progress: {
    /** 是否显示进度条 */
    show: boolean
    /** 进度条宽度(px)，默认与轴线同宽 */
    width: number
    /** 进度条两端是否圆形 */
    roundCap: boolean
    /** 进度条颜色 */
    color: string
  }
  /** 数值显示配置 */
  detail: {
    /** 是否显示数值 */
    show: boolean
    /** 数值字号(px) */
    fontSize: number
    /** 数值颜色，auto表示跟随轴线颜色 */
    color: string
    /** 数值字重 */
    fontWeight: 'normal' | 'bold' | 300 | 500 | 800
    /** 数值格式化方式 */
    format: 'value' | 'percent' | 'integer' | 'float1' | 'float2'
    /** 数值纵向偏移(%)，正值向下 */
    offsetY: number
    /** 数值前缀文本 */
    prefix: string
    /** 数值后缀文本 */
    suffix: string
  }
  /** 标题文字配置 */
  title: {
    /** 是否显示标题文字 */
    show: boolean
    /** 固定标题文字（优先使用数据集中的标题字段） */
    text: string
    /** 标题字号(px) */
    fontSize: number
    /** 标题颜色 */
    color: string
    /** 标题字重 */
    fontWeight: 'normal' | 'bold' | 300 | 500 | 800
    /** 标题纵向偏移(%)，正值向下 */
    offsetY: number
  }
  /** 动画配置 */
  animation: {
    /** 是否启用动画 */
    enabled: boolean
    /** 动画时长(ms) */
    duration: number
    /** 动画缓动函数 */
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

/**
 * 定义组件配置类型
 */
export type DrGaugeConfig = ChartConfig<DrGaugePropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrGaugeConfig => {
  return createChartConfig<DrGaugePropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      global: {
        padding: [10, 10, 10, 10]
      },
      gauge: {
        startAngle: 225,
        endAngle: -45,
        min: 0,
        max: 100,
        splitNumber: 10,
        clockwise: true,
        radius: '75%',
        center: ['50%', '55%']
      },
      axisLine: {
        show: true,
        width: 20,
        roundCap: false,
        colors: [[0.3, '#91cc75'], [0.7, '#fac858'], [1, '#ee6666']]
      },
      axisTick: {
        show: true,
        splitNumber: 5,
        length: 6,
        color: 'auto',
        width: 1
      },
      splitLine: {
        show: true,
        length: 12,
        color: 'auto',
        width: 2
      },
      axisLabel: {
        show: true,
        fontSize: 12,
        color: '#999999',
        distance: 15,
        formatter: '{value}'
      },
      pointer: {
        show: true,
        length: '60%',
        width: 6,
        color: 'auto',
        type: 'default'
      },
      anchor: {
        show: true,
        size: 10,
        color: '#5470c6',
        borderWidth: 2,
        borderColor: '#5470c6'
      },
      progress: {
        show: false,
        width: 20,
        roundCap: false,
        color: '#5470c6'
      },
      detail: {
        show: true,
        fontSize: 28,
        color: 'auto',
        fontWeight: 'bold',
        format: 'value',
        offsetY: 60,
        prefix: '',
        suffix: ''
      },
      title: {
        show: true,
        text: '',
        fontSize: 14,
        color: '#999999',
        fontWeight: 'normal',
        offsetY: 75
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '仪表盘',
      w: 300,
      h: 300
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '仪表盘单击',
    desc: '鼠标点击仪表盘区域时触发',
    method: 'click',
    paramsList: [
      {name: 'value', desc: '当前仪表盘数值', type: 'number'},
      {name: 'percent', desc: '当前数值占最大值的百分比', type: 'number'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '数值字段（指标）',
    required: true,
    multiple: false
  },
  {
    name: 'titleField',
    desc: '标题文字字段（维度，可选，用于显示仪表盘标题）',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
