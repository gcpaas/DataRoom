import thumbnail from './images/fullscreen.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrFullScreenPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrFullScreen', '全屏切换', '全屏切换、fullscreen、全屏、退出全屏', thumbnail, tags)
  }
}
