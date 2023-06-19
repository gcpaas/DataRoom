<template>
  <div>
    <el-dialog
      :close-on-click-modal="false"
      title="分组管理"
      :visible.sync="formVisible"
      :append-to-body="true"
      destroy-on-close
      class="bs-dialog-wrap bs-el-dialog catalog-edit-wrap"
    >
      <el-form
        v-if="formVisible"
        ref="dataForm"
        label-position="right"
        label-width="100px"
      >
        <el-input
          v-model="searchKey"
          class="bs-el-input"
          placeholder="'请输入分组名称'"
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
        <el-table
          class="bs-el-table"
          height="100%"
          :data="tableList"
        >
          <el-empty />
          <el-table-column
            show-overflow-tooltip
            label="名称"
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
            width="105"
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
      :title="currentCatalog.code ? '编辑分组':'新建分组'"
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
      >
        <el-form-item
          label="分组名称"
          prop="name"
        >
          <el-input
            v-model="currentCatalog.name"
            class="bs-el-input"
          />
        </el-form-item>
        <el-form-item
          label="排序"
        >
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
        >确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { get, post } from 'packages/js/utils/http'
import Icon from 'packages/assets/images/dataSourceIcon/export'
import _ from 'lodash'
export default {
  name: 'CatalogEditForm',
  components: {
  },
  props: {
    catalogType: {
      type: String,
      default: ''
    },
    catalogList: {
      type: Array,
      default: () => {}
    }
  },
  data () {
    return {
      searchKey: '', // 分组查询
      catalogVisible: false,
      currentCatalog: {},
      formVisible: false,
      formRules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    tableList: {
      get () {
        return _.cloneDeep(this.catalogList)
      },
      set () {

      }
    }
  },
  watch: {
  },
  mounted () {
    // this.getCatalogList()
  },
  methods: {
    reSearch () {

    },
    // 获取分组列表
    getCatalogList () {
      get(`/bigScreen/type/list/${this.catalogType}`)
        .then((data) => {
          this.tableList = data
        })
        .catch(() => {})
    },
    // 新增编辑目录（点击确定）
    addOrEditCatalog () {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        if (!this.currentCatalog.id) {
          post('/bigScreen/type/add',
            {
              ...this.currentCatalog,
              type: this.catalogType
            }).then(data => {
            this.catalogVisible = false
            this.getCatalogList()
          }).catch(() => {
          })
        } else {
          post('/bigScreen/type/update', { ...this.currentCatalog, type: this.type || 'bigScreenCatalog' }).then(data => {
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
        code: ''
      }
      this.catalogVisible = true
    },
    editCatalog (row) {
      this.currentCatalog = row
      this.catalogVisible = true
    },
    // 删除目录
    catalogDel (catalog) {
      this.$confirm('确定删除该目录？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        post(`/bigScreen/type/delete/${catalog.id}`).then(() => {
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
    // 关闭目录弹窗
    handleClose () {
      this.catalogVisible = false
      this.$refs.form.clearValidate()
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~packages/assets/style/bsTheme.scss';
.catalog-edit-wrap{
  .el-input {
    width: 200px;
    margin-right: 20px;
    /deep/.el-input__inner {
      /*background-color: #232832 !important;*/
    }
  }
}
</style>
