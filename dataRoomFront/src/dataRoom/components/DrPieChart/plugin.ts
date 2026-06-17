import thumbnail from './images/pie-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrPieChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrPieChart', '饼图', '饼图、pie、环形图、玫瑰图、占比', thumbnail, tags)
  }
}
