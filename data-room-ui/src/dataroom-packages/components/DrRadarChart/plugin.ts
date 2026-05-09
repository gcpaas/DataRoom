import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrRadarChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '雷达图', '雷达图、radar、蛛网图、能力图', '', tags)
  }
}
