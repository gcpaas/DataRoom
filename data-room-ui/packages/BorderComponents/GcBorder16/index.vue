<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
    :style="{
      'background-image-source':`url(${img})`,
      border:'100px solid #000',
      borderImageSlice:'100 100 100 100',
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
    img(){
      return 'component.png'
    }
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
