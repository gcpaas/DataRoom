
// 分类
const category = 'Gauge'
// 标题
const title = '进度仪表盘'
// 类别， new Gauge()
const chartType = 'Gauge'
// 用于标识，唯一，和文件夹名称一致
const name = 'JinDuYiBiaoPan'

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
    label: '表盘颜色',
    // 设置组件类型
    type: 'gradual',
    // 字段
    field: 'range_color',
    // 对应options中的字段
    optionField: 'range.color',
    value: 'l(0) 0:#6B74E3 1:#38BBE5',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_title_style_color',
    // 对应options中的字段
    optionField: 'statistic.title.style.color',
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标大小',
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
    label: '指标位置',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_offsetY',
    // 对应options中的字段
    optionField: 'statistic.title.offsetY',
    value: -36,
    min:-100,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签内容',
    // 设置组件类型
    type: 'input',
    // 字段
    field: 'statistic_content_content',
    // 对应options中的字段
    optionField: 'statistic.content.content',
    value: '加载进度',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_color',
    // 对应options中的字段
    optionField: 'statistic.content.style.color',
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_style_fontSize',
    // 对应options中的字段
    optionField: 'statistic.content.style.fontSize',
    value: 20,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 边距 padding
  {
    label: '图表边距',
    type: 'padding', // 设置组件类型
    field: 'appendPadding', // 字段
    optionField: 'appendPadding', // 对应options中的字段
    value: [16, 16, 16, 16],
    tabName: 'custom',
    groupName: 'padding'
  }
]
const data = []
// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  data,
  percent: 0.75,
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  range: {
    color: 'l(0) 0:#6B74E3 1:#38BBE5'
  },
  startAngle: Math.PI,
  endAngle: 2 * Math.PI,
  indicator: null,
  statistic: {
    title: {
      offsetY: -36,
      style: {
        fontSize: 20,
        lineHeight: 2,
        color: '#d0d0d0'
      },
      formatter: ({ percent }) => `${(percent * 100).toFixed(0)}%`
    },
    content: {
      content: '占比',
      style: {
        fontSize: 20,
        lineHeight: 2,
        color: '#d0d0d0'
      }
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
  dataHandler
}
