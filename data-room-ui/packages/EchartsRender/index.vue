<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap bs-custom-component"
    :class="{'light-theme':customTheme === 'light','auto-theme':customTheme !=='light'}"
  >
    <div
      :id="chatId"
      style="width: 100%;height: 100%"
    />
  </div>
</template>
<script>
import 'insert-css'
import cloneDeep from 'lodash/cloneDeep'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import { mapState, mapMutations } from 'vuex'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import _ from 'lodash'
import * as echarts from 'echarts'
import CloneDeep from 'lodash-es/cloneDeep'

export default {
  name: 'EchartsCustomComponent',
  mixins: [commonMixins, linkageMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      chart: null,
      hasData: false
    }
  },
  computed: {
    ...mapState('bigScreen', {
      pageInfo: state => state.pageInfo,
      customTheme: state => state.pageInfo.pageConfig.customTheme,
      activeCode: state => state.activeCode
    }),
    chatId () {
      let prefix = 'chart_'
      if (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) {
        prefix = 'preview_chart_'
      }

      if (this.$route.path === window?.BS_CONFIG?.routers?.designUrl) {
        prefix = 'design_chart_'
      }

      if (this.$route.path === window?.BS_CONFIG?.routers?.pageListUrl) {
        prefix = 'management_chart_'
      }
      return prefix + this.config.code
    }
  },
  created () {
  },
  watch: {
    // 监听主题变化手动触发组件配置更新
    'config.option.theme': {
      handler (val) {
        if (val) {
          this.changeStyle(this.config, true)
        }
      }
    }
  },
  mounted () {
    const dragSelect = document.querySelector('#' + this.chatId)
    const resizeObserver = new ResizeObserver(entries => {
      if (this.chart) {
        this.chart.resize()
        if(this.config.name.includes('3D')){
          let config = this.observeChart(entries)
          config = this.seriesStyle(config)
          config.option && this.chart.setOption(config.option)
        }
      }
    })
    resizeObserver.observe(dragSelect)
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.dispose()
    }
  },
  methods: {
    ...mapMutations('bigScreen', ['changeChartConfig', 'changeActiveItemConfig', 'changeChartLoading']),
    chartInit () {
      let config = this.config
      // key和code相等，说明是一进来刷新，调用list接口
      if (this.config.code === this.config.key || this.isPreview) {
        // 改变样式
        config = this.changeStyle(config)
        // 改变数据
        config.loading = true
        this.changeChartLoading(config)
        this.changeDataByCode(config).then((res) => {
          // 初始化图表
          config.loading = false
          this.changeChartLoading(config)
          this.newChart(res)
        }).catch(() => {
        })
      } else {
        config.loading = true
        this.changeChartLoading(config)
        // 否则说明是更新，这里的更新只指更新数据（改变样式时是直接调取changeStyle方法），因为更新数据会改变key,调用chart接口
        this.changeData(config).then((res) => {
          config.loading = false
          this.changeChartLoading(config)
          // 初始化图表
          this.newChart(res)
        })
      }
    },
    /**
     * 构造chart
     */
    newChart (config) {
      const chartDom = document.getElementById(this.chatId)
      this.chart = echarts.init(chartDom)
      config.option && this.chart.setOption(config.option)
    },
    /**
     * 控制底部阴影大小
     */
    observeChart (entries) {
      const width = entries[0].contentRect.width
      const height = entries[0].contentRect.height
      const option = this.config.option
      // 调整长方形的大小
      option.graphic.children[0].shape.width = width * 0.9
      // 调整多边形的大小
      option.graphic.children[1].shape.points = [[width / 10, -height / 6], [width - width / 6, -height / 6], [width * 0.9, 0], [0, 0]]
      return this.config
    },
    /**
     * 注册事件
     */
    registerEvent () {
      // 图表添加事件进行数据联动
      let formData = {}
      // eslint-disable-next-line no-unused-vars
      this.chart.on('tooltip:change', (...args) => {
        formData = {}
        formData = cloneDeep(args[0].data.items[0].data)
      })
      // eslint-disable-next-line no-unused-vars
      this.chart.on('plot:click', (...args) => {
        this.linkage(formData)
      })
    },
    // 将config.setting的配置转化为option里的配置，这里之所以将转化的方法提出来，是因为在改变维度指标和样式的时候都需要转化
    transformSettingToOption (config, type) {
      let option = null
      config.setting.forEach(set => {
        if (set.optionField) {
          const optionField = set.optionField.split('.')
          option = config.option
          // 判断是不是关于x轴的相关配置，x轴叠加了两层坐标轴，如果是x轴相关配置则作用于xAxis[0]
          if (optionField[0] === 'xAxis') {
            optionField.forEach((field, index) => {
              if (index === 0) {
                option = option.xAxis[0]
              } else if (index === optionField.length - 1) {
              // 数据配置时，必须有值才更新
                if ((set.tabName === type && type === 'data' && set.value) || (set.tabName === type && type === 'custom')) {
                  option[field] = set.value
                }
              } else {
                option = option[field]
              }
            })
          } else if (optionField[0] === 'series') {
            let changeObject = []
            let beforeChange = []
            // 如果要配置数据标签相关信息
            optionField.forEach((field, index) => {
              if (index === 0) {
                option = option[field]
              } else if (index === 1) {
                // 筛选出需要修改的series对象
                changeObject = option.filter(item => item.id.includes(field))
                beforeChange = [...changeObject]
                option = option.filter(item => !(item.id.includes(field)))
              } else if (index === optionField.length - 1) {
                if ((set.tabName === type && type === 'data' && set.value) || (set.tabName === type && type === 'custom')) {
                  changeObject.map(item => {
                    item[field] = set.value
                  })
                }
              } else {
                const changeResult = []
                changeObject.forEach(item => {
                  const result = { ...item[field] }
                  changeResult.push(result)
                })
                changeObject = [...changeResult]
              }
            })
            // 合并修改后的series对象
            changeObject.forEach(
              (item, index) => {
                beforeChange[index].label = _.cloneDeep(item)
                option.push(beforeChange[index])
              }
            )
          } else if (optionField[0] === 'graphic') {
            // 配置底部阴影颜色
            option.graphic.children.forEach(item => {
              item.style.fill = set.value
            })
          } else {
            optionField.forEach((field, index) => {
              if (index === optionField.length - 1) {
              // 数据配置时，必须有值才更新
                if ((set.tabName === type && type === 'data' && set.value) || (set.tabName === type && type === 'custom')) {
                  option[field] = set.value
                }
              } else {
                option = option[field]
              }
            })
          }
        }
      })
      return config
    },
    dataFormatting (config, data) {
      // config = this.config
      // 数据返回成功则赋值
      if (data.success) {
        data = data.data
        // 获取到后端返回的数据，有则赋值
        const option = config.option
        const setting = config.setting
        if (config.dataHandler) {
          try {
            // 此处函数处理data
            eval(config.dataHandler)
          } catch (e) {
            console.error(e)
          }
        }
        config.option = this.echartsOptionFormatting(config, data)
        config = this.transformSettingToOption(config, 'data')
      } else {
        // 数据返回失败则赋前端的模拟数据
        // config.option.data = this.plotList?.find(plot => plot.name === config.name)?.option?.data || config?.option?.data
      }
      config = this.seriesStyle(config)
      return config
    },
    getxDataAndYData (xField, yField, data) {
      let xData = []
      let yData = []

      // 获取所有x轴的分类
      data.forEach(item => {
        xData.push(item[xField])
      })
      xData = [...new Set(xData)]
      xData.forEach(x => {
        let max = 0
        data.forEach(item => {
          if (item[xField] === x) {
            max = item[yField] > max ? item[yField] : max
          }
        })
        yData.push(max)
      })
      return { xData, yData }
    },
    // 格式化echarts的配置
    echartsOptionFormatting (config, data) {
      const option = config.option
      // 分组字段
      const xField = config.setting.find(item => item.optionField === 'xField')?.value
      const yField = config.setting.find(item => item.optionField === 'yField')?.value
      // 判断是否存在分组
      const hasSeries = config.setting.find(item => item.optionField === 'seriesField' && item.value !== '')
      const { xData, yData } = this.getxDataAndYData(xField, yField, data)
      const maxY = Math.max(...yData) + Math.max(...yData) * 0.2
      // 生成阴影柱子的值
      const shadowData = Array.from({ length: xData.length }, () => maxY)
      option.xAxis = option.xAxis.map(item => {
        return {
          ...item,
          data: xData
        }
      })
      // 存在分组字段
      if (hasSeries) {
        const seriesField = config.setting.find(item => item.optionField === 'seriesField')?.value
        const seriesFieldList = [...new Set(data.map(item => item[seriesField]))]
        option.series = []
        const barWidth = option.seriesCustom.barWidth
        // 获取数据标签展示情况
        let labelShow = 0
        let labelPosition = 'inside'
        let labelColor = '#fff'
        let labelSize = 12
        config.setting.forEach(set => {
          if (set.field === 'series_barColor_label_show') {
            labelShow = set.value
          } else if (set.field === 'series_barColor_label_position') {
            labelPosition = set.value
          } else if (set.field === 'series_barColor_label_color') {
            labelColor = set.value
          } else if (set.field === 'series_barColor_label_fontSize') {
            labelSize = set.value
          }
        })
        // 偏移量数组
        const offsetArr = []
        let index = 0
        if (seriesFieldList.length % 2 === 0) {
          const length = seriesFieldList.length / 2
          for (let i = 0; i < length; i++) {
            const offsetX = (parseInt('10%') + parseInt('50%')) * (2 * i + 1)
            offsetArr.push(offsetX)
            offsetArr.unshift(-offsetX)
          }
        } else {
          const length = Math.ceil(seriesFieldList.length / 2)
          for (let i = 0; i < length; i++) {
            if (i === 0) {
              offsetArr.push(0)
            } else {
              const offsetX = (parseInt('20%') + parseInt('100%')) * i
              offsetArr.push(offsetX)
              offsetArr.unshift(-offsetX)
            }
          }
        }
        for (const seriesFieldItem of seriesFieldList) {
          const seriesData = (data.filter(item => item[seriesField] === seriesFieldItem))?.map(item => item[yField])
          const seriesItem = [
            {
              id: 'barTopColor' + seriesFieldItem,
              type: 'pictorialBar',
              tooltip: { show: false },
              symbol: 'diamond',
              symbolSize: [barWidth, barWidth / 2],
              symbolOffset: [offsetArr[index] + '%', -barWidth / 4],
              symbolPosition: 'end',
              z: 15,
              zlevel: 2,
              color: '#ffff33',
              data: seriesData
            },
            {
              id: 'barColor' + seriesFieldItem,
              type: 'bar',
              barGap: '20%',
              barWidth: barWidth,
              color: '#115ba6',
              label: {
                fontStyle: 'normal',
                show: labelShow,
                position: labelPosition,
                color: labelColor,
                fontSize: labelSize
              },
              zlevel: 2,
              z: 12,
              data: seriesData
            },
            {
              id: 'barBottomColor' + seriesFieldItem,
              type: 'pictorialBar',
              tooltip: { show: false },
              symbol: 'diamond',
              symbolSize: [barWidth, barWidth / 2],
              symbolOffset: [offsetArr[index] + '%', barWidth / 4],
              zlevel: 2,
              z: 15,
              color: 'rgb(2, 192, 255)',
              data: seriesData
            },
            {
              id: 'shadowColor' + seriesFieldItem,
              type: 'bar',
              tooltip: { show: false },
              xAxisIndex: 1,
              barGap: '20%',
              data: shadowData,
              zlevel: 1,
              barWidth: barWidth,
              color: 'rgba(9, 44, 76,.8)'
            },
            {
              id: 'shadowTopColor' + seriesFieldItem,
              type: 'pictorialBar',
              tooltip: { show: false },
              symbol: 'diamond',
              symbolSize: [barWidth, barWidth / 2],
              symbolOffset: [offsetArr[index] + '%', -barWidth / 4],
              symbolPosition: 'end',
              z: 15,
              color: 'rgb(15, 69, 133)',
              zlevel: 1,
              data: shadowData
            }
          ]
          index++
          option.series.push(...seriesItem)
        }
      } else {
        // 没有分组，不需要修改配置，直接修改series中每个对象的series
        option.series.forEach(item => {
          if (item.id.includes('shadow')) {
            item.data = shadowData
          } else {
            item.data = yData
          }
        })
      }
      return option
    },
    // 对series里面的样式进行配置
    seriesStyle (config) {
      if(!config.name.includes('3D')){
        return config
      }
      const _config = CloneDeep(config)
      const seriesCustom = _config.option.seriesCustom
      const ids = Object.keys(config.option.seriesCustom)
      // 判断是否是分组柱状图
      const isGroup = _config.option.series.length !== 5
      // 宽度配置
      _config.option.series.forEach(item => {
        if (item.type === 'pictorialBar') {
          item.symbolSize = [seriesCustom.barWidth, seriesCustom.barWidth / 2]
        } else if (item.type === 'bar') {
          item.barWidth = seriesCustom.barWidth
        }
      })
      // 如果是基础柱状图
      if (!isGroup) {
        _config.option.series.forEach(item => {
          // 配置颜色
          if (ids.includes(item.id)) {
            item.color = seriesCustom[item.id]
          }
        })
      } else {
        // 如果是分组柱状图
        ids.forEach(id => {
          if (id !== 'barWidth') {
            let index = 0
            _config.option.series.forEach(item => {
              if (item.id.includes(id)) {
                item.color = _config.option.seriesCustom[id][index]
                index++
              }
            })
          }
        })
      }
      return _config
    },
    // 组件的样式改变，返回改变后的config
    changeStyle (config, isUpdateTheme) {
      config = { ...this.config, ...config }
      config = this.transformSettingToOption(config, 'custom')
      // 这里定义了option和setting是为了保证在执行eval时,optionHandler、dataHandler里面可能会用到，
      const option = config.option
      const setting = config.setting
      if (this.config.optionHandler) {
        try {
          // 此处函数处理config
          eval(this.config.optionHandler)
        } catch (e) {
          console.error(e)
        }
      }
      // 此时，setting中的部分变量映射到了option.seriesCustom中，但未映射到series的具体配置中
      config = this.seriesStyle(config)
      // 只有样式改变时更新主题配置，切换主题时不需要保存
      if (!isUpdateTheme) {
        config.theme = settingToTheme(_.cloneDeep(config), this.customTheme)
      }
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
      if (this.chart) {
        this.chart.setOption(config.option)
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/echartStyle';
.light-theme{
  background-color: #ffffff;
  color: #000000;
}
.auto-theme{
  background-color: transparent;
}

</style>
