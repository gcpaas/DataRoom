<template>
  <el-dialog
    class="dataroom-pagename-dialog-wrap dataroom-el-dialog"
    title="修改页面名"
    :visible.sync="dialogVisible"
    width="480px"
    :before-close="handleClose"
  >
    <div class="title">
      请输入新的页面名
    </div>
    <el-input
      v-model="pageName"
      class="page-name-input"
    />
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="dialogVisible = false">取 消</el-button>
      <el-button
        type="primary"
        @click="sure"
      >确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      pageName: '',
      dialogVisible: false
    }
  },
  inject: ['canvasInst'],
  computed: {
    pageInfo () {
      return this.canvasInst.pageInfo
    }
  },
  watch: {},
  created () {},
  mounted () {
  },
  methods: {
    init () {
      this.dialogVisible = true
      this.pageName = this.pageInfo.name
    },
    handleClose () {
      this.dialogVisible = false
      this.pageName = ''
    },
    sure () {
      const _pageInfo = { ...this.pageInfo, name: this.pageName }
      this.canvasInst.updatePageInfo(_pageInfo)
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
.dataroom-pagename-dialog-wrap{
  .title{
    margin-bottom: 10px;
    color:#7a7a7a;
    height:24px;
    line-height: 24px;
  }
  .page-name-input{
    width: 100%;
    height:28px;
    background-color:#EDEDED;
    border-radius: 4px;
    ::v-deep .el-input__inner{
      width: 100% !important;
    }
  }
}
</style>
