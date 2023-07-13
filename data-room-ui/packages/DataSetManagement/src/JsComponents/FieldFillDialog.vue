<template>
  <div>
    <!-- 字段填充方式 -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="420px"
      append-to-body
      :close-on-click-modal="false"
      class="bs-dialog-wrap bs-el-dialog"
    >
      <p style="color:var(--bs-el-text);line-height: 24px;padding-left: 10px;display: flex;">
        <i
          class="el-icon-warning"
          style="color: #E6A23C;font-size: 24px;margin-right: 5px;"
        />
        存在字段描述信息为空，请确认
      </p>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="fieldDescFill"
        >
          使用字段名填充
        </el-button>
        <el-button
          class="bs-el-button-default"
          @click="fieldDescEdit"
        >
          进入编辑
        </el-button>
        <el-button
          type="primary"
          @click="toSave"
        >
          继续保存
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'FieldFillDialog',
  data () {
    return {
      dialogVisible: false
    }
  },
  methods: {
    open () {
      this.dialogVisible = true
    },
    close () {
      this.dialogVisible = false
    },
    fieldDescFill () {
      this.$emit('fieldDescFill')
    },
    fieldDescEdit () {
      this.$emit('fieldDescEdit')
    },
    toSave () {
      this.$emit('toSave')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../../assets/style/bsTheme.scss';

::v-deep .el-dialog__body {
    height: fit-content;
    min-height: unset;
}
</style>
