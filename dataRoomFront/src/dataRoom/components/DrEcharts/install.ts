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

export interface DrEchartsPropsInterface {
  /**
   * ECharts option 代码（JS 代码字符串，最后 return option 对象）。
   * 存字符串而非对象：页面配置需要 JSON 序列化，option 中的 formatter 等函数无法被 JSON 表达。
   */
  option: string
}

/**
 * 定义组件配置类型
 */
export type DrEchartsConfig = ChartConfig<DrEchartsPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrEchartsConfig => {
  return createChartConfig<DrEchartsPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrEcharts',
    {
      option: `// 可直接粘贴 ECharts 官网示例代码，最后 return option 对象即可
// ctx.data 为数据集返回数据（已经过数据处理脚本），未配置数据集时为下方内置样例
const list = Array.isArray(ctx.data) && ctx.data.length
  ? ctx.data
  : [
      { name: '周一', value: 120 },
      { name: '周二', value: 200 },
      { name: '周三', value: 150 },
      { name: '周四', value: 80 },
      { name: '周五', value: 70 },
      { name: '周六', value: 110 },
      { name: '周日', value: 130 },
    ]

return {
  tooltip: { trigger: 'axis' },
  grid: { top: 40, right: 20, bottom: 30, left: 40, containLabel: true },
  xAxis: { type: 'category', data: list.map((item) => item.name) },
  yAxis: { type: 'value' },
  series: [
    {
      name: '数值',
      type: 'bar',
      barMaxWidth: 40,
      data: list.map((item) => Number(item.value) || 0),
    },
  ],
}
`
    },
    {
      title: '自定义图表',
      w: 400,
      h: 300
    }
  )
}

/**
 * 标记当前组件使用自定义交互事件：
 * 事件名由用户在拖拽到页面后自行添加（对应 ECharts 原生事件名），
 * 不预置固定事件清单。控制面板交互 Tab 命中该标识后渲染自定义事件管理。
 */
const customBehaviors = true

/**
 * 本组件不预置固定交互定义
 */
const behaviors: Behavior[] = []

/**
 * 通用图表不预设字段映射，数据集字段由用户在 option 代码中自行消费
 */
const datasetFields: ChartDatasetField[] = []

/**
 * 组件内置模拟数据集，用于数据样例弹窗展示
 */
const mockDataset: ChartMockDataset = {
  dataset: [
    {name: '周一', value: 120},
    {name: '周二', value: 200},
    {name: '周三', value: 150},
    {name: '周四', value: 80},
    {name: '周五', value: 70},
    {name: '周六', value: 110},
    {name: '周日', value: 130},
  ],
  fields: [],
}

export {component, controlPanel, getInstance, customBehaviors, behaviors, datasetFields, mockDataset}
