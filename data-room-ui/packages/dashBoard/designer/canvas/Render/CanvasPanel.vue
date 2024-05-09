<template>
  <div
    id="container"
    class="dataroom-dashboard-container-wrap"
  >
    <grid-layout
      id="container"
      :layout.sync="chartList"
      :col-num="colNum"
      :row-height="30"
      :is-draggable="draggable"
      :is-resizable="resizable"
      :vertical-compact="true"
      :use-css-transforms="true"
      :prevent-collision="true"
      :style="{
        backgroundColor: pageConfig.bgColor,
        opacity: pageConfig.opacity,
        height:'100%'
      }"
    >
      <grid-item
        v-for="item in chartList"
        :key="item.code"
        :static="item.static"
        :x.sync="item.x"
        :y.sync="item.y"
        :w.sync="item.w"
        :h.sync="item.h"
        :i="item.code"
        @resize="resizeEvent"
        @move="moveEvent"
        @resized="resizedEvent"
        @moved="movedEvent"
      >
        <Configuration
          :config="item"
          @openRightPanel="openRightPanel"
        >
          <render-card
            :ref="'renderCard' + item.code"
            :config="item"
          />
        </Configuration>
      </grid-item>
    </grid-layout>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'

const RenderCard = () => import('./RenderCard.vue')
const Configuration = () => import('./Configuration.vue')

export default {
  components: {
    Configuration,
    RenderCard,
    GridLayout,
    GridItem
  },
  data () {
    return {
      draggable: true,
      resizable: true,
      colNum: 12,
      index: 0
    }
  },
  inject: ['canvasInst'],
  computed: {
    chartList () {
      return this.canvasInst.chartList
    },
    pageConfig () {
      return this.canvasInst.pageConfig
    }
  },
  mounted () {
  },
  methods: {
    // 点击当前组件时打开右侧面板
    openRightPanel (config) {
      this.$emit('openRightPanel', config)
    },
    moveEvent (i, newX, newY) {
      const chart = this.chartList.find((item) => item.code === i)
      if (chart) {
        chart.x = newX
        chart.y = newY
        this.canvasInst.updateChartConfig(chart)
      }
    },
    movedEvent (i, newX, newY) {
      const chart = this.chartList.find((item) => item.code === i)
      if (chart) {
        chart.x = newX
        chart.y = newY
        this.canvasInst.updateChartConfig(chart)
      }
    },
    resizeEvent (i, newH, newW, newHPx, newWPx) {
      const chart = this.chartList.find((item) => item.code === i)
      if (chart) {
        chart.w = newW
        chart.h = newH
        this.canvasInst.updateChartConfig(chart)
      }
    },
    resizedEvent (i, newH, newW, newHPx, newWPx) {
      const chart = this.chartList.find((item) => item.code === i)
      if (chart) {
        chart.w = newW
        chart.h = newH
        this.canvasInst.updateChartConfig(chart)
      }
    }
  }
}
</script>

<style>
.dataroom-dashboard-container-wrap{
  width: 100%;
  height: 100%;

  .vue-grid-layout {
    width: 100%;
    height: 100%!important;
    overflow-y: auto;
    overflow-x: hidden;
  //background: #eee;
  }
  .vue-grid-item:not(.vue-grid-placeholder) {
    background: #ffffff;
    border: 1px solid #e8e8e8;
    &:hover{
      border: 1px dashed #007aff;
    }
  }
  .vue-grid-item.vue-grid-placeholder {
    background: #C6C8CA !important;
  }
  .vue-grid-item .resizing {
    opacity: 0.9;
  }

  .vue-grid-item .static {
    background: #ffffff;
  }

  .vue-grid-item .text {
    font-size: 24px;
    text-align: center;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    height: 100%;
    width: 100%;
  }

  .vue-grid-item .no-drag {
    height: 100%;
    width: 100%;
  }

  .vue-grid-item .minMax {
    font-size: 12px;
  }

  .vue-grid-item .add {
    cursor: pointer;
  }

  .vue-draggable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    top: 0;
    left: 0;
    background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10'><circle cx='5' cy='5' r='5' fill='#999999'/></svg>") no-repeat;
    background-position: bottom right;
    padding: 0 8px 8px 0;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    cursor: pointer;
  }

}
::v-deep ::-webkit-scrollbar {
  width: 6px;
  border-radius: 4px;
  height: 4px;
}
::v-deep ::-webkit-scrollbar-thumb {
  background: #E6E6E6 !important;
  border-radius: 10px;
}
</style>
