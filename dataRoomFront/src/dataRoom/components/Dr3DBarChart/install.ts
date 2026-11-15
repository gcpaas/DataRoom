import { withOpacity } from '../../theme/color'
import { DEFAULT_NEUTRAL_COLOR, TOOLTIP_TEXT_COLOR, TOOLTIP_BACKGROUND_OPACITY } from '../../theme/defaults'
import { getDefaultTheme } from '../../theme/registry'
import { defineAsyncComponent } from 'vue'
import { createChartConfig } from '../type/define'
import type { PageType } from '@/dataRoom/constants/PageType.ts'
import type { ChartConfig } from '@/dataRoom/components/type/ChartConfig.ts'
import type { Behavior } from '@/dataRoom/components/type/Behavior.ts'
import type { ChartDatasetField } from '@/dataRoom/components/type/ChartDatasetField.ts'
import type { ChartMockDataset } from '@/dataRoom/components/type/ChartMockDataset.ts'

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface Dr3DBarChartPropsInterface {
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
    type: 'category'
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
      interval: number
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
    itemWidth: number
    itemHeight: number
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
  /** 系列(柱子)配置 */
  series: {
    /** 展示形式 */
    shape: 'diamond' | 'cylinder' | 'cuboid'
    depth: number
    opacity: number
    caps: { topShow: boolean; bottomShow: boolean; autoColor: boolean; topColor: string; bottomColor: string; sideColor: string; opacity: number }
    /** 柱子宽度(px), null=自适应 */
    barWidth: number | null
    /** 自动模式的柱宽上限(px) */
    barMaxWidth: number
    /** 类目间距 */
    barCategoryGap: string
    /** 组内间距 */
    barGap: string
    /** 颜色列表 */
    colors: string[]
    /** 渐变配置 */
    gradient: {
      enabled: boolean
      direction: 'vertical' | 'horizontal'
      autoColor: boolean
      startColor: string
      endColor: string
      /** 渐变端点不透明度 */
      startOpacity: number
      endOpacity: number
    }
    /** 柱子标签 */
    label: {
      show: boolean
      position: 'outside' | 'inside'
      distance: number
      fontSize: number
      color: string
      fontWeight: string
    }
  }
  format: { decimals: number | null; prefix: string; suffix: string }
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
export type Dr3DBarChartConfig = ChartConfig<Dr3DBarChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (pageType: PageType): Dr3DBarChartConfig => {
  const theme = getDefaultTheme(pageType)
  return createChartConfig<Dr3DBarChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'Dr3DBarChart',
    {
      global: {
        padding: [40, 20, 30, 40],
      },
      xAxis: {
        show: true,
        type: 'category',
        axisLine: {
          show: true,
          color: DEFAULT_NEUTRAL_COLOR,
          width: 1,
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: DEFAULT_NEUTRAL_COLOR,
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
          rotate: 0,
          interval: 0,
        },
        axisTick: {
          show: true,
          length: 5,
          color: DEFAULT_NEUTRAL_COLOR,
        },
        splitLine: {
          show: false,
          color: DEFAULT_NEUTRAL_COLOR,
          width: 1,
          type: 'dashed',
        },
      },
      yAxis: {
        show: true,
        name: '',
        range: {
          auto: true,
          min: 0,
          max: 100,
        },
        axisLine: {
          show: false,
          color: DEFAULT_NEUTRAL_COLOR,
          width: 1,
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: DEFAULT_NEUTRAL_COLOR,
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
        },
        axisTick: {
          show: false,
          length: 5,
          color: DEFAULT_NEUTRAL_COLOR,
        },
        splitLine: {
          show: true,
          color: DEFAULT_NEUTRAL_COLOR,
          width: 1,
          type: 'dashed',
        },
      },
      legend: {
        show: true,
        position: 'top',
        textStyle: {
          fontSize: 12,
          color: DEFAULT_NEUTRAL_COLOR,
          fontWeight: 'normal',
        },
        itemGap: 16,
        itemWidth: 12,
        itemHeight: 12,
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        backgroundColor: withOpacity(theme.color.primary, TOOLTIP_BACKGROUND_OPACITY),
        borderColor: theme.color.primary,
        textStyle: {
          fontSize: 12,
          color: TOOLTIP_TEXT_COLOR,
        },
      },
      series: {
        shape: 'diamond',
        depth: 0.4,
        opacity: 1,
        caps: { topShow: true, bottomShow: false, autoColor: true, topColor: theme.color.primary, bottomColor: theme.color.primary, sideColor: theme.color.primary, opacity: 1 },
        barWidth: null,
        barMaxWidth: 40,
        barCategoryGap: '30%',
        barGap: '20%',

        colors: [...theme.series.colors],
        gradient: {
          startOpacity: theme.series.barGradient.startOpacity,
          endOpacity: theme.series.barGradient.endOpacity,
          enabled: true,
          direction: 'vertical',
          autoColor: true,
          startColor: theme.series.colors[0] || theme.color.primary,
          endColor: theme.series.colors[1] || theme.color.primary,
        },
        label: {
          show: true,
          position: 'outside',
          distance: 8,
          fontSize: 12,
          color: DEFAULT_NEUTRAL_COLOR,
          fontWeight: 'normal',
        },
      },
      format: { decimals: null, prefix: '', suffix: '' },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut',
      },
    },
    {
      title: '3D 柱状图',
      w: 400,
      h: 300,
    },
    pageType,
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '鼠标点击柱子时触发',
    method: 'click',
    paramsList: [
      { name: 'x', desc: '点击柱子的类目值', type: 'string' },
      { name: 'y', desc: '点击柱子的数值', type: 'number' },
      { name: 'seriesName', desc: '点击柱子的系列名', type: 'string' },
    ],
  },
  {
    name: '图例点击',
    desc: '点击图例项时触发',
    method: 'legendClick',
    paramsList: [
      { name: 'name', desc: '图例名称', type: 'string' },
      { name: 'selected', desc: '当前图例选中状态', type: 'boolean' },
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
    multiple: false,
  },
  {
    name: 'yField',
    desc: 'Y轴/数值字段（指标）',
    required: true,
    multiple: true,
  },
  {
    name: 'seriesField',
    desc: '系列分组字段',
    required: false,
    multiple: false,
  },
]

/**
 * 组件内置模拟数据集。
 *
 * dataset 用于数据样例弹窗和未配置数据集时的设计态默认渲染。
 * fields 表示组件字段默认绑定到模拟数据中的哪个字段。
 */
const mockDataset: ChartMockDataset = {
  dataset: [
    { time: '1月', value: 200, compareValue: 150 },
    { time: '2月', value: 85, compareValue: 60 },
    { time: '3月', value: 112, compareValue: 95 },
    { time: '4月', value: 275, compareValue: 200 },
    { time: '5月', value: 305, compareValue: 240 },
    { time: '6月', value: 415, compareValue: 330 },
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
    {
      name: 'yField',
      bindName: 'compareValue',
    },
  ],
}

export { component, controlPanel, getInstance, behaviors, datasetFields, mockDataset }
