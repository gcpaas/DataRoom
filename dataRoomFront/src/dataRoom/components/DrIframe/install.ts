import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts";

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrIframePropsInterface {
  /** 基础配置 */
  basic: {
    /** 嵌入页面的URL地址 */
    url: string
    /** 是否显示滚动条 */
    scrolling: 'auto' | 'yes' | 'no'
    /** 是否显示iframe边框 */
    frameBorder: boolean
  }
  /** 自动刷新配置 */
  autoRefresh: {
    /** 是否开启自动刷新 */
    enabled: boolean
    /** 自动刷新间隔时间（秒） */
    interval: number
  }
  /** 样式配置 */
  style: {
    /** 圆角半径（px） */
    borderRadius: number
    /** 背景颜色 */
    backgroundColor: string
    /** 边框配置 */
    border: {
      show: boolean
      color: string
      width: number
      style: 'solid' | 'dashed' | 'dotted'
    }
  }
  /** 安全沙箱配置 */
  sandbox: {
    /** 允许执行脚本 */
    allowScripts: boolean
    /** 允许同源访问 */
    allowSameOrigin: boolean
    /** 允许提交表单 */
    allowForms: boolean
    /** 允许弹出窗口 */
    allowPopups: boolean
    /** 允许打开模态窗口 */
    allowModals: boolean
    /** 允许全屏 */
    allowFullscreen: boolean
    /** 允许访问摄像头 */
    allowCamera: boolean
    /** 允许访问麦克风 */
    allowMicrophone: boolean
  }
}

/**
 * 定义组件配置类型
 */
export type DrIframeConfig = ChartConfig<DrIframePropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrIframeConfig => {
  return createChartConfig<DrIframePropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrIframe',
    {
      basic: {
        url: 'https://www.example.com',
        scrolling: 'auto',
        frameBorder: false
      },
      autoRefresh: {
        enabled: false,
        interval: 60
      },
      style: {
        borderRadius: 0,
        backgroundColor: 'transparent',
        border: {
          show: false,
          color: '#333333',
          width: 1,
          style: 'solid'
        }
      },
      sandbox: {
        allowScripts: true,
        allowSameOrigin: true,
        allowForms: true,
        allowPopups: false,
        allowModals: false,
        allowFullscreen: true,
        allowCamera: false,
        allowMicrophone: false
      }
    },
    {
      title: 'Iframe',
      w: 400,
      h: 300,
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '加载完成',
    desc: 'iframe页面加载完成时触发',
    method: 'loaded',
    paramsList: [{
      name: 'url',
      desc: '当前加载的页面URL',
      type: 'string'
    }],
  },
  {
    name: '单击',
    desc: '鼠标点击iframe区域时触发',
    method: 'click',
    paramsList: [{
      name: 'url',
      desc: '当前页面URL',
      type: 'string'
    }],
  },
  {
    name: '链接变更',
    desc: 'iframe内页面URL发生变更时触发',
    method: 'urlChange',
    paramsList: [{
      name: 'url',
      desc: '变更后的URL',
      type: 'string'
    }],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'urlField',
    desc: '页面地址',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
