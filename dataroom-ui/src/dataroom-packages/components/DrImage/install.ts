import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";
// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrImagePropsInterface {
  // 地址
  url: string
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
    DrConst.THIS_PLUGIN_TYPE,
    {
      url: '/dataRoom/resource/image/placeholder.png'
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
