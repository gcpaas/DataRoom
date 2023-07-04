
// 分类
const category = 'Rose'
// 标题
const title = '玫瑰图'
// 类别， new Line()
const chartType = 'Rose'
// 用于标识，唯一，和文件夹名称一致
const name = 'MeiGuiTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'xField',
    // 对应options中的字段
    optionField: 'xField',
    // 是否多选
    multiple: false,
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
    label: '玫瑰半径',
    // 设置组件类型
    type: 'slider',
    // 字段
    field: 'radius',
    // 对应options中的字段
    optionField: 'radius',
    value: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'label_style_fill',
    // 对应options中的字段
    optionField: 'label.style.fill',
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'label_style_fontSize',
    // 对应options中的字段
    optionField: 'label.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '玫瑰颜色',
    // 设置组件类型
    type: 'colorSelect',
    // 字段
    field: 'color',
    // 对应options中的字段
    optionField: 'color',
    value: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
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
    value: '#595959',
    tabName: 'custom',
    groupName: 'legend'
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

// 模拟数据
const data = [
  { type: '分类一', value: 27 },
  { type: '分类二', value: 25 },
  { type: '分类三', value: 18 },
  { type: '分类四', value: 15 },
  { type: '分类五', value: 10 },
  { type: '其他', value: 5 }
]

// 配置处理脚本
const optionHandler = 'option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  'option.seriesField = option.xField;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Pie('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  xField: 'type',
  yField: 'value',
  seriesField: 'type',
  radius: 1,
  color: ['#5B8FF9', '#61DDAA', '#65789B', '#F6BD16', '#7262fd', '#78d9eb', '#9661bc', '#f6903d', '#2f9e9a', '#f08aac'],
  label: {
    offset: -15,
    style: {
      fill: '#ffffff',
      fontSize: 14,
      textAlign: 'center'
    }
  },
  legendEnable: true,
  legendLayout: 'vertical',
  legendPosition: 'top',
  legend: false,
  legendItemName: {
    style: {
      fill: '#595959',
      fontSize: 12,
      fontWeight: 400
    }
  },
  appendPadding: [16, 16, 16, 16] // 设置图标的边距
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
