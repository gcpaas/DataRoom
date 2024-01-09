<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-loading="saveLoading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? '存储过程数据集详情' : dataForm.id ? '编辑存储过程数据集' : '新增存储过程数据集' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/procedure_dataset')"
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
                style="margin-top: 2px"
              />
              <div class="bs-codemirror-bottom-text">
                示例：
                <strong>call 存储过程名称(<span style="color: #CC7832;">${参数名称}</span>,?)，SqlServer数据源使用：exec 存储过程名称 <span style="color: #CC7832;">@参数名称</span>=?</strong>
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0;">
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
          :span="8"
        >
          <div class="right-setting">
            <div class="paramConfig">
              <div class="title-style bs-title-style">
                存储过程参数
                <el-button
                  type="text"
                  style="float: right;border: none;margin-top: -4px;"
                  @click="openParamsConfig"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
                <div
                  v-for="param in dataForm.paramsList"
                  :key="param.name"
                  class="field-item"
                  @click="openParamsConfig"
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
                    @click="openParamsConfig"
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
                  @click="fieldsetVisible = true"
                >
                  配置
                </el-button>
              </div>
              <div class="field-wrap bs-field-wrap bs-scrollbar">
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
              <!-- </divclass="field-wrap> -->
            </div>
          </div>
        </el-col>
      </el-row>
      <div
        v-if="isEdit"
        style="margin-top: 12px;"
      >
        <div class="result-view">
          数据预览
        </div>
        <div class="bs-table-box is-Edit">
          <el-table
            align="center"
            :data="dataPreviewList"
            max-height="100%"
            class="bs-el-table"
          >
            <!-- 第一个表格列固定 -->
            <el-table-column
              v-for="(value, key) in dataPreviewList[0] ? dataPreviewList[0] : noDataTableDisplayFields"
              :key="key"
              :label="key"
              :fixed="left"
              align="center"
              show-overflow-tooltip
            >
              <template slot-scope="scope">
                <span>{{ scope.row[key] }}</span>
              </template>
            </el-table-column>
          </el-table>
          <div style="margin: 8px 0;color:var(--bs-el-text)">
            <span v-show="dataPreviewList.length">数据预览中，存储过程仅展示20条数据</span>
          </div>
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
          />
          存在字段描述信息为空，请确认
        </p>
        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="fieldDescFill"
          >
            使用字段名填充
          </el-button>
          <el-button
            class="bs-el-button-default"
            @click="fieldDescEdit"
          >
            进入编辑
          </el-button>
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
              show-overflow-tooltip
              prop="fieldType"
              label="字段类型"
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
            <el-table-column
              align="center"
              prop="orderNum"
              label="字段排序"
              sortable
            >
              <template slot-scope="scope">
                <el-input
                  v-if="isEdit"
                  v-model="scope.row.orderNum"
                  size="small"
                  class="labeldsc bs-el-input"
                />
                <span v-else>{{ scope.row.orderNum }}</span>
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
          <el-button @click="cancelField">取消</el-button>
          <el-button
            type="primary"
            @click="setField"
          >确定</el-button>
        </span>
      </el-dialog>
      <!-- 参数配置 -->
      <el-dialog
        title="存储过程参数配置"
        :visible.sync="paramsVisible"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
        :before-close="cancelParam"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <div class="bs-table-box">
          <el-table
            ref="singleTable"
            :data="paramsListCopy"
            :border="true"
            align="center"
            class="bs-el-table"
          >
            <el-empty slot="empty" />
            <el-table-column
              prop="name"
              label="参数名称"
              align="center"
            />
            <el-table-column
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
                    v-for="item in typeSelect"
                    :key="item.value"
                    :label="item.value"
                    :value="item.value"
                  />
                </el-select>
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
                  class="bs-el-radio-group"
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
                  maxlength="200"
                />
              </template>
            </el-table-column>
            <el-table-column
              label="操作"
              width="105"
              align="center"
            >
              <template slot="header">
                <el-button
                  icon="el-icon-plus"
                  type="text"
                  class="no-border"
                  @click="addParam"
                >
                  添加
                </el-button>
              </template>
              <template slot-scope="scope">
                <el-button
                  type="text"
                  style="color: #e47470;"
                  class="no-border"
                  @click="delRow(scope.$index)"
                >
                  删除
                </el-button>
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
            @click="cancelParam"
          >
            取消
          </el-button>
          <el-button
            type="primary"
            @click="setParam"
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
import {
  nameCheckRepeat,
  datasetAdd,
  datasetUpdate,
  getCategoryTree,
  datasetExecuteTest,
  getDataset
} from 'data-room-ui/js/utils/datasetConfigService'
import { datasourceList } from 'data-room-ui/js/utils/dataSourceService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
import 'codemirror/mode/sql/sql.js'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixins } from 'data-room-ui/js/mixins/datasetMixin'

export default {
  name: 'StoredProcedureEditForm',
  components: {
    codemirror,
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
        typeId: [
          { required: true, message: '请选择分组', trigger: 'blur' }
        ]
      },
      cOptions: {
        mode: 'text/x-mysql',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      sourceList: [],
      msg: '',
      exception: '',
      passTest: false, // 通过测试
      paramsVisible: false,
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
      this.structurePreviewList.forEach(item => {
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
     * 1. 获取分类树
     * 2. 获取数据源列表
     * 3. 获取数据集详情
     */
    async init () {
      this.categoryData = await getCategoryTree({ type: 'dataset', moduleCode: this.appCode })
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
      this.getDataSource()
      if (!this.datasetId) {
        return
      }
      // 获取详情
      getDataset(this.datasetId).then(res => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.datasetType = res.datasetType
        this.dataForm.moduleCode = res.moduleCode
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        this.dataForm.cache = res.cache
        // config 配置
        this.dataForm.sqlProcess = res.config.sqlProcess
        this.dataForm.paramsList = res.config.paramsList ? res.config.paramsList : []
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.fieldList = res.config.fieldList
        this.dataForm.cacheCoherence = res.config.cacheCoherence
        // 使用传入的数据集名称 ？
        this.dataForm.name = this.datasetName
        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
        if (this.dataForm.typeId) {
          this.$nextTick(() => {
            try {
              this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
            } catch (error) {
              console.error(error)
            }
          })
        }
        this.datasetTest(false)
      })
    },
    /**
     * 获取数据源列表
     */
    getDataSource () {
      const params = {
        sourceName: '',
        sourceType: '',
        moduleCode: this.appCode
      }
      datasourceList(params).then(data => {
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
      this.paramsVisible = true
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
     * 取消编辑参数
     */
    cancelParam () {
      this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      this.paramsVisible = false
    },
    /**
     * 保存参数设置
     */
    setParam () {
      this.dataForm.paramsList = cloneDeep(this.paramsListCopy)
      if (this.isTest) {
        this.datasetTest()
      }
      this.paramsVisible = false
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
          return false
        }
        // 检查参数名称是否重复
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map(value => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        // 组装输出字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach(r => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        this.dataForm.fieldList = this.structurePreviewList.length ? this.structurePreviewList : []
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
          moduleCode: this.appCode,
          editable: this.appCode ? 1 : 0,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.StoredProcedureDataSetConfig',
            sourceId: this.dataForm.sourceId,
            sqlProcess: this.dataForm.sqlProcess,
            paramsList: this.dataForm.paramsList,
            fieldList: this.dataForm.fieldList,
            fieldDesc: this.dataForm.fieldDesc
          }
        }
        dataSave(datasetParams).then(res => {
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
        this.saveLoading = false
        this.saveText = ''
      })
    },
    /**
     * 解析参数配置，并且执行测试
     */
    buildParamsAndRun () {
      this.isTest = true
      const reg = /\${(.*?)}/g
      const paramNames = [...new Set([...this.dataForm.sqlProcess.matchAll(reg)].map(item => item[1]))]
      const names = this.dataForm.paramsList.map(item => item.name)
      const params = []
      paramNames.forEach(name => {
        if (names.includes(name)) {
          const param = this.dataForm.paramsList.find(item => item.name === name)
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
      this.dataForm.paramsList = cloneDeep(params)
      this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      if (this.dataForm.paramsList.length) {
        this.paramsVisible = true
      } else {
        this.datasetTest()
      }
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
        const names = this.dataForm.paramsList.map(value => value.name)
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
      datasetExecuteTest(executeParams).then(res => {
        this.dataPreviewList = res.data.list
        this.structurePreviewList = res.structure
        // 输出字段描述合并
        this.structurePreviewList.forEach(field => {
          const fieldInfo = this.dataForm.fieldList.find(item => item.fieldName === field.fieldName)
          if (fieldInfo) {
            const { fieldDesc, orderNum, sourceTable, ...rest } = fieldInfo
            field.fieldDesc = fieldDesc
            field.orderNum = orderNum
            field.sourceTable = sourceTable
            Object.keys(rest).forEach(key => {
              if (!field.hasOwnProperty(key)) {
                this.$set(field, key, rest[key])
              }
            })
          }
        })
        this.structurePreviewList.forEach(item => {
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
          this.structurePreviewList.forEach(item => {
            item.sourceTable = this.tableNameList[0]
          })
        }
        this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
        let paramsNameCheck = false
        this.dataForm.paramsList.forEach(param => {
          const checkList = this.structurePreviewList.filter(item => item.fieldName === param.name)
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
      }).catch((e) => {
        this.passTest = false
        this.saveLoading = false
      })
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
  border-left: 5px solid var(--bs-el-color-primary);
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

.right-setting {
  height: 390px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .paramConfig {
    max-height: 195px;

    .field-wrap {
      max-height: 143px;
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
