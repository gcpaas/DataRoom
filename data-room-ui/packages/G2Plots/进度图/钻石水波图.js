
// 配置版本号
const version = '2023071001'
// 分类
const category = 'Liquid'
// 标题
const title = '钻石水波图'
// 类别， new Liquid()
const chartType = 'Liquid'
// 用于标识，唯一，和文件夹名称一致
const name = 'ZuanShiShuiBoTu'

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
    label: '贴图',
    type: 'switchNumber', // 设置组件类型
    field: 'pattern_cfg_fillOpacity', // 字段
    optionField: 'pattern.cfg.fillOpacity', // 对应options中的字段
    value: 0,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '贴图类型',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'pattern_type',
    // 对应options中的字段
    optionField: 'pattern.type',
    // 是否多选
    multiple: false,
    value: 'dot',
    tabName: 'custom',
    options: [
      { label: '圆点', value: 'dot' },
      { label: '矩形', value: 'square' }
    ],
    groupName: 'graph'
  },
  {
    label: '贴图颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'pattern_cfg_fill',
    // 对应options中的字段
    optionField: 'pattern.cfg.fill',
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '字体颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_fill',
    // 对应options中的字段
    optionField: 'statistic.content.style.fill',
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '字体大小',
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
  {
    label: '边框宽度',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'outline_border',
    // 对应options中的字段
    optionField: 'outline.border',
    value: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  // {
  //   label: '边框间距',
  //   // 设置组件类型
  //   type: 'inputNumber',
  //   // 字段
  //   field: 'outline_distance',
  //   // 对应options中的字段
  //   optionField: 'outline.distance',
  //   value: 1,
  //   tabName: 'custom',
  //   groupName: 'graph'
  // },
  {
    label: '边框颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'outline_style_stroke',
    // 对应options中的字段
    optionField: 'outline.style.stroke',
    value: '#6291ef',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '水波颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'color', // 字段
    optionField: 'color', // 对应options中的字段
    value: '#598BF2',
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

// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Liquid('domName', option)
const option = {
  renderer: 'canvas',
  color: '#598BF2',
  percent: 0.25,
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  shape: 'diamond',
  outline: {
    border: 1, // 边框宽度
    distance: 1, // 边框距离
    style: {
      stroke: '#6291ef' // 边框颜色
    }
  },
  liquidStyle: {
    stroke: 'black',
    lineWidth: 0,
    strokeOpacity: 0
  },
  statistic: {
    content: {
      style: {
        fontSize: 20,
        lineHeight: 1,
        fill: '#d0d0d0'
      }
    }
  },
  wave: {
    length: 128
  },
  pattern: {
    type: 'dot',
    cfg: {
      size: 4,
      fillOpacity: 0,
      padding: 4,
      rotation: 0,
      fill: '#FFF',
      isStagger: true
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
  dataHandler
}
