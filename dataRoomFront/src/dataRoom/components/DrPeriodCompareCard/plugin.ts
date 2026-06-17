import thumbnail from './images/period-compare-card.svg'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrPeriodCompareCardPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrPeriodCompareCard', '周期对比卡', '周期对比卡、KPI、同比、环比、变化值、变化率、对比分析', thumbnail, tags)
  }
}
