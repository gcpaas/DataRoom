import { Funnel } from '@antv/g2plot'

// 配置版本号
const version = '2023111401'
// 分类
const category = 'Funnel'
// 标题
const title = '基础漏斗图'
// 类别， new Line()
const chartType = 'Funnel'
// 用于标识，唯一，title的中文转拼音
const name = 'JiChuLouDouTu'

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
  // {
  //   label: '漏斗形状',
  //   type: 'select', // 设置组件类型
  //   field: 'shape', // 字段
  //   optionField: 'shape', // 对应options中的字段
  //   value: 'funnel',
  //   tabName: 'custom',
  //   options: [
  //     {
  //       label: '默认',
  //       value: 'funnel'
  //     },
  //     {
  //       label: '金字塔',
  //       value: 'pyramid'
  //     }
  //   ]
  // },
  {
    label: '是否映射为动态高度',
    type: 'switch', // 设置组件类型
    field: 'dynamicHeight', // 字段
    optionField: 'dynamicHeight', // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '方向',
    type: 'select', // 设置组件类型
    field: 'isTransposed', // 字段
    optionField: 'isTransposed', // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: 'custom',
    options: [
      {
        label: '竖向',
        value: false
      },
      {
        label: '横向',
        value: true
      }
    ],
    groupName: 'graph'
  },
  {
    label: '标签文本',
    type: 'input', // 设置组件类型
    field: 'conversionTagName', // 字段
    optionField: 'conversionTagName', // 对应options中的字段
    value: '转化率',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'conversionTag_style_fill',
    // 对应options中的字段
    optionField: 'conversionTag.style.fill',
    // 绑定的值
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'conversionTag_style_fontSize',
    // 对应options中的字段
    optionField: 'conversionTag.style.fontSize',
    value: 10,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '颜色',
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
    label: '数据标签颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'label_style_fill', // 字段
    optionField: 'label.style.fill', // 对应options中的字段
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'label_style_fontSize',
    // 对应options中的字段
    optionField: 'label.style.fontSize',
    value: 10,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 图例 legend
  {
    label: '显示',
    type: 'switch', // 设置组件类型
    field: 'legendEnable', // 字段
    optionField: 'legendEnable', // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'legend'
  },
  {
    label: '位置',
    type: 'select', // 设置组件类型
    field: 'legendPosition', // 字段
    optionField: 'legendPosition', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: 'top',
    tabName: 'custom',
    options: [
      { label: '顶部', value: 'top' },
      { label: '左上角', value: 'top-left' },
      { label: '右上角', value: 'top-right' },
      { label: '左侧', value: 'left' },
      // { label: '左上方', value: 'left-top' },
      // { label: '左下方', value: 'left-bottom' },
      { label: '右侧', value: 'right' },
      // { label: '右上方', value: 'right-top' },
      // { label: '右下方', value: 'right-bottom' },
      { label: '底部', value: 'bottom' },
      { label: '左下角', value: 'bottom-left' },
      { label: '右下角', value: 'bottom-right' }
    ],
    groupName: 'legend'
  },
  {
    label: '字体大小',
    type: 'inputNumber',
    field: 'legendItemName_style_fontSize',
    optionField: 'legendItemName.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'legend'
  },
  {
    label: '字体权重',
    type: 'inputNumber',
    step: 100,
    max: 900,
    field: 'legendItemName_style_fontWeight',
    optionField: 'legendItemName.style.fontWeight',
    value: 400,
    tabName: 'custom',
    groupName: 'legend'
  },
  {
    label: '字体颜色',
    type: 'colorPicker',
    field: 'legendItemName_style_fill',
    optionField: 'legendItemName.style.fill',
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'legend'
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

// 模拟数据
const data = [
  { stage: '简历筛选', number: 253 },
  { stage: '初试人数', number: 151 },
  { stage: '复试人数', number: 113 },
  { stage: '录取人数', number: 87 },
  { stage: '入职人数', number: 59 }
]

// 配置处理脚本
const optionHandler = `option.legend = option.legendEnable ? {position: option.legendPosition}: false;
window.conversionTagName = option.conversionTagName
option.conversionTag.formatter = (datum) => {
  const percentage = parseFloat(datum.$$percentage$$)
  return window.conversionTagName +  (percentage * 100).toFixed(2) + '%'
}
if (option.legendEnable) {
   option.legend.itemName = option.legendItemName
}
`
// 数据处理脚本
const dataHandler = 'data = data.sort((a, b) => b[option.yField] - a[option.yField])'
// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  renderer: 'canvas',
  data,
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  xField: 'stage',
  yField: 'number',
  dynamicHeight: false,
  isTransposed: false,
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  legend: false,
  legendItemName: {
    style: {
      fill: '#e9e9e9',
      fontSize: 12,
      fontWeight: 400
    }
  },
  conversionTagName: '转化率',
  shape: 'funnel', // 漏斗的底部形状
  label: { // 图表内的数据标签
    // 配置样式
    style: {
      fill: '#FFFFFF',
      opacity: 1,
      fontSize: 10
    }
  },
  conversionTag: {
    offsetX: 10,
    offsetY: 0,
    style: {
      fill: '#e9e9e9',
      fontSize: 12
    },
    formatter: (datum) => {
      const percentage = parseFloat(datum.$$percentage$$)
      return '转化率' + (percentage * 100).toFixed(2) + '%'
    }
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
