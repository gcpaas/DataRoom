<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
     <dv-border-box-13
      :id="'dataV' + config.code"
      :background-color="(config.border.gradientColor&&(config.border.gradientColor[0]||config.border.gradientColor[1]))?`url(#${borderBgId})`:'transparent'"
      :color='borderColor'
      :key="updateKey"
    >
    <div class="element"
    v-if="config.border.isTitle"
    :style="`
    color:${color};
    font-size:${config.border.fontSize}px;
    line-height:${config.border.titleHeight}px;
    height:${config.border.titleHeight};
    padding:0 0 0 20px`"
    >
    {{config.title}}</div>
    </dv-border-box-13>
  </div>
</template>
<script>
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import DvBorderBox13 from '@jiaminghi/data-view/lib/components/borderBox13/src/main.vue'
import '@jiaminghi/data-view/lib/components/borderBox13/src/main.css'
export default {
  name: 'Border13',
  components: {
    DvBorderBox13
  },
  mixins: [refreshComponentMixin],
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
    borderColor () {
      return this.config.border.borderMainColor ||
        this.config.border.borderSecondaryColor
        ? [
            this.config.border.borderMainColor,
            this.config.border.borderSecondaryColor
          ]
        : null
    },
    color () {
      return this.config.border.fontColor ? this.config.border.fontColor
        : '#fff'
    },
  },
  watch: {
    updateKey:{
      handler (val) {
        this.$nextTick(()=>{
          this.changeColor()
        })
      },
      deep: true
    },
    'config.border.gradientColor':{
         handler (val) {
          this.changeColor()
      },immediate: true
    },
    'config.border.gradientDirection':{
         handler (val) {
          this.changeColor()
      },immediate: true
    },
    'config.border.opacity':{
         handler (val) {
          this.changeColor()
      },immediate: true
    }
  },
  mounted () {
    this.changeColor()
  },
  methods: {
    changeColor(){
      if(!this.config.border.opacity){
              this.config.border.opacity=100
            }
      if(!this.config.border.gradientColor) return
      if (document.querySelector(`#dataV${this.config.code}`)) {
          const borderElement = document.querySelector(`#dataV${this.config.code}`).querySelector('.border') || document.querySelector(`#dataV${this.config.code}`)?.querySelector('.dv-border-svg-container')
          if (borderElement) {
              borderElement.style.opacity = (this.config.border.opacity / 100)
              let gradientDirection = ''
              switch (this.config.border.gradientDirection) {
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
                        <stop offset="0%" stop-color="${this.config.border.gradientColor[0]?this.config.border.gradientColor[0]:this.config.border.gradientColor[1]}" />
                        <stop offset="100%" stop-color="${this.config.border.gradientColor[1]?this.config.border.gradientColor[1]:this.config.border.gradientColor[0]}" />
                      </linearGradient>
                </defs>`
              )
          }
        }
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  position: absolute;
  width: 100%;
  height: 100%;
  // padding: 0 16px;
  background-color: transparent;
  border-radius: 4px;
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

/*滚动条样式*/
::v-deep ::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}

::v-deep ::-webkit-scrollbar-thumb {
  background: #dddddd !important;
  border-radius: 10px;
}
</style>
