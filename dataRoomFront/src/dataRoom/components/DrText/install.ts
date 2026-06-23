import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts";
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts";
// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrTextPropsInterface {
  /** 文本内容 */
  text: string
  /** 文本样式 */
  textStyle: {
    /** 字体大小(px) */
    fontSize: number
    /** 字体粗细: 'normal' | 'bold' | '100'~'900' */
    fontWeight: string
    /** 字体族 */
    fontFamily: string
    /** 字体颜色 */
    color: string
  }
  /** 对齐方式: left | center | right */
  align: 'left' | 'center' | 'right'
  /** 垂直对齐: top | center | bottom */
  verticalAlign: 'top' | 'center' | 'bottom'
  /** 文字间隔(px) */
  letterSpacing: number
  /** 背景样式 */
  background: {
    /** 是否启用背景样式 */
    enabled: boolean
    /** 背景色 */
    color: string
    /** 圆角(px) */
    borderRadius: number
    /** 背景边框 */
    border: {
      /** 边框宽度(px) */
      width: number
      /** 边框样式: solid | dashed | dotted | none */
      style: 'solid' | 'dashed' | 'dotted' | 'none'
      /** 边框颜色 */
      color: string
    }
  }
  /** 文本溢出省略号 */
  ellipsis: boolean
  /** 超链接配置 */
  hyperlink: {
    /** 超链接URL */
    url: string
    /** 是否新开窗口 */
    openNewWindow: boolean
  }
}

/**
 * 定义组件配置类型
 */
export type DrTextConfig = ChartConfig<DrTextPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 * @constructor
 */
const getInstance = (): DrTextConfig => {
  return createChartConfig<DrTextPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrText',
    {
      text: '文本占位符',
      textStyle: {
        fontSize: 14,
        fontWeight: 'normal',
        fontFamily: 'Microsoft YaHei',
        color: '#333333',
      },
      align: 'left',
      verticalAlign: 'top',
      letterSpacing: 0,
      background: {
        enabled: false,
        color: '#007aff',
        borderRadius: 0,
        border: {
          width: 1,
          style: 'solid',
          color: '#eeeeee',
        },
      },
      ellipsis: false,
      hyperlink: {
        url: '',
        openNewWindow: false,
      },
    },
    {
      title: '文本'
    }
  )
}
/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '鼠标点击文本时触发',
    method: 'click',
    paramsList: [{
      name: 'text',
      desc: '点击的文本值',
      type: 'string'
    }],
  },
]
/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'text',
    desc: '文本值',
    required: false,
    multiple: true
  }
]

const mockDataset: ChartMockDataset = {
  dataset: [
    {text: '数据样例文本'},
  ],
  fields: [
    {name: 'text', bindName: 'text'},
  ],
}

export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
