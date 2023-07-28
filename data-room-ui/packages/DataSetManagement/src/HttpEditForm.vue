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
                {{ !isEdit ? 'HTTP数据集详情' : dataForm.id ? 'HTTP数据集编辑' : 'HTTP数据集新增' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/groovy_dataset')"
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
                >
                  <el-select
                    ref="selectParentName"
                    v-model="dataForm.typeId"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    placeholder="请选择分组"
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
              <el-col :span="12">
                <el-form-item
                  label="调用方式"
                  prop="config.requestType"
                >
                  <el-select
                    v-model="dataForm.config.requestType"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                  >
                    <el-option
                      label="前台代理"
                      value="frontend"
                    />
                    <el-option
                      label="后台代理"
                      value="backend"
                    />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
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
            <el-form-item
              label="请求类型"
              prop="config.method"
            >
              <el-radio-group
                v-model="dataForm.config.method"
                class="bs-radio-wrap"
              >
                <el-radio-button label="get">
                  GET
                </el-radio-button>
                <el-radio-button label="post">
                  POST
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              label="请求地址"
              prop="config.url"
            >
              <el-input
                v-model="dataForm.config.url"
                autocomplete="off"
                class="bs-el-input"
                placeholder="请输入静态请求地址或动态请求地址，动态请求地址必须以${baseUrl}开头"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="请求头"
              prop="config.headers"
            >
              <el-button
                type="primary"
                @click="addHeader"
              >
                增加
              </el-button>
              <el-row
                v-for="(item,index) in dataForm.config.headers"
                :key="index"
                :gutter="10"
                :span="21"
              >
                <el-col :span="5">
                  <el-form-item
                    label="键"
                    :prop="'config.headers.'+index+'.key'"
                    label-width="50px"
                    :rules="rules.key"
                  >
                    <el-input
                      v-model="dataForm.config.headers[index].key"
                      placeholder="请输入键"
                      clearable
                      @blur="dataForm.config.headers[index].key = inputChange($event)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5">
                  <el-form-item
                    label="值"
                    :prop="'config.headers.'+index+'.value'"
                    label-width="50px"
                    :rules="rules.value"
                  >
                    <el-input
                      v-model="dataForm.config.headers[index].value"
                      placeholder="请输入值"
                      clearable
                      @blur="dataForm.config.headers[index].value = inputChange($event)"
                    />
                  </el-form-item>
                </el-col>
                <el-col
                  :span="2"
                  style="text-align: center"
                >
                  <el-button
                    type="primary"
                    @click="delHeader(index)"
                  >
                    移除
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              label="请求参数"
              prop="config.params"
              :rules="dataForm.config.method==='get'?rules.params:[{ required: false}]"
            >
              <el-button
                type="primary"
                @click="addParam"
              >
                增加
              </el-button>
              <el-row
                v-for="(item,index) in dataForm.config.params"
                :key="index"
                :gutter="10"
                :span="21"
              >
                <el-col :span="7">
                  <el-form-item
                    label="键"
                    :prop="'config.params.'+index+'.key'"
                    label-width="50px"
                    :rules="rules.key"
                  >
                    <el-input
                      v-model="dataForm.config.params[index].key"
                      placeholder="请输入键"
                      clearable
                      @blur="dataForm.config.params[index].key = inputChange($event)"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="7">
                  <el-form-item
                    label="值"
                    :prop="'config.params.'+index+'.value'"
                    label-width="50px"
                    :rules="rules.value"
                  >
                    <el-input
                      v-model="dataForm.config.params[index].value"
                      placeholder="请输入值"
                      clearable
                      @blur="dataForm.config.params[index].value = inputChange($event)"
                    />
                  </el-form-item>
                </el-col>
                <el-col
                  :span="2"
                  style="text-align: center"
                >
                  <el-button
                    type="primary"
                    @click="delParam(index)"
                  >
                    移除
                  </el-button>
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              v-if="dataForm.config.method === 'post'"
              label="请求体"
              prop="requestScript"
            >
              <el-input
                v-model="dataForm.config.body"
                class="bs-el-input"
                type="textarea"
                :autosize="{ minRows: 10, maxRows: 10}"
                clearable
              />
            </el-form-item>
            <el-form-item
              label="请求脚本"
              prop="requestScript"
            >
              <codemirror
                v-model.trim="dataForm.config.requestScript"
                :options="codemirrorOption"
                class="code"
              />
            </el-form-item>
            <el-form-item
              label="响应脚本"
              prop="responseScript"
            >
              <codemirror
                v-model.trim="dataForm.config.responseScript"
                :options="codemirrorOption"
                class="code"
              />
            </el-form-item>
          </el-form>
          <div
            v-if="isEdit"
            class="sql-config"
          >
            <div style="text-align: center; padding: 16px 0;">
              <el-button
                type="primary"
                @click="scriptExecute()"
              >
                解析并执行
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
      />
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
import { nameCheckRepeat, datasetAdd, datasetUpdate, getDataset, getCategoryTree, datasetExecuteTest } from 'data-room-ui/js/utils/datasetConfigService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
import axiosFormatting from '../../js/utils/httpParamsFormatting'
import _ from 'lodash'
export default {
  name: 'HttpEditForm',
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
    const validateUrl = (rule, value, callback) => {
      // eslint-disable-next-line no-template-curly-in-string
      if (value.startsWith('${baseUrl}/')) {
        callback()
      }
      const reg = /(https?|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/
      if (!reg.test(value)) {
        // eslint-disable-next-line no-template-curly-in-string
        callback(new Error('请输入正确的静态请求地址或动态请求地址，动态请求地址必须以${baseUrl}/开头'))
      } else {
        callback()
      }
    }
    return {
      options: [{
        value: 'string',
        label: '字符串'
      }, {
        value: 'boolean',
        label: '布尔值'
      }, {
        value: 'int',
        label: '数字'
      }, {
        value: 'date',
        label: '日期'
      }],
      newDataForm: {}, // 替换完参数后的配置
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        remark: '',
        labelIds: [],
        config: {
          className: 'com.gccloud.dataset.entity.config.HttpDataSetConfig',
          requestType: 'backend',
          method: 'get',
          url: '',
          headers: [],
          params: [],
          body: '',
          paramsList: [],
          requestScript: '',
          responseScript: ''
        }
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        'config.requestType': [
          { required: true, message: '请选择调用方式', trigger: 'change' }
        ],
        key: [{ required: true, message: '键不能为空', trigger: 'blur' }],
        value: [{ required: true, message: '值不能为空', trigger: 'blur' }],
        'config.method': [{ required: true, message: '请求类型不能为空', trigger: 'blur' }],
        'config.url': [
          { required: true, message: '请求地址不能为空', trigger: 'blur' },
          { validator: validateUrl, trigger: 'blur' }
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
          this.dataForm = { id, name, typeId, remark, datasetType, moduleCode, editable, sourceId, config: { ...config } }
          this.fieldDesc = fieldDesc
          this.outputFieldList = fieldList
          // this.replaceParams(paramsList)
          this.scriptExecute(true)
        })
      }
    },
    // 保存数据集
    save (formName, nochecktosave = false) {
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
            datasetType: 'http',
            moduleCode: appCode,
            editable: appCode ? 1 : 0,
            labelIds: dataForm.labelIds,
            config: {
              className: 'com.gccloud.dataset.entity.config.HttpDataSetConfig',
              method: dataForm.config.method,
              url: dataForm.config.url,
              headers: dataForm.config.headers,
              params: dataForm.config.params,
              body: dataForm.config.body,
              requestScript: dataForm.config.requestScript,
              responseScript: dataForm.config.responseScript,
              requestType: dataForm.config.requestType,
              fieldDesc,
              paramsList: dataForm.config.paramsList,
              fieldList: this.outputFieldList
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
    // 增加header
    addHeader () {
      const header = { key: '', type: 'string', value: '', remark: '' }
      this.dataForm.config.headers.push(_.cloneDeep(header))
    },
    // 移除header
    delHeader (index) {
      this.dataForm.config.headers.splice(index, 1)
    },
    // 增加请求参数
    addParam () {
      const param = { key: '', value: '', remark: '' }
      this.dataForm.config.params.push(_.cloneDeep(param))
    },
    // 移除请求参数
    delParam (index) {
      this.dataForm.config.params.splice(index, 1)
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
    // // 配置完参数后，将参数的值放入到对应的请求位置进行替换
    // replaceParams (paramsList) {
    //   this.newDataForm = _.cloneDeep(this.dataForm)
    //   this.newDataForm.config.url = this.evalStrFunc(paramsList, this.newDataForm.config.url)
    //   this.newDataForm.config.headers = this.evalArrFunc(paramsList, this.newDataForm.config.headers)
    //   this.newDataForm.config.params = this.evalArrFunc(paramsList, this.newDataForm.config.params)
    //   this.newDataForm.config.body = this.evalStrFunc(paramsList, this.newDataForm.config.body)
    // },
    // evalStrFunc (paramsList, string) {
    //   // 取name作为变量名, value作为变量值 { name: '站三', token: '123'}
    //   const params = paramsList.reduce((acc, cur) => {
    //     acc[cur.name] = cur.value
    //     return acc
    //   }, {})
    //   // 将url中 ${xxx} 替换成 ${params.xxx}
    //   const str = string.replace(/\$\{(\w+)\}/g, (match, p1) => {
    //     return '${params.' + p1 + '}'
    //   })
    //   const transformStr = ''
    //   // 将字符串中的${}替换为变量, 使用eval执行
    //   eval('transformStr = `' + str + '`')
    //   return transformStr
    // },
    // evalArrFunc (paramsList, arr) {
    //   // 取name作为变量名, value作为变量值 { name: '站三', token: '123'}
    //   const params = paramsList.reduce((acc, cur) => {
    //     acc[cur.name] = cur.value
    //     return acc
    //   }, {})
    //
    //   // 取name作为变量名, value作为变量值 { _name: '${name}', _token: '${token}'}
    //   const paramsListObj = arr.reduce((acc, cur) => {
    //     acc[cur.key] = cur.value
    //     return acc
    //   }, {})
    //   // 转成字符串
    //   const paramsListStr = JSON.stringify(paramsListObj)
    //
    //   // 将url中 ${xxx} 替换成 ${params.xxx}
    //   const str = paramsListStr.replace(/\$\{(\w+)\}/g, (match, p1) => {
    //     return '${params.' + p1 + '}'
    //   })
    //   const transformStr = ''
    //   // 将字符串中的${}替换为变量, 使用eval执行
    //   eval('transformStr = `' + str + '`')
    //   const obj = JSON.parse(transformStr)
    //   return obj
    // },
    // 获取请求地址、请求头、请求参数、请求体中所有的变量，在动态参数中进行变量
    getPramsList () {
      const paramNames1 = this.getValName(this.dataForm.config.url)
      const paramNames2 = this.dataForm.config?.headers.map(obj => obj.value.match(/\$\{(.+?)\}/)?.[1]).filter(Boolean)
      const paramNames3 = this.dataForm.config?.params.map(obj => obj.value.match(/\$\{(.+?)\}/)?.[1]).filter(Boolean)
      const paramNames4 = this.getValName(this.dataForm.config.body)
      const paramNames = new Set([...paramNames1, ...paramNames2, ...paramNames3, ...paramNames4])
      const names = this.dataForm.config?.paramsList?.map(item => item.name)
      const params = []
      paramNames.forEach(name => {
        if (names.includes(name)) {
          const param = this.dataForm.config?.paramsList?.find(item => item.name === name)
          params.push(param)
        } else {
          params.push({
            name: name,
            type: 'String',
            value: '',
            status: 1,
            require: 1,
            remark: ''
          })
        }
      })
      this.dataForm.config.paramsList = _.cloneDeep(params)
    },
    // 获取字符串中${变量名}中的变量名
    getValName (str) {
      // 定义正则表达式模式
      const pattern = /\${(.*?)\}/g
      // 使用正则表达式提取变量名
      const variables = []
      let match
      while (match = pattern.exec(str)) {
        variables.push(match[1])
      }
      return variables
    },
    // 执行配置好的接口
    scriptExecute (isInit = false) {
      this.getPramsList()
      // 如果动态参数未配置，则直接打开配置弹窗
      const flag = this.dataForm.config.paramsList.some(item => !item.value)
      if (this.dataForm.config.paramsList && this.dataForm.config.paramsList.length && flag) {
        this.$refs.paramsSettingDialog.open()
      } else {
        // 如果动态参数已配置则调接口
        // 如果是前端代理，则自行组装接口及参数并调接口
        if (this.dataForm.config.requestType === 'frontend') {
          // this.replaceParams(this.dataForm.config.paramsList)
          axiosFormatting({ ...this.dataForm.config }).then((res) => {
            this.dataPreviewList = res.data
            // 获取数据后更新输出字段
            this.updateOoutputFieldList(this.dataPreviewList)
          })
        } else {
          // 如果是后端代理，则将配置传到后端
          const script = JSON.stringify(this.dataForm.config)
          const executeParams = {
            script,
            params: this.dataForm.paramsList,
            dataSetType: 'http'
          }
          datasetExecuteTest(executeParams).then(res => {
            this.dataPreviewList = res.data
            // 获取数据后更新输出字段
            this.updateOoutputFieldList(this.dataPreviewList)
            this.$message.success('解析并执行成功')
          }).catch((e) => {

          })
        }
      }
    },
    updateOoutputFieldList (dataList) {
      if (dataList && dataList.length) {
        const newList = Object.keys(dataList?.[0])?.map(key => {
          return {
            fieldName: key,
            fieldDesc: ''
          }
        })
        this.outputFieldList = this.compareArr(newList, this.outputFieldList)
      } else {
        this.outputFieldList = []
      }
    },
    // 用来对两个数组进行对比
    compareArr (newList, oldList) {
      // 创建一个空数组，用于存储最终的结果
      const result = []

      // 遍历A数组中的每个对象
      for (const objA of newList) {
        let found = false // 标志变量，用于表示是否在B数组中找到对应的属性

        // 遍历B数组中的每个对象
        for (const objB of oldList) {
          if (objA.fieldName === objB.fieldName) {
            // 如果A和B中的fieldName相同，则将B中该属性的属性值赋值给A，并将该对象添加到结果数组中
            objA.fieldDesc = objB.fieldDesc
            result.push(objA)
            found = true
            break
          }
        }

        // 如果在B数组中没有找到对应的属性，则直接将该对象添加到结果数组中
        if (!found) {
          result.push(objA)
        }
      }
      return result
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
</style>
