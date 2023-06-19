<template>
  <div class="side-catalog-wrap">
    <el-scrollbar class="side-catalog-box">
      <div
        class="side-catalog-all side-catalog-item"
        :class="{'active-catalog':isAll}"
        @click="clickAllCatalog()"
      >
        全部
      </div>
      <div
        v-for="(catalog,index) in catalogList"
        :key="index"
        class="side-catalog-item"
        :class="{'active-catalog':activeCatalog.code === catalog.code && !isAll}"
        @mouseenter="mouseenter(catalog.code)"
        @mouseleave="mouseleave"
        @click="clickCatalog(catalog)"
      >
        <span class="catalog-name">{{ catalog.name }}</span>
        <el-dropdown
          :class="{'dropdown-show':(showDropdown && hoverItem === catalog.code) || activeCatalog.code === catalog.code}"
          class="page-list-dropdown"
          placement="bottom-start"
          node-key="id"
          trigger="click"
        >
          <span class="el-dropdown-link menu-dropdown-link">
            <i
              class="el-icon-more"
              :class="{'active-icon-more':activeCatalog.code === catalog.code && !isAll}"
            />
            <el-dropdown-menu
              slot="dropdown"
              class="dropdown-menu-box bs-el-dropdown-menu"
            >
              <el-dropdown-item @click.native="catalogEdit(catalog)">
                编辑
              </el-dropdown-item>
              <el-dropdown-item
                class="delete-item"
                @click.native="catalogDel(catalog)"
              >
                删除
              </el-dropdown-item>
            </el-dropdown-menu>
          </span>
        </el-dropdown>
      </div>
    </el-scrollbar>
    <div
      class="add-catalog-box"
      @click="catalogAdd"
    >
      <i class="el-icon-plus" />
      <div>新建分组</div>
    </div>
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
import { get, post } from '../../packages/js/utils/http'
import _ from 'lodash'

export default {
  components: { },
  props: {
    type: {
      type: String,
      default: 'bigScreenCatalog'
    }
  },
  data () {
    return {
      showDropdown: false,
      hoverItem: null,
      isAll: true,
      catalogList: [],
      catalogVisible: false,
      activeCatalog: { // 激活的目录,点击其他非目录按钮时需要保持当前的菜单激活状态
        name: '',
        id: '',
        code: ''
      },
      currentCatalog: { // 选中目录
        name: '',
        id: '',
        code: ''
      },
      formRules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  mounted () {
    this.getCatalogList()
  },
  methods: {
    mouseenter (code) {
      this.showDropdown = true
      this.hoverItem = code
    },
    mouseleave () {
      this.showDropdown = false
    },
    // 点击全部
    clickAllCatalog () {
      this.isAll = true
      this.$emit('getPageInfo', { isAll: true, page: { id: '', code: '', name: '' } })
    },
    // 点击目录
    clickCatalog (catalog) {
      this.currentCatalog = _.cloneDeep(catalog)
      this.activeCatalog = _.cloneDeep(catalog)
      this.isAll = false
      this.$emit('getPageInfo', { isAll: false, page: catalog })
    },
    // 关闭目录弹窗
    handleClose () {
      this.catalogVisible = false
      this.$refs.form.clearValidate()
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
              type: this.type || 'bigScreenCatalog'
            }).then(data => {
            this.catalogVisible = false
            this.getCatalogList()
            this.flag = true
            // 关闭页面菜单的弹窗
            this.closePageMenuDialog()
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
    // 新增目录
    catalogAdd () {
      this.catalogVisible = true
      this.currentCatalog = { // 选中目录
        name: '',
        id: '',
        code: ''
      }
    },
    // 编辑目录
    catalogEdit () {
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
    // 获取目录的列表
    getCatalogList () {
      this.pageLoading = true
      get(`/bigScreen/type/list/${this.type}`).then(data => {
        this.catalogList = data
      }).catch(() => {
      }).finally(() => {
        this.pageLoading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
  @import '~packages/assets/style/bsTheme.scss';
  .side-catalog-wrap{
    padding-top: 16px;
    width: 220px;
    height: 100%;
    box-sizing: border-box;
    color: var(--bs-el-title);
    background-color: var(--bs-background-2);
    .side-catalog-box{
      height: calc(100% - 50px);
      overflow-y: auto;
      .side-catalog-all{
        font-weight: bold;
      }
      .side-catalog-item{
        width: 100%;
        padding: 8px 16px;
        display: flex;
        justify-content: space-between;
        &:hover{
          cursor: pointer;
        }
        .el-icon-more{
          transform: rotate(90deg);
          color: var(--bs-el-title);
          font-weight: 400;
        }
        .active-icon-more{
          color:var(--bs-el-text);
        }
        .catalog-name{
          overflow:hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          -o-text-overflow:ellipsis;
        }
        .page-list-dropdown{
          opacity: 0;
        }
        .dropdown-show{
          opacity: 1;
        }
      }
      /*菜单激活时的样式*/
      .active-catalog{
        background-image: linear-gradient(to right , var(--bs-el-color-primary), var(--bs-background-2));
        background-repeat: round;
        color: var(--bs-el-text);
      }
    }
    .add-catalog-box{
      padding: 10px 0;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 10px;
      margin: 0 8px;
      &:hover{
        background-color: var(--bs-background-1);
        cursor: pointer;
        color: var(--bs-el-text);;
      }
      .el-icon-plus{
        padding: 0 5px;
      }
    }

  }
  .dropdown-menu-box{
    left: 50%;
    transform: translateX(-40%);
    width: 100px!important;
    /deep/.el-dropdown-menu__item{
      text-align: center;
      padding: 5px;
    }
    /deep/.popper__arrow{
      left: 50% !important;
      transform: translateX(-50%) !important;
    }
  }
</style>
