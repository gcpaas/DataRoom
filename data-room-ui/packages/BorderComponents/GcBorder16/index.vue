<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
    :id="'border'+ config.code"
    :style="{
      borderImageSlice:`${borderArray[0]} ${borderArray[1]} ${borderArray[2]} ${borderArray[3]} fill`,
      borderImageWidth:`${borderArray[0]}px ${borderArray[1]}px ${borderArray[2]}px ${borderArray[3]}px`,
    }"
  >
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
    }
  },
  computed: {
    borderArray(){
      return this.config.border.borderArray ? this.config.border.borderArray
        : [100,100,100,100]
    }
  },
  watch: {
    'config.border.imgUrl': {
      handler (val) {
        if(val){
          const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${val})`
        }
      }
    }
  },
  mounted () {
    if(this.config.border.imgUrl){
      const a =document.getElementById('border'+ this.config.code)
          a.style['border-image-source']=`url(${this.config.border.imgUrl})`
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.bs-design-wrap {
  border-image-source:url(component.png);
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
