import thumbnail from './thumbnail.png'
import { ChartPlugin } from '../type/ChartPlugin'

export class Dr3DBarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('Dr3DBarChart', '3D 柱状图', '3D、立体柱状图、菱形、圆柱、方柱、多系列', thumbnail, tags)
  }
}
