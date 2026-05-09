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

export interface DrWordCloudPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** 文字样式配置 */
  wordStyle: {
    /** 字体 */
    fontFamily: string
    /** 字号范围 [最小值, 最大值] (px) */
    fontSizeRange: [number, number]
    /** 旋转角度范围 [最小角度, 最大角度] (度) */
    rotationRange: [number, number]
    /** 旋转角度步长（度），0表示任意角度 */
    rotationStep: number
    /** 文字颜色列表，随机分配给词语 */
    colors: string[]
    /** 字体粗细 */
    fontWeight: string
  }
  /** 词云形状配置 */
  shape: {
    /** 词云整体形状 */
    type: string
  }
  /** 布局配置 */
  layout: {
    /** 词语间距网格大小(px)，值越大间距越大 */
    gridSize: number
    /** 是否允许词语超出画布边界绘制 */
    drawOutOfBound: boolean
  }
  /** 提示框配置 */
  tooltip: {
    /** 是否显示提示框 */
    show: boolean
    /** 提示框背景颜色 */
    backgroundColor: string
    /** 提示框边框颜色 */
    borderColor: string
    /** 提示框文字样式 */
    textStyle: {
      fontSize: number
      color: string
    }
  }
  /** 高亮交互配置 */
  emphasis: {
    /** 高亮聚焦模式 */
    focus: string
    /** 高亮时文字样式 */
    textStyle: {
      shadowBlur: number
      shadowColor: string
    }
  }
  /** 动画配置 */
  animation: {
    /** 是否启用布局动画 */
    enabled: boolean
    /** 动画时长(ms) */
    duration: number
    /** 动画缓动函数 */
    easing: string
  }
}

/**
 * 定义组件配置类型
 */
export type DrWordCloudConfig = ChartConfig<DrWordCloudPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrWordCloudConfig => {
  return createChartConfig<DrWordCloudPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      global: {
        padding: [10, 10, 10, 10]
      },
      wordStyle: {
        fontFamily: 'Microsoft YaHei',
        fontSizeRange: [14, 60],
        rotationRange: [-45, 45],
        rotationStep: 45,
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
        fontWeight: 'bold'
      },
      shape: {
        type: 'circle'
      },
      layout: {
        gridSize: 8,
        drawOutOfBound: false
      },
      tooltip: {
        show: true,
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        }
      },
      emphasis: {
        focus: 'self',
        textStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '词云',
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
    name: '词语单击',
    desc: '鼠标点击词云中的词语时触发',
    method: 'click',
    paramsList: [
      {name: 'word', desc: '点击的词语文本', type: 'string'},
      {name: 'value', desc: '该词语的权重/频次值', type: 'number'}
    ],
  },
  {
    name: '词语悬停',
    desc: '鼠标悬停在词语上时触发',
    method: 'hover',
    paramsList: [
      {name: 'word', desc: '悬停的词语文本', type: 'string'},
      {name: 'value', desc: '该词语的权重/频次值', type: 'number'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'wordField',
    desc: '词语文本字段（维度）',
    required: true,
    multiple: false
  },
  {
    name: 'valueField',
    desc: '权重/频次字段（指标）',
    required: true,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
