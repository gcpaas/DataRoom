<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-loading="saveloading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="data-set-scrollbar">
      <div class="header">
        <el-page-header class="bs-el-page-header">
          <template slot="content">
            <div class="page-header">
              <div class="page-header-left">
                {{ !isEdit ? '自助数据集详情' : dataForm.id ? '自助数据集编辑' : '自助数据集新增' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/self_dataset')"
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
                  class="back bs-el-button-default"
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
                    popper-class="bs-el-select"
                    class="bs-el-select"
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
              <el-col :span="12">
                <el-form-item
                  label="数据源"
                  prop="sourceId"
                >
                  <el-select
                    v-model="dataForm.sourceId"
                    clearable
                    filterable
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    placeholder="请选择数据源"
                    :disabled="!isEdit"
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
                <strong v-if="dataForm.curingType == '3'">call 存储过程名称(<span style="color: red;">${参数名称}</span>,?)</strong>
                <strong v-else><br>
                  1、常规使用 select * from table where table_field = <span style="color: red;">${参数名称}</span><br>
                  2、标签使用
                  <el-tooltip
                    class="item"
                    effect="dark"
                    content="<参数名称></参数名称>为非空标签, 当该参数值为空时, 标签部分不进行处理"
                    placement="top-start"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where 1=1 <span style="color: blue;">&lt;参数名称&gt;</span> and table_field = <span
                    style="color: red;"
                  >${参数名称}</span> <span style="color: blue;">&lt;/参数名称&gt;</span>
                </strong>
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0;">
              <el-button
                type="primary"
                @click="buildParams"
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
                SQL参数
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
                  >({{ param.remark
                  }})</span>
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
            class="bs-el-table bs-scrollbar"
            :border="true"
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
        <div class="bs-pagination">
          <el-pagination
            class="bs-el-pagination"
            popper-class="bs-el-pagination"
            :current-page="current"
            :page-sizes="[10, 20, 50, 100]"
            :page-size="size"
            :total="totalCount"
            background
            prev-text="上一页"
            next-text="下一页"
            layout="total, prev, pager, next,sizes"
            @size-change="sizeChangeHandle"
            @current-change="currentChangeHandle"
          />
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
            <div class="bs-pagination">
              <el-pagination
                class="bs-el-pagination"
                popper-class="bs-el-pagination"
                :current-page="current"
                :page-sizes="[10, 20, 50, 100]"
                :page-size="size"
                :total="totalCount"
                background
                prev-text="上一页"
                next-text="下一页"
                layout="total, prev, pager, next,sizes"
                @size-change="sizeChangeHandle"
                @current-change="currentChangeHandle"
              />
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
                :data="structurePreviewList"
                :border="true"
                align="center"
              >
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="columnName"
                  label="字段值"
                />
                <el-table-column
                  align="center"
                  show-overflow-tooltip
                  prop="columnType"
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
                <el-table-column
                  align="center"
                  prop="sourceTable"
                  label="字段来源"
                >
                  <template slot-scope="scope">
                    <el-select
                      v-if="isEdit"
                      v-model="scope.row.sourceTable"
                      popper-class="bs-el-select"
                      class="bs-el-select"
                      clearable
                      filterable
                    >
                      <el-option
                        v-for="table in tableNameList"
                        :key="table"
                        :label="table"
                        :value="table"
                      />
                    </el-select>
                    <span v-else>{{ scope.row.sourceTable }}</span>
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
            class="bs-el-table"
            :data="structurePreviewListCopy"
            :border="true"
            align="center"
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
              show-overflow-tooltip
              prop="columnType"
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
            <el-table-column
              align="center"
              prop="sourceTable"
              label="字段来源"
            >
              <template slot-scope="scope">
                <el-select
                  v-if="isEdit"
                  v-model="scope.row.sourceTable"
                  popper-class="bs-el-select"
                  class="bs-el-select"
                  clearable
                  filterable
                >
                  <el-option
                    v-for="table in tableNameList"
                    :key="table"
                    :label="table"
                    :value="table"
                  />
                </el-select>
                <span v-else>{{ scope.row.sourceTable }}</span>
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
      <!-- 参数配置 -->
      <el-dialog
        title="SQL参数配置"
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
            class="bs-el-table"
            :data="paramsListCopy"
            :border="true"
            align="center"
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
                <el-radio-group v-model="scope.row.require">
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
          >取消</el-button>
          <el-button
            type="primary"
            @click="setParam"
          >确定</el-button>
        </span>
      </el-dialog>
    </el-scrollbar>
  </div>
</template>

<script>
import { nameCheckRepeat, sqlTest, datasetAdd, datasetUpdate, getDatasetInfo, getDatasetTypeList } from 'packages/js/utils/datasetConfigService'
import { datasourcePage } from 'packages/js/utils/dataSourceService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/nord.css'
import 'codemirror/lib/codemirror.css'
import _ from 'lodash'
export default {
  name: 'CustomEditForm',
  components: {
    codemirror
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
        code: '',
        curingType: '2',
        remark: '',
        sourceId: '',
        sqlProcess: 'select ',
        script: '',
        paramsList: [],
        paramConfig: '',
        cacheCoherence: null,
        fieldDesc: '',
        fieldJson: '',
        processType: '2'
      },
      rules: {
        name: [
          { required: true, message: '请输入数据集名称', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        // typeId: [
        //   {required: true, message: '请选择分组', trigger: 'blur'}
        // ],
        curingType: [
          { required: true, message: '请选择固化形式', trigger: 'blur' }
        ],
        sourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
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
      activeName: 'data',
      dataPreviewList: [],
      structurePreviewList: [],
      structurePreviewListCopy: [],
      msg: '',
      exception: '',
      typeSelect: [{
        value: 'String'
      }, {
        value: 'Integer'
      }, {
        value: 'Double'
      }, {
        value: 'Long'
      }, {
        value: 'Date'
      }],
      typeName: '',
      categoryData: [],
      passTest: false, // 通过测试
      current: 1,
      size: 10,
      totalCount: 0,
      fieldDescVisible: false,
      fieldsetVisible: false,
      paramsVisible: false,
      tableLoading: false,
      saveloading: false,
      saveText: '',
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
    // 打开参数配置
    openParamsConfig () {
      this.isTest = false
      this.paramsVisible = true
    },
    // 取消操作
    cancelParam () {
      this.paramsListCopy = _.cloneDeep(this.dataForm.paramsList)
      this.paramsVisible = false
    },
    // 设置SQL参数
    setParam () {
      this.dataForm.paramsList = _.cloneDeep(this.paramsListCopy)
      if (this.isTest) {
        this.datasetTest()
      }
      this.paramsVisible = false
    },
    // 取消操作
    cancelField () {
      this.structurePreviewListCopy = _.cloneDeep(this.structurePreviewList)
      this.fieldsetVisible = false
    },
    // 设置输出字段
    setField () {
      this.structurePreviewList = _.cloneDeep(this.structurePreviewListCopy)
      this.fieldsetVisible = false
    },
    // 每页大小改变触发
    sizeChangeHandle (value) {
      this.size = value
      this.current = 1
      if (this.dataForm.processType === '2') {
        this.datasetTest(false)
      }
    },
    // 当前页数改变
    currentChangeHandle (value) {
      this.current = value
      if (this.dataForm.processType === '2') {
        this.datasetTest(false)
      }
    },
    // 表视图切换，sql加工相关信息置空
    curingTypeChoose (value) {
      if (value === '3') {
        if (this.dataForm.sqlProcess === 'select ') {
          this.dataForm.sqlProcess = 'call '
        }
      } else {
        if (this.dataForm.sqlProcess === 'call ') {
          this.dataForm.sqlProcess = 'select '
        }
      }
      if ((!['select ', 'call '].includes(this.dataForm.sqlProcess) && this.dataForm.sqlProcess !== '') || this.dataForm.sourceId !== '' || this.dataForm.paramsList.length > 0) {
        this.$confirm('结果固化形式切换，表和视图处理情况不同，建议清空sql加工配置数据，是否清空数据？', '提示', {
          confirmButtonText: '是',
          cancelButtonText: '否',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }).then(() => {
          this.curingTypeChooseClear(value)
        }).catch(() => {
        })
      } else {
        this.curingTypeChooseClear(value)
      }
    },
    curingTypeChooseClear (value) {
      // 数据源id置空
      this.dataForm.sourceId = ''
      // sql脚本置空
      this.dataForm.sqlProcess = value === '3' ? 'call ' : 'select '
      this.passTest = false
      // 参数配置信息置空
      this.dataForm.paramsList = []
      this.paramsListCopy = []
      if (this.dataForm.id !== '') {
        getDatasetInfo(this.datasetId).then(data => {
          if (data.curingType === this.dataForm.curingType) {
            this.dataForm.sourceId = data.sourceId
            this.dataForm.sqlProcess = data.sqlProcess
            this.dataForm.paramsList = data.paramConfig !== '' ? JSON.parse(data.paramConfig) : []
            this.paramsListCopy = _.cloneDeep(this.dataForm.paramsList)
            this.passTest = true
          }
        })
      }
    },
    // 保存
    save (formName, nochecktosave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保数据集SQL加工脚本不为空且测试通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该自助数据集未生成输出字段，请重新检查')
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
      const chineseRegex = /[\u4e00-\u9fa5]/
      let hasChinese = false // 判断有无中文
      let ChineseCode = ''
      for (let i = 0; i < this.structurePreviewList.length; i++) {
        if (chineseRegex.test(this.structurePreviewList[i].columnName)) {
          hasChinese = true
          ChineseCode = this.structurePreviewList[i].columnName
          break
        }
      }
      if (hasChinese) {
        this.$confirm(`[${ChineseCode}]字段中包含汉字, 是否保继续保存？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }).then(() => {
          this.saveFun(formName)
        }).catch(() => {

        })
      } else {
        this.saveFun(formName)
      }
    },
    saveFun (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.dataForm.paramsList.length > 0) {
            const names = this.dataForm.paramsList.map(value => value.name)
            const namesSet = new Set(names)
            if (namesSet.size !== names.length) {
              this.$message.error('参数名称不能重复，请重新输入')
              return
            }
          }
          this.dataForm.paramConfig = this.dataForm.paramsList.length !== 0 ? JSON.stringify(this.dataForm.paramsList) : ''
          const columnMap = {}
          if (this.structurePreviewList.length > 0) {
            this.structurePreviewList.forEach(r => {
              columnMap[r.columnName] = r.fieldDesc
            })
            this.dataForm.fieldDesc = JSON.stringify(columnMap)
          }
          this.dataForm.fieldJson = this.structurePreviewList.length ? JSON.stringify(this.structurePreviewList) : ''
          this.saveloading = true
          this.saveText = '正在保存...'
          if (this.dataForm.id === '') {
            datasetAdd({
              ...this.dataForm,
              moduleCode: this.appCode,
              editable: this.appCode ? 1 : 0
            }).then(res => {
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
            datasetUpdate({
              ...this.dataForm,
              moduleCode: this.appCode,
              editable: this.appCode ? 1 : 0
            }).then(res => {
              this.$message.success('保存成功')
              this.$parent.init(false)
              this.$parent.setType = null
              this.saveloading = false
              this.saveText = ''
            }).catch(() => {
              this.saveloading = false
              this.saveText = ''
            })
          }
          this.saveloading = false
          this.saveText = ''
        } else {
          return false
        }
      })
    },
    // 字段值填充
    fieldDescFill () {
      this.structurePreviewList.forEach(field => {
        if (field.fieldDesc === '' || !field.hasOwnProperty('fieldDesc')) {
          field.fieldDesc = field.columnName
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
      this.save('form', true)
      this.fieldDescVisible = false
    },
    // 获取参数配置-解析并运行
    buildParams () {
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
      this.dataForm.paramsList = _.cloneDeep(params)
      this.paramsListCopy = _.cloneDeep(this.dataForm.paramsList)
      if (this.dataForm.paramsList.length) {
        this.paramsVisible = true
      } else {
        this.datasetTest()
      }
    },
    // 数据集测试
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
      this.saveloading = true
      sqlTest({
        datasetId: this.dataForm.id,
        sqlProcess: this.dataForm.sqlProcess,
        script: this.dataForm.script,
        paramConfig: this.dataForm.paramsList.length !== 0 ? JSON.stringify(this.dataForm.paramsList) : '',
        sourceId: this.dataForm.sourceId,
        current: this.current,
        size: this.size,
        curingType: this.dataForm.curingType,
        dataSetCode: this.dataForm.code,
        processType: '2'
      }).then(res => {
        if (res.code === 500) {
          this.$message.error('数据查询失败：' + res.msg)
          this.exception = res.exception
          this.msg = res.msg
          this.passTest = false
        } else {
          this.dataPreviewList = res.dataMap.dataPreview
          this.structurePreviewList = res.dataMap.structurePreview
          // 输出字段描述合并
          this.structurePreviewList.forEach(item => {
            const field = this.structurePreviewListCopy.find(_item => _item.columnName === item.columnName)
            if (field) {
              item.fieldDesc = field.fieldDesc
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
          this.totalCount = res.totalCount
          this.tableNameList = res.tableNameList
          if (this.tableNameList && this.tableNameList.length === 1) {
            this.structurePreviewList.forEach(item => {
              item.sourceTable = this.tableNameList[0]
            })
          }
          this.structurePreviewListCopy = _.cloneDeep(this.structurePreviewList)
          this.dataForm.cacheCoherence = res.cacheCoherence
          let paramsNameCheck = false
          this.dataForm.paramsList.forEach(param => {
            const checkList = this.structurePreviewList.filter(item => item.columnName === param.name)
            if (checkList.length) {
              paramsNameCheck = true
              param.name = ''
            }
          })
          if (paramsNameCheck) {
            this.$message.warning('参数名称不可以与字段名相同！')
            this.passTest = false
          } else {
            if (val) this.$message.success('测试成功')
            this.exception = ''
            this.msg = ''
            this.passTest = true
          }
        }
        this.saveloading = false
      }).catch(() => {
        this.passTest = false
        this.saveloading = false
      })
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
    // 校验名称【参数名称不能与字段名重复】
    checkParamsName (value) {
      const checkList = this.structurePreviewList.filter(item => item.columnName === value.name)
      if (checkList.length) {
        this.$message.warning('参数名称不可以与字段名相同！')
        value.name = ''
      }
    },
    // 删除参数配置
    delRow (index) {
      this.paramsListCopy.splice(index, 1)
    },
    // 新增参数配置
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
    // 获取数据源
    getDataSource () {
      const params = {
        current: 1,
        size: 1000,
        sourceName: '',
        sourceType: '',
        moduleCode: this.appCode
      }
      datasourcePage(params).then(data => {
        this.sourceList = data.list
      })
    },
    goBack () {
      this.$emit('back')
    },
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
      // this.getTreeList()
      this.getDataSource()
      if (this.datasetId) {
        // 获取详情
        getDatasetInfo(this.datasetId).then(res => {
          for (const key in res) {
            if (this.dataForm.hasOwnProperty(key)) {
              this.dataForm[key] = res[key]
            }
          }
          this.dataForm.name = this.datasetName
          this.dataForm.paramsList = this.dataForm.paramConfig.length ? JSON.parse(this.dataForm.paramConfig) : []
          this.paramsListCopy = _.cloneDeep(this.dataForm.paramsList)
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
      }
    },
    // 表头添加提示
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

/deep/ .el-input__inner {
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
  /deep/ .el-select {
    width: 200px !important;
    margin-right: 16px;
  }

  display: flex;
}

/deep/ .CodeMirror {
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

/deep/ .fieldDescCheck {
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
  height: 454px;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .paramConfig {
    max-height: 227px;

    .field-wrap {
      max-height: 175px;
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

.bs-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

/deep/ .bs-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}
</style>
