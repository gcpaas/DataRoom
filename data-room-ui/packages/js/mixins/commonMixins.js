/*
 * @description: bigScreen公共方法
 * @Date: 2023-03-24 17:10:43
 * @Author: xing.heng
 */
import _ from 'lodash'
import { mapMutations, mapState } from 'vuex'
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
      return this.$route.path !== window?.BS_CONFIG?.routers?.designUrl
    }
  },
  mounted () {},
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
      if (this.config.code === this.config.key || this.isPreview) {
        // 根据数据集初始化的组件
        if (this.isPreview) {
          this.getCurrentOption().then(({ config, data }) => {
            config = this?.buildOption(config, data)
            if (config) {
              this.changeChartConfig(config)
              this?.newChart(config.option)
            }
          })
        } else {
          this.updateChartData(this.config)
        }
      } else {
        this?.newChart(this.config.option)
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
      getUpdateChartInfo(params).then((res) => {
        // 获取数据后更新组件配置
        config.key = new Date().getTime()
        config = this.buildOption(config, res)
        if (config) {
          this.changeChartConfig(config)
        }
        // this.$message.success('更新成功')
      }).catch((err) => {
        console.error(err)
        // this.$message.error('更新失败')
      })
    },
    buildOption (config, data) {
      // 覆盖
    },
    newChart (option) {
      // 覆盖
    }
  }
}
