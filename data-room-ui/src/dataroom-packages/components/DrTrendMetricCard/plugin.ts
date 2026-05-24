import thumbnail from './images/trend-metric-card.svg'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrTrendMetricCardPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrTrendMetricCard', '趋势指标卡', '趋势指标卡、KPI、趋势线、折线、面积、变化率、同比、环比', thumbnail, tags)
  }
}
