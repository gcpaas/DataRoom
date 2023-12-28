/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

// 配置版本号
const version = '2023111401'
// 分类
const category = 'Bar'
// 标题
const title = '分组条形图'
// 类别， new Line()
const chartType = 'Bar'
// 用于标识，唯一，和文件夹名称一致
const name = 'FenZuTiaoXingTu'

// 右侧配置项
const setting = [
  {
    label: '维度',
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
    label: '指标',
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
  // {
  //   label: '条形样式',
  //   type: 'select', // 设置组件类型
  //   field: 'shape', // 字段
  //   optionField: 'shape', // 对应options中的字段
  //   // 是否多选
  //   multiple: false,
  //   value: 'default',
  //   tabName: 'custom',
  //   options: [
  //     {
  //       label: '实心条形',
  //       value: 'default'
  //     },
  //     // {
  //     //   label: '线性',
  //     //   value: 'line'
  //     // },
  //     {
  //       label: '空心条形',
  //       value: 'hollow-rect'
  //     },
  //     {
  //       label: '钉形',
  //       value: 'tick'
  //     }
  //   ],
  //   groupName: 'graph'
  // },
  {
    label: '圆角设置',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'radiusNum',
    // 对应options中的字段
    optionField: 'radiusNum',
    value: 10,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签',
    type: 'switch', // 设置组件类型
    field: 'label_style_opacity', // 字段
    optionField: 'label.style.opacity', // 对应options中的字段
    value: 0,
    active: 1,
    inactive: 0,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签颜色',
    type: 'colorPicker', // 设置组件类型
    field: 'label_style_fill', // 字段
    optionField: 'label.style.fill', // 对应options中的字段
    value: '#ffffff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '数据标签大小',
    // 设置组件类型
    type: 'inputNumber',
    // 字段
    field: 'label_style_fontSize',
    // 对应options中的字段
    optionField: 'label.style.fontSize',
    value: 10,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '条形颜色',
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
    field: 'xAxis_grid_line_style_lineWidth',
    optionField: 'xAxis.grid.line.style.lineWidth',
    value: 0,
    tabName: 'custom',
    groupName: 'grid'
  },
  {
    label: '颜色',
    type: 'colorPicker',
    field: 'xAxis_grid_line_style_stroke',
    optionField: 'xAxis.grid.line.style.stroke',
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
    value: 0,
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
        value: 'start'
      },
      {
        label: '中',
        value: 'center'
      },
      {
        label: '下',
        value: 'end'
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
  {
    label: 'y刻度线宽度',
    type: 'inputNumber',
    field: 'yAxis_tickLine_style_lineWidth',
    optionField: 'yAxis.tickLine.style.lineWidth',
    value: 1,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: 'y刻度线颜色',
    type: 'colorPicker',
    field: 'yAxis_tickLine_style_stroke',
    optionField: 'yAxis.tickLine.style.stroke',
    // 是否多选
    multiple: false,
    value: '#C9CDD4',
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签过多时旋转',
    type: 'switch',
    field: 'yAxis_label_autoRotate',
    optionField: 'yAxis.label.autoRotate',
    value: true,
    active: true,
    inactive: false,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签过多时隐藏',
    type: 'switch',
    field: 'yAxis_label_autoHide',
    optionField: 'yAxis.label.autoHide',
    value: true,
    tabName: 'custom',
    groupName: 'yAxis'
  },
  {
    label: '标签过长时省略',
    type: 'switch',
    field: 'yAxis_label_autoEllipsis',
    optionField: 'yAxis.label.autoEllipsis',
    value: true,
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
  { date: '2019年', value: 200, type: '已处理' },
  { date: '2020年', value: 100, type: '已处理' },
  { date: '2021年', value: 200, type: '已处理' },
  { date: '2022年', value: 300, type: '已处理' },
  { date: '2023年', value: 400, type: '已处理' },
  { date: '2019年', value: 300, type: '未处理' },
  { date: '2020年', value: 200, type: '未处理' },
  { date: '2021年', value: 100, type: '未处理' },
  { date: '2022年', value: 200, type: '未处理' },
  { date: '2023年', value: 300, type: '未处理' }
]

// 配置处理脚本
const optionHandler = '\noption.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  'if (option.legendEnable) {\n  option.legend.itemName = option.legendItemName\n};' +
  '\nconst radiusNum = setting.find(settingItem=>settingItem.field === \'radiusNum\').value; option.barStyle.radius = [radiusNum,radiusNum,0,0];' +
  'option.yAxis.grid.line.style.lineDash = [4,setting.find(settingItem=>settingItem.field === \'yAxis_grid_line_style_lineDash\').value]'

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
  isGroup: true,
  // shape: ' ',
  xField: 'value',
  yField: 'date',
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  legendItemName: {
    style: {
      fill: '#e9e9e9',
      fontSize: 12,
      fontWeight: 400
    }
  },
  /** 自定义颜色 */
  color: ['#6b74e4', '#4391f4', '#38bbe5', '#69d6fd', '#36c6a0'],
  seriesField: 'type',
  legend: false,
  barStyle: {
    radius: [10, 10, 0, 0]// 设置条形图的圆角
  },
  label: {
    position: 'middle',
    style: {
      fill: '#59F25F',
      opacity: 0,
      fontSize: 12
    }
  },
  radiusNum: 0, // 设置条形图的圆角的中间值
  xAxis: {
    grid: {
      line: {
        style: {
          stroke: '#d0d0d0',
          lineWidth: 0
        }
      }
    },
    title: {
      text: '',
      position: 'end',
      style: {
        fill: '#e9e9e9',
        fontSize: 12
      }
    },
    label: {
      style: {
        fill: '#e9e9e9',
        fontSize: 12
      }
    },
    line: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 0
      }
    },
    tickLine: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 0
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
          lineWidth: 0,
          strokeOpacity: 0.7
        }
      }
    },
    label: {
      autoRotate: false,
      autoHide: true,
      autoEllipsis: true,
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
    },
    tickLine: {
      style: {
        stroke: '#C9CDD4',
        lineWidth: 1
      }
    }
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
