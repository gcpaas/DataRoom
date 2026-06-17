import thumbnail from './images/image-metric-card.svg'
import { ChartPlugin } from '@/dataRoom/components/type/ChartPlugin.ts'

export class DrImageMetricCardPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrImageMetricCard', '图片指标卡', '图片指标卡、图文指标、KPI、金额、单值、图标、数值', thumbnail, tags)
  }
}
