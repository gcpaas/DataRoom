import thumbnail from './images/html.svg'
import { ChartPlugin } from '@/dataroom-packages/components/type/ChartPlugin.ts'

export class DrHtmlPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrHtml', 'HTML', 'html、css、自定义片段、自定义内容', thumbnail, tags)
  }
}
