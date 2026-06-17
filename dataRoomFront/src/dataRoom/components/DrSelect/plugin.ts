import thumbnail from './images/select.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrSelectPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrSelect', '下拉框', '下拉框、select、下拉选择、筛选', thumbnail, tags)
  }
}
