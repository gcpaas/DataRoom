
const type = 'GcBorder13'

const name = '边框13'

const padding =[16,16,16,16]

const isTitle=false
// 右侧配置项
const setting = [
  // 背景色

  {
    label:'边框主颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'borderMainColor',
    optionField: 'borderMainColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#83bff6',
  },
  {
    label:'边框副颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'borderSecondaryColor',
    optionField: 'borderSecondaryColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '#00CED1',
  },
  {
    label:'背景色',
    // 设置组件类型， select / input / colorPicker
    type: 'gradual',
    // 字段
    field: 'gradientColor',
    optionField: 'gradientColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: [],
  },
  {
    label: '渐变色方向',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'gradientDirection',
    // 对应options中的字段
    optionField: 'gradientDirection',
    // 是否多选
    multiple: false,
    value: 'to right',
    options: [
      {
        label: '从左到右',
        value: 'to right'
      },
      {
        label: '从右到左',
        value: 'to left'
      },
      {
        label: '从上到下',
        value: 'to bottom'
      },
      {
        label: '从下到上',
        value: 'to top'
      },
      {
        label: '从左上到右下',
        value: 'to bottom right'
      },
      {
        label: '从右上到左下',
        value: 'to bottom left'
      },
      {
        label: '从左下到右上',
        value: 'to top right'
      },
      {
        label: '从右下到左上',
        value: 'to top left'
      }
    ]
  },


]




export default {
  setting,
  type,
  name,
  isTitle,
  padding
}
