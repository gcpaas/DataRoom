<!--
@name:资源库弹窗
@description:
@author: lsy
@time:
-->
<template>
  <el-dialog
    v-if="dialogVisible"
    :close-on-click-modal="false"
    title="素材库"
    width="80%"
    :visible.sync="dialogVisible"
    class="dataroom-resource-library-wrap dataroom-el-dialog"
  >
    <div class="resource-library-box">
      <side-menu
        page-type="resource"
        @getPageInfo="getPageInfo"
      />
      <ResourceList
        page-type="resource"
        :catalog-info="catalogInfo"
        :resource-type="resourceType"
        @changeResource="changeResource"
      />
    </div>
    <div
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="dialogVisible = false"
      >
        取消
      </el-button>
      <el-button
        type="primary"
        @click="confirm"
      >
        确定
      </el-button>
      <el-button
        type="primary"
        @click="jumpTo"
      >
        素材管理
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import SideMenu from './SideMenu.vue'
import ResourceList from './list.vue'

export default {
  name: 'ResourceLibrary',
  components: { ResourceList, SideMenu },
  props: {
    resourceType: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      resource: null,
      resourceConfig: null,
      dialogVisible: false,
      catalogInfo: {
        isAll: true,
        page: {
          id: null,
          code: null,
          type: ''
        }
      }
    }
  },
  computed: {},
  watch: {},
  created () {},
  mounted () {},
  methods: {
    getPageInfo (pageInfo) {
      this.catalogInfo = pageInfo
    },
    changeResource (resource) {
      this.resource = resource
    },
    // 将资源添加到画布
    confirm () {
      this.$emit('chooseResource', this.resource)
    },
    jumpTo () {
      const { href } = this.$router.resolve('/page-list?type=resource')
      window.open(href, '_blank')
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
.dataroom-resource-library-wrap{
  .resource-library-box {
    position: absolute;
    width: 100%;
    height: calc(100% - 100px);
    display: flex;
    box-sizing: border-box;
    overflow-y: auto;
  }
  ::v-deep .el-dialog{
    height: calc(100% - 200px);
    overflow: hidden;
  }
  ::v-deep .el-dialog__body{
    height: calc(100% - 115px);
    overflow: hidden!important;
    padding: 0 16px 16px 0!important;
  }
  ::v-deep .el-dialog__footer{
    position: absolute;
    bottom: 0;
    right: 0;
  }
}

</style>
