/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

// 分类
const category = 'TinyLine'
// 标题
const title = '迷你基础折线图'
// 类别， new Line()
const chartType = 'TinyLine'
// 用于标识，唯一，title的中文转拼音
const name = 'MiNiJiChuZheXianTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'xField',
    optionField: 'xField', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'data'
  },
  {
    label: '指标',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'yField',
    // 对应options中的字段
    optionField: 'yField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '线条宽度',
    type: 'inputNumber', // 设置组件类型
    field: 'lineStyle_lineWidth', // 字段
    optionField: 'lineStyle.lineWidth', // 对应options中的字段
    value: '2',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '线条颜色',
    type: 'gradual', // 设置组件类型
    field: 'lineStyle_stroke', // 字段
    optionField: 'lineStyle.stroke', // 对应options中的字段
    value: 'l(0) 0:#648ff7 1:#62FF00',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '是否平滑',
    type: 'switch', // 设置组件类型
    field: 'smooth', // 字段
    optionField: 'smooth', // 对应options中的字段
    value: true,
    tabName: 'custom',
    groupName: 'graph'
  }
]

// 数据处理脚本,取出所有指标的值
const dataHandler = '// 取出所有指标的值 \ndata = data.map(item => item[setting.filter(i => i.field === "yField")[0].value])'

// 图表配置 new Line('domName', option)
const option = {
  data: [16, 95, 35, 27, 50, 36, 78, 99, 60, 62, 37],
  height: 60,
  autoFit: true,
  smooth: true,
  lineStyle: {
    stroke: 'l(0) 0:#648ff7 1:#62FF00',
    lineWidth: 2
  }
}

export default {
  category,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler
}
