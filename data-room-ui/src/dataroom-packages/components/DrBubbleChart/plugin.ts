import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrBubbleChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '气泡图', '气泡图、bubble、散点图、scatter', '', tags)
  }
}
