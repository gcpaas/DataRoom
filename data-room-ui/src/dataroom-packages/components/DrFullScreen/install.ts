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

interface DrFullScreenPropsInterface {
  /** 图标配置 */
  icon: {
    /** 进入全屏时显示的图标（图标名称） */
    enterIcon: string
    /** 退出全屏时显示的图标（图标名称） */
    exitIcon: string
    /** 图标大小（px） */
    iconSize: number
    /** 图标颜色 */
    iconColor: string
    /** 鼠标悬停时的图标颜色 */
    hoverColor: string
  }
  /** 提示文字配置 */
  tooltip: {
    /** 是否显示悬停提示文字 */
    show: boolean
    /** 进入全屏的提示文字 */
    enterText: string
    /** 退出全屏的提示文字 */
    exitText: string
  }
  /** 样式配置 */
  style: {
    /** 背景颜色 */
    backgroundColor: string
    /** 圆角半径（px） */
    borderRadius: number
    /** 边框配置 */
    border: {
      /** 是否显示边框 */
      show: boolean
      /** 边框颜色 */
      color: string
      /** 边框宽度 */
      width: number
    }
    /** 内边距（px） */
    padding: number
    /** 鼠标样式 */
    cursor: string
    /** 是否常驻显示（关闭时仅鼠标悬停可见） */
    alwaysShow: boolean
  }
}

/**
 * 定义组件配置类型
 */
export type DrFullScreenConfig = ChartConfig<DrFullScreenPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrFullScreenConfig => {
  return createChartConfig<DrFullScreenPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      icon: {
        enterIcon: 'FullScreen',
        exitIcon: 'ScaleToOriginal',
        iconSize: 24,
        iconColor: '#ffffff',
        hoverColor: '#409EFF',
      },
      tooltip: {
        show: true,
        enterText: '进入全屏',
        exitText: '退出全屏',
      },
      style: {
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 50,
        border: {
          show: false,
          color: '#333333',
          width: 1,
        },
        padding: 8,
        cursor: 'pointer',
        alwaysShow: true,
      },
    },
    {
      title: '全屏切换',
      w: 40,
      h: 40,
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '进入全屏',
    desc: '页面进入全屏模式时触发',
    method: 'enterFullscreen',
    paramsList: [
      {name: 'isFullscreen', desc: '当前是否处于全屏状态', type: 'boolean'},
    ],
  },
  {
    name: '退出全屏',
    desc: '页面退出全屏模式时触发',
    method: 'exitFullscreen',
    paramsList: [
      {name: 'isFullscreen', desc: '当前是否处于全屏状态', type: 'boolean'},
    ],
  },
  {
    name: '单击',
    desc: '鼠标点击全屏切换按钮时触发',
    method: 'click',
    paramsList: [
      {name: 'isFullscreen', desc: '单击后的全屏状态', type: 'boolean'},
    ],
  },
]

/**
 * 定义维度、指标字段信息（纯交互组件，不需要数据集）
 */
const datasetFields: ChartDatasetField[] = []

export {component, controlPanel, getInstance, behaviors, datasetFields}
