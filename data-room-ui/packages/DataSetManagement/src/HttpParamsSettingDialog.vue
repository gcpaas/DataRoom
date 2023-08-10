<template>
  <div>
    <el-dialog
      title="参数配置"
      :visible.sync="dialogVisible"
      width="1000px"
      append-to-body
      :close-on-click-modal="false"
      :before-close="handleClose"
      class="bs-dialog-wrap bs-el-dialog"
    >
      <el-form
        ref="form"
        :model="form"
        :rules="formRules"
      >
        <div class="bs-table-box">
          <el-table
            ref="singleTable"
            :data="form.params"
            :border="true"
            align="center"
            class="bs-el-table"
          >
            <el-empty slot="empty" />
            <el-table-column
              prop="name"
              label="参数名称"
              align="center"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  class="bs-el-input"
                  placeholder="请输入名称"
                  clearable
                  readonly
                  @change="checkParamsName(scope.row)"
                />
              </template>
            </el-table-column>
            <el-table-column
              prop="require"
              label="是否必填"
              align="center"
              width="200"
              filterable
            >
              <template slot-scope="scope">
                <el-radio-group
                  v-model="scope.row.require"
                  :disabled="isUpdate"
                >
                  <el-radio :label="1">
                    是
                  </el-radio>
                  <el-radio :label="0">
                    否
                  </el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
            <el-table-column
              prop="value"
              label="参数值"
              align="center"
            >
              <template slot-scope="scope">
                <el-date-picker
                  v-if="scope.row.type === 'Date'"
                  v-model="scope.row.value"
                  type="datetime"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  placeholder="选择日期时间"
                />
                <el-form-item
                  v-else
                  style="margin-bottom: 0"
                  :prop="'params.' + scope.$index + '.value'"
                  :rules="scope.row.require ?formRules.value:null"
                >
                  <el-input
                    v-model="scope.row.value"
                    class="bs-el-input"
                    clearable
                    placeholder="请输入值"
                  />
                </el-form-item>
              </template>
            </el-table-column>
            <el-table-column
              prop="remark"
              label="备注"
              align="center"
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.remark"
                  clearable
                  class="bs-el-input"
                  placeholder="请输入备注"
                  rows="2"
                  :readonly="isUpdate"
                  maxlength="200"
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
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
          @click="confirm"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'HttpParamsSettingDialog',
  props: {
    paramsList: {
      type: Array,
      default: () => []
    },
    newParamsList: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isUpdate: false,
      dialogVisible: false,
      form: {
        params: []
      },
      formRules: {
        value: [{ required: true, message: '参数值不能为空', trigger: 'blur' }]
      }
    }
  },
  methods: {
    open (isUpdate = false) {
      this.$emit('getPramsList')
      if (isUpdate) {
        this.form.params = this.newParamsList
      } else {
        this.form.params = cloneDeep(this.paramsList)
      }
      this.isUpdate = isUpdate
      this.dialogVisible = true
    },
    close () {
      this.$refs.form.clearValidate()// 清空校验信息
      this.dialogVisible = false
    },
    handleClose () {
      this.$refs.form.clearValidate() // 清空校验信息
      this.dialogVisible = false
    },
    checkParamsName (value) {
      const checkList = this.form.params.filter(item => item.fieldName === value.name)
      if (checkList.length) {
        this.$message.warning('参数名称不可以与字段名相同！')
        value.name = ''
      }
    },
    cancel () {
      this.$refs.form.clearValidate() // 清空校验信息
      this.dialogVisible = false
    },
    confirm () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          if (!this.isUpdate) {
            this.$emit('saveParams', cloneDeep(this.form.params))
          } else {
            this.$emit('saveNewParams', cloneDeep(this.form.params))
            this.$emit('getData')
          }
          this.dialogVisible = false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
</style>
