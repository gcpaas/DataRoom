<template>
  <el-tree
    :ref="treeRef"
    class="bs-el-tree"
    :data="treeData"
    :default-expand-all="expandAll"
    :expand-on-click-node="false"
    :filter-node-method="filterNode"
    :highlight-current="true"
    :indent="0"
    :props="defaultProps"
    node-key="id"
    style="width: fit-content;min-width: 100%;"
    @node-click="handleNodeClick"
    @node-contextmenu="rihgtClick"
  >
    <span
      slot-scope="{ node,data }"
      class="custom-tree-node"
      style="width: 100%;position: relative;"
      @mouseenter="mouseEnter(data)"
      @mouseleave="mouseLeave(data)"
    >
      <span :style="data.children && data.children.length ? {} : {'padding-left': '12px'}">
        <i
          :class="data.children && data.children.length ? 'el-icon el-icon-folder': 'el-icon el-icon-document'"
          style="margin-right: 8px;"
        />
        <span class="nodeText">{{ data.name }}</span>
      </span>
      <span
        v-if="optionShow"
        class="options"
      >
        <el-dropdown @command="(command) => { treeCommand(command, data) }">
          <i class="el-icon-more" />
          <el-dropdown-menu slot="dropdown">
            <slot name="options" />
          </el-dropdown-menu>
        </el-dropdown>
      </span>
    </span>
  </el-tree>
</template>

<script>
export default {
  name: 'Tree',
  props: {
    treeData: {
      type: Array,
      default: () => ([])
    },
    treeRef: {
      type: String,
      default: 'tree'
    },
    nodeWidth: {
      type: String,
      default: '280px'
    },
    expandAll: {
      type: Boolean,
      default: true
    },
    filterText: {
      type: String,
      default: ''
    },
    optionShow: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      defaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  watch: {
    treeData: function (val) {
      // console.log('valx', val)
    },
    filterText (val) {
      this.$refs[this.treeRef].filter(val)
    }
  },
  methods: {
    treeCommand (command, nodeData) {
      this.$emit('treeCommand', command, nodeData)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 节点点击
    handleNodeClick (row, value) {
      this.$emit('handleNodeClick', row, value)
    },
    // 节点右键
    rihgtClick (event, object, value, element) {
      this.$emit('rihgtClick', event, object, value, element)
    },
    mouseEnter (data) {
      // this.$set(data, 'show', true)
      // 弹射节点数据
      this.$emit('mouseEnter', data)
    },
    mouseLeave (data) {
      // this.$set(data, 'show', false)
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .el-tree-node {
  display: block;
  min-width: 270px;

  .el-tree-node__content {
    width: 270px;
    overflow: hidden;
  }

  .el-tree-node__children {
    .el-tree-node {
      display: block;
      min-width: 270px;

      .el-tree-node__content {
        width: 270px;
        overflow: hidden;
      }
    }
  }
}

.custom-tree-node {
  position: relative;

  .nodeText {
    display: inline-block;
    width: 225px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 14px;
  }

  .options {
    position: absolute;
    right: 30px;
    height: 16px;
    top: 2px;
    line-height: 16px;
    transform: rotate(90deg);
  }
}

// ::v-deep .is-current .options{
//   background: #fff;
// }
</style>
