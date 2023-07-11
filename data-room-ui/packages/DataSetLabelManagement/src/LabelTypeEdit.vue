<template>
  <el-dialog
    :append-to-body="true"
    :before-close="handleClose"
    :visible.sync="dialogFormVisible"
    class="bs-dialog-wrap bs-el-dialog"
    title="标签类型修改"
    width="500px"
  >
    <div style="margin: 20px;">
      <el-form
        ref="ruleForm"
        :model="dataForm"
        :rules="rules"
        label-position="left"
        label-width="90px"
        class="bs-el-form"
      >
        <el-form-item
          label="标签类型"
          prop="labelType"
        >
          <el-input
            v-model="dataForm.labelType"
            class="bs-el-input"
          />
        </el-form-item>
      </el-form>
    </div>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="cancel"
      >取消</el-button>
      <el-button
        type="primary"
        @click="submitForm('ruleForm')"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { updateLabelType } from 'data-room-ui/js/utils/LabelConfigService'

export default {
  name: 'LabelTypeEdit',
  data () {
    return {
      dialogFormVisible: false,
      dataForm: {
        labelType: '',
        oldLabelType: ''
      },
      rules: {
        labelType: [
          { required: true, message: '标签类型不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    init (labelType) {
      this.dataForm.labelType = labelType
      this.dataForm.oldLabelType = labelType
    },
    handleClose () {
      this.$parent.labelTypeEditVisible = false
    },
    cancel () {
      this.dialogFormVisible = false
      this.$nextTick(() => {
        this.handleClose()
      })
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        updateLabelType(this.dataForm).then(() => {
          this.$emit('afterEdit')
          this.cancel()
          this.$message.success('保存成功')
        })
      })
    }
  }
}
</script>

<style>
/* .dialogClass .el-dialog__body {
  min-height: auto;
} */
</style>
