import thumbnail from './images/progress-bar.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrProgressBarPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrProgressBar', '进度条', 'CSS实现的进度条组件，以水平条形展示数值进度，支持渐变、圆角、动画及多种标签格式', thumbnail, tags)
  }
}
