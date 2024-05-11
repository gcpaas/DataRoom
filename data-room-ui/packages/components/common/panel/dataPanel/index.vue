<template>
  <div
    class="dataroom-data-panel-wrap"
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
              <DataSetSelector
                :dataset-name="datasetName"
                :ds-id="config.dataSource.businessKey"
                @getDsId="getDsId"
              >
                <template #dataSetSelect="{ value }">
                  <slot
                    name="dataSetSelect"
                    :value="value"
                  />
                </template>
              </DataSetSelector>
            </el-form-item>
            <el-form-item
              label="初始化请求数据"
            >
              <el-switch
                v-model="config.dataSource.initRequestData"
              />
            </el-form-item>
          </div>
        </div>
        <div
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              数据处理
            </div>
          </div>
          <div class="lc-field-body">
            <el-form-item
              label=""
              label-width="0"
            >
              <el-input
                v-model="dataHandlerScript"
                type="textarea"
                :rows="5"
                placeholder="示例:return paramas.data.forEach(item => { // 数据处理 })"
                @blur="updateDataHandlerScript"
              />
            </el-form-item>
          </div>
        </div>
        <div class="data-setting-data-box">
          <div class="lc-field-head">
            <div class="lc-field-title">
              字段映射
            </div>
          </div>
          <!--  基础组件数据配置  -->
          <div class="lc-field-body">
            <el-form-item
              v-for="(value,key) in fieldNameMapping"
              :key="key"
              :label="value"
              class="data-form-item"
            >
              <el-select
                v-model="config.dataSource[key]"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                clearable
                @change="changeOption(key)"
              >
                <el-option
                  v-for="(field, index) in fieldList"
                  :key="index"
                  :label="field.fieldDesc"
                  :value="field.fieldName"
                >
                  <span style="float: left">  {{ field.fieldDesc !== "" ? field.fieldDesc : field.fieldName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ field.fieldName }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
        <!--        选取数据集后判断数据集是否需要参数-->
        <!--        选择数据集后展示参数映射：参数由数据集接口获取-->
        <div
          v-if="isNeedParam"
          class="data-setting-data-box"
        >
          <div class="lc-field-head">
            <div class="lc-field-title">
              参数映射
            </div>
          </div>
          <!--          数据集参数---全局变量列表 -->
          <div class="lc-field-body">
            <el-form-item
              v-for="paramMap in config.dataSource.parameterMapping"
              :key="paramMap.name"
              :label="remarkForName[paramMap.name] === ''? paramMap.name : remarkForName[paramMap.name]"
              class="data-form-item"
            >
              <el-select
                v-model="paramMap.globalVariableId"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                clearable
                @change="changeParameterMapping"
              >
                <el-option
                  v-for="variable in canvasInst.pageInfo.globalVariable"
                  :key="variable.name"
                  :label="variable.name"
                  :value="variable.id"
                >
                  <span style="float: left">{{ variable.name }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{ variable.desc !== "" ? variable.desc : variable.name }}</span>
                </el-option>
              </el-select>
            </el-form-item>
          </div>
        </div>
      </div>
    </el-form>
  </div>
</template>
<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import DataSetSelector from '@gcpaas/data-room-ui/packages/components/common/panel/DataSetSelector'
import { getDatasetInfo } from '@gcpaas/data-room-ui/packages/js/api/pageApi'
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'DataSetting',
  directives: {
    block: {
      bind (el, binding) {
        el.style.width = binding.value || '100%'
      }
    }
  },
  mixins: [commonMixins],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    fieldNameMapping: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    DataSetSelector
  },
  data () {
    return {
      dataHandlerScript: '',
      fieldList: [], // 字段列表
      params: [], // 参数配置
      isNeedParam: false, // 数据集是否需要配置参数
      remarkForName: {}, // 数据集参数name、remark映射关系
      datasetName: '',
      headerList: [],
      pageSizeList: [10, 20, 50, 100],
      rules: {
      }
    }
  },
  computed: {
    globalVariableList () {
      return this.canvasInst.pageInfo.globalVariable
    },
    pageCode () {
      return this.$route.query.code
    },
    filters () {
      return this.canvasInst.pageInfo.filters
    },
    dataHandleFilters () {
      return this.canvasInst.dataHandleFilters
    },
    script: {
      get () {
        if (this.dataHandleFilters && this.filters.hasOwnProperty(this.config.dataSource.dataHandleFilterId)) {
          return this.filters[this.config.dataSource.dataHandleFilterId].script
        } else {
          return ''
        }
      },
      set (val) {

      }

    }
  },
  watch: {
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      if (this.config.dataSource.businessKey) {
        // 根据id获取数据集详情
        getDatasetInfo(this.config.dataSource.businessKey).then(res => {
          this.fieldList = res.fields
          this.datasetName = res.name
          // 判断数据集是否需要配置参数
          if (res.params) {
            // 判断是否重新获取参数列表
            this.isNeedParam = true
            // 获取参数name--remark映射关系
            res.params.map(param => {
              this.remarkForName[param.name] = param.remark
            })
          }
        }).catch(err => {
          console.log(err)
        })
      }
      this.dataHandlerScript = this.script
    },
    // 获取数据集id
    getDsId (dsId, updateMapping = true) {
      // 根据id获取数据集详情
      getDatasetInfo(dsId).then(res => {
        this.fieldList = res.fields
        this.datasetName = res.name
        // 调接口获取数
        const config = cloneDeep(this.config)
        config.dataSource.businessKey = dsId
        // 判断数据集是否需要配置参数
        if (res.params) {
          // 判断是否重新获取参数列表
          this.isNeedParam = true
          // 获取参数name--remark映射关系
          res.params.map(param => {
            this.remarkForName[param.name] = param.remark
          })
          // 判断是否重新获取参数映射列表
          if (updateMapping) {
            config.dataSource.parameterMapping = res.params.map(param => {
              return {
                name: param.name,
                globalVariableId: ''
              }
            })
          }
        } else {
          this.isNeedParam = false
        }
        this.canvasInst.updateChartConfig(config)
        this.canvasInst.updateDataHandler(config)
      }).catch(err => {
        console.log(err)
      })
    },
    // 改变配置
    changeOption (fieldName) {
      // 图表是需要将选择的维度和指标同步到option的字段中
      // 如果config包含chartType字段则表明当前是图表
      if (this.config.hasOwnProperty('chartType')) {
        const config = cloneDeep(this.config)
        config.option[this.config.option[fieldName]] = config.dataSource[fieldName]
        this.canvasInst.updateChartConfig(config)
        this.canvasInst.updateStyleHandler(config)
      } else {
        this.changeStyle()
      }
    },
    // 修改参数映射关系
    changeParameterMapping () {
      // const config = cloneDeep(this.config)
      // this.canvasInst.updateChartConfig(config)
      //
    },
    // 改变数据脚本内容：需要同步到页面配置中
    updateDataHandlerScript () {
      // 配置数据集后数据脚本才生效
      if (this.config.dataSource.businessKey) {
        const id = this.config.code + 'dataHandlerScript'
        // 保存dataHandleFilterId
        this.canvasInst.updateChartConfig({ ...this.config, dataSource: { ...this.config.dataSource, dataHandleFilterId: id } })
        // 更新全局数据脚本
        this.canvasInst.updateDataScript(id, this.dataHandlerScript)
        // 更新数据
        this.canvasInst.updateDataHandler(this.config)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-data-panel-wrap{
  height: 100%;
  overflow-y: scroll;
.data-setting-box{
  .lc-field-head{
    .lc-field-title{
      position: relative;
      padding-left: 12px;
      line-height: 30px;
      height: 30px;
      &:after{
        position: absolute;
        left: 0;
        top: 50%;
        -webkit-transform: translateY(-50%);
        -ms-transform: translateY(-50%);
        transform: translateY(-50%);
        content: "";
        width: 4px;
        height: 14px;
        background-color: #007aff;
      }
    }
  }
  .lc-field-body{
    padding:12px;
  }
}
}
</style>
