import thumbnail from './images/horizontal-bar-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrHorizontalBarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrHorizontalBarChart', '条形图', '条形图、横向柱状图、horizontal bar', thumbnail, tags)
  }
}
