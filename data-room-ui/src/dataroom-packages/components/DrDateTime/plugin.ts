import thumbnail from './images/time.svg'
import {ChartPlugin} from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrDateTimePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrDateTime', '时间', '时间、日期、当前时间、当前日期', thumbnail, tags)
  }
}
