// 分类
const category = 'RingProgress'
// 标题
const title = '进度环图'
// 类别， new Gauge()
const chartType = 'RingProgress'
// 用于标识，唯一，和文件夹名称一致
const name = 'JinDuHuanTu'

// 右侧配置项
const setting = [
  {
    label: '指标',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'percent',
    // 对应options中的字段
    optionField: 'percent',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '进度条背景色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'color2',
    // 对应options中的字段
    optionField: 'color2',
    value: 'rgba(238, 238, 238, 1)',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '进度条颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'color1',
    // 对应options中的字段
    optionField: 'color1',
    value: 'rgba(67, 145, 244, 1)',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签文本',
    // 设置组件类型
    type: 'input',
    // 字段
    field: 'statistic_title_content',
    // 对应options中的字段
    optionField: 'statistic.title.content',
    value: '进度',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签字体颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_title_style_fill',
    // 对应options中的字段
    optionField: 'statistic.title.style.fill',
    value: 'rgba(133, 133, 133, 1)',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签字体大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_style_fontSize',
    // 对应options中的字段
    optionField: 'statistic.title.style.fontSize',
    value: 20,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签位置',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_style_lineHeight',
    // 对应options中的字段
    optionField: 'statistic.title.style.lineHeight',
    value: 2,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标字体颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_fill',
    // 对应options中的字段
    optionField: 'statistic.content.style.fill',
    value: 'rgba(133, 133, 133, 1)',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标字体大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_style_fontSize',
    // 对应options中的字段
    optionField: 'statistic.content.style.fontSize',
    value: 24,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标位置',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_style_lineHeight',
    // 对应options中的字段
    optionField: 'statistic.content.style.lineHeight',
    value: 2,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 边距 padding
  {
    label: '图表边距',
    type: 'padding', // 设置组件类型
    field: 'appendPadding', // 字段
    optionField: 'appendPadding', // 对应options中的字段
    value: [0, 0, 0, 0],
    tabName: 'custom',
    groupName: 'padding'
  }
]

// 配置处理脚本
const optionHandler = 'option.color = [option.color1, option.color2]'
const data = []
// 数据处理脚本
const dataHandler =
  "option.percent = data[0][setting.filter(settingItem=>settingItem.field === 'percent')[0].value]"

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  data,
  appendPadding: [0, 0, 0, 0], // 设置图标的边距
  color1: '#F4664A',
  color2: '#d0d0d0',
  autoFit: true,
  percent: 0.6,
  color: ['#F4664A', '#d0d0d0'],
  innerRadius: 0.85,
  radius: 0.98,
  statistic: {
    title: {
      style: { fill: '#fafafa', fontSize: 28, lineHeight: 2 },
      content: '进度'
    },
    content: {
      style: { fill: '#fafafa', fontSize: 28, lineHeight: 2 }
    }
  }
}
export default {
  category,
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
