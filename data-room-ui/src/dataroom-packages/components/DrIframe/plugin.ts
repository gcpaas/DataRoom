import thumbnail from './images/iframe.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrIframePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrIframe', 'Iframe', 'iframe、网页嵌入、外部页面、嵌入网页', thumbnail, tags)
  }
}
