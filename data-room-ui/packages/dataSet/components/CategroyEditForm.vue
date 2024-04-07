<template>
  <el-dialog
    width="500px"
    :title="title"
    class="dataroom-el-dialog dialogClass"
    :visible.sync="dialogFormVisible"
    :append-to-body="true"
    :before-close="handleClose"
  >
    <div style="margin: 20px">
      <el-form
        ref="ruleForm"
        :model="dataForm"
        :rules="rules"
        label-position="right"
        label-width="90px"
        class="bs-el-form"
      >
        <el-form-item label="父级分组">
          <type-select
            ref="typeSelect"
            :type="editType"
            :type-id="dataForm.parentId"
            :child-id="dataForm.id"
          />
        </el-form-item>
        <el-form-item
          label="分组名称"
          prop="name"
        >
          <el-input
            v-model.trim="dataForm.name"
            class="bs-el-input"
            clearable
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
      > 取消 </el-button>
      <el-button
        type="primary"
        @click="submitForm('ruleForm')"
      >
        确定
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import TypeSelect from '@gcpaas/data-room-ui/packages/dataSet/components/TypeSelect.vue'
import {
  categoryAdd,
  categoryUpdate,
  categoryNameRepeat
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
export default {
  name: 'CategroyEditForm',
  components: {
    TypeSelect
  },
  props: {
    appCode: {
      type: String,
      default: ''
    },
    treeData: {
      type: Array,
      default: () => []
    }
  },
  data () {
    const nameRepeatCheck = (rule, value, callback) => {
      let parentId = ''
      if (this.nodeFlag) {
        // 新增节点
        if (this.radio === 0) {
          // 新增同级
          parentId = this.nodeData.parentId
        } else {
          // 新增子级
          parentId = this.nodeData.id
        }
      }
      categoryNameRepeat({
        ...this.dataForm,
        parentId
      }).then((res) => {
        if (res) {
          callback(new Error('分组名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      type: 'dataset',
      editType: '',
      dataForm: {
        id: '',
        name: '',
        parentId: ''
      },
      title: '',
      dialogFormVisible: false,
      radio: 0,
      nodeFlag: false,
      rules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' },
          { validator: nameRepeatCheck, trigger: 'blur' }
        ]
      },
      nodeData: {}
    }
  },
  watch: {
    dialogFormVisible (val) {
      if (!val) {
        this.dataForm = {
          id: '',
          name: '',
          parentId: ''
        }
      }
    }
  },
  methods: {
    init (row, flag, editType) {
      this.dataForm.parentId = row.parentId
      if (editType) {
        this.editType = editType
        if (this.editType === 'addChildOrg') {
          this.dataForm.parentId = row.id
        }
      }
      this.nodeFlag = flag
      this.nodeData = row
      this.$nextTick(() => {
        this.$refs.typeSelect.init()
      })
      if (flag) {
        return
      }
      this.dataForm.name = row.name
      this.dataForm.id = row.id
    },
    cancel () {
      this.dialogFormVisible = false
      this.$nextTick(() => {
        this.$parent.addOrUpdateTreeVisible = false
      })
    },
    handleClose () {
      this.dialogFormVisible = false
      this.$parent.addOrUpdateTreeVisible = false
    },
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let id = ''
          const parentId = this.$refs.typeSelect.typeIdCopy

          if (!this.nodeFlag) {
            id = this.dataForm.id
          }
          const params = {
            id: this.dataForm.id,
            name: this.dataForm.name,
            parentId: parentId,
            type: this.type,
          }
          if (id) {
            categoryUpdate(params).then((r) => {
              this.$message.success('保存成功')
              this.cancel()
              try {
                this.$emit('addOrUpdateNode', params, this.nodeFlag)
              } catch (error) {
                this.$parent.initLazyDatasetTypeTree()
              }
            })
          } else {
            categoryAdd(params).then((r) => {
              params.id = r
              this.$message.success('保存成功')
              this.cancel()
              try {
                this.$emit('addOrUpdateNode', params, this.nodeFlag)
              } catch (error) {
                this.$parent.initLazyDatasetTypeTree()
              }
            })
          }
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/common.scss";
::v-deep .el-select {
  width: 100%;
}
</style>
