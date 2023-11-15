
const version = '2023111401'
// 分类
const category = 'RadialBar'
// 标题
const title = '基础玉珏图'
// 类别
const chartType = 'RadialBar'
// 用于标识，唯一，title的中文转拼音
const name = 'JiChuYuJueTu'

// 右侧配置项
const setting = [
  {
    // 在右侧设置中显示的名称
    label: "维度",
    // 设置组件类型， select/input/inputNumber/colorPicker/ColorMultipleSelect/radio/switch
    type: "select",
    // 字段, 用于设置option中的字段, 若option中的字段是对象，使用_连接，比如：point_style_stroke, 若option中的字段是单个单词，直接使用
    field: "xField",
    // 对应options中的字段，若指向option中的对象，使用.连接，比如：point.style.stroke
    optionField: "xField", // 对应options中的字段
    // 是否多选，仅对select有效
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义，自定义的配置将会显示在其他的tab
    tabName:'data',
    // 当type为select 且tabName为custom时，options为下拉框的选项；若tab为data, options数据来源为数据集中的数据
    options: [
      {
        label: '年份',
        value: 'year'
      }
    ]
  },
  {
    label: "指标",
    // 设置组件类型
    type: "select",
    // 字段
    field: "yField",
    // 对应options中的字段
    optionField: "yField",
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义，自定义的配置将会显示在其他的tab
    tabName:'data'
  },
  // 图表配置
  {
    label: '颜色配置',
    // 设置组件类型(这里的colorSelect为封装过的组件)
    type: 'colorSelect',
    // 字段
    field: 'color',
    // 对应options中的字段
    optionField: 'color',
    // 是否多选
    multiple: false,
    value: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '玉珏类型',
    type: 'select',
    field: 'barStyle_lineCap',
    optionField: 'barStyle.lineCap',
    value: 'round',
    options: [ { label: '圆角', value: 'round' }, { label: '直角', value: 'square' } ],
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '最大旋转角度',
    type: 'inputNumber',
    field: 'maxAngle',
    optionField: 'maxAngle',
    value: 270,
    min: 45,
    max: 360,
    step: 15,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '最小宽度',
    type: 'inputNumber',
    field: 'minBarWidth',
    optionField: 'minBarWidth',
    value: 10,
    min: 0,
    step: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '最大宽度',
    type: 'inputNumber',
    field: 'maxBarWidth',
    optionField: 'maxBarWidth',
    value: 100,
    min: 0,
    step: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '背景色',
    type: 'colorPicker',
    field: 'backgroundStyle_fill',
    optionField: 'barBackground.style.fill',
    value: 'rgba(0,0,0,0)',
    tabName: 'custom',
    groupName: 'graph'
  },
  // x轴配置
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'xAxis_labelStyle_fill',
    optionField: 'xAxis.label.style.fill',
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签字体大小',
    type: 'inputNumber',
    field: 'xAxis_labelStyle_fontSize',
    optionField: 'xAxis.label.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签字体粗细',
    type: 'inputNumber',
    field: 'xAxis_labelStyle_fontWeight',
    optionField: 'xAxis.label.style.fontWeight',
    value: 600,
    min: 100,
    step: 100,
    max: 900,
    tabName: 'custom',
    groupName: 'xAxis'

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
  { type: '分类一', value: 27 },
  { type: '分类二', value: 25 },
  { type: '分类三', value: 18 },
  { type: '分类四', value: 15 },
  { type: '分类五', value: 10 },
  { type: '其他', value: 5 }
]

const optionHandler = `
const xFieldValue = setting.find(settingItem=>settingItem.field === 'xField').value
if (xFieldValue) {
  option.seriesField = xFieldValue
}
`

// 数据处理脚本 可以处理data数据和option配置，若要处理，直接赋值即可，比如 data = data[0];  option.style.stroke = 'red'
const dataHandler = ``

// 图表配置 new Line('domName', option), 此处的option就是https://g2plot.antv.antgroup.com/examples 中的对应配置，复制后粘贴即可
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  xField: 'type',
  yField: 'value',
  startAngle:  - Math.PI / 2, // 起始角度
  maxAngle: 270, //最大旋转角度,
  radius: 0.8,
  color: [],
  colorField: 'type',
  innerRadius: 0.2,
  barStyle: {
    lineCap: 'round', // 可选项：round 和 square
  },
  minBarWidth: 10,
  maxBarWidth: 100,
  barBackground: {
    style: {
      fill: 'rgba(0,0,0,0)'
    }
  },
  xAxis: {
    label: {
      style: {
        fill: '#e9e9e9',
        fontSize: 12,
        fontWeight: 600,
      }
    }
  }
  // tooltip: {
  //   formatter: (datum) => {
  //     return { name: 'star数', value: datum.star };
  //   },
  // },
}

export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler
}
