import thumbnail from './images/text.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts";
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export class DrTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '文本', '文字、文本、数字', thumbnail, tags)
  }
}
