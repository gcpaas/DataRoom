import fontList from 'data-room-ui/js/utils/fontList'
// 配置版本号
const version = '2023111601'
// 分类
const category = 'Liquid'
// 标题
const title = '矩形水波图'
// 类别， new Liquid()
const chartType = 'Liquid'
// 用于标识，唯一，和文件夹名称一致
const name = 'JuXingShuiBoTu'

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
    type: 'switch', // 设置组件类型
    field: 'pattern_cfg_fillOpacity', // 字段
    optionField: 'pattern.cfg.fillOpacity', // 对应options中的字段
    value: 0,
    active: 1,
    inactive: 0,
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
    value: '#FFFFFF',
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
    value: 30,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '字体类型',
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
    label: '边框宽度',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'outline_border',
    // 对应options中的字段
    optionField: 'outline.border',
    value: 2,
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
    value: '#FFFFFF',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '水波颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'color', // 字段
    optionField: 'color', // 对应options中的字段
    value: '#1DAEFF',
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
const data = [
  {
    percent: 0.25
  }
]
// 数据处理脚本
const dataHandler = '// 取返回数据列表的第一项指标值\noption.percent = data[0][setting.filter(settingItem=>settingItem.field === \'percent\')[0].value]'

// 图表配置 new Liquid('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'percent',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  renderer: 'canvas',
  color: '#1DAEFF',
  percent: 0.25,
  shape: 'rect',
  outline: {
    border: 2, // 边框宽度
    distance: 0, // 边框距离
    style: {
      stroke: '#FFFFFF' // 边框颜色
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
        opacity: 1,
        fontSize: 30,
        lineHeight: 1,
        fontFamily: 'ds-digitalbold',
        fill: '#FFFFFF'
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
