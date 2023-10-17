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
      width="60%"
      :visible.sync="formVisible"
      :append-to-body="false"
      class="bs-dialog-wrap bs-el-dialog"
    >
      <div class="table-box">
        <el-table
          ref="table"
          v-loading="loading"
          max-height="500"
          class="bs-table bs-el-table fixed-header-table"
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
      </div>

      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default cancel"
          @click="cancel"
        >
          取消
        </el-button>
        <DownloadExcel
          :data="dataList"
          :fields="fields"
          :name="chartTitle+'数据导出'"
          class="output-excel"
          :before-finish="exportHandler"
          :before-generate="generate"
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
      // 如果是G2组件并且未配置数据集的情况下，则需要从option里面取数据
      if ((['customComponent', 'remoteComponent', 'echartsComponent'].includes(config.type) && (!config.dataSource.businessKey)) || (config.expressionCodes && config.expressionCodes.length)) {
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
            // 如果返回的data不是数组，存在以下几种情况：则直接从option中获取
            // 1、是组件绑定的是js数据集或者是http前端数据集,
            // 2、是组件返回的模拟数据为null
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
      let list = []
      if (config.chartType === 'Treemap') {
        list = config.option.data.children
      } else if (config.type === 'tables') {
        list = config.option.tableData
      } else if (config.expressionCodes && config.expressionCodes.length) {
        list = [{ title: config.customize.title }]
      } else {
        list = config.option.data
      }
      let keyList = []
      if (list && list.length) {
        // 如果list[0]是对象
        if (typeof list[0] === 'object' && list[0] !== null) {
          keyList = Object.keys(list[0])
        } else {
          keyList = list
        }
        for (const key of keyList) {
          const _key = key + ''
          this.columnData[_key] = {
            aggregate: '',
            alias: _key,
            originalColumn: _key,
            remark: _key,
            tableName: '',
            type: 'varchar'
          }
        }
      } else {
        this.columnData = {}
      }
      this.dataList = list || []
    },
    // 获取表格的表头
    getLabel (col) {
      return col.remark || col.alias
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
      if (this.columnData && Object.keys(this.columnData).length) {
        for (const item in this.columnData) {
          this.fields[this.columnData[item].remark || this.columnData[item].alias] = this.columnData[item].alias
        }
      } else {
        this.fields = {}
      }
    },
    // 取消
    cancel () {
      this.formVisible = false
    },
    generate (val) {
      if (!Object.keys(this.fields).length) {
        this.$message.warning('数据为空')
      }
      this.formVisible = false
      this.exportLoading = true
    },
    // 导出数据
    exportHandler () {
      this.exportLoading = false
      if (Object.keys(this.fields).length) {
        this.$message.success('数据导出成功')
      }
      this.formVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.bs-data-view-dialog{
  ::v-deep .el-dialog__body{
    background-color: var(--bs-background-2) !important;
    overflow: hidden;
    max-height: 540px!important;
  }
  .table-box{
    height: 100%;
    overflow-y: auto; /* 当内容溢出时显示垂直滚动条 */
  }
  .dialog-footer{
    display: flex;
    justify-content: flex-end;
    .cancel{
      margin-right: 10px;
      overflow-y: hidden;
    }
  }
  ::v-deep  .el-table__body-wrapper{
    min-height: 200px !important;
  }
 .el-table th.el-table__cell.is-leaf, .el-table ::v-deep td.el-table__cell{
    border-bottom:none;
  }
  ::v-deep .el-loading-mask{
    background-color: var(--bs-background-2) !important;
  }
  .el-table ::v-deep thead{
    color: var(--bs-el-title);
  }
  .bs-el-table ::v-deep td.el-table__cell{
    color: #bcc9d4;
  }
  .el-table--scrollable-y ::v-deep .el-table__body-wrapper{
    overflow: auto!important;
  }
  /* 修改滚动条的样式 */
  ::v-deep .el-dialog__body::-webkit-scrollbar {
    width: 8px; /* 滚动条宽度 */
  }

 ::v-deep .el-dialog__body::-webkit-scrollbar-thumb {
    background-color: #888; /* 滚动条拖动块颜色 */
    height: 6px;
    border-radius: 5px;
  }

  ::v-deep .el-dialog__body::-webkit-scrollbar-track {
    background-color: transparent; /* 滚动条轨道颜色 */
  }

  /* 鼠标悬停在滚动条上时的样式 */
  ::v-deep .el-dialog__body::-webkit-scrollbar-thumb:hover {
    background-color: #555;
  }
}
/* 自定义滚动条样式 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar {
  width: 6px; /* 滚动条宽度 */
  height: 6px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb {
  background-color: #888; /* 滚动条拖动块颜色 */
  height: 100px;
  border-radius: 5px;
}

::v-deep .el-table__body-wrapper::-webkit-scrollbar-track {
  background-color: transparent; /* 滚动条轨道颜色 */
}

/* 鼠标悬停在滚动条上时的样式 */
::v-deep .el-table__body-wrapper::-webkit-scrollbar-thumb:hover {
  background-color: #555;
  cursor: pointer;
}
</style>
