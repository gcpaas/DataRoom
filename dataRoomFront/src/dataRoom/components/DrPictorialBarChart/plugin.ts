import thumbnail from './thumbnail.png'
import { ChartPlugin } from '../type/ChartPlugin'
export class DrPictorialBarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrPictorialBarChart', '象形图', '象形图、山峰、图片、pictorialBar', thumbnail, tags)
  }
}
