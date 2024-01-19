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
    <!--    <span style="color:#ffffff">{{config.option.data}}</span>-->
  </div>
</template>
<script>
import 'insert-css'
import cloneDeep from 'lodash/cloneDeep'
import linkageMixins from 'data-room-ui/js/mixins/linkageMixins'
import commonMixins from 'data-room-ui/js/mixins/commonMixins'
import { mapState, mapMutations } from 'vuex'
import * as g2Plot from '@antv/g2plot'
import plotList, { getCustomPlots } from '../G2Plots/plotList'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import _ from 'lodash'

export default {
  name: 'PlotCustomComponent',
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
      hasData: false,
      plotList
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
    this.plotList = [...this.plotList, ...getCustomPlots()]
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
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.destroy()
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
      this.chart = new g2Plot[config.chartType](this.chatId, {
        renderer: 'svg',
        // 仪表盘缩放状态下，点击准确
        supportCSSTransform: true,
        ...config.option
      })
      this.chart.render()
      this.registerEvent()
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
          // 例 point.style.fill
          const optionField = set.optionField.split('.')
          // 例 [point,style,fill]
          option = config.option
          optionField.forEach((field, index) => {
            if (index === optionField.length - 1) {
              // 数据配置时，必须有值才更新
              if ((set.tabName === type && type === 'data' && set.value) || (set.tabName === type && type === 'custom')) {
                option[field] = set.value
              }
            } else {
              // 如果没有这个属性，则创建该属性，并赋值为空对值
              if (!option[field]) {
                option[field] = {}
              }
              option = option[field]
            }
          })
        }
      })
      return config
    },
    dataFormatting (config, data) {
      // 数据返回成功则赋值
      if (data.success) {
        data = data.data || []
        config = this.transformSettingToOption(config, 'data')
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
        if (config.chartType == 'Treemap') {
          const xAxis = config.setting.find(item => item.field === 'xField')?.value
          const listData = data.children.map(item => {
            if (xAxis && typeof item[xAxis] === 'number') {
              item[xAxis] = (item[xAxis]).toString()
            }
            return item
          })
          config.option.data = { name: 'root', children: [...listData] }
        } else {
          // 如果维度为数字类型则转化为字符串，否则在不增加其他配置的情况下会导致图标最后一项不显示（g2plot官网已说明）
          const xAxis = config.setting.find(item => item.field === 'xField')?.value
          const yAxis = config.setting.find(item => item.field === 'yField')?.value
          config.option.data = data?.map(item => {
            if (config.chartType !== 'Bar' && xAxis && typeof item[xAxis] === 'number') {
              item[xAxis] = (item[xAxis]).toString()
            } else if (config.chartType === 'Bar' && yAxis && typeof item[yAxis] === 'number') {
              item[yAxis] = (item[yAxis]).toString()
            }
            return item
          })
        }
      } else {
        // 数据返回失败则赋前端的模拟数据
        config.option.data = this.plotList?.find(plot => plot.name === config.name)?.option?.data || config?.option?.data
        const _xField = this.plotList?.find(plot => plot.name === config.name)?.option?.xField || config?.option?.xField
        const _yField = this.plotList?.find(plot => plot.name === config.name)?.option?.yField || config?.option?.yField
        const _seriesField = this.plotList?.find(plot => plot.name === config.name)?.option?.seriesField || config?.option?.seriesField
        config.option = _seriesField ? { ...config.option, xField: _xField, yField: _yField, seriesField: _seriesField } : { ...config.option, xField: _xField, yField: _yField }
      }
      return config
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
      // 只有样式改变时更新主题配置，切换主题时不需要保存
      if (!isUpdateTheme) {
        config.theme = settingToTheme(_.cloneDeep(config), this.customTheme)
      }
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
      if (this.chart) {
        this.chart.update(config.option)
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
