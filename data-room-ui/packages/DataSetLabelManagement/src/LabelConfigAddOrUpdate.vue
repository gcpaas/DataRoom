<template>
  <el-dialog
    class="bs-dialog-wrap bs-el-dialog"
    :append-to-body="true"
    :before-close="handleClose"
    :title="dataForm.id!==''?'编辑标签':'新增标签'"
    :visible.sync="dialogFormVisible"
    :width="relVisible?'1100px':'450px'"
  >
    <el-row>
      <el-col :span="relVisible ? 8 : 24">
        <el-divider
          class="bs-el-divider"
          content-position="left"
        >
          属性信息
        </el-divider>

        <el-form
          ref="ruleForm"
          :model="dataForm"
          :rules="rules"
          label-position="right"
          label-width="90px"
          class="form-container"
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

        <el-divider
          class="bs-el-divider"
          content-position="left"
        >
          关联数据集信息
        </el-divider>
        <el-form class="form-container">
          <el-form-item align="center">
            <el-tag effect="plain">
              标签
            </el-tag>
            <span>—————</span>
            <el-button
              round
              size="mini"
              type="primary"
              @click="buildRel"
            >
              添加关联
            </el-button>
          </el-form-item>
        </el-form>
      </el-col>

      <el-col
        v-if="relVisible"
        :span="8"
      >
        <div>
          <el-divider
            class="bs-el-divider"
            content-position="left"
          >
            添加关联
          </el-divider>
          <div
            class="tree-box full-box--position"
            style="padding: 0 8px 24px 0"
          >
            <Tree
              ref="tree"
              :tree-data="categoryData"
              style="height: 300px;overflow: auto"
              @handleNodeClick="handleNodeClick"
            />
          </div>
        </div>
      </el-col>

      <el-col
        v-if="relVisible"
        :span="8"
      >
        <el-divider
          class="bs-el-divider"
          content-position="left"
        >
          数据集列表
        </el-divider>
        <div class="bs-table-box">
          <el-table
            ref="mytable"
            class="bs-el-table"
            :data="datasetList"
            height="300"
            @select="handleSelect"
            @select-all="handleSelectionAll"
          >
            <el-table-column
              type="selection"
              width="55"
            />

            <el-table-column
              label="数据集名称"
              prop="name"
              show-overflow-tooltip
            />
          </el-table>
        </div>
      </el-col>
    </el-row>

    <span
      slot="footer"
      class="dialog-footer"
    >
      <el-button @click="cancel">取消</el-button>
      <el-button
        type="primary"
        @click="submitForm('ruleForm')"
      >确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { pageMixins } from 'packages/js/mixins/page'
import Tree from './Tree'
import { addOrUpdateLabel, checkRepeatLabel, getDataSetIdListByLabelId } from 'packages/js/utils/LabelConfigService'
import { datasetList, getCategoryTree } from 'packages/js/utils/datasetConfigService'

export default {
  name: 'LabelConfigAddOrUpdate',
  mixins: [pageMixins],
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
      dialogFormVisible: true,
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
  components: {
    Tree
  },
  watch: {
    'dataForm.labelType': function (val) {
      if (val.length > 20) {
        this.dataForm.labelType = val.substring(0, 20)
      }
    },
    // datasetList变化时，根据datasetIdList设置其选中状态
    datasetList: {
      handler: function (val) {
        this.$nextTick(() => {
          if (this.$refs.mytable) {
            this.$refs.mytable.clearSelection()
          }
          this.datasetList.forEach((item) => {
            if (this.datasetIdList.includes(item.id)) {
              this.$refs.mytable.toggleRowSelection(item, true)
            }
          })
        })
      },
      deep: true
    }
  },
  methods: {
    /**
     * 初始化
     * @param row 标签信息
     */
    init (row) {
      this.dataForm.id = row ? row.id : ''
      this.dialogFormVisible = true
      if (row) {
        this.dataForm.id = row.id
        this.dataForm.labelName = row.labelName
        this.dataForm.labelType = row.labelType
        this.dataForm.labelDesc = row.labelDesc
        // 获取选中的数据集id列表
        getDataSetIdListByLabelId(row.id).then((list) => {
          this.datasetIdList = list
          this.buildRel()
        })
      }
      this.$nextTick(() => {
        this.getDataList()
      })
    },
    /**
     * 获取数据集列表
     */
    getDataList () {
      this.loading = true
      const params = {
        typeId: this.typeId
      }
      datasetList(params).then((list) => {
        this.datasetList = list
        if (!this.relVisible) {
          this.loading = false
          return
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },

    /**
     * 获取分类树
     */
    getTreeList () {
      getCategoryTree({ type: 'dataset' }).then((categoryTree) => {
        this.categoryData = categoryTree
      })
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
     * 树节点点击事件
     * @param row
     * @param value
     */
    handleNodeClick (row, value) {
      this.$nextTick(() => {
        this.typeId = row.id
        this.getDataList()
      })
    },
    /**
     * 选中数据集
     * @param selection 选中的数据集列表
     * @param row 操作行
     */
    handleSelect (selection, row) {
      // 如row.id存在于datasetIdList中，则将其从datasetIdList中删除
      if (this.datasetIdList.includes(row.id)) {
        const index = this.datasetIdList.indexOf(row.id)
        if (index > -1) {
          this.datasetIdList.splice(index, 1)
        }
        return
      }
      // 如row.id不存在于datasetIdList中，则将其添加到datasetIdList中
      if (!this.datasetIdList.includes(row.id)) {
        this.datasetIdList.push(row.id)
      }
    },
    /**
     * 数据集全选
     * @param selection
     */
    handleSelectionAll (selection) {
      // 选中项为空，将datasetList中所有项从datasetIdList中删除
      if (selection.length === 0) {
        this.datasetList.forEach((dataset) => {
          const index = this.datasetIdList.indexOf(dataset.id)
          if (index > -1) {
            this.datasetIdList.splice(index, 1)
          }
        })
        return
      }
      // 选中项不为空，将datasetList中所有项添加到datasetIdList中
      if (selection.length > 0) {
        this.datasetList.forEach((dataset) => {
          if (!this.datasetIdList.includes(dataset.id)) {
            this.datasetIdList.push(dataset.id)
          }
        })
      }
    },

    /**
     * 表单关闭
     */
    handleClose () {
      this.$parent.addOrUpdateVisible = false
    },
    /**
     * 取消按钮
     */
    cancel () {
      this.dialogFormVisible = false
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
      this.dataForm.relList = []
      this.datasetIdList.forEach(id => {
        const param = {
          datasetId: id,
          labelId: this.dataForm.id
        }
        this.dataForm.relList.push(param)
      })
      addOrUpdateLabel(this.dataForm).then((r) => {
        this.$message.success('保存成功')
        this.cancel()
        this.$parent.getDataList()
        // 更新一下类型
        this.$parent.getLabelType()
      })
    },
    /**
     * 添加关联按钮
     */
    buildRel () {
      this.relVisible = !this.relVisible
      if (this.relVisible) {
        this.getTreeList()
        this.$nextTick(() => {
          this.getDataList()
        })
      }
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    ellipsis (value, len) {
      if (!value) return ''
      if (value.length > len) {
        return value.slice(0, len) + '...'
      }
      return value
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
.el-col {
  height: 358px;
}

.tree-box {
  overflow-x: auto;
}
.form-container{
  padding: 0 8px;
}
::v-deep .el-table{
  border: 1px solid transparent !important;
}
::v-deep .el-table th.el-table__cell.is-leaf, .el-table td.el-table__cell{
  border-bottom: 1px solid transparent  !important;
}
</style>
