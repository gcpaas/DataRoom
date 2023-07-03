/*
 * @description: bigScreen公共方法
 * @Date: 2023-03-24 17:10:43
 * @Author: xing.heng
 */
import _ from 'lodash'
import { mapMutations, mapState } from 'vuex'
import { EventBus } from 'packages/js/utils/eventBus'
import { getChatInfo, getUpdateChartInfo } from '../api/bigScreenApi'
export default {
  data () {
    return {
      filterList: [],
      treeParentId: 0,
      dataLoading: false
    }
  },
  computed: {
    ...mapState({
      pageCode: state => state.bigScreen.pageInfo.code
    }),
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  mounted () {
    if (!['tables'].includes(this.config.type)) {
      this.chartInit()
    }
    this.watchCacheData()
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig'
    }),
    /**
     * 初始化组件
     */
    chartInit () {
      let config = this.config
      // key和code相等，说明是一进来刷新，调用list接口
      if (this.isPreview) {
        // 改变样式
        config = this.changeStyle(config) ? this.changeStyle(config) : config
        // 改变数据
        config = this.changeDataByCode(config)
      } else {
        // 否则说明是更新，这里的更新只指更新数据（改变样式时是直接调取changeStyle方法），因为更新数据会改变key,调用chart接口
        // eslint-disable-next-line no-unused-vars
        config = this.changeData(config)
      }
    },
    /**
     * 初始化组件时获取后端返回的数据, 返回数据和当前组件的配置_list
     * @param settingConfig 设置时的配置。不传则为当前组件的配置
     * @returns {Promise<unknown>}
     */
    changeDataByCode (config) {
      let currentPage = 1
      let size = 10
      if (config?.option?.pagination) {
        currentPage = config.option.pagination.currentPage
        size = config.option.pagination.pageSize
      }
      return new Promise((resolve, reject) => {
        getChatInfo({
          // innerChartCode: this.pageCode ? config.code : undefined,
          chartCode: config.code,
          current: currentPage,
          pageCode: this.pageCode,
          size: size,
          type: config.type
        }).then((data) => {
          if (data.executionByFrontend) {
            try {
              const scriptAfterReplacement = data.data.replace(/\${(.*?)}/g, (match, p) => {
                // 根据parmas的key获取value
                return `'${this.config.dataSource?.params[p]}' || '${p}'`
              })
              // eslint-disable-next-line no-new-func
              const scriptMethod = new Function(scriptAfterReplacement)
              data.data = scriptMethod()
            } catch (error) {
              console.error('数据集脚本执行失败', error)
            }
          }
          config = this.dataFormatting(config, data)
          this.changeChartConfig(config)
        }).catch((err) => {
          console.log(err)
        }).finally(() => {
          resolve(config)
        })
      })
    },
    /**
     * @description: 更新chart
     * @param {Object} config
     */
    changeData (config, filterList) {
      const params = {
        chart: {
          ...config,
          option: undefined
        },
        current: 1,
        pageCode: this.pageCode,
        type: config.type,
        filterList: filterList || this.filterList
      }
      return new Promise((resolve, reject) => {
        getUpdateChartInfo(params).then((data) => {
          if (data.executionByFrontend) {
            try {
              const scriptAfterReplacement = data.data.replace(/\${(.*?)}/g, (match, p) => {
                // 根据parmas的key获取value
                return `'${this.config.dataSource?.params[p]}' || '${p}'`
              })
              // eslint-disable-next-line no-new-func
              const scriptMethod = new Function(scriptAfterReplacement)
              data.data = scriptMethod()
            } catch (error) {
              console.error('数据集脚本执行失败', error)
            }
          }
          config = this.dataFormatting(config, data)
          // this.changeChartConfig(config)
          if (this.chart) {
            // 单指标组件和多指标组件的changeData传参不同
            if (['Liquid', 'Gauge', 'RingProgress'].includes(config.chartType)) {
              this.chart.changeData(config.option.percent)
            } else {
              this.chart.changeData(config.option.data)
            }
          }
        }).catch(err => {
          console.log(err)
        }).finally(() => {
          resolve(config)
        })
      })
    },
    dataFormatting (config, data) {
      // 覆盖
    },
    newChart (option) {
      // 覆盖
    },
    changeStyle (config) {
      // this.changeChartConfig(config)
      // return config
    },
    // 缓存组件数据监听
    watchCacheData () {
      EventBus.$on('cacheDataInit', (data, dataSetId) => {
        // 如果是缓存数据集
        // 且当前组件的businessKey和缓存的dataSetId相等时，更新组件
        if (
          this.config.dataSource.dataSetType === '2' &&
          this.config.dataSource.businessKey === dataSetId
        ) {
          const config = this.dataFormatting(this.config, data)
          config.key = new Date().getTime()
          this.changeChartConfig(config)
          this.newChart(config.option)
        }
      })
    }
  }
}
