import thumbnail from './images/gauge.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrGaugePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrGauge', '仪表盘', '仪表盘、gauge、速度计、进度盘、刻度盘、KPI', thumbnail, tags)
  }
}
