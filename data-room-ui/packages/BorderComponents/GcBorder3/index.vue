<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
     <dv-border-box-3
      :id="'dataV' + config.code"
      :background-color="backgroundColor"
      :key="updateKey"
    >
    <div class="element"
    :style="`
    color:${color};
    font-size:${config.border.fontSize}px;
    line-height:${config.border.titleHeight}px;
    height:${config.border.titleHeight};
    padding:0 0 0 20px`"
    >
    {{config.title}}</div>
    </dv-border-box-3>
  </div>
</template>
<script>
import { refreshComponentMixin } from 'data-room-ui/js/mixins/refreshComponent'
import DvBorderBox3 from '@jiaminghi/data-view/lib/components/borderBox3/src/main.vue'
import '@jiaminghi/data-view/lib/components/borderBox3/src/main.css'
export default {
  name: 'Border2',
  components: {
    DvBorderBox3
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
    color () {
      return this.config.border.fontColor ? this.config.border.fontColor
        : '#fff'
    },
    backgroundColor () {
      return this.config.border.backgroundColor
        ? this.config.border.backgroundColor
        : 'transparent'
    },
    // colorType () {
    //   return this.config.border.colorType
    // }
  },
  watch: {
  },
  mounted () {},
  methods: {}
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
