import thumbnail from './images/pie-chart.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrPieChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '饼图', '饼图、pie、环形图、玫瑰图、占比', thumbnail, tags)
  }
}
