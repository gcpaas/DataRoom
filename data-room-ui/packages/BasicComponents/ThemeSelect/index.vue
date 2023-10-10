<template>
  <div
    class="bs-design-wrap theme-switcher-wrap"
    :class="`bs-theme-switcher-${customTheme}`"
  >
    <el-dropdown
      trigger="click"
      @command="handleChange"
    >
      <div
        class="el-dropdown-link content-box"
        :style="{'font-size': config.customize.fontSize +'px','font-weight': +config.customize.fontWeight,'background-image': `-webkit-linear-gradient(${config.customize.color})`}"
      >
        主题切换
      </div>
      <el-dropdown-menu
        slot="dropdown"
        class="theme-dropdown-menu"
      >
        <el-dropdown-item command="light">
          明亮主题
        </el-dropdown-item>
        <el-dropdown-item command="dark">
          暗黑主题
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
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
      this.pageInfo.pageConfig.customTheme = val
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
  display: flex;
  align-items: center;
  justify-content: center;
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
// 自定义dropdown的样式
.theme-dropdown-menu{
  background-color: var(--bs-background-2)!important;
  border: 1px solid var(--bs-border-1);
  ::v-deep  .popper__arrow{
    //background-color: var(--bs-background-2)!important;
    background-color: transparent!important;
    border-bottom-color:transparent!important;
    &:after{
      border-bottom-color: var(--bs-background-2)!important;
    }
  }
  ::v-deep  .el-dropdown-menu__item{
    background-color: var(--bs-background-2)!important;
    color: rgb(188, 201, 212)!important;
    &:hover {
      color: var(--bs-el-color-primary) !important;
      background-color: var(--bs-el-background-3) !important;
    }
  }

}
::v-deep .el-input__inner,
::v-deep .el-color-picker__color-inner,
::v-deep .el-input-number--mini,
::v-deep .el-textarea__inner,
::v-deep .el-input-group__append {
  //background: var(--bs-el-background-1);
  //color: var(--bs-el-text);
  //border: 0 !important;
  //width: 100px;
}
</style>
