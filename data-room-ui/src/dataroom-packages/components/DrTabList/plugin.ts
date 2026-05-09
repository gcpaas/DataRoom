import thumbnail from './images/tab-list.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrTabListPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, 'Tab列表', 'Tab列表、tab、标签页、标签切换、tablist', thumbnail, tags)
  }
}
