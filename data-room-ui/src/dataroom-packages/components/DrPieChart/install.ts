import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts"
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataroom-packages/components/type/ChartDatasetField.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrPieChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** 饼图布局配置 */
  pie: {
    /** 内半径百分比(0=实心饼图, >0=环形图) */
    innerRadius: number
    /** 外半径百分比 */
    outerRadius: number
    /** 中心位置 [x, y] */
    center: [string, string]
    /** 起始角度 */
    startAngle: number
    /** 玫瑰图类型 */
    roseType: string | false
    /** 扇形边框颜色 */
    borderColor: string
    /** 扇形边框宽度 */
    borderWidth: number
    /** 扇形圆角 */
    borderRadius: number
  }
  /** 中心内容配置（仅环形图有效） */
  centerContent: {
    /** 是否显示 */
    show: boolean
    /** 内容类型 */
    type: 'text' | 'image'
    /** 标题配置 */
    title: {
      text: string
      fontSize: number
      color: string
      fontWeight: string
      offsetY: number
    }
    /** 数值配置 */
    value: {
      /** 数值来源字段 */
      field: string
      fontSize: number
      color: string
      fontWeight: string
      offsetY: number
      /** 格式化方式 */
      format: 'default' | 'integer' | 'float1' | 'float2' | 'percent' | 'percent1' | 'thousand' | 'thousand1'
      /** 前缀 */
      prefix: string
      /** 后缀 */
      suffix: string
    }
    /** 图片配置 */
    image: {
      url: string
      width: number
      height: number
    }
  }
  /** 标签配置 */
  label: {
    /** 是否显示 */
    show: boolean
    /** 标签位置 */
    position: 'inside' | 'outside' | 'spider'
    /** 标签内容 */
    content: 'name' | 'value' | 'percent' | 'name+value' | 'name+percent'
    /** 字号 */
    fontSize: number
    /** 颜色 */
    color: string
    /** 字重 */
    fontWeight: string
    /** 引导线 */
    guideLine: {
      show: boolean
      length: number
      length2: number
      lineWidth: number
      color: string
    }
  }
  /** 图例配置 */
  legend: {
    show: boolean
    position: 'top' | 'bottom' | 'left' | 'right'
    textStyle: {
      fontSize: number
      color: string
      fontWeight: string
    }
    itemGap: number
  }
  /** 提示框配置 */
  tooltip: {
    show: boolean
    trigger: 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
    /** 是否显示百分比 */
    showPercent: boolean
  }
  /** 系列配置 */
  series: {
    /** 颜色列表 */
    colors: string[]
    /** 选中模式 */
    selectedMode: false | 'single' | 'multiple'
    /** 选中偏移量 */
    selectedOffset: number
    /** 最小角度 */
    minAngle: number
    /** 小数合并配置 */
    merge: {
      enabled: boolean
      maxCount: number
      mergeLabel: string
    }
  }
  /** 动画配置 */
  animation: {
    enabled: boolean
    duration: number
    easing: 'linear' | 'cubicOut' | 'elasticOut' | 'bounceOut'
  }
}

/**
 * 定义组件配置类型
 */
export type DrPieChartConfig = ChartConfig<DrPieChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrPieChartConfig => {
  return createChartConfig<DrPieChartPropsInterface>(
    DrConst.THIS_PLUGIN_TYPE,
    {
      global: {
        padding: [20, 20, 20, 20]
      },
      pie: {
        innerRadius: 0,
        outerRadius: 75,
        center: ['50%', '50%'],
        startAngle: 90,
        roseType: false,
        borderColor: '#ffffff',
        borderWidth: 1,
        borderRadius: 0
      },
      centerContent: {
        show: false,
        type: 'text',
        title: {
          text: '总计',
          fontSize: 14,
          color: '#999999',
          fontWeight: 'normal',
          offsetY: -10
        },
        value: {
          field: '',
          fontSize: 24,
          color: '#333333',
          fontWeight: 'bold',
          offsetY: 10,
          format: 'default',
          prefix: '',
          suffix: ''
        },
        image: {
          url: '',
          width: 40,
          height: 40
        }
      },
      label: {
        show: true,
        position: 'outside',
        content: 'name+percent',
        fontSize: 12,
        color: '',
        fontWeight: 'normal',
        guideLine: {
          show: true,
          length: 15,
          length2: 20,
          lineWidth: 1,
          color: ''
        }
      },
      legend: {
        show: true,
        position: 'bottom',
        textStyle: {
          fontSize: 12,
          color: '#666666',
          fontWeight: 'normal'
        },
        itemGap: 16
      },
      tooltip: {
        show: true,
        trigger: 'item',
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        },
        showPercent: true
      },
      series: {
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4'],
        selectedMode: false,
        selectedOffset: 10,
        minAngle: 0,
        merge: {
          enabled: false,
          maxCount: 10,
          mergeLabel: '其他'
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '饼图',
      w: 350,
      h: 350
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '扇形单击',
    desc: '鼠标点击饼图扇形时触发',
    method: 'click',
    paramsList: [
      {name: 'name', desc: '点击扇形的分类名称', type: 'string'},
      {name: 'value', desc: '点击扇形的数值', type: 'number'},
      {name: 'percent', desc: '点击扇形的占比(%)', type: 'number'}
    ],
  },
  {
    name: '图例点击',
    desc: '点击图例项时触发',
    method: 'legendClick',
    paramsList: [
      {name: 'name', desc: '图例名称', type: 'string'},
      {name: 'selected', desc: '当前图例选中状态', type: 'boolean'}
    ],
  },
]

/**
 * 定义维度、指标字段信息
 */
const datasetFields: ChartDatasetField[] = [
  {
    name: 'nameField',
    desc: '分类名称字段（维度）',
    required: true,
    multiple: false
  },
  {
    name: 'valueField',
    desc: '数值字段（指标）',
    required: true,
    multiple: false
  }
]

export {component, controlPanel, getInstance, behaviors, datasetFields}
