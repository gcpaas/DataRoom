/*
 * @description: 此处是业务组件的代码案例
 * @Date: 2023-06-06 15:45:07
 */

// vue 组件片段
export const defaultEchartsVueContent = `
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
	 return 'echarts' + this.config.code
   }
  },
  methods: {
	//响应式变化组件大小方法，无需改动
	onResize () {
      this.chart.resize({
        animation: {
          duration: 300,
          easing: 'linear'
          // delay: 500,
        }
      })
    },
    // 初始化图表
    newChart (config) {
	  let option = config.option
	  const xList=config.option.data.map(item=> item[config.option.xField])
	  const yList=config.option.data.map(item=> item[config.option.yField])
	  option.xAxis.data=xList
	  option.series[0].data=yList
	  const dom = document.getElementById(this.chatId)
      this.chart = config.echarts.init(dom)
      this.chart.setOption(option,true)
    },
  },
  mounted(){
   this.newChart(this.config)
	//响应式变化组件大小，无需改动
	const dragSelect = document.querySelector("#"+this.chatId)
    let pre = Date.now()
    const wait = 300
    const resizeObserver = new ResizeObserver(entries => {
      const now = Date.now()
      if (now - pre >= wait) {
        setTimeout(() => {
          this.onResize()
        }, wait)
        pre = Date.now()
      }
    })
    resizeObserver.observe(dragSelect)
  },
}
</script>
<style lang="scss" scoped>
// 此处书写样式，支持scss

</style>
`

// 配置 片段
export const defaultEchartsSettingContent = `
// 这是一个配置案例
//  组件备注名称
const title = 'echarts案例'

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
    label: '柱形颜色',
    type: 'colorPicker',
    field: 'color',
    optionField: 'color',
    value: '#007aff',
    tabName: 'custom',
    groupName: 'graph'
  },
  {
    label: 'x轴类型',
    type: 'input',
    field: 'xAxis_type',
    optionField: 'xAxis.type',
    value: 'category',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '是否显示标签',
    type: 'switch',
    field: 'xAxis_axisLabel_show',
    optionField: 'xAxis.axisLabel.show',
    value: true,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签旋转角度',
    type: 'inputNumber',
    field: 'xAxis_axisLabel_rotate',
    optionField: 'xAxis.axisLabel.rotate',
    value: 0,
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: '标签颜色',
    type: 'colorPicker',
    field: 'xAxis_axisLabel_color',
    optionField: 'xAxis.axisLabel.color',
    value: '#fff',
    tabName: 'custom',
    groupName: 'xAxis'
  },
  {
    label: 'y轴类型',
    type: 'input',
    field: 'yAxis_type',
    optionField: 'yAxis.type',
    value: 'value',
    tabName: 'custom',
    groupName: 'yAxis'
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
  //柱状图颜色
  color: '#007aff',
  appendPadding: [16, 16, 16, 16], // 设置图标的边距
  xField: 'Date',
  yField: 'scales',
  xAxis: {
    type:'category',
	  data: [],
	  axisLabel:{
	   show:true,
		color:'#fff',
		rotate:0
	  }
   },
  yAxis: {
    type: 'value'
   },
  series:[
	{
	  data: [],
	  type: 'bar',
	  backgroundStyle: {
       color: '#fff'
      }
    }
  ]
}

export default {
  title,
  option,
  setting
}
`
