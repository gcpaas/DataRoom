<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-loading="saveLoading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="dataroom-dataset-el-scrollbar">
      <div class="header">
        <page-header
          :title="
            !isEdit
              ? '存储过程数据集详情'
              : dataForm.id
                ? '编辑存储过程数据集'
                : '新增存储过程数据集'
          "
          :save-btn="isEdit"
          url="https://www.yuque.com/chuinixiongkou/bigscreen/procedure_dataset"
          @back="goBack"
          @save="save('form')"
        />
      </div>
      <el-row>
        <el-col :span="isEdit ? 10 : 24">
          <span class="dataroom-dataset-basic-info">
            基本信息
          </span>
          <el-form
            ref="form"
            :model="dataForm"
            :rules="rules"
            label-width="120px"
            style="padding: 16px 16px 0"
            class="bs-el-form"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="数据集名称"
                  prop="name"
                >
                  <el-input
                    v-model="dataForm.name"
                    class="bs-el-input"
                    clearable
                    :disabled="!isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="分组"
                  prop="typeId"
                >
                  <type-select
                    :type-id="dataForm.typeId"
                    @update="dataForm.typeId = $event"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="备注"
                  prop="remark"
                >
                  <el-input
                    v-model="dataForm.remark"
                    class="bs-el-input"
                    :disabled="!isEdit"
                  />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="数据源"
                  prop="sourceId"
                >
                  <el-select
                    v-model="dataForm.sourceId"
                    clearable
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    filterable
                    placeholder="请选择数据源"
                    :disabled="!isEdit"
                    @change="setSqlProcess($event)"
                  >
                    <el-option
                      v-for="source in sourceList"
                      :key="source.id"
                      :label="source.sourceName"
                      :value="source.id"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item
                  label="缓存"
                  prop="cache"
                >
                  <el-radio-group
                    v-model="dataForm.cache"
                    class="bs-el-radio-group"
                  >
                    <el-radio :label="1">
                      开启
                    </el-radio>
                    <el-radio :label="0">
                      关闭
                    </el-radio>
                  </el-radio-group>
                  <el-tooltip
                    class="item"
                    effect="light"
                    content="开启缓存:会在首次调用该数据集时，将结果缓存，在接下来的十分钟内，若再次被调用则直接返回缓存中的数据，注意：在当前数据集编辑页面缓存不生效"
                    placement="top"
                    popper-class="dataroom-el-tooltip"
                  >
                    <i
                      class="el-icon-warning-outline"
                      style="color: #e3c98c; margin-left: 16px; font-size: 14px"
                    />
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <el-col :span="24">
                <el-form-item
                  label="标签"
                  prop="labelIds"
                >
                  <LabelSelect
                    :dataset-id="datasetId"
                    :id-list="dataForm.labelIds"
                    @commit="
                      (ids) => {
                        dataForm.labelIds = ids;
                      }
                    "
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
          <div
            v-if="isEdit"
            class="sql-config"
          >
            <div>
              <codemirror
                ref="targetInSql"
                v-model="dataForm.sqlProcess"
                :options="cOptions"
                style="margin-top: 2px; border: 1px solid #EBEEF5"
              />
              <div class="bs-codemirror-bottom-text">
                示例：
                <strong>call 存储过程名称(<span style="color: #cc7832">${参数名称}</span>,?)，SqlServer数据源使用：exec 存储过程名称
                  <span style="color: #cc7832">@参数名称</span>=?</strong>
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0">
              <el-button
                type="primary"
                @click="buildParamsAndRun"
              >
                解析并运行
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col
          v-if="isEdit"
          :span="14"
        >
          <div class="dataroom-dataset-right-setting">
            <params-config
              v-if="paramsListCopy"
              ref="paramsConfig"
              :data="paramsListCopy"
            />
          </div>
        </el-col>
      </el-row>
      <div
        v-if="isEdit"
        style="margin-top: 12px"
      >
        <data-preview
          ref="dataPreview"
          :data="dataPreviewList"
          :header-fields="headerFields"
          :header-column="dataPreviewList.length>0 ? Object.keys(dataPreviewList[0]) : []"
        />
        <div class="dataroom-dataset-stored-table-bottom-desc">
          <span v-show="dataPreviewList.length">数据预览中，存储过程仅展示20条数据</span>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import PageHeader from '@gcpaas/data-room-ui/packages/dataSet/components/PageHeader.vue'
import DataPreview from '@gcpaas/data-room-ui/packages/dataSet/components/DataPreview.vue'
import ParamsConfig from '@gcpaas/data-room-ui/packages/dataSet/components/ParamsConfig.vue'
import LabelSelect from '@gcpaas/data-room-ui/packages/dataSet/components/LabelSelect.vue'
import TypeSelect from '@gcpaas/data-room-ui/packages/dataSet/components/TypeSelect'
import {
  nameCheckRepeat,
  datasetAdd,
  datasetUpdate,
  datasetExecuteTest,
  getDataset
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
import { datasourceList } from '@gcpaas/data-room-ui/packages/assets/js/api/dataSourceService.js'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
import 'codemirror/mode/sql/sql.js'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/dataset.js'

export default {
  name: 'StoredProcedureEditForm',
  components: {
    PageHeader,
    DataPreview,
    ParamsConfig,
    codemirror,
    LabelSelect,
    TypeSelect
  },
  mixins: [datasetMixin],
  data () {
    const validateName = (rule, value, callback) => {
      nameCheckRepeat({
        id: this.datasetId,
        name: value
      }).then((r) => {
        if (r) {
          callback(new Error('数据集名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      headerFields: [],
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        datasetType: 'storedProcedure',
        remark: '',
        labelIds: [],
        // 以下为config配置
        sourceId: '',
        cache: 0,
        sqlProcess: 'call ',
        paramsList: [],
        fieldDesc: {},
        fieldList: [],
        code: '',
        script: '',
        cacheCoherence: null
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        sourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
        ],
        typeId: [{ required: true, message: '请选择分组', trigger: 'blur' }]
      },
      cOptions: {
        mode: 'text/x-mysql',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'eclipse',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      sourceList: [],
      msg: '',
      exception: '',
      passTest: false, // 通过测试
      // paramsVisible: false,
      tableNameList: [],
      paramsListCopy: [],
      isTest: false // 是否执行测试
    }
  },
  computed: {
    checkPass () {
      return {
        sqlProcess: this.dataForm.sqlProcess,
        script: this.dataForm.script,
        paramsList: this.dataForm.paramsList
      }
    },
    noDataTableDisplayFields () {
      // 表格列对象
      const tableColumnObject = {}
      this.structurePreviewList.forEach((item) => {
        tableColumnObject[item.fieldName] = ''
      })
      return tableColumnObject
    }
  },
  watch: {
    checkPass: {
      handler (value) {
        this.passTest = false
      },
      deep: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     * 1. 获取数据源列表
     * 2. 获取数据集详情
     */
    async init () {
      this.getDataSource()
      if (!this.datasetId) {
        return
      }
      // 获取详情
      getDataset(this.datasetId).then((res) => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.datasetType = res.datasetType
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        this.dataForm.cache = res.cache
        // config 配置
        this.dataForm.sqlProcess = res.config.sqlProcess
        this.dataForm.paramsList = res.config.paramsList
          ? res.config.paramsList
          : []
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.fieldList = res.config.fieldList
        if (res.config.fieldList && res.config.fieldList.length > 0) {
          this.headerFields = res.config.fieldList
        }
        this.dataForm.cacheCoherence = res.config.cacheCoherence
        // 使用传入的数据集名称 ？
        this.dataForm.name = this.datasetName
        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
        this.datasetTest(false)
      })
    },
    /**
     * 获取数据源列表
     */
    getDataSource () {
      const params = {
        sourceName: '',
        sourceType: ''
      }
      datasourceList(params).then((data) => {
        this.sourceList = data
      })
    },
    setSqlProcess (v, e) {
      for (let i = 0; i < this.sourceList.length; i++) {
        if (this.sourceList[i].id === v) {
          if (this.sourceList[i].sourceType === 'sqlserver') {
            if (this.dataForm.sqlProcess === 'call ') {
              this.dataForm.sqlProcess = 'exec '
            }
          } else {
            if (this.dataForm.sqlProcess === 'exec ') {
              this.dataForm.sqlProcess = 'call '
            }
          }
        }
      }
    },
    /**
     * 打开参数配置弹窗
     */
    openParamsConfig () {
      this.isTest = false
      // this.paramsVisible = true
    },
    /**
     * 删除参数配置
     * @param {*} index
     */
    delRow (index) {
      this.paramsListCopy.splice(index, 1)
    },
    /**
     * 新增参数配置
     */
    addParam () {
      this.paramsListCopy.push({
        name: '',
        type: '',
        value: '',
        status: 1,
        require: 0,
        remark: ''
      })
    },
    /**
     * 保存
     * @param formName
     * @param noCheckToSave 是否跳过检查直接保存
     */
    save (formName, noCheckToSave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保数据集SQL加工脚本不为空且运行通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该存储过程未生成输出字段，请重新检查')
        return
      }
      // if (!noCheckToSave) {
      //   const temp = this.structurePreviewList.some(item => {
      //     return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
      //   }) // true-存在为空
      //   if (temp) {
      //     this.fieldDescVisible = true
      //     return
      //   }
      // }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        // 从params-config 组件中获取参数
        this.dataForm.paramsList = cloneDeep(
          this.$refs.paramsConfig?.innerData ?? []
        )
        // 检查参数名称是否重复
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map((value) => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        // 组装输出字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach((r) => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        this.dataForm.fieldList = this.structurePreviewList.length
          ? this.structurePreviewList
          : []
        const { headerColumnObj } = this.$refs.dataPreview ?? {}
        const fieldList = Object.values(headerColumnObj ?? {}).map(
          ({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
            fieldName,
            fieldDesc,
            fieldType
          })
        )
        this.saveLoading = true
        this.saveText = '正在保存...'
        const dataSave = this.dataForm.id ? datasetUpdate : datasetAdd
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'storedProcedure',
          remark: this.dataForm.remark,
          sourceId: this.dataForm.sourceId,
          cache: this.dataForm.cache,
          labelIds: this.dataForm.labelIds,
          config: {
            className:
              'com.gccloud.dataset.entity.config.StoredProcedureDataSetConfig',
            sourceId: this.dataForm.sourceId,
            sqlProcess: this.dataForm.sqlProcess,
            paramsList: this.dataForm.paramsList,
            fieldList,
            fieldDesc: this.dataForm.fieldDesc
          }
        }
        dataSave(datasetParams)
          .then(() => {
            this.$message.success('保存成功')
            this.$parent.init(false)
            this.$parent.setType = null
            this.saveLoading = false
            this.saveText = ''
            this.goBack()
          })
          .catch(() => {
            this.saveLoading = false
            this.saveText = ''
          })
        this.saveLoading = false
        this.saveText = ''
      })
    },
    /**
     * 解析参数配置，并且执行测试
     */
    buildParamsAndRun () {
      this.isTest = true
      // const reg = /\${(.*?)}/g
      // const paramNames = [...new Set([...this.dataForm.sqlProcess.matchAll(reg)].map(item => item[1]))]
      // const names = this.dataForm.paramsList.map(item => item.name)
      // const params = []
      // paramNames.forEach(name => {
      //   if (names.includes(name)) {
      //     const param = this.dataForm.paramsList.find(item => item.name === name)
      //     params.push(param)
      //   } else {
      //     params.push({
      //       name: name,
      //       type: 'String',
      //       value: '',
      //       status: 1,
      //       require: 0,
      //       remark: ''
      //     })
      //   }
      // })
      // 从params-config 组件中获取参数
      this.dataForm.paramsList = cloneDeep(
        this.$refs.paramsConfig?.innerData ?? []
      )
      // this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      // if (this.dataForm.paramsList.length) {
      // this.paramsVisible = true
      // } else {
      this.datasetTest()
      // }
    },

    goBack () {
      this.$emit('back')
    },
    /**
     * 执行测试
     * @param val
     */
    datasetTest (val = true) {
      if (this.dataForm.sourceId === '') {
        this.$message.error('请选择数据源')
        return
      }
      if (this.dataForm.sqlProcess === '') {
        this.$message.error('请输入数据集SQL加工脚本')
        return
      }
      if (this.dataForm.paramsList.length > 0) {
        const names = this.dataForm.paramsList.map((value) => value.name)
        const namesSet = new Set(names)
        if (namesSet.size !== names.length) {
          this.$message.error('参数名称不能重复，请重新输入')
          return
        }
      }
      // 点击测试初始化分页当前页为1
      if (val === true) {
        this.current = 1
      }
      this.saveLoading = true
      // 组装数据集执行参数
      const executeParams = {
        dataSourceId: this.dataForm.sourceId,
        script: this.dataForm.sqlProcess,
        params: this.dataForm.paramsList,
        dataSetType: 'storedProcedure',
        // 存储过程数据集默认查询20条数据
        size: 20,
        current: 1
      }
      datasetExecuteTest(executeParams)
        .then((res) => {
          this.dataPreviewList = res.data.list
          this.structurePreviewList = res.structure
          if (this.headerFields.length === 0) {
            this.headerFields = cloneDeep(res.structure)
          }
          // 输出字段描述合并
          this.structurePreviewList.forEach((field) => {
            const fieldInfo = this.dataForm.fieldList.find(
              (item) => item.fieldName === field.fieldName
            )
            if (fieldInfo) {
              const { fieldDesc, orderNum, sourceTable, ...rest } = fieldInfo
              field.fieldDesc = fieldDesc
              field.orderNum = orderNum
              field.sourceTable = sourceTable
              Object.keys(rest).forEach((key) => {
                if (!field.hasOwnProperty(key)) {
                  this.$set(field, key, rest[key])
                }
              })
            }
          })

          // this.structurePreviewList = this.dataForm.fieldList.map(field => {
          //   const fieldInfo = this.structurePreviewList.find(item => item.fieldName === field.fieldName)
          //   if (fieldInfo) {
          //     return {
          //       ...field,
          //       fieldDesc: field.fieldDesc,
          //       orderNum: field.orderNum,
          //       sourceTable: field.sourceTable
          //     }
          //   }
          // })
          this.structurePreviewList.forEach((item) => {
            if (!item.hasOwnProperty('orderNum')) {
              this.$set(item, 'orderNum', 0)
            }
            if (!item.hasOwnProperty('sourceTable')) {
              this.$set(item, 'sourceTable', '')
            }
            if (!item.hasOwnProperty('fieldDesc')) {
              this.$set(item, 'fieldDesc', '')
            }
          })
          this.totalCount = res.data.totalCount
          this.tableNameList = res.tableNameList
          // 如果只有一个表，自动填充字段表名
          if (this.tableNameList && this.tableNameList.length === 1) {
            this.structurePreviewList.forEach((item) => {
              item.sourceTable = this.tableNameList[0]
            })
          }
          this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
          let paramsNameCheck = false
          this.dataForm.paramsList.forEach((param) => {
            const checkList = this.structurePreviewList.filter(
              (item) => item.fieldName === param.name
            )
            if (checkList.length) {
              paramsNameCheck = true
              param.name = ''
            }
          })
          if (paramsNameCheck) {
            this.$message.warning('参数名称不可以与字段名相同！')
            this.passTest = false
          } else {
            if (val) this.$message.success('脚本执行通过')
            this.exception = ''
            this.msg = ''
            this.passTest = true
          }
          this.saveLoading = false
        })
        .catch((e) => {
          this.passTest = false
          this.saveLoading = false
        })
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../assets/css/index.scss";
.dataroom-dataset-stored-table-bottom-desc{
  font-size: 12px;
  text-align: right;
  margin-bottom: 8px;
  padding-right: 16px;
}

.dataroom-dataset-el-scrollbar {
  height: 100%;
  overflow-y: auto;
  overflow-x: none;
}

// .tree-box {
//   padding: 0;
//   max-height: 270px;
// }

::v-deep .el-input__inner {
  width: 100% !important;
}

.sql-config {
  padding: 0 16px;
}

.operation {
  ::v-deep .el-select {
    width: 200px !important;
    margin-right: 16px;
  }

  display: flex;
}

// .codeStyle {
//   border: 1px solid #EBEEF5;
// }
::v-deep .CodeMirror {
  height: 180px !important;
  font-family: Helvetica, Tahoma;
  // .CodeMirror-scroll {
  //   background: #fff;
  //   .CodeMirror-gutters {
  //     background-color: #f6f7fb;
  //   }
  // }
}

.no-border {
  border: 0;
}

::v-deep .fieldDescCheck {
  .el-dialog__body {
    height: fit-content !important;
    min-height: unset !important;
  }
}

.title-style {
  padding: 8px 12px;
  background-color: #f6f7fb;
  border-left: 5px solid #606266;
  margin: 16px 16px 0 0;
}

.field-wrap {
  overflow: auto;
  margin-right: 16px;

  .field-item {
    line-height: 32px;
    padding: 0 12px 0 16px;
    cursor: pointer;

    .edit_field {
      display: none;
    }

    &:hover {
      background-color: #f2f7fe;

      .edit_field {
        display: block;
      }
    }
  }
}

.result-view {
  font-size: 14px;
  font-weight: 600;
  color: var(--bs-el-text);
  position: relative;
  padding: 16px 0;
  padding-left: 12px;
  border-bottom: 1px solid var(--bs-background-1);

  &::before {
    content: "";
    height: 14px;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    border-left: 4px solid var(--bs-el-color-primary);
  }
}

// ::v-deep .dataroom-table-box.is-Edit .el-table {
//   max-height: unset !important;

//   .el-table__body-wrapper {
//     max-height: unset !important;
//   }
// }

// .dataroom-table-box {
//   height: 100% !important;
//   margin-bottom: 0 !important;
// }
.bs-el-select {
  width: 100% !important;
}
::v-deep .el-input__inner {
  width: 100% !important;
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
