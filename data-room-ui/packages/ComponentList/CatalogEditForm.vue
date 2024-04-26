<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      title="分组管理"
      :visible.sync="formVisible"
      :append-to-body="true"
      custom-class="bs-el-dialog"
      destroy-on-close
      class="bs-dialog-wrap bs-el-dialog catalog-edit-wrap"
    >
      <el-form
        v-if="formVisible"
        ref="dataForm"
        label-position="right"
        label-width="100px"
        class="bs-el-form"
      >
        <div class="top-search-wrap">
          <el-input
            v-model="searchKey"
            class="bs-el-input"
            placeholder="请输入分组名称"
            prefix-icon="el-icon-search"
            clearable
            @clear="reSearch"
            @keyup.enter.native="reSearch"
          />
          <el-button
            type="primary"
            @click="reSearch"
          >
            搜索
          </el-button>
          <el-button
            type="primary"
            @click="addCatalog"
          >
            新增
          </el-button>
        </div>
        <el-table
          :key="randomKey"
          max-height="400"
          class="bs-el-table"
          :data="tableList"
        >
          <el-empty />
          <el-table-column
            show-overflow-tooltip
            label="分组名称"
            prop="name"
            align="center"
          />
          <el-table-column
            show-overflow-tooltip
            label="排序"
            prop="orderNum"
            align="center"
          />
          <el-table-column
            label="操作"
            width="150"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="editCatalog(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                type="text"
                @click="catalogDel(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form>
    </el-dialog>
    <!-- 新增或编辑目录弹窗 -->
    <el-dialog
      :title="currentCatalog.code ? '编辑分组' : '新增分组'"
      :visible.sync="catalogVisible"
      custom-class="bs-el-dialog"
      width="30%"
      class="bs-dialog-wrap bs-el-dialog"
      @close="handleClose"
    >
      <el-form
        ref="form"
        :model="currentCatalog"
        label-width="80px"
        :rules="formRules"
        class="bs-el-form"
      >
        <el-form-item
          label="分组名称"
          prop="name"
        >
          <el-input
            v-model.trim="currentCatalog.name"
            class="bs-el-input"
            clearable
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number
            v-model="currentCatalog.orderNum"
            :min="0"
            :max="30000"
            controls-position="right"
            class="bs-el-input-number"
          />
        </el-form-item>
      </el-form>
      <span
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="catalogVisible = false"
        >
          取消
        </el-button>
        <el-button
          type="primary"
          @click="addOrEditCatalog"
        >
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import cloneDeep from 'lodash/cloneDeep'
export default {
  name: 'CatalogEditForm',
  components: {
  },
  props: {
    catalogType: {
      type: String,
      default: ''
    }
  },
  data () {
    // 检验分组名称是否重复
    const validateName = (rule, value, callback) => {
      this.$dataRoomAxios.post('/bigScreen/type/nameRepeat', {
        id: this.currentCatalog.id,
        name: value,
        type: this.catalogType
      }, true).then((r) => {
        if (r.data) {
          callback(new Error('分组名称已存在'))
        } else {
          callback()
        }
      })
    }
    return {
      dataList: [], // 模糊查询时用来给数据备份
      tableList: [],
      randomKey: '',
      searchKey: '', // 分组查询
      catalogVisible: false,
      currentCatalog: {},
      formVisible: false,
      formRules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
  },
  watch: {
    catalogType () {
      this.getCatalogList()
    }
  },
  mounted () {
    this.getCatalogList()
  },
  methods: {
    reSearch () {
      const arr = this.dataList
      this.tableList = arr?.filter((item) => item.name?.indexOf(this.searchKey) !== -1)
    },
    // 获取分组列表
    getCatalogList () {
      this.$dataRoomAxios.get(`/bigScreen/type/list/${this.catalogType}`)
        .then((data) => {
          this.tableList = data
          this.dataList = data
          this.$emit('updateCatalogList', data)
        })
        .catch(() => { })
    },
    // 新增编辑目录（点击确定）
    addOrEditCatalog () {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        if (!this.currentCatalog.id) {
          this.$dataRoomAxios.post('/bigScreen/type/add',
            {
              ...this.currentCatalog,
              type: this.catalogType
            }).then(data => {
            this.catalogVisible = false
            this.getCatalogList()
          }).catch(() => {
          })
        } else {
          this.$dataRoomAxios.post('/bigScreen/type/update', { ...this.currentCatalog, type: this.catalogType }).then(data => {
            this.catalogVisible = false
            this.getCatalogList()
          }).catch(() => {
          })
        }
      })
    },
    addCatalog () {
      this.currentCatalog = {
        name: '',
        id: '',
        code: '',
        orderNum: 0
      }
      this.catalogVisible = true
    },
    editCatalog (row) {
      this.currentCatalog = cloneDeep(row)
      this.catalogVisible = true
    },
    // 删除目录
    catalogDel (catalog) {
      this.$confirm('分组删除后，分组下的组件会被归纳至全部中，确定删除该分组?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        this.$dataRoomAxios.post(`/bigScreen/type/delete/${catalog.id}`).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.getCatalogList()
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
        })
      }).catch()
    },
    // 关闭分组弹窗
    handleClose () {
      this.catalogVisible = false
      this.$refs.form.clearValidate()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';
.catalog-edit-wrap{
 ::v-deep .el-dialog__body{
    min-height: 300px !important;
  }

  .el-input {
    width: 200px;
    margin-right: 20px;
  }

  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 12px;

    .el-input {
      width: 200px;
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: #151A26 !important;
      }
    }
  }
}
</style>
