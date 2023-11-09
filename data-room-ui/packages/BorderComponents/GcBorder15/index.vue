<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
    <div
      :key="updateKey"
      class="custom-border-box"
      :style="`
        border-top-left-radius: ${radiusLeftTop}px;
        border-top-right-radius: ${radiusRightTop}px;
        border-bottom-left-radius: ${radiusLeftBottom}px;
        border-bottom-right-radius: ${radiusRightBottom}px;
        border: ${width}px solid ${color};
        background-image: linear-gradient(${gradientDirection}, ${
          gradientColor0 ? gradientColor0 : gradientColor1
        } , ${gradientColor1 ? gradientColor1 : gradientColor0})
      `"
    >
    <div class="element"
      v-if="config.border.isTitle"
      :style="`
      line-height:${config.border.titleHeight}px;
      height:${config.border.titleHeight};
      border-bottom:${fontBottomColor?3:0}px solid ${fontBottomColor};
      background-image: linear-gradient(${gradientDirection}, ${
          fontGradientColor0 ? fontGradientColor0 : fontGradientColor1
        } , ${fontGradientColor1 ? fontGradientColor1 : fontGradientColor0})
      `"
      >
      <span
      :style="`
      width:100%;
      padding:0 0 0 20px;
      color:${fontColor};
      font-size:${config.border.fontSize}px;
      border-left:${fontLeftWidth}px solid ${fontLeftColor};
      `"
      >
        {{config.title}}
      </span>
      </div>
    </div>
  </div>
</template>
<script>
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
export default {
  name: 'Border14',
  components: {
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
    }
  },
  computed: {
     fontColor () {
      return this.config.border.fontColor ? this.config.border.fontColor
        : '#fff'
    },
     color () {
      return this.config.border.borderColor || ''
    },
    width () {
      return this.config.border.borderWidth!=null?this.config.border.borderWidth : 0
    },
    gradientColor0 () {
      if(this.config.border.gradientColor&&this.config.border.gradientColor.length){
        return this.config.border.gradientColor[0] ||this.config.border.gradientColor[1]
      }else{
        return 'transparent'
      }
    },
    gradientColor1 () {
      if(this.config.border.gradientColor&&this.config.border.gradientColor.length){
       return this.config.border.gradientColor[1] ||this.config.border.gradientColor[0]
      }else{
        return 'transparent'
      }
    },
    fontGradientColor0 () {
      if(this.config.border.fontGradientColor&&this.config.border.fontGradientColor.length){
       return this.config.border.fontGradientColor[0] ||this.config.border.fontGradientColor[1]
      }else{
        return 'transparent'
      }
    },
    fontGradientColor1 () {
      if(this.config.border.fontGradientColor&&this.config.border.fontGradientColor.length){
        return this.config.border.fontGradientColor[1]||this.config.border.fontGradientColor[0]
      }else{
        return 'transparent'
      }
    },
    fontLeftColor(){
      return this.config.border.fontLeftColor || ''
    },
    fontBottomColor(){
      return this.config.border.fontBottomColor || ''
    },
    fontLeftWidth(){
      return (this.config.border.fontLeftWidth || String(this.config.border.fontLeftWidth) === '0') ? this.config.border.fontLeftWidth : 6
    },
    radiusLeftTop () {
      return this.config.border.radiusLeftTop || 2
    },
    radiusRightTop () {
      return this.config.border.radiusRightTop || 2
    },
    radiusLeftBottom () {
      return this.config.border.radiusLeftBottom || 2
    },
    radiusRightBottom () {
      return this.config.border.radiusRightBottom || 2
    },
    gradientDirection () {
      return this.config.border.gradientDirection || 'to right'
    },
  },
  watch: {
  },
  mounted () {
  },
  methods: {
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
  box-shadow: 0px 0px 0px 0px !important;
  box-sizing: border-box;
  .custom-border-box {
    width: 100%;
    height: 100%;
  }
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
