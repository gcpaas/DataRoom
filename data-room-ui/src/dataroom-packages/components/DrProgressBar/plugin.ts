import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export class DrProgressBarPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '进度条', 'CSS实现的进度条组件，以水平条形展示数值进度，支持渐变、圆角、动画及多种标签格式', '', tags)
  }
}
