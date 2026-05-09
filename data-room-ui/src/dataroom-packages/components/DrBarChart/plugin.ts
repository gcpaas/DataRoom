import thumbnail from './images/bar-chart.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrBarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '柱状图', '柱状图、bar、柱形图、条形图', thumbnail, tags)
  }
}
