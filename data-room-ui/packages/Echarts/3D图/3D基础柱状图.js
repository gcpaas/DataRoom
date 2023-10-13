// 配置版本号
const version = '2023091901'
// 标题
const title = '3D基础柱状图'
// 用于标识，唯一，和文件夹名称一致
const name = '3D基础柱状图'
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
    label: '柱子顶部颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barTopColor', // 字段
    optionField: 'seriesCustom.barTopColor', // 对应options中的字段
    value: '#2DB1EF',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '柱子颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_barColor', // 字段
    optionField: 'seriesCustom.barColor', // 对应options中的字段
    value: '#115ba6',
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
    label: '阴影柱子颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_shadowColor', // 字段
    optionField: 'seriesCustom.shadowColor', // 对应options中的字段
    value: '#041133',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '阴影柱子顶部颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'seriesCustom_shadowTopColor', // 字段
    optionField: 'seriesCustom.shadowTopColor', // 对应options中的字段
    value: '#142f5a',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '底部阴影颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'graphic_children_style_fill',
    // 对应options中的字段
    optionField: 'graphic.children.style.fill',
    value: '#3f4867',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签',
    type: 'switch', // 设置组件类型
    field: 'series_barColor_label_show', // 字段
    optionField: 'series.barColor.label.show', // 对应options中的字段
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签位置',
    type: 'select', // 设置组件类型
    field: 'series_barColor_label_position', // 字段
    optionField: 'series.barColor.label.position', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: 'inside',
    tabName: 'custom',
    options: [
      {
        label: '顶部',
        value: 'top'
      },
      {
        label: '居中',
        value: 'inside'
      },
      {
        label: '底部',
        value: 'bottom'
      }
    ],
    groupName: 'graph'
  },
  {
    label: '数据标签颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'series_barColor_label_color', // 字段
    optionField: 'series.barColor.label.color', // 对应options中的字段
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'series_barColor_label_fontSize',
    // 对应options中的字段
    optionField: 'series.barColor.label.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 网格线
  {
    label: '分隔线',
    type: 'switch',
    field: 'yAxis_splitLine_show',
    optionField: 'yAxis.splitLine.show',
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '宽度',
    type: 'inputNumber',
    field: 'yAxis_splitLine_lineStyle_width',
    optionField: 'yAxis.splitLine.lineStyle.width',
    value: 2,
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '颜色',
    type: 'colorPicker',
    field: 'yAxis_splitLine_lineStyle_color',
    optionField: 'yAxis.splitLine.lineStyle.color',
    value: '#fff',
    tabName: 'custom',
    groupName: 'grid'
  },
  // x轴 xAxis
  {
    label: '显示',
    type: 'switch',
    field: 'xAxis_show',
    optionField: 'xAxis.show',
    value: 0,
    active: 1,
    inactive: 0,
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
  {
    label: '标题到轴线距离',
    type: 'inputNumber',
    field: 'xAxis_nameGap',
    optionField: 'xAxis.nameGap',
    value: 10,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题字体大小',
    type: 'inputNumber',
    field: 'xAxis_nameTextStyle_fontSize',
    optionField: 'xAxis.nameTextStyle.fontSize',
    value: 12,
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
    label: '轴线显示',
    type: 'switch',
    field: 'xAxis_axisLine_show',
    optionField: 'xAxis.axisLine.show',
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '轴线颜色',
    type: 'colorPicker',
    field: 'xAxis_axisLine_lineStyle_color',
    optionField: 'xAxis.axisLine.lineStyle.color',
    // 是否多选
    multiple: false,
    value: '#333',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '轴线宽度',
    type: 'inputNumber',
    field: 'xAxis_axisLine_lineStyle_width',
    optionField: 'xAxis.axisLine.lineStyle.width',
    value: 1,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签显示',
    type: 'switch',
    field: 'xAxis_axisLabel_show',
    optionField: 'xAxis.axisLabel.show',
    value: 1,
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
    label: '标签大小',
    type: 'inputNumber',
    field: 'xAxis_axisLabel_textStyle_fontSize',
    optionField: 'xAxis.axisLabel.textStyle.fontSize',
    value: 14,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签距离',
    type: 'inputNumber',
    field: 'xAxis_axisLabel_margin',
    optionField: 'xAxis.axisLabel.margin',
    value: 30,
    tabName: 'custom',
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
    label: '标题',
    type: 'input',
    field: 'yAxis_name',
    optionField: 'yAxis.name',
    value: '',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题位置',
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
    label: '标题到轴线距离',
    type: 'inputNumber',
    field: 'yAxis_nameGap',
    optionField: 'yAxis.nameGap',
    value: 10,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题字体大小',
    type: 'inputNumber',
    field: 'yAxis_nameTextStyle_fontSize',
    optionField: 'yAxis.nameTextStyle.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题颜色',
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
    label: '轴线显示',
    type: 'switch',
    field: 'yAxis_axisLine_show',
    optionField: 'yAxis.axisLine.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '轴线颜色',
    type: 'colorPicker',
    field: 'yAxis_axisLine_lineStyle_color',
    optionField: 'yAxis.axisLine.lineStyle.color',
    // 是否多选
    multiple: false,
    value: '#333',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '轴线宽度',
    type: 'inputNumber',
    field: 'yAxis_axisLine_lineStyle_width',
    optionField: 'yAxis.axisLine.lineStyle.width',
    value: 1,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签显示',
    type: 'switch',
    field: 'yAxis_axisLabel_show',
    optionField: 'yAxis.axisLabel.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'yAxis_axisLabel_textStyle_color',
    optionField: 'yAxis.axisLabel.textStyle.color',
    // 是否多选
    multiple: false,
    value: '#8C8C8C',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签大小',
    type: 'inputNumber',
    field: 'yAxis_axisLabel_textStyle_fontSize',
    optionField: 'yAxis.axisLabel.textStyle.fontSize',
    value: 14,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签距离',
    type: 'inputNumber',
    field: 'yAxis_axisLabel_margin',
    optionField: 'yAxis.axisLabel.margin',
    value: 10,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '刻度显示',
    type: 'switch',
    field: 'yAxis_axisTick_show',
    optionField: 'yAxis.axisTick.show',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '刻度颜色',
    type: 'colorPicker',
    field: 'yAxis_axisTick_lineStyle_color',
    optionField: 'yAxis.axisTick.lineStyle.color',
    // 是否多选
    multiple: false,
    value: '#fff',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '刻度宽度',
    type: 'inputNumber',
    field: 'yAxis_axisTick_length',
    optionField: 'yAxis.axisTick.length',
    // 是否多选
    multiple: false,
    value: 1,
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
    left: '12%',
    right: '8%',
    bottom: '20%',
    z: 100,
    containLabel: false,
    show: false
  },
  graphic: {
    type: 'group',
    bottom: '10%',
    left: '7%',
    z: 100,
    children: [
      {
        type: 'rect',
        left: 0,
        bottom: 0,
        shape: {
          width: 418 * 0.9,
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
          points: [[418 / 10, -320 / 6], [418 - 418 / 6, -320 / 6], [418 * 0.9, 0], [0, 0]]
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
      nameGap: 30,
      type: 'category',
      data: xData,
      nameTextStyle: {
        color: '',
        fontSize: 12
      },
      nameLocation: '',
      // 坐标轴刻度设置
      axisTick: {
        show: false,
        alignWithLabel: true,
        lineStyle: {
          width: 1,
          color: '#333'
        }
      },
      // 是否显示坐标轴的轴线
      axisLine: {
        show: false,
        lineStyle: {
          color: '#333',
          width: 1
        }
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
    nameGap: 10,
    nameTextStyle: {
      color: '',
      fontSize: 12
    },
    nameLocation: 'end',
    show: true,
    type: 'value',
    axisLabel: {
      show: true,
      textStyle: {
        color: '#333',
        fontSize: 12
      },
      margin: 10
    },
    axisTick: {
      show: true,
      length: 1,
      lineStyle: {
        color: '#fff',
        width: 1
      }
    },
    // 分隔线
    splitLine: {
      show: true, // yAxis.show配置为true时，该配置才有效
      lineStyle: {
        color: '#fff',
        width: 2
      }
    },
    // y轴轴线是否显示
    axisLine: {
      show: true,
      lineStyle: {
        color: '#333',
        width: 1
      }

    }
  },
  seriesCustom: {
    barWidth: 30,
    // 顶部菱形颜色
    barTopColor: '#2DB1EF',
    // 底部菱形颜色
    barBottomColor: '#187dcb',
    // 柱子颜色
    barColor: '#1db0dd',
    // 阴影柱子颜色
    shadowColor: '#041133',
    // 阴影柱子顶部颜色
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
        show: false
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
      label: {
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
      color: '#115ba6',
      label: {
        show: true,
        position: 'inside',
        color: '#fff',
        fontSize: 12
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
        show: false
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
