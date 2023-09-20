import * as echarts from 'echarts'
// 配置版本号
const version = '2023091901'
// 标题
const title = '3D基础柱状图'
// 用于标识，唯一，和文件夹名称一致
const name = '3DJiChuZhuZhuangTu'
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
  //  样式配置
  {
    label: '柱子宽度',
    type: 'inputNumber', // 设置组件类型
    field: 'seriesCustom_barWidth', // 字段
    optionField: 'seriesCustom.barWidth', // 对应options中的字段
    value: 30,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签',
    type: 'switch', // 设置组件类型
    field: 'label_style_opacity', // 字段
    // optionField: 'series', // 对应options中的字段
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'graph'
  },
  // x轴 xAxis
  {
    label: '显示',
    type: 'switch',
    field: 'xAxis_show',
    optionField: 'xAxis.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '轴线显示',
    type: 'switch',
    field: 'xAxis_axisLine_show',
    optionField: 'xAxis.axisLine.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '刻度显示',
    type: 'switch',
    field: 'xAxis_axisTick_show',
    optionField: 'xAxis.axisTick.show',
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签显示',
    type: 'switch',
    field: 'xAxis_axisLabel_show',
    optionField: 'xAxis.axisLabel.show',
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'xAxis_axisLabel_textStyle_color',
    optionField: 'xAxis.axisLabel.textStyle.color',
    // 是否多选
    multiple: false,
    value: '#8C8C8C',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题',
    type: 'input',
    field: 'xAxis_name',
    optionField: 'xAxis.name',
    value: '',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题颜色',
    type: 'colorPicker',
    field: 'xAxis_nameTextStyle_color',
    optionField: 'xAxis.nameTextStyle.color',
    // 是否多选
    multiple: false,
    value: '#8C8C8C',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题大小',
    type: 'inputNumber',
    field: 'xAxis_nameTextStyle_fontSize',
    optionField: 'xAxis.nameTextStyle.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题位置',
    type: 'select',
    field: 'xAxis_nameLocation',
    optionField: 'xAxis.nameLocation',
    value: 'start',
    tabName: 'custom',
    options: [
      {
        label: '左',
        value: 'start'
      },
      {
        label: '中',
        value: 'center'
      },
      {
        label: '右',
        value: 'end'
      }],
    groupName: 'xAxis'
  },
  // Y轴 yAxis
  {
    label: '显示',
    type: 'switch',
    field: 'yAxis_show',
    optionField: 'yAxis.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '名称',
    type: 'input',
    field: 'yAxis_name',
    optionField: 'yAxis.name',
    value: '',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '名称颜色',
    type: 'colorPicker',
    field: 'yAxis_nameTextStyle_color',
    optionField: 'yAxis.nameTextStyle.color',
    // 是否多选
    multiple: false,
    value: '#8C8C8C',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '名称大小',
    type: 'inputNumber',
    field: 'yAxis_nameTextStyle_fontSize',
    optionField: 'yAxis.nameTextStyle.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '名称位置',
    type: 'select',
    field: 'yAxis_nameLocation',
    optionField: 'yAxis.nameLocation',
    value: 'end',
    tabName: 'custom',
    options: [
      {
        label: '下',
        value: 'start'
      },
      {
        label: '中',
        value: 'center'
      },
      {
        label: '上',
        value: 'end'
      }],
    groupName: 'yAxis'
  },
  {
    label: '刻度颜色',
    type: 'colorPicker',
    field: 'yAxis_axisLabel_textStyle',
    optionField: 'yAxis.axisLabel.textStyle.color',
    // 是否多选
    multiple: false,
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'yAxis'
  }
]

// 配置处理脚本
const optionHandler = ''

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const xData = ['本年话务总量', '本年人工话务量', '每万客户呼入量', '本年话务总量']
const yData = [300, 1230, 425, 300]
const maxData = [1500, 1500, 1500, 1500]
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
      show: false,
      name: '',
      type: 'category',
      data: xData,
      nameTextStyle: {
        color: '',
        fontSize: 12
      },
      nameLocation: '',
      // 坐标轴刻度设置:x轴数据展示
      axisTick: {
        show: false,
        alignWithLabel: true
      },
      // 是否显示坐标轴的轴线
      axisLine: {
        show: false
      },
      // 坐标轴刻度标签
      axisLabel: {
        show: false,
        textStyle: {
          fontSize: 10,
          color: 'rgb(40, 129, 170)'
        },
        margin: 30
      }
    },
    {
      show: false,
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
  yAxis: {
    name: '',
    nameTextStyle: {
      color: '',
      fontSize: 12
    },
    nameLocation: 'end',
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
  },
  seriesCustom: {
    barWidth: 30,
    barTopColor: '#2DB1EF',
    barBottomColor: '#187dcb',
    barColor1: '#115ba6',
    barColor2: '#1db0dd',
    shadowColor: '#041133',
    shadowTopColor: '#142f5a'
  },
  series: [
    // 顶部
    {
      id: 'barTopColor', // 用于区分是图表的什么部分
      type: 'pictorialBar', // 象形柱图
      symbol: 'diamond',
      symbolOffset: [0, '-50%'], // 上部菱形
      symbolSize: [30, 15],
      // symbolOffset: [0, -6], // 上部椭圆
      symbolPosition: 'end',
      z: 12,
      label: {
        normal: {
          show: false,
          position: 'top',
          fontSize: 15,
          fontWeight: 'bold',
          color: '#27a7ce'
        }
      },
      color: '#2DB1EF',
      tooltip: {
        show: false
      },
      data: yData
    },
    // 底部
    {
      id: 'barBottomColor', // 用于区分是图表的什么部分
      type: 'pictorialBar',
      symbol: 'diamond',
      symbolSize: [30, 15],
      symbolOffset: ['0%', '50%'], // 下部菱形
      // symbolOffset: [0, 7], // 下部椭圆
      z: 12,
      color: '#187dcb',
      tooltip: {
        show: false
      },
      data: yData
    },
    // 柱子
    {
      id: 'barColor', // 用于区分是图表的什么部分
      type: 'bar',
      barWidth: 30,
      z: 10,
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
      data: yData
    },
    // 阴影柱子
    {
      id: 'shadowColor', // 用于区分是图表的什么部分
      type: 'bar',
      barWidth: 30,
      barGap: '-100%',
      itemStyle: {
        normal: {
          opacity: 0.8,
          shadowColor: 'rgba(0, 0, 0, 0.5)', // 阴影颜色
          shadowBlur: 0 // 阴影模糊值
        }
      },
      label: {
        show: false
      },
      color: '#041133',
      tooltip: {
        show: false
      },
      data: maxData
    },
    // 阴影顶部
    {
      id: 'shadowTopColor', // 用于区分是图表的什么部分
      type: 'pictorialBar', // 象形柱图
      symbol: 'diamond',
      symbolOffset: [0, '-50%'], // 上部菱形
      symbolSize: [30, 15],
      // symbolOffset: [0, -6], // 上部椭圆
      symbolPosition: 'end',
      z: 12,
      label: {
        normal: {
          show: false,
          position: 'top',
          fontSize: 15,
          fontWeight: 'bold',
          color: '#27a7ce'
        }
      },
      color: '#142f5a',
      tooltip: {
        show: false
      },
      data: maxData

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
