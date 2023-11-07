<template>
  <div
    style="width: 100%;height: 100%;object-fit: cover"
    class="bs-design-wrap"
    :id="'border'+ config.code"
    :style="{
      opacity: opacity,
      borderImageSlice:`${borderImageArray[0]} ${borderImageArray[1]} ${borderImageArray[2]} ${borderImageArray[3]} fill`,
      borderImageWidth:`${borderImageArray[0]}px ${borderImageArray[1]}px ${borderImageArray[2]}px ${borderImageArray[3]}px`,
    }"
  >
  </div>
</template>
<script>
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import { getFileUrl } from 'data-room-ui/js/utils/file'
export default {
  name: 'Border14',
  components: {
  },
  mixins: [refreshComponentMixin],
  props: {
    id:{
      type: String,
      default: 'name'
    },
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      borderWidth: 0,
      borderHeight: 0
    }
  },
  computed: {
    url () {
      return require('data-room-ui/BorderComponents/GcBorder16/component.png')
    },
    opacity () {
      return this.config.border.opacity || 100
    },
    borderImageArray () {
      const borderArr = this.config.border.borderArray ? this.config.border.borderArray
        : [10, 10, 10, 10]
      const arr = []
      arr[0] = borderArr[0] * this.borderHeight / 100
      arr[1] = borderArr[1] * this.borderWidth / 100
      arr[2] = borderArr[2] * this.borderHeight / 100
      arr[3] = borderArr[3] * this.borderWidth / 100
      return arr
    }
  },
  watch: {
    'config.border.imgUrl': {
      handler (val) {
        if(val){
          let ur=val
          if(!val.startsWith('http')){
            ur = getFileUrl(val)
          }
          const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${ur})`
        }else{
          const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${this.url})`
        }
      }
    }
  },
  mounted () {
    // 获取边框大小
    const element = document.querySelector('.bs-design-wrap')
    this.borderWidth = element.offsetWidth
    this.borderHeight = element.offsetHeight
    if(this.config.border.imgUrl){
      let ur=this.config.border.imgUrl
      if(!this.config.border.imgUrl.startsWith('http')){
            ur = getFileUrl(this.config.border.imgUrl)
          }
      const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${ur})`
    }else{
      const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${this.url})`
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  // border-image-source:url(component.png);
  width: 100%;
  height: 100%;
  position: absolute;
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
