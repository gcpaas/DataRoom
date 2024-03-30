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
          <!--维度-->
          <div class="lc-field-body">
            <el-form-item
              v-if="isDimension"
              :label="dimensionFieldName"
              class="data-form-item"
            >
              <el-select
                v-model="config.dataSource.dimensionField"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                clearable
                @change="changeOption('dimensionField')"
              >
                <el-option
                  v-for="(field, index) in fieldList"
                  :key="index"
                  :label="field.fieldDesc"
                  :value="field.fieldName"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.fieldDesc !== "" ? field.fieldDesc : field.fieldName }}
                    </div>
                    <div class="option-txt">
                      {{ field.fieldName }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <!--指标-->
            <el-form-item
              :label="metricFieldName"
              prop="dataSource.metricField"
              class="data-form-item"
            >
              <el-select
                v-model="config.dataSource.metricField"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                clearable
                @change="changeOption('metricField')"
              >
                <el-option
                  v-for="(field, index) in fieldList"
                  :key="index"
                  :label="field.fieldDesc"
                  :value="field.fieldName"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.fieldDesc !== "" ? field.fieldDesc : field.fieldName }}
                    </div>
                    <div class="option-txt">
                      {{ field.fieldName }}
                    </div>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
            <!--分组-->
            <el-form-item
              v-if="isGroup"
              :label="classifiedFieldName"
              prop="dataSource.metricField"
              class="data-form-item"
            >
              <el-select
                v-model="config.dataSource.classifiedField"
                class="bs-el-select"
                popper-class="bs-el-select"
                filterable
                clearable
                @change="changeOption('classifiedField')"
              >
                <el-option
                  v-for="(field, index) in fieldList"
                  :key="index"
                  :label="field.fieldDesc"
                  :value="field.fieldName"
                >
                  <div class="source-key-option">
                    <div>
                      {{ field.fieldDesc !== "" ? field.fieldDesc : field.fieldName }}
                    </div>
                    <div class="option-txt">
                      {{ field.fieldName }}
                    </div>
                  </div>
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
    dimensionFieldName: {
      type: String,
      default: 'X轴字段'
    },
    metricFieldName: {
      type: String,
      default: 'Y轴字段'
    },
    classifiedFieldName: {
      type: String,
      default: '分组字段'
    },
    isDimension: {
      type: Boolean,
      default: true
    },
    isGroup: {
      type: Boolean,
      default: false
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
      datasetName: '',
      headerList: [],
      pageSizeList: [10, 20, 50, 100],
      rules: {
      }
    }
  },
  computed: {
    pageCode () {
      return this.$route.query.code
    },
    filters () {
      return this.chartProvide.filters()
    },
    dataScripts () {
      return this.chartProvide.dataScripts()
    },
    script: {
      get () {
        if (this.dataScripts && this.filters.hasOwnProperty(this.config.dataSource.dataHandleFilterId)) {
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
        this.getDsId(this.config.dataSource.businessKey)
      }
      this.dataHandlerScript = this.script
    },
    // 获取数据集id
    getDsId (dsId) {
      // 根据id获取数据集详情
      getDatasetInfo(dsId).then(res => {
        this.fieldList = res.fields
        this.datasetName = res.name
        // 调接口获取数据
        const config = cloneDeep(this.config)
        config.dataSource.businessKey = dsId
        this.chartProvide.updateChartConfig(config)
        this.chartProvide.updateDataHandler(config)
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
        this.chartProvide.updateChartConfig(config)
        this.chartProvide.updateStyleHandler(config)
      } else {
        this.changeStyle()
      }
    },
    // 改变数据脚本内容：需要同步到页面配置中
    updateDataHandlerScript () {
      // 配置数据集后数据脚本才生效
      if (this.config.dataSource.businessKey) {
        const id = this.config.code + 'dataHandlerScript'
        // 保存dataHandleFilterId
        this.chartProvide.updateChartConfig({ ...this.config, dataSource: { ...this.config.dataSource, dataHandleFilterId: id } })
        // 更新全局数据脚本
        this.chartProvide.updateDataScript(id, this.dataHandlerScript)
        // 更新数据
        this.chartProvide.updateDataHandler(this.config)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dataroom-data-panel-wrap{
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
