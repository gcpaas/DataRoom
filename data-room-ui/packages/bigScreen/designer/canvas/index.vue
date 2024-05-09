<template>
  <div
    id="canvasWrap"
    class="dataroom-bigscreen-canvas-wrap"
    tabindex="1000"
    @click="clickCanvas"
  >
    <div
      id="minimap"
      class="minimap"
    >
      <div
        v-show="mapShow"
        id="selectWin"
        class="selectWin"
      >
        <div
          id="selectionWin"
          class="selectionWin"
        />
      </div>
    </div>
    <SketchDesignRuler
      ref="Rules"
      :width="3000"
      :height="3000"
      :page-width="pageConfig.w"
      :page-height="pageConfig.h"
      @changeStart="changeStart"
    >
      <Render
        ref="render"
        @dragover.prevent
      />
    </SketchDesignRuler>
    <Footer class="footer-wrap" />
  </div>
</template>

<script>
const Render = () => import(/* webpackChunkName: "Render" */ './Render/index.vue')
const SketchDesignRuler = () => import(/* webpackChunkName: "SketchDesignRuler" */ '@gcpaas/data-room-ui/packages/bigScreen/designer/canvas/RulerTool/SketchRuler.vue')
const Footer = () => import(/* webpackChunkName: "Footer" */ '../footer/index.vue')
export default {
  name: 'Canvas',
  components: {
    Render,
    SketchDesignRuler,
    Footer
  },
  props: {
    code: {
      type: String,
      default: ''
    },
    headerShow: {
      type: Boolean,
      default: true
    },
    height: {
      type: String,
      default: 'calc(100vh - 40px)'
    }
  },
  data () {
    return {
      mouseInDesign: false,
      mapShow: true, // 小地图显示与否
      rightVisiable: false,
      pageInfoVisiable: false,
      ruleStartX: 100,
      ruleStartY: 100,
      zoomList: [
        {
          label: '自适应',
          value: 'auto'
        },
        {
          label: '100%',
          value: 100
        },
        {
          label: '80%',
          value: 80
        },
        {
          label: '50%',
          value: 50
        },
        {
          label: '20%',
          value: 20
        }
      ]
    }
  },
  inject: ['canvasInst'],
  watch: {
    fitZoom (zoom) {
      this.zoomList[0] = {
        label: `自适应(${zoom}%)`,
        value: zoom
      }
    }
  },
  computed: {
    scale () {
      return this.canvasInst.zoom / 100
    },
    fitZoom () {
      return this.canvasInst.fitZoom
    },
    zoom () {
      return this.canvasInst.zoom
    },
    pageConfig () {
      return this.canvasInst.pageConfig
    },
    pageCode () {
      return this.code || this.$route.query.code
    },
    offset () {
      return {
        x: 220 + 50 - this.ruleStartX,
        y: 55 + 50 - this.ruleStartY
      }
    }
  },
  created () {
  },
  mounted () {
  },
  beforeDestroy () {
  },
  methods: {
    // 画布的点击事件
    clickCanvas (e) {
      const clickedElement = e.target
      if (['canvas', 'container'].includes(clickedElement.id)) {
        // 点击了画布空白处
        // this.canvasInst.openRightPanel()
        this.canvasInst.changeIsScreenSet(true)
      }
    },
    // 控制小地图显示与隐藏
    showMinimap () {
      this.mapShow = !this.mapShow
    },
    changeStart ({ x, y }) {
      this.ruleStartX = x
      this.ruleStartY = y
    }
  }
}
</script>

<style scoped lang="scss">
.dataroom-bigscreen-canvas-wrap {
  height: calc(100vh - 40px);
  flex: 1;
  position: relative;
  padding: 8px 0 0 8px;
  box-sizing: border-box;

  .minimap{
    position:absolute;
    left: 38px;
    bottom: 48px;
    z-index:2000;
  }

  .minimap .selectWin{
    background-color: #eeeeee;
    height: 100px;
    width: 150px;
    position: relative;
  }

  .minimap .selectionWin{
    position: absolute;
    left: 0px;
    top: 0px;
    width: 30px;
    height: 30px;
    background-color: #007aff20;
    border: 1px solid #007aff;
    opacity: 0.5;
    cursor: move;
  }
}

</style>
