import fontList from 'data-room-ui/js/utils/fontList'
// 配置版本号
const version = '2023111401'
// 分类
const category = 'Pie'
// 标题
const title = '基础环图'
// 类别， new Line()
const chartType = 'Pie'
// 用于标识，唯一，和文件夹名称一致
const name = 'JiChuHuanTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'colorField',
    // 对应options中的字段
    optionField: 'colorField',
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
    field: 'angleField',
    // 对应options中的字段
    optionField: 'angleField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '标签文本来源',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'label_contentList',
    // 对应options中的字段
    optionField: 'label.contentList',
    value: ['{value}'],
    tabName: 'custom',
    multiple: true,
    options: [
      { label: '维度', value: '{name}' },
      { label: '指标', value: '{value}' },
      { label: '百分比', value: '{percentage}' }
    ],
    step: 0.1,
    max: 1,
    groupName: 'graph'
  },
  {
    label: '旋转内部标签',
    type: 'switch', // 设置组件类型
    field: 'labelAutoRotate', // 字段
    optionField: 'label.autoRotate', // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签位置',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'label_type',
    // 对应options中的字段
    optionField: 'label.type',
    value: 'inner',
    tabName: 'custom',
    options: [
      { label: '外部', value: 'outer' },
      { label: '内部', value: 'inner' },
      { label: '蜘蛛布局', value: 'spider' }
    ],
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
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签字体大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'label_style_fontSize',
    // 对应options中的字段
    optionField: 'label.style.fontSize',
    value: 14,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签线颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'label_labelLine_style_stroke',
    // 对应options中的字段
    optionField: 'label.labelLine.style.stroke',
    value: '#C9CDD4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签线宽度',
    type: 'inputNumber',
    field: 'label_labelLine_style_lineWidth',
    optionField: 'label.labelLine.style.lineWidth',
    value: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '标签线透明度',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'label_labelLine_style_opacity',
    // 对应options中的字段
    optionField: 'label.labelLine.style.opacity',
    value: 0.6,
    tabName: 'custom',
    step: 0.1,
    max: 1,
    groupName: 'graph'
  },
  {
    label: '环图颜色',
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
    label: '主标题',
    // 设置组件类型
    type: 'input',
    // 字段
    field: 'statistic_title_content',
    // 对应options中的字段
    optionField: 'statistic.title.content',
    value: '总计',
    tabName: 'custom',
    groupName: 'graph'
  },
  // {
  //   label: '统计正文',
  //   // 设置组件类型
  //   type: 'input',
  //   // 字段
  //   field: 'statistic_content_content',
  //   // 对应options中的字段
  //   optionField: 'statistic.content.content',
  //   value: '100',
  //   tabName: 'custom'
  // },
  {
    label: '主标题颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_title_style_color',
    // 对应options中的字段
    optionField: 'statistic.title.style.color',
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '主标题大小',
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
    label: '副标题颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'statistic_content_style_color',
    // 对应options中的字段
    optionField: 'statistic.content.style.color',
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '副标题大小',
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
    label: '副标题字体类型',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'statistic_content_style_fontFamily',
    // 对应options中的字段
    optionField: 'statistic.content.style.fontFamily',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'custom',
    options: fontList,
    groupName: 'graph'
  },
  {
    label: '标签间距大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_title_offsetY',
    // 对应options中的字段
    optionField: 'statistic.title.offsetY',
    value: 0,
    min: -100,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '指标间距大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'statistic_content_offsetY',
    // 对应options中的字段
    optionField: 'statistic.content.offsetY',
    value: 0,
    min: -100,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '外环半径',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'radius',
    // 对应options中的字段
    optionField: 'radius',
    value: 0.9,
    min: 0,
    max: 1,
    step: 0.01,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '内环半径',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'innerRadius',
    // 对应options中的字段
    optionField: 'innerRadius',
    value: 0.65,
    min: 0,
    max: 1,
    step: 0.01,
    tabName: 'custom',
    groupName: 'graph'
  },
  // 图例 legend
  {
    label: '显示',
    type: 'switch', // 设置组件类型
    field: 'legendEnable', // 字段
    optionField: 'legendEnable', // 对应options中的字段
    value: true,
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
    value: 'right',
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

// 配置处理脚本
const optionHandler = 'option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }' +
  `if (option.label.contentList && option.label.contentList.length > 0) {
  let content = ''
  if (option.label.contentList.length === 1) {
    content = option.label.contentList[0]
  } else {
    // 多行文本，加换行符，但是最后一行不加
    option.label.contentList.forEach((item, index) => {
      if (index === option.label.contentList.length - 1) {
        content += item
      } else {
        content += item + '\\n'
      }
    })
  }
  option.label.content = content
}`

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Pie('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  renderer: 'canvas',
  data,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
  legendEnable: true,
  legendLayout: 'vertical',
  legendPosition: 'right',
  legend: false,
  legendItemName: {
    style: {
      fill: '#e9e9e9',
      fontSize: 12,
      fontWeight: 400
    }
  },
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  label: {
    type: 'inner',
    autoRotate: false,
    labelLine: {
      style: {
        stroke: '#5B8FF9',
        opacity: 0.6,
        lineWidth: 1
      }
    },
    contentList: [],
    content: '{value}',
    style: {
      fill: '#e9e9e9',
      fontSize: 14,
      textAlign: 'center'
    }
  },
  statistic: {
    title: {
      offsetY: 0, // 垂直方向的偏移量
      style: {
        whiteSpace: 'pre-wrap',
        lineHeight: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#e9e9e9',
        fontSize: 20
      },
      content: '总计'
    },
    content: {
      offsetY: 0, // 垂直方向的偏移量
      style: {
        whiteSpace: 'pre-wrap',
        lineHeight: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontFamily: '',
        color: '#ffffff',
        fontSize: 30
      }
      // content: '100'
    }
  },
  // 添加 中心统计文本 交互
  interactions: [{ type: 'element-selected' }, { type: 'element-active' }]
  // interactions: [{ type: 'element-selected' }, { type: 'element-active' }, { type: 'pie-statistic-active' }]
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
