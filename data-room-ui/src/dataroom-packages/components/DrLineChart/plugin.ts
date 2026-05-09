import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

const thumbnail = ''

export class DrLineChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '折线图', '折线图、line、曲线图、趋势图', thumbnail, tags)
  }
}
