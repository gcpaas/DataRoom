<template>
  <div class="db-container">
    <div
      v-if="labelVisible"
      class="inner-container"
    >
      <el-form
        ref="queryForm"
        :model="queryForm"
        class="filter-container"
      >
        <el-form-item
          class="filter-item"
          prop="labelName"
        >
          标签名称
          <el-input
            v-model="queryForm.labelName"
            clearable
            placeholder="请输入标签名称"
            @clear="reSearch()"
            @keyup.enter.native="reSearch()"
          />
        </el-form-item>
        <el-form-item
          class="filter-item"
          prop="labelType"
        >
          标签类型
          <el-select
            v-model="queryForm.labelType"
            clearable
            filterable
            placeholder="请选择标签类型"
            @change="reSearch()"
          >
            <el-option
              key="all"
              label="全部"
              value=""
            />
            <el-option
              v-for="labelType in labelTypeList"
              :key="labelType"
              :label="labelType"
              :value="labelType"
            >
              <span>
                {{ labelType }}
              </span>
              <span style="float: right;padding-right: 20px">
                <el-button
                  icon="el-icon-edit"
                  type="text"
                  @click.stop="editLabelType(labelType)"
                />
                <el-button
                  icon="el-icon-delete"
                  type="text"
                  @click.stop="deleteLabelType(labelType)"
                />
              </span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item class="filter-item">
          <el-button
            :loading="dataListLoading"
            icon="el-icon-search"
            type="primary"
            @click="reSearch"
          >
            查询
          </el-button>
        </el-form-item>
        <el-form-item
          class="filter-item"
        >
          <el-button
            type="primary"
            @click="addOrUpdateLabel(undefined)"
          >
            新增
          </el-button>
        </el-form-item>
      </el-form>
      <div class="db-table-box">
        <el-table
          v-table
          v-loading="dataListLoading"
          height="0"
          :data="tableData"
          class="db-el-table db-scrollbar"
          :element-loading-text="loadingText"
          :header-cell-style="sortStyle"
          @sort-change="reSort"
        >
          <el-empty slot="empty" />
          <el-table-column
            label="标签名称"
            prop="labelName"
            show-overflow-tooltip
          />
          <el-table-column
            label="标签类型"
            prop="labelType"
            show-overflow-tooltip
          />
          <el-table-column
            label="标签说明"
            prop="labelDesc"
            show-overflow-tooltip
          />
          <el-table-column
            align="center"
            label="操作"
            width="200"
          >
            <template slot-scope="scope">
              <el-button @click="getDetail(scope.row)">
                详情
              </el-button>
              <el-button
                @click="addOrUpdateLabel(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                @click="handleDelete(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="db-pagination">
        <el-pagination
          class="db-el-pagination"
          popper-class="db-el-pagination"
          :current-page="current"
          :next-text="nextText"
          :page-size="size"
          :page-sizes="[10, 20, 50, 100]"
          :prev-text="prevText"
          :total="totalCount"
          background
          layout="total, prev, pager, next, sizes"
          @size-change="sizeChangeHandle"
          @current-change="currentChangeHandle"
        />
      </div>
    </div>
    <label-config-add-or-update
      v-if="addOrUpdateVisible"
      ref="LabelConfigAddOrUpdate"
    />
    <label-type-edit
      v-if="labelTypeEditVisible"
      ref="LabelTypeEdit"
    />
    <label-config-details
      ref="LabelConfigDetails"
    >
    </label-config-details>
  </div>
</template>

<script>
import table from 'packages/js/utils/table.js'
import { pageMixins } from 'packages/js/mixins/page'
import LabelConfigAddOrUpdate from './LabelConfigAddOrUpdate.vue'
import LabelConfigDetails from './LabelConfigDetails.vue'
import LabelTypeEdit from './LabelTypeEdit.vue'
import { getLabelType, labelList, removeLabel, removeLabelByType } from 'packages/js/utils/LabelConfigService'

export default {
  name: 'LabelConfig',
  directives: {
    table // 注册自定义指令
  },
  mixins: [pageMixins],
  components: {
    LabelConfigDetails,
    LabelConfigAddOrUpdate,
    LabelTypeEdit
  },
  data () {
    return {
      tableData: [],
      addOrUpdateVisible: false,
      addOrUpdateDetailVisible: false,
      labelTypeEditVisible: false,
      labelVisible: true,
      labelTypeList: [],
      dataListLoading: false,
      loadingText: '',
      queryForm: {
        labelName: '',
        labelType: ''
      }
    }
  },
  watch: {},
  mounted () {
    this.getDataList()
    this.getLabelType()
  },
  methods: {
    deleteLabelType (labelType) {
      this.$confirm('是否删除当前标签类型? ', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLabelByType({ labelType: labelType }).then(() => {
          this.$nextTick(() => {
            this.reSearch()
            this.getLabelType()
            this.$message.success('删除成功')
          })
        })
      })
    },
    editLabelType (labelType) {
      this.labelTypeEditVisible = true
      this.$nextTick(() => {
        this.$refs.LabelTypeEdit.dialogFormVisible = true
        this.$refs.LabelTypeEdit.init(labelType)
      })
    },
    handleDelete (id) {
      this.$confirm('确定删除当前标签吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        removeLabel(id).then(() => {
          this.getDataList()
          this.$message.success('删除成功')
        })
      }).catch(() => {
      })
    },
    // 新增/编辑
    addOrUpdateLabel (row) {
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.LabelConfigAddOrUpdate.labelTypeList = this.labelTypeList
        this.$refs.LabelConfigAddOrUpdate.init(row)
      })
    },
    // 查看详情
    getDetail (row) {
      this.addOrUpdateDetailVisible = true
      this.labelVisible = false
      this.$nextTick(() => {
        this.$refs.LabelConfigDetails.init(row)
      })
    },
    // 获取标签列表
    getLabelType () {
      getLabelType().then((data) => {
        this.labelTypeList = data
      })
    },
    // 获取列表方法
    getDataList () {
      this.dataListLoading = true
      this.loadingText = '正在查询数据...'
      const params = {
        current: this.current,
        size: this.size,
        ...this.queryForm
      }
      labelList(params).then((data) => {
        this.totalCount = data.totalCount
        this.tableData = data.list
        this.dataListLoading = false
      }).catch(() => {
        this.dataListLoading = false
      })
    },
    // 查询事件
    reSearch () {
      // 从第一页
      this.current = 1
      this.getDataList()
    }
  }
}
</script>
<style lang="scss" scoped>
::v-deep .el-table{
  border-color: var(--db-el-border) !important;
}
</style>
