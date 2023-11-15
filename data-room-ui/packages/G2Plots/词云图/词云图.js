
// 配置版本号
const version = '2023111501'
// 分类
const category = 'WordCloud'
// 标题
const title = '词云图'
// 类别， new Line()
const chartType = 'WordCloud'
// 用于标识，唯一，title的中文转拼音
const name = 'CiYunTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'wordField',
    optionField: 'wordField', // 对应options中的字段
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
    field: 'weightField',
    // 对应options中的字段
    optionField: 'weightField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '字体颜色',
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
    label: '背景图URL',
    // 设置组件类型
    type: 'input',
    // 字段
    field: 'imageMask',
    // 对应options中的字段
    optionField: 'imageMask',
    value: '',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '最小字体',
    type: 'inputNumber',
    field: 'fontSizeMin',
    optionField: 'fontSizeMin',
    value: 18,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '最大字体',
    type: 'inputNumber',
    field: 'fontSizeMax',
    optionField: 'fontSizeMax',
    value: 60,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 图例 legend,
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

const data = [
  { name: '大屏设计器', value: 9900 },
  { name: '折线图', value: 6181 },
  { name: '柱状图', value: 4386 },
  { name: '饼图', value: 4055 },
  { name: '散点图', value: 2467 },
  { name: '雷达图', value: 2244 },
  { name: '树图', value: 1898 },
  { name: '面积图', value: 1484 },
  { name: '地图', value: 1112 },
  { name: '热力图', value: 965 },
  { name: '仪表盘', value: 847 },
  { name: '漏斗图', value: 582 },
  { name: '进度条', value: 555 },
  { name: '环图', value: 550 },
  { name: '玉珏图', value: 462 },
  { name: '词云', value: 366 },
  { name: '3D组件', value: 360 },
  { name: '边框', value: 282 },
  { name: '装饰', value: 273 },
  { name: '自定义组件', value: 1265 },
  { name: '文本', value: 6181 },
  { name: '数字', value: 4386 },
  { name: '超链接', value: 1222 },
  { name: '图片', value: 2438 },
  { name: '视频', value: 1361 },
  { name: '表格', value: 9876 },
  { name: '排名', value: 1112 },
  { name: '轮播', value: 965 },
  { name: '时间', value: 2847 },
  { name: '跑马灯', value: 582 },
  { name: '指标卡', value: 555 }
]

// 配置处理脚本
const optionHandler = 'option.wordStyle.fontSize = [option.fontSizeMin, option.fontSizeMax]\n' +
  'let wordFieldValue = setting.find(settingItem=>settingItem.field === \'wordField\').value\n' +
  'if (wordFieldValue) {\n' +
  '  option.colorField = wordFieldValue\n' +
  '}'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  wordField: 'name',
  weightField: 'value',
  colorField: 'name',
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  wordStyle: {
    fontFamily: 'Verdana',
    fontSize: [10, 60]
  },
  fontSizeMin: 24,
  fontSizeMax: 80,
  imageMask: '',
  // 设置交互类型
  interactions: [{ type: 'element-active' }],
  state: {
    active: {
      // 这里可以设置 active 时的样式
      style: {
        lineWidth: 3
      }
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
