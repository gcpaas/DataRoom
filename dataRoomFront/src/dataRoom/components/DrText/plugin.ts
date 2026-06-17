import thumbnail from './images/text.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts";

export class DrTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrText', '文本', '文字、文本、数字', thumbnail, tags)
  }
}
