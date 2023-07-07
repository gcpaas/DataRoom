<template>
  <el-dialog
    :append-to-body="true"
    :before-close="handleClose"
    :visible.sync="dialogFormVisible"
    class="dialogClass"
    title="标签类型修改"
    width="500px"
  >
    <div style="margin: 20px;">
      <el-form ref="ruleForm" :model="dataForm" :rules="rules" label-position="left" label-width="90px">
        <el-form-item label="标签类型" prop="labelType">
          <el-input v-model="dataForm.labelType"/>
        </el-form-item>
      </el-form>
    </div>

    <span slot="footer" class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="submitForm('ruleForm')">确定</el-button>
      </span>
  </el-dialog>
</template>

<script>
import {updateLabelType} from 'packages/js/utils/LabelConfigService'

export default {
  name: "labelTypeEdit",
  data() {
    return {
      dialogFormVisible: false,
      dataForm: {
        labelType: '',
        oldLabelType: ''
      },
      rules: {
        labelType: [
          {required: true, message: '标签类型不能为空', trigger: 'blur'},
        ]
      }
    }
  },
  methods: {
    init(labelType) {
      this.dataForm.labelType = labelType;
      this.dataForm.oldLabelType = labelType;
    },
    handleClose() {
      this.$parent.labelTypeEditVisible = false
    },
    cancel() {
      this.dialogFormVisible = false;
      this.$nextTick(() => {
        this.handleClose();
      })
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          updateLabelType(this.dataForm).then(() => {

            if (this.$parent.queryForm.labelType !== '') {
              this.$parent.queryForm.labelType = this.dataForm.labelType;
            }
            this.$parent.reSearch()
            this.$parent.getLabelType();

            this.cancel();
            this.$message.success("保存成功")
          });
        } else {
          return false;
        }
      });
    },
  }
}
</script>

<style>
.dialogClass .el-dialog__body {
  min-height: auto;
}
</style>
