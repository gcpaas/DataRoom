import thumbnail from './images/decoration.svg'
import {ChartPlugin} from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrDecorationPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrDecoration', '装饰', '装饰、分割线、DataV装饰', thumbnail, tags)
  }
}
