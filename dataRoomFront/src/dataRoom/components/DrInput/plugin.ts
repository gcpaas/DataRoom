import thumbnail from './images/input.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrInputPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrInput', '输入框', '输入框、input、表单、搜索', thumbnail, tags)
  }
}
