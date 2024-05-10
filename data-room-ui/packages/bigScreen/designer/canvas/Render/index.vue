<template>
  <div
    ref="bs-render-wrap"
    class="dataroom-bigscreen-render-wrap"
    :style="{
      width: pageConfig.w + 'px',
      height: pageConfig.h + 'px',
      backgroundColor: pageConfig.bgColor,
      opacity: pageConfig.opacity
    }"
    @drop="drop($event)"
    @dragover.prevent
    @click="handleClickOutside($event)"
  >
    <CanvasPanel
      ref="canvasPanel"
      :chart-list="chartList"
    />
  </div>
</template>
<script>

const CanvasPanel = () => import(/* webpackChunkName: "CanvasPanel" */ './CanvasPanel.vue')
export default {
  name: 'Render',
  components: {
    CanvasPanel
  },
  props: {
    ruleKey: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      rawChart: []
    }
  },
  inject: ['canvasInst'],
  computed: {
    scale () {
      return this.canvasInst.zoom / 100
    },
    pageInfo () {
      return this.canvasInst.pageInfo
    },
    pageConfig () {
      return this.canvasInst.pageConfig
    },
    chartList () {
      return this.canvasInst.chartList
    }
  },
  watch: {
  },
  mounted () {

  },
  methods: {
    // 判断鼠标点击的是画布中的高亮元素（被框选的）还是非高亮元素或者空白区域
    // 如果是高亮元素则不会取消高亮状态，如果不是则取消高亮状态
    handleClickOutside (event) {
    },
    // 组件拖拽到画布时添加该组件
    drop (e) {
      e.preventDefault()
      // 解决：火狐拖放后，总会默认打开百度搜索，如果是图片，则会打开图片的问题。
      e.stopPropagation()
      const transferData = e.dataTransfer.getData('dragComponent')
      if (transferData) {
        const element = JSON.parse(transferData)
        if (element.disabled) {
          this.$message.warning('组件正在开发中...')
        } else {
          this.canvasInst.addChart(element, 'add')
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.dataroom-bigscreen-render-wrap {
  position: relative;
  background-size: cover;
  background-color: #f5f7fa;
  .drag-item {
    cursor: move;
  }

  ::v-deep .vdr {
    border: none;
  }
  .h-line {
    border-bottom: 1px dashed #0089d0;
  }
  .v-line {
    border-left: 1px dashed #0089d0;
  }
  .ref-line {
    background-color: transparent;
  }
}

.multiple-selected {
  border: 1px solid #fff !important;
}
</style>
