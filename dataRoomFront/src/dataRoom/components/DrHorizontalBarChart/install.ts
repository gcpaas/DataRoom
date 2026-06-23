import {defineAsyncComponent} from 'vue'
import {createChartConfig} from '../type/define'
import type {ChartConfig} from "@/dataRoom/components/type/ChartConfig.ts"
import type {Behavior} from "@/dataRoom/components/type/Behavior.ts"
import type {ChartDatasetField} from "@/dataRoom/components/type/ChartDatasetField.ts"
import type {ChartMockDataset} from "@/dataRoom/components/type/ChartMockDataset.ts"

// 注册组件
const component = defineAsyncComponent(() => import('./index.vue'))
// 注册组件配置面板
const controlPanel = defineAsyncComponent(() => import('./panel/index.vue'))

export interface DrHorizontalBarChartPropsInterface {
  /** 全局配置 */
  global: {
    /** 图表内边距 [上, 右, 下, 左] (px) */
    padding: [number, number, number, number]
  }
  /** X 轴配置（数值轴，水平方向） */
  xAxis: {
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
      /** 格式化 */
      format: 'default' | 'integer' | 'float1' | 'float2' | 'percent' | 'percent1' | 'thousand' | 'thousand1'
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
  /** Y 轴配置（类目轴，垂直方向） */
  yAxis: {
    /** 是否显示 */
    show: boolean
    /** 数据类型 */
    type: 'category' | 'value' | 'time'
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
      /** 标签最大宽度(px) */
      maxWidth: number
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
  /** 系列(条形)配置 */
  series: {
    /** 展示形式 */
    displayMode: 'group' | 'stack'
    /** 条形宽度(px), null=自适应 */
    barWidth: number | null
    /** 条形最大宽度(px) */
    barMaxWidth: number
    /** 类目间距 */
    barCategoryGap: string
    /** 组内间距 */
    barGap: string
    /** 圆角 [左上, 右上, 右下, 左下] */
    borderRadius: [number, number, number, number]
    /** 颜色列表 */
    colors: string[]
    /** 渐变配置 */
    gradient: {
      enabled: boolean
      direction: 'vertical' | 'horizontal'
    }
    /** 条形标签 */
    label: {
      show: boolean
      position: 'right' | 'inside' | 'left' | 'top' | 'bottom'
      fontSize: number
      color: string
      fontWeight: string
      /** 格式化 */
      format: 'default' | 'integer' | 'float1' | 'float2' | 'percent' | 'percent1' | 'thousand' | 'thousand1'
    }
    /** 背景条 */
    backgroundBar: {
      show: boolean
      color: string
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
export type DrHorizontalBarChartConfig = ChartConfig<DrHorizontalBarChartPropsInterface>

/**
 * 定义获取该组件实例的方法，返回本组件新实例对象
 */
const getInstance = (): DrHorizontalBarChartConfig => {
  return createChartConfig<DrHorizontalBarChartPropsInterface>(
    // 组件类型需与当前组件目录名保持一致
    'DrHorizontalBarChart',
    {
      global: {
        padding: [40, 40, 30, 80]
      },
      xAxis: {
        show: true,
        name: '',
        range: {
          auto: true,
          min: 0,
          max: 100
        },
        axisLine: {
          show: true,
          color: '#cccccc',
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: '#999999',
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
          format: 'default'
        },
        axisTick: {
          show: true,
          length: 5,
          color: '#cccccc'
        },
        splitLine: {
          show: true,
          color: '#eeeeee',
          width: 1,
          type: 'dashed'
        }
      },
      yAxis: {
        show: true,
        type: 'category',
        axisLine: {
          show: false,
          color: '#cccccc',
          width: 1
        },
        axisLabel: {
          show: true,
          fontSize: 12,
          color: '#999999',
          fontWeight: 'normal',
          fontFamily: 'Microsoft YaHei',
          maxWidth: 80
        },
        axisTick: {
          show: false,
          length: 5,
          color: '#cccccc'
        },
        splitLine: {
          show: false,
          color: '#eeeeee',
          width: 1,
          type: 'dashed'
        }
      },
      legend: {
        show: true,
        position: 'top',
        textStyle: {
          fontSize: 12,
          color: '#666666',
          fontWeight: 'normal'
        },
        itemGap: 16
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        backgroundColor: 'rgba(50, 50, 50, 0.7)',
        borderColor: 'transparent',
        textStyle: {
          fontSize: 12,
          color: '#ffffff'
        }
      },
      series: {
        displayMode: 'group',
        barWidth: null,
        barMaxWidth: 40,
        barCategoryGap: '30%',
        barGap: '20%',
        borderRadius: [0, 2, 2, 0],
        colors: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272'],
        gradient: {
          enabled: false,
          direction: 'horizontal'
        },
        label: {
          show: false,
          position: 'right',
          fontSize: 12,
          color: '#333333',
          fontWeight: 'normal',
          format: 'default'
        },
        backgroundBar: {
          show: false,
          color: 'rgba(180, 180, 180, 0.2)'
        }
      },
      animation: {
        enabled: true,
        duration: 1000,
        easing: 'cubicOut'
      }
    },
    {
      title: '条形图',
      w: 400,
      h: 300
    }
  )
}

/**
 * 定义组件交互定义
 */
const behaviors: Behavior[] = [
  {
    name: '单击',
    desc: '鼠标点击条形时触发',
    method: 'click',
    paramsList: [
      {name: 'x', desc: '点击条形的数值', type: 'number'},
      {name: 'y', desc: '点击条形的类目值', type: 'string'},
      {name: 'seriesName', desc: '点击条形的系列名', type: 'string'}
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
    desc: '数值字段（指标，对应水平方向）',
    required: true,
    multiple: true
  },
  {
    name: 'yField',
    desc: '类目字段（维度，对应垂直方向）',
    required: true,
    multiple: false
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
      category: '华东',
      value: 120,
    },
    {
      category: '华北',
      value: 200,
    },
    {
      category: '华南',
      value: 150,
    },
    {
      category: '西南',
      value: 80,
    },
    {
      category: '西北',
      value: 170,
    },
    {
      category: '东北',
      value: 110,
    },
  ],
  fields: [
    {
      name: 'yField',
      bindName: 'category',
    },
    {
      name: 'xField',
      bindName: 'value',
    },
  ],
}

export {component, controlPanel, getInstance, behaviors, datasetFields, mockDataset}
