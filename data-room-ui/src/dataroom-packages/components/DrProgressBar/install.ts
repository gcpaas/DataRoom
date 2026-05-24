import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts";

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

interface DrProgressBarPropsInterface {
  /** 数值配置 */
  value: {
    /** 当前进度值（无数据集绑定时使用此固定值） */
    current: number
    /** 最大值（进度条满格对应的值） */
    max: number
  }
  /** 进度条样式配置 */
  bar: {
    /** 进度条高度(px) */
    height: number
    /** 进度填充颜色（非渐变模式时使用） */
    fillColor: string
    /** 进度条轨道背景颜色 */
    backgroundColor: string
    /** 进度条圆角(px) */
    borderRadius: number
    /** 渐变填充配置 */
    gradient: {
      /** 是否启用渐变 */
      enabled: boolean
      /** 渐变起始颜色 */
      startColor: string
      /** 渐变结束颜色 */
      endColor: string
      /** 渐变方向 */
      direction: 'horizontal' | 'vertical'
    }
  }
  /** 标签配置 */
  label: {
    /** 是否显示标签 */
    show: boolean
    /** 标签位置 */
    position: 'inside' | 'outside' | 'top'
    /** 标签字号(px) */
    fontSize: number
    /** 标签颜色 */
    color: string
    /** 标签字重 */
    fontWeight: 'normal' | 'bold' | '300' | '500' | '800'
    /** 标签内容格式 */
    format: 'percent' | 'value' | 'custom'
    /** 自定义格式模板 */
    customFormat: string
  }
  /** 轨道配置 */
  track: {
    /** 轨道背景颜色 */
    backgroundColor: string
    /** 轨道圆角(px) */
    borderRadius: number
  }
  /** 边框配置 */
  border: {
    /** 是否显示边框 */
    show: boolean
    /** 边框颜色 */
    color: string
    /** 边框宽度(px) */
    width: number
  }
  /** 进度条标题配置 */
  title: {
    /** 是否显示标题 */
    show: boolean
    /** 标题文字 */
    text: string
    /** 标题位置 */
    position: 'left' | 'top'
    /** 标题字号(px) */
    fontSize: number
    /** 标题颜色 */
    color: string
    /** 标题区域宽度(px)，仅position为left时有效 */
    width: number
  }
  /** 动画配置 */
  animation: {
    /** 是否启用进度动画 */
    enabled: boolean
    /** 动画时长(ms) */
    duration: number
    /** 动画缓动函数 */
    easing: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
  }
}

/**
 * 定义组件配置类型
 */
export type DrProgressBarConfig = ChartConfig<DrProgressBarPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrProgressBarConfig => {
  return createChartConfig<DrProgressBarPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrProgressBar',
    {
      value: {
        current: 65,
        max: 100
      },
      bar: {
        height: 20,
        fillColor: '#5470c6',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        gradient: {
          enabled: false,
          startColor: '#5470c6',
          endColor: '#73c0de',
          direction: 'horizontal'
        }
      },
      label: {
        show: true,
        position: 'outside',
        fontSize: 14,
        color: '#ffffff',
        fontWeight: 'normal',
        format: 'percent',
        customFormat: '{percent}%'
      },
      track: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10
      },
      border: {
        show: false,
        color: '#444444',
        width: 1
      },
      title: {
        show: false,
        text: '',
        position: 'left',
        fontSize: 14,
        color: '#cccccc',
        width: 80
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'ease-out'
      }
    },
    {
      title: '进度条',
      w: 300,
      h: 60
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '进度条单击',
    desc: '鼠标点击进度条区域时触发',
    method: 'click',
    paramsList: [
      {name: 'value', desc: '当前进度值', type: 'number'},
      {name: 'percent', desc: '当前进度百分比', type: 'number'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'valueField',
    desc: '当前值字段（指标，用于计算进度百分比）',
    required: false,
    multiple: false
  },
  {
    name: 'maxField',
    desc: '最大值字段（指标，可选，未绑定时使用props中的max配置）',
    required: false,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
