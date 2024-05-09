
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
      isInit: true,
      temporaryData: null// 将获取的数据保存到改变量中，不保存在配置中
    }
  },
  inject: ['canvasInst'],
  computed: {
    pageCode () {
      return this.$route.query.code
    },
    dataHandleFilters () {
      return this.canvasInst.dataHandleFilters
    },
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.bigScreenPreviewUrl) || (this.$route.path === '/big-screen/preview')
    },
    initRequestData () {
      return !(this.isPreview && (!this.config.dataSource.initRequestData) && this.isInit)
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
        this.temporaryData = res
        this.chart = new g2Plot[this.config.chartType]('test' + this.config.code, {
          renderer: 'canvas',
          // 仪表盘缩放状态下，点击准确
          supportCSSTransform: true,
          ...config.option,
          data: this.temporaryData,
          legend: config.option.showLegend ? config.option.legend : false
        })
        this.chart.render()
        this.triggerClickEvent()
      }).catch(err => {
        console.log(err)
      })
    },
    // 处理图表数据
    handleChartData (data) {
      const _config = cloneDeep(this.config)
      _config.option.data = data
      this.canvasInst.updateChartConfig(_config)
      if (this.chart) {
        this.chart.changeData(data)
      }
    },
    // 调接口获取数据
    getChartData () {
      return new Promise((resolve,reject) => {
        if (!this.initRequestData){
          // 如果是初始化的时候不请求数据,则返回空数据，否则按照正常逻辑执行
          resolve([])
        } else {
          const param = {
            params: {},
            pageCode: this.pageCode,
            chartCode: this.config.code,
            businessKey: this.config.dataSource.businessKey
          }
          // 全局变量
          const params = {}
          this.config.dataSource.parameterMapping.forEach(item => {
            if (item.globalVariableId !== '') {
              params[item.name] = this.canvasInst.getGlobalValueById(item.globalVariableId)
            }
          })
          // 合并传入的变量（优先级高）和全局变量（优先级低
          param.params = { ...params}
          // 判断组件是否存在数据集,存在则调接口，不存在则返回模拟数据
          if (this.config.dataSource && this.config.dataSource.businessKey) {
            getDataByChart(param).then(res => {
              let data = res.data
              const params = {
                data
              }
              if (this.config.dataSource.dataHandleFilterId) {
                data = this.dataHandleFilters[this.config.dataSource.dataHandleFilterId](params) || res.data
              }
              resolve(data)
            }).catch(err => {
              reject(err)
            })
          } else {
            // 否则返回模拟数据
            resolve(this.mockData)
          }
        }
      })
    },

    // 更新图表数据
    updateChartData () {
      this.isInit = false
      this.$nextTick(() => {
        // 调接口获取数据
        this.getChartData().then(res => {
          console.log(res)
          const data = res || []
          this.updateChartDataWithData(data)
          console.log(data)
        }).catch(err => {
          console.log(err)
        })
      })
    },
    /**
     * 使用指定数据更新图表数据
     * @param data
     */
    updateChartDataWithData (data = []) {
      this.isInit = false
      this.$nextTick(() => {
        this.temporaryData = data
        if (this.chart) {
          this.chart.changeData(data)
        }
      })
    },
    // 更新图表配置
    updateChartStyle () {
      if (this.chart) {
        this.$nextTick(() => {
          const option = {
            ...this.config.option,
            data: this.temporaryData
          }
          // 如果不显示图例
          if (!this.config.option.showLegend) {
            this.chart.update({ ...option, legend: false })
          } else {
            this.chart.update(option)
          }
          this.$forceUpdate()
        })
      }
    },
    // TODO 这里是注册事件还是触发事件
    triggerClickEvent () {
      const _this = this
      this.chart.on('plot:click', (...args) => {
        const data = args[0]?.data?.data
        // 执行交互逻辑
        this.handleChartEvent('click', data)
      })
    },
    handleChartEvent (eventType, data) {
      // 判断是否需要更新全局变量
      const dataItemMap = this.config.fieldMapping.find(item => item.eventCode = eventType)
      if (dataItemMap && dataItemMap.enable) {
        dataItemMap.fieldList.forEach(field => {
          if (field.globalVariableId !== '' && data) {
            this.canvasInst.setGlobalValue(field.globalVariableId, data[this.config.dataSource[field.name]])
          }
        })
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
