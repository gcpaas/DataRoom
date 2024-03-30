<template>
  <div class="dataroom-side-menu-wrap">
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
      custom-class=""
      width="30%"
      class="dataroom-el-dialog"
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
        >
          确定
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import cloneDeep from 'lodash/cloneDeep'
import { addCatalog, checkCatalogName, delCatalog, getCatalogList, updateCatalog } from '@gcpaas/data-room-ui/packages/js/api/sideMenuApi'
export default {
  components: { },
  props: {
    pageType: {
      type: String,
      default: 'page'
    }
  },
  data () {
    const validateName = (rule, value, callback) => {
      checkCatalogName({
        id: this.currentCatalog.id,
        name: value,
        type: this.pageType || 'pageCatalog'
      }, true).then((r) => {
        if (r.data) {
          callback(new Error('分组名称已存在'))
        } else {
          callback()
        }
      })
    }
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
        code: '',
        orderNum: 0
      },
      formRules: {
        name: [
          { required: true, message: '分组名称不能为空', trigger: 'blur' },
          { validator: validateName, trigger: 'blur' }
        ]
      }
    }
  },
  watch: {
    pageType (value) {
      this.isAll = true
      this.getCatalogList()
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
      this.currentCatalog = cloneDeep(catalog)
      this.activeCatalog = cloneDeep(catalog)
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
          addCatalog({
            ...this.currentCatalog,
            type: this.pageType + 'Catalog' || 'pageCatalog'
          }).then(data => {
            this.catalogVisible = false
            this.getCatalogList()
            this.flag = true
            // 关闭页面菜单的弹窗
            this.closePageMenuDialog()
          }).catch(() => {
          })
        } else {
          updateCatalog({ ...this.currentCatalog, type: this.pageType + 'Catalog' || 'pageCatalog' }).then(data => {
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
        code: '',
        orderNum: 0
      }
    },
    // 编辑目录
    catalogEdit () {
      this.currentCatalog = cloneDeep(this.currentCatalog)
      this.catalogVisible = true
    },
    // 删除目录
    catalogDel (catalog) {
      this.$confirm('分组删除后，分组下的页面会被归纳至全部中，确定删除该分组？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        delCatalog(catalog.id).then(() => {
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
      getCatalogList(this.pageType).then(data => {
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
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
  .dataroom-side-menu-wrap{
    padding-top: 16px;
    width: 220px;
    box-sizing: border-box;
    color: #76838f;
    background-color: #ffffff;
    font-size: 14px;
    .side-catalog-box{
      height: calc(100% - 50px);
      overflow-y: auto;
      overflow-x:hidden!important;
      ::v-deep .el-scrollbar__wrap{
        overflow-x: hidden!important;
      }
      .side-catalog-all{
        font-size: 14px;
        font-weight: 700
      }
      .side-catalog-item{
        width: 100%;
        padding: 0px 16px;
        line-height: 36px;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
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
          font-size: 14px;
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
        position: relative;
        background-color: rgba(64,158,255,0.1);
        color:#409EFF;
        &::before{
          content: '';
          position: absolute;
          left: 0;
          width: 4px;
          height: 36px;
          background-color: #409EFF;
        }
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
        background-color: rgba(0,122,255,.063);
        cursor: pointer;
        color: #36474f;
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
    ::v-deep.el-dropdown-menu__item{
      text-align: center;
      padding: 5px;
    }
    ::v-deep.popper__arrow{
      left: 50% !important;
      transform: translateX(-50%) !important;
    }
  }
</style>
