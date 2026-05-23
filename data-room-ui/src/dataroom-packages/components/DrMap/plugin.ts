import thumbnail from './images/map.png'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'

export class DrMapPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super(DrConst.THIS_PLUGIN_TYPE, '地图', '地图、行政区、GeoJSON、标记点、飞线', thumbnail, tags)
  }
}
