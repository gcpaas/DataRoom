import thumbnail from './images/metric-card.svg'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrMetricCardPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrMetricCard', '指标卡', '指标卡、KPI、单值、核心指标、数值、单位、条件色', thumbnail, tags)
  }
}
