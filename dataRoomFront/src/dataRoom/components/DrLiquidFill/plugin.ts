import thumbnail from './thumbnail.png'
import { ChartPlugin } from '../type/ChartPlugin'
export class DrLiquidFillPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrLiquidFill', '水球图', '水球、水滴、liquidFill、完成率、百分比', thumbnail, tags)
  }
}
