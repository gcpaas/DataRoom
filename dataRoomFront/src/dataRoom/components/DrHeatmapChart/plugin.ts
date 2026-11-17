import thumbnail from './thumbnail.svg'
import { ChartPlugin } from '../type/ChartPlugin'

export class DrHeatmapChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrHeatmapChart', '热力图', '热力图、heatmap、矩阵、双类目、固定色标', thumbnail, tags)
  }
}
