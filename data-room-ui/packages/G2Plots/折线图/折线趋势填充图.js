/*
 * @description: 配置，参考https://g2plot.antv.antgroup.com/examples
 * @Date: 2023-03-27 14:38:23
 * @Author: xing.heng
 */

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
    value: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
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
    value: 5000,
    max:10000,
    tabName: 'custom',
    groupName: 'graph',
    step: 1
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
  {
    label: '显示',
    type: 'switch', // 设置组件类型
    field: 'legendEnable', // 字段
    optionField: 'legendEnable', // 对应options中的字段
    value: false,
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
    value: '#595959',
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
  { name: 'China', year: '2000', gdp: 1211346869605.24 },
  { name: 'China', year: '2001', gdp: 1339395718865.3 },
  { name: 'China', year: '2002', gdp: 1470550015081.55 },
  { name: 'China', year: '2003', gdp: 1660287965662.68 },
  { name: 'China', year: '2004', gdp: 1955347004963.27 },
  { name: 'China', year: '2005', gdp: 2285965892360.54 },
  { name: 'China', year: '2006', gdp: 2752131773355.16 },
  { name: 'China', year: '2007', gdp: 3550342425238.25 },
  { name: 'China', year: '2008', gdp: 4594306848763.08 },
  { name: 'China', year: '2009', gdp: 5101702432883.45 },
  { name: 'China', year: '2010', gdp: 6087164527421.24 },
  { name: 'China', year: '2011', gdp: 7551500425597.77 },
  { name: 'China', year: '2012', gdp: 8532230724141.76 },
  { name: 'China', year: '2013', gdp: 9570405758739.79 },
  { name: 'China', year: '2014', gdp: 10438529153237.6 },
  { name: 'China', year: '2015', gdp: 11015542352468.9 },
  { name: 'China', year: '2016', gdp: 11137945669350.6 },
  { name: 'China', year: '2017', gdp: 12143491448186.1 },
  { name: 'China', year: '2018', gdp: 13608151864637.9 },
  { name: 'United States', year: '2000', gdp: 10252345464000 },
  { name: 'United States', year: '2001', gdp: 10581821399000 },
  { name: 'United States', year: '2002', gdp: 10936419054000 },
  { name: 'United States', year: '2003', gdp: 11458243878000 },
  { name: 'United States', year: '2004', gdp: 12213729147000 },
  { name: 'United States', year: '2005', gdp: 13036640229000 },
  { name: 'United States', year: '2006', gdp: 13814611414000 },
  { name: 'United States', year: '2007', gdp: 14451858650000 },
  { name: 'United States', year: '2008', gdp: 14712844084000 },
  { name: 'United States', year: '2009', gdp: 14448933025000 },
  { name: 'United States', year: '2010', gdp: 14992052727000 },
  { name: 'United States', year: '2011', gdp: 15542581104000 },
  { name: 'United States', year: '2012', gdp: 16197007349000 },
  { name: 'United States', year: '2013', gdp: 16784849190000 },
  { name: 'United States', year: '2014', gdp: 17521746534000 },
  { name: 'United States', year: '2015', gdp: 18219297584000 },
  { name: 'United States', year: '2016', gdp: 18707188235000 },
  { name: 'United States', year: '2017', gdp: 19485393853000 },
  { name: 'United States', year: '2018', gdp: 20544343456936.5 },
  { name: 'United Kingdom', year: '2000', gdp: 1657816613708.58 },
  { name: 'United Kingdom', year: '2001', gdp: 1640246149417.01 },
  { name: 'United Kingdom', year: '2002', gdp: 1784473920863.31 },
  { name: 'United Kingdom', year: '2003', gdp: 2053018775510.2 },
  { name: 'United Kingdom', year: '2004', gdp: 2416931526913.22 },
  { name: 'United Kingdom', year: '2005', gdp: 2538680000000 },
  { name: 'United Kingdom', year: '2006', gdp: 2713749770009.2 },
  { name: 'United Kingdom', year: '2007', gdp: 3100882352941.18 },
  { name: 'United Kingdom', year: '2008', gdp: 2922667279411.76 },
  { name: 'United Kingdom', year: '2009', gdp: 2410909799034.12 },
  { name: 'United Kingdom', year: '2010', gdp: 2475244321361.11 },
  { name: 'United Kingdom', year: '2011', gdp: 2659310054646.23 },
  { name: 'United Kingdom', year: '2012', gdp: 2704887678386.72 },
  { name: 'United Kingdom', year: '2013', gdp: 2786022872706.81 },
  { name: 'United Kingdom', year: '2014', gdp: 3063803240208.01 },
  { name: 'United Kingdom', year: '2015', gdp: 2928591002002.51 },
  { name: 'United Kingdom', year: '2016', gdp: 2694283209613.29 },
  { name: 'United Kingdom', year: '2017', gdp: 2666229179958.01 },
  { name: 'United Kingdom', year: '2018', gdp: 2855296731521.96 },
  { name: 'Russian', year: '2000', gdp: 259710142196.94 },
  { name: 'Russian', year: '2001', gdp: 306602070620.5 },
  { name: 'Russian', year: '2002', gdp: 345470494417.86 },
  { name: 'Russian', year: '2003', gdp: 430347770731.79 },
  { name: 'Russian', year: '2004', gdp: 591016690742.8 },
  { name: 'Russian', year: '2005', gdp: 764017107992.39 },
  { name: 'Russian', year: '2006', gdp: 989930542278.7 },
  { name: 'Russian', year: '2007', gdp: 1299705764823.62 },
  { name: 'Russian', year: '2008', gdp: 1660846387624.78 },
  { name: 'Russian', year: '2009', gdp: 1222644282201.86 },
  { name: 'Russian', year: '2010', gdp: 1524917468442.01 },
  { name: 'Russian', year: '2011', gdp: 2051661732059.78 },
  { name: 'Russian', year: '2012', gdp: 2210256976945.38 },
  { name: 'Russian', year: '2013', gdp: 2297128039058.21 },
  { name: 'Russian', year: '2014', gdp: 2059984158438.46 },
  { name: 'Russian', year: '2015', gdp: 1363594369577.82 },
  { name: 'Russian', year: '2016', gdp: 1282723881134.01 },
  { name: 'Russian', year: '2017', gdp: 1578624060588.26 },
  { name: 'Russian', year: '2018', gdp: 1657554647149.87 },
  { name: 'Japan', year: '2000', gdp: 4887519660744.86 },
  { name: 'Japan', year: '2001', gdp: 4303544259842.72 },
  { name: 'Japan', year: '2002', gdp: 4115116279069.77 },
  { name: 'Japan', year: '2003', gdp: 4445658071221.86 },
  { name: 'Japan', year: '2004', gdp: 4815148854362.11 },
  { name: 'Japan', year: '2005', gdp: 4755410630912.14 },
  { name: 'Japan', year: '2006', gdp: 4530377224970.4 },
  { name: 'Japan', year: '2007', gdp: 4515264514430.57 },
  { name: 'Japan', year: '2008', gdp: 5037908465114.48 },
  { name: 'Japan', year: '2009', gdp: 5231382674593.7 },
  { name: 'Japan', year: '2010', gdp: 5700098114744.41 },
  { name: 'Japan', year: '2011', gdp: 6157459594823.72 },
  { name: 'Japan', year: '2012', gdp: 6203213121334.12 },
  { name: 'Japan', year: '2013', gdp: 5155717056270.83 },
  { name: 'Japan', year: '2014', gdp: 4850413536037.84 },
  { name: 'Japan', year: '2015', gdp: 4389475622588.97 },
  { name: 'Japan', year: '2016', gdp: 4926667087367.51 },
  { name: 'Japan', year: '2017', gdp: 4859950558538.97 },
  { name: 'Japan', year: '2018', gdp: 4971323079771.87 }
]

// 配置处理脚本
const optionHandler = 'option.legend = option.legendEnable ? {position: setting.find(settingItem=>settingItem.field === \'legendPosition\').value} : false;' +
  '\n  if (option.legendEnable) {\n' +
  '    option.legend.itemName = option.legendItemName\n' +
  '  }'

// 数据处理脚本
const dataHandler = ''

// 图表配置 new Line('domName', option)
const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  data,
  color: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9', '#6DC8EC', '#945FB9', '#FF9845', '#1E9493', '#FF99C3'],
  xField: 'year',
  yField: 'gdp',
  seriesField: 'name',
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
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
      formatter: (v) => {
        if (v < 1e3) return v
        // 数值格式化为千分位
        if (v >= 1e3 && v < 1e6) return `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => `${s},`)
        if (v >= 1e6 && v < 1e9) return `${(v / 1e6).toFixed(1)} M`
        if (v >= 1e9 && v < 1e12) return `${(v / 1e9).toFixed(1)} B`
        return `${(v / 10e8).toFixed(1)} B`
      },
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
  },
  legendEnable: false,
  legendLayout: 'vertical',
  legendPosition: 'top',
  legend: false,
  legendItemName: {
    style: {
      fill: '#595959',
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
      duration: 5000
    }
  },
  lineStyle: {
    lineWidth: 2
  }
}

export default {
  category,
  title,
  chartType,
  name,
  option,
  setting,
  optionHandler,
  dataHandler
}
