<template>
  <div
    class="bs-design-wrap theme-switcher-wrap"
    :class="`bs-theme-switcher-${customTheme}`"
  >
    <div class="label-box">
      切换主题
    </div>
    <el-radio-group
      v-model="pageInfo.pageConfig.customTheme"
      size="medium "
      class="theme-radio"
      @change="handleChange"
    >
      <el-radio
        border
        label="light"
      >
        明亮
      </el-radio>
      <el-radio
        border
        label="dark"
      >
        暗黑
      </el-radio>
    </el-radio-group>
  </div>
</template>
<script>
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { themeToSetting } from 'data-room-ui/js/utils/themeFormatting'
import { mapMutations, mapState } from 'vuex'

export default {
  name: 'ThemeSwitcher',
  components: {},
  mixins: [paramsMixins],
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    ...mapState({
      pageInfo: (state) => state.bigScreen.pageInfo
    }),
    isPreview () {
      return (this.$route.path === window?.BS_CONFIG?.routers?.previewUrl) || (this.$route.path === '/big-screen/preview')
    }
  },
  data () {
    return {
    }
  },
  watch: {
  },
  mounted () {
  },
  methods: {
    ...mapMutations({
      changePageInfo: 'bigScreen/changePageInfo'
    }),
    // 由于静态组件没有混入公共函数，所以需要定义一个changeStyle方法，以免报错
    changeStyle (config) {
    },
    // 点击切换主题
    handleChange (val) {
      const pageInfo = this.pageInfo
      pageInfo.chartList = themeToSetting(pageInfo.chartList, val)
      this.changePageInfo(pageInfo)
      pageInfo.chartList.forEach(chart => {
        if (chart.type === 'remoteComponent') {
          this.$emit('styleHandler', chart)
        }
      })
      if (!this.isPreview) {
        const themeLabel = val === 'light' ? '明亮' : '暗黑'
        const htmlStr = `<span>当前已切换到<strong>${themeLabel}</strong>主题，颜色设置针对当前主题生效</span>`
        this.$notify({
          title: '注意',
          dangerouslyUseHTMLString: true,
          message: htmlStr,
          customClass: 'ds-el-notify',
          type: 'warning'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .bs-design-wrap{
    width: 100%;;
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    color: #fff;
    .label-box{
      padding: 10px;
      margin-right: 10px;
      font-size: 14px;
    }
    .el-radio.is-checked {
      color: #00a0e9; /* 修改激活状态下的字体颜色 */
    }

    /* 修改未激活状态下的字体颜色 */
    .el-radio:not(.is-checked) {
      color: #fff; /* 修改未激活状态下的字体颜色 */
    }
  }
</style>
