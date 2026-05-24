import thumbnail from './images/analysis-table.svg'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrAnalysisTablePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrAnalysisTable', '分析表格', '分析表格、多维分析、聚合、合计、数据条、条件格式、百分比指标', thumbnail, tags)
  }
}
