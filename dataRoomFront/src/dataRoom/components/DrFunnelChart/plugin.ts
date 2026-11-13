import thumbnail from './thumbnail.png'
import { ChartPlugin } from '../type/ChartPlugin'

export class DrFunnelChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrFunnelChart', '漏斗图', '漏斗图、funnel、阶段、转化、流程', thumbnail, tags)
  }
}
