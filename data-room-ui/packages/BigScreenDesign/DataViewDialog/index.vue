<!--
@name:数据预览弹窗
@description:
@author: liu.shiyi
@time:
-->
<template>
  <div class="bs-data-view-dialog">
    <el-dialog
      :close-on-click-modal="false"
      title="数据查看"
      :visible.sync="formVisible"
      :append-to-body="false"
      class="bs-dialog-wrap bs-el-dialog"
    >
      <el-table
        ref="table"
        v-loading="loading"
        class="bs-table bs-el-table"
        height="300"
        :data="dataList"
      >
        <el-table-column
          v-for="(col,index) in columnData"
          :key="index"
          show-overflow-tooltip
          :prop="col.alias"
          :label="getLabel(col)"
          align="center"
        />
      </el-table>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <DownloadExcel
          :data="dataList"
          :fields="fields"
          :name="chartTitle+'数据导出'"
          class="output-excel"
          :before-finish="exportHandler"
        >
          <el-button
            type="primary"
            :loading="exportLoading"
          >
            导出数据
          </el-button>
        </DownloadExcel>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getUpdateChartInfo } from 'data-room-ui/js/api/bigScreenApi'
import { mapState } from 'vuex'
import Vue from 'vue'
import JsonExcel from 'vue-json-excel'

Vue.component('DownloadExcel', JsonExcel)
export default {
  name: 'DataViewDialog',
  components: {},
  props: {
  },
  data () {
    return {
      chartTitle: '',
      fields: {},
      formVisible: false,
      exportLoading: false,
      loading: false,
      dataList: [],
      columnData: {}
    }
  },
  computed: {
    ...mapState({
      pageCode: state => state.bigScreen.pageInfo.code
    })
  },
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {
    init (config) {
      this.resetData()
      this.chartTitle = config.title
      this.formVisible = true
      this.getDataList(config)
    },
    // 获取数据列表
    getDataList (config) {
      this.loading = true
      // 如果是G2组件则需要从option里面取数据
      if (config.type === 'customComponent' && (!config.dataSource.businessKey)) {
        this.getDataByOption(config)
        this.fieldsFormat()
        this.loading = false
      } else {
        const params = {
          chart: {
            ...config,
            option: undefined
          },
          current: 1,
          pageCode: this.pageCode,
          type: config.type
        }
        // 调接口获取数据
        getUpdateChartInfo(params).then(res => {
          this.loading = false
          if (Array.isArray(res.data)) {
            this.dataList = res.data || []
          } else {
            // 如果返回的data不是数组，则是js数据集或者是http前端数据集,则直接从option中获取
            this.getDataByOption(config)
          }
          this.columnData = res.columnData || {}
          this.fieldsFormat()
        }).catch(err => { console.log(err) }).finally(() => {
          this.loading = false
        })
      }
    },
    // 通过option获取数据
    getDataByOption (config) {
      const list = config.option.data || []
      for (const key of Object.keys(list[0])) {
        this.columnData[key] = {
          aggregate: '',
          alias: key,
          originalColumn: key,
          remark: key,
          tableName: '',
          type: 'varchar'
        }
      }
      console.log(this.columnData)
      this.dataList = list
    },
    // 获取表格的表头
    getLabel (col) {
      return col.remark || col.originalColumn
    },
    // 数据重置
    resetData () {
      this.columnData = {}
      this.dataList = []
      this.fields = {}
      this.chartTitle = ''
    },
    // 格式化fields
    fieldsFormat () {
      for (const item in this.columnData) {
        this.fields[this.columnData[item].remark] = this.columnData[item].originalColumn
      }
    },
    // 导出数据
    exportHandler () {
      this.$message.success('导出数据')
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-data-view-dialog{
  /deep/.el-dialog__body{
    background-color: var(--bs-background-2) !important;
  }
 .el-table th.el-table__cell.is-leaf, .el-table /deep/td.el-table__cell{
    border-bottom:none;
  }
}

</style>
