import thumbnail from './images/echarts.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrEchartsPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrEcharts', '自定义Echarts图表', '自定义图表、echarts、option、任意图表', thumbnail, tags)
  }
}
