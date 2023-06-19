<template>
  <div
    v-loading="saveloading"
    class="inner-container "
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? 'JSON数据集详情' : dataForm.id ? 'JSON数据集编辑' : 'JSON数据集新增' }}
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
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="名称"
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
                    clearable
                    :disabled="!isEdit"
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
                  label="描述"
                  prop="remark"
                >
                  <el-input
                    v-model="dataForm.remark"
                    class="bs-el-input"
                    :disabled="!isEdit"
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
              解析JSON
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
                :key="field.columnName"
                class="field-item"
                @click="fieldsetVisible = true"
              >
                <span>{{ field.columnName }}</span>&nbsp;<span
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
            :border="true"
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
      <div
        v-if="!isEdit"
        class="dataPreView"
      >
        <el-tabs v-model="activeName">
          <el-tab-pane
            label="数据1预览"
            name="data"
          >
            <div class="bs-table-box">
              <el-table
                align="center"
                :data="dataPreviewList"
                max-height="400"
                :border="true"
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
            label="数据集结构"
            name="structure"
          >
            <div class="bs-table-box">
              <el-table
                max-height="400"
                :data="structurePreviewList"
                :border="true"
                align="center"
                class="bs-el-table"
              >
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="columnName"
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
              prop="columnName"
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
import vueJsonEditor from 'vue-json-editor'
import vueJsonViewer from 'vue-json-viewer'
import { getDatasetTypeList, datasetAddorUpdate, getDataset, nameCheckRepeat } from 'packages/js/utils/datasetConfigService'
import _ from 'lodash'

export default {
  name: 'JsonEditForm',
  components: {
    vueJsonEditor,
    vueJsonViewer
  },
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    datasetId: {
      type: String,
      default: null
    },
    datasetName: {
      type: String,
      default: ''
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
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        json: '',
        remark: ''
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
        // typeId: [
        //   {required: true, message: '请选择分组', trigger: 'blur'}
        // ]
      },
      typeName: '',
      categoryData: [],
      activeName: 'data',
      structurePreviewList: [],
      structurePreviewListCopy: [],
      dataPreviewList: [],
      fieldsetVisible: false,
      fieldDescVisible: false,
      passTest: false, // 通过测试
      fieldDesc: null, // 字段描述
      saveloading: false,
      saveText: ''
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // json错误校验
    onError () {
      this.passTest = false
    },
    // 保存数据集
    save (formName, nochecktosave = false) {
      if (!this.passTest) {
        this.$message.error('请确保JSON不为空且解析通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该JSON未生成输出字段，请重新检查')
        return
      }
      if (!nochecktosave) {
        const temp = this.structurePreviewList.some(item => {
          return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
        }) // true-存在为空
        if (temp) {
          this.fieldDescVisible = true
          return
        }
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          // 通过校验
          const data = {
            json: this.dataForm.json,
            fieldDesc: this.fieldDesc
          }
          this.saveloading = true
          this.saveText = '正在保存...'
          datasetAddorUpdate({
            id: this.datasetId,
            name: this.dataForm.name,
            typeId: this.dataForm.typeId,
            remark: this.dataForm.remark,
            datasetType: 'json',
            moduleCode: this.appCode,
            editable: this.appCode ? 1 : 0,
            data: JSON.stringify(data)
          }).then(() => {
            this.$message.success('保存成功')
            this.$parent.init(false)
            this.$parent.setType = null
            this.saveloading = false
            this.saveText = ''
          }).catch(() => {
            this.saveloading = false
            this.saveText = ''
          })
        } else {
          return false
        }
      })
    },
    // 字段值填充
    fieldDescFill () {
      this.fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        if (field.fieldDesc === '' || !field.hasOwnProperty('fieldDesc')) {
          field.fieldDesc = field.columnName
          this.fieldDesc[field.columnName] = field.columnName
        } else {
          this.fieldDesc[field.columnName] = field.fieldDesc
        }
      })
      this.save('form')
      this.fieldDescVisible = false
    },
    // 进入编辑
    fieldDescEdit () {
      this.fieldDescVisible = false
      this.fieldsetVisible = true
    },
    // 继续保存
    toSave () {
      this.fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        this.fieldDesc[field.columnName] = field.fieldDesc
      })
      this.save('form', true)
      this.fieldDescVisible = false
    },
    // 取消操作
    cancelField () {
      this.structurePreviewListCopy = _.cloneDeep(this.structurePreviewList)
      this.fieldsetVisible = false
    },
    // 设置输出字段
    setField () {
      this.structurePreviewList = _.cloneDeep(this.structurePreviewListCopy)
      if (this.structurePreviewList.length) {
        this.fieldDesc = {}
        this.structurePreviewList.forEach(key => {
          this.fieldDesc[key.columnName] = key.fieldDesc
        })
      } else {
        this.fieldDesc = null
      }
      this.fieldsetVisible = false
    },
    // 字段描述构建及同步
    buildFieldDesc () {
      const fieldDesc = {}
      this.structurePreviewList.forEach(field => {
        if (this.fieldDesc.hasOwnProperty(field.columnName)) {
          field.fieldDesc = this.fieldDesc[field.columnName]
        }
        fieldDesc[field.columnName] = field.fieldDesc
      })
      this.fieldDesc = fieldDesc
    },
    // 解析json
    analysisJSON ($event, initAnalysis = false) {
      if (Object.prototype.toString.call(this.dataForm.json) === '[object Object]') {
        // json为对象
        this.structurePreviewList = Object.keys(this.dataForm.json).map(key => {
          return {
            columnName: key,
            fieldDesc: ''
          }
        })
        this.dataPreviewList = [_.cloneDeep(this.dataForm.json)]
        this.passTest = true
      } else if (Object.prototype.toString.call(this.dataForm.json) === '[object Array]') {
        // 为数组
        if (Object.prototype.toString.call(this.dataForm.json[0]) === '[object Object]') {
          this.structurePreviewList = Object.keys(this.dataForm.json[0]).map(key => {
            return {
              columnName: key,
              fieldDesc: ''
            }
          })
          this.dataPreviewList = _.cloneDeep(this.dataForm.json)
          this.passTest = true
        } else {
          try {
            this.structurePreviewList = Object.keys(JSON.parse(this.dataForm.json[0])).map(key => {
              return {
                columnName: key,
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
                columnName: key,
                fieldDesc: ''
              }
            })
            this.dataPreviewList = [_.cloneDeep(json)]
            this.passTest = true
          } else if (Object.prototype.toString.call(json) === '[object Array]') {
            // 为数组
            if (Object.prototype.toString.call(json[0]) === '[object Object]') {
              this.structurePreviewList = Object.keys(json[0]).map(key => {
                return {
                  columnName: key,
                  fieldDesc: ''
                }
              })
              this.dataPreviewList = _.cloneDeep(json)
              this.passTest = true
            } else {
              try {
                this.structurePreviewList = Object.keys(JSON.parse(json[0])).map(key => {
                  return {
                    columnName: key,
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
      if (this.structurePreviewList.length && this.fieldDesc) {
        this.buildFieldDesc()
      }
      if (this.passTest && !initAnalysis) {
        this.$message.success('JSON解析通过')
      }
      this.structurePreviewListCopy = _.cloneDeep(this.structurePreviewList)
    },
    // 初始化
    async init () {
      this.categoryData = await getDatasetTypeList({ tableName: 'r_dataset', moduleCode: this.appCode })
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
          this.dataForm.id = res.id
          const data = JSON.parse(res.data)
          this.dataForm.name = res.name
          this.dataForm.typeId = res.typeId
          this.dataForm.remark = res.remark
          this.dataForm.json = data.json
          this.fieldDesc = data.fieldDesc
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
      }
    },
    goBack () {
      this.$emit('back')
    },
    // 表头添加提示
    renderHeader (h, { column, index }) {
      const labelLong = column.label.length // 表头label长度
      const size = 14 // 根据需要定义标尺，直接使用字体大小确定就行，也可以根据需要定义
      column.minWidth = labelLong * size < 120 ? 120 : labelLong * size // 根据label长度计算该表头最终宽度
      return h('span', { class: 'cell-content', style: { width: '100%' } }, [column.label])
    },
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
    // 分类选择
    selectParentCategory (value) {
      this.dataForm.typeId = value.id
      this.typeName = value.name
      this.$refs.selectParentName.blur()
    },
    openNewWindow (url) {
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/assets/style/bsTheme.scss';

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

/deep/ .jsoneditor-poweredBy,
/deep/ .jsoneditor-modes {
  display: none;
}

/deep/ .ace_editor.ace-jsoneditor {
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

/deep/ .fieldDescCheck {
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

/deep/ .ace_layer.ace_gutter-layer.ace_folding-enabled {
  background: #f6f7fb;
}

/deep/ .jsoneditor-menu {
  background: var(--bs-el-color-primary);
  border-color: var(--bs-el-color-primary);
}

/deep/ .jsoneditor-mode-code {
  border-color: var(--bs-el-color-primary);
}

.bs-table-box {
  margin-bottom: 0;
}

/deep/ .bs-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.bs-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}
</style>
