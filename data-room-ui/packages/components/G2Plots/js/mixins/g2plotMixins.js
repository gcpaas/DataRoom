
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
import { getDataByChart } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
export default {
  name: '',
  components: {},
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    isExternalData: {
      type: Boolean,
      default: false
    },
    externalData: {
      type: Array,
      default: () => ([])
    },
    externalParams: {
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
      return (this.$route.path === window?.SITE_CONFIG.dataRoom?.routers?.bigScreenPreviewUrl) || (this.$route.path === '/big-screen/preview')
    },
    initRequestData () {
      return !(this.isPreview && (!this.config.dataSource.initRequestData) && this.isInit)
    }
  },
  watch: {},
  created () {},
  mounted () {
    this.initChart()
    // 将组件的实例保存起来
    this.canvasInst.updateChartInst(this.config.code, this)
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
        this.chart = new g2Plot[this.config.chartType]('chart' + this.config.code, {
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
    // 调接口获取数据
    getChartData (interactionParams = {}) {
      return new Promise((resolve, reject) => {
        if (!this.initRequestData) {
          // 如果是初始化的时候不请求数据,则返回空数据，否则按照正常逻辑执行
          resolve([])
        } else {
          // 判断是否使用通过交互传来的数据
          if (!this.isExternalData) {
            // 判断组件是否存在数据集,存在则调接口，不存在则返回模拟数据
            if (this.config.dataSource && this.config.dataSource.businessKey) {
              const param = {
                params: {},
                pageCode: this.pageCode,
                chartCode: this.config.code,
                businessKey: this.config.dataSource.businessKey
              }
              // 传入的变量
              const inputParams = (this.externalParams && Object.keys(this.externalParams).length) ? this.externalParams : interactionParams
              // 全局变量
              const params = {}
              this.config?.dataSource?.parameterMapping?.forEach(item => {
                if (item.globalVariableId !== '') {
                  params[item.name] = this.canvasInst.getGlobalValueById(item.globalVariableId)
                }
              })
              // 合并传入的变量（优先级高）和全局变量（优先级低
              param.params = { ...params, ...inputParams }
              // 通过数据集获取参数的时候如果存在外来参数的话就使用外来参数
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
          } else {
            // 否则返回通过交互传过来的数据
            resolve(this.externalData)
          }
        }
      })
    },

    // 更新图表数据
    updateChartData (interactionParams) {
      this.isInit = false
      this.$nextTick(() => {
        // 调接口获取数据
        this.getChartData(interactionParams).then(res => {
          const data = res || []
          this.updateChartDataWithData(data)
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
      this.chart.on('plot:click', (...args) => {
        const data = args[0]?.data?.data
        // 执行交互逻辑
        this.handleChartEvent('click', data)
        const eventList = this.canvasInst.getChartEvens(this.config.code)
        const filterId = eventList?.find(e => e.event === 'click')?.filterId || ''
        if (filterId) {
          this.dataHandleFilters[filterId](data, this.canvasInst)
        }
      })
    },
    handleChartEvent (eventType, data) {
      // 判断是否需要更新全局变量
      const dataItemMap = this.config.fieldMapping.find(item => item.code = eventType)
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
