
// 分类
const category = 'Progress'
// 标题
const title = '进度条'
// 类别， new Gauge()
const chartType = 'Progress'
// 用于标识，唯一，和文件夹名称一致
const name = 'JinDuTiao'

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
    field: 'backColor',
    // 对应options中的字段
    optionField: 'backColor',
    value: '#fff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '进度条颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'frontColor',
    // 对应options中的字段
    optionField: 'frontColor',
    value: '#4a7af4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '不透明度',
    // 设置组件类型
    type: 'slider',
    // 字段
    field: 'progressStyle_fillOpacity',
    // 对应options中的字段
    optionField: 'progressStyle.fillOpacity',
    value: 1,
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
const data = [
  {
    percent: 0.536
  }
]
// 配置处理脚本
const optionHandler = 'option.color = [option.frontColor, option.backColor]'

// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Gauge('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  data,
  appendPadding: [0, 0, 0, 0], // 设置图标的边距
  height: 50,
  width: 400,
  autoFit: true,
  percent: 0.8,
  barWidthRatio: 0.3,
  backColor: '#EEEEEE',
  frontColor: '#4391F4',
  color: ['#4a7af4', '#fff'],
  progressStyle: {
    current: {
      style: {
        fillOpacity: 1,
        lineWidth: 0,
        shadowColor: 'black'
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
  dataHandler,
  optionHandler
}
