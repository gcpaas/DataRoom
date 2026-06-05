import thumbnail from './images/area-chart.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrAreaChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrAreaChart', '区域图', '区域图、面积图、area、堆叠面积图', thumbnail, tags)
  }
}
