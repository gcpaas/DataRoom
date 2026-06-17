import thumbnail from './images/map.png'
import { ChartPlugin } from '@/dataRoom/components/type/ChartPlugin.ts'

export class DrMapPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    // 组件类型需与当前组件目录名保持一致
    super('DrMap', '地图', '地图、行政区、GeoJSON、标记点、飞线', thumbnail, tags)
  }
}
