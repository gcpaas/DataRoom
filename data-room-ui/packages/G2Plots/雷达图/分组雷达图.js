
// 配置版本号
const version = '2023111501'
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
    active: true,
    inactive: false,
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
  {
    label: '数据标签',
    type: 'switch', // 设置组件类型
    field: 'label_style_opacity', // 字段
    optionField: 'label.style.opacity', // 对应options中的字段
    value: 0,
    active: 1,
    inactive: 0,
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
  // 网格线
  {
    label: '颜色',
    type: 'colorPicker',
    field: 'yAxis_grid_line_style_stroke',
    optionField: 'yAxis.grid.line.style.stroke',
    value: '#E5E6EB10',
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '奇数圈底色',
    type: 'colorPicker', // 设置组件类型
    field: 'yAxis_grid_alternateColor1', // 字段
    optionField: 'yAxis.grid.alternateColor1', // 对应options中的字段
    value: 'rgba(0, 0, 0, 0.04)',
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '偶数圈底色',
    type: 'colorPicker', // 设置组件类型
    field: 'yAxis_grid_alternateColor2', // 字段
    optionField: 'yAxis.grid.alternateColor2', // 对应options中的字段
    value: 'rgba(0, 0, 0, 0.04)',
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '标签大小',
    type: 'inputNumber',
    field: 'xAxis_label_style_fontSize',
    optionField: 'xAxis.label.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'xAxis_label_style_fill',
    optionField: 'xAxis.label.style.fill',
    // 是否多选
    multiple: false,
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'xAxis'
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
  {
    label: 'y轴最小值',
    type: 'inputNumber',
    field: 'yAxis_min',
    optionField: 'yAxis.min',
    value: 0,
    tabName: 'custom',
    groupName: 'yAxis'
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
  { name: '支撑及时性', star: 300, type: '当前得分' },
  { name: '基本能力', star: 450, type: '当前得分' },
  { name: '支撑规范性', star: 200, type: '当前得分' },
  { name: '满意度', star: 420, type: '当前得分' },
  { name: '工作质量', star: 380, type: '当前得分' },
  { name: '支撑及时性', star: 380, type: '平均得分' },
  { name: '基本能力', star: 420, type: '平均得分' },
  { name: '支撑规范性', star: 300, type: '平均得分' },
  { name: '满意度', star: 350, type: '平均得分' },
  { name: '工作质量', star: 400, type: '平均得分' }
]
// 配置处理脚本
const optionHandler = 'option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }' +
  'option.yAxis.grid.alternateColor = [option.yAxis.grid.alternateColor1, option.yAxis.grid.alternateColor2]'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  renderer: 'canvas',
  data,
  xField: 'name',
  yField: 'star',
  seriesField: 'type',
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  smooth: false,
  legend: false,
  legendItemName: {
    style: {
      fill: '#e9e9e9',
      fontSize: 12,
      fontWeight: 400
    }
  },
  color: 'l(90) 0:#648ff7 1:#648ff7',
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
    label: {
      style: {
        fill: '#e9e9e9',
        fontSize: 12
      }
    },
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
    min: 0,
    label: false,
    grid: {
      line: {
        type: 'line',
        style: {
          stroke: '#E5E6EB10',
          lineDash: null
        },
      },
      alternateColor1: 'rgba(0, 0, 0, 0.04)',
      alternateColor2: 'rgba(0, 0, 0, 0.04)',
      alternateColor: ['rgba(0, 0, 0, 0.04)', 'rgba(0, 0, 0, 0.04)']
    }
  },
  area: 1,
  label: {
    autoRotate: false,
    style: {
      fill: '#ffffff',
      opacity: 1,
      fontSize: 12
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
