<template>
  <div
    style="width: 100%;height: 100%"
    class="bs-design-wrap"
  >
    <dv-border-box-2
      :id="'dataV' + config.code"
      :key="updateKey"
    >
    <div class="element" v-if="config.border&&config.border.type" style="box-sizing: content-box;font-size:40px;color:#fff;height:50px;margin:20px 0 0 20px">{{config.title}}</div>
    </dv-border-box-2>
  </div>
</template>
<script>
import DvBorderBox2 from '@jiaminghi/data-view/lib/components/borderBox2/src/main.vue'
import '@jiaminghi/data-view/lib/components/borderBox2/src/main.css'
export default {
  name: 'Border2',
  components: {
    DvBorderBox2
  },
  props: {
    // 卡片的属性
    config: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      updateKey: 0
    }
  },
  computed: {
    Data () {
      return JSON.parse(JSON.stringify(this.config))
    }
  },
  watch: {
    Data: {
      handler (newVal, oldVal) {
        this.$nextTick(() => {
          if ((newVal.w !== oldVal.w) || (newVal.h !== oldVal.h)) {
            this.updateKey = new Date().getTime()
          }
        })
      },
      deep: true
    }
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
