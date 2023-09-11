<template>
  <div
    class="bs-design-wrap theme-switcher-wrap"
    :class="`bs-theme-switcher-${customTheme}`"
  >
    <!--    <div class="label-box">-->
    <!--      切换主题-->
    <!--    </div>-->
    <el-radio-group
      v-model="pageInfo.pageConfig.customTheme"
      size="medium "
      class="theme-radio"
      @change="handleChange"
    >
      <el-radio
        label="light"
        style="color: red!important;"
        :style="{color:config.customize.inactiveColor}"
      >
        明亮主题
      </el-radio>
      <el-radio
        label="dark"
        :style="{color:config.customize.inactiveColor}"
      >
        暗黑主题
      </el-radio>
    </el-radio-group>
  </div>
</template>
<script>
import paramsMixins from 'data-room-ui/js/mixins/paramsMixins'
import { themeToSetting } from 'data-room-ui/js/utils/themeFormatting'
import { mapMutations, mapState } from 'vuex'
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'

export default {
  name: 'ThemeSwitcher',
  components: {},
  mixins: [paramsMixins, refreshComponentMixin],
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
    'config.customize.activeColor': {
      handler (val) {
        document.documentElement.style.setProperty('--radio-label-color', val)
      },
      immediate: true
    }
  },
  mounted () {
    document.documentElement.style.setProperty('--radio-label-color', this.config.customize.activeColor)
  },
  methods: {
    ...mapMutations({
      changePageInfo: 'bigScreen/changePageInfo'
    }),
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
        const htmlStr = `<span>当前已切换为<strong>${themeLabel}</strong>主题，涉及到颜色的配置仅针对当前主题生效</span>`
        this.$notify({
          title: '注意',
          dangerouslyUseHTMLString: true,
          message: htmlStr,
          customClass: 'ds-el-notify',
          duration: 5000,
          type: 'warning'
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap{
  width: 100%;
}
.content-box{
  text-align: center;
  /* 将背景设为渐变 */
  /*background-image: -webkit-linear-gradient(left, #6294F7, #C85D14);*/
  /* 规定背景绘制区域 */
  -webkit-background-clip: text;
  /* 将文字隐藏 */
  -webkit-text-fill-color: transparent;
}
</style>
