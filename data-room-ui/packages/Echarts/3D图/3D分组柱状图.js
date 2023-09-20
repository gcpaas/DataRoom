import * as echarts from 'echarts'
// 配置版本号
const version = '2023091901'
// 标题
const title = '3D分组柱状图'
// 用于标识，唯一，和文件夹名称一致
const name = '3DFenZuZhuZhuangTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    type: 'select', // 设置组件类型
    field: 'xField', // 字段
    optionField: 'xField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '指标',
    type: 'select', // 设置组件类型
    field: 'yField', // 字段
    optionField: 'yField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '分组字段',
    type: 'select', // 设置组件类型
    field: 'seriesField', // 字段
    optionField: 'seriesField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '柱子顶部颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barTopColor', // 字段
    optionField: 'seriesCustom.barTopColor', // 对应options中的字段
    value: '#2DB1EF',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子颜色1',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barColor1', // 字段
    optionField: 'seriesCustom.barColor1', // 对应options中的字段
    value: '#115ba6',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子颜色2',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barColor2', // 字段
    optionField: 'seriesCustom.barColor2', // 对应options中的字段
    value: '#1db0dd',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子底部颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barBottomColor', // 字段
    optionField: 'seriesCustom.barBottomColor', // 对应options中的字段
    value: '#187dcb',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子背景顶部颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_shadowTopColor', // 字段
    optionField: 'seriesCustom.shadowTopColor', // 对应options中的字段
    value: '#142f5a',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子背景颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_shadowColor', // 字段
    optionField: 'seriesCustom.shadowColor', // 对应options中的字段
    value: '#041133',
    tabName: 'custom',
    groupName: 'graph'
  }
]

// 配置处理脚本
const optionHandler = ''

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const xData = ['本年话务总量', '本年人工话务量', '每万客户呼入量', '每万客户呼入量'
]
const yData1 = [300, 1230, 425, 1200]
const yData2 = [400, 400, 400, 1200]
const maxData1 = [1500, 1500, 1500, 1500]
const maxData2 = [1500, 1500, 1500, 1500]
const option = {
  animation: false,
  tooltip: {
    show: true
  },
  grid: {
    left: '15%',
    right: '5%',
    bottom: '15%',
    z: 100,
    containLabel: false,
    show: false
  },
  graphic: {
    type: 'group',
    bottom: '8%',
    left: '10%',
    z: 100,
    children: [
      {
        type: 'rect',
        left: 0,
        bottom: 0,
        shape: {
          width: 400,
          height: 10
        },
        style: {
          fill: '#3f4867'
        }
      },
      {
        type: 'polygon',
        left: 0,
        bottom: 10,
        shape: {
          // 左上、右上、右下、左下
          points: [[40, -50], [360, -50], [400, 0], [0, 0]]
        },
        style: {
          fill: '#303256'
        }
      }
    ]
  },
  xAxis: [
    {
      type: 'category',
      data: xData,
      // 坐标轴刻度设置:x轴数据展示
      axisTick: {
        show: true,
        alignWithLabel: true
      },
      // 横坐标颜色
      nameTextStyle: {
        color: '#82b0ec'
      },
      // 是否显示坐标轴的轴线
      axisLine: {
        show: false
      },
      // 坐标轴刻度标签
      axisLabel: {
        textStyle: {
          fontSize: 10,
          color: 'rgb(40, 129, 170)'
        },
        margin: 30
      }
    },
    {
      type: 'category',
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      splitArea: {
        show: false
      },
      splitLine: {
        show: false
      },
      data: xData
    }
  ],
  yAxis: [
    {
      show: true, // y轴文本标签显示
      type: 'value',
      axisLabel: {
        textStyle: {
          color: 'rgb(40, 129, 170)'
        }
      },
      // 分隔线
      splitLine: {
        show: false // yAxis.show配置为true时，该配置才有效
      },
      // y轴轴线是否显示
      axisLine: {
        show: true
      }
    }
  ],
  seriesCustom: {
    barTopColor: '#2DB1EF',
    barBottomColor: '#187dcb',
    barColor1: '#115ba6',
    barColor2: '#1db0dd',
    shadowColor: '#041133',
    shadowTopColor: '#142f5a'
  },
  series: [
    {
      name: 'y1柱子顶部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['-60%', -5],
      symbolPosition: 'end',
      z: 15,
      zlevel: 2,
      color: 'rgba(2, 175, 249,1)',
      data: yData1
    },
    {
      name: 'y2柱子顶部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['60%', -5],
      symbolPosition: 'end',
      z: 15,
      zlevel: 2,
      color: 'rgba(45, 206, 177,0.9)',
      data: yData2
    },
    {
      name: 'y1',
      type: 'bar',
      barGap: '20%',
      30: 30,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#115ba6'
            },
            {
              offset: 1,
              color: '#1db0dd'
            }
          ]),
          opacity: 0.8,
          shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影颜色
          shadowBlur: 0 // 阴影模糊值
        }
      },
      label: {
        show: false
      },
      zlevel: 2,
      z: 12,
      data: yData1
    },
    {
      name: 'y2',
      type: 'bar',
      // barGap: '60%',
      30: 30,
      itemStyle: {
        normal: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: '#73eccd'
            },
            {
              offset: 1,
              color: '#4dd9e5'
            }
          ]),
          opacity: 0.8,
          shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影颜色
          shadowBlur: 0 // 阴影模糊值
        }
      },
      label: {
        show: false
      },
      zlevel: 2,
      z: 12,
      data: yData2
    },
    {
      name: 'y1柱子底部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['-60%', 5],
      zlevel: 2,
      z: 15,
      color: 'rgb(2, 192, 255)',
      data: yData1
    },
    {
      name: 'y2柱子底部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['60%', 5],
      zlevel: 2,
      z: 15,
      color: 'rgba(45, 206, 177,0.9)',
      data: yData2
    },
    {
      name: '背景柱子1',
      type: 'bar',
      tooltip: { show: false },
      xAxisIndex: 1,
      barGap: '20%',
      data: maxData1,
      zlevel: 1,
      30: 30,
      itemStyle: {
        normal: {
          color: 'rgba(9, 44, 76,.8)'
        }
      }
    },
    {
      name: '背景柱子2',
      type: 'bar',
      tooltip: { show: false },
      xAxisIndex: 1,
      barGap: '20%',
      data: maxData2,
      zlevel: 1,
      30: 30,
      itemStyle: {
        normal: {
          color: 'rgba(16, 56, 70,.8)'
        }
      }
    },
    {
      name: 'y1背景柱子顶部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['-60%', -5],
      symbolPosition: 'end',
      z: 15,
      color: 'rgb(15, 69, 133)',
      zlevel: 1,
      data: maxData1
    },
    {
      name: 'y2背景柱子顶部',
      type: 'pictorialBar',
      tooltip: { show: false },
      symbol: 'diamond',
      symbolSize: [30, 10],
      symbolOffset: ['60%', -5],
      symbolPosition: 'end',
      z: 15,
      color: 'rgb(30, 100, 112)',
      zlevel: 1,
      data: maxData2
    }
  ]
}
export default {
  version,
  title,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
