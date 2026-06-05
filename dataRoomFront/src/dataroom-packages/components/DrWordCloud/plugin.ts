import thumbnail from './images/word-cloud.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrWordCloudPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrWordCloud', '词云', '词云、wordcloud、标签云、关键词、热词', thumbnail, tags)
  }
}
