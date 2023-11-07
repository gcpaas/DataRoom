
const type = 'GcBorder16'

const name = '边框16'

const isTitle = false

const padding =[0,0,0,0]
// 右侧配置项
const setting = [

  // 背景色
  // {
  //   label:'背景色二',
  //   // 设置组件类型， select / input / colorPicker
  //   type: 'colorPicker',
  //   // 字段
  //   field: 'gradientColor1',
  //   optionField: 'gradientColor1', // 对应options中的字段
  //   // 是否多选
  //   multiple: false,
  //   // 绑定的值
  //   value: '',
  // },
  {
    label:'选择背景图',
    // 设置组件类型， select / input / colorPicker
    type: 'background',
    // 字段
    field: 'imgUrl',
    optionField: 'imgUrl', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
  },
  {
    label: '不透明度',
    // 设置组件类型
    type: 'slider',
    // 字段
    field: 'opacity',
    // 对应options中的字段
    optionField: 'opacity.fillOpacity',
    value: 1,
  },
  {
    label:'点九图背景切割',
    // 设置组件类型， select / input / colorPicker
    type: 'move',
    // 字段
    field: 'borderArray',
    optionField: 'borderArray', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: [10, 10, 10, 10]
  }
]




export default {
  setting,
  type,
  name,
  isTitle,
  padding
}
