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

interface DrTabListPropsInterface {
  /** 基础配置 */
  basic: {
    /** 默认选中的标签索引（从0开始） */
    defaultIndex: number
    /** 是否禁用整个Tab组 */
    disabled: boolean
  }
  /** 布局配置 */
  layout: {
    /** 排列方向 */
    direction: 'horizontal' | 'vertical'
    /** 标签对齐方式 */
    align: 'start' | 'center' | 'end' | 'stretch'
  }
  /** 标签样式 */
  tabStyle: {
    /** 标签文本字号（px） */
    fontSize: number
    /** 未选中标签文本颜色 */
    color: string
    /** 选中标签文本颜色 */
    activeColor: string
    /** 未选中标签背景颜色 */
    backgroundColor: string
    /** 选中标签背景颜色 */
    activeBgColor: string
    /** 标签圆角（px） */
    borderRadius: number
    /** 标签之间的间距（px） */
    gap: number
    /** 标签内边距 [上, 右, 下, 左]（px） */
    padding: [number, number, number, number]
    /** 标签高度（px），0表示自适应 */
    height: number
    /** 标签底部边框线配置 */
    borderBottom: {
      /** 是否显示底部边框线 */
      show: boolean
      /** 边框线颜色 */
      color: string
      /** 边框线宽度（px） */
      width: number
    }
  }
  /** 指示器配置 */
  indicator: {
    /** 是否显示选中指示器 */
    show: boolean
    /** 指示器颜色 */
    color: string
    /** 指示器高度/粗细（px） */
    height: number
    /** 指示器圆角（px） */
    borderRadius: number
  }
  /** 标签配置 */
  options: {
    /** 静态标签列表 */
    staticTabs: Array<{ label: string; value: string }>
  }
  /** 全局变量配置 */
  globalVar: {
    /** 绑定的全局变量名称 */
    globalVarName: string
  }
}

/**
 * 定义组件配置类型
 */
export type DrTabListConfig = ChartConfig<DrTabListPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrTabListConfig => {
  return createChartConfig<DrTabListPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrTabList',
    {
      basic: {
        defaultIndex: 0,
        disabled: false
      },
      layout: {
        direction: 'horizontal',
        align: 'start'
      },
      tabStyle: {
        fontSize: 14,
        color: '#999999',
        activeColor: '#FFFFFF',
        backgroundColor: 'transparent',
        activeBgColor: 'transparent',
        borderRadius: 0,
        gap: 24,
        padding: [8, 16, 8, 16],
        height: 44,
        borderBottom: {
          show: false,
          color: '#333333',
          width: 1
        }
      },
      indicator: {
        show: true,
        color: '#409EFF',
        height: 3,
        borderRadius: 2
      },
      options: {
        staticTabs: [
          {label: '标签一', value: 'tab1'},
          {label: '标签二', value: 'tab2'},
          {label: '标签三', value: 'tab3'}
        ]
      },
      globalVar: {
        globalVarName: ''
      }
    },
    {
      title: 'Tab列表',
      w: 400,
      h: 44
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '切换Tab',
    desc: '切换标签页时触发',
    method: 'tabChange',
    paramsList: [
      {name: 'index', desc: '选中标签的索引（从0开始）', type: 'number'},
      {name: 'label', desc: '选中标签的文本', type: 'string'},
      {name: 'value', desc: '选中标签的值', type: 'string'}
    ]
  }
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'labelField',
    desc: '标签名',
    required: false,
    multiple: false
  },
  {
    name: 'valueField',
    desc: '标签值',
    required: false,
    multiple: false
  }
]

const mockDataset: ChartMockDataset = {
  dataset: [
    {
      label: '首页',
      value: 'home',
    },
  ],
  fields: [
    {
      name: 'labelField',
      bindName: 'label',
    },
    {
      name: 'valueField',
      bindName: 'value',
    },
  ],
}

export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
