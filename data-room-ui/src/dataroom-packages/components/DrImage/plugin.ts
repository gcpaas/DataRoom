import thumbnail from './images/图片.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";


export class DrImagePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '图片', '图片、素材', thumbnail, tags)
  }
}
