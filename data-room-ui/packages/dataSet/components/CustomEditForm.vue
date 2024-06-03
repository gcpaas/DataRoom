<!-- eslint-disable vue/no-parsing-error -->
<template>
  <div
    v-loading="saveLoading"
    :element-loading-text="saveText"
    class="inner-container"
  >
    <el-scrollbar class="dataroom-dataset-el-scrollbar">
      <div class="header">
        <page-header
          :save-btn="isEdit"
          :title="
            !isEdit
              ? '自助数据集详情'
              : dataForm.id
                ? '编辑自助数据集'
                : '新增自助数据集'
          "
          url="https://www.yuque.com/chuinixiongkou/bigscreen/self_dataset"
          @back="goBack"
          @save="save('form')"
        />
      </div>
      <el-row>
        <el-col :span="isEdit ? 10 : 24">
          <span class="dataroom-dataset-basic-info"> 基本信息 </span>
          <el-form
            ref="form"
            :model="dataForm"
            :rules="rules"
            class="bs-el-form"
            label-width="120px"
            style="padding: 16px 16px 0"
          >
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item
                  label="数据集名称"
                  prop="name"
                >
                  <el-input
                    v-model="dataForm.name"
                    :disabled="!isEdit"
                    class="bs-el-input"
                    clearable
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
                    :disabled="!isEdit"
                    class="bs-el-input"
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
                    :disabled="!isEdit"
                    class="bs-el-select"
                    clearable
                    filterable
                    placeholder="请选择数据源"
                    popper-class="bs-el-select"
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
                    content="开启缓存:会在首次调用该数据集时，将结果缓存，在接下来的十分钟内，若再次被调用则直接返回缓存中的数据，注意：在当前数据集编辑页面缓存不生效"
                    effect="light"
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
                  label="语法类型"
                  prop="syntaxType"
                >
                  <el-radio-group
                    v-model="dataForm.syntaxType"
                    class="bs-el-radio-group"
                  >
                    <el-radio label="normal">
                      普通
                    </el-radio>
                    <el-radio label="mybatis">
                      Mybatis
                    </el-radio>
                  </el-radio-group>
                  <el-tooltip
                    class="item"
                    content="Mybatis类型可使用动态标签来处理sql，如if、choose、where，具体用法可参考示例"
                    effect="light"
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
                style="margin-top: 2px; border: 1px solid #ebeef5"
              />
              <div
                v-if="dataForm.syntaxType === 'mybatis'"
                class="bs-codemirror-bottom-text"
              >
                示例：
                <strong><br>
                  1、常规使用
                  <el-tooltip
                    class="item"
                    content="${参数名称}会将参数值直接填充到sql中，#{参数名称}会将参数值进行转义（比如字符串类型会添加''）后填充到sql中"
                    effect="dark"
                    placement="top-start"
                    popper-class="dataroom-el-tooltip"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where table_field =
                  <span style="color: #cc7832">${参数名称}</span> ( 或
                  <span style="color: #cc7832">#{参数名称}</span> )<br>
                  2、条件判断
                  <el-tooltip
                    class="item"
                    content="支持Mybatis的所有动态标签，如if、choose、where等，具体用法请参考Mybatis官方文档"
                    effect="dark"
                    placement="top-start"
                    popper-class="dataroom-el-tooltip"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where 1=1
                  <span style="color: #2f67a7">&lt;if test="参数名称 != null and 参数名称 !=''"&gt;</span>
                  and table_field =
                  <span style="color: #cc7832">${参数名称}</span>
                  <span style="color: #2f67a7">&lt;/if&gt;</span>
                </strong>
              </div>
              <div
                v-else
                class="bs-codemirror-bottom-text"
              >
                示例：
                <strong><br>
                  1、常规使用 select * from table where table_field =
                  <span style="color: #cc7832">${参数名称}</span><br>
                  2、标签使用
                  <el-tooltip
                    class="item"
                    content="<参数名称></参数名称>为非空标签, 当该参数值为空时, 标签部分不进行处理"
                    effect="dark"
                    placement="top-start"
                    popper-class="dataroom-el-tooltip"
                  ><i class="el-icon-question" />
                  </el-tooltip>
                  select * from table where 1=1
                  <span style="color: #2f67a7">&lt;参数名称&gt;</span> and
                  table_field = <span style="color: #cc7832">${参数名称}</span>
                  <span style="color: #2f67a7">&lt;/参数名称&gt;</span>
                </strong>
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
          :current="current"
          :data="dataPreviewList"
          :header-column="sortedTablePreviewList"
          :header-fields="headerFields"
          :size="size"
          :total-count="totalCount"
          @size-change="(value) => sizeChangeHandle(value)"
          @current-change="(value) => currentChangeHandle(value)"
        />
      </div>
      <div v-if="!isEdit">
        <el-tabs v-model="activeName">
          <el-tab-pane
            v-loading="tableLoading"
            label="数据预览"
            name="data"
          >
            <div class="dataroom-table-box">
              <el-table
                :border="true"
                :data="dataPreviewList"
                align="center"
                max-height="400"
              >
                <el-table-column
                  v-for="(value, key) in dataPreviewList[0]"
                  :key="key"
                  :label="key"
                  align="center"
                  show-overflow-tooltip
                >
                  <!-- :render-header="renderHeader" -->
                  <template slot-scope="scope">
                    <span>{{ scope.row[key] }}</span>
                  </template>
                </el-table-column>
              </el-table>
            </div>
            <div class="bs-pagination">
              <el-pagination
                :current-page="current"
                :page-size="size"
                :page-sizes="[10, 20, 50, 100]"
                :total="totalCount"
                background
                class="bs-el-pagination"
                layout="total, prev, pager, next,sizes"
                next-text="下一页"
                popper-class="bs-el-pagination"
                prev-text="上一页"
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
            <div class="dataroom-table-box">
              <el-table
                :border="true"
                :data="structurePreviewList"
                align="center"
                max-height="400"
              >
                <el-table-column
                  align="center"
                  label="字段值"
                  prop="fieldName"
                  show-overflow-tooltip
                />
                <el-table-column
                  align="center"
                  label="字段类型"
                  prop="fieldType"
                  show-overflow-tooltip
                />
                <el-table-column
                  align="center"
                  label="字段描述"
                  prop="fieldDesc"
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="isEdit"
                      v-model="scope.row.fieldDesc"
                      class="labeldsc bs-el-input"
                      size="small"
                    />
                    <span v-else>{{ scope.row.fieldDesc }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  label="字段排序"
                  prop="orderNum"
                  sortable
                >
                  <template slot-scope="scope">
                    <el-input
                      v-if="isEdit"
                      v-model="scope.row.orderNum"
                      class="labeldsc bs-el-input"
                      size="small"
                    />
                    <span v-else>{{ scope.row.orderNum }}</span>
                  </template>
                </el-table-column>
                <el-table-column
                  align="center"
                  label="字段来源"
                  prop="sourceTable"
                >
                  <template slot-scope="scope">
                    <el-select
                      v-if="isEdit"
                      v-model="scope.row.sourceTable"
                      class="bs-el-select"
                      clearable
                      filterable
                      popper-class="bs-el-select"
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
  datasetAdd,
  datasetExecuteTest,
  datasetUpdate,
  getDataset,
  nameCheckRepeat
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
import { datasourceList } from '@gcpaas/data-room-ui/packages/assets/js/api/dataSourceService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/sql/sql.js'
import 'codemirror/theme/eclipse.css'
import 'codemirror/lib/codemirror.css'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/dataset.js'

export default {
  name: 'CustomEditForm',
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
      headerFields: [],
      dataForm: {
        id: '',
        name: '',
        typeId: '',
        datasetType: 'custom',
        remark: '',
        labelIds: [],
        // 以下为config配置
        sourceId: '',
        cache: 0,
        sqlProcess: 'select * from 表名称',
        paramsList: [],
        fieldDesc: {},
        fieldList: [],
        script: '',
        cacheCoherence: null,
        syntaxType: 'normal'
      },
      fieldTypeOptions: [
        {
          value: 'text',
          label: '文本'
        },
        {
          value: 'number',
          label: '数字'
        },
        {
          value: 'date',
          label: '时间'
        },
        {
          value: 'boolean',
          label: '布尔值'
        }
      ],
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
      activeName: 'data',
      msg: '',
      exception: '',
      passTest: false, // 通过测试
      // paramsVisible: false,
      tableNameList: [],
      paramsListCopy: []
      // isTest: false // 是否执行测试
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
    },
    // 输出字段根据orderNum排序
    sortedStructurePreviewList () {
      const list = this.structurePreviewList
      list.sort((a, b) => {
        return a.orderNum - b.orderNum
      })
      return list
    },
    sortedTablePreviewList () {
      const tableList = this.dataPreviewList[0]
        ? this.dataPreviewList[0]
        : this.noDataTableDisplayFields
      const list = Object.keys(tableList)
      list.sort((a, b) => {
        return (
          this.structurePreviewListCopy.findIndex(
            (item) => item.fieldName === a
          ) -
          this.structurePreviewListCopy.findIndex(
            (item) => item.fieldName === b
          )
        )
      })
      return list
    }
  },
  watch: {
    // 一旦sql、脚本、参数发生变化，将通过测试置为false
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
     * 1.获取数据源列表
     * 2.如果是编辑，获取数据集详情
     */
    async init () {
      // 获取数据源列表
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
        this.dataForm.moduleCode = res.moduleCode
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
        this.dataForm.syntaxType = res.config.syntaxType
          ? res.config.syntaxType
          : 'normal'
        // 使用传入的数据集名称 ？
        this.dataForm.name = this.datasetName
        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
        this.datasetTest(false)
      })
    },
    getRules (row) {
      return [
        {
          required: row.require === 1,
          message: '参数值不能为空',
          trigger: ['blur', 'change']
        }
      ]
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
      datasourceList(params).then((data) => {
        this.sourceList = data
        if(!this.dataForm.sourceId ) {
          this.dataForm.sourceId = this.sourceId || ''
        }
      })
    },
    /**
     * 保存
     * @param formName 表单名称
     * @param noCheckToSave 是否不检查直接保存
     */
    save (formName, noCheckToSave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保数据集SQL加工脚本不为空且运行通过')
        return
      }
      // if (!this.structurePreviewList.length) {
      //   this.$message.warning('该自助数据集未生成输出字段，请重新检查')
      //   return
      // }
      if (!noCheckToSave) {
        // const temp = this.structurePreviewList.some((item) => {
        //   return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
        // }) // true-存在为空
        // if (temp) {
        //   this.fieldDescVisible = true
        //   return
        // }
      }
      const chineseRegex = /[\u4e00-\u9fa5]/
      let hasChinese = false // 判断有无中文
      let ChineseCode = ''
      for (let i = 0; i < this.structurePreviewList.length; i++) {
        if (chineseRegex.test(this.structurePreviewList[i].fieldName)) {
          hasChinese = true
          ChineseCode = this.structurePreviewList[i].fieldName
          break
        }
      }
      if (hasChinese) {
        this.$confirm(
          `[${ChineseCode}]字段中包含汉字, 是否保继续保存？`,
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'bs-el-message-box'
          }
        )
          .then(() => {
            this.saveFun(formName)
          })
          .catch(() => {})
      } else {
        this.saveFun(formName)
      }
    },
    /**
     * 保存数据集
     * @param formName
     */
    saveFun (formName) {
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        // 通过params-config 组件获取参数数据
        this.dataForm.paramsList = cloneDeep(
          this.$refs.paramsConfig?.innerData ?? []
        )
        // 校验参数名称是否重复
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map((value) => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        // 设置字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach((r) => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        const { headerColumnObj } = this.$refs.dataPreview ?? {}
        const fieldList = Object.values(headerColumnObj ?? {}).map(
          ({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
            fieldName,
            fieldDesc,
            fieldType
          })
        )
        this.dataForm.fieldList = this.structurePreviewList
        this.saveLoading = true
        this.saveText = '正在保存...'
        const datasetSave =
          this.dataForm.id === '' ? datasetAdd : datasetUpdate
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'custom',
          remark: this.dataForm.remark,
          sourceId: this.dataForm.sourceId,
          cache: this.dataForm.cache,
          moduleCode: this.appCode,
          editable: this.appCode ? 1 : 0,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.CustomDataSetConfig',
            sourceId: this.dataForm.sourceId,
            sqlProcess: this.dataForm.sqlProcess,
            paramsList: this.dataForm.paramsList,
            fieldList: fieldList,
            fieldDesc: this.dataForm.fieldDesc,
            syntaxType: this.dataForm.syntaxType
          }
        }
        datasetSave(datasetParams)
          .then((r) => {
            this.$emit('saveSuccess',r)
            this.$message.success('保存成功')
            this.goBack()
            this.$parent.init(false)
            this.$parent.setType = null
            this.saveLoading = false
            this.saveText = ''
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
     * 解析并运行数据集
     */
    buildParamsAndRun () {
      // this.isTest = true
      // this.dataForm.paramsList = cloneDeep(params)
      this.dataForm.paramsList = cloneDeep(
        this.$refs.paramsConfig?.innerData ?? []
      )
      // this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      // if (this.dataForm.paramsList.length===0) {
      //   this.paramsVisible = true
      // } else {
      this.datasetTest()
      // }
    },
    /**
     * 数据集测试
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

      const executeParams = {
        dataSourceId: this.dataForm.sourceId,
        script: this.dataForm.sqlProcess,
        params: this.dataForm.paramsList,
        dataSetType: 'custom',
        syntaxType: this.dataForm.syntaxType,
        size: this.size,
        current: this.current
      }
      datasetExecuteTest(executeParams)
        .then((res) => {
          this.dataPreviewList = res.data.list
          this.structurePreviewList = res.structure
          this.$nextTick(() => {
            if (res.structure.length > 0) {
              const { headerColumnObj } = this.$refs.dataPreview ?? {}
              const fieldList = Object.values(headerColumnObj ?? {}).map(
                ({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
                  fieldName,
                  fieldDesc,
                  fieldType
                })
              )
              res.structure.forEach((item) => {
                const headerField = fieldList.find(
                  (headerItem) => headerItem.fieldName === item.fieldName
                )
                if (headerField) {
                  item.fieldDesc = headerField.fieldDesc || headerField.fieldName
                  item.fieldType = headerField.fieldType
                }
              })
            }
            this.headerFields = cloneDeep(res.structure)
            // 输出字段描述合并
            this.structurePreviewList.forEach((field) => {
              const fieldInfo = this.dataForm.fieldList.find(
                (item) => item.fieldName === field.fieldName
              )
              if (fieldInfo) {
                const { fieldDesc, fieldType, orderNum, sourceTable, ...rest } =
                fieldInfo
                field.fieldDesc = fieldDesc
                field.fieldType = fieldType
                field.orderNum = orderNum
                field.sourceTable = sourceTable
                Object.keys(rest).forEach((key) => {
                  if (!field.hasOwnProperty(key)) {
                    this.$set(field, key, rest[key])
                  }
                })
              }
            })
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
            this.structurePreviewListCopy = cloneDeep(
              this.structurePreviewList
            ).sort((a, b) => {
              return a.orderNum - b.orderNum
            })
            let paramsNameCheck = false
            const { headerColumnObj } = this.$refs.dataPreview ?? {}
            const paramsList = Object.values(headerColumnObj ?? {}).map(
              ({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
                fieldName,
                fieldDesc,
                fieldType
              })
            )
            if (paramsList.length) {
              paramsList.forEach((param) => {
                if (param.name === '') {
                  this.$message.warning('参数名称不能为空！')
                  paramsNameCheck = true
                }
                const checkList = paramsList.filter(
                  (item) => item.fieldName === param.name
                )
                if (checkList.length) {
                  paramsNameCheck = true
                  // param.name = ''
                }
              })
            }

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

.dataroom-dataset-el-scrollbar {
  height: 100%;
  overflow-y: auto;
  overflow-x: none;
}

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

::v-deep .CodeMirror {
  // height: 180px !important;
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

.dataroom-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

::v-deep .dataroom-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
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

.bs-el-select {
  width: 100% !important;
}

::v-deep .el-input__inner {
  width: 100% !important;
}

::v-deep .el-table__row {
  height: 58px;

  .cell {
    width: 100%;
    margin: 0 auto;
    position: absolute;
    top: 8px;
  }
}

.table-header-popover {
  white-space: nowrap;
  // 表格-表格列字段对应的类型展示
  .field-type {
  }
}
</style>
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
