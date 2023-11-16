<template>
  <div
    v-loading="loading"
    class="bs-remote-preview"
    element-loading-text="远程组件加载中..."
  >
    <div class="remote-preview-inner-wrap">
      <component
        :is="remoteComponent"
        :config="config"
      />
    </div>
  </div>
</template>
<script>
import remoteVueLoader from 'remote-vue-loader'
import * as _echarts from 'echarts'
import * as g2Plot from '@antv/g2plot'
import { getBizComponentInfo } from 'data-room-ui/js/api/bigScreenApi'
import innerRemoteComponents, { getRemoteComponents } from 'data-room-ui/RemoteComponents/remoteComponentsList'
export default {
  name: 'BsComponentPreview',
  props: {
    vueContent: {
      type: String,
      default: ''
    },
    settingContent: {
      type: String,
      default: ''
    }
  },
  computed: {
    config: {
      get () {
        // eslint-disable-next-line prefer-const
        let option = {}
        // eslint-disable-next-line prefer-const
        let setting = []
        // eslint-disable-next-line prefer-const, no-unused-vars
        let title = ''
        // eslint-disable-next-line prefer-const, no-unused-vars
        let data = []
        // eslint-disable-next-line prefer-const, no-unused-vars
        let optionHandler = ''
        const g2Plots = g2Plot
        const echarts = _echarts
        // eslint-disable-next-line prefer-const
        let settingContent = this.settingContentInner?.replaceAll('const ', '')
        // 去掉 export default及后面代码
        settingContent = settingContent?.replace(/export default[\s\S]*/, '')
        eval(settingContent)
        return {
          title,
          option,
          setting,
          echarts,
          g2Plots,
          optionHandler
        }
      },
      set (val) {}
    }
  },
  watch: {
    settingContentInner () {
      this.getRemoteComponent()
    },
    vueContentInner () {
      this.getRemoteComponent()
    },
    vueContent (newVal) {
      this.vueContentInner = newVal
    },
    settingContent (newVal) {
      this.settingContentInner = newVal
    }
  },
  data () {
    return {
      loading: false,
      remoteComponent: null,
      vueContentInner: this.vueContent,
      settingContentInner: this.settingContent?.replaceAll('const ', '')
    }
  },
  created () {
    this.viewComponent()
  },
  methods: {
    async viewComponent () {
      // 如果有编码，则获取组件信息
      if (this.$route.query?.code) {
        const data = await getBizComponentInfo(this.$route.query?.code)
        this.vueContentInner = data.vueContent
        this.settingContentInner = data.settingContent
        this.config = this.dataFormatting(this.config)
        this.remoteComponent = remoteVueLoader('data:text/plain,' + encodeURIComponent(this.vueContentInner))
        this.loading = false
      }

      // 如果有组件的dirName，则获取系统组件信息
      if (this.$route.query?.dirName) {
        const dirName = this.$route.query?.dirName
        const remoteComponentList = [...innerRemoteComponents, ...getRemoteComponents()]
        const config = remoteComponentList?.find(item => item.customize.vueSysComponentDirName === dirName)
        this.config.option = config?.option
        this.config.title = config?.title
        const vueFile = config.customize?.vueFile
        this.remoteComponent = vueFile
        this.loading = false
      }
    },
    // 尝试渲染远程文件或远程字符串
    getRemoteComponent () {
      this.loading = true
      this.config = this.dataFormatting(this.config, { success: false })
      this.remoteComponent = remoteVueLoader('data:text/plain,' + encodeURIComponent(this.vueContentInner))
      this.loading = false
    },
    /**
     * 组件的配置
     * @returns {Promise<unknown>}
     */
    // 将config.setting的配置转化为option里的配置，这里之所以将转化的方法提出来，是因为在改变维度指标和样式的时候都需要转化
    transformSettingToOption (config, type) {
      let option = null
      config.setting.forEach(set => {
        if (set.optionField) {
          const optionField = set.optionField.split('.')
          option = config.option
          optionField.forEach((field, index) => {
            if (index === optionField.length - 1) {
              // 数据配置时，必须有值才更新
              if ((set.tabName === type && type === 'data' && set.value) || (set.tabName === type && type === 'custom')) {
                option[field] = set.value
              }
            } else {
              // 如果没有这个属性，则创建该属性，并赋值为空对值
              if (!option[field]) {
                option[field] = {}
              }
              option = option[field]
            }
          })
        }
      })
      return config
    },
    dataFormatting (config, data) {
      // 数据返回成功则赋值
      if (data?.success) {
        data = data.data
        config = this.transformSettingToOption(config, 'data')
        // 获取到后端返回的数据，有则赋值
        // const option = config.option
        // const setting = config.setting
        if (config.dataHandler) {
          try {
            // 此处函数处理data
            eval(config.dataHandler)
          } catch (e) {
            console.error(e)
          }
        }
        config.option.data = data
      } else {
        // 数据返回失败则赋前端的模拟数据
        config.option.data = this.plotList?.find(plot => plot.name === config.name)?.option?.data || config.option.data
      }
      return config
    },
    // 组件的样式改变，返回改变后的config
    changeStyle (config) {
      config = { ...this.config, ...config }
      config = this.transformSettingToOption(config, 'custom')
      // 这里定义了option和setting是为了保证在执行eval时,optionHandler、dataHandler里面可能会用到，
      // const option = config.option
      // const setting = config.setting
      if (this.config.optionHandler) {
        try {
          // 此处函数处理config
          eval(this.config.optionHandler)
        } catch (e) {
          console.error(e)
        }
      }
      if (this.chart) {
        this.chart.update(config.option)
      }
      this.changeChartConfig(config)
      return config
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-remote-preview {
  position: absolute;
  min-height: 100%;
  min-width: 100%;
  overflow: hidden;
  box-sizing: border-box;

  .remote-preview-inner-wrap {
    position: absolute;
    height: calc(100% - 40px);
    width: 100%;
    overflow: auto;
    padding: 5px 20px;
    background-color: var(--bs-background-1);
  }
}
</style>
