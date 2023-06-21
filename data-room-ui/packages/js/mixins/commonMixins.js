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
    if (!['digitalFlop', 'screenScrollRanking', 'screenScrollBoard', 'tables'].includes(this.config.type)) {
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
      // 初始化组件和数据，若自己的组件的初始化和数据处理不一样，可重写该方法
      // 如果key和code相等，说明是一进来刷新，调用/chart/data/list，否则是更新，调用 chart/data/chart
      // 或者是组件联动isLink,也需要调用/chart/data/list更新
      if (this.config.code === this.config.key) {
        // 根据缓存数据初始化的组件
        if (this.config.dataSource.dataSetType === '2') {
          this.config = this.buildOption(this.config, { success: false })
          this.changeChartConfig(this.config)
          this.newChart(this.config.option)
        } else {
          // 根据数据集初始化的组件
          if (this.isPreview) {
            this.getCurrentOption().then(({ config, data }) => {
              config = this.buildOption(config, data)
              this.changeChartConfig(config)
              this.newChart(config.option)
            })
          } else {
            this.updateChartData(this.config)
          }
        }
      } else {
        this.newChart(this.config.option)
      }
    },
    // 组件仅更新数据
    changeData () { },
    // 组件仅更新样式
    changeStyle () {
      this.config = _.cloneDeep(this.config)
      // 遍历config.setting，将config.setting中的值赋值给config.option中对应的optionField
      this.config.setting.forEach(set => {
        if (set.optionField) {
          const optionField = set.optionField.split('.')
          let option = this.config.option
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
      if (this.config.optionHandler) {
        try {
          // 此处函数处理config
          eval(this.config.optionHandler)
        } catch (e) {
          console.error(e)
        }
      }
    },
    /**
     * 初始化组件时获取后端返回的数据, 返回数据和当前组件的配置
     * @param settingConfig 设置时的配置。不传则为当前组件的配置
     * @returns {Promise<unknown>}
     */
    getCurrentOption (settingConfig) {
      const pageCode = this.pageCode
      const chartCode = this.config.code
      const type = this.config.type
      const config = _.cloneDeep(settingConfig || this.config)
      let currentPage = 1
      let size = 10
      if (config?.option?.pagination) {
        currentPage = config.option.pagination.currentPage
        size = config.option.pagination.pageSize
      }
      return new Promise((resolve, reject) => {
        this.getDataByCode(pageCode, chartCode, type, currentPage, size).then((data) => {
          resolve({
            config, data
          })
        }).catch((err) => {
          reject(err)
        })
      })
    },
    /**
     *  根据 chatCode 获取后端返回的数据
     * @param pageCode
     * @param chartCode
     * @param type
     * @param current
     * @param size
     * @returns {Promise<*>}
     */
    async getDataByCode (
      pageCode,
      chartCode,
      type,
      current = 1,
      size = 10
    ) {
      let parentCode
      const data = await getChatInfo({
        innerChartCode: parentCode ? chartCode : undefined,
        chartCode: parentCode || chartCode,
        current: current,
        pageCode: pageCode,
        size: size,
        type: type
      })
      return data
    },

    /**
     * @description: 更新chart
     * @param {Object} config
     */
    updateChartData (config) {
      const filterList = this.filterList
      const params = {
        chart: {
          ...config,
          option: undefined
        },
        current: 1,
        pageCode: this.pageCode,
        type: config.type,
        filterList
      }
      // if (config.type === 'remoteComponent') {
      //   config = this.buildOption(config, { success: false })
      //   config.key = new Date().getTime()
      //   this.changeChartConfig(config)
      //   return
      // }
      getUpdateChartInfo(params).then((res) => {
        // 数据集脚本前端执行
        if (res.executionByFrontend) {
          try {
            const returnResult = eval(`(${res.data})`)()
            res.data = returnResult
          } catch (error) {
            console.error('数据集脚本执行失败', error)
          }
        }
        config = this.buildOption(config, res)
        config.key = new Date().getTime()
        this.changeChartConfig(config)
        // 获取数据后更新组件配置

        // this.$message.success('更新成功')
      }).catch((err) => {
        console.error(err)
        // this.$message.error('更新失败')
      })
    },
    newChart () {
      // 需要在自己的组件中重写此方法，用于构建自己的组件
    },
    buildOption (config, data) {
      // 需要在自己的组件中重写此方法:config当前组件的配置，data后端返回的数据
      return config
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
          const config = this.buildOption(this.config, data)
          config.key = new Date().getTime()
          this.changeChartConfig(config)
          this.newChart(config.option)
        }
      })
    }
  }
}
