
const type = 'GcBorder13'

const name='边框十三'
// 右侧配置项
const setting = [
  // 背景色
  {
    label:'背景色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'backgroundColor',
    optionField: 'backgroundColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
  }


]




export default {
  setting,
  type,
  name
}
