const title = '边框组件'
// 右侧配置项
const setting = [
  {
    label: '对齐类型',
    // 设置组件类型， select / input / colorPicker
    type: 'select',
    // 字段
    field: 'customize_diagonalType',
    optionField: 'customize.diagonalType', // 对应options中的字段
    // 是否多选
    multiple: false,
    options: [
      {
        label: '左上右下',
        value: 'leftTopRightBottom'
      },
      {
        label: '右上左下',
        value: 'rightTopLeftBottom'
      }
    ],
    // 绑定的值
    value: 'leftTopRightBottom',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '背景颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'customize_backgroundColor',
    optionField: 'customize.backgroundColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#D3D3D32B',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '长度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_borderLength',
    optionField: 'customize.borderLength', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '30',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '粗细',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'customize_borderWidth',
    optionField: 'customize.borderWidth', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '4',
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
    value: '#409EFF',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '边框圆角',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 范围
    min: 0,
    max: 100,
    // 字段
    field: 'customize_borderRadius',
    optionField: 'customize.borderRadius', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 4,
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据

const option = {
  // 自定义组件其他属性
  customize: {
    diagonalType: 'leftTopRightBottom',
    borderLength: 30,
    borderWidth: 4,
    backgroundColor: '#D3D3D32B',
    borderRadius: 0,
    borderColor: '#409EFF'
  }
}

export default {
  title,
  option,
  setting
}
