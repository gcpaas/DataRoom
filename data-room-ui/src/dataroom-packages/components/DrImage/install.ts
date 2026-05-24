import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";
// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrImagePropsInterface {
  /** 图片类型: bitmap(位图) | svg(矢量图) */
  imageType: 'bitmap' | 'svg'
  /** 图片地址(URL或相对路径) */
  url: string
  /** 图片重复/填充模式 */
  repeatMode: 'no-repeat-stretch' | 'no-repeat-contain' | 'no-repeat-center' | 'repeat' | 'repeat-x' | 'repeat-y'
  /** 圆角(px) */
  borderRadius: number
  /** 超链接配置 */
  hyperlink: {
    /** 超链接URL */
    url: string
    /** 是否新开窗口 */
    openNewWindow: boolean
    /** 是否显示手势光标(pointer) */
    cursorPointer: boolean
  }
}

/**
 * 定义组件配置类型
 */
export type DrImageConfig = ChartConfig<DrImagePropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 * @constructor
 */
const getInstance = (): DrImageConfig => {
  return createChartConfig<DrImagePropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrImage',
    {
      imageType: 'bitmap',
      url: '/dataRoom/resource/image/placeholder.png',
      repeatMode: 'no-repeat-stretch',
      borderRadius: 0,
      hyperlink: {
        url: '',
        openNewWindow: false,
        cursorPointer: true,
      },
    },
    {
      title: '图片',
    }
  )
}
/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '鼠标点击图片时触发',
    method: 'click',
    paramsList: [{
      name: 'url',
      desc: '图片URL',
      type: 'string'
    }],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'url',
    desc: '图片地址',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
