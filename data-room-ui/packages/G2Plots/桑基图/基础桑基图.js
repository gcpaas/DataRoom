/*
 * @description: 桑基图
 * @Date: 2024-0625
 * @Author: liu.shiyi
 */

// 配置版本号
const version = '2023111501'
// 分类
const category = 'Sankey'
// 标题
const title = '基础桑基图'
// 类别， new Line()
const chartType = 'Sankey'
// 用于标识，唯一，和文件夹名称一致
const name = 'JICHUSANGJITU'

// 右侧配置项
const setting = [
  {
    label: '起始节点',
    type: 'select', // 设置组件类型
    field: 'sourceField', // 字段
    optionField: 'sourceField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '目标节点',
    type: 'select', // 设置组件类型
    field: 'targetField', // 字段
    optionField: 'targetField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  {
    label: '权重',
    type: 'select', // 设置组件类型
    field: 'weightField', // 字段
    optionField: 'weightField', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '背景颜色',
    // 设置组件类型
    type: 'colorSelect',
    // 字段
    field: 'color',
    // 对应options中的字段
    optionField: 'color',
    value: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '节点背景颜色',
    type: 'colorPicker',
    field: 'nodeStyle_fill',
    optionField: 'nodeStyle.fill',
    value: '#E5E6EB10',
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '节点边框颜色',
    type: 'colorPicker',
    field: 'nodeStyle_stroke',
    optionField: 'nodeStyle.stroke',
    value: '#E5E6EB10',
    tabName: 'custom',
    groupName: 'grid'
  }
  // X轴 xAxis
]

// 模拟数据
const data = [
  { source: '首次打开', target: '首页 UV', value: 160 },
  { source: '结果页', target: '首页 UV', value: 40 },
  { source: '验证页', target: '首页 UV', value: 10 },
  { source: '我的', target: '首页 UV', value: 10 },
  { source: '朋友', target: '首页 UV', value: 8 },
  { source: '其他来源', target: '首页 UV', value: 27 },
  { source: '首页 UV', target: '理财', value: 30 },
  { source: '首页 UV', target: '扫一扫', value: 40 },
  { source: '首页 UV', target: '服务', value: 35 },
  { source: '首页 UV', target: '蚂蚁森林', value: 25 },
  { source: '首页 UV', target: '跳失', value: 10 },
  { source: '首页 UV', target: '借呗', value: 30 },
  { source: '首页 UV', target: '花呗', value: 40 },
  { source: '首页 UV', target: '其他流向', value: 45 }
]
// 配置处理脚本
const optionHandler = ''

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  sourceField: 'source',
  targetField: 'target',
  weightField: 'value',
  nodeWidthRatio: 0.008,
  nodePaddingRatio: 0.03,
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  nodeStyle: {
    fill: '#72CC4A', // 设置节点颜色
    stroke: '#72CC4A'
  },
  // edgeStyle: {
  //   fill: '#E6E6E6', // 设置边颜色
  //   stroke: '#E6E6E6',
  //   fillOpacity: 0.6
  // }
}
export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler,
  optionHandler
}
