const title = '卡片组件'
// 右侧配置项
const setting = [
  {
    label: '背景色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_backgroundColor',
    optionField: 'customize.backgroundColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 'rgba(0,0,0,.15)',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框宽度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_border',
    optionField: 'customize.border', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 1,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_borderColor',
    optionField: 'customize.borderColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 'rgba(0,0,0,.15)',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框类型',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'customize_borderStyle',
    optionField: 'customize.borderStyle', // 对应options中的字段
    // 是否多选
    multiple: false,
    options: [
      { label: 'solid', value: 'solid' },
      { label: 'dashed', value: 'dashed' }
    ],
    // 绑定的值
    value: 'solid',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_headerColor',
    optionField: 'customize.headerColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 'white',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题左边距',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_titlePaddingLeft',
    optionField: 'customize.titlePaddingLeft', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 16,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题左线宽度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_titleLineWidth',
    optionField: 'customize.titleLineWidth', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 3,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题线颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_titleLineColor',
    optionField: 'customize.titleLineColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#007aff',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题底边宽度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_titleBottomLineWidth',
    optionField: 'customize.titleBottomLineWidth', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 1,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '标题底边颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_titleBottomLineColor',
    optionField: 'customize.titleBottomLineColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#0f131d',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据

const option = {
  // 自定义组件其他属性
  customize: {
    backgroundColor: 'rgba(0,0,0,.15)',
    border: 1,
    borderColor: 'rgba(0,0,0,.15)',
    borderStyle: 'solid',
    headerColor: 'white',
    titlePaddingLeft: 16,
    titleLineWidth: 3,
    titleLineColor: '#007aff',
    titleBottomLineWidth: 1,
    titleBottomLineColor: '#0f131d'
  }
}

export default {
  title,
  option,
  setting
}
