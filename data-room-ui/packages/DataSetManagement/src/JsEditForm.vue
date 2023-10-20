<template>
  <div
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? 'JS数据集详情' : dataForm.id ? '编辑JS数据集' : '新增JS数据集' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/kv26b7ytvvbq7twi')"
                >
                  帮助
                </el-button>
                <el-button
                  v-if="isEdit"
                  type="primary"
                  @click="save('form')"
                >
                  保存
                </el-button>
                <el-button
                  class="bs-el-button-default"
                  @click="goBack"
                >
                  返回
                </el-button>
              </div>
            </div>
          </template>
        </el-page-header>
      </div>
      <el-row style="margin: 16px 16px 0;">
        <el-col :span="isEdit ? 16 : 24">
          <el-form
            ref="form"
            :model="dataForm"
            :rules="rules"
            label-width="120px"
            style="padding: 16px 16px 0;"
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
                  <el-select
                    ref="selectParentName"
                    v-model="dataForm.typeId"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    placeholder="请选择分组"
                    clearable
                    :disabled="!isEdit"
                    filterable
                    :filter-method="selectorFilter"
                    @clear="clearType"
                    @visible-change="setCurrentNode"
                  >
                    <el-option
                      style="height: auto;padding: 0;"
                      :label="typeName"
                      :value="dataForm.typeId"
                    >
                      <div class="tree-box">
                        <el-tree
                          ref="categorySelectTree"
                          :data="categoryData"
                          node-key="id"
                          :indent="0"
                          :props="{ label: 'name', children: 'children' }"
                          :default-expand-all="true"
                          :highlight-current="true"
                          :expand-on-click-node="false"
                          class="bs-el-tree"
                          :filter-node-method="treeFilter"
                          @node-click="selectParentCategory"
                        >
                          <span
                            slot-scope="{ data }"
                            class="custom-tree-node"
                          >
                            <span>
                              <i
                                :class="data.children && data.children.length ? 'el-icon el-icon-folder' : 'el-icon el-icon-document'"
                              />
                              {{ data.name }}
                            </span>
                          </span>
                        </el-tree>
                      </div>
                    </el-option>
                  </el-select>
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
                  label="标签"
                  prop="labelIds"
                >
                  <LabelSelect
                    :dataset-id="datasetId"
                    :id-list="dataForm.labelIds"
                    @commit="(ids) =>{dataForm.labelIds = ids}"
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
                v-model="dataForm.config.script"
                :options="codemirrorOption"
                style="margin-top: 2px"
              />
            </div>
            <div class="bs-codemirror-bottom-text">
              <strong>请使用 return 将运行结果返回出来，结果数据需要为数组格式</strong>
              <br>
              <strong>动态参数使用： 使用${}将参数包裹，例如：let name = <span style="color: red;">${name}。</span>
              </strong>
            </div>
            <div style="text-align: center; padding: 16px 0;">
              <el-button
                type="primary"
                @click="scriptExecute()"
              >
                解析并运行
              </el-button>
            </div>
          </div>
        </el-col>
        <el-col
          v-if="isEdit"
          :span="8"
        >
          <div class="right-setting">
            <div class="paramConfig">
              <div class="title-style bs-title-style">
                动态参数
                <el-button
                  type="text"
                  style="float: right;border: none;margin-top: -4px;"
                  @click="$refs.paramsSettingDialog.open()"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="param in dataForm.config.paramsList"
                  :key="param.name"
                  class="field-item"
                  @click="$refs.paramsSettingDialog.open()"
                >
                  <span>{{ param.name }}</span>&nbsp;<span
                    v-show="param.remark"
                    style="color: #909399;"
                  >
                    ({{ param.remark }})
                  </span>
                  <el-button
                    class="edit_field"
                    type="text"
                    style="float: right;border: none;margin-top: 2px;"
                    @click="$refs.paramsSettingDialog.open()"
                  >
                    配置
                  </el-button>
                </div>
              </div>
            </div>
            <div class="structure">
              <div class="title-style bs-title-style">
                输出字段
                <el-button
                  type="text"
                  style="float: right;border: none;margin-top: -4px;"
                  @click="$refs.outputFieldDialog.open()"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="(field, key) in outputFieldList"
                  :key="key"
                  class="field-item"
                  @click="$refs.outputFieldDialog.open()"
                >
                  <span>{{ field.fieldName }}</span>&nbsp;
                  <span
                    v-show="field.fieldDesc"
                    style="color: #909399;"
                  >
                    ({{ field.fieldDesc }})</span>
                  <el-button
                    class="edit_field"
                    type="text"
                    style="float: right;border: none;margin-top: 2px;"
                    @click="$refs.outputFieldDialog.open()"
                  >
                    配置
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div
        v-if="isEdit"
        class="dataPreView"
        style="margin-top: 12px;"
      >
        <div class="result-view">
          数据预览
        </div>
        <div
          v-loading="tableLoading"
          class="bs-table-box is-Edit bs-scrollbar"
        >
          <el-table
            align="center"
            :data="dataPreviewList"
            max-height="400"
            :border="true"
            class="bs-el-table bs-scrollbar"
          >
            <el-table-column
              v-for="(value, key) in dataPreviewList[0]"
              :key="key"
              :label="key"
              align="center"
              show-overflow-tooltip
              :render-header="renderHeader"
            >
              <template slot-scope="scope">
                <span>{{ scope.row[key] }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div
        v-if="!isEdit"
        class="dataPreView"
      >
        <el-tabs v-model="activeName">
          <el-tab-pane
            v-loading="tableLoading"
            label="数据预览"
            name="data"
          >
            <div class="bs-table-box">
              <el-table
                align="center"
                :data="dataPreviewList"
                max-height="400"
                class="bs-el-table"
              >
                <el-table-column
                  v-for="(value, key) in dataPreviewList[0]"
                  :key="key"
                  :label="key"
                  align="center"
                  show-overflow-tooltip
                  :render-header="renderHeader"
                >
                  <template slot-scope="scope">
                    <span>{{ scope.row[key] }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
          <el-tab-pane
            v-loading="tableLoading"
            label="数据集结构"
            name="structure"
          >
            <div class="bs-table-box">
              <el-table
                max-height="400"
                :data="outputFieldList"
                :border="true"
                align="center"
              >
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="fieldName"
                  label="字段值"
                />
                <el-table-column
                  align="center"
                  prop="fieldDesc"
                  label="字段描述"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="isEdit"
                      v-model="scope.row.fieldDesc"
                      size="small"
                      class="labeldsc bs-el-input"
                    />
                    <span v-else>{{ scope.row.fieldDesc }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <ParamsSettingDialog
        ref="paramsSettingDialog"
        :params-list="dataForm.config.paramsList"
        @saveParams="saveParams"
      />
      <OutputFieldDialog
        ref="outputFieldDialog"
        :output-field-list="outputFieldList"
        @setFieldList="(list) => { outputFieldList = list }"
      >
        <template #output-field-table-column>
          <slot name="output-field-table-column" />
        </template>
      </OutputFieldDialog>
    </el-scrollbar>
    <FieldFillDialog
      ref="fieldFillDialog"
      @fieldDescFill="fieldDescFill"
      @fieldDescEdit="fieldDescEdit"
      @toSave="toSave"
    />
  </div>
</template>

<script>
import LabelSelect from 'data-room-ui/DataSetLabelManagement/src/LabelSelect.vue'
import ParamsSettingDialog from './JsComponents/ParamsSettingDialog.vue'
import OutputFieldDialog from './JsComponents/OutputFieldDialog.vue'
import FieldFillDialog from './JsComponents/FieldFillDialog.vue'
import { nameCheckRepeat, datasetAdd, datasetUpdate, getDataset, getCategoryTree } from 'data-room-ui/js/utils/datasetConfigService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
export default {
  name: 'JsEditForm',
  components: {
    codemirror,
    FieldFillDialog,
    ParamsSettingDialog,
    OutputFieldDialog,
    LabelSelect
  },
  props: {
    config: {
      type: Object,
      default: () => { }
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    datasetId: {
      type: String,
      default: null
    },
    typeId: {
      type: String,
      default: ''
    },
    appCode: {
      type: String,
      default: ''
    }
  },
  data () {
    const validateName = (rule, value, callback) => {
      nameCheckRepeat({
        id: this.datasetId,
        name: value,
        moduleCode: this.appCode
      }).then((r) => {
        if (r) {
          callback(new Error('数据集名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      autoFill: true,
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        remark: '',
        labelIds: [],
        config: {
          script: '',
          paramsList: []
        }
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: '请选择分组', trigger: 'blur' }
        ]
      },
      codemirrorOption: {
        mode: 'text/javascript',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      activeName: 'data',
      dataPreviewList: [],
      outputFieldList: [],
      structurePreviewListCopy: [],
      typeName: '',
      categoryData: [],
      // fieldDescVisible: false,
      fieldsetVisible: false,
      paramsVisible: false,
      tableLoading: false,
      saveloading: false,
      saveText: '',
      // paramsListCopy: [],
      isSet: false, // 参数是否配置状态
      passTest: false,
      fieldDesc: null // 字段描述
    }
  },
  watch: {
    'dataForm.config.script' (val) {
      if (!val) {
        this.passTest = false
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    async init () {
      this.categoryData = await getCategoryTree({ tableName: 'dataset', moduleCode: this.appCode })
      if (this.typeId) {
        this.dataForm.typeId = this.typeId
        this.$nextTick(() => {
          try {
            this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
          } catch (error) {
            console.error(error)
          }
        })
      }
      if (this.datasetId) {
        getDataset(this.datasetId).then(res => {
          const { id, name, typeId, remark, datasetType, moduleCode, editable, sourceId, config } = res
          const { script, paramsList, fieldDesc, fieldList } = config
          this.dataForm = { id, name, typeId, remark, datasetType, moduleCode, editable, sourceId, config: { script, paramsList }, labelIds: this.dataForm.labelIds }
          this.fieldDesc = fieldDesc
          this.outputFieldList = fieldList
          this.scriptExecute(true)
        })
      }
    },
    // 保存数据集
    save (formName, nochecktosave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保脚本不为空且执行通过')
        return
      }
      if (!this.outputFieldList.length) {
        this.$message.warning('该执行脚本未生成输出字段，请重新检查')
        return
      }
      if (!nochecktosave) {
        const temp = this.outputFieldList.some(item => {
          return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
        }) // true-存在为空
        if (temp) {
          this.$refs.fieldFillDialog.open()
          // this.fieldDescVisible = true
          return
        }
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.saveloading = true
          this.saveText = '正在保存...'
          const { datasetId, dataForm, appCode, fieldDesc, outputFieldList } = this
          const form = {
            id: datasetId,
            name: dataForm.name,
            typeId: dataForm.typeId,
            remark: dataForm.remark,
            datasetType: 'js',
            moduleCode: appCode,
            editable: appCode ? 1 : 0,
            labelIds: dataForm.labelIds,
            config: {
              className: 'com.gccloud.dataset.entity.config.JsDataSetConfig',
              script: dataForm.config.script,
              fieldDesc,
              paramsList: dataForm.config.paramsList,
              fieldList: outputFieldList
            }
          }
          const datasetSave = this.dataForm.id === '' ? datasetAdd : datasetUpdate
          datasetSave(form).then(() => {
            this.$message.success('操作成功')
            this.$parent.init(false)
            this.$parent.setType = null
            this.saveloading = false
            this.saveText = ''
            this.goBack()
          }).catch(() => {
            this.saveloading = false
            this.saveText = ''
          })
        }
      })
    },
    saveParams (val) {
      this.dataForm.config.paramsList = val
    },
    // 取消操作
    // cancelField () {
    //   this.structurePreviewListCopy = cloneDeep(this.outputFieldList)
    //   this.fieldsetVisible = false
    // },
    // 设置输出字段
    setField () {
      // this.outputFieldList = cloneDeep(this.structurePreviewListCopy)
      // if (this.outputFieldList.length) {
      //   this.fieldDesc = {}
      //   this.outputFieldList.forEach(key => {
      //     this.fieldDesc[key.fieldName] = key.fieldDesc
      //   })
      // } else {
      //   this.fieldDesc = null
      // }
      // this.fieldsetVisible = false
    },
    // 字段值填充
    fieldDescFill () {
      this.fieldDesc = {}
      this.outputFieldList.forEach(field => {
        if (field.fieldDesc === '' || !field.hasOwnProperty('fieldDesc')) {
          field.fieldDesc = field.fieldName
          this.fieldDesc[field.fieldName] = field.fieldName
        } else {
          this.fieldDesc[field.fieldName] = field.fieldDesc
        }
      })
      this.save('form')
      this.$refs.fieldFillDialog.close()
      // this.fieldDescVisible = false
    },
    // 进入编辑
    fieldDescEdit () {
      this.$refs.fieldFillDialog.close()
      // this.fieldDescVisible = false
      this.fieldsetVisible = true
    },
    // 继续保存
    toSave () {
      this.fieldDesc = {}
      this.outputFieldList.forEach(field => {
        this.fieldDesc[field.fieldName] = field.fieldDesc
      })
      this.save('form', true)
      this.$refs.fieldFillDialog.close()
      // this.fieldDescVisible = false
    },
    // 字段描述构建及同步
    buildFieldDesc () {
      const fieldDesc = {}
      this.outputFieldList.forEach(field => {
        if (this.fieldDesc.hasOwnProperty(field.fieldName)) {
          field.fieldDesc = this.fieldDesc[field.fieldName]
        }
        fieldDesc[field.fieldName] = field.fieldDesc
      })
      this.fieldDesc = fieldDesc
    },
    // 脚本执行
    scriptExecute (isInit = false) {
      if (this.dataForm.config.script) {
        const javascript = this.dataForm.config.script
        let scriptMethod = null
        try {
          const scriptAfterReplacement = javascript.replace(/\${(.*?)}/g, (match, p) => {
            const value = this.dataForm.config.paramsList.find(param => param.name === p).value
            if (value === null || value === undefined || value === '') {
              return "''"
            } else if (!isNaN(value)) {
              return value
            } else {
              return `'${value}'`
            }
          })
          // eslint-disable-next-line no-new-func
          scriptMethod = new Function(scriptAfterReplacement)
        } catch (error) {
          this.passTest = false
          const javascriptParams = javascript.match(/\${(.*?)}/g)
          // 取出${}中的参数名
          let paramList = []
          if (javascriptParams) {
            javascriptParams.forEach(item => {
              const name = item.replace(/\${(.*?)}/g, '$1')
              const param = this.dataForm.config.paramsList.find(param => param.name === name)
              if (!param) {
                // 添加确认框，是否填充参数
                paramList.push(name)
              }
            })
            if (this.autoFill && paramList.length > 0) {
              this.addParams(paramList)
              paramList = []
            }
          } else {
            console.info(error)
            this.$message.error(`脚本执行错误，请检查脚本，具体错误：${error}`)
          }
          return
        }
        // 调用方法生成随机数据
        const returnResult = scriptMethod()
        //  检查数据是否为数组
        if (!Array.isArray(returnResult)) {
          this.passTest = false
          this.$message.error('脚本执行结果不是数组，请检查脚本')
          return
        }
        const keys = []
        returnResult.forEach(item => {
          Object.keys(item).forEach(key => {
            if (!keys.includes(key)) {
              keys.push(key)
            }
          })
        })
        if (this.outputFieldList.length === 0) {
          this.outputFieldList = keys.map(item => {
            return {
              fieldName: item,
              fieldDesc: ''
            }
          })
        }
        // 如果脚本有变化，生成的keys和outputFieldList的长度不一致，就重新生成outputFieldList，仅删除或添加变化的那个字段，其余的不变化
        if (this.outputFieldList.length !== keys.length) {
          const newOutputFieldList = []
          keys.forEach(key => {
            const field = this.outputFieldList.find(item => item.fieldName === key)
            if (field) {
              newOutputFieldList.push(field)
            } else {
              newOutputFieldList.push({
                fieldName: key,
                fieldDesc: ''
              })
            }
          })
          this.outputFieldList = newOutputFieldList
        }
        // 如果脚本有变化，生成的keys和outputFieldList的长度一致，仅字段名变化了，就重新生成outputFieldList
        if (this.outputFieldList.length === keys.length) {
          const newOutputFieldList = []
          keys.forEach(key => {
            const field = this.outputFieldList.find(item => item.fieldName === key)
            if (field) {
              newOutputFieldList.push(field)
            } else {
              newOutputFieldList.push({
                fieldName: key,
                fieldDesc: ''
              })
            }
          })
          this.outputFieldList = newOutputFieldList
        }
        // 如果有字段描述，就同步
        if (this.outputFieldList.length && this.fieldDesc && !isInit) {
          this.buildFieldDesc()
        }
        // 如果有数据，就通过测试
        if (this.outputFieldList.length > 0) {
          // this.structurePreviewListCopy = cloneDeep(this.outputFieldList)
          this.dataPreviewList = returnResult
          this.passTest = true
          if (!isInit) {
            this.$message.success('脚本执行通过')
          }
        } else {
          this.passTest = false
        }
      } else {
        this.passTest = false
        this.$message.error('请填写脚本')
      }
    },
    addParams (paramList) {
      paramList.forEach(name => {
        this.dataForm.config.paramsList.push({
          name,
          type: '',
          value: '',
          status: 1,
          require: 0,
          remark: ''
        })
      })
      this.$nextTick(() => {
        this.$refs.paramsSettingDialog.open()
      })
    },
    // 执行事件
    // toExecute () {
    // if (this.dataForm.config.paramsList.length) {
    //   this.isSet = false
    //   this.paramsVisible = true
    // } else {
    // 无参数，直接执行脚本
    // this.scriptExecute()
    // }
    // },
    // 清空分类
    clearType () {
      this.typeName = ''
      this.dataForm.typeId = ''
    },
    // 分类展开高亮
    setCurrentNode ($event) {
      if ($event) {
        const key = this.dataForm.typeId || null
        this.$refs.categorySelectTree.setCurrentKey(key)
      }
    },
    // openParamsSetting () {
    //   this.$refs.paramsSettingDialog.open()
    // },
    // 分类选择
    selectParentCategory (value) {
      this.dataForm.typeId = value.id
      this.typeName = value.name
      this.$refs.selectParentName.blur()
    },
    goBack () {
      this.$emit('back')
    },
    renderHeader (h, { column, index }) {
      const labelLong = column.label.length // 表头label长度
      const size = 14 // 根据需要定义标尺，直接使用字体大小确定就行，也可以根据需要定义
      column.minWidth = labelLong * size < 120 ? 120 : labelLong * size // 根据label长度计算该表头最终宽度
      return h('span', { class: 'cell-content', style: { width: '100%' } }, [column.label])
    },
    openNewWindow (url) {
      window.open(url, '_blank')
    },
    selectorFilter (value) {
      this.$refs.categorySelectTree.filter(value)
    },
    treeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';

.data-set-scrollbar {
  height: 100%;
  overflow-y: auto;
  overflow-x: none;

  .el-scrollbar__view {
    height: 100%;
  }
}

::v-deep .el-input__inner {
  width: 100% !important;
}

.page-header {
  display: flex;
  position: relative;

  .page-header-right {
    position: absolute;
    right: 16px;
  }
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

::v-deep .CodeMirror {
  height: 180px !important;
  font-family: Helvetica, Tahoma;
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
  border-left: 5px solid var(--bs-el-color-primary);
  margin: 16px 16px 0 0;
}

.field-wrap {
  // max-height: 110px;
  overflow: auto;
  margin-right: 16px;
  cursor: pointer;

  .field-item {
    line-height: 32px;
    padding: 0 12px 0 16px;

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

.right-setting {
  height: 358px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .paramConfig {
    max-height: 179px;

    .field-wrap {
      max-height: 127px;
    }
  }

  .structure {
    flex: 1;
    overflow: hidden;

    .field-wrap {
      height: calc(100% - 40px);
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

::v-deep .bs-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.bs-table-box {
  padding: 0;
  height: 100% !important;
  margin-bottom: 0 !important;
}

.tree-box {
  padding: 0;
}

.bs-el-select{
  width: 100% !important;
}
::v-deep .el-input__inner{
  width: 100% !important;
}
</style>
