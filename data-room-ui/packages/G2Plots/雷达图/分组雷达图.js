
// 配置版本号
const version = '0.0.1'
// 分类
const category = 'Radar'
// 标题
const title = '分组雷达图'
// 类别， new Line()
const chartType = 'Radar'
// 用于标识，唯一，title的中文转拼音
const name = 'FenZuLeiDaTu'

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
  {
    label: '分组',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'seriesField',
    // 对应options中的字段
    optionField: 'seriesField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '底色',
    type: 'colorPicker', // 设置组件类型
    field: 'yAxis_grid_alternateColor', // 字段
    optionField: 'yAxis.grid.alternateColor', // 对应options中的字段
    value: 'rgba(0, 0, 0, 0.04)',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '是否平滑',
    type: 'switch', // 设置组件类型
    field: 'smooth', // 字段
    optionField: 'smooth', // 对应options中的字段
    value: false,
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
  {
    label: '数据点形状',
    type: 'select', // 设置组件类型
    field: 'point_shape', // 字段
    optionField: 'point.shape', // 对应options中的字段
    // 是否多选
    multiple: false,
    value: 'circle',
    tabName: 'custom',
    options: [
      {
        label: '无',
        value: false
      },
      {
        label: '空心圆',
        value: 'hollow-circle'
      },
      {
        label: '圆形',
        value: 'circle'
      },
      {
        label: '正方形',
        value: 'square'
      },
      {
        label: '菱形',
        value: 'diamond'
      },
      {
        label: '三角形',
        value: 'triangle'
      },
      {
        label: '六边形',
        value: 'hexagon'
      },
      {
        label: '菱形交叉',
        value: 'bowtie'
      },
      {
        label: '十字形',
        value: 'cross'
      },
      {
        label: 'I形',
        value: 'tick'
      },
      {
        label: '加号',
        value: 'plus'
      },
      {
        label: '连字号',
        value: 'hyphen'
      }
    ],
    groupName: 'graph'
  },
  {
    label: '数据点颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'point_color', // 字段
    optionField: 'point.color', // 对应options中的字段
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据点大小',
    type: 'inputNumber', // 设置组件类型
    field: 'point_size', // 字段
    optionField: 'point.size', // 对应options中的字段
    value: 2,
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
  { item: 'Design', user: 'a', score: 70 },
  { item: 'Design', user: 'b', score: 30 },
  { item: 'Development', user: 'a', score: 60 },
  { item: 'Development', user: 'b', score: 70 },
  { item: 'Marketing', user: 'a', score: 50 },
  { item: 'Marketing', user: 'b', score: 60 },
  { item: 'Users', user: 'a', score: 40 },
  { item: 'Users', user: 'b', score: 50 },
  { item: 'Test', user: 'a', score: 60 },
  { item: 'Test', user: 'b', score: 70 },
  { item: 'Language', user: 'a', score: 70 },
  { item: 'Language', user: 'b', score: 50 },
  { item: 'Technology', user: 'a', score: 50 },
  { item: 'Technology', user: 'b', score: 40 },
  { item: 'Support', user: 'a', score: 30 },
  { item: 'Support', user: 'b', score: 40 },
  { item: 'Sales', user: 'a', score: 60 },
  { item: 'Sales', user: 'b', score: 40 },
  { item: 'UX', user: 'a', score: 50 },
  { item: 'UX', user: 'b', score: 60 }
]

// 配置处理脚本
const optionHandler = 'option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  xField: 'item',
  yField: 'score',
  seriesField: 'user',
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  smooth: false,
  legend: false,
  legendItemName: {
    style: {
      fill: '#595959',
      fontSize: 12,
      fontWeight: 400
    }
  },
  color: 'l(90) 0:#648ff7 1:#648ff7',
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  meta: {
    score: {
      alias: '分数',
      min: 0,
      max: 80
    }
  },
  xAxis: {
    line: null,
    tickLine: null,
    grid: {
      line: {
        style: {
          lineDash: null
        }
      }
    }
  },
  // 开启辅助点
  point: {
    color: '',
    shape: '',
    size: 2
  },
  yAxis: {
    label: false,
    grid: {
      alternateColor: 'rgba(0, 0, 0, 0.04)'
    }
  },
  area: 1
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
