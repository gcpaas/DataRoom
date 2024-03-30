<template>
  <div
    v-loading="saveLoading"
    class="inner-container"
    :element-loading-text="saveText"
  >
    <el-scrollbar class="dataroom-dataset-el-scrollbar">
      <div class="header">
        <page-header
          :title="
            !isEdit
              ? '脚本数据集详情'
              : dataForm.id
                ? '编辑脚本数据集'
                : '新增脚本数据集'
          "
          :save-btn="isEdit"
          url="https://www.yuque.com/chuinixiongkou/bigscreen/groovy_dataset"
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
            label-width="120px"
            style="padding: 16px 16px 0"
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
                    effect="light"
                    content="开启缓存:会在首次调用该数据集时，将结果缓存，在接下来的十分钟内，若再次被调用则直接返回缓存中的数据，注意：在当前数据集编辑页面缓存不生效"
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
            <el-row>
              <el-col :span="24">
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
                  style="margin-top: 2px; border: 1px solid #ebeef5"
                />
              </div>
            </div>
            <div style="text-align: center; padding: 16px 0">
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
          :data="dataPreviewList"
          :header-fields="headerFields"
          :header-column="
            dataPreviewList.length > 0
              ? Object.keys(dataPreviewList[0])
              : []
          "
        />
      </div>
      <el-dialog
        title="脚本案例"
        :visible.sync="exampleVisible"
        width="1000px"
        height="1000px"
        append-to-body
        :close-on-click-modal="false"
        class="dataroom-el-dialog"
      >
        <div class="code-inner">
          <codemirror
            ref="example"
            v-model="currentExample"
            :options="cOptions"
            style="margin-top: 2px; border: 1px solid #ebeef5"
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
import PageHeader from '@gcpaas/data-room-ui/packages/dataSet/components/PageHeader.vue'
import DataPreview from '@gcpaas/data-room-ui/packages/dataSet/components/DataPreview.vue'
import ParamsConfig from '@gcpaas/data-room-ui/packages/dataSet/components/ParamsConfig.vue'
import LabelSelect from '@gcpaas/data-room-ui/packages/dataSet/components/LabelSelect.vue'
import TypeSelect from '@gcpaas/data-room-ui/packages/dataSet/components/TypeSelect'
import {
  nameCheckRepeat,
  getDataset,
  datasetExecuteTest,
  datasetAdd,
  datasetUpdate
} from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService'
import { codemirror } from 'vue-codemirror'
import 'codemirror/mode/groovy/groovy'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/eclipse.css'
import cloneDeep from 'lodash/cloneDeep'
import { datasetMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/dataset.js'
export default {
  name: 'ScriptEditForm',
  components: {
    PageHeader,
    DataPreview,
    TypeSelect,
    ParamsConfig,
    codemirror,
    LabelSelect
  },
  mixins: [datasetMixin],
  data () {
    const validateName = (rule, value, callback) => {
      nameCheckRepeat({
        id: this.datasetId,
        name: value
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
        typeId: [{ required: true, message: '请选择分组', trigger: 'blur' }]
      },
      cOptions: {
        mode: 'text/x-groovy',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'eclipse',
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
      this.structurePreviewList.forEach((item) => {
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
     * 1. 获取数据集详情
     * 2. 执行脚本数据集
     */
    async init () {
      if (!this.datasetId) {
        return
      }
      getDataset(this.datasetId).then((res) => {
        this.dataForm.id = res.id
        this.dataForm.name = res.name
        this.dataForm.typeId = res.typeId
        this.dataForm.remark = res.remark
        this.dataForm.cache = res.cache
        this.dataForm.datasetType = res.datasetType
        this.dataForm.editable = res.editable
        this.dataForm.sourceId = res.sourceId
        // config 配置
        this.dataForm.script = res.config.script
        this.dataForm.paramsList = res.config.paramsList
          ? res.config.paramsList
          : []
        this.dataForm.fieldDesc = res.config.fieldDesc
        this.dataForm.fieldList = res.config.fieldList
        if (res.config.fieldList.length > 0) {
          this.headerFields = res.config.fieldList
        }
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
      // if (!this.structurePreviewList.length) {
      //   this.$message.warning('该执行脚本未生成输出字段，请重新检查')
      //   return
      // }
      // if (!noCheckToSave) {
      //   const temp = this.structurePreviewList.some(item => {
      //     return item.fieldDesc === '' || !item.hasOwnProperty('fieldDesc')
      //   }) // true-存在为空
      //   if (temp) {
      //     this.fieldDescVisible = true
      //     return
      //   }
      // }
      this.$refs[formName].validate((valid) => {
        if (!valid) {
          return false
        }
        if (this.dataForm.paramsList.length > 0) {
          const names = this.dataForm.paramsList.map((value) => value.name)
          const namesSet = new Set(names)
          if (namesSet.size !== names.length) {
            this.$message.error('参数名称不能重复，请重新输入')
            return
          }
        }
        this.dataForm.fieldList = this.structurePreviewList.length
          ? this.structurePreviewList
          : []
        // 组装输出字段描述
        const columnMap = {}
        if (this.structurePreviewList.length > 0) {
          this.structurePreviewList.forEach((r) => {
            columnMap[r.fieldName] = r.fieldDesc
          })
          this.dataForm.fieldDesc = columnMap
        }
        this.saveLoading = true
        this.saveText = '正在保存...'
        const datasetSave =
          this.dataForm.id === '' ? datasetAdd : datasetUpdate

        // 从组件中获取字段信息
        const { headerColumnObj } = this.$refs.dataPreview ?? {}
        const fieldList = Object.values(headerColumnObj ?? {}).map(
          ({ fieldName, fieldDesc = '', fieldType = 'text' }) => ({
            fieldName,
            fieldDesc,
            fieldType
          })
        )
        // 从组件中获取输入参数信息
        const paramsList = this.$refs.paramsConfig?.innerData ?? []

        const datasetParams = {
          id: this.dataForm.id,
          name: this.dataForm.name,
          typeId: this.dataForm.typeId,
          datasetType: 'script',
          remark: this.dataForm.remark,
          cache: this.dataForm.cache,
          sourceId: this.dataForm.sourceId,
          labelIds: this.dataForm.labelIds,
          config: {
            className: 'com.gccloud.dataset.entity.config.GroovyDataSetConfig',
            script: this.dataForm.script,
            paramsList: paramsList,
            fieldList: fieldList,
            fieldDesc: this.dataForm.fieldDesc
          }
        }
        datasetSave(datasetParams)
          .then(() => {
            this.$message.success('保存成功')
            this.$parent.init(false)
            this.$parent.setType = null
            this.saveLoading = false
            this.saveText = ''
            this.goBack()
          })
          .catch(() => {
            this.saveLoading = false
            this.saveText = ''
          })
      })
    },

    // 脚本执行
    scriptExecute (isInit = false) {
      // 组装数据集执行参数
      if (
        this.$refs.paramsConfig &&
        this.$refs.paramsConfig.innerData.length > 0
      ) {
        this.dataForm.paramsList = this.$refs.paramsConfig.innerData
      }

      const executeParams = {
        script: this.dataForm.script,
        params: this.dataForm.paramsList,
        dataSetType: 'script'
      }
      this.saveLoading = true
      datasetExecuteTest(executeParams)
        .then((res) => {
          if (!isInit) {
            this.$message.success('脚本执行通过')
          }
          this.dataPreviewList = res.data ? res.data : []
          this.structurePreviewList = []
          if (res.data.length) {
            this.structurePreviewList = Object.keys(res.data[0]).map((item) => {
              return {
                fieldName: item,
                fieldDesc: ''
              }
            })
            if (this.headerFields.length === 0) {
              this.headerFields = Object.keys(res.data[0]).map((item) => {
                return {
                  fieldName: item,
                  fieldDesc: '',
                  fieldType: 'text'
                }
              })
            }
            console.log(this.headerFields)
          }
          if (this.structurePreviewList.length && this.dataForm.fieldDesc) {
            this.buildFieldDesc()
          }
          this.structurePreviewListCopy = cloneDeep(this.structurePreviewList)
          this.saveLoading = false
          this.passTest = true
        })
        .catch((e) => {
          this.passTest = false
          this.saveLoading = false
        })
    },
    // 执行事件
    toExecute () {
      if (this.dataForm.script === '') {
        this.$message.error('脚本不能为空')
        return
      }
      // 无参数，直接执行脚本
      this.scriptExecute()
    },
    /**
     * 字段描述构建及同步
     */
    buildFieldDesc () {
      const fieldDesc = {}
      this.structurePreviewList.forEach((field) => {
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
     * 校验名称【参数名称不能与字段名重复】
     * @param value
     */
    checkParamsName (value) {
      const checkList = this.structurePreviewList.filter(
        (item) => item.fieldName === value.name
      )
      if (checkList.length) {
        this.$message.warning('参数名称不可以与字段名相同！')
        value.name = ''
      }
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
@import "../assets/css/index.scss";

.dataroom-dataset-el-scrollbar {
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
    height: 180px;
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
    height: 400px;
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
  border-left: 5px solid #606266;
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

::v-deep .dataroom-table-box.is-Edit .el-table {
  max-height: unset !important;

  .el-table__body-wrapper {
    max-height: unset !important;
  }
}

.dataroom-table-box {
  height: 100% !important;
  margin-bottom: 0 !important;
}

.bs-el-select {
  width: 100% !important;
}
::v-deep .el-input__inner {
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
  scrollbar-width: thin !important;
  scrollbar-color: #c1c1c1  #fafafa !important;
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
<style lang="scss">
@import "@gcpaas/data-room-ui/packages/assets/style/tooltip.scss";
</style>
