
// 分类
const category = 'Treemap'
// 标题
const title = '基础矩形树图'
// 类别， new Line()
const chartType = 'Treemap'
// 用于标识，唯一，title的中文转拼音
const name = 'JiChuJuXingShuTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'colorField',
    optionField: 'colorField', // 对应options中的字段
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
    field: 'valueField',
    // 对应options中的字段
    optionField: 'valueField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '字体大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'lable_style_fontSize',
    // 对应options中的字段
    optionField: 'label.style.fontSize',
    value: '14',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '字体颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'label_style_color',
    // 对应options中的字段
    optionField: 'label.style.fill',
    value: '#FFFFFF',
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
const data = {
  name: 'root',
  children: [
    { name: '分类 1', value: 560 },
    { name: '分类 2', value: 500 },
    { name: '分类 3', value: 150 },
    { name: '分类 4', value: 140 },
    { name: '分类 5', value: 115 },
    { name: '分类 6', value: 95 },
    { name: '分类 7', value: 90 },
    { name: '分类 8', value: 75 },
    { name: '分类 9', value: 98 },
    { name: '分类 10', value: 60 },
    { name: '分类 11', value: 45 },
    { name: '分类 12', value: 40 },
    { name: '分类 13', value: 40 },
    { name: '分类 14', value: 35 },
    { name: '分类 15', value: 40 },
    { name: '分类 16', value: 40 },
    { name: '分类 17', value: 40 },
    { name: '分类 18', value: 30 },
    { name: '分类 19', value: 28 },
    { name: '分类 20', value: 16 }
  ]
}

// 配置处理脚本
const optionHandler = '\noption.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }'

// 数据处理脚本
const dataHandler = '// 转换数据格式\n' +
  `data = {
  name: 'root',
  children: data?.map(d => ({
    ...d,
    name: d[option.colorField],
    value: d[option.valueField]
  }))
};`

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  color: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  colorField: 'name',
  valueField: 'value',
  legendEnable: false,
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
  label: {
    style: {
      fontSize: '30px'
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
