<template>
  <div
    class="dataroom-dashboard-canvas-wrap"
    tabindex="1000"
    @click="clickCanvas"
  >
    <Render
      ref="render"
      @dragover.prevent
      @openRightPanel="openRightPanel"
    />
  </div>
</template>

<script>
const Render = () => import('./Render/index.vue')
export default {
  name: 'Canvas',
  components: {
    Render,
  },
  props: {
    code: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      rightVisiable: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    chartList () {
      return this.canvasInst.chartList
    }
  },
  created () {
  },
  mounted () {
  },
  methods: {
    // 画布的点击事件
    clickCanvas (e) {
      const clickedElement = e.target
      if (['canvas', 'container'].includes(clickedElement.id)) {
        // 点击了画布空白处
        this.canvasInst.changeIsScreenSet(true)
      }
    },
    // 点击当前组件时打开右侧面板
    openRightPanel (config) {
      this.$emit('openRightPanel', config)
    },
    updateRightVisiable (visiable) {
      this.rightVisiable = visiable
    }
  }
}
</script>

<style scoped lang="scss">
.dataroom-dashboard-canvas-wrap {
  height: 100%;
  flex: 1;
  position: relative;
}

</style>
