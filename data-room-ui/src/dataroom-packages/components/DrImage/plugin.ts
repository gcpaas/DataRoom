import thumbnail from './images/图片.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts";


export class DrImagePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrImage', '图片', '图片、素材', thumbnail, tags)
  }
}
