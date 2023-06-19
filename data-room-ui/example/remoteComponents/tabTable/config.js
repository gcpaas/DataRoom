const title = 'tab表格'
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
    label: '用户名',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_username',
    optionField: 'customize.username', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  },
  {
    label: '手机号',
    // 设置组件类型， select / input / colorPicker
    type: 'input',
    // 字段
    field: 'customize_phone',
    optionField: 'customize.phone', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
    // tab页。 data: 数据， custom: 自定义
    tabName: 'custom'
  }
]

// 模拟数据
const data = []

const option = {
  // 数据
  data: data,
  // 数据的字段相关属性
  xField: '',
  yField: '',
  seriesField: '',
  // 自定义组件其他属性
  customize: {
    username: '张三',
    phone: '123456789'
  }
}

export default {
  title,
  option,
  setting
}
