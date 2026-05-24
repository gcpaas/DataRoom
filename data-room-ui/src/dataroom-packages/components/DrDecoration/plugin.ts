import thumbnail from './images/decoration.svg'
import {ChartPlugin} from '@/dataroom-packages/components/type/ChartPlugin.ts'
import {DrConst} from '@/dataroom-packages/constant/DrConst.ts'

export class DrDecorationPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '装饰', '装饰、分割线、DataV装饰', thumbnail, tags)
  }
}
