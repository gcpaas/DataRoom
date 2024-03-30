<template>
  <div
    v-loading="saveLoading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="dataroom-dataset-el-scrollbar">
      <div class="header">
        <page-header
          :title="!isEdit ? '原始数据集详情' : dataForm.id ? '编辑原始数据集' : '新增原始数据集'"
          :save-btn="isEdit"
          url="https://www.yuque.com/chuinixiongkou/bigscreen/ry3ggnrts7q3ro1g"
          @back="goBack"
          @save="save('form')"
        />
      </div>
      <el-row>
        <el-col :span="24">
          <span class="dataroom-dataset-basic-info">
            基本信息
          </span>
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
                    v-loading="selectorLoading"
                    element-loading-spinner="el-icon-loading"
                    class="bs-el-select"
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
                      />
                    </el-option-group>
                    <el-option-group label="视图">
                      <el-option
                        v-for="table in viewList"
                        :key="table.name"
                        :label="table.name"
                        :value="table.name"
                      />
                    </el-option-group>
                  </el-select>
                </el-form-item>
              </el-col>
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
                    class="bs-el-radio-group"
                    :disabled="!isEdit"
                    @change="repeatStatusChange"
                  >
                    <el-radio :label="1">
                      是
                    </el-radio>
                    <el-radio :label="0">
                      否
                    </el-radio>
                  </el-radio-group>
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
                      style="color: #E3C98C;margin-left: 16px;font-size:14px"
                    />
                  </el-tooltip>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="12">
                <el-form-item
                  label="标签"
                  prop="labelIds"
                >
                  <label-select
                    :dataset-id="datasetId"
                    :id-list="dataForm.labelIds"
                    @commit="(ids) =>{dataForm.labelIds = ids}"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-col>
      </el-row>
      <div
        v-if="isEdit"
        style="margin-top: 12px;"
      >
        <data-preview
          ref="dataPreview"
          :data="dataPreviewList"
          :loading="dataPreviewTableLoading"
          :header-fields="headerFields"
          :header-column="sortedTablePreviewList"
          :total-count="totalCount"
          :size="size"
          :current="current"
          @size-change="(value) => sizeChangeHandle(value)"
          @current-change="(value) => currentChangeHandle(value)"
        />
      </div>
      <!-- 字段填充 -->
      <el-dialog
        title="输出字段配置"
        :visible.sync="fieldsetVisible"
        width="1000px"
        append-to-body
        :close-on-click-modal="false"
        :before-close="cancelField"
        class="dataroom-el-dialog"
      >
        <div class="dataroom-table-box">
          <el-table
            :data="structurePreviewListCopy"
            :border="true"
            align="center"
            class="dataroom-el-table"
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
            <el-table-column
              align="center"
              prop="sourceTable"
              label="字段来源"
            />
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
import PageHeader from '@gcpaas/data-room-ui/packages/dataSet/components/PageHeader.vue'
import DataPreview from '@gcpaas/data-room-ui/packages/dataSet/components/DataPreview.vue'
import LabelSelect from '@gcpaas/data-room-ui/packages/dataSet/components/LabelSelect.vue'
import TypeSelect from '@gcpaas/data-room-ui/packages/dataSet/components/TypeSelect.vue'
import {
  nameCheckRepeat, datasetExecuteTest,
  getDataset, datasetUpdate, datasetAdd
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
import { datasourceList, getSourceTable, getSourceView, getTableFieldList } from '@gcpaas/data-room-ui/packages/assets/js/api/dataSourceService.js'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/dataset.js'
export default {
  name: 'OriginalEditForm',
  components: {
    PageHeader,
    DataPreview,
    LabelSelect,
    TypeSelect
  },
  mixins: [datasetMixin],
  data () {
    const validateName = (rule, value, callback) => {
      nameCheckRepeat({
        id: this.datasetId,
        name: value
      }).then((res) => {
        if (res) {
          callback(new Error('数据集名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      headerFields: [],
      dataPreviewTableLoading: false,
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        datasetType: 'original',
        remark: '',
        cache: 0,
        labelIds: [],
        // 以下为config信息
        sourceId: '',
        repeatStatus: 1,
        tableName: '',
        fieldInfo: [],
        fieldDesc: {},
        fieldList: []
      },
      rules: {
        name: [
          { required: true, message: '数据集名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ],
        sourceId: [
          { required: true, message: '请选择数据源', trigger: 'blur' }
        ],
        tableName: [
          { required: true, message: '请选择原始表', trigger: 'change' }
        ],
        repeatStatus: [
          { required: true, message: '请选择是否去重', trigger: 'blur' }
        ],
        typeId: [
          { required: true, message: '请选择分组', trigger: 'blur' }
        ]
      },
      // 数据源列表
      sourceList: [],
      // 表列表
      tableList: [],
      // 视图列表
      viewList: [],
      // 字段列表
      fieldList: [],
      isSelectAll: false,
      activeName: 'data',
      currentCount: 0,
      selectorLoading: false,
      oldStructurePreviewList: [],
      isInit: false
    }
  },
  computed: {
    noDataTableDisplayFields () {
      // 表格列对象
      const tableColumnObject = {}
      this.structurePreviewList.forEach(item => {
        tableColumnObject[item.fieldName] = ''
      })
      return tableColumnObject
    },
    sortedTablePreviewList () {
      const tableList = this.dataPreviewList[0] ? this.dataPreviewList[0] : this.noDataTableDisplayFields
      const list = Object.keys(tableList)
      list.sort((a, b) => {
        return this.structurePreviewListCopy.findIndex(item => item.fieldName === a) - this.structurePreviewListCopy.findIndex(item => item.fieldName === b)
      })
      return list
    },
    sortedStructurePreviewList () {
      const list = this.structurePreviewList
      list.sort((a, b) => {
        return a.orderNum - b.orderNum
      })
      return list
    }
  },
  watch: {
    'dataForm.fieldInfo': {
      handler (value) {
        try {
          this.setCheck()
          const fieldDescMap = {}
          this.fieldList.forEach((item) => {
            if (value.length !== 0 && !value.includes(item.columnName)) {
              return
            }
            fieldDescMap[item.columnName] = item.columnComment
          })
          this.getPreViewData(fieldDescMap)
        } catch (error) {
          console.error(error)
        }
      },
      deep: true,
      immediate: true
    },
    sortedStructurePreviewList (val) {
      this.structurePreviewListCopy = cloneDeep(val)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     * 1.获取分类树
     * 2.获取数据源列表
     * 3.获取数据集详情
     * 4.获取原始表列表
     * 5.获取字段列表
     */
    async init () {
      this.queryAllSource()
      if (!this.datasetId) {
        return
      }
      // 获取详情
      getDataset(this.datasetId).then(res => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.cache = res.cache
        this.dataForm.datasetType = res.datasetType
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        // config 配置
        this.dataForm.tableName = res.config.tableName
        this.dataForm.repeatStatus = res.config.repeatStatus
        this.dataForm.fieldList = res.config.fieldList
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.oldStructurePreviewList = cloneDeep(res.config.fieldList)
        // 字段信息，转为数组
        this.dataForm.fieldInfo = res.config.fieldInfo ? res.config.fieldInfo.split(',') : []
        if (res.config.fieldList && res.config.fieldList.length > 0) {
          this.headerFields = res.config.fieldList
        }
        this.isInit = true
        this.queryAllTable()
        this.queryAllField()
      })
    },
    /**
     * 获取预览数据
     */
    getData () {
      let allField = []
      if (this.dataForm.fieldInfo.length === 0) {
        // 从字段列表中取出所有字段
        allField = this.fieldList.map(field => field.columnName)
      }
      const executeParams = {
        dataSourceId: this.dataForm.sourceId,
        script: JSON.stringify({
          fieldInfo: this.dataForm.fieldInfo.length === 0 ? allField : this.dataForm.fieldInfo,
          tableName: this.dataForm.tableName,
          repeatStatus: this.dataForm.repeatStatus
        }),
        // 原始表数据集没有数据集参数
        params: [],
        dataSetType: 'original',
        size: this.size,
        current: this.current
      }
      this.tableLoading = true
      datasetExecuteTest(executeParams).then((data) => {
        if (this.dataForm.fieldList == null) {
          this.dataForm.fieldList = cloneDeep(data.structure)
        }
        // 如果headerFields和structure里的fieldName 一致的话，优先使用headerFields里的fieldDesc和fieldType
        if (data.structure.length > 0 && this.headerFields.length > 0) {
          data.structure.forEach(item => {
            const headerField = this.headerFields.find(headerItem => headerItem.fieldName === item.fieldName)
            if (headerField) {
              item.fieldDesc = headerField.fieldDesc
              item.fieldType = headerField.fieldType
            }
          })
        }
        this.headerFields = cloneDeep(data.structure)
        // 如果headerFields和structure里的fieldName 一致的话，优先使用headerFields里的fieldDesc和fieldType
        if (data.structure.length > 0) {
          data.structure.forEach(item => {
            const headerField = this.headerFields.find(headerItem => headerItem.fieldName === item.fieldName)
            if (headerField) {
              item.fieldDesc = headerField.fieldDesc
              item.fieldType = headerField.fieldType
            }
          })
        }
        this.dataPreviewList = cloneDeep(data.data.list)
        this.totalCount = data.data.totalCount
        this.tableLoading = false
      }).catch(() => {
        this.dataPreviewList = []
        this.totalCount = 0
        this.tableLoading = false
      })
    },
    /**
     * 保存数据集
     * @param formName 表单名称
     * @param noCheckToSave 是否不检查直接保存
     */
    save (formName, noCheckToSave = false) {
      // if (!this.structurePreviewList.length) {
      //   this.$message.warning('该原始数据集未生成输出字段，请重新检查')
      //   return
      // }
      // if (!noCheckToSave) {
      //   const temp = this.structurePreviewList.some(item => {
      //     return item.fieldDesc === ''
      //   }) // true-存在为空
      //   if (temp) {
      //     this.fieldDescVisible = true
      //     return
      //   }
      // }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          this.saveLoading = false
          this.saveText = ''
          return false
        }
        // 组装字段描述
        const columnMap = {}
        this.structurePreviewList.forEach(item => {
          columnMap[item.fieldName] = item.fieldDesc
        })
        const { headerColumnObj } = this.$refs.dataPreview ?? {}
        const fieldList = Object.values(headerColumnObj ?? {}).map(({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
          fieldName,
          fieldDesc,
          fieldType
        }))
        // 组装保存参数
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          remark: this.dataForm.remark,
          cache: this.dataForm.cache,
          datasetType: 'original',
          sourceId: this.dataForm.sourceId,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.OriginalDataSetConfig',
            sourceId: this.dataForm.sourceId,
            tableName: this.dataForm.tableName,
            fieldInfo: this.dataForm.fieldInfo.length ? this.dataForm.fieldInfo.join(',') : '',
            fieldDesc: columnMap,
            fieldList,
            repeatStatus: this.dataForm.repeatStatus
          }
        }
        this.saveLoading = true
        this.saveText = '正在保存...'
        const saveOriginal = this.dataForm.id ? datasetUpdate : datasetAdd
        saveOriginal(datasetParams).then(() => {
          this.goBack()
          this.$message.success('保存成功')
          this.$parent.init(false)
          this.$parent.setType = null
          this.saveLoading = false
          this.saveText = ''
        }).catch(() => {
          this.$message.error('保存失败')
          this.saveLoading = false
          this.saveText = ''
        })
      })
    },
    /**
     * 获取数据源列表
     */
    queryAllSource () {
      const params = {
        sourceName: '',
        sourceType: ''
      }
      datasourceList(params).then(res => {
        this.sourceList = res
      })
    },
    /**
     * 选中数据源
     * @param value
     */
    setSource (value) {
      this.dataForm.tableName = ''
      this.dataForm.fieldInfo = []
      this.tableList = []
      this.fieldList = []
      if (!this.dataForm.sourceId) return
      this.queryAllTable()
    },
    /**
     * 获取原始表列表
     * 1.获取表列表
     * 2.获取视图列表
     */
    queryAllTable () {
      getSourceTable(this.dataForm.sourceId).then(res => {
        this.tableList = res
      }).catch(() => {
        this.tableList = []
      })
      this.selectorLoading = true
      getSourceView(this.dataForm.sourceId).then(res => {
        this.viewList = res
        this.selectorLoading = false
      }).catch(() => {
        this.viewList = []
        this.selectorLoading = false
      })
    },
    /**
     * 选中原始表
     * @param value
     */
    async setTable () {
      this.fieldList = []
      if (!this.dataForm.tableName) {
        this.dataForm.fieldInfo = []
        return
      }
      await this.queryAllField()
      // dataForm.fieldInfo的清空会触发监听事件，如果在queryAllField之前清空，会导致监听事件中的getPreViewData方法获取不到fieldList
      this.dataForm.fieldInfo = []
    },
    repeatStatusChange () {
      this.getPreViewData()
    },
    /**
     * 获取原始表字段列表
     */
    queryAllField () {
      this.dataPreviewTableLoading = true
      return new Promise((resolve, reject) => {
        getTableFieldList(this.dataForm.sourceId, this.dataForm.tableName)
          .then((data) => {
            this.dataPreviewTableLoading = false
            const fieldDescMap = {}
            this.fieldList = data.map(field => {
              fieldDescMap[field.columnName] = field.columnComment
              field.isCheck = false
              if (this.dataForm.fieldInfo.includes(field.columnName)) {
                field.isCheck = true
              }
              return field
            })
            resolve()
          })
          .catch(() => {
            this.fieldList = []
            reject()
          })
      })
    },
    /**
     * 选中字段
     * @param values 选中的字段列表
     */
    setFields (values) {
      if (values.includes('全选')) {
        if (values.length > this.fieldList.length) {
          this.dataForm.fieldInfo = []
        } else {
          this.dataForm.fieldInfo = this.fieldList.map(field => field.columnName)
        }
      }
    },
    /**
     * 设置字段选中状态
     */
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
    /**
     * 获取数据预览
     * @param fieldDescMap 字段描述
     */
    getPreViewData (fieldDescMap) {
      this.dataPreviewList = []
      this.structurePreviewList = []
      this.structurePreviewListCopy = []
      if (!this.dataForm.sourceId || !this.dataForm.tableName) return
      let allField = []
      if (this.dataForm.fieldInfo.length === 0) {
        // 从字段列表中取出所有字段
        allField = this.fieldList.map(field => field.columnName)
      }
      const executeParams = {
        dataSourceId: this.dataForm.sourceId,
        script: JSON.stringify({
          fieldInfo: this.dataForm.fieldInfo.length ? this.dataForm.fieldInfo : allField,
          tableName: this.dataForm.tableName,
          repeatStatus: this.dataForm.repeatStatus
        }),
        // 原始表数据集没有数据集参数
        params: [],
        dataSetType: 'original',
        size: this.size,
        current: this.current
      }
      this.tableLoading = true
      datasetExecuteTest(executeParams).then((data) => {
        this.dataPreviewList = data.data.list
        this.structurePreviewList = data.structure
        // 如果headerFields和structure里的fieldName 一致的话，优先使用headerFields里的fieldDesc和fieldType
        if (data.structure.length > 0 && this.headerFields.length > 0) {
          data.structure.forEach(item => {
            const headerField = this.headerFields.find(headerItem => headerItem.fieldName === item.fieldName)
            if (headerField) {
              item.fieldDesc = headerField.fieldDesc
              item.fieldType = headerField.fieldType
            }
          })
        }
        this.headerFields = cloneDeep(data.structure)
        // 如果是初始化
        if (this.isInit) {
          this.structurePreviewList = this.dataForm.fieldList
          this.isInit = false
        } else {
          this.structurePreviewList.forEach(item => {
            if (!item.hasOwnProperty('orderNum')) {
              this.$set(item, 'orderNum', 0)
            }
            if (!item.hasOwnProperty('sourceTable')) {
              this.$set(item, 'sourceTable', this.dataForm.tableName)
            }
            if (!item.hasOwnProperty('fieldDesc')) {
              let fieldDesc = ''
              if (fieldDescMap && fieldDescMap[item.fieldName]) {
                fieldDesc = fieldDescMap[item.fieldName]
              }
              this.$set(item, 'fieldDesc', fieldDesc)
              // this.structurePreviewList 和 this.oldStructurePreviewList 比较，如果旧的数据里fieldDesc有值则重新赋值给新的数据
              this.structurePreviewList.forEach(item => {
                const oldItem = this.oldStructurePreviewList.find(oldItem => oldItem.fieldName === item.fieldName)
                if (oldItem && oldItem.fieldDesc) {
                  const { fieldDesc, ...rest } = oldItem
                  item.fieldDesc = fieldDesc
                  Object.keys(rest).forEach(key => {
                    this.$set(item, key, rest[key])
                  })
                }
              })

              // this.structurePreviewList = this.oldStructurePreviewList.map(oldItem => {
              //   const data = this.structurePreviewList.find(item => oldItem.fieldName === item.fieldName)
              //   if (data) {
              //     return {
              //       ...oldItem,
              //       fieldDesc: oldItem.fieldDesc
              //     }
              //   }
              // })
            }
          })
        }

        this.structurePreviewListCopy = cloneDeep(this.structurePreviewList).sort((a, b) => {
          return a.orderNum - b.orderNum
        })
        this.totalCount = data.data.totalCount
        this.currentCount = data.data.currentCount
        this.tableLoading = false
      }).catch((e) => {
        this.dataPreviewList = []
        this.structurePreviewList = []
        this.structurePreviewListCopy = []
        this.totalCount = 0
        this.currentCount = 0
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
    setField () {
      this.structurePreviewList = cloneDeep(this.structurePreviewListCopy)
      this.oldStructurePreviewList = cloneDeep(this.structurePreviewListCopy)
      this.fieldsetVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
@import "../assets/css/index.scss";
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";

::v-deep .el-input__inner {
  width: 100% !important;
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

::v-deep .dataroom-table-box.is-Edit .el-table {
  .el-table__body-wrapper {
    max-height: unset !important;
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

.dataroom-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

.bs-pagination {
  padding: 16px !important;
  position: unset !important;
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

// 修改el-select样式 loading 位置
::v-deep .el-loading-spinner{
  top: 75%;
}

.bs-el-select{
  width: 100% !important;
}
::v-deep .el-input__inner{
  width: 100% !important;
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
