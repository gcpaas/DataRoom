import thumbnail from './images/word-cloud.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrWordCloudPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '词云', '词云、wordcloud、标签云、关键词、热词', thumbnail, tags)
  }
}
