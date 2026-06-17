import thumbnail from './images/alarm-image.svg'
import { ChartPlugin } from '@/dataRoom/components/type/ChartPlugin.ts'

export class DrAlarmImagePlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrAlarmImage', '告警图', '告警、图片、阈值、指标、状态、区间', thumbnail, tags)
  }
}
