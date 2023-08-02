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
      <div class="bs-table-box">
        <el-table
          ref="singleTable"
          :data="params"
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
          <!-- <el-table-column
            prop="type"
            label="参数类型"
            align="center"
            width="200"
            filterable
          >
            <template slot-scope="scope">
              <el-select
                v-model="scope.row.type"
                popper-class="bs-el-select"
                class="bs-el-select"
                placeholder="请选择"
              >
                <el-option
                  v-for="item in typeOptions"
                  :key="item.value"
                  :label="item.value"
                  :value="item.value"
                />
              </el-select>
            </template>
          </el-table-column> -->
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
              <el-input
                v-else
                v-model="scope.row.value"
                class="bs-el-input"
                clearable
                placeholder="请输入值"
              />
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
          <!--          <el-table-column-->
          <!--            label="操作"-->
          <!--            width="105"-->
          <!--            align="center"-->
          <!--          >-->
          <!--            <template slot="header">-->
          <!--              <el-button-->
          <!--                icon="el-icon-plus"-->
          <!--                type="text"-->
          <!--                class="no-border"-->
          <!--                @click="addParam"-->
          <!--              >-->
          <!--                添加-->
          <!--              </el-button>-->
          <!--            </template>-->
          <!--            <template slot-scope="scope">-->
          <!--              <el-button-->
          <!--                type="text"-->
          <!--                style="color: #e47470;"-->
          <!--                class="no-border"-->
          <!--                @click="delRow(scope.$index)"-->
          <!--              >-->
          <!--                删除-->
          <!--              </el-button>-->
          <!--            </template>-->
          <!--          </el-table-column>-->
        </el-table>
      </div>
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
import { cloneDeep } from 'lodash'
export default {
  name: 'HttpParamsSettingDialog.vue',
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
      params: [],
      isUpdate: false,
      dialogVisible: false
    }
  },
  methods: {
    open (isUpdate = false) {
      this.$emit('getPramsList')
      if (isUpdate) {
        this.params = this.newParamsList
      } else {
        this.params = cloneDeep(this.paramsList)
      }
      this.isUpdate = isUpdate
      this.dialogVisible = true
    },
    close () {
      this.dialogVisible = false
    },
    handleClose () {
      this.dialogVisible = false
    },
    checkParamsName (value) {
      const checkList = this.params.filter(item => item.fieldName === value.name)
      if (checkList.length) {
        this.$message.warning('参数名称不可以与字段名相同！')
        value.name = ''
      }
    },
    cancel () {
      this.dialogVisible = false
    },
    confirm () {
      if (!this.isUpdate) {
        this.$emit('saveParams', cloneDeep(this.params))
      } else {
        console.log(this.params)
        this.$emit('saveNewParams', cloneDeep(this.params))
      }
      this.$emit('getData')
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';
</style>
