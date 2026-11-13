import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '@/dataRoom/constants/PageType.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrHtmlPropsInterface {
  /** 页面主题写入的样式配置，旧页面可缺省。 */
  themeStyle?: {
    text: string
    secondaryText: string
    background: string
    border: string
    grid: string
    primary: string
    colors: string[]
  }
  // html代码块，生成的代码不要放一行，需要进行代码格式化
  html: string
  // css代码块，生成的代码不要放一行，需要进行代码格式化
  css: string
  sandbox: {
    allowScripts: boolean
    allowSameOrigin: boolean
    allowForms: boolean
    allowPopups: boolean
  }
  placeholder: {
    escapeMode: 'text'
  }
}

export type DrHtmlConfig = ChartConfig<DrHtmlPropsInterface>

const getInstance = (pageType: PageType): DrHtmlConfig => {
  return createChartConfig<DrHtmlPropsInterface>(
    'DrHtml',
    {
      html: '<div class="html-card"><h3>HTML 组件</h3><p>支持 #{user.name} 占位符</p></div>',
      css: `.html-card {
  width: 100%;
  height: 100%;
  padding: 24px;
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.html-card h3 {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

.html-card p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
}`,
      sandbox: {
        allowScripts: false,
        allowSameOrigin: false,
        allowForms: false,
        allowPopups: false,
      },
      placeholder: {
        escapeMode: 'text',
      },
    },
    {
      title: 'HTML',
      w: 400,
      h: 300,
    },
    pageType,
  )
}

const behaviors: Behavior[] = [
  {
    name: '加载完成',
    desc: 'HTML内容加载完成时触发',
    method: 'loaded',
    paramsList: [
      {
        name: 'placeholderCount',
        desc: '占位符数量',
        type: 'number',
      },
    ],
  },
  {
    name: '单击',
    desc: '鼠标点击HTML组件时触发',
    method: 'click',
    paramsList: [
      {
        name: 'placeholderCount',
        desc: '占位符数量',
        type: 'number',
      },
    ],
  },
]

const datasetFields: ChartDatasetField[] = [
  {
    name: 'templateContext',
    desc: '模板上下文',
    required: false,
    multiple: false,
  },
]

const mockDataset: ChartMockDataset = {
  dataset: [{ templateContext: { title: '数据样例', value: 12860 } }],
  fields: [{ name: 'templateContext', bindName: 'templateContext' }],
}

export { component, controlPanel, getInstance, behaviors, datasetFields, mockDataset }
