<template>
  <el-dialog
    title="提示"
    :visible.sync="backDialog"
    width="40%"
    :modal="true"
    :modal-append-to-body="false"
    :appen-to-body="true"
    class="bs-dialog-wrap bs-el-dialog"
  >
  <span style="color:#fff">确定返回主页面吗？未保存的配置将会丢失!</span>
  <span slot="footer" class="dialog-footer">
    <el-button @click="backDialog = false">留在页面</el-button>
    <el-button @click="goBack">离开页面</el-button>
    <el-button type="primary" @click="goBackSave">保存后离开页面</el-button>
  </span>
  </el-dialog>
</template>
<script>
import { pageMixins } from 'data-room-ui/js/mixins/page'
export default {
  name: 'ComponentDialog',
  mixins: [pageMixins],
  props: {},
  data () {
    return {
      backDialog: false
    }
  },
  computed: {},
  mounted () {},
  methods: {
    init () {
      this.backDialog = true
    },
    // 点击确定
    confirm () {
      this.backDialog = false
    },
    goBack(){
      this.$emit('back')
    },
    goBackSave(){
     this.$emit('backSave')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
/deep/.el-dialog__body{
  min-height: 100px !important;
}
</style>
