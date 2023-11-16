import fontList from 'data-room-ui/js/utils/fontList'
// 配置版本号
const version = '2023111401'
// 分类
const category = 'RingProgress'
// 标题
const title = '进度指标环图'
// 类别， new Gauge()
const chartType = 'RingProgress'
// 用于标识，唯一，和文件夹名称一致
const name = 'JinDuZhiBiaoHuanTu'

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
    value: '#FFFFFF',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '进度条颜色',
    // 设置组件类型
    type: 'gradual',
    // 字段
    field: 'color1',
    // 对应options中的字段
    optionField: 'color1',
    value: 'l(0) 0:#6b74e4 1:#4391f4',
    tabName: 'custom',
    groupName: 'graph'
  },
  // {
  //   label: '标签文本',
  //   // 设置组件类型
  //   type: 'input',
  //   // 字段
  //   field: 'statistic_title_content',
  //   // 对应options中的字段
  //   optionField: 'statistic.title.content',
  //   value: '进度',
  //   tabName: 'custom',
  //   groupName: 'graph'
  // },
  // {
  //   label: '标签字体颜色',
  //   // 设置组件类型
  //   type: 'colorPicker',
  //   // 字段
  //   field: 'statistic_title_style_fill',
  //   // 对应options中的字段
  //   optionField: 'statistic.title.style.fill',
  //   value: 'rgba(133, 133, 133, 1)',
  //   tabName: 'custom',
  //   groupName: 'graph'
  // },
  // {
  //   label: '标签字体大小',
  //   // 设置组件类型
  //   type: 'inputNumber',
  //   // 字段
  //   field: 'statistic_title_style_fontSize',
  //   // 对应options中的字段
  //   optionField: 'statistic.title.style.fontSize',
  //   value: 20,
  //   tabName: 'custom',
  //   groupName: 'graph'
  // },
  // {
  //   label: '标签位置',
  //   // 设置组件类型
  //   type: 'inputNumber',
  //   // 字段
  //   field: 'statistic_title_style_offsetY',
  //   // 对应options中的字段
  //   optionField: 'statistic.title.offsetY',
  //   value: 0,
  //   min: -100,
  //   tabName: 'custom',
  //   groupName: 'graph'
  // },
  {
    label: '指标字体颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_fill',
    // 对应options中的字段
    optionField: 'statistic.content.style.fill',
    value: '#FFFFFF',
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
    value: 40,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标字体类型',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'statistic_content_style_fontFamily',
    // 对应options中的字段
    optionField: 'statistic.content.style.fontFamily',
    // 是否多选
    multiple: false,
    value: 'ds-digitalbold',
    tabName: 'custom',
    options: fontList,
    groupName: 'graph'
  },
  {
    label: '指标位置',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_style_offsetY',
    // 对应options中的字段
    optionField: 'statistic.content.offsetY',
    value: 0,
    min: -100,
    tabName: 'custom',
    groupName: 'graph'
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
const optionHandler = 'option.color = [option.color1, option.color2]'
const data = [
  {
    percent: 0.6
  }
]
// 数据处理脚本
const dataHandler =
  "option.percent = data[0][setting.filter(settingItem=>settingItem.field === 'percent')[0].value]"

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  color1: 'l(0) 0:#6B74E3 1:#38BBE5',
  color2: '#FFFFFF',
  autoFit: true,
  percent: 0.6,
  color: ['l(0) 0:#6B74E3 1:#38BBE5', '#d0d0d0'],
  innerRadius: 0.85,
  radius: 0.98,
  statistic: {
    content: {
      style: { fill: '#FFFFFF', fontSize: 40, fontFamily: 'ds-digitalbold', lineHeight: 2 },
      offsetY: 0
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
