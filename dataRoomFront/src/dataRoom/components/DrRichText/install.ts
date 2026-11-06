import { defineAsyncComponent } from 'vue'
import type { JSONContent } from '@tiptap/core'
import { createChartConfig } from '../type/define'
import type { ChartConfig } from '../type/ChartConfig'
import type { ChartDatasetField } from '../type/ChartDatasetField'
import type { ChartMockDataset } from '../type/ChartMockDataset'
import type { Behavior } from '../type/Behavior'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrRichTextPropsInterface {
  /** Tiptap组件 JSON 文档；文本支持 #{字段key}，替换值继承占位符起始样式 */
  content: JSONContent
  /** 整体水平对齐方式 */
  align: 'left' | 'center' | 'right'
  /** 整体垂直对齐方式 */
  verticalAlign: 'top' | 'center' | 'bottom'
  /** 行间距倍数 */
  lineHeight: number
}

export type DrRichTextConfig = ChartConfig<DrRichTextPropsInterface>

const getInstance = (): DrRichTextConfig => createChartConfig<DrRichTextPropsInterface>(
  'DrRichText',
  {
    content: {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '请输入富文本内容' }] }],
    },
    align: 'left',
    verticalAlign: 'top',
    lineHeight: 1.6,
  },
  { title: '富文本', w: 360, h: 180 },
)

// 直接使用返回对象的字段 key，无需另配字段映射；数组默认取第一行。
const datasetFields: ChartDatasetField[] = []
const behaviors: Behavior[] = []
const mockDataset: ChartMockDataset = {
  dataset: [{ name: '示例名称', value: 128 }],
  fields: [{ name: '在正文输入 #{name}', bindName: 'name' }, { name: '在正文输入 #{value}', bindName: 'value' }],
}

export { component, controlPanel, getInstance, datasetFields, behaviors, mockDataset }
