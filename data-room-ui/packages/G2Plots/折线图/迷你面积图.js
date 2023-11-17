/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

// 配置版本号
const version = '2023111401'
// 分类
const category = 'TinyArea'
// 标题
const title = '迷你面积图'
// 类别， new Line()
const chartType = 'TinyArea'
// 用于标识，唯一，title的中文转拼音
const name = 'MiNiMianJiTu'

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
    label: '平滑',
    type: 'switch', // 设置组件类型
    field: 'smooth', // 字段
    optionField: 'smooth', // 对应options中的字段
    value: true,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线宽度',
    type: 'inputNumber', // 设置组件类型
    field: 'line_size', // 字段
    optionField: 'line.size', // 对应options中的字段
    value: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线颜色',
    type: 'gradual', // 设置组件类型
    field: 'line_color', // 字段
    optionField: 'line.color', // 对应options中的字段
    value: 'l(0) 0:#6B74E4 1:#6B74E4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '面积颜色',
    type: 'gradual', // 设置组件类型
    field: 'areaStyle_fill', // 字段
    optionField: 'areaStyle.fill', // 对应options中的字段
    value: 'l(0) 0:#6B74E4 1:#6B74E4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '面积透明度',
    type: 'inputNumber', // 设置组件类型
    field: 'areaStyle_fillOpacity', // 字段
    optionField: 'areaStyle.fillOpacity', // 对应options中的字段
    value: 0.3,
    tabName: 'custom',
    groupName: 'graph',
    step: 0.01,
    max: 1,
    min: 0
  },
  // 内边距 appendPadding
  {
    label: '',
    type: 'appendPadding',
    field: 'appendPadding',
    optionField: 'appendPadding',
    value: [0, 0, 0, 0],
    tabName: 'custom',
    groupName: 'appendPadding'
  }
]

// 配置处理脚本
const optionHandler = ''

// 数据处理脚本,取出所有value
const dataHandler = '// 取出所有指标的值 \ndata = data.map(item => item[setting.filter(i => i.field === "yField")[0].value])'

// 图表配置 new Line('domName', option)
const option = {
  data: [100, 200, 300, 200, 100, 200, 300, 400],
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  xField: '',
  yField: '',
  height: 150,
  autoFit: true,
  smooth: true,
  areaStyle: {
    fill: 'l(0) 0:#6B74E4 1:#6B74E4',
    fillOpacity: 0.15
  },
  line: {
    color: 'l(0) 0:#6B74E4 1:#6B74E4',
    size: 1
  }
}

export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
