import thumbnail from './images/bar-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrBarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrBarChart', '柱状图', '柱状图、bar、柱形图、条形图', thumbnail, tags)
  }
}
