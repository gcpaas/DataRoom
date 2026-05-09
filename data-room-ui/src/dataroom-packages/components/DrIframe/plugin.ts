import thumbnail from './images/iframe.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrIframePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, 'Iframe', 'iframe、网页嵌入、外部页面、嵌入网页', thumbnail, tags)
  }
}
