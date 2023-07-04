/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

// 分类
const category = 'Area'
// 标题
const title = '渐变色面积图'
// 类别， new Line()
const chartType = 'Area'
// 用于标识，唯一，和文件夹名称一致
const name = 'JianBianSeMianJiTu'

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
    label: '折线平滑',
    type: 'switch', // 设置组件类型
    field: 'smooth', // 字段
    optionField: 'smooth', // 对应options中的字段
    value: false,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '从0基准线填充',
    type: 'switch', // 设置组件类型
    field: 'startOnZero', // 字段
    optionField: 'startOnZero', // 对应options中的字段
    value: true,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'line_color', // 字段
    optionField: 'line.color', // 对应options中的字段
    value: '#1890ff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '折线宽度',
    type: 'inputNumber', // 设置组件类型
    field: 'line_size', // 字段
    optionField: 'line.size', // 对应options中的字段
    value: 1,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '面积颜色',
    type: 'gradual', // 设置组件类型
    field: 'areaStyle_fill', // 字段
    optionField: 'areaStyle.fill', // 对应options中的字段
    value: 'l(270) 0:#ffffff 1:#1890ff',
    tabName: 'custom',
    groupName: 'graph'
  },

  // 网格线 grid
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
    value: '#d0d0d0',
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
    value: '#8C8C8C',
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
    value: '#8C8C8C',
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
    value: '#d0d0d0',
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
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签过多时旋转',
    type: 'switch',
    field: 'xAxis_label_autoRotate',
    optionField: 'xAxis.label.autoRotate',
    value: false,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签过多时隐藏',
    type: 'switch',
    field: 'xAxis_label_autoHide',
    optionField: 'xAxis.label.autoHide',
    value: true,
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
    value: '#8C8C8C',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '显示标签',
    type: 'switchNumber',
    field: 'yAxis_label_style_opacity',
    optionField: 'yAxis.label.style.opacity',
    value: 1,
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
    label: '标签字体颜色',
    type: 'colorPicker',
    field: 'yAxis_label_style_fill',
    optionField: 'yAxis.label.style.fill',
    // 是否多选
    multiple: false,
    value: '#8C8C8C',
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
    value: '#d0d0d0',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  // 边距 padding
    {
    label: '图表边距',
    type: 'padding',
    field: 'appendPadding',
    optionField: 'appendPadding',
    value: [16, 16, 16, 16],
    tabName: 'custom',
    groupName: 'padding'
  }
]

// 模拟数据
const data = [
  { Date: '2010-01', scales: 1998 },
  { Date: '2010-02', scales: 1850 },
  { Date: '2010-03', scales: 1720 },
  { Date: '2010-04', scales: 1818 },
  { Date: '2010-05', scales: 1920 },
  { Date: '2010-06', scales: 1802 },
  { Date: '2010-07', scales: 1945 },
  { Date: '2010-08', scales: 1856 },
  { Date: '2010-09', scales: 2107 },
  { Date: '2010-10', scales: 2140 },
  { Date: '2010-11', scales: 2311 },
  { Date: '2010-12', scales: 1972 },
  { Date: '2011-01', scales: 1760 },
  { Date: '2011-02', scales: 1824 },
  { Date: '2011-03', scales: 1801 },
  { Date: '2011-04', scales: 2001 },
  { Date: '2011-05', scales: 1640 },
  { Date: '2011-06', scales: 1502 },
  { Date: '2011-07', scales: 1621 },
  { Date: '2011-08', scales: 1480 },
  { Date: '2011-09', scales: 1549 },
  { Date: '2011-10', scales: 1390 },
  { Date: '2011-11', scales: 1325 },
  { Date: '2011-12', scales: 1250 },
  { Date: '2012-01', scales: 1394 },
  { Date: '2012-02', scales: 1406 },
  { Date: '2012-03', scales: 1578 },
  { Date: '2012-04', scales: 1465 },
  { Date: '2012-05', scales: 1689 },
  { Date: '2012-06', scales: 1755 },
  { Date: '2012-07', scales: 1495 },
  { Date: '2012-08', scales: 1508 },
  { Date: '2012-09', scales: 1433 },
  { Date: '2012-10', scales: 1344 },
  { Date: '2012-11', scales: 1201 },
  { Date: '2012-12', scales: 1065 },
  { Date: '2013-01', scales: 1255 },
  { Date: '2013-02', scales: 1429 },
  { Date: '2013-03', scales: 1398 },
  { Date: '2013-04', scales: 1678 },
  { Date: '2013-05', scales: 1524 },
  { Date: '2013-06', scales: 1688 },
  { Date: '2013-07', scales: 1500 },
  { Date: '2013-08', scales: 1670 },
  { Date: '2013-09', scales: 1734 },
  { Date: '2013-10', scales: 1699 },
  { Date: '2013-11', scales: 1508 },
  { Date: '2013-12', scales: 1680 },
  { Date: '2014-01', scales: 1750 },
  { Date: '2014-02', scales: 1602 },
  { Date: '2014-03', scales: 1834 },
  { Date: '2014-04', scales: 1722 },
  { Date: '2014-05', scales: 1430 },
  { Date: '2014-06', scales: 1280 },
  { Date: '2014-07', scales: 1367 },
  { Date: '2014-08', scales: 1155 },
  { Date: '2014-09', scales: 1289 },
  { Date: '2014-10', scales: 1104 },
  { Date: '2014-11', scales: 1246 },
  { Date: '2014-12', scales: 1098 },
  { Date: '2015-01', scales: 1189 },
  { Date: '2015-02', scales: 1276 },
  { Date: '2015-03', scales: 1033 },
  { Date: '2015-04', scales: 956 },
  { Date: '2015-05', scales: 845 },
  { Date: '2015-06', scales: 1089 },
  { Date: '2015-07', scales: 944 },
  { Date: '2015-08', scales: 1043 },
  { Date: '2015-09', scales: 893 },
  { Date: '2015-10', scales: 840 },
  { Date: '2015-11', scales: 934 },
  { Date: '2015-12', scales: 810 },
  { Date: '2016-01', scales: 782 },
  { Date: '2016-02', scales: 1089 },
  { Date: '2016-03', scales: 745 },
  { Date: '2016-04', scales: 680 },
  { Date: '2016-05', scales: 802 },
  { Date: '2016-06', scales: 697 },
  { Date: '2016-07', scales: 583 },
  { Date: '2016-08', scales: 456 },
  { Date: '2016-09', scales: 524 },
  { Date: '2016-10', scales: 398 },
  { Date: '2016-11', scales: 278 },
  { Date: '2016-12', scales: 195 },
  { Date: '2017-01', scales: 145 },
  { Date: '2017-02', scales: 207 }
]

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  xField: 'Date',
  yField: 'scales',
  smooth: false,
  startOnZero: true,
  areaStyle: {
    fill: 'l(270) 0:#ffffff 1:#1890ff'
  },
  line: {
    color: '#1890ff',
    size: 1
  },
  xAxis: {
    title: {
      text: '',
      position: 'end',
      style: {
        fill: '#8C8C8C',
        fontSize: 12
      }
    },
    label: {
      autoRotate: false,
      autoHide: true,
      autoEllipsis: true,
      style: {
        fill: '#8C8C8C',
        fontSize: 12
      }
    },
    line: {
      style: {
        stroke: '#d0d0d0',
        lineWidth: 1
      }
    },
    tickLine: {
      style: {
        stroke: '#d0d0d0',
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
          stroke: '#d0d0d0',
          lineWidth: 1,
          strokeOpacity: 0.7
        }
      }
    },
    label: {
      style: {
        fill: '#8C8C8C',
        fontSize: 12,
        opacity: 1
      }
    },
    line: {
      style: {
        stroke: '#d0d0d0',
        lineWidth: 0
      }
    }
  }
  // point: {
  //   color: ''
  // }
}

export default {
  category,
  title,
  chartType,
  name,
  option,
  setting,
  dataHandler
}
