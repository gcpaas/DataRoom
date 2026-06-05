import thumbnail from './images/tab-list.png'
import {ChartPlugin} from "@/dataroom-packages/components/type/ChartPlugin.ts"

export class DrTabListPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrTabList', 'Tab列表', 'Tab列表、tab、标签页、标签切换、tablist', thumbnail, tags)
  }
}
