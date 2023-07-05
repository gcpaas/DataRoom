<template>
  <div
    class="bs-setting-wrap"
    @click.stop
  >
    <el-form
      ref="form"
      :model="config"
      :rules="rules"
      label-width="100px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <div class="data-setting-box">
        <div
          v-if="config.option.displayOption.dataSourceType.enable"
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              数据来源
            </div>
          </div>
          <div class="lc-field-body">
            <el-form-item
              label="数据集"
            >
              <data-set-select
                :dataset-name="datasetName"
                :ds-id="config.dataSource.businessKey"
                @getDsId="dsId => { getDataSetDetailsById(dsId, 'treeTable');}"
              />
            </el-form-item>
          </div>
        </div>
        <div
          v-if="config.type === 'customComponent'"
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              数据处理
            </div>
          </div>
          <div class="lc-field-body">
            <el-form-item
              label="数据处理脚本"
            >
              <el-input
                v-model="config.dataHandler"
                type="textarea"
                :rows="5"
                placeholder="请输入数据处理脚本"
              />
            </el-form-item>
          </div>
        </div>
        <div
          v-if="!['tree','multipleNumberChart','carousel'].includes(config.type) && config.option.displayOption.dataSourceType.enable "
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              数据配置
            </div>
          </div>
          <template v-if="!['customComponent', 'remoteComponent'].includes(config.type)">
            <!--维度多选-->
            <el-form-item
              v-if="config.option.displayOption.dimensionField.enable"
              :label="config.option.displayOption.dimensionField.label"
              :prop="config.option.displayOption.dimensionField.multiple? 'dataSource.dimensionFieldList' : 'dataSource.dimensionField'"
              class="data-form-item"
            >
              <el-drag-select
                v-if="config.option.displayOption.dimensionField.enable && config.option.displayOption.dimensionField.multiple"
                v-model="config.dataSource.dimensionFieldList"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
                :multiple="config.option.displayOption.dimensionField.multiple"
                @change="dimensionFieldListChange"
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-drag-select>
              <!--维度单选-->
              <el-select
                v-else
                v-model="config.dataSource.dimensionField"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <!--指标-->
            <el-form-item
              v-if="config.option.displayOption.metricField.enable"
              :label="config.option.displayOption.metricField.label"
              prop="dataSource.metricField"
              class="data-form-item"
            >
              <el-select
                v-model="config.dataSource.metricField"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </template>
          <template v-else>
            <template
              v-for="(setting, index) in config.setting.filter(set => set.tabName === 'data')"
            >
              <el-form-item
                :key="index"
                :label="setting.label"
                class="data-form-item"
              >
                <el-select
                  v-if="setting.type === 'select'"
                  class="bs-el-select select"
                  popper-class="bs-el-select"
                  :value="setting.value"
                  clearable
                  :multiple="setting.multiple"
                  :placeholder="`请选择${setting.label}`"
                  @change="changeCustomProps(...arguments, index)"
                >
                  <el-option
                    v-for="(field, fieldIndex) in dataSourceDataList"
                    :key="fieldIndex"
                    :label="field.comment"
                    :value="field.name"
                  >
                    <div class="source-key-option">
                      <div>
                        {{ field.comment !== "" ? field.comment : field.name }}
                      </div>
                      <div class="option-txt">
                        {{ field.name }}
                      </div>
                    </div>
                  </el-option>
                </el-select>
                <el-input
                  v-else
                  :value="setting.value"
                  :placeholder="`请输入${setting.label}`"
                  @change="changeCustomProps(...arguments, index)"
                />
              </el-form-item>
            </template>
          </template>
        </div>
        <div
          v-if="config.option.displayOption.headerField && config.option.displayOption.headerField.enable"
          name="轮播表配置"
        >
          <template slot="title">
            <div class="lc-field-head">
              <div class="lc-field-title">
                轮播表配置
              </div>
            </div>
          </template>
          <div class="lc-field-body">
            <el-table
              ref="headerTable"
              :border="true"
              :data="config.customize.columnConfig"
              class="params-config"
            >
              <el-table-column
                prop="code"
                label="参数名称"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.code"
                    placeholder="请输入名称"
                    readonly
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="name"
                label="列名称"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.name"
                    placeholder="请输入字段名称"
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="width"
                label="列宽"
                align="center"
              >
                <template slot-scope="scope">
                  <el-input
                    v-model="scope.row.width"
                    placeholder="请输入列宽"
                    clearable
                  />
                </template>
              </el-table-column>
              <el-table-column
                prop="align"
                label="对齐方式"
                align="center"
              >
                <template slot-scope="scope">
                  <el-select
                    v-model="scope.row.align"
                    class="bs-el-select"
                    popper-class="bs-el-select"
                    clearable
                    placeholder="请选择对齐方式"
                  >
                    <el-option
                      value="left"
                      label="左对齐"
                    />
                    <el-option
                      value="center"
                      label="居中"
                    />
                    <el-option
                      value="right"
                      label="右对齐"
                    />
                  </el-select>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div
          v-if="config.option.displayOption.mapField && config.option.displayOption.mapField.enable"
          name="地图数据配置"
        >
          <template slot="title">
            <div class="lc-field-head">
              <div class="lc-field-title">
                地图数据配置
              </div>
            </div>
          </template>
          <div class="lc-field-body">
            <el-form-item
              label="展示字段"
              class="data-form-item"
            >
              <el-select
                v-model="config.customize.value"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="地名字段"
              class="data-form-item"
            >
              <el-select
                v-model="config.customize.name"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="x坐标"
              class="data-form-item"
            >
              <el-select
                v-model="config.customize.xaxis"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item
              label="y坐标"
              class="data-form-item"
            >
              <el-select
                v-model="config.customize.yaxis"
                class="bs-el-select"
                popper-class="bs-el-select"
                clearable
              >
                <el-option
                  v-for="(field, index) in dataSourceDataList"
                  :key="index"
                  :label="field.comment"
                  :value="field.name"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.comment !== "" ? field.comment : field.name }}
                    </div>
                    <div class="option-txt">
                      {{ field.name }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <div
          v-if="config.option.displayOption.params.enable"
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              参数配置
            </div>
          </div>
          <div class="lc-field-body">
            <el-table
              ref="singleTable"
              :border="true"
              :data="params"
              class="params-config"
            >
              <el-table-column
                prop="name"
                label="参数名称"
                align="center"
              >
                <template slot-scope="scope">
                  <div>
                    <el-form-item>
                      <el-input
                        v-model="scope.row.name"
                        placeholder="请输入名称"
                        readonly
                      />
                      <el-tooltip
                        :content="
                          `${
                            scope.row.type ? '参数类型：' + scope.row.type : ''
                          }
                          ${
                            scope.row.remark ? '备注：' + scope.row.remark : ''
                          }`
                        "
                        placement="top"
                      >
                        <span
                          class="el-icon-question"
                          style="color:#9e9e9e"
                        />
                      </el-tooltip>
                    </el-form-item>
                  </div>
                </template>
              </el-table-column>
              <el-table-column
                prop="value"
                label="参数值"
                align="center"
              >
                <template slot-scope="scope">
                  <el-form-item
                    :prop="scope.row.require === 1 ? 'params' : null"
                  >
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
                      clearable
                      placeholder="请输入参数值"
                    />
                  </el-form-item>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div
          v-if="config.option.displayOption.serverPagination.enable"
          class="data-setting-data-box"
          name="分页配置"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              分页配置
            </div>
          </div>
          <div class="form">
            <el-form-item
              v-if="config.option.displayOption.serverPagination.enable"
              label="服务端分页"
              prop="dataSource.serverPagination"
            >
              <el-radio-group
                v-model="config.dataSource.serverPagination"
                class="status-radio"
                size="mini"
                @change="serverPaginationChange"
              >
                <el-radio-button :label="true">
                  开启
                </el-radio-button>
                <el-radio-button :label="false">
                  关闭
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item
              v-if="
                config.dataSource.serverPagination &&
                  config.option.displayOption.pageSize.enable
              "
              label="分页长度"
              prop="dataSource.pageSize"
            >
              <el-select
                v-model="config.dataSource.pageSize"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                allow-create
                default-first-option
              >
                <el-option
                  v-for="size in pageSizeList"
                  :key="size"
                  :label="size"
                  :value="size"
                />
              </el-select>
            </el-form-item>
          </div>
        </div>
        <ComponentBinding
          v-if="['button'].includes(config.type)"
          :config="config"
          :source-field-list="sourceFieldList"
        />
        <ComponentRelation
          v-if="!['carousel','gauge','liquid'].includes(config.type)"
          :config="config"
          :source-field-list="sourceFieldList"
        />
      </div>
    </el-form>
  </div>
</template>
<script>
import ElDragSelect from './ElDragSelect.vue'
import { isEmpty, cloneDeep } from 'lodash'
import ComponentRelation from 'packages/BigScreenDesign/RightSetting/ComponentRelation/index.vue'
import ComponentBinding from 'packages/BigScreenDesign/RightSetting/ComponentBinding/index.vue'
import dataSetSelect from 'packages/DataSetSetting/index.vue'
import { mapState } from 'vuex'
import { getDataSetDetails } from 'packages/js/api/bigScreenApi'
export default {
  name: 'DataSetting',
  components: {
    ComponentRelation,
    ComponentBinding,
    dataSetSelect,
    ElDragSelect
  },
  data () {
    return {
      fieldsList: [],
      params: [], // 参数配置
      datasetName: '',
      headerList: [],
      pageSizeList: [10, 20, 50, 100],
      rules: {
        // 'dataSource.businessKey': [
        //   { required: true, message: '请选择数据集', trigger: 'change' }
        // ],
        // 'dataSource.dimensionField': [
        //   { required: true, message: '请选择维度', trigger: 'change' }
        // ],
        // 'dataSource.dimensionFieldList': [
        //   { required: true, message: '请选择维度', trigger: 'change' }
        // ],
        // 'dataSource.metricField': [
        //   { required: true, message: '请选择指标', trigger: 'change' }
        // ],
        params: [
          {
            validator: (rule, value, callback) => {
              if (!value) {
                this.params.map(sort => {
                  if (!sort.value) {
                    callback(new Error('请输入参数值'))
                  } else {
                    callback()
                  }
                })
              } else {
                callback()
              }
            }
          }
        ]
      }
    }
  },
  computed: {
    ...mapState({
      pageInfo: state => state.bigScreen.pageInfo,
      config: state => state.bigScreen.activeItemConfig
      // 缓存数据集
      // cacheDataSets: state => state.bigScreen.pageInfo.pageConfig.cacheDataSets
    }),
    dataSourceDataList () {
      return this.fieldsList?.map(item => ({
        ...item,
        comment: item?.fieldDesc || item?.fieldName,
        name: item?.fieldName
      }))
    },
    appCode: {
      get () {
        return this.$store.state.bigScreen.pageInfo.appCode
      }
    },
    seriesFieldProp () {
      if (this.config.option.displayOption.seriesField.required) {
        return 'dataSource.seriesField'
      } else {
        return ''
      }
    },
    pageCode () {
      return this.$route.query.code
    },
    // 映射字段
    sourceFieldList () {
      const list = this?.config?.customize?.bindComponents || this.fieldsList
      return (
        list?.map(field => {
          return {
            label: field.comment,
            value: field.name
          }
        }) || []
      )
    }
  },
  watch: {
    // 切换数据集时将其他配置清空
    'config.dataSource.businessKey' (val) {
      this.clearCustomVerify()
      this.clearVerify()
    },
    // 切换数据集类型时将其他配置清空
    'config.dataSource.dataSetType' () {
      this.config.dataSource.businessKey = ''
      this.clearCustomVerify()
      this.clearVerify()
    },
    // 参数改变时
    params: {
      handler (val) {
        if (!isEmpty(val)) {
          const params = cloneDeep(val)
          const paramsMap = params.reduce((obj, param) => {
            obj[param.name] = param.value
            return obj
          }, {})
          this.config.dataSource.params = paramsMap
        }
      },
      deep: true
    }
  },
  mounted () {
    if (this.config.dataSource && this.config.dataSource.businessKey) {
      this.getDataSetDetailsById(this.config.dataSource.businessKey, 'initial')
    }
  },
  methods: {
    // 切换前后端分页
    serverPaginationChange (val) {
      this.config.customize.webPagination = !val
    },
    // 清空自定义组件配置，与手动配置的组件区分开
    clearCustomVerify () {
      this.config.setting = this.config.setting?.map(set => {
        this.datasetName = ''
        if (set.tabName === 'data') {
          set.value = ''
        }
        return set
      })
    },
    // 清空手动配置的组件配置
    clearVerify () {
      this.config.dataSource.metricField = ''
      this.config.dataSource.dimensionField = ''
      this.config.dataSource.dimensionFieldList = []
      this.config.dataSource.seriesField = ''
      this.config.dataSource.params = {}
    },
    // 根据数据集来获取数据集详情
    getDataSetDetailsById (id, type) {
      if (id) {
        this.config.dataSource.businessKey = id
        getDataSetDetails(id).then(res => {
          this.fieldsList = res.fields
          // 初始化时以组件本来的参数设置为主
          if (type === 'initial') {
            for (const key in this.config.dataSource.params) {
              const param = res?.params?.find(field => field.name === key)
              this.params.push({
                name: key,
                value: this.config.dataSource.params[key],
                type: param?.type,
                remark: param?.remark
              })
            }
          } else {
            this.params = res.params
          }

          this.datasetName = res.name
          // 选择数据集的时候，如果数据集类型是dataModel,则不显示参数配置
          this.config.option.displayOption.params.enable = res.type !== 'dataModel'
          // 根据数据集初始化组件的入参：inparams
          if (res.type !== 'dataModel') {
            this.config.inParams =
            this.params?.map(param => {
              return {
                name: param.remark, // 参数名
                code: param.name // 参数值
              }
            }) || []
          } else {
            this.config.inParams =
            this.fieldsList?.map(field => {
              return {
                name: field.fieldDesc, // 参数名
                code: field.fieldName // 参数值
              }
            }) || []
          }

          // 根据数据集的参数初始化表单项
          this.config.paramsList = this.params
          if (type === 'treeTable') {
            const enumeration = {
              dataSetType: '1', // 数据集类型
              dataSetKey: '', // 数据集
              itemKeyName: '', // 选项显示字段
              itemValueName: '', // 选项value字段
              params: []
            }
            this.config.fields =
            this.params?.map(param => {
              return {
                name: param.name,
                label: param.remark || param.name,
                component: 'input',
                display: res.type !== 'dataModel',
                enumeration: {
                  ...enumeration
                },
                queryRule: 'like'
              }
            }) || []
          }
        })
      }
    },
    // 改变维度
    dimensionFieldListChange (list) {
      const colFieldList = []
      if (list.length > 0) {
        list.forEach(item => {
          colFieldList.push(
            this.dataSourceDataList.find(field => field.name === item)
          )
        })
      }
      this.headerList = []
      colFieldList.forEach(item => {
        this.headerList.push({ name: item.comment, code: item.name, width: '150', align: 'left' })
      })
      this.config.customize.columnConfig = cloneDeep(this.headerList)
      this.$store.commit('bigScreen/changeActiveItemConfig', this.config)
    },
    changeCustomProps (value, index) {
      this.$set(this.config.setting[index], 'value', value)
    }
    // 改变缓存数据集key
    // changeCacheBusinessKey (id) {
    //   // 根据id在缓存中获取fields
    //   this.fieldsList = this.cacheDataSets?.find(cache => cache.dataSetId === id)?.fields
    //   this.params = this.cacheDataSets?.find(cache => cache.dataSetId === id)?.params
    // }
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/style/settingWrap.scss";
  .add-filter-box {
    position: relative;
    .add-filter {
      margin-left: 100px;
    }
    .add-filter-btn {
      position: absolute;
      top: 0;
    }
  }
  .form {
    padding: 12px;
  }
  ::v-deep .el-tag__close.el-icon-close::before {
    color: #fff;
  }
  ::v-deep .el-tag__close.el-icon-close {
    top: -1px;
    &:hover {
      background-color:var(--bs-el-color-primary);
    }
  }
  .opt-wrap{
    margin-top: 10px;
  }

  .link-set-item {
    position: relative;
    border: 1px solid #f5f7fa;
    padding: 30px 16px 10px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    margin: 10px;

    .del-icon {
      cursor: pointer;
      position: absolute;
      right: 10px;
      top: 5px;
      font-size: 20px;
      color: #f00;
    }

    .opt-wrap {
      display: flex;
      justify-content: center;
    }
  }
  // 修改设置面板样式
  .data-setting-box{
    .data-setting-data-box{
      .lc-field-head{
        height: 30px;
        .lc-field-title{
          position: relative;
          padding-left: 12px;
          line-height: 30px;
          height: 30px;
          &:after{
            position: absolute;
            left: 0;
            top: 50%;
            transform: translateY(-50%);
            content: '';
            width: 4px;
            height: 14px;
            background-color: var(--bs-el-color-primary);
          }
        }
      }
    }
  }
</style>
