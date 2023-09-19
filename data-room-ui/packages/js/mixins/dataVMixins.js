import { mapMutations, mapState } from 'vuex'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import cloneDeep from 'lodash/cloneDeep'
const dataVMixins = {
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      updateKey: 0,
      borderBgId: null
    }
  },
  computed: {
    ...mapState({
      customTheme: state => state.bigScreen.pageInfo.pageConfig.customTheme,
      activeCode: state => state.bigScreen.activeCode
    }),
    code () {
      return this.config.code
    },
    color () {
      return this.config.customize.borderMainColor ||
        this.config.customize.borderSecondaryColor
        ? [
            this.config.customize.borderMainColor,
            this.config.customize.borderSecondaryColor
          ]
        : null
    },
    backgroundColor () {
      return this.config.customize.backgroundColor
        ? this.config.customize.backgroundColor
        : 'transparent'
    },
    colorType () {
      return this.config.customize.colorType
    },
    Data () {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    config: {
      handler: function (val) {
        if (val && val.customize && val.customize.colorType) {
          this.changeBorderStyle(this.config)
          if (val.customize.colorType === 'single') {
            this.borderBgId = null
            this.$nextTick(() => {
              this.updateKey = new Date().getTime()
            })
          } else {
            this.borderBgId = `borderBg${this.config.code}`
          }
        }
      },
      deep: true
    },
    Data: {
      handler (newVal, oldVal) {
        this.$nextTick(() => {
          if ((newVal.w !== oldVal.w) || (newVal.h !== oldVal.h)) {
            this.$nextTick(() => {
              this.updateKey = new Date().getTime()
            })
          }
        })
      },
      deep: true
    }
  },
  mounted () {
    this.changeBorderStyle(this.config)
  },
  methods: {
    ...mapMutations({
      changeChartConfig: 'bigScreen/changeChartConfig',
      changeActiveItemConfig: 'bigScreen/changeActiveItemConfig'
    }),
    changeStyle (config) {
      config = { ...this.config, ...config }
      // 样式改变时更新主题配置
      config.theme = settingToTheme(cloneDeep(config), this.customTheme)
      this.changeChartConfig(config)
      if (config.code === this.activeCode) {
        this.changeActiveItemConfig(config)
      }
      this.changeBorderStyle(config)
    },
    changeBorderStyle (config) {
      this.borderBgId = `borderBg${config.code}`
      if (document.querySelector(`#dataV${config.code}`)) {
        const borderElement = document.querySelector(`#dataV${config.code}`).querySelector('.border') || document.querySelector(`#dataV${config.code}`)?.querySelector('.dv-border-svg-container')
        if (borderElement) {
          let isBorder7 = false
          borderElement.childNodes.forEach(e => {
            if (e._prevClass === 'dv-bb7-line-width-2') {
              isBorder7 = true
            }
          })
          borderElement.style.opacity = (config.customize.opacity / 100)
          if (this.colorType === 'gradient') {
            if (!isBorder7) {
              let gradientDirection = ''
              switch (config.customize.gradientDirection) {
                case 'to right':
                  gradientDirection = 'x1="0%" y1="0%" x2="100%" y2="0%"'
                  break
                case 'to left':
                  gradientDirection = 'x1="100%" y1="0%" x2="0%" y2="0%"'
                  break
                case 'to bottom':
                  gradientDirection = 'x1="0%" y1="0%" x2="0%" y2="100%"'
                  break
                case 'to top':
                  gradientDirection = 'x1="0%" y1="100%" x2="0%" y2="0%"'
                  break
                case 'to bottom right':
                  gradientDirection = 'x1="0%" y1="0%" x2="100%" y2="100%"'
                  break
                case 'to bottom left':
                  gradientDirection = 'x1="100%" y1="0%" x2="0%" y2="100%"'
                  break
                case 'to top right':
                  gradientDirection = 'x1="0%" y1="100%" x2="100%" y2="0%"'
                  break
                case 'to top left':
                  gradientDirection = 'x1="100%" y1="100%" x2="0%" y2="0%"'
                  break
                default:
                  gradientDirection = 'x1="0%" y1="0%" x2="100%" y2="0%"'
                  break
              }
              // 在目标元素内的第一个位置插入 <defs> 和其中的内容
              borderElement.insertAdjacentHTML(
                'afterbegin',
                `<defs>
                      <linearGradient id="${this.borderBgId}" ${gradientDirection}>
                        <stop offset="0%" stop-color="${config.customize.gradientColor0}" />
                        <stop offset="100%" stop-color="${config.customize.gradientColor1}" />
                      </linearGradient>
                </defs>`
              )
            } else {
              borderElement.style.background = `linear-gradient(${config.customize.gradientDirection},${config.customize.gradientColor0}, ${config.customize.gradientColor1})`
              isBorder7 = false
            }
          }
        }
      }
    }
  }
}

export { dataVMixins }
