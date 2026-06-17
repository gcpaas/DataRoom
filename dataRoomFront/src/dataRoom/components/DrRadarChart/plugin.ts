import thumbnail from './images/radar-chart.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrRadarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrRadarChart', '雷达图', '雷达图、radar、蛛网图、能力图', thumbnail, tags)
  }
}
