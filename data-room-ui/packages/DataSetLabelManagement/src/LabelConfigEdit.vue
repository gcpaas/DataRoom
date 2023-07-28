<template>
  <el-dialog
    class="bs-dialog-wrap bs-el-dialog"
    :append-to-body="true"
    :before-close="cancel"
    :title="dataForm.id!==''?'编辑标签':'新增标签'"
    :visible.sync="formVisible"
  >
    <el-form
      ref="ruleForm"
      :model="dataForm"
      :rules="rules"
      label-position="right"
      label-width="90px"
      class="form-container bs-el-form"
    >
      <el-form-item
        label="标签名称"
        prop="labelName"
      >
        <el-input
          v-model="dataForm.labelName"
          class="bs-el-input"
          clearable
          placeholder="请输入标签名称"
          maxlength="200"
        />
      </el-form-item>

      <el-form-item
        label="标签类型"
        prop="labelType"
      >
        <el-select
          ref="searchSelect"
          v-model="dataForm.labelType"
          class="bs-el-select"
          popper-class="bs-el-select"
          allow-create
          clearable
          filterable
          placeholder="请选择或输入标签类型"
          @blur="selectBlur"
          @input.native="filterData"
        >
          <el-option
            v-for="(item,K) in labelTypeList"
            :key="K"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        label="标签说明"
        prop="labelDesc"
      >
        <el-input
          v-model="dataForm.labelDesc"
          clearable
          placeholder="请输入标签说明"
          class="bs-el-input"
          type="text"
        />
      </el-form-item>
    </el-form>
    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button
        class="bs-el-button-default"
        @click="cancel"
      >
        取消
      </el-button>
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
import { addOrUpdateLabel, checkRepeatLabel } from 'data-room-ui/js/utils/LabelConfigService'

export default {
  name: 'LabelEdit',
  data () {
    return {
      loading: false,
      datasetList: [],
      typeId: '',
      dataForm: {
        id: '',
        labelName: '',
        labelType: '',
        labelDesc: '',
        relList: []
      },
      formVisible: true,
      rules: {
        labelName: [
          { required: true, message: '标签名称不能为空', trigger: 'blur' },
          { validator: this.validateLabelName, trigger: 'blur' }
        ],
        labelType: [
          { required: true, message: '标签类型不能为空', trigger: 'change' }
        ]
      },
      // 分类树数据
      categoryData: [],
      relVisible: false,
      // 标签分类列表
      labelTypeList: [],
      // 选中的数据集id列表
      datasetIdList: []
    }
  },
  watch: {
    'dataForm.labelType': function (val) {
      if (val.length > 20) {
        this.dataForm.labelType = val.substring(0, 20)
      }
    }
  },
  methods: {
    /**
     * 初始化
     * @param row 标签信息
     */
    init (row) {
      this.$nextTick(() => {
        this.$refs.ruleForm.clearValidate()
      })
      this.dataForm.id = row ? row.id : ''
      this.formVisible = true
      if (row) {
        this.dataForm.id = row.id
        this.dataForm.labelName = row.labelName
        this.dataForm.labelType = row.labelType
        this.dataForm.labelDesc = row.labelDesc
      } else {
        this.dataForm.id = ''
        this.dataForm.labelName = ''
        this.dataForm.labelType = ''
        this.dataForm.labelDesc = ''
      }
    },
    /**
     * 标签名称校验
     * @param rule
     * @param value
     * @param callback
     */
    validateLabelName (rule, value, callback) {
      checkRepeatLabel({ id: this.dataForm.id, labelName: this.dataForm.labelName }).then(repeat => {
        if (repeat) {
          callback(new Error('标签名称已存在'))
        } else {
          callback()
        }
      })
    },
    /**
     * 表单关闭
     */
    handleClose () {
      this.$parent.editFormVisible = false
    },
    /**
     * 取消按钮
     */
    cancel () {
      this.formVisible = false
      this.$nextTick(() => {
        this.handleClose()
      })
    },
    /**
     * 提交按钮
     * @param formName
     */
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveForm(true)
        } else {
          return false
        }
      })
    },
    /**
     * 保存标签信息
     * @param flag
     */
    saveForm (flag) {
      addOrUpdateLabel(this.dataForm).then((r) => {
        this.$message.success('保存成功')
        this.cancel()
        this.$emit('afterEdit')
      })
    },
    selectBlur (e) {
      this.dataForm.labelType = e.target.value
    },
    // 对输入字符串控制
    filterData () {
      // 此属性得到输入的文字
      const str = this.$refs.searchSelect.$data.selectedLabel
      // 控制的js
      if (str.length > 20) {
        this.$refs.searchSelect.$data.selectedLabel = str.substr(0, 20)
      }
    }
  }
}
</script>

<style scoped>
.form-container{
  padding: 0 8px;
}
</style>
