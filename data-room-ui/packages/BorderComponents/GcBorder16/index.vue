<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
    :id="'border'+ config.code"
    :style="{
      borderImageSlice:'100 100 100 100 fill',
      borderImageWidth:'100px 100px 100px 100px',
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
  },
  watch: {
  },
  mounted () {
    const a =document.getElementById('border'+ this.config.code)
    // a.style['border-image-source']=`url(http://127.0.0.1:8081//bigScreenServer/static/1704043211902484481.png)`
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
