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
                {{ !isEdit ? '原始数据集详情' : dataForm.id ? '原始数据集编辑' : '原始数据集新增' }}
              </div>
              <div class="page-header-right">
                <el-button
                  class="bs-el-button-default"
                  @click="openNewWindow('https://www.yuque.com/chuinixiongkou/bigscreen/original_dataset')"
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
                  label="数据源"
                  prop="sourceId"
                >
                  <el-select
                    v-model="dataForm.sourceId"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    clearable
                    filterable
                    :disabled="!isEdit"
                    @change="setSource"
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
              <el-col :span="12">
                <el-form-item
                  label="关联原始表"
                  prop="tableName"
                >
                  <el-select
                    v-model="dataForm.tableName"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    clearable
                    filterable
                    :disabled="!isEdit"
                    @change="setTable"
                  >
                    <el-option-group label="表">
                      <el-option
                        v-for="table in tableList"
                        :key="table.name"
                        :label="table.name"
                        :value="table.name"
                        :disabled="table.status == 1"
                      />
                    </el-option-group>
                    <el-option-group label="视图">
                      <el-option
                        v-for="table in viewList"
                        :key="table.name"
                        :label="table.name"
                        :value="table.name"
                        :disabled="table.status == 1"
                      />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="输出字段"
                  prop="fieldInfo"
                >
                  <el-select
                    v-model="dataForm.fieldInfo"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    placeholder="请选择字段（为空时默认选择全部字段）"
                    clearable
                    filterable
                    multiple
                    collapse-tags
                    :disabled="!isEdit"
                    @change="setFields"
                  >
                    <el-option
                      v-if="fieldList.length"
                      label="全选"
                      value="全选"
                    >
                      <el-checkbox
                        v-model="isSelectAll"
                        @click.prevent.native
                      >
                        全选
                      </el-checkbox>
                    </el-option>
                    <el-option
                      v-for="field in fieldList"
                      :key="field.columnName"
                      :label="field.columnName"
                      :value="field.columnName"
                    >
                      <el-checkbox
                        v-model="field.isCheck"
                        @click.prevent.native
                      >
                        {{ field.columnName }}
                      </el-checkbox>
                    </el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item
                  label="是否去重"
                  prop="repeatStatus"
                >
                  <el-radio-group
                    v-model="dataForm.repeatStatus"
                    class="bs-radio-wrap"
                    :disabled="!isEdit"
                  >
                    <el-radio :label="0">
                      是
                    </el-radio>
                    <el-radio :label="1">
                      否
                    </el-radio>
                  </el-radio-group>
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
                    <span>{{ scope.row.sourceTable }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
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
            />
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
import { getDatasetTypeList, nameCheckRepeat, getOriginalTableDetail, addOrUpdateOriginal, getOriginalTableFieldInfo, getOriginalTableDetailsById } from 'packages/js/utils/datasetConfigService'
import { datasourcePage, getSourceTable, getSourceView } from 'packages/js/utils/dataSourceService'
import _ from 'lodash'
export default {
  name: 'OriginalEditForm',
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
      }).then((res) => {
        if (res) {
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
        sourceId: '',
        repeatStatus: 1,
        tableName: '',
        fieldInfo: [],
        remark: '',
        fieldDesc: '',
        fieldJson: ''
      },
      rules: {
        name: [
          { required: true, message: '数据集名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        // typeId: [
        //   {required: true, message: '请选择分组', trigger: 'blur'}
        // ],
        sourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
        ],
        tableName: [
          { required: true, message: '请选择原始表', trigger: 'change' }
        ],
        repeatStatus: [
          { required: true, message: '请选择是否去重', trigger: 'blur' }
        ]
      },
      typeName: '',
      categoryData: [],
      sourceList: [],
      tableList: [],
      viewList: [],
      fieldList: [],
      isSelectAll: false,
      activeName: 'data',
      dataPreviewList: [],
      structurePreviewList: [],
      structurePreviewListCopy: [],
      tableLoading: false,
      fieldDescVisible: false,
      fieldsetVisible: false,
      saveloading: false,
      saveText: '',
      totalCount: 0,
      currentCount: 0,
      current: 1,
      size: 10
    }
  },
  watch: {
    'dataForm.fieldInfo': {
      handler (value) {
        try {
          this.setCheck()
          this.getPreViewData()
        } catch (error) {
          console.error(error)
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    // 获取预览数据
    getData () {
      const params = {
        id: this.dataForm.id ? this.dataForm.id : '',
        sourceId: this.dataForm.sourceId,
        tableName: this.dataForm.tableName,
        fieldInfo: this.dataForm.fieldInfo.length ? this.dataForm.fieldInfo.join(',') : '',
        repeatStatus: this.dataForm.repeatStatus,
        size: this.size,
        current: this.current
      }
      this.tableLoading = true
      getOriginalTableDetail(params).then((data) => {
        this.dataPreviewList = data.dataPreview
        this.totalCount = data.totalCount
        this.tableLoading = false
      }).catch(() => {
        this.dataPreviewList = []
        this.totalCount = 0
        this.tableLoading = false
      })
    },
    // 每页大小改变触发
    sizeChangeHandle (value) {
      this.size = value
      this.current = 1
      this.getData()
    },
    // 当前页数改变
    currentChangeHandle (value) {
      this.current = value
      this.getData()
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
    // 字段值填充
    fieldDescFill () {
      this.structurePreviewList.forEach(item => {
        if (item.fieldDesc === '') {
          item.fieldDesc = item.columnName
        }
      })
      this.save('form')
      this.fieldDescVisible = false
    },
    // 进入编辑
    fieldDescEdit () {
      this.activeName = 'structure'
      // 滑动到底部
      this.$nextTick(() => {
        const dataAdd = document.getElementsByClassName('router-tab__container')[0]
        dataAdd.scrollTop = dataAdd.scrollHeight
      })
      this.fieldDescVisible = false
    },
    // 继续保存
    toSave () {
      this.save('form', true)
      this.fieldDescVisible = false
    },
    // 保存
    save (formName, nochecktosave = false) {
      if (!this.structurePreviewList.length) {
        this.$message.warning('该原始数据集未生成输出字段，请重新检查')
        return
      }
      if (!nochecktosave) {
        const temp = this.structurePreviewList.some(item => {
          return item.fieldDesc === ''
        }) // true-存在为空
        if (temp) {
          this.fieldDescVisible = true
          return
        }
      }
      this.$refs[formName].validate((valid) => {
        if (valid) {
          const columnMap = {}
          this.structurePreviewList.forEach(item => {
            columnMap[item.columnName] = item.fieldDesc
          })
          this.dataForm.fieldDesc = JSON.stringify(columnMap)
          this.dataForm.fieldInfo = this.dataForm.fieldInfo.length ? this.dataForm.fieldInfo.join(',') : ''
          this.dataForm.fieldJson = this.structurePreviewList.length ? JSON.stringify(this.structurePreviewList) : ''
          this.saveloading = true
          this.saveText = '正在保存...'
          addOrUpdateOriginal({
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
            this.$message.error('保存失败')
            this.saveloading = false
            this.saveText = ''
          })
        } else {
          this.saveloading = false
          this.saveText = ''
          return false
        }
      })
    },
    goBack () {
      this.$emit('back')
    },
    async init () {
      this.categoryData = await getDatasetTypeList({ tableName: 'r_dataset', moduleCode: this.appCode })
      // this.getTreeList()
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
      this.queryAllSource()
      if (this.datasetId) {
        // 获取详情
        getOriginalTableDetailsById(this.datasetId).then(res => {
          for (const key in res) {
            if (this.dataForm.hasOwnProperty(key)) {
              this.dataForm[key] = res[key]
            }
          }
          this.dataForm.fieldInfo = res.fieldInfo ? res.fieldInfo.split(',') : []
          this.dataForm.name = this.datasetName
          if (this.dataForm.typeId) {
            this.$nextTick(() => {
              try {
                this.typeName = this.$refs.categorySelectTree.getNode(this.dataForm.typeId).data.name
              } catch (error) {
                console.error(error)
              }
            })
          }
          this.queryAllTable()
          this.queryAllField()
        })
      }
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
    // 获取树节点
    // getTreeList() {
    //   getOriginalTableList().then(res => {
    //     this.categoryData = res
    //   })
    // },
    // 获取数据集
    queryAllSource () {
      const params = {
        current: 1,
        size: 1000,
        sourceName: '',
        sourceType: '',
        moduleCode: this.appCode
      }
      datasourcePage(params).then(res => {
        this.sourceList = res.list
      })
    },
    // 设置数据源
    setSource (value) {
      this.dataForm.tableName = ''
      this.dataForm.fieldInfo = []
      this.tableList = []
      this.fieldList = []
      if (!this.dataForm.sourceId) return
      this.queryAllTable()
    },
    // 获取原始表
    queryAllTable () {
      getSourceTable(this.dataForm.sourceId).then(res => {
        this.tableList = res
      }).catch(() => {
        this.tableList = []
      })
      getSourceView(this.dataForm.sourceId).then(res => {
        this.viewList = res
      }).catch(() => {
        this.viewList = []
      })
    },
    // 设置原始表
    setTable (value) {
      this.fieldList = []
      this.dataForm.fieldInfo = []
      if (!this.dataForm.tableName) return
      this.queryAllField()
    },
    // 获取原始表字段
    queryAllField () {
      getOriginalTableFieldInfo({
        sourceId: this.dataForm.sourceId,
        tableName: this.dataForm.tableName
      }).then((data) => {
        this.fieldList = data.map(field => {
          field.isCheck = false
          if (this.dataForm.fieldInfo.includes(field.columnName)) {
            field.isCheck = true
          }
          return field
        })
        this.getPreViewData()
      }).catch(() => {
        this.fieldList = []
      })
    },
    setFields (values) {
      if (values.includes('全选')) {
        // 说明已经全选了，所以全不选
        if (values.length > this.fieldList.length) {
          this.dataForm.fieldInfo = []
        } else {
          this.dataForm.fieldInfo = this.fieldList.map(field => field.columnName)
        }
      }
    },
    // 设置字段check
    setCheck () {
      this.fieldList.forEach(field => {
        if (this.dataForm.fieldInfo.includes(field.columnName)) {
          field.isCheck = true
        } else {
          field.isCheck = false
        }
      })
      if (this.fieldList.length && this.dataForm.fieldInfo.length === this.fieldList.length) {
        this.isSelectAll = true
      } else {
        this.isSelectAll = false
      }
    },
    getPreViewData () {
      this.dataPreviewList = []
      this.structurePreviewList = []
      this.structurePreviewListCopy = []
      if (!this.dataForm.sourceId || !this.dataForm.tableName) return
      const params = {
        id: this.dataForm.id ? this.dataForm.id : '',
        sourceId: this.dataForm.sourceId,
        tableName: this.dataForm.tableName,
        fieldInfo: this.dataForm.fieldInfo.length ? this.dataForm.fieldInfo.join(',') : '',
        repeatStatus: this.dataForm.repeatStatus,
        size: this.size,
        current: this.current
      }
      this.tableLoading = true
      getOriginalTableDetail(params).then((data) => {
        this.dataPreviewList = data.dataPreview
        this.structurePreviewList = data.structurePreview
        this.structurePreviewList.forEach(item => {
          if (!item.hasOwnProperty('orderNum')) {
            this.$set(item, 'orderNum', 0)
          }
          if (!item.hasOwnProperty('sourceTable')) {
            this.$set(item, 'sourceTable', this.dataForm.tableName)
          }
          if (!item.hasOwnProperty('fieldDesc')) {
            this.$set(item, 'fieldDesc', '')
          }
        })
        this.structurePreviewListCopy = _.cloneDeep(this.structurePreviewList)
        this.totalCount = data.totalCount
        this.currentCount = data.currentCount
        this.tableLoading = false
      }).catch(() => {
        this.dataPreviewList = []
        this.structurePreviewList = []
        this.structurePreviewListCopy = []
        this.totalCount = 0
        this.currentCount = 0
        this.tableLoading = false
      })
    },
    // 表头添加提示
    renderHeader (h, { column, index }) {
      const labelLong = column.label.length // 表头label长度
      const size = 14 // 根据需要定义标尺，直接使用字体大小确定就行，也可以根据需要定义
      column.minWidth = labelLong * size < 120 ? 120 : labelLong * size // 根据label长度计算该表头最终宽度
      return h('span', { class: 'cell-content', style: { width: '100%' } }, [column.label])
    },
    resetData () {
      this.dataForm = {
        id: '',
        name: '',
        typeId: '',
        sourceId: '',
        repeatStatus: 0,
        tableName: '',
        fieldInfo: [],
        remark: '',
        fieldDesc: ''
      }
      this.sourceList = []
      this.tableList = []
      this.fieldList = []
      this.isSelectAll = false
      this.activeName = 'data'
      this.dataPreviewList = []
      this.structurePreviewList = []
      this.structurePreviewListCopy = []
      this.$refs.form.clearValidate()
    },
    openNewWindow (url) {
      window.open(url, '_blank')
    }
  }
}
</script>

<style lang="scss"></style>

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
  max-height: 156px;
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

/deep/ .bs-table-box.is-Edit .el-table {
  max-height: calc(100vh - 532px) !important;

  .el-table__body-wrapper {
    max-height: calc(100vh - 568px) !important;
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

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}
</style>
