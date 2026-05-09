import thumbnail from './images/gauge.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrGaugePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '仪表盘', '仪表盘、gauge、速度计、进度盘、刻度盘、KPI', thumbnail, tags)
  }
}
