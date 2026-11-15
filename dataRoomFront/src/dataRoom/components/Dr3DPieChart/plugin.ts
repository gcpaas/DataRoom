import thumbnail from './thumbnail'
import { ChartPlugin } from '../type/ChartPlugin'
export class Dr3DPieChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('Dr3DPieChart', '3D 饼图', '3D、立体饼图、环形图、占比', thumbnail, tags)
  }
}
