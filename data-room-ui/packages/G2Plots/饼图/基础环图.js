
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
    label: '标签线颜色',
    // 设置组件类型
    type: 'colorPicker',
    // 字段
    field: 'label_labelLine_style_stroke',
    // 对应options中的字段
    optionField: 'label.labelLine.style.stroke',
    value: '#5B8FF9',
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
    value: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
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
    value: '#d0d0d0',
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
    value: '#d0d0d0',
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
    label: '外环半径',
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
    label: '内环半径',
    // 设置组件类型
    type: 'slider',
    // 字段
    field: 'innerRadius',
    // 对应options中的字段
    optionField: 'innerRadius',
    value: 0.6,
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
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Pie('domName', option)
const option = {
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  angleField: 'value',
  colorField: 'type',
  radius: 1,
  innerRadius: 0.6,
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
  color: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
  label: {
    type: 'inner',
    labelLine: {
      style: {
        stroke: '#5B8FF9',
        opacity: 0.6,
        lineWidth: 1
      }
    },
    content: '{value}',
    style: {
      fill: '#ffffff',
      fontSize: 14,
      textAlign: 'center'
    }
  },
  statistic: {
    title: {
      style: {
        whiteSpace: 'pre-wrap',
        lineHeight: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#d0d0d0',
        fontSize: 20
      },
      content: '总计'
    },
    content: {
      style: {
        whiteSpace: 'pre-wrap',
        lineHeight: 2,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: '#d0d0d0',
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
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
