const title = '指标卡'
// 右侧配置项
const setting = [
  {
    label: '背景色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_bgColor',
    optionField: 'customize.bgColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
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
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框粗细',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_borderWidth',
    optionField: 'customize.borderWidth', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 0,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框圆角',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_borderRadius',
    optionField: 'customize.borderRadius', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 0,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '图标链接',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_src',
    optionField: 'customize.src', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 'http://60.174.249.206:11080/upload/webDesign/uiSucai/dir/icon/icon_top6.png',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '左右间距',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_distance',
    optionField: 'customize.distance', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 30,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '上下间距',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_lineDistance',
    optionField: 'customize.lineDistance', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 25,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '图标大小',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_imgSize',
    optionField: 'customize.imgSize', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 110,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '首行字段',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'yField', // 字段
    optionField: 'yField', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'data'
  },
  {
    label: '首行文字大小',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_firstSize',
    optionField: 'customize.firstSize', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 50,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '首行字体颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_firstColor',
    optionField: 'customize.firstColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#fff',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '首行字体粗细',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_firstWeight',
    optionField: 'customize.firstWeight', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 500,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '第二行文字内容',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_secondLine',
    optionField: 'customize.secondLine', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '装机处理及时率',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '第二行文字大小',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_secondSize',
    optionField: 'customize.secondSize', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 36,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '第二行字体颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_secondColor',
    optionField: 'customize.secondColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#fff',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '第二行字体粗细',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_secondWeight',
    optionField: 'customize.secondWeight', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 500,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据

const option = {
  // 自定义组件其他属性
  customize: {
    src: 'http://60.174.249.206:11080/upload/webDesign/uiSucai/dir/icon/icon_top6.png',
    borderRadius: 0,
    borderWidth: 0,
    lineDistance: 25,
    borderColor: '',
    bgColor: '',
    distance: 30,
    imgSize: 110,
    firstSize: 50,
    firstColor: '#ffffff',
    firstWeight: 500,
    secondSize: 50,
    secondColor: '#ffffff',
    secondWeight: 500,
    secondLine: '装机处理及时率'
  }
}

export default {
  title,
  option,
  setting
}
