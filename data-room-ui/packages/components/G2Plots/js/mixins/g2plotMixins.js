
/**
 * 关于G2plot的公共方法，私有方法请在组件内部完成
 *  公共方法：
 *    1. 初始化图表实例
 *    2. 更新图表配置
 *    3. 更新图表数据
 *    4. 注册图表事件
 *    5. 销毁图表实例
 */
// TODO:经过测试，下面两种引入方式没有什么区别，首次加载图表时会加载一个公共的G2的js文件，里面应该是图标渲染的一些方法，
//  然后还会加载单独的图表文件，后面再添加其他图表时就只会加载单独的图表文件
import * as g2Plot from '@antv/g2plot'
import cloneDeep from 'lodash/cloneDeep'
import { getData, getDataByChart, getDataByList } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
// import chartData from '@gcpaas/data-room-ui/packages/components/G2Plots/BaseBar/data.json'
export default {
  name: '',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      chart: null
    }
  },
  inject: ['chartProvide'],
  computed: {
    pageCode () {
      return this.$route.query.code
    },
    dataScripts () {
      return this.chartProvide.dataScripts()
    }
  },
  watch: {},
  created () {},
  mounted () {
    this.initChart()
  },
  methods: {
    // 初始化图表
    initChart () {
      // 如果需要销毁旧图表实例，先执行销毁操作
      if (this.chart) {
        this.chart.destroy()
      }
      this.getChartData().then(res => {
        const config = cloneDeep(this.config)
        config.option.data = res
        this.chartProvide.updateChartConfig(config)
        this.chart = new g2Plot[this.config.chartType]('test' + this.config.code, {
          renderer: 'canvas',
          // 仪表盘缩放状态下，点击准确
          supportCSSTransform: true,
          ...config.option,
          legend: config.option.showLegend ? config.option.legend : false
        })
        this.chart.render()
      }).catch(err => {
        console.log(err)
      })
    },
    // 处理图表数据
    handleChartData (data) {
      const _config = cloneDeep(this.config)
      _config.option.data = data
      this.chartProvide.updateChartConfig(_config)
      if (this.chart) {
        this.chart.changeData(data)
      }
    },
    // 调接口获取数据
    getChartData () {
      const params = {
        current: 1,
        filterList: [],
        pageCode: this.pageCode,
        chartCode: this.config.code,
        dataSource: { ...this.config.dataSource }
      }
      return new Promise((resolve, reject) => {
        // 判断组件是否存在数据集,存在则调接口，不存在则返回模拟数据
        if (this.config.dataSource && this.config.dataSource.businessKey) {
          getDataByChart(params).then(res => {
            let data = res.data
            const params = {
              data
            }
            if (this.config.dataSource.dataHandleFilterId) {
              data = this.dataScripts[this.config.dataSource.dataHandleFilterId](params) || res.data
            }
            resolve(data)
          }).catch(err => {
            reject(err)
          })
        } else {
          // 否则返回模拟数据
          resolve(this.chartData)
        }
      })
    },

    // 更新图表数据
    updateChartData () {
      // 调接口获取数据
      this.getChartData().then(res => {
        const data = res || []
        this.handleChartData(data)
      }).catch(err => {
        console.log(err)
      })
    },
    // 更新图表配置
    updateChartStyle (config) {
      if (this.chart) {
        // 如果不显示图例
        if (!config.option.showLegend) {
          this.chart.update({ ...config.option, legend: false })
        } else {
          this.chart.update(config.option)
        }
      }
    }
  },
  beforeDestroy () {
    // 销毁图表实例
    if (this.chart) {
      this.chart.destroy()
    }
  }
}
