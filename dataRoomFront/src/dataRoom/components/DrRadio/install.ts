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

interface DrRadioPropsInterface {
  /** 基础配置 */
  basic: {
    /** 默认选中值 */
    defaultValue: string
    /** 是否禁用 */
    disabled: boolean
  }
  /** 布局配置 */
  layout: {
    /** 排列方向 */
    direction: 'horizontal' | 'vertical'
    /** 选项间距(px) */
    gap: number
  }
  /** 选项样式 */
  style: {
    /** 字号(px) */
    fontSize: number
    /** 未选中文本颜色 */
    color: string
    /** 选中文本颜色 */
    activeColor: string
    /** 选中背景色 */
    activeBgColor: string
    /** 未选中文本颜色 */
    inactiveColor: string
    /** 未选中背景色 */
    inactiveBgColor: string
    /** 圆角(px) */
    borderRadius: number
    /** 内边距 [上, 右, 下, 左] */
    padding: [number, number, number, number]
  }
  /** 选项配置 */
  options: {
    /** 静态选项列表 */
    staticOptions: Array<{ label: string; value: string }>
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
export type DrRadioConfig = ChartConfig<DrRadioPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrRadioConfig => {
  return createChartConfig<DrRadioPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrRadio',
    {
      basic: {
        defaultValue: '',
        disabled: false
      },
      layout: {
        direction: 'horizontal',
        gap: 12
      },
      style: {
        fontSize: 14,
        color: '#CCCCCC',
        activeColor: '#FFFFFF',
        activeBgColor: '#409EFF',
        inactiveColor: '#CCCCCC',
        inactiveBgColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        padding: [6, 16, 6, 16]
      },
      options: {
        staticOptions: [
          {label: '选项A', value: 'A'},
          {label: '选项B', value: 'B'},
          {label: '选项C', value: 'C'}
        ]
      },
      globalVar: {
        globalVarName: ''
      }
    },
    {
      title: '单选框',
      w: 300,
      h: 40
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '选中变化',
    desc: '单选框选中项发生变化时触发',
    method: 'change',
    paramsList: [
      {name: 'value', desc: '选中项的value值', type: 'string'},
      {name: 'label', desc: '选中项的label文本', type: 'string'}
    ]
  }
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'labelField',
    desc: '选项文本',
    required: false,
    multiple: false
  },
  {
    name: 'valueField',
    desc: '选项值',
    required: false,
    multiple: false
  }
]

const mockDataset: ChartMockDataset = {
  dataset: [
    {
      label: '选项一',
      value: 'option1',
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
