import thumbnail from './images/radio.png'
import {ChartPlugin} from "@/dataRoom/components/type/ChartPlugin.ts"

export class DrRadioPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrRadio', '单选框', '单选框、radio、单选、表单、筛选', thumbnail, tags)
  }
}
