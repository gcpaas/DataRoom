
const type = 'GcBorder14'

const name = '边框14'

const padding =[16,16,16,16]

const isTitle=false
// 右侧配置项
const setting = [
  // 背景色

  {
    label:'边框线颜色',
    // 设置组件类型， select / input / colorPicker
    type: 'colorPicker',
    // 字段
    field: 'borderColor',
    optionField: 'borderColor', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: '',
  },
  {
    label:'边框线宽度',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'borderWidth',
    optionField: 'borderWidth', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 2,
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
    value: ['#83bff6','#188df0'],
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
  {
    label:'左上圆角值',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'radiusLeftTop',
    optionField: 'radiusLeftTop', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 2,
  },
  {
    label:'左下圆角值',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'radiusLeftBottom',
    optionField: 'radiusLeftBottom', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 2,
  },
  {
    label:'右上圆角值',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'radiusRightTop',
    optionField: 'radiusRightTop', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 2,
  },
  {
    label:'右下圆角值',
    // 设置组件类型， select / input / colorPicker
    type: 'inputNumber',
    // 字段
    field: 'radiusRightBottom',
    optionField: 'radiusRightBottom', // 对应options中的字段
    // 是否多选
    multiple: false,
    // 绑定的值
    value: 2,
  },





]




export default {
  setting,
  type,
  name,
  isTitle,
  padding
}
