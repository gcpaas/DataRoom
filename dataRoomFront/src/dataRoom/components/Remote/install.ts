import {defineAsyncComponent} from 'vue'
import {createChartConfig} from "../type/define";
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts";
// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface RemoteComponentProps {
  // 文本
  text: string
  // 字体大小
  fontSize: number
}

/**
 * 定义组件配置类型
 */
export type RemoteComponentConfig = ChartConfig<RemoteComponentProps>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 * @constructor
 */
const getInstance = (): RemoteComponentConfig => {
  return createChartConfig<RemoteComponentProps>(
    // 组件类型需与当前组件目录名保持一致
    'Remote',
    {
      text: '文本占位符',
      fontSize: 14,
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
    name: '点击',
    desc: '鼠标点击文本时触发',
    method: 'triggerClickEvent',
    paramsList: [],
  },
]

export { component, controlPanel, getInstance, behaviors }
