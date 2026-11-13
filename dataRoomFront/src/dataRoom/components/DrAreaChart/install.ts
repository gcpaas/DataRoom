import { getDefaultTheme } from '../../theme/registry'
import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {PageType} from '@/dataRoom/constants/PageType.ts'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts"
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrAreaChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** X 轴配置 */
  xAxis: {
    /** 是否显示 */
    show: boolean
    /** 数据类型 */
    type: 'category' | 'time' | 'value'
    /** 轴线 */
    axisLine: {
      show: boolean
      color: string
      width: number
    }
    /** 轴标签 */
    axisLabel: {
      show: boolean
      fontSize: number
      color: string
      fontWeight: string
      fontFamily: string
      /** 旋转角度 */
      rotate: number
    }
    /** 刻度线 */
    axisTick: {
      show: boolean
      length: number
      color: string
    }
    /** 网格线 */
    splitLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
    }
  }
  /** Y 轴配置 */
  yAxis: {
    /** 是否显示 */
    show: boolean
    /** 轴名称 */
    name: string
    /** 显示范围 */
    range: {
      auto: boolean
      min: number
      max: number
    }
    /** 轴线 */
    axisLine: {
      show: boolean
      color: string
      width: number
    }
    /** 轴标签 */
    axisLabel: {
      show: boolean
      fontSize: number
      color: string
      fontWeight: string
      fontFamily: string
    }
    /** 刻度线 */
    axisTick: {
      show: boolean
      length: number
      color: string
    }
    /** 网格线 */
    splitLine: {
      show: boolean
      color: string
      width: number
      type: 'solid' | 'dashed' | 'dotted'
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
    trigger: 'axis' | 'item'
    backgroundColor: string
    borderColor: string
    textStyle: {
      fontSize: number
      color: string
    }
  }
  /** 系列(区域)配置 */
  series: {
    /** 展示形式 */
    displayMode: 'normal' | 'stack'
    /** 折线类型 */
    lineType: 'line' | 'smooth'
    /** 折线宽度 */
    lineWidth: number
    /** 折线样式 */
    lineStyle: 'solid' | 'dashed' | 'dotted'
    /** 颜色列表 */
    colors: string[]
    /** 区域样式 */
    areaStyle: {
      /** 填充透明度 */
      opacity: number
      /** 渐变配置 */
      gradient: {
        enabled: boolean
        topOpacity: number
        bottomOpacity: number
      }
    }
    /** 数据点符号 */
    symbol: {
      /** 填充不透明度；旧配置缺省时保持实心 */
      fillOpacity?: number
      show: boolean
      type: 'circle' | 'rect' | 'triangle' | 'diamond' | 'none'
      size: number
      borderWidth: number
    }
    /** 数据标签 */
    label: {
      show: boolean
      position: 'top' | 'bottom' | 'inside'
      fontSize: number
      color: string
      fontWeight: string
    }
    /** 是否连接空值 */
    connectNulls: boolean
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
export type DrAreaChartConfig = ChartConfig<DrAreaChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (pageType: PageType): DrAreaChartConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<DrAreaChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrAreaChart',
    {
      global: {
        padding: [40, 20, 30, 40]
      },
      xAxis: {
        show: true,
        type: 'category',
        axisLine: {
          show: true,
          color: theme.border.primary,
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: theme.text.secondary,
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
          rotate: 0
        },
        axisTick: {
          show: true,
          length: 5,
          color: theme.border.secondary
        },
        splitLine: {
          show: false,
          color: theme.border.secondary,
          width: 1,
          type: 'dashed'
        }
      },
      yAxis: {
        show: true,
        name: '',
        range: {
          auto: true,
          min: 0,
          max: 100
        },
        axisLine: {
          show: false,
          color: theme.border.primary,
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: theme.text.secondary,
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei'
        },
        axisTick: {
          show: false,
          length: 5,
          color: theme.border.secondary
        },
        splitLine: {
          show: true,
          color: theme.border.secondary,
          width: 1,
          type: 'dashed'
        }
      },
      legend: {
        show: true,
        position: 'top',
        textStyle: {
          fontSize: 12,
          color: theme.text.secondary,
          fontWeight: 'normal'
        },
        itemGap: 16
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        backgroundColor: theme.background.secondary,
        borderColor: theme.border.primary,
        textStyle: {
          fontSize: 12,
          color: theme.text.primary
        }
      },
      series: {
        displayMode: 'normal',
        lineType: 'line',
        lineWidth: 2,
        lineStyle: 'solid',
        colors: [...theme.series.colors],
        areaStyle: {
          opacity: 1,
          gradient: {
            enabled: true,
            topOpacity: theme.series.gradient.startOpacity,
            bottomOpacity: theme.series.gradient.endOpacity
          }
        },
        symbol: {
          fillOpacity: theme.series.point.fillOpacity,
          show: false,
          type: 'circle',
          size: 4,
          borderWidth: 1
        },
        label: {
          show: false,
          position: 'top',
          fontSize: 12,
          color: theme.text.primary,
          fontWeight: 'normal'
        },
        connectNulls: false
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '面积图',
      w: 400,
      h: 300
    },
    pageType
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '数据点单击',
    desc: '鼠标点击面积图数据点时触发',
    method: 'click',
    paramsList: [
      {name: 'x', desc: '点击数据点的类目值', type: 'string'},
      {name: 'y', desc: '点击数据点的数值', type: 'number'},
      {name: 'seriesName', desc: '点击数据点的系列名', type: 'string'}
    ],
  },
  {
    name: '区域单击',
    desc: '鼠标点击填充区域时触发',
    method: 'areaClick',
    paramsList: [
      {name: 'seriesName', desc: '点击区域的系列名', type: 'string'}
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
    name: 'xField',
    desc: 'X轴/类目字段（维度）',
    required: true,
    multiple: false
  },
  {
    name: 'yField',
    desc: 'Y轴/数值字段（指标）',
    required: true,
    multiple: true
  },
  {
    name: 'seriesField',
    desc: '系列分组字段',
    required: false,
    multiple: false
  }
]

/**
 * 组件内置模拟数据集。
 *
 * dataset 用于数据样例弹窗和未配置数据集时的设计态默认渲染。
 * fields 表示组件字段默认绑定到模拟数据中的哪个字段。
 */
const mockDataset: ChartMockDataset = {
  dataset: [
    {
      time: '2024-06-05',
      value: 120,
    },
    {
      time: '2024-06-06',
      value: 200,
    },
    {
      time: '2024-06-07',
      value: 150,
    },
    {
      time: '2024-06-08',
      value: 80,
    },
    {
      time: '2024-06-09',
      value: 170,
    },
    {
      time: '2024-06-10',
      value: 110,
    },
  ],
  fields: [
    {
      name: 'xField',
      bindName: 'time',
    },
    {
      name: 'yField',
      bindName: 'value',
    },
  ],
}

export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
