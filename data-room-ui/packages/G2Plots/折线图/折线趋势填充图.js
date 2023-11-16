/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

// 配置版本号
const version = '2023111501'
// 分类
const category = 'Line'
// 标题
const title = '折线趋势填充图'
// 类别， new Line()
const chartType = 'Line'
// 用于标识，唯一，title的中文转拼音
const name = 'ZheXianQuShiTianChongTu'

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
    label: '分组',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'seriesField',
    // 对应options中的字段
    optionField: 'seriesField',
    // 是否多选
    multiple: false,
    value: '',
    tabName: 'data'
  },
  /** 样式配置 **/
  // 图表 graph
  {
    label: '是否平滑',
    type: 'switch',
    field: 'smooth',
    optionField: 'smooth',
    value: true,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线宽度',
    type: 'inputNumber',
    field: 'lineStyle_lineWidth',
    optionField: 'lineStyle.lineWidth',
    value: 2,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线颜色',
    // 设置组件类型
    type: 'colorSelect',
    // 字段
    field: 'color',
    // 对应options中的字段
    optionField: 'color',
    value: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '透明度',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'area_style_fillOpacity',
    // 对应options中的字段
    optionField: 'area.style.fillOpacity',
    value: 0.15,
    tabName: 'custom',
    groupName: 'graph',
    step: 0.01,
    max: 1,
    min: 0
  },
  {
    label: '动画效果',
    // 设置组件类型
    type: 'select',
    // 字段
    field: 'animation_appear_animation',
    // 对应options中的字段
    optionField: 'animation.appear.animation',
    // 是否多选
    multiple: false,
    value: 'wave-in',
    tabName: 'custom',
    options: [
      { label: '渐现动画', value: 'fade-in' },
      { label: '渐隐动画', value: 'fade-out' },
      { label: '容器沿着 x,y 方向放大的矩阵动画', value: 'grow-in-xy' },
      { label: '划入入场动画效果', value: 'wave-in' },
      { label: '沿着图形中心点的放大动画', value: 'zoom-in' },
      { label: '沿着图形中心点的缩小动画', value: 'zoom-out' },
      { label: 'path 路径入场动画', value: 'path-in' }
    ],
    groupName: 'graph'
  },
  {
    label: '动画时长（ms)',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'animation_appear_duration',
    // 对应options中的字段
    optionField: 'animation.appear.duration',
    value: 2000,
    max:10000,
    tabName: 'custom',
    groupName: 'graph',
    step: 1
  },
  // 网格线 grid
  {
    label: '虚线',
    type: 'switch',
    field: 'yAxis_grid_line_style_lineDash',
    optionField: 'yAxis.grid.line.style.lineDash',
    value: 0,
    active: 5,
    inactive: 0,
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '宽度',
    type: 'inputNumber',
    field: 'yAxis_grid_line_style_lineWidth',
    optionField: 'yAxis.grid.line.style.lineWidth',
    value: 1,
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '颜色',
    type: 'colorPicker',
    field: 'yAxis_grid_line_style_stroke',
    optionField: 'yAxis.grid.line.style.stroke',
    value: '#E5E6EB10',
    tabName: 'custom',
    groupName: 'grid'
  },
  // 图例 legend
  {
    label: '显示',
    type: 'switch', // 设置组件类型
    field: 'legendEnable', // 字段
    optionField: 'legendEnable', // 对应options中的字段
    value: false,
    active: true,
    inactive: false,
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
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'legend'
  },
  // X轴 xAxis
  {
    label: '标题',
    type: 'input',
    field: 'xAxis_title_text',
    optionField: 'xAxis.title.text',
    value: '',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题位置',
    type: 'select',
    field: 'xAxis_title_position',
    optionField: 'xAxis.title.position',
    value: 'end',
    tabName: 'custom',
    options: [
      {
        label: '左',
        value: 'start'
      },
      {
        label: '中',
        value: 'center'
      },
      {
        label: '右',
        value: 'end'
      }],
    groupName: 'xAxis'
  },
  {
    label: '标题字体大小',
    type: 'inputNumber',
    field: 'xAxis_title_style_fontSize',
    optionField: 'xAxis.title.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标题颜色',
    type: 'colorPicker',
    field: 'xAxis_title_style_fill',
    optionField: 'xAxis.title.style.fill',
    // 是否多选
    multiple: false,
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签大小',
    type: 'inputNumber',
    field: 'xAxis_label_style_fontSize',
    optionField: 'xAxis.label.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'xAxis_label_style_fill',
    optionField: 'xAxis.label.style.fill',
    // 是否多选
    multiple: false,
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '轴线宽度',
    type: 'inputNumber',
    field: 'xAxis_line_style_lineWidth',
    optionField: 'xAxis.line.style.lineWidth',
    value: 1,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '轴线颜色',
    type: 'colorPicker',
    field: 'xAxis_line_style_stroke',
    optionField: 'xAxis.line.style.stroke',
    // 是否多选
    multiple: false,
    value: '#C9CDD4',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '刻度线宽度',
    type: 'inputNumber',
    field: 'xAxis_tickLine_style_lineWidth',
    optionField: 'xAxis.tickLine.style.lineWidth',
    value: 1,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '刻度线颜色',
    type: 'colorPicker',
    field: 'xAxis_tickLine_style_stroke',
    optionField: 'xAxis.tickLine.style.stroke',
    // 是否多选
    multiple: false,
    value: '#C9CDD4',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签过多时隐藏',
    type: 'switch',
    field: 'xAxis_label_autoHide',
    optionField: 'xAxis.label.autoHideEnable',
    value: true,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签隐藏判定间隔',
    type: 'inputNumber',
    field: 'xAxis_label_autoHide_minGap',
    optionField: 'xAxis.label.autoHideMinGap',
    value: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签过多时旋转',
    type: 'switch',
    field: 'xAxis_label_autoRotate',
    optionField: 'xAxis.label.autoRotate',
    value: true,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签过长时省略',
    type: 'switch',
    field: 'xAxis_label_autoEllipsis',
    optionField: 'xAxis.label.autoEllipsis',
    value: true,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  // Y轴 yAxis
  {
    label: '标题',
    type: 'input',
    field: 'yAxis_title_text',
    optionField: 'yAxis.title.text',
    value: '',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题过长时旋转',
    type: 'switch',
    field: 'yAxis_title_autoRotate',
    optionField: 'yAxis.title.autoRotate',
    value: true,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题位置',
    type: 'select',
    field: 'yAxis_title_position',
    optionField: 'yAxis.title.position',
    value: 'end',
    tabName: 'custom',
    options: [
      {
        label: '上',
        value: 'end'
      },
      {
        label: '中',
        value: 'center'
      },
      {
        label: '下',
        value: 'start'
      }],
    groupName: 'yAxis'
  },
  {
    label: '标题字体大小',
    type: 'inputNumber',
    field: 'yAxis_title_style_fontSize',
    optionField: 'yAxis.title.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标题颜色',
    type: 'colorPicker',
    field: 'yAxis_title_style_fill',
    optionField: 'yAxis.title.style.fill',
    // 是否多选
    multiple: false,
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '显示标签',
    type: 'switch',
    field: 'yAxis_label_style_opacity',
    optionField: 'yAxis.label.style.opacity',
    value: 1,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签字体大小',
    type: 'inputNumber',
    field: 'yAxis_label_style_fontSize',
    optionField: 'yAxis.label.style.fontSize',
    value: 12,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'yAxis_label_style_fill',
    optionField: 'yAxis.label.style.fill',
    // 是否多选
    multiple: false,
    value: '#e9e9e9',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '轴线宽度',
    type: 'inputNumber',
    field: 'yAxis_line_lineWidth',
    optionField: 'yAxis.line.style.lineWidth',
    value: 0,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '轴线颜色',
    type: 'colorPicker',
    field: 'yAxis_line_stroke',
    optionField: 'yAxis.line.style.stroke',
    // 是否多选
    multiple: false,
    value: '#C9CDD4',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  // 内边距 appendPadding
  {
    label: '',
    type: 'appendPadding',
    field: 'appendPadding',
    optionField: 'appendPadding',
    value: [0, 0, 0, 0],
    tabName: 'custom',
    groupName: 'appendPadding'
  }
]

// 模拟数据
const data = [
  { date: '2016年', value: 100, type: '已处理' },
  { date: '2017年', value: 200, type: '已处理' },
  { date: '2018年', value: 300, type: '已处理' },
  { date: '2019年', value: 200, type: '已处理' },
  { date: '2020年', value: 100, type: '已处理' },
  { date: '2021年', value: 200, type: '已处理' },
  { date: '2022年', value: 300, type: '已处理' },
  { date: '2023年', value: 400, type: '已处理' },
  { date: '2016年', value: 400, type: '未处理' },
  { date: '2017年', value: 100, type: '未处理' },
  { date: '2018年', value: 200, type: '未处理' },
  { date: '2019年', value: 300, type: '未处理' },
  { date: '2020年', value: 200, type: '未处理' },
  { date: '2021年', value: 100, type: '未处理' },
  { date: '2022年', value: 200, type: '未处理' },
  { date: '2023年', value: 300, type: '未处理' }
]

// 配置处理脚本
const optionHandler =
  `
option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === 'legendPosition').value} : false;
if (option.legendEnable) {
  option.legend.itemName = option.legendItemName
};
option.yAxis.grid.line.style.lineDash = [4,setting.find(settingItem=>settingItem.field === 'yAxis_grid_line_style_lineDash').value]
let autoHide = setting.find(settingItem=>settingItem.field === 'xAxis_label_autoHide').value
if(autoHide){
  let minGap = option.xAxis.label.autoHideMinGap
  option.xAxis.label.autoHide = {
    type: 'equidistance',
    cfg: { minGap: minGap }
  }
} else {
  option.xAxis.label.autoHide = false
}
  `

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  renderer: 'canvas',
  data,
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  xField: 'date',
  yField: 'value',
  seriesField: 'type',
  xAxis: {
    title: {
      text: '',
      position: 'end',
      style: {
        fill: '#e9e9e9',
        fontSize: 12
      }
    },
    label: {
      autoRotate: false,
      autoHide: true,
      autoEllipsis: true,
      autoHideEnable: true,
      autoHideMinGap: 0,
      style: {
        fill: '#e9e9e9',
        fontSize: 12
      }
    },
    line: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 1
      }
    },
    tickLine: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 1
      }
    }
  },
  yAxis: {
    title: {
      text: '',
      position: 'end',
      autoRotate: false,
      // rotation: Math.PI / 2,
      style: {
        fill: '#8C8C8C',
        fontSize: 12
      }
    },
    grid: {
      line: {
        style: {
          stroke: '#E5E6EB10',
          lineWidth: 1,
          lineDash: [4, 5],
          strokeOpacity: 0.7
        }
      }
    },
    label: {
      formatter: (v) => {
        if (v < 1e3) return v
        // 数值格式化为千分位
        if (v >= 1e3 && v < 1e6) return `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
        if (v >= 1e6 && v < 1e9) return `${(v / 1e6).toFixed(1)} M`
        if (v >= 1e9 && v < 1e12) return `${(v / 1e9).toFixed(1)} B`
        return `${(v / 10e8).toFixed(1)} B`
      },
      style: {
        fill: '#e9e9e9',
        fontSize: 12,
        opacity: 1
      }
    },
    line: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 0
      }
    }
  },
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  legend: false,
  legendItemName: {
    style: {
      fill: '#e9e9e9',
      fontSize: 12,
      fontWeight: 400
    }
  },
  smooth: true,
  // 配置折线趋势填充
  area: {
    style: {
      fillOpacity: 0.15
    }
  },
  animation: {
    appear: {
      animation: 'wave-in',
      duration: 2000
    }
  },
  lineStyle: {
    lineWidth: 2
  }
}

export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
