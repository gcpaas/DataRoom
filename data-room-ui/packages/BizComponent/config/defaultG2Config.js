/*
 * @description: 此处是业务组件的代码案例
 * @Date: 2023-06-06 15:45:07
 */

// vue 组件片段
export const defaultG2VueContent = `
<!-- 这是一个代码案例 -->
<template>
  <div
	 :id="chatId"
	 style="width: 100%;height: 100%"
	/>
</template>
<script>

export default {

  name: 'TestA',
  components: {
  },
  // 业务组件提供的props
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
	  chart: null,
    }
  },
  // 计算属性
  computed: {
   chatId(){
	 return 'g2' + this.config.code
   }
  },
  methods: {

    // 联动需要调用次接口
    newChart (config) {
      this.chart = new config.g2Plots['Line'](this.chatId, {
        renderer: 'svg',
        // 仪表盘缩放状态下，点击准确
        supportCSSTransform: true,
        ...config.option
      })
      this.chart.render()
    },
  },
  mounted(){
   this.newChart(this.config)
  },
}
</script>
<style lang="scss" scoped>
// 此处书写样式，支持scss

</style>
`

// 配置 片段
export const defaultG2SettingContent = `
// 这是一个配置案例
//  组件备注名称
const title = 'g2案例'

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
    label: '曲线宽度',
    type: 'inputNumber',
    field: 'lineStyle_lineWidth',
    optionField: 'lineStyle.lineWidth',
    value: 2,
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: '曲线颜色',
    type: 'gradual',
    field: 'lineStyle_stroke',
    optionField: 'lineStyle.stroke',
    value: 'l(0) 0:#5F92F9 1:#62FF00',
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
    label: '标签过多时隐藏',
    type: 'switch',
    field: 'xAxis_label_autoHide',
    optionField: 'xAxis.label.autoHide',
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
  { Date: '2010-10', scales: 2140 }
]

const option = {
  // 数据将要放入到哪个字段中
  dataKey: 'data',
  // 图表内边距
  appendPadding: [0, 0, 0, 0],
  data,
  color: '',
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  xField: 'Date',
  yField: 'scales',
  smooth: true,
  lineStyle: {
    lineWidth: 2,
    stroke: 'l(0) 0:#6b74e4 1:#4391f4'
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
  }
}

export default {
  title,
  option,
  setting
}

`
