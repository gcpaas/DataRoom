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
import _ from 'lodash'
import linkageMixins from 'packages/js/mixins/linkageMixins'
import commonMixins from 'packages/js/mixins/commonMixins'
import { mapState, mapMutations } from 'vuex'
import * as g2Plot from '@antv/g2plot'
import plotList, { getCustomPlots } from '../G2Plots/plotList'
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
      customTheme: state => state.pageInfo.pageConfig.customTheme
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
  mounted () {
    this.chartInit()
  },
  beforeDestroy () {
    if (this.chart) {
      this.chart.destroy()
    }
  },
  methods: {
    ...mapMutations('bigScreen', ['changeChartConfig']),
    chartInit () {
      // key和code相等，说明是一进来刷新，调用/chart/data/list
      if (this.config.code === this.config.key || this.isPreview) {
        // 先给默认数据, 渲染出图表
        const config = _.cloneDeep(this.config)
        // config.option = plotList.find(plot => plot.name === config.name)?.option
        this.newChart(config.option)

        // 再根据数据更新组件
        this.updateChart()
      } else {
        // 否则说明是更新或者复制
        this.newChart(this.config.option)
      }
    },
    /**
     * 构造chart
     */
    newChart (option) {
      this.chart = new g2Plot[this.config.chartType](this.chatId, {
        renderer: 'svg',
        // 大屏缩放状态下，点击准确
        supportCSSTransform: true,
        ...option || this.config.option
      })
      this.chart.render()
      this.registerEvent()
    },
    /**
     * @description: 只更新数据
     */
    updateData () {
      this.getCurrentOption().then(({ data, config }) => {
        if (data.success) {
          // 成功后更新数据
          config = this.buildOption(config, data)
          const dataKey = config.option.dataKey
          // eslint-disable-next-line no-inner-declarations
          function getValueFromOption (option, dataKey) {
            try {
              return eval('option.' + dataKey)
            } catch (error) {
              return undefined
            }
          }
          const newData = getValueFromOption(config.option, dataKey)
          if (this.chart) {
            this.chart.changeData(newData)
          }
        }
      })
    },
    /**
     * 更新组件
     */
    updateChart () {
      if (this.isPreview) {
        this.getCurrentOption().then(({ data, config }) => {
          if (data.success) {
            // 成功后更新数据
            config = this.buildOption(config, data)
            this.changeChartConfig(config)
            this.chart.update(config.option)
          } else {
            config.option.data = this.plotList.find(plot => plot.name === config.name)?.option.data
            this.chart.update(config.option)
          }
        })
      } else {
        this.updateChartData(this.config)
      }
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
        formData = _.cloneDeep(args[0].data.items[0].data)
      })
      // eslint-disable-next-line no-unused-vars
      this.chart.on('plot:click', (...args) => {
        this.linkage(formData)
      })
    },
    /**
     * 组件的配置
     * @returns {Promise<unknown>}
     */
    buildOption (config, data) {
      config = _.cloneDeep(config)
      // 遍历config.setting，将config.setting中的值赋值给config.option中对应的optionField
      config.setting.forEach(set => {
        if (set.optionField) {
          const optionField = set.optionField.split('.')
          let option = config.option
          optionField.forEach((field, index) => {
            if (index === optionField.length - 1) {
              // 数据配置时，必须有值才更新
              if ((set.tabName === 'data' && set.value) || set.tabName === 'custom') {
                option[field] = set.value
              }
            } else {
              option = option[field]
            }
          })
        }
      })
      // eslint-disable-next-line no-unused-vars
      const option = config.option
      // eslint-disable-next-line no-unused-vars
      const setting = config.setting
      if (this.config.optionHandler) {
        try {
          // 此处函数处理config
          eval(this.config.optionHandler)
        } catch (e) {
          console.error(e)
        }
      }
      if (data.success) {
        data = data.data
        if (this.config.dataHandler) {
          try {
            // 此处函数处理data
            eval(this.config.dataHandler)
          } catch (e) {
            console.error(e)
          }
        }
        // eslint-disable-next-line no-undef
        config.option = option
        config.option.data = data
      } else {
        // 数据获取失败，使用前端配置中的默认数据
        config.option.data = this.plotList?.find(plot => plot.name === this.config.name)?.option?.data
      }
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/assets/style/echartStyle';
.light-theme{
  background-color: #FFFFFF;
  color: #000000;
}
.auto-theme{
  background-color: rgba(0,0,0,0);
}

</style>
