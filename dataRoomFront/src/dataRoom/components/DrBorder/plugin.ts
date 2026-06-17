import thumbnail from './images/border.svg'
import {ChartPlugin} from '@/dataRoom/components/type/ChartPlugin.ts'

export class DrBorderPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrBorder', '边框', '边框、装饰边框、DataV边框', thumbnail, tags)
  }
}
