import thumbnail from './images/border.svg'
import {ChartPlugin} from '@/dataroom-packages/components/type/ChartPlugin.ts'
import {DrConst} from '@/dataroom-packages/constant/DrConst.ts'

export class DrBorderPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '边框', '边框、装饰边框、DataV边框', thumbnail, tags)
  }
}
