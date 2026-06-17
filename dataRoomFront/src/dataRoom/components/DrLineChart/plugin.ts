import thumbnail from './images/line-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrLineChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrLineChart', '折线图', '折线图、line、曲线图、趋势图', thumbnail, tags)
  }
}
