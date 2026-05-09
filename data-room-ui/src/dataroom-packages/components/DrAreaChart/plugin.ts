import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrAreaChartPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '区域图', '区域图、面积图、area、堆叠面积图', '', tags)
  }
}
