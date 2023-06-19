<template>
  <div
    v-loading="loading"
    class="bs-remote-wrap"
    element-loading-text="远程组件加载中..."
  >
    <component
      :is="remoteComponent"
      :config="config"
      @linkage="linkEvent"
    />
  </div>
</template>
<script>
import linkageMixins from 'packages/js/mixins/linkageMixins'
import commonMixins from 'packages/js/mixins/commonMixins'
import remoteVueLoader from 'remote-vue2-loader'
import { mapMutations, mapState } from 'vuex'
import _ from 'lodash'
import innerRemoteComponents, { getRemoteComponents } from 'packages/RemoteComponents/remoteComponentsList'
import { getBizComponentInfo } from 'packages/js/api/bigScreenApi'
export default {
  name: 'LcdpRemoteComponent',
  mixins: [linkageMixins, commonMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState('bigScreen', {
      pageInfo: state => state.pageInfo,
      customTheme: state => state.pageInfo.pageConfig.customTheme
    }),
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  data () {
    return {
      loading: false,
      remoteComponent: null
    }
  },
  created () {
    this.getRemoteComponent()
  },
  mounted () {
    this.chartInit()
  },
  methods: {
    ...mapMutations('bigScreen', ['changeChartConfig']),
    // 尝试渲染远程文件或远程字符串
    getRemoteComponent () {
      this.loading = true
      // 1. 系统组件 通过配置获取
      if (this.config.customize.vueSysComponentDirName) {
        const remoteComponentList = [...innerRemoteComponents, ...getRemoteComponents()]
        // 获得系统组件最新的配置, 同步
        const config = remoteComponentList?.find(item => item.customize.vueSysComponentDirName === this.config.customize.vueSysComponentDirName)
        const vueFile = config?.customize?.vueFile
        const option = config?.option
        const setting = config?.setting
        // 同步配置
        this.synchConfig(option, setting)
        this.remoteComponent = vueFile
        this.loading = false
        return
      }
      // 2. 业务组件 通过请求获取
      if (this.config.customize.vueBizComponentCode) {
        getBizComponentInfo(this.config.customize.vueBizComponentCode).then(data => {
          const vueContent = data.vueContent
          const settingContent = data.settingContent
          if (!this.config?.option?.data) {
            this.resolveStrSetting(settingContent)
            this.config = this.buildOption(this.config, { success: false })
          }

          this.remoteComponent = remoteVueLoader('data:text/plain,' + encodeURIComponent(vueContent))
        }).finally(() => {
          this.loading = false
        })
      }
    },
    chartInit () {
      // key和code相等，说明是一进来刷新，调用/chart/data/list
      if (this.config.code === this.config.key || this.isPreview) {
        // 再根据数据更新组件
        this.updateChart()
      }
    },
    linkEvent (formData) {
      this.linkage(formData)
    },
    /**
     * 处理当前组件的字符串配置
     */
    resolveStrSetting (settingContent) {
      // eslint-disable-next-line prefer-const
      let option = {}
      // eslint-disable-next-line prefer-const
      let setting = []
      // eslint-disable-next-line prefer-const, no-unused-vars
      let title = []
      // eslint-disable-next-line prefer-const, no-unused-vars
      let data = []
      // eslint-disable-next-line prefer-const
      settingContent = settingContent.replaceAll('const ', '')
      // 去掉 export default及后面代码
      settingContent = settingContent.replace(/export default[\s\S]*/, '')
      eval(settingContent)
      this.config.option = {
        ...this.config.option,
        ...option
      }
      this.config.setting = setting
      return {
        option,
        setting
      }
    },
    /**
     * @description: 只更新数据
     */
    updateData () {
      this.updateChart()
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
          }
        })
      } else {
        this.updateChartData(this.config)
      }
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

      if (data?.success) {
        data = data.data
        config.option = option
        config.option.data = data
      }
      return config
    },
    // 同步配置
    synchConfig (option, setting) {
      // 对比this.config.setting 和 setting，进行合并，数据以this.config.option对象的value为准
      // TODO
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-remote-wrap {
  width: 100%;
}
</style>
