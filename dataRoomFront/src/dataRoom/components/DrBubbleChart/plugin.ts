import thumbnail from './images/bubble-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrBubbleChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrBubbleChart', '气泡图', '气泡图、bubble、散点图、scatter', thumbnail, tags)
  }
}
