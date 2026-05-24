import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrSelectPropsInterface {
  /** 基础配置 */
  basic: {
    /** 占位提示文本 */
    placeholder: string
    /** 默认选中值 */
    defaultValue: string
    /** 是否多选 */
    multiple: boolean
    /** 是否可清空 */
    clearable: boolean
    /** 是否禁用 */
    disabled: boolean
    /** 是否支持搜索过滤 */
    filterable: boolean
    /** 尺寸 */
    size: 'small' | 'default' | 'large'
  }
  /** 输入框样式 */
  style: {
    /** 选中文本字号(px) */
    fontSize: number
    /** 选中文本颜色 */
    color: string
    /** 占位文本颜色 */
    placeholderColor: string
    /** 输入框背景颜色 */
    backgroundColor: string
    /** 边框颜色 */
    borderColor: string
    /** 边框宽度(px) */
    borderWidth: number
    /** 边框圆角(px) */
    borderRadius: number
    /** 输入框高度(px) */
    height: number
  }
  /** 选项配置 */
  options: {
    /** 静态选项列表 */
    staticOptions: Array<{ label: string; value: string }>
    /** 选项文本字号(px) */
    optionFontSize: number
    /** 选项文本颜色 */
    optionColor: string
  }
  /** 下拉面板样式 */
  dropdown: {
    /** 下拉面板最大高度(px) */
    maxHeight: number
    /** 下拉面板背景颜色 */
    backgroundColor: string
    /** 下拉面板边框颜色 */
    borderColor: string
    /** 选项悬浮时背景颜色 */
    hoverBgColor: string
    /** 选项选中时背景颜色 */
    activeBgColor: string
    /** 选项选中时文本颜色 */
    activeColor: string
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
export type DrSelectConfig = ChartConfig<DrSelectPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrSelectConfig => {
  return createChartConfig<DrSelectPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrSelect',
    {
      basic: {
        placeholder: '请选择',
        defaultValue: '',
        multiple: false,
        clearable: true,
        disabled: false,
        filterable: false,
        size: 'default',
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
      },
      options: {
        staticOptions: [
          {label: '选项一', value: '1'},
          {label: '选项二', value: '2'},
          {label: '选项三', value: '3'},
        ],
        optionFontSize: 14,
        optionColor: '#FFFFFF',
      },
      dropdown: {
        maxHeight: 200,
        backgroundColor: 'rgba(30, 30, 30, 0.95)',
        borderColor: '#444444',
        hoverBgColor: 'rgba(64, 158, 255, 0.2)',
        activeBgColor: 'rgba(64, 158, 255, 0.3)',
        activeColor: '#409EFF',
      },
      globalVar: {
        globalVarName: '',
      },
    },
    {
      title: '下拉框',
      w: 200,
      h: 40,
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '选中变化',
    desc: '下拉框选中项发生变化时触发',
    method: 'change',
    paramsList: [
      {name: 'value', desc: '选中项的value值（多选时为数组）', type: 'string | string[]'},
      {name: 'label', desc: '选中项的label文本（多选时为数组）', type: 'string | string[]'},
    ],
  },
  {
    name: '清空选中',
    desc: '点击清空按钮清空所有选中项时触发',
    method: 'clear',
    paramsList: [],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'labelField',
    desc: '选项文本',
    required: false,
    multiple: false,
  },
  {
    name: 'valueField',
    desc: '选项值',
    required: false,
    multiple: false,
  },
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
