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
        <el-button
          type="primary"
          :loading="sureLoading"
          @click="exportHandler"
        >
          导出数据
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getChatInfo, getUpdateChartInfo } from 'data-room-ui/js/api/bigScreenApi'
import { mapState } from 'vuex'

export default {
  name: 'DataViewDialog',
  components: {},
  props: {
  },
  data () {
    return {
      formVisible: false,
      sureLoading: false,
      loading: false,
      dataList: [],
      columnData: []
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
      this.formVisible = true
      this.getDataList(config)
    },
    // 获取数据列表
    getDataList (config) {
      this.loading = true
      if (config.type === 'customComponent' && (!config.dataSource.businessKey)) {
        const list = config.option.data
        this.columnData = (Object.keys(list[0])).map((key) => {
          return {
            aggregate: '',
            alias: key,
            originalColumn: key,
            remark: key,
            tableName: '',
            type: 'varchar'
          }
        })
        this.dataList = list
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
        getUpdateChartInfo(params).then(res => {
          this.loading = false
          this.dataList = res.data || []
          this.columnData = res.columnData || []
        }).catch(err => { console.log(err) }).finally(() => {
          this.loading = false
        })
      }
    },
    getLabel (col) {
      return col.remark || col.originalColumn
    },
    // 数据重置
    resetData () {
      this.columnData = []
      this.dataList = []
    },
    // 导出数据
    exportHandler () {
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
