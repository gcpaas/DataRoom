<template>
  <div
    v-loading="saveLoading"
    class="inner-container "
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? 'JSON数据集详情' : dataForm.id ? '编辑JSON数据集' : '新增JSON数据集' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/json_dataset')"
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
                      <div>
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
          <div class="card-border">
            <vue-json-editor
              v-if="isEdit"
              v-model="dataForm.json"
              :show-btns="false"
              mode="code"
              @has-error="onError"
            />
            <vue-json-viewer
              v-else
              :value="dataForm.json"
              :expand-depth="5"
              sort
            />
          </div>
          <div
            v-if="isEdit"
            style="text-align: center; padding: 16px 0;"
          >
            <el-button
              type="primary"
              @click="analysisJSON"
            >
              解析并运行
            </el-button>
          </div>
        </el-col>
        <el-col
          v-if="isEdit"
          :span="8"
        >
          <div class="structure">
            <div class="title-style bs-title-style">
              输出字段
              <el-button
                type="text"
                style="float: right;border: none;margin-top: -4px;"
                @click="fieldsetVisible = true"
              >
                配置
              </el-button>
            </div>
            <div class="field-wrap bs-field-wrap">
              <div
                v-for="field in structurePreviewList"
                :key="field.fieldName"
                class="field-item"
                @click="fieldsetVisible = true"
              >
                <span>{{ field.fieldName }}</span>&nbsp;<span
                  v-show="field.fieldDesc"
                  style="color: #909399;"
                >({{
                  field.fieldDesc }})</span>
                <el-button
                  class="edit_field"
                  type="text"
                  style="float: right;border: none;margin-top: 2px;"
                  @click="fieldsetVisible = true"
                >
                  配置
                </el-button>
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
        <div class="bs-table-box is-Edit">
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
      </div>
      <!-- 字段填充方式 -->
      <el-dialog
        title="提示"
        :visible.sync="fieldDescVisible"
        width="420px"
        append-to-body
        :close-on-click-modal="false"
        custom-class="fieldDescCheck"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <p style="color:var(--bs-el-text);line-height: 24px;padding-left: 10px;display: flex;">
          <i
            class="el-icon-warning"
            style="color: #E6A23C;font-size: 24px;margin-right: 5px;"
          />存在字段描述信息为空，请确认
        </p>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="fieldDescFill"
          >使用字段名填充</el-button>
          <el-button
            class="bs-el-button-default"
            @click="fieldDescEdit"
          >进入编辑</el-button>
          <el-button
            type="primary"
            @click="toSave"
          >继续保存</el-button>
        </span>
      </el-dialog>
      <!-- 字段填充 -->
      <el-dialog
        title="输出字段配置"
        :visible.sync="fieldsetVisible"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
        :before-close="cancelField"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <div class="bs-table-box">
          <el-table
            :data="structurePreviewListCopy"
            :border="true"
            align="center"
            class="bs-el-table"
          >
            <el-empty slot="empty" />
            <el-table-column
              align="left"
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
            <!-- 添加一个插槽，供其他人可扩展表格列，并把表格列的数据返回出去 -->
            <slot name="output-field-table-column" />
          </el-table>
        </div>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="cancelField"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="setField"
          >
            确定
          </el-button>
        </span>
      </el-dialog>
    </el-scrollbar>
  </div>
</template>

<script>
import LabelSelect from 'data-room-ui/DataSetLabelManagement/src/LabelSelect.vue'
import vueJsonEditor from 'vue-json-editor-fix-cn'
import vueJsonViewer from 'vue-json-viewer'
import { getCategoryTree, datasetAdd, datasetUpdate, getDataset, nameCheckRepeat } from 'data-room-ui/js/utils/datasetConfigService'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixins } from 'data-room-ui/js/mixins/datasetMixin'
export default {
  name: 'JsonEditForm',
  components: {
    vueJsonEditor,
    vueJsonViewer,
    LabelSelect
  },
  mixins: [datasetMixins],
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
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        datasetType: 'json',
        remark: '',
        labelIds: [],
        // 以下为config配置
        json: '',
        fieldDesc: {},
        fieldList: []
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
      passTest: false // 通过测试
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     * 1. 获取分类树
     * 2. 获取数据集详情
     * 3. 分析JSON
     */
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
      if (!this.datasetId) {
        this.dataForm.json = []
        return
      }
      getDataset(this.datasetId).then(res => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.datasetType = res.datasetType
        this.dataForm.moduleCode = res.moduleCode
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        // config 配置
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.json = JSON.parse(res.config.json)
        if (this.dataForm.typeId) {
          this.$nextTick(() => {
            try {
              this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
            } catch (error) {
              console.error(error)
            }
          })
        }
        this.analysisJSON(null, true)
      })
    },
    /**
     * 保存数据集
     * @param  formName 表单名称
     * @param  noCheckToSave 保存时是否检查
     */
    save (formName, noCheckToSave = false) {
      if (!this.passTest) {
        this.$message.error('请确保JSON不为空且解析通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该JSON未生成输出字段，请重新检查')
        return
      }
      if (!noCheckToSave) {
        const temp = this.structurePreviewList.some(item => {
          return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
        }) // true-存在为空
        if (temp) {
          this.fieldDescVisible = true
          return
        }
      }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return
        }
        this.dataForm.fieldList = this.structurePreviewList.length ? this.structurePreviewList : []
        let datasetSave = null
        datasetSave = this.dataForm.id ? datasetUpdate : datasetAdd
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'json',
          remark: this.dataForm.remark,
          moduleCode: this.appCode,
          editable: this.appCode ? 1 : 0,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.JsonDataSetConfig',
            json: JSON.stringify(this.dataForm.json),
            fieldDesc: this.dataForm.fieldDesc,
            fieldList: this.dataForm.fieldList
          }
        }
        datasetSave(datasetParams).then(() => {
          this.$message.success('保存成功')
          this.$parent.init(false)
          this.$parent.setType = null
          this.saveLoading = false
          this.saveText = ''
          this.goBack()
        }).catch(() => {
          this.saveLoading = false
          this.saveText = ''
        })
      })
    },
    /**
     * 使用字段名作为字段描述
     */
    fieldDescFill () {
      this.dataForm.fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        if (field.fieldDesc === '' || !field.hasOwnProperty('fieldDesc')) {
          field.fieldDesc = field.fieldName
          this.dataForm.fieldDesc[field.fieldName] = field.fieldName
        } else {
          this.dataForm.fieldDesc[field.fieldName] = field.fieldDesc
        }
      })
      this.save('form')
      this.fieldDescVisible = false
    },
    /**
     * 跳过字段描述编辑直接保存
     */
    toSave () {
      this.dataForm.fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        this.dataForm.fieldDesc[field.fieldName] = field.fieldDesc
      })
      this.save('form', true)
      this.fieldDescVisible = false
    },
    /**
     * 保存字段描述编辑
     */
    setField () {
      this.structurePreviewList = cloneDeep(this.structurePreviewListCopy)
      if (this.structurePreviewList.length) {
        this.dataForm.fieldDesc = {}
        this.structurePreviewList.forEach(key => {
          this.dataForm.fieldDesc[key.fieldName] = key.fieldDesc
        })
      } else {
        this.dataForm.fieldDesc = null
      }
      this.fieldsetVisible = false
    },
    // json错误校验
    onError () {
      this.passTest = false
    },
    /**
     * 解析JSON
     * @param  $event 事件
     * @param  initAnalysis 是否初始化解析
     */
    analysisJSON ($event, initAnalysis = false) {
      if (Object.prototype.toString.call(this.dataForm.json) === '[object Object]') {
        // json为对象
        this.structurePreviewList = Object.keys(this.dataForm.json).map(key => {
          return {
            fieldName: key,
            fieldDesc: ''
          }
        })
        this.dataPreviewList = [cloneDeep(this.dataForm.json)]
        this.passTest = true
      } else if (Object.prototype.toString.call(this.dataForm.json) === '[object Array]') {
        // 为数组
        if (Object.prototype.toString.call(this.dataForm.json[0]) === '[object Object]') {
          this.structurePreviewList = Object.keys(this.dataForm.json[0]).map(key => {
            return {
              fieldName: key,
              fieldDesc: ''
            }
          })
          this.dataPreviewList = cloneDeep(this.dataForm.json)
          this.passTest = true
        } else {
          try {
            this.structurePreviewList = Object.keys(JSON.parse(this.dataForm.json[0])).map(key => {
              return {
                fieldName: key,
                fieldDesc: ''
              }
            })
            this.dataPreviewList = []
            this.dataForm.json.forEach(item => {
              this.dataPreviewList.push(JSON.parse(item))
            })
            this.passTest = true
          } catch (error) {
            this.passTest = false
            this.$message.warning('JSON格式错误')
          }
        }
      } else {
        try {
          const json = JSON.parse(this.dataForm.json)
          if (Object.prototype.toString.call(json) === '[object Object]') {
            // json为对象
            this.structurePreviewList = Object.keys(json).map(key => {
              return {
                fieldName: key,
                fieldDesc: ''
              }
            })
            this.dataPreviewList = [cloneDeep(json)]
            this.passTest = true
          } else if (Object.prototype.toString.call(json) === '[object Array]') {
            // 为数组
            if (Object.prototype.toString.call(json[0]) === '[object Object]') {
              this.structurePreviewList = Object.keys(json[0]).map(key => {
                return {
                  fieldName: key,
                  fieldDesc: ''
                }
              })
              this.dataPreviewList = cloneDeep(json)
              this.passTest = true
            } else {
              try {
                this.structurePreviewList = Object.keys(JSON.parse(json[0])).map(key => {
                  return {
                    fieldName: key,
                    fieldDesc: ''
                  }
                })
                this.dataPreviewList = []
                json.forEach(item => {
                  this.dataPreviewList.push(JSON.parse(item))
                })
                this.passTest = true
              } catch (error) {
                this.passTest = false
                this.$message.warning('JSON格式错误')
              }
            }
          }
        } catch (error) {
          this.passTest = false
          this.$message.warning('JSON格式错误')
        }
      }
      if (this.structurePreviewList.length && this.dataForm.fieldDesc) {
        this.buildFieldDesc()
      }
      if (this.passTest && !initAnalysis) {
        this.$message.success('脚本执行通过')
      }
      this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
    },
    /**
     * 构建字段描述
     */
    buildFieldDesc () {
      const fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        if (this.dataForm.fieldDesc.hasOwnProperty(field.fieldName)) {
          field.fieldDesc = this.dataForm.fieldDesc[field.fieldName]
        }
        fieldDesc[field.fieldName] = field.fieldDesc
      })
      this.dataForm.fieldDesc = fieldDesc
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
}

// .tree-box {
//   padding: 0;
//   max-height: 270px;
// }

.page-header {
  display: flex;
  position: relative;

  .page-header-right {
    position: absolute;
    right: 16px;
  }
}

.no-border {
  border: 0;
}

.title-tip {
  line-height: 40px;
  font-weight: 600;
  padding-left: 16px;
  position: relative;

  &::before {
    content: '';
    width: 4px;
    height: 20px;
    background: #3478f6;
    position: absolute;
    left: 6px;
    top: 10px;
  }
}

.card-border {
  margin: 0 16px;
  border: 1px solid #e4e4e4;
  max-height: 300px;
  overflow: auto;
  position: relative;

  .test-btn {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
  }
}

.transfer-wrap {
  width: fit-content;
  margin: 16px;
  max-height: 300px;
  overflow: auto;
}

::v-deep .jsoneditor-poweredBy,
::v-deep .jsoneditor-modes {
  display: none;
}

::v-deep .ace_editor.ace-jsoneditor {
  min-height: 250px;
}

.tag-wrap {
  .el-tag {
    margin-right: 8px;
  }
}

.title-style {
  padding: 8px 12px;
  background-color: #f6f7fb;
  border-left: 5px solid var(--bs-el-color-primary);
  margin: 16px 16px 0 0;
}

.field-wrap {
  max-height: 410px;
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

::v-deep .fieldDescCheck {
  .el-dialog__body {
    height: fit-content !important;
    min-height: unset !important;
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

::v-deep .ace_layer.ace_gutter-layer.ace_folding-enabled {
  background: #f6f7fb;
}

::v-deep .jsoneditor-menu {
  background: var(--bs-el-color-primary);
  border-color: var(--bs-el-color-primary);
}

::v-deep .jsoneditor-mode-code {
  border-color: var(--bs-el-color-primary);
}

.bs-table-box {
  margin-bottom: 0;
}

::v-deep .bs-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.bs-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

.bs-el-select{
  width: 100% !important;
}
::v-deep .el-input__inner{
  width: 100% !important;
}
</style>
