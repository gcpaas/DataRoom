import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrInputPropsInterface {
  /** 基础配置 */
  basic: {
    /** 输入框占位提示文本 */
    placeholder: string
    /** 输入框类型 */
    inputType: 'text' | 'number' | 'password'
    /** 输入框默认值 */
    defaultValue: string
    /** 是否显示清空按钮 */
    clearable: boolean
    /** 是否禁用 */
    disabled: boolean
    /** 最大输入字符数，0表示不限制 */
    maxLength: number
    /** 是否只读 */
    readonly: boolean
  }
  /** 输入框样式 */
  style: {
    /** 文本字号(px) */
    fontSize: number
    /** 输入文本颜色 */
    color: string
    /** 占位文本颜色 */
    placeholderColor: string
    /** 背景颜色 */
    backgroundColor: string
    /** 边框颜色 */
    borderColor: string
    /** 边框宽度(px) */
    borderWidth: number
    /** 边框圆角(px) */
    borderRadius: number
    /** 输入框高度(px) */
    height: number
    /** 内边距 [上, 右, 下, 左] */
    padding: number[]
  }
  /** 聚焦状态样式 */
  focus: {
    /** 聚焦时边框颜色 */
    borderColor: string
    /** 聚焦时阴影颜色 */
    shadowColor: string
    /** 聚焦时阴影扩散大小(px) */
    shadowSize: number
  }
  /** 全局变量配置 */
  globalVar: {
    /** 绑定的全局变量名称 */
    globalVarName: string
    /** 是否在输入时即时触发全局变量更新 */
    triggerOnInput: boolean
  }
}

/**
 * 定义组件配置类型
 */
export type DrInputConfig = ChartConfig<DrInputPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrInputConfig => {
  return createChartConfig<DrInputPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrInput',
    {
      basic: {
        placeholder: '请输入内容',
        inputType: 'text',
        defaultValue: '',
        clearable: true,
        disabled: false,
        maxLength: 0,
        readonly: false
      },
      style: {
        fontSize: 14,
        color: '#FFFFFF',
        placeholderColor: '#999999',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: '#444444',
        borderWidth: 1,
        borderRadius: 4,
        height: 40,
        padding: [0, 12, 0, 12]
      },
      focus: {
        borderColor: '#409EFF',
        shadowColor: 'rgba(64, 158, 255, 0.3)',
        shadowSize: 3
      },
      globalVar: {
        globalVarName: '',
        triggerOnInput: false
      }
    },
    {
      title: '输入框',
      w: 200,
      h: 40
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '值变化',
    desc: '输入框值发生变化时触发',
    method: 'valueChange',
    paramsList: [
      {name: 'value', desc: '当前输入框的值', type: 'string'}
    ]
  },
  {
    name: '回车确认',
    desc: '按下回车键时触发',
    method: 'enterPress',
    paramsList: [
      {name: 'value', desc: '按下回车时输入框的值', type: 'string'}
    ]
  },
  {
    name: '获取焦点',
    desc: '输入框获取焦点时触发',
    method: 'focus',
    paramsList: []
  },
  {
    name: '失去焦点',
    desc: '输入框失去焦点时触发',
    method: 'blur',
    paramsList: [
      {name: 'value', desc: '失焦时输入框的值', type: 'string'}
    ]
  }
]

/**
 * 定义维度、指标字段信息（输入框不消费数据集）
 */
const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
