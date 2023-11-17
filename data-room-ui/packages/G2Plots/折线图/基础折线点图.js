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
const title = '基础折线点图'
// 类别， new Line()
const chartType = 'Line'
// 用于标识，唯一，和文件夹名称一致
const name = 'JiChuZheXianDianTu'

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
  /** 样式配置 **/
  // 图表 graph
  {
    label: '折线点样式',
    type: 'select',
    field: 'point_shape',
    optionField: 'point.shape',
    // 是否多选
    multiple: false,
    value: 'circle',
    tabName: 'custom',
    options: [
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
    ],
    groupName: 'graph'
  },
  {
    label: '折线点大小',
    type: 'inputNumber',
    field: 'point_size',
    optionField: 'point.size',
    value: 3,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线点颜色',
    type: 'colorPicker',
    field: 'point_style_fill',
    optionField: 'point.style.fill',
    // 是否多选
    multiple: false,
    value: '#6B74E4',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签大小',
    type: 'inputNumber',
    field: 'label_style_fontSize',
    optionField: 'label.style.fontSize',
    value: 0,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签颜色',
    type: 'colorPicker',
    field: 'label_style_fill',
    optionField: 'label.style.fill',
    value: '#e9e9e9',
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
    type: 'gradual',
    field: 'lineStyle_stroke',
    optionField: 'lineStyle.stroke',
    value: 'l(0) 0:#6b74e4 1:#6b74e4',
    tabName: 'custom',
    groupName: 'graph'
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
    value: false,
    active: true,
    inactive: false,
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
  { date: '2016年', value: 100 },
  { date: '2017年', value: 200 },
  { date: '2018年', value: 300 },
  { date: '2019年', value: 200 },
  { date: '2020年', value: 100 },
  { date: '2021年', value: 200 },
  { date: '2022年', value: 300 },
  { date: '2023年', value: 400 }
]
// 配置处理脚本
const optionHandler =
  `
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
  data,
  xField: 'date',
  yField: 'value',
  label: {
    style: {
      fill: '#e9e9e9',
      fontSize: 10
    }
  },
  point: {
    size: 3,
    shape: 'circle',
    style: {
      fill: '6B74E4',
      stroke: '#5B8FF9',
      lineWidth: 2
    }
  },
  tooltip: { showMarkers: false },
  state: {
    active: {
      style: {
        shadowBlur: 4,
        stroke: '#000',
        fill: 'red'
      }
    }
  },
  lineStyle: {
    lineWidth: 2,
    stroke: 'l(0) 0:#6b74e4 1:#6b74e4'
  },
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
      autoHide: false,
      autoEllipsis: true,
      autoHideEnable: true,
      autoHideMinGap: 2,
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
  interactions: [{ type: 'marker-active' }]
}

export default {
  category,
  version,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler,
  optionHandler
}
