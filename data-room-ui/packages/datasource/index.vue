<template>
  <div class="bs-container">
    <!--数据源查看-->
    <div class="inner-container">
      <el-form
        :inline="true"
        class="filter-container"
      >
        <el-form-item class="filter-input filter-item">
          <el-input
            v-model="searchForm.sourceName"
            class="bs-el-input"
            placeholder="请输入数据源名称"
            clearable
            maxlength="200"
            @clear="searchData"
          />
        </el-form-item>
        <el-form-item class="filter-item">
          <el-button
            type="primary"
            :loading="searchLoading"
            icon="el-icon-search"
            @click="searchData"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item class="filter-item">
          <el-button
            class="bs-el-button-default"
            @click="addSource"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
      <div class="dataroom-table-box">
        <el-table
          v-resize-table-height
          v-loading="searchLoading"
          height="0"
          class="dataroom-el-table bs-scrollbar"
          :element-loading-text="loadingText"
          :data="dataSourceList"
          @current-change="handleCurrentChange"
        >
          <el-empty slot="empty" />
          <el-table-column
            prop="sourceName"
            label="数据源名称"
            align="left"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <el-radio
                v-if="isDialog"
                v-model="curRow"
                :label="scope.row"
              >
                {{ scope.row.sourceName }}
              </el-radio>
              <span v-else>{{ scope.row.sourceName }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="sourceType"
            label="类型"
            align="center"
            show-overflow-tooltip
          />
          <el-table-column
            prop="remark"
            label="备注"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="操作"
            width="300"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                class="bs-el-button-default"
                :loading="testBtnLoading.includes(scope.row.id)"
                @click="sourceLinkTest(scope.row)"
              >
                测试
              </el-button>
              <el-button
                class="bs-el-button-default"
                :disabled="scope.row.editable == 1"
                @click="viewSource(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                class="bs-el-button-default"
                :loading="scope.row.loading"
                :disabled="scope.row.editable == 1"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="bs-pagination">
        <el-pagination
          class="bs-el-pagination"
          popper-class="bs-el-pagination"
          :current-page="current"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="size"
          :total="totalCount"
          background
          prev-text="上一页"
          next-text="下一页"
          layout="total, prev, pager, next,sizes"
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
        />
      </div>
    </div>
    <!-- 数据源新增/编辑 -->
    <set-datasource
      ref="setDatasource"
      @refreshTable="init"
    />
    <check-datasource
      ref="checkDatasource"
      :reason-list="reasonList"
    />
  </div>
</template>

<script>
import resizeTableHeight from '@gcpaas/data-room-ui/packages/assets/js/utils/resizeHeightDirevtive.js'
import { sourceLinkTest, datasourcePage, sourceRemove, dataSourceCheck } from '@gcpaas/data-room-ui/packages/assets/js/api/dataSourceService'
import SetDatasource from '@gcpaas/data-room-ui/packages/datasource/components/SetDatasource.vue'
import CheckDatasource from '@gcpaas/data-room-ui/packages/datasource/components/CheckDatasource.vue'
import cloneDeep from 'lodash/cloneDeep'
import { pageMixin } from '@gcpaas/data-room-ui/packages/assets/js/mixins/page.js'
export default {
  name: 'DataSource',
  directives: {
    resizeTableHeight // 注册自定义指令
  },
  components: {
    SetDatasource,
    CheckDatasource
  },
  // 路由守卫-离开页面
  beforeRouteLeave (to, from, next) {
    const layoutEl = document.querySelector('.big-screen-router-view-wrap')
    if (layoutEl) {
      layoutEl.style.paddingLeft = '0'
    }
    next()
  },
  // 路由进入页面
  beforeRouteEnter (to, from, next) {
    const layoutEl = document.querySelector('.big-screen-router-view-wrap')
    if (layoutEl) {
      layoutEl.style.paddingLeft = '16px'
    }
    next()
  },
  mixins: [pageMixin],
  props: {
    isDialog: {
      type: Boolean,
      default: false
    },
    sourceId: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      reasonList: [],
      testBtnLoading: [],
      loadingText: '',
      deling: false,
      searchLoading: false,
      dataSourceList: [],
      searchForm: {
        sourceName: '',
        sourceType: ''
      },
      size: 10,
      current: 1,
      curRow: null
    }
  },
  created () { },
  mounted () {
    this.init()
    const layoutEl = document.querySelector('.big-screen-router-view-wrap')
    if (layoutEl) {
      layoutEl.style.paddingLeft = '16px'
    }
  },
  methods: {
    // 获取当前选择数据集id
    getSourceId () {
      if (!this.isDialog) return
      if (this.curRow) {
        return this.curRow.id
      } else {
        return null
      }
    },
    // 单选数据集
    handleCurrentChange (currentRow) {
      this.curRow = currentRow
    },
    // 分页操作
    sizeChangeHandle (news) {
      this.size = news
      this.getDataList()
    },
    currentChangeHandle (newss) {
      this.current = newss
      this.getDataList()
    },
    // 查询数据
    searchData () {
      this.searchLoading = true
      this.loadingText = '正在查询数据...'
      // 重置current
      this.current = 1
      this.getDataList()
    },
    init () {
      this.current = 1
      this.getDataList()
    },
    getDataList () {
      const params = {
        current: this.current,
        size: this.size,
        sourceName: this.searchForm.sourceName
      }
      datasourcePage(params).then((data) => {
        this.totalCount = data.totalCount
        this.dataSourceList = data.list
        this.dataSourceList.forEach(r => {
          r.status = 0
          this.$set(r, 'loading', false)
          if (r.id === this.sourceId) {
            this.curRow = r
          }
        })
        this.searchLoading = false
      }).catch(() => {
        this.searchLoading = false
      })
    },
    addSource () {
      this.$refs.setDatasource.setDatasourceVisible = true
      this.$refs.setDatasource.title = '新建数据源'
      this.$refs.setDatasource.init()
    },
    viewSource (row) {
      // eslint-disable-next-line eqeqeq
      if (row.editable == 1) return
      this.$refs.setDatasource.setDatasourceVisible = true
      this.$refs.setDatasource.title = '编辑数据源'
      this.$refs.setDatasource.init(cloneDeep(row))
    },
    handleDelete (row) {
      // eslint-disable-next-line eqeqeq
      if (row.editable == 1) return
      row.loading = true
      dataSourceCheck(row.id).then((res) => {
        row.loading = false
        if (res.canDelete) {
          this.$confirm('确定删除当前数据源吗?', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
            customClass: 'bs-el-message-box'
          }).then(() => {
            sourceRemove(row.id).then((r) => {
              this.$message.success('删除成功')
              this.init()
            })
          })
        } else {
          this.reasonList = res.reasons
          this.$refs.checkDatasource.checkDatasourceVisible = true
        }
      })
    },
    sourceLinkTest (row) {
      this.testBtnLoading.push(row.id)
      this.linkLoading = true
      sourceLinkTest(row).then((r) => {
        this.$message.success(r)
        this.linkLoading = false
        this.testBtnLoading.splice(this.testBtnLoading.indexOf(row.id), 1)
      }).catch(() => {
        this.linkLoading = false
        this.testBtnLoading.splice(this.testBtnLoading.indexOf(row.id), 1)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import './assets/css/index.scss';
@import "../assets/style/common.scss";

.bs-pagination {
  margin-top: 4px;
  padding-right: 16px;
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}
.dataroom-table-box{
  padding: 0 16px;
}
</style>
