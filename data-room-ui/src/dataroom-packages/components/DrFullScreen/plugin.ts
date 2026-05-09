import thumbnail from './images/fullscreen.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrFullScreenPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '全屏切换', '全屏切换、fullscreen、全屏、退出全屏', thumbnail, tags)
  }
}
