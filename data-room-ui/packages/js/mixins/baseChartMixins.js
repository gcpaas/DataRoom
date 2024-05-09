/**
 * 关于非图表组件的公共方法，私有方法请在组件内部完成
 *  公共方法：
 *    1. 初始化图表实例
 *    2. 更新图表配置
 *    3. 更新图表数据
 *    4. 注册图表事件
 *    5. 销毁图表实例
 */
// TODO:经过测试，下面两种引入方式没有什么区别，首次加载图表时会加载一个公共的G2的js文件，里面应该是图标渲染的一些方法，
//  然后还会加载单独的图表文件，后面再添加其他图表时就只会加载单独的图表文件
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
      temporaryData: null// 临时数据
    }
  },
  inject: ['canvasInst'],
  computed: {
    pageCode () {
      return this.$route.query.code
    },
    dataHandleFilters () {
      return this.canvasInst.dataHandleFilters()
    },
    chartInst () {
      return this.canvasInst.chartInst()
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
      this.updateChartData()
    },
    // 调接口获取数据
    getChartData (interactionParams = {}) {
      const param = {
        params: {},
        pageCode: this.pageCode,
        chartCode: this.config.code,
        businessKey: this.config.dataSource.businessKey
      }
      param.params = (this.externalParams && Object.keys(this.externalParams).length) ? this.externalParams : interactionParams
      return new Promise((resolve, reject) => {
        // 判断是否使用通过交互传来的数据
        if (!this.isExternalData) {
          // 判断组件是否存在数据集,存在则调接口，不存在则返回模拟数据
          if (this.config.dataSource && this.config.dataSource.businessKey) {
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
      })
    },
    // 更新图表数据
    updateChartData () {
      // 调接口获取数据
      this.getChartData().then(res => {
        this.updateChartDataWithData(res)
      }).catch(err => {
        console.log(err)
      })
    },
    // 更新图表配置
    updateChartStyle (config) {
    }
  },
  beforeDestroy () {

  }
}
