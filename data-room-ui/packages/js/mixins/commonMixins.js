/*
 * @description: bigScreen公共方法
 * @Date: 2023-03-24 17:10:43
 * @Author: xing.heng
 */
// import _ from 'lodash'
import { mapMutations, mapState } from 'vuex'
import { EventBus } from 'data-room-ui/js/utils/eventBus'
import { getChatInfo, getUpdateChartInfo } from '../api/bigScreenApi'
import axiosFormatting from '../../js/utils/httpParamsFormatting'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'

export default {
  data () {
    return {
      filterList: [],
      treeParentId: 0,
      dataLoading: false
    }
  },
  watch: {
    'config.expression': { // 表达式发生变化
      handler (val) {
        this.getDataByExpression(this.config)
      }
    },
    currentDataset: { // 关联的数据发生变化
      handler (val) {
        if (val && Object.keys(val).length) {
          this.getDataByExpression(this.config)
        }
      },
      deep: true,
      immediate: true
    },
    currentComputedDatas: { // 关联的数据发生变化
      handler (val) {
        if (val && Object.keys(val).length) {
          this.getDataByExpression(this.config)
        }
      },
      deep: true,
      immediate: true
    }
  },
  computed: {
    ...mapState({
      pageCode: state => state.bigScreen.pageInfo.code,
      customTheme: state => state.bigScreen.pageInfo.pageConfig.customTheme,
      activeCode: state => state.bigScreen.activeCode
      // dataset: state => state.bigScreen.dataset
    }),
    // 所有组件的数据集合
    dataset () {
      return this.$store.state.bigScreen.dataset
    },
    // 所有组件的数据集合
    computedDatas () {
      return this.$store.state.bigScreen.computedDatas
    },
    // 跟当前组件计算表达式关联的组件的数据集合
    currentDataset () {
      const newDataset = {}
      this.config.expressionCodes?.forEach(code => {
        if (this.dataset[code]) {
          newDataset[code] = this.dataset[code]
        }
      })
      return newDataset
    },
    // 跟当前组件计算表达式关联的组件的数据集合
    currentComputedDatas () {
      const newDataset = {}
      this.config.expressionCodes?.forEach(code => {
        if (this.computedDatas[code]) {
          newDataset[code] = this.computedDatas[code]
        }
      })
      return newDataset
    },
    // 组件数据加载时的背景颜色
    loadingBackground () {
      return this.customTheme === 'light' ? '#ffffff' : '#151A26'
    },
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },

  mounted () {
    if (!['tables', 'flyMap', 'map'].includes(this.config.type)) {
      this.chartInit()
    }
    this.watchCacheData()
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig',
      updateDataset: 'bigScreen/updateDataset',
      updateComputedDatas: 'bigScreen/updateComputedDatas'
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
        config.loading = true
        getChatInfo({
          // innerChartCode: this.pageCode ? config.code : undefined,
          chartCode: config.code,
          current: currentPage,
          pageCode: this.pageCode,
          size: size,
          type: config.type
        }).then(async (res) => {
          config.loading = false
          let _res = cloneDeep(res)
          // 如果是http数据集的前端代理，则需要调封装的axios请求
          if (res.executionByFrontend) {
            if (res.data.datasetType === 'http') {
              _res = await axiosFormatting(res.data)
              _res = this.httpDataFormatting(res, _res)
            }
            if (res.data.datasetType === 'js') {
              try {
                const scriptAfterReplacement = res.data.script.replace(/\${(.*?)}/g, (match, p) => {
                  const value = this.config.dataSource?.params[p]
                  if (value === null || value === undefined || value === '') {
                    return "''"
                  } else if (!isNaN(value)) {
                    return value || p
                  } else {
                    return `'${value}' || '${p}'`
                  }
                })
                // eslint-disable-next-line no-new-func
                const scriptMethod = new Function(scriptAfterReplacement)
                _res.data = scriptMethod()
              } catch (error) {
                console.info('JS数据集脚本执行失败', error)
              }
            }
          }
          // 将后端返回的数据保存
          if (_res.success) {
            this.updateDataset({ code: config.code, name: config.name, data: _res?.data })
          }
          config = this.dataFormatting(config, _res)
          this.changeChartConfig(config)
        }).catch((err) => {
          console.info(err)
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
      const list = config?.paramsList?.map((item) => {
        if (item.value === '${level}') {
          return { ...item, value: config.customize.level }
        } else if (item.value === '${name}') {
          return { ...item, value: config.customize.scope }
        } else {
          return item
        }
      })
      const params = {
        chart: {
          ...config,
          paramsList: list ? [...list] : [],
          option: undefined
        },
        current: 1,
        pageCode: this.pageCode,
        type: config.type,
        filterList: filterList || this.filterList
      }
      return new Promise((resolve, reject) => {
        config.loading = true
        getUpdateChartInfo(params).then(async (res) => {
          config.loading = false
          let _res = cloneDeep(res)
          // 如果是http数据集的前端代理，则需要调封装的axios请求
          if (res.executionByFrontend) {
            if (res.data.datasetType === 'http') {
              _res = await axiosFormatting(res.data)
              _res = this.httpDataFormatting(res, _res)
            }
            if (res.data.datasetType === 'js') {
              try {
                const scriptAfterReplacement = res.data.script.replace(/\${(.*?)}/g, (match, p) => {
                  const value = this.config.dataSource?.params[p]
                  if (value === null || value === undefined || value === '') {
                    return "''"
                  } else if (!isNaN(value)) {
                    return value || p
                  } else {
                    return `'${value}' || '${p}'`
                  }
                })
                // eslint-disable-next-line no-new-func
                const scriptMethod = new Function(scriptAfterReplacement)
                _res.data = scriptMethod()
              } catch (error) {
                console.info('JS数据集脚本执行失败', error)
              }
            }
          }
          // 将后端返回的数据保存
          if (_res.success) {
            this.updateDataset({ code: config.code, name: config.name, data: _res?.data })
          }
          config = this.dataFormatting(config, _res)
          if (this.chart) {
            // 单指标组件和多指标组件的changeData传参不同
            if (['Liquid', 'Gauge', 'RingProgress'].includes(config.chartType)) {
              this.chart.changeData(config.option.percent)
            } else {
              this.chart.changeData(config.option.data)
            }
          }
        }).catch(err => {
          console.info(err)
        }).finally(() => {
          if (config) {
            config.loading = false
          }
          resolve(config)
        })
      })
    },
    // http前台代理需要对返回的数据进行重新组装
    httpDataFormatting (chartRes, httpRes) {
      let result = {}
      result = {
        columnData: chartRes.columnData,
        data: httpRes,
        success: chartRes.success

      }
      return result
    },
    dataFormatting (config, data) {
      // 覆盖
    },
    newChart (option) {
      // 覆盖
    },
    // 通过表达式计算获取组件的值
    getDataByExpression (config) {
      // 覆盖
    },
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
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
