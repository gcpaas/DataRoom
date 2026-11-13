import thumbnail from './thumbnail.svg'
import { ChartPlugin } from '../type/ChartPlugin'

export class DrRichTextPlugin extends ChartPlugin {
  constructor(tags: string[]) {
    super('DrRichText', '富文本', '富文本、Tiptap、文字样式、数据占位符', thumbnail, tags)
  }
}
