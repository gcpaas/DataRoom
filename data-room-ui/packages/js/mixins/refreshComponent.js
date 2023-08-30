import { mapMutations, mapState } from 'vuex'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from "lodash/cloneDeep";
const refreshComponentMixin = {
  data () {
    return {
      updateKey: 0
    }
  },
  computed: {
    ...mapState({
      customTheme: state => state.bigScreen.pageInfo.pageConfig.customTheme,
      activeCode: state => state.bigScreen.activeCode
    }),
    Data () {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    Data: {
      handler (newVal, oldVal) {
        this.$nextTick(() => {
          if ((newVal.w !== oldVal.w) || (newVal.h !== oldVal.h)) {
            this.updateKey = new Date().getTime()
          }
        })
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig'
    }),
    // 修改样式
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
    }
  }
}

export { refreshComponentMixin }
