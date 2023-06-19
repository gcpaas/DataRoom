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
      borderBgId: `borderBg${this.config.code}`
    }
  },
  computed: {
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
    }
  },
  mounted () {
    if (document.querySelector(`#dataV${this.config.code}`)) {
      const borderElement = document.querySelector(`#dataV${this.config.code}`).querySelector('.border') || document.querySelector(`#dataV${this.config.code}`)?.querySelector('.dv-border-svg-container')
      if (borderElement) {
        let isBorder7 = false
        borderElement.childNodes.forEach(e => {
          if (e._prevClass === 'dv-bb7-line-width-2') {
            isBorder7 = true
          }
        })
        borderElement.style.opacity = (this.config.customize.opacity / 100)
        if (this.colorType === 'gradient') {
          if (!isBorder7) {
            let gradientDirection = ''
            switch (this.config.customize.gradientDirection) {
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
                      <stop offset="0%" stop-color="${this.config.customize.gradientColor0}" />
                      <stop offset="100%" stop-color="${this.config.customize.gradientColor1}" />
                    </linearGradient>
              </defs>`
            )
          } else {
            borderElement.style.background = `linear-gradient(${this.config.customize.gradientDirection},${this.config.customize.gradientColor0}, ${this.config.customize.gradientColor1})`
            isBorder7 = false
          }
        }
      }
    }
  }
}

export { dataVMixins }
