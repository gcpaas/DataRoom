<template>
  <grid-layout
    class="dataroom-dashboard-preview-wrap"
    :layout.sync="chartList"
    :col-num="12"
    :row-height="30"
    :is-draggable="draggable"
    :is-resizable="resizable"
    :vertical-compact="true"
    :use-css-transforms="true"
    :style="screenWrapStyle"
  >
    <grid-item
      v-for="item in chartList"
      :key="item.code"
      :x="item.x"
      :y="item.y"
      :w="item.w"
      :h="item.h"
      :i="item.code"
    >
      <Configuration
        :config="item"
      >
        <render-card :config="item" />
      </Configuration>
    </grid-item>
  </grid-layout>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import Vue from 'vue'
import { replaceElement } from '@gcpaas/data-room-ui/packages/js/utils'
import { getPageInfo } from '@gcpaas/data-room-ui/packages/js/api/pageApi.js'
const Configuration = () => import('@gcpaas/data-room-ui/packages/dashBoard/designer/canvas/Render/Configuration.vue')
const RenderCard = () => import('@gcpaas/data-room-ui/packages/dashBoard/designer/canvas/Render/RenderCard.vue')
export default {
  components: {
    Configuration,
    RenderCard,
    GridLayout,
    GridItem
  },
  data () {
    return {
      chartInst: {},
      pageInfo: {},
      pageConfig: {},
      chartList: [],
      dataScripts: {},
      screenWrapStyle: {},
      draggable: false,
      resizable: false,
      index: 0
    }
  },
  computed: {
    isVisit () {
      return this.$route.query.isVisit || false
    },
    canvasInst () {
      return this
    },
    pageCode () {
      return this.code || this.$route.query.code
    },
    filters: {
      get () {
        return this.pageInfo?.filters
      },
      set () {

      }

    }
  },
  // 注入
  provide () {
    return {
      canvasInst: this.canvasInst
    }
  },
  mounted () {
    this.PageInfoInit()
  },
  methods: {
    // 初始化页面信息
    PageInfoInit () {
      const url = this.isVisit ? `/dataroom/design/info/code/${this.pageCode}` : `/dataroom/design/info/code/${this.pageCode}?preview=true`
      this.$dataRoomAxios.get(url).then(res => {
        this.pageInfo = res
        this.pageConfig = this.pageInfo?.pageConfig || {}
        this.chartList = this.pageInfo?.chartList || []
        this.pageInfo.filters = this.pageInfo?.filters || {}
        this.getDataScript()
        this.screenWrapStyle = {
          backgroundColor: this.pageConfig.bgColor,
          opacity: this.pageConfig.opacity
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 将页面中所有的数据脚本（数据过滤）都保存起来
    getDataScript () {
      if (this.pageInfo.filters) {
        for (const key in this.pageInfo.filters) {
          this.dataScripts[key] = new Function('params', this.pageInfo.filters[key].script)
        }
      }
    },
    // 将画布上的组件实例保存起来
    updateChartInst (code, chartInstItem) {
      this.chartInst[code] = chartInstItem
    },
    // 根据code获取实例
    getChartInst (code) {
      return this.chartInst[code]
    },
    // 更新chartList
    updateChartList (chartList) {
      this.chartList = chartList
    },
    // 更新单个chart配置
    updateChartConfig (chartConfig) {
      replaceElement(this.chartList, chartConfig)
    }
  }
}
</script>

<style scoped>
.dataroom-dashboard-preview-wrap {
  position: absolute;
  width: 100%;
  height: 100% !important;
  //background: #eee;

  .vue-grid-item:not(.vue-grid-placeholder) {
    background-color: #ffffff;
    border: 1px solid #e8e8e8;
  }

  .vue-grid-item .resizing {
    opacity: 0.9;
  }

  .vue-grid-item .static {
    background: #cce;
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

</style>
