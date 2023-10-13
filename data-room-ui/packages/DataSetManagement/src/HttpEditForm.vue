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
                {{ !isEdit ? 'HTTP数据集详情' : dataForm.id ? '编辑HTTP数据集' : '新增HTTP数据集' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/htag6vmt5oin15ib')"
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
                    filterable
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
                  label="调用方式"
                  prop="config.requestType"
                >
                  <el-select
                    v-model="dataForm.config.requestType"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    @change="changeRequestType($event)"
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
            <el-row>
              <el-col :span="24">
                <el-form-item
                  label="请求地址"
                  prop="config.url"
                  class="bs-el-input-url"
                >
                  <el-input
                    v-model="dataForm.config.url"
                    autocomplete="off"
                    class="bs-el-input"
                    placeholder="请输入请求地址"
                    clearable
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="请求类型"
                  prop="config.method"
                >
                  <el-radio-group
                    v-model="dataForm.config.method"
                    class="bs-el-radio-group"
                  >
                    <el-radio label="get">
                      GET
                    </el-radio>
                    <el-radio label="post">
                      POST
                    </el-radio>
                  </el-radio-group>
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
                    @commit="(ids) => { dataForm.labelIds = ids }"
                  />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row v-if="dataForm.config.requestType === 'backend'">
              <el-col :span="12">
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
                  >
                    <i
                      class="el-icon-warning-outline"
                      style="color: #E3C98C;margin-left: 16px;font-size:14px"
                    />
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
            <el-tabs
              v-model="activeName"
              class="bs-el-tabs tabs-box"
            >
              <el-tab-pane
                label="请求头"
                name="head"
              >
                <el-form-item
                  prop="config.headers"
                  label-width="0px"
                >
                  <el-row
                    v-for="(item, index) in dataForm.config.headers"
                    :key="index"
                    :gutter="10"
                    :span="24"
                  >
                    <el-col :span="11">
                      <el-form-item
                        label="键"
                        :prop="'config.headers.' + index + '.key'"
                        label-width="50px"
                        :rules="rules.key"
                      >
                        <el-input
                          v-model="dataForm.config.headers[index].key"
                          class="bs-el-input"
                          placeholder="请输入键"
                          clearable
                          @blur="dataForm.config.headers[index].key = inputChange($event)"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="11">
                      <el-form-item
                        label="值"
                        :prop="'config.headers.' + index + '.value'"
                        label-width="50px"
                        :rules="rules.value"
                      >
                        <el-input
                          v-model="dataForm.config.headers[index].value"
                          placeholder="请输入值"
                          class="bs-el-input"
                          clearable
                          @blur="dataForm.config.headers[index].value = inputChange($event)"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col
                      :span="2"
                      style="text-align: center"
                    >
                      <span
                        class="delete-btn"
                        @click="delHeader(index)"
                      >
                        移除
                      </span>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col
                      :span="12"
                      :offset="6"
                    >
                      <div
                        class="add-btn"
                        @click="addHeader"
                      >
                        增加
                      </div>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane
                label="请求参数"
                name="param"
              >
                <el-form-item
                  prop="config.params"
                  label-width="0px"
                  :rules="dataForm.config.method === 'get' ? rules.params : [{ required: false }]"
                >
                  <el-row
                    v-for="(item, index) in dataForm.config.params"
                    :key="index"
                    :gutter="10"
                    :span="24"
                  >
                    <el-col :span="11">
                      <el-form-item
                        label="键"
                        :prop="'config.params.' + index + '.key'"
                        label-width="50px"
                        :rules="rules.key"
                      >
                        <el-input
                          v-model="dataForm.config.params[index].key"
                          class="bs-el-input"
                          placeholder="请输入键"
                          clearable
                          @blur="dataForm.config.params[index].key = inputChange($event)"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="11">
                      <el-form-item
                        label="值"
                        :prop="'config.params.' + index + '.value'"
                        label-width="50px"
                        :rules="rules.value"
                      >
                        <el-input
                          v-model="dataForm.config.params[index].value"
                          placeholder="请输入值"
                          class="bs-el-input"
                          clearable
                          @blur="dataForm.config.params[index].value = inputChange($event)"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col
                      :span="2"
                      style="text-align: center"
                    >
                      <span
                        class="delete-btn"
                        @click="delParam(index)"
                      >
                        移除
                      </span>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col
                      :span="12"
                      :offset="6"
                    >
                      <div
                        class="add-btn"
                        @click="addParam"
                      >
                        增加
                      </div>
                    </el-col>
                  </el-row>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane
                v-if="dataForm.config.method === 'post'"
                label="请求体"
                name="second"
              >
                <el-form-item
                  prop="requestScript"
                  label-width="0px"
                >
                  <el-input
                    v-model="dataForm.config.body"
                    class="bs-el-input"
                    type="textarea"
                    :autosize="{ minRows: 10, maxRows: 10 }"
                    clearable
                  />
                  <div class="bs-codemirror-bottom-text">
                    <strong>请求体设置规则： 请在脚本中直接输入请求体内容，如涉及变量，请按照${XX}格式进行设置<br> 例如：<span
                      style="color: red;"
                    >{"name":${name}}</span>
                    </strong>
                  </div>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane
                label="请求脚本"
                name="reqScript"
              >
                <el-form-item
                  prop="requestScript"
                  label-width="0px"
                >
                  <codemirror
                    v-if="activeName === 'reqScript'"
                    v-model.trim="dataForm.config.requestScript"
                    :options="codemirrorOption"
                    class="code"
                  />
                  <div class="bs-codemirror-bottom-text">
                    <strong>请求脚本设置规则： 请求脚本已经内置参数req，可参考下面的示例进行配置:
                      <br> 如修改请求地址中对应参数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
                        style="color: red;"
                      >req.url.age=17</span>
                      <br> 如修改请求头中对应参数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
                        style="color: red;"
                      >req.headers.name='tom'</span>
                      <br> 如修改请求参数中对应参数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
                        style="color: red;"
                      >req.params.age=17</span>
                      <br> 如修改请求体中对应参数&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span
                        style="color: red;"
                      >req.data='{"name":"223"}'</span>
                    </strong>
                  </div>
                </el-form-item>
              </el-tab-pane>
              <el-tab-pane
                label="响应脚本"
                name="respScript"
              >
                <el-form-item
                  prop="responseScript"
                  label-width="0px"
                >
                  <codemirror
                    v-if="activeName === 'respScript'"
                    v-model.trim="dataForm.config.responseScript"
                    :options="codemirrorOption"
                    class="code"
                  />
                  <div
                    v-if="dataForm.config.requestType === 'frontend'"
                    class="bs-codemirror-bottom-text"
                  >
                    <strong>响应脚本设置规则： 接口返回数据已经内置到参数resp中，可直接使用，但是必须要返回设置后的数据。<br> 例如：<span style="color: red;">return
                      resp.data</span>
                    </strong>
                  </div>
                  <div
                    v-else
                    class="bs-codemirror-bottom-text"
                  >
                    <strong>响应脚本设置规则： 接口返回数据已经内置到参数responseString(已转为字符串)中，如果需要处理成JSON格式推荐使用JsonSlurper类。
                      <br> 例如： <br>
                      <span style="color: red;">
                        import groovy.json.JsonSlurper<br>
                        def jsonSlurper = new JsonSlurper()<br>
                        def responseMap= jsonSlurper.parseText(responseString)<br>
                        return responseMap.data.list<br>
                      </span>
                    </strong>
                  </div>
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
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
                  @click="openParamsSetDialog(false)"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="param in dataForm.config.paramsList"
                  :key="param.name"
                  class="field-item"
                  @click="openParamsSetDialog(false)"
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
                    @click="openParamsSetDialog(false)"
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
            max-height="300"
            :border="true"
            class="bs-el-table bs-scrollba preview-table"
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
                v-if="dataPreviewList && dataPreviewList.length"
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
              <el-empty v-else />
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
        :new-params-list="newParamsList"
        @saveParams="saveParams"
        @saveNewParams="saveNewParams"
        @getData="getData"
        @getPramsList="getPramsList"
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
import ParamsSettingDialog from './HttpParamsSettingDialog.vue'
import OutputFieldDialog from './JsComponents/OutputFieldDialog.vue'
import FieldFillDialog from './JsComponents/FieldFillDialog.vue'
import { nameCheckRepeat, datasetAdd, datasetUpdate, getDataset, getCategoryTree, datasetExecuteTest } from 'data-room-ui/js/utils/datasetConfigService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/javascript/javascript'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
import axiosFormatting from '../../js/utils/httpParamsFormatting'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
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
        callback(new Error('请输入正确的请求地址'))
      } else {
        callback()
      }
    }
    return {
      newParamsList: [], // 存放临时的动态参数值
      activeName: 'head',
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
        cache: 0,
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
        typeId: [
          { required: true, message: '请选择分组', trigger: 'blur' }
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
        mode: 'text/x-groovy',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
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
          const { id, name, typeId, remark, datasetType, moduleCode, editable, sourceId, cache, config } = res
          const { script, paramsList, fieldDesc, fieldList } = config
          this.dataForm = { id, name, typeId, remark, datasetType, moduleCode, editable, sourceId, cache, config: { ...config }, labelIds: this.dataForm.labelIds }
          this.fieldDesc = fieldDesc
          this.outputFieldList = fieldList
          this.newParamsList = cloneDeep(paramsList)
          this.codemirrorOption.mode = this.dataForm.config.requestType === 'frontend' ? 'text/javascript' : 'text/x-groovy'
          // this.replaceParams(paramsList)
          // this.scriptExecute(true)
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
            cache: dataForm.cache,
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
    changeRequestType (value) {
      if (value === 'frontend') {
        this.$set(this.codemirrorOption, 'mode', 'text/javascript')
      } else {
        this.$set(this.codemirrorOption, 'mode', 'text/x-groovy')
      }
    },
    // 增加header
    addHeader () {
      const header = { key: '', type: 'string', value: '', remark: '' }
      this.dataForm.config.headers.push(cloneDeep(header))
    },
    // 移除header
    delHeader (index) {
      this.dataForm.config.headers.splice(index, 1)
    },
    // 增加请求参数
    addParam () {
      const param = { key: '', value: '', remark: '' }
      this.dataForm.config.params.push(cloneDeep(param))
    },
    // 移除请求参数
    delParam (index) {
      this.dataForm.config.params.splice(index, 1)
    },
    saveParams (val) {
      this.dataForm.config.paramsList = val
    },
    saveNewParams (val) {
      this.newParamsList = val
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
      this.$refs.outputFieldDialog.open()
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
    // 打开动态参数设置弹窗
    async openParamsSetDialog (isUpdate) {
      this.getPramsList()
      const oldList = cloneDeep(this.dataForm.config.paramsList)
      this.newParamsList = this.compareParamsList(this.newParamsList, oldList)
      await this.$nextTick()
      this.$refs.paramsSettingDialog.open(isUpdate)
    },
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
            require: 0,
            remark: ''
          })
        }
      })
      this.dataForm.config.paramsList = cloneDeep(params)
    },
    // 用来对两个数组进行对比
    compareParamsList (newList, oldList) {
      // 创建一个空数组，用于存储最终的结果
      const result = []

      // 遍历A数组中的每个对象
      for (const objA of oldList) {
        let found = false // 标志变量，用于表示是否在B数组中找到对应的属性

        // 遍历B数组中的每个对象
        for (const objB of newList) {
          if (objA.name === objB.name) {
            // 如果A和B中的fieldName相同，则将B中该属性的属性值赋值给A，并将该对象添加到结果数组中
            // 如果参数必填但是新的参数没有值那么需要保留默认值
            if (!(objA.require && !objB.value)) {
              objA.value = objB.value
            }
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
    // 点击解析按钮
    scriptExecute (isInit = false) {
      if (isInit) {
        this.getPramsList()
        // 每次执行时只要有动态参数就会打开参数配置的弹窗进行设置
        if (this.dataForm.config.paramsList && this.dataForm.config.paramsList.length && !isInit) {
          this.openParamsSetDialog(true)
        } else {
          this.getData()
        }
      } else {
        // 点击解析时校验是否填写请求地址
        if (this.dataForm.config.url) {
          this.getPramsList()
          // 每次执行时只要有动态参数就会打开参数配置的弹窗进行设置
          if (this.dataForm.config.paramsList && this.dataForm.config.paramsList.length && !isInit) {
            this.openParamsSetDialog(true)
          } else {
            this.getData()
          }
        } else {
          this.$message.error('请输入请求地址')
        }
      }
    },
    // 调接口
    getData () {
      // 如果是前端代理，则自行组装接口及参数并调接口
      if (this.dataForm.config.requestType === 'frontend') {
        // this.replaceParams(this.dataForm.config.paramsList)
        axiosFormatting({ ...this.dataForm.config, paramsList: this.newParamsList }).then((res) => {
          this.dataPreviewList = res && Array.isArray(res) ? res : [{ ...res }]
          // 获取数据后更新输出字段
          this.updateOoutputFieldList(this.dataPreviewList)
          this.$message.success('脚本执行通过')
        }).catch((e) => {
          // 未成功获取数据时，清空数据预览和输出字段
          this.dataPreviewList = []
          this.updateOoutputFieldList(this.dataPreviewList)
        })
      } else {
        // 如果是后端代理，则将配置传到后端
        const script = JSON.stringify(this.dataForm.config)
        const executeParams = {
          script,
          params: this.newParamsList,
          dataSetType: 'http'
        }
        datasetExecuteTest(executeParams).then(res => {
          this.dataPreviewList = res.data && Array.isArray(res.data) ? res.data : [{ ...res.data }]
          // 获取数据后更新输出字段
          this.updateOoutputFieldList(this.dataPreviewList)
          this.$message.success('脚本执行通过')
        }).catch((e) => {
          // 未成功获取数据时，清空数据预览和输出字段
          this.dataPreviewList = []
          this.updateOoutputFieldList(this.dataPreviewList)
        })
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

//::v-deep .bs-table-box.is-Edit .el-table {
//  max-height: unset !important;
//
//  .el-table__body-wrapper {
//    max-height: unset !important;
//  }
//}

.bs-table-box {
  padding: 0;
  height: 100% !important;
  margin-bottom: 0 !important;
}

.tree-box {
  padding: 0;
}

.tabs-box {
  margin-left: 45px;
}

.add-btn {
  width: 100%;
  text-align: center;
  border: 1px dashed #696A6E;
  color: #fff;

  &:hover {
    cursor: pointer;
    border: 1px dashed var(--bs-el-color-primary);
    color: var(--bs-el-color-primary);
  }
}

.delete-btn {
  color: rgb(228, 116, 112);

  &:hover {
    cursor: pointer;
  }
}

.preview-table {
  max-height: 300px !important;
}

/*滚动条样式*/
::v-deep ::-webkit-scrollbar {
  width: 4px;
  border-radius: 4px;
  height: 4px;
}

::v-deep ::-webkit-scrollbar-thumb {
  background: #fff !important;
  border-radius: 10px;
}
::v-deep .el-input__inner{
  width: 230px !important;
}
.bs-el-select{
  width: 100% !important;
}
::v-deep .el-input__inner{
  width: 100% !important;
}
.bs-el-input-url{
  // ::v-deep .el-form-item__content{
  //   width: calc(100%) !important;
  // }
  .bs-el-input-url{
    width: 100% !important;
  }
  ::v-deep .el-input__inner{
    width:100% !important;
  }
}
</style>
