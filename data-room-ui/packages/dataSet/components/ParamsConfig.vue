<template>
  <div>
    <div>
      <span class="dataroom-dataset-params-config-title">
        输入参数配置
      </span>
    </div>
    <el-button
      type="primary"
      class="dataroom-dataset-add-param-btn"
      @click="addParam"
    >
      新增参数
    </el-button>
    <div class="field-wrap bs-field-wrap bs-scrollbar">
      <el-table
        ref="singleTable"
        :data="innerData"
        align="center"
        class="dataroom-el-table"
      >
        <el-table-column
          prop="name"
          label="参数名称"
          width="130"
          align="center"
        >
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item>
                <el-input
                  v-model="scope.row.name"
                  class="bs-el-input"
                  placeholder="请输入名称"
                  clearable
                  @change="checkParamsName(scope.row)"
                />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="remark"
          label="备注"
          width="130"
          align="center"
        >
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item>
                <el-input
                  v-model="scope.row.remark"
                  clearable
                  class="bs-el-input"
                  placeholder="请输入备注"
                  rows="2"
                  maxlength="200"
                />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="参数类型"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item>
                <el-select
                  v-model="scope.row.type"
                  popper-class="bs-el-select"
                  class="bs-el-select"
                  placeholder="请选择"
                  @change="checkParamsType(scope.row)"
                >
                  <el-option
                    v-for="item in fieldTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="require"
          label="是否必填"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <el-form :model="scope.row">
              <el-form-item>
                <el-switch v-model="scope.row.require" />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="value"
          label="默认值"
          align="center"
        >
          <template slot-scope="scope">
            <el-form
              ref="valueForm"
              :model="scope.row"
            >
              <el-form-item
                :show-message="scope.row.require === 1"
                prop="value"
                :rules="getRules(scope.row)"
              >
                <el-input-number
                  v-if="scope.row.type === 'number'"
                  v-model="scope.row.value"
                />
                <el-input
                  v-else
                  v-model="scope.row.value"
                  clearable
                  placeholder="请输入值"
                />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          prop="testValue"
          label="测试值"
          align="center"
        >
          <template slot-scope="scope">
            <el-form
              ref="testValueForm"
              :model="scope.row"
            >
              <el-form-item
                :show-message="scope.row.require === 1"
                prop="value"
                :rules="getRules(scope.row)"
              >
                <el-input-number
                  v-if="scope.row.type === 'number'"
                  v-model="scope.row.testValue"
                />
                <el-input
                  v-else
                  v-model="scope.row.testValue"
                  clearable
                  placeholder="请输入值"
                />
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="80"
          align="center"
        >
          <template slot-scope="scope">
            <el-button
              type="text"
              class="dataroom-el-button"
              @click="delRow(scope.$index)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script>
import resizeTableHeight from '@gcpaas/data-room-ui/packages/assets/js/utils/resizeHeightDirevtive.js'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'ParamsConfig',
  directives: {
    resizeTableHeight
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    innerData () {
      return cloneDeep(this.data)
    }
  },
  data () {
    return {
      fieldTypeOptions: [
        {
          value: 'text',
          label: '文本'
        },
        {
          value: 'number',
          label: '数字'
        },
        {
          value: 'date',
          label: '时间'
        },
        {
          value: 'boolean',
          label: '布尔值'
        }
      ]
      // Your data properties here
    }
  },
  mounted () { },
  methods: {
    addParam () {
      this.innerData.push({
        name: '',
        type: 'text',
        require: 0,
        status: 1,
        value: '',
        testValue: '',
        remark: ''
      })
    },
    delRow (index) {
      this.innerData.splice(index, 1)
    },
    checkParamsName (row) {
      if (row.name === '') {
        this.$message.error('参数名称不能为空')
      }
    },
    checkParamsType (row) {
      const typesToClear = ['text', 'date', 'number', 'boolean']
      if (typesToClear.includes(row.type)) {
        row.value = ''
        row.testValue = ''
      }
    },
    getRules (row) {
      return [
        {
          required: row.require === 1,
          message: '参数值不能为空',
          trigger: ['blur', 'change']
        }
      ]
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-dataset-add-param-btn {
  float: right;
  margin-bottom: 12px;
}
::v-deep .el-table .cell {
  padding: 0 5px;
}

::v-deep .el-form-item--mini.el-form-item {
  margin-bottom: 13px;
}
.el-input-number--mini {
  width: 100%;
}
::v-deep .el-date-editor.el-input {
  width: 140px;
}
.dataroom-el-button{
  color: #e47470;
  margin-bottom: 13px;
}

.dataroom-dataset-params-config-title{
  font-size: 14px;
  font-weight: 600;
  position: relative;
  padding: 16px 0;
  padding-left: 12px;
  // border-bottom: 1px solid #409eff;

  &::before {
    content: "";
    height: 14px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: 4px solid #409eff;
  }
}

// ::v-deep .el-table--border {
//   border-bottom: 1px solid #EBEEF5;
// }
</style>
