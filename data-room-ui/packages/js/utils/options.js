export const fontWeightOptions = [
  { label: 'normal', value: 'normal' },
  { label: 'bold', value: 'bold' },
  { label: 'bolder', value: 'bolder' },
  { label: 'lighter', value: 'lighter' },
  { label: '100', value: '100' },
  { label: '200', value: '200' },
  { label: '300', value: '300' },
  { label: '400', value: '400' },
  { label: '500', value: '500' },
  { label: '600', value: '600' },
  { label: '700', value: '700' },
  { label: '800', value: '800' },
  { label: '900', value: '900' }
]
export const fonFamilyList = [
  { label: '默认', value: '' },
  { label: '黑体', value: '黑体' },
  { label: '宋体', value: '宋体' }
]
export const lineTypeOptions = [
  { label: '折线', value: 'line' },
  { label: '曲线', value: 'smooth' },
  { label: '阶梯', value: 'ladder' }
]
export const lineStyleOptions = [
  { label: '实线', value: 0 },
  { label: '虚线', value: 5 }
  // { label: '点线', value: 10 }
]
export const animationOptions = [
  { label: '缩放入场', value: 'zoom-in' },
  { label: '缩放出场', value: 'zoom-out' },
  { label: '波浪入场', value: 'wave-in' },
  { label: '沿着xy方向放大', value: 'grow-in-xy' },
  { label: '渐显入场', value: 'fade-in' },
  { label: '渐隐出场', value: 'fade-out' }
]
export const pointShapeOptions = [
  {
    label: '无',
    value: false
  },
  {
    label: '空心圆',
    value: 'hollow-circle'
  },
  {
    label: '圆形',
    value: 'circle'
  },
  {
    label: '正方形',
    value: 'square'
  },
  {
    label: '菱形',
    value: 'diamond'
  },
  {
    label: '三角形',
    value: 'triangle'
  },
  {
    label: '六边形',
    value: 'hexagon'
  },
  {
    label: '菱形交叉',
    value: 'bowtie'
  },
  {
    label: '十字形',
    value: 'cross'
  },
  {
    label: 'I形',
    value: 'tick'
  },
  {
    label: '加号',
    value: 'plus'
  },
  {
    label: '连字号',
    value: 'hyphen'
  }
]
export const markrList = [
  { value: 'circle', label: '圆' },
  { value: 'square', label: '矩形' },
  { value: 'line', label: '线' },
  { value: 'diamond', label: '菱形' },
  { value: 'triangle', label: '三角形' },
  { value: 'triangle-down', label: '倒三角' },
  { value: 'hexagon', label: '六边形' },
  { value: 'bowtie', label: '蝴蝶' },
  { value: 'cross', label: '十字' },
  { value: 'tick', label: '钉子' },
  { value: 'plus', label: '加号' },
  { value: 'hyphen', label: '连字符' }
]
// 滑轨样式
export const railList = [
  { value: 'color', label: 'color' },
  { value: 'size', label: 'size' }
]
export const positionOptions = [
  { value: 'top', label: '顶部' },
  { value: 'middle', label: '中间' },
  { value: 'bottom', label: '底部' }
]
export const pieTypeOptions = [
  { value: 'inner', label: '内部' },
  { value: 'outer', label: '外间' },
  { value: 'spider', label: '蜘蛛布局' }
]
export const roseLabelPositionOptions = [
  { value: -15, label: '内部' },
  { value: 15, label: '外部' }
]

// export const pieLabelResourceOptions = [
//   { value: ({ percent }) => `${(percent * 100).toFixed(0)}%`, label: '百分比' },
//   { value: ({ value }) => `${value}`, label: '指标' },
//   { value: ({ type }) => `${type}`, label: '维度' },
//   { value: ({ type, value, percent }) => `${type}: ${value} (${(percent * 100).toFixed(0)}%)`, label: '维度+指标+百分比' }
// ]
// export const labelFunctions = {
//   percentage: ({ percent }) => `${(percent * 100).toFixed(2)}%`, // 保留两位小数
//   value: ({ value }) => `${value}`,
//   type: ({ type }) => `${type}`,
//   all: ({ type, value, percent }) => `${type}: ${value} (${(percent * 100).toFixed(2)}%)`
// }
//
// // 定义选项列表
// export const pieLabelResourceOptions = [
//   { value: 'percentage', label: '百分比' },
//   { value: 'value', label: '指标' },
//   { value: 'type', label: '维度' },
//   { value: 'all', label: '维度+指标+百分比' }
// ]
// 饼状图文本标签来源的选项列表
export const pieLabelResourceOptions = [
  { value: '{percentage}', label: '百分比' },
  { value: '{value}', label: '指标' },
  { value: '{name}', label: '维度' },
  { value: '{name}\n{value}\n{percentage}', label: '维度+指标+百分比' }
]
// 玉珏图的圆角和直角
export const lineCapOptions = [
  { value: 'round', label: '圆角' },
  { value: '', label: '直角' }
]
// 玉珏图的图表类型
export const YuJueGraphOptions = [
  { value: 'line', label: '线形' },
  { value: '', label: '柱形' }
]
export const regressionLineOptions = [
  { label: '线性回归', value: 'linear' },
  { label: '指数回归', value: 'exp' },
  { label: '局部加权散点图平滑（LOWESS）', value: 'loess' },
  { label: '对数回归', value: 'log' },
  { label: '多项式回归', value: 'poly' },
  { label: '幂回归', value: 'pow' },
  { label: '二次回归', value: 'quad' }
]
export const fontStyleList = [
  { value: 'normal', label: 'normal' },
  { value: 'italic', label: 'italic' },
  { value: 'oblique', label: 'oblique' }
]
export const textAlignList = [
  { value: 'center', label: '居中对齐' },
  { value: 'left', label: '左对齐' },
  { value: 'right', label: '右对齐' }
]
export const borderStyleList = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
  { label: '双实线', value: 'double' },
  { label: '雕刻效果', value: 'groove' },
  { label: '浮雕效果', value: 'ridge' },
  { label: '陷入效果', value: 'inset' },
  { label: '突出效果', value: 'outset' }
]
export const axisXTitlePositionOptions = [
  { value: 'start', label: '靠左' },
  { value: 'center', label: '居中' },
  { value: 'end', label: '靠右' }
]
export const axisYTitlePositionOptions = [
  { value: 'end', label: '顶部' },
  { value: 'center', label: '中部' },
  { value: 'start', label: '底部' }
]
export const legendPositionList = [
  { label: '顶部靠左', value: 'top-left' },
  { label: '顶部居中', value: 'top' },
  { label: '顶部靠右', value: 'top-right' },
  { label: '底部靠左', value: 'bottom-left' },
  { label: '底部居中', value: 'bottom' },
  { label: '底部靠右', value: 'bottom-right' },
  { label: '左侧顶部', value: 'left-top' },
  { label: '左侧居中', value: 'left' },
  { label: '左侧底部', value: 'left-bottom' },
  { label: '右侧顶部', value: 'right-top' },
  { label: '右侧居中', value: 'right' },
  { label: '右侧底部', value: 'right-bottom' }
]
export const imgSizeList = [
  { label: 'contain', value: 'contain' },
  { label: 'cover', value: 'cover' },
  { label: 'auto', value: 'auto' }
]
