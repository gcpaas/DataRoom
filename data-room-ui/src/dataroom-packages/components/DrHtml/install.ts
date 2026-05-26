import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { Behavior } from '@/dataroom-packages/components/type/Behavior.ts'
import type { ChartConfig } from '@/dataroom-packages/components/type/ChartConfig.ts'
import type { ChartDatasetField } from '@/dataroom-packages/components/type/ChartDatasetField.ts'

const component = defineAsyncComponent(() => import('./index.vue'))
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrHtmlPropsInterface {
  html: string
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

const getInstance = (): DrHtmlConfig => {
  return createChartConfig<DrHtmlPropsInterface>(
    'DrHtml',
    {
      html: '<div class="html-card"><h3>HTML 组件</h3><p>支持 #{user.name} 占位符</p></div>',
      css: `.html-card {
  width: 100%;
  height: 100%;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.72);
  color: #ffffff;
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
    }
  )
}

const behaviors: Behavior[] = [
  {
    name: '加载完成',
    desc: 'HTML内容加载完成时触发',
    method: 'loaded',
    paramsList: [{
      name: 'placeholderCount',
      desc: '占位符数量',
      type: 'number',
    }],
  },
  {
    name: '单击',
    desc: '鼠标点击HTML组件时触发',
    method: 'click',
    paramsList: [{
      name: 'placeholderCount',
      desc: '占位符数量',
      type: 'number',
    }],
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

export { component, controlPanel, getInstance, behaviors, datasetFields }
