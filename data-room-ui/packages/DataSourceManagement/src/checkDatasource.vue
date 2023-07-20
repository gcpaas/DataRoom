<template>
  <el-dialog
    width="700px"
    title="提示"
    :visible.sync="checkDatasourceVisible"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="handleClose"
    class="bs-dialog-wrap bs-el-dialog"
  >
    <div
      style="padding-right: 80px;"
    >
      <div class="item" v-for="(item,index) in reasonList" :key="index">
        <span v-if="reasonList.length>1"> {{index+1}}、</span>{{item}}
      </div>
    </div>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        type="primary"
        @click="handleClose"
      >
        确定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    reasonList: {
      type: Array,
      default: ()=>[]
    }
  },
  data () {
    return {
      checkDatasourceVisible: false,
    }
  },
  methods: {
    handleClose(){
      this.checkDatasourceVisible=false
    }

    }
  }
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
/deep/ .el-dialog__body{
  min-height: 0 !important;
}
.item{
  padding: 8px 0;
}
</style>
