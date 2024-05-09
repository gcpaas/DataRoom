<template>
  <div class="dataroom-bigscreen-coverage-wrap">
    <div class="coverage-top">
      <div class="coverage-top-left">
        图层
      </div>
      <div class="coverage-top-right">
        <i class="icon el-icon-close"         @click="closePanel"/>
      </div>
    </div>
    <div class="coverage-tool">
      <el-tooltip
        class="item"
        effect="dark"
        content="上移一层"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <i class="el-icon-top" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="下移一层"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <i class="el-icon-bottom" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="置顶"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <i class="el-icon-caret-top" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="置底"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <i class="el-icon-caret-bottom" />
      </el-tooltip>
      <el-tooltip
        class="item"
        effect="dark"
        content="成组"
        placement="top"
        popper-class="dataroom-el-tooltip"
      >
        <i class="el-icon-document-copy" />
      </el-tooltip>
    </div>
    <el-tree
      :data="coverageList"
      node-key="code"
      default-expand-all
      :expand-on-click-node="false"
      :props="defaultProps"
      draggable
      :allow-drop="allowDrop"
      @node-drop="handleDrop"
    >
      <span
        slot-scope="{ node, data }"
        class="tree-item"
        @mouseenter="toolHandle(true,data)"
        @mouseleave="toolHandle(false)"
        @contextmenu="onContextmenu($event, data)"
      >
        <span><i :class="getCategoryIcon(data.type)" />{{ data.title.text }}</span>
        <span
          v-if="toolShow && hovercode === data.code"
          class="item-tool"
        >
          <el-tooltip
            class="item"
            effect="dark"
            content="隐藏"
            placement="top"
            popper-class="dataroom-el-tooltip"
          >
            <i class="icon el-icon-view" />
          </el-tooltip>
          <el-tooltip
            class="item"
            effect="dark"
            content="锁定"
            placement="top"
            popper-class="dataroom-el-tooltip"
          >
            <i class="icon el-icon-lock" />
          </el-tooltip>
        </span>
      </span>
    </el-tree>
  </div>
</template>

<script>
import chartContextMenu from '@gcpaas/data-room-ui/packages/js/mixins/chartContextMenu'
import { replaceElement } from '@gcpaas/data-room-ui/packages/js/utils'

export default {
  name: '',
  components: {},
  props: {},
  mixins: [chartContextMenu],
  data () {
    return {
      toolShow: false,
      hoverNodeName: null,
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      activeCoverage: ''
    }
  },
  inject: ['canvasInst'],
  computed: {
    // 图层列表
    coverageList () {
      return this.canvasInst.chartList
    },
    scale () {
      return (this.canvasInst.zoom / 100).toFixed(2)
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    // 点击关闭按钮关闭tab面板
    closePanel () {
      this.$emit('closePanel')
    },
    // 图层显示组件的分类图标
    getCategoryIcon (type) {
      //  TODO 需要递归找到组件的分类图标
      switch (type) {
        case 'texts':
          return 'el-icon-tickets'
        case 'bar':
          return 'el-icon-s-data'
        case 'line':
          return 'el-icon-s-data'
        default:
          return 'el-icon-s-data'
      }
    },
    // 点击层级后触发
    clickHandle (item) {
      this.activeCoverage = item.name
    },
    toolHandle (isShow, data) {
      if (isShow) {
        this.hovercode = data.code
      }
      this.toolShow = isShow
    },
    // 拖拽节点是判断目标节点是否可被放置，只有容器组件可被放置
    allowDrop (draggingNode, dropNode, type) {
      return (dropNode.data.type === 'container' && type === 'inner') || (type !== 'inner')
    },
    // 拖拽结束后触发
    // 被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event
    handleDrop (draggingNode, dropNode, dropType, event) {
      // 将其他组件拖拽到容器里面:
      // 1. 每次拖拽到容器时保持组件在容器中心
      if (dropNode.data.type === 'container' && dropType === 'inner') {
        let chartList = this.canvasInst.chartList()
        const h =
          (draggingNode.data.h) * this.scale
        // 需要将位移保存到组件的配置中
        const config = {
          code: draggingNode.data.code,
          transform: `translate(0, -${h}px)`
        }
        chartList = replaceElement(chartList, config)
        this.canvasInst.updateChartList(chartList)
      }
    }
  }
}
</script>
<style scoped lang="scss">
.dataroom-bigscreen-coverage-wrap {
  width: 240px;
  height: 100%;
  font-size: 12px;
  color: #1a1a1a;
  border-right: 1px solid #ededed;

  .coverage-top {
    display: flex;
    height: 56px;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    border-bottom: 1px solid #e6e6e6;
    box-sizing: border-box;

    .coverage-top-right {
      .icon {
        font-size: 12px;
        margin-left: 8px;
      }
    }
  }

  .coverage-tool {
    height: 40px;
    padding: 0 16px;
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .tree-item {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    padding-right: 8px;

    .item-tool {
      .icon {
        margin-left: 8px;
      }
    }
  }
  .el-icon-close{
    font-size: 12px;
    padding: 0 5px;
    color: #a3a3a3;
    &:hover{
      cursor: pointer;
    }
  }
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
