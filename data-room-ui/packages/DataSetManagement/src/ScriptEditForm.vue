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
                {{ !isEdit ? '脚本数据集详情' : dataForm.id ? '编辑脚本数据集' : '新增脚本数据集' }}
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
            <el-row>
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
              <el-button-group>
                <el-button
                  plain
                  type="primary"
                  class="bs-el-button-default"
                  @click="example('es')"
                >
                  ES案例
                </el-button>
              </el-button-group>
              <div class="code-out">
                <codemirror
                  ref="targetInSql"
                  v-model="dataForm.script"
                  :options="cOptions"
                  style="margin-top: 2px"
                />
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0;">
              <el-button
                type="primary"
                @click="toExecute"
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
                脚本参数
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
            class="bs-el-table bs-scrollbar"
          >
            <el-table-column
              v-for="(value, key) in dataPreviewList[0] ? dataPreviewList[0] : noDataTableDisplayFields"
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
      <!-- 参数配置 -->
      <el-dialog
        title="脚本参数配置"
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
            >
              <template slot-scope="scope">
                <el-input
                  v-model="scope.row.name"
                  class="bs-el-input"
                  :disabled="!isSet"
                  placeholder="请输入名称"
                  clearable
                  @change="checkParamsName(scope.row)"
                />
              </template>
            </el-table-column>
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
                  :disabled="!isSet"
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
                  :disabled="!isSet"
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
                  :disabled="!isSet"
                  clearable
                  class="bs-el-input"
                  placeholder="请输入备注"
                  rows="2"
                  maxlength="200"
                />
              </template>
            </el-table-column>
            <el-table-column
              v-if="isSet"
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
      <el-dialog
        title="脚本案例"
        :visible.sync="exampleVisible"
        width="1000px"
        height="1000px"
        append-to-body
        :close-on-click-modal="false"
        class="bs-dialog-wrap bs-el-dialog"
      >
        <div class="code-inner">
          <codemirror
            ref="example"
            v-model="currentExample"
            :options="cOptions"
            style="margin-top: 2px"
          />
        </div>

        <span
          slot="footer"
          class="dialog-footer"
        >
          <el-button
            class="bs-el-button-default"
            @click="exampleVisible = false"
          >关闭</el-button>
          <el-button
            type="primary"
            @click="useExample"
          >使用该案例</el-button>
        </span>
      </el-dialog>
    </el-scrollbar>
  </div>
</template>

<script>
import LabelSelect from 'data-room-ui/DataSetLabelManagement/src/LabelSelect.vue'
import {
  nameCheckRepeat,
  getCategoryTree,
  getDataset,
  datasetExecuteTest,
  datasetAdd, datasetUpdate
} from 'data-room-ui/js/utils/datasetConfigService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/groovy/groovy'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/nord.css'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixins } from 'data-room-ui/js/mixins/datasetMixin'
export default {
  name: 'ScriptEditForm',
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
        datasetType: 'script',
        remark: '',
        cache: 0,
        labelIds: [],
        // 以下为config配置
        script: '',
        paramsList: [],
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
      cOptions: {
        mode: 'text/x-groovy',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'nord',
        extraKey: { Ctrl: 'autocomplete' },
        hintOptions: {
          completeSingle: true
        }
      },
      paramsVisible: false,
      paramsListCopy: [],
      isSet: false, // 参数是否配置状态
      passTest: false,
      fieldDesc: null, // 字段描述
      exampleVisible: false,
      currentExample: '',
      exampleList: {
        es: `import com.gccloud.dataset.utils.ElasticsearchDsService;

def dsl = '''
{
    "query":{
       "match_all":{}
    }
}
'''
def host = "127.0.0.1"
int port = 9200
def username = "elastic"
def password = "pwd"
def path = "/_search"

/**
 * query方法的参数说明：
 * host es的ip
 * port es的端口
 * username es的用户名，如果没有可以不填
 * password es的密码，如果没有可以不填
 * path es的查询路径
 * dsl 查询的dsl，示例见上面
 * return 查询结果，List<Map>格式
 */
return ElasticsearchDsService.query(host, port, username, password, path, dsl);
`
      }
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
    }
  },
  watch: {
    'dataForm.script' () {
      this.passTest = false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    /**
     * 初始化
     * 1. 获取数据集分类
     * 2. 获取数据集详情
     * 3. 执行脚本数据集
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
      if (!this.datasetId) {
        return
      }
      getDataset(this.datasetId).then(res => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.cache = res.cache
        this.dataForm.datasetType = res.datasetType
        this.dataForm.moduleCode = res.moduleCode
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        // config 配置
        this.dataForm.script = res.config.script
        this.dataForm.paramsList = res.config.paramsList ? res.config.paramsList : []
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.fieldList = res.config.fieldList

        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
        this.scriptExecute(true)
      })
    },
    /**
     * 保存数据集
     * @param formName
     * @param noCheckToSave 是否不检查直接保存
     */
    save (formName, noCheckToSave = false) {
      if (this.passTest === false) {
        this.$message.error('请确保脚本不为空且执行通过')
        return
      }
      if (!this.structurePreviewList.length) {
        this.$message.warning('该执行脚本未生成输出字段，请重新检查')
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
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map(value => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        this.dataForm.fieldList = this.structurePreviewList.length ? this.structurePreviewList : []
        // 组装输出字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach(r => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        this.saveLoading = true
        this.saveText = '正在保存...'
        const datasetSave = this.dataForm.id === '' ? datasetAdd : datasetUpdate
        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'script',
          remark: this.dataForm.remark,
          cache: this.dataForm.cache,
          sourceId: this.dataForm.sourceId,
          moduleCode: this.appCode,
          editable: this.appCode ? 1 : 0,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.GroovyDataSetConfig',
            script: this.dataForm.script,
            paramsList: this.dataForm.paramsList,
            fieldList: this.dataForm.fieldList,
            fieldDesc: this.dataForm.fieldDesc
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

    // 脚本执行
    scriptExecute (isInit = false) {
      // 组装数据集执行参数
      const executeParams = {
        script: this.dataForm.script,
        params: this.dataForm.paramsList,
        dataSetType: 'script'
      }
      this.saveLoading = true
      datasetExecuteTest(executeParams).then(res => {
        if (!isInit) {
          this.$message.success('脚本执行通过')
        }
        this.dataPreviewList = res.data ? res.data : []
        this.structurePreviewList = []
        if (res.data.length) {
          this.structurePreviewList = Object.keys(res.data[0]).map(item => {
            return {
              fieldName: item,
              fieldDesc: ''
            }
          })
        }
        if (this.structurePreviewList.length && this.dataForm.fieldDesc) {
          this.buildFieldDesc()
        }
        this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
        this.saveLoading = false
        this.passTest = true
      }).catch((e) => {
        this.passTest = false
        this.saveLoading = false
      })
    },
    // 执行事件
    toExecute () {
      if (this.dataForm.paramsList.length) {
        this.isSet = false
        this.paramsVisible = true
      } else {
        // 无参数，直接执行脚本
        this.scriptExecute()
      }
    },
    /**
     * 字段描述构建及同步
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

    /**
     * 打开参数配置弹窗
     */
    openParamsConfig () {
      this.isSet = true
      this.paramsVisible = true
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
      if (!this.isSet) {
        this.scriptExecute()
        this.paramsListCopy = cloneDeep(this.dataForm.paramsList)
      } else {
        this.dataForm.paramsList = cloneDeep(this.paramsListCopy)
      }
      this.paramsVisible = false
    },
    /**
     * 校验名称【参数名称不能与字段名重复】
     * @param value
     */
    checkParamsName (value) {
      const checkList = this.structurePreviewList.filter(item => item.fieldName === value.name)
      if (checkList.length) {
        this.$message.warning('参数名称不可以与字段名相同！')
        value.name = ''
      }
    },
    /**
     * 删除参数配置
     * @param index
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
    selectorFilter (value) {
      this.$refs.categorySelectTree.filter(value)
    },
    treeFilter (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    /**
     * 获取脚本案例
     */
    example (type) {
      this.exampleVisible = true
      this.currentExample = this.exampleList[type]
    },
    useExample () {
      this.dataForm.script = this.currentExample
      this.exampleVisible = false
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

// .codeStyle {
//   border: 1px solid #EBEEF5;
// }
.code-out {
  ::v-deep .CodeMirror {
    height: 180px ;
    font-family: Helvetica, Tahoma;
    // .CodeMirror-scroll {
    //   background: #fff;
    //   .CodeMirror-gutters {
    //     background: #f6f7fb;
    //   }
    // }
  }
}

.code-inner {
  ::v-deep .CodeMirror {
    height: 400px ;
    font-family: Helvetica, Tahoma;
  }
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

<style>
.CodeMirror-vscrollbar {
  right: 0;
  top: 0;
  overflow-x: hidden;
  overflow-y: scroll;
  margin-right: 4px;
}

/* Webkit浏览器滚动条样式 */
.CodeMirror-vscrollbar::-webkit-scrollbar {
  width: 6px;
  /* 滚动条宽度 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb {
  background-color: #444851;
  /* 滚动条滑块颜色 */
  border-radius: 4px;
  /* 滚动条滑块圆角 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #444851;
  /* 滚动条滑块悬停时颜色 */
}

/* Firefox和新版Chrome浏览器滚动条样式 */
.CodeMirror-vscrollbar {
  scrollbar-width: thin;
  /* 滚动条宽度 */
  scrollbar-color: #444851 #444851;
  /* 滚动条颜色 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb {
  background-color: #444851;
  /* 滚动条滑块颜色 */
}

.CodeMirror-vscrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #444851;
  /* 滚动条滑块悬停时颜色 */
}
</style>
