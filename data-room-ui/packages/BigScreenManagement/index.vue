<template>
  <div
    v-loading="pageLoading"
    loading-text="加载中..."
    class="page-manage-wrap"
  >
    <div class="page-manage-menu">
      <!-- 搜索部分 -->
      <div class="page-manage-menu-search">
        <el-input
          v-model="searchKey"
          placeholder="请输入名称"
          @keyup.enter.native="filterClick"
        />
        <!-- 新增页面按钮 -->
        <i
          class="page-icon el-icon-plus"
          @click="openPageMenuDialog"
        />
      </div>
      <!-- 页面列表 -->
      <div class="page-manage-menu-list">
        <template v-if="pageDesignListHasLength">
          <el-tree
            ref="tree"
            :key="treeKey"
            class="page-list-tree"
            node-key="code"
            :default-expanded-keys="defaultExpand"
            :current-node-key="currentNodeCode"
            :data="pageDesignList"
            :props="defaultProps"
            :filter-node-method="filterNode"
            @node-click="nodeClick"
          >
            <span
              slot-scope="{ node, data }"
              class="menu-span"
            >
              <icon-svg :name="pageIconName(data,node)" />
              <span
                style="padding-left:4px;font-size:14px"
                class="tree-node-name"
              >{{ data.name }}</span>
              <el-dropdown
                class="page-list-dropdown"
                placement="bottom-start"
                node-key="id"
                trigger="click"
              >
                <span class="el-dropdown-link menu-dropdown-link">
                  <i class="el-icon-more" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item @click.native="handleDropdownClick('edit',data,node)">编辑 </el-dropdown-item>
                  <el-dropdown-item
                    v-if="data.type!=='catalog'"
                    @click.native="handleDropdownClick('copy',data,node)"
                  >复制 </el-dropdown-item>
                  <el-dropdown-item
                    class="delete-item"
                    @click.native="handleDropdownClick('delete',data,node)"
                  >删除 </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </el-tree>
        </template>
        <el-empty
          v-else
          slot="empty"
        />
      </div>
    </div>
    <!-- 预览部分 -->
    <div class="page-manage-content">
      <div class="page-manage-content-top">
        <div class="page-manage-content-top-name">
          <icon-svg
            v-if="activePage.code"
            :name="pageIconImg(activePage)"
            class="active-page-icon"
          />
          {{ activePage.type !== 'catalog'? activePage.name:'' }}
        </div>
        <div>
          <el-button
            v-if="pageDesignList.length!==0 && activePage.code"
            class="top-button"
            icon="el-icon-share"
            @click="gopagePreview(activePage)"
          >
            新窗口打开
          </el-button>
          <el-button
            v-if="pageDesignList.length!==0 && activePage.code"
            class="page-manage-content-top-page"
            type="primary"
            @click="gopageDesign(activePage)"
          >
            设计
          </el-button>
        </div>
      </div>
      <div
        class="page-manage-content-body-box"
        :style="{ padding: activePage.type !== 'dashBoard' ? '16px' : '0' }"
      >
        <div class="page-manage-content-body">
          <el-empty
            v-if="!activePage.code"
            slot="empty"
            description="请在左侧选择页面修改或新增页面"
            class="empty-wrap"
          />
          <div
            v-else
            :class="{
              'preview-wrap': true,
              'inner-preview-wrap': true,
              'padding': activePage.type === 'form'
            }"
          >
            <BigScreenRun
              v-if="activePage.type === 'bigScreen'"
              :key="activePage.code"
              :code="activePage.code"
            />
          </div>
        </div>
      </div>
    </div>
    <!-- 新增或编辑弹窗 -->
    <AddDialog
      ref="AddDialog"
      @refreshData="reSearch"
    />
    <!-- 新增目录弹窗 -->
    <el-dialog
      :title="catalogData.id ? '编辑目录':'新增目录'"
      :visible.sync="catalogVisible"
      width="30%"
      class="bs-dialog-wrap catalog-dialog bs-el-dialog"
      @close="handleClose"
    >
      <el-form
        ref="form"
        :model="catalogData"
        label-width="80px"
        :rules="formRules"
        class="bs-el-form"
      >
        <el-form-item
          label="上级目录"
        >
          <el-select
            ref="select"
            v-model="catalogData.parentCode"
            placeholder="请选择上级目录"
            clearable
            @change="parentCodeChange"
          >
            <el-option
              key="code"
              hidden
              :value="catalogData.parentCode"
              :label="selectName"
            />
            <el-tree
              :data="catalogList"
              :props="defaultProps"
              node-key="code"
              :check-on-click-node="true"
              :expand-on-click-node="false"
              @node-click="handleNodeClick"
            >
              <span
                slot-scope="{ data }"
                class="menu-span"
              >
                <span
                  style="padding-left:4px;font-size:14px"
                  class="tree-node-name"
                >{{ data.name }}</span>
              </span>
            </el-tree>
          </el-select>
        </el-form-item>
        <el-form-item
          label="目录名称"
          prop="name"
        >
          <el-input v-model="catalogData.name" />
        </el-form-item>
        <el-form-item
          label="排序"
        >
          <el-input-number
            v-model="catalogData.orderNum"
            :min="0"
            :max="30000"
            controls-position="right"
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
        >取消</el-button>
        <el-button
          type="primary"
          @click="addCatalog"
        >确定</el-button>
      </span>
    </el-dialog>
    <ChooseTemplateDialog
      ref="ChooseTemplateDialog"
      :loading="templateLoading"
      :has-create="true"
      @addNew="addNew"
      @useIt="useIt"
    />
    <pageMenuDialog
      ref="pageMenuDialog"
      @addPageDesign="addPageDesign"
    />
  </div>
</template>
<script>

import AddDialog from './addDialog.vue'
import ChooseTemplateDialog from './ChooseTemplateDialog.vue'
import pageMenuDialog from './pageMenuDialog.vue'
import BigScreenRun from 'data-room-ui/BigScreenRun/index.vue'
import Icon from 'data-room-ui/assets/images/pageIcon/export'
import { getPageType } from './utils'
// import _ from 'lodash'
import cloneDeep from 'lodash/cloneDeep'
import IconSvg from 'data-room-ui/SvgIcon'
let dashBoardPageCode = null
export default {
  name: 'PageManage',
  components: {
    AddDialog,
    ChooseTemplateDialog,
    pageMenuDialog,
    BigScreenRun,
    IconSvg
  },
  // 路由钩子-进入后
  beforeRouteEnter (to, from, next) {
    next(vm => {
      dashBoardPageCode = from.query.code
    })
  },
  props: [],
  data () {
    return {
      isCatalog: false, // 用来判断当前点击的节点是否是目录
      parentNode: { code: '' }, // 用来保存当前的父节点
      currentTreeNode: {}, // 保存当前点击的节点信息
      selectName: '',
      catalogList: [],
      currentNodeCode: '',
      dashBoardConfig: {},
      defaultExpand: [], // 默认展开的节点
      currentNode: {}, // 默认选中的节点
      flag: true,
      pageIcon: Icon.getNameList(), // 获取所有的svg
      defaultProps: { // el-tree的配置
        children: 'children',
        label: 'name'
      },
      showPage: false, // 显示页面
      sort: false, // 排序
      searchKey: '', // 关键词
      parentCode: '', // 当前选中的子节点的父节点的编码
      zNodes: [],
      ztreeObj: '',
      nodeData: {}, // 当前鼠标悬浮时的树节点
      activePage: {
        code: null,
        type: null,
        name: null
      }, // 当前选中的的树节点
      rightClickForm: {
        visible: false,
        org: {}
      },
      catalogVisible: false, // 文件夹的弹窗
      isAdd: true, // 判断当前目录是新增还是编辑
      catalogData: {
        id: '',
        code: '',
        type: 'catalog',
        name: '',
        parentCode: '',
        orderNum: 0
      }, // 文件夹数据
      // formConf,
      formInitInfo: {}, // 初始的数据
      pageDesignList: [], // 页面列表
      menuList: [{}],
      showHover: false,
      pageLoading: false,
      treeKey: new Date().getTime(),
      formRules: {
        name: [
          { required: true, message: '目录名称不能为空', trigger: 'blur' }
        ]
      },
      catalogDataList: [], // 存储遍历后的所有目录列表
      templateLoading: false
    }
  },
  computed: {
    pageDesignListHasLength () {
      return this.pageDesignList?.length > 0
    }
  },
  watch: {
    catalogVisible: {
      handler (value) {
        if (value) {
          this.openCascader(this.currentTreeNode)
        }
      }
    }
  },
  mounted () {
    this.getDataList()
    this.chooseCatalog()
  },
  methods: {
    // 关闭新增页面菜单的弹窗
    closePageMenuDialog () {
      this.$refs.pageMenuDialog.dialogVisible = false
    },
    // 点击新增打开页面菜单弹窗
    openPageMenuDialog () {
      this.$refs.pageMenuDialog.dialogVisible = true
    },
    parentCodeChange (code) {
      this.catalogData.parentCode = code
    },
    // 初始化新增目录时选择上级目录
    chooseCatalog () {
      this.parentNode = this.activePage?.type === 'catalog' ? this.activePage : { code: '0', name: '根目录' }
      this.catalogData.parentCode = this.parentNode.code
      this.selectName = this.parentNode.name
    },
    // 点击下拉选项中的树节点选择上级目录树节点
    handleNodeClick (node) {
      this.$set(this.catalogData, 'parentCode', node.code)
      this.selectName = node.name
      this.$refs.select.blur() // 点击后关闭下拉框，因为点击树形控件后select不会自动折叠
    },
    // 获取所有的目录
    openCascader (node) {
      const excludeCategory = node.type === 'catalog' && !this.isAdd ? node.code : undefined
      this.$dataRoomAxios.post('/bigScreen/category/tree', { searchKey: '', typeList: ['catalog'], excludeCategory, sort: false }).then(data => {
        const list = [{ name: '根目录', code: '', children: data }]
        this.catalogList = list
      }).catch(() => {
      })
    },
    // 默认选择第一项
    chooseFirstNode () {
      this.defaultExpand = []
      // 如果存在activePage则将activePage设置为高亮
      if (this.activePage && this.activePage.code) {
        this.currentNodeCode = this.activePage.code
        this.$nextTick(() => {
          if (this.$refs.tree) {
            this.$refs.tree.setCurrentKey(this.currentNodeCode)
          }
        })
        this.defaultExpand.push(this.currentNodeCode)
        this.currentNode = { ...this.activePage }
      } else {
        // 如果不存在则默认选择第一项（或者是第一个目录的第一项）
        if (this.pageDesignList?.length > 0 && !(this.pageDesignList?.length === 1 && this.pageDesignList[0].type === 'catalog' && (!this.pageDesignList[0].children || this.pageDesignList[0].children?.length === 0))) {
          const code = this.getDefaultNode(this.pageDesignList)
          if (code) {
            this.currentNodeCode = code
            this.activePage = { ...this.currentNode }
            this.defaultExpand.push(code)
            this.$nextTick(() => {
              this.$refs.tree.setCurrentKey(code)
            })
            this.isCatalog = false
          }
        } else {
          this.activePage = { code: '', name: '', type: '' }
        }
      }
    },
    // 设置默认节点
    getDefaultNode (nodeList) {
      for (const node of nodeList) {
        if (this.flag) {
          if (node.children && node.children.length > 0 && node.type === 'catalog') {
            return this.getDefaultNode(node.children)
          } else if (!(node.children && node.children?.length > 0) && node?.type === 'catalog') {
            continue
          } else {
            this.flag = false
            this.currentNode = node
            return node.code
          }
        } else {
          return this.currentNode.code
        }
      }
    },
    // 左侧菜单图标
    pageIconName (data, node) {
      if (data.type === 'bigScreen') {
        return this.pageIcon[2]
      } else {
        return node.expanded ? this.pageIcon[1] : this.pageIcon[0]
      }
    },
    // 顶部图标
    pageIconImg () {
      return this.pageIcon[2]
    },
    // 树节点查询
    filterClick () {
      this.$refs.tree.filter(this.searchKey)
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 预览
    gopagePreview (nodeData) {
      if (nodeData.code && nodeData.type === 'bigScreen') {
        const { href } = this.$router.resolve({
          path: window.BS_CONFIG?.routers?.previewUrl || '/big-screen/preview', // 这里写的是要跳转的路由地址
          query: {
            code: nodeData.code
          }
        })
        window.open(href, '_blank')
      } else if (!nodeData.code) {
        this.$message.warning('请先选择表单或页面')
      }
    },
    // 点击节点
    nodeClick (treeNode, nodeObj, val) {
      this.currentTreeNode = treeNode
      // 点击的节点为目录，则当前父节点为目录
      if (treeNode.type === 'catalog') {
        this.parentNode = cloneDeep(treeNode)
        this.isCatalog = true
      } else {
        this.isCatalog = false
        this.activePage = treeNode
        // 点击的节点非目录，则为当前节点的父节点
        this.parentNode = (!treeNode.parentCode || treeNode.parentCode === '0') ? { code: '0', name: '根目录' } : cloneDeep(nodeObj.parent.data)
      }
      this.catalogData.parentCode = this.parentNode.code
      this.selectName = this.parentNode.name
    },

    handleClose () {
      this.catalogVisible = false
      this.$refs.form.clearValidate()
    },
    // 获取页面的列表(获取，搜索，排序)
    getDataList () {
      this.pageLoading = true
      this.$dataRoomAxios.post('/bigScreen/category/tree', { searchKey: this.searchKey, sort: this.sort }).then(data => {
        this.pageDesignList = data
        // 如果有addModel这个参数，说明是从页面直接新增过来的，直接进入页面或者表单的填写状态
        if (this.$route.query.add) {
          this.$refs.AddDialog.init(undefined, this.parentNode, 'form')
        }
        if (dashBoardPageCode) {
          this.$nextTick(() => {
            const currentNode = this.findItemBycode(dashBoardPageCode, data)
            if (currentNode && currentNode.code) {
              this.activePage = currentNode
              if (this.$refs.tree) {
                this.$refs.tree.setCurrentKey(currentNode)
                this.defaultExpand.push(currentNode.code)
              }
            } else {
              this.chooseFirstNode()
            }
          })
        } else {
          this.chooseFirstNode()
        }
      }).catch(() => {
      }).finally(() => {
        this.pageLoading = false
      })
    },
    // 遍历树节点匹配code
    findItemBycode (code, list) {
      let node = list.find(item => item.code === code)
      if (node) {
        return node
      } else {
        for (let i = 0; i < list?.length; i++) {
          if (list[i].children instanceof Array && list[i].children?.length > 0) {
            node = this.findItemBycode(code, list[i].children)
            if (node) {
              return node
            }
          }
        }
        return null
      }
    },
    // 对页面进行操作
    handleDropdownClick (command, nodeData, node) {
      switch (command) {
        case 'copy':
          this.copyPege(nodeData, node)
          break
        case 'edit':
          this.toEdit(nodeData, node)
          break
        case 'delete':
          this.deletePageDesign(nodeData, node)
          break
        // case 'code':
        //   this.code(nodeData, node)
        //   break
      }
    },
    // code (nodeData, node) {
    //   axios({
    //     method: 'get',
    //     url: `${window.BS_CONFIG.baseUrl}/code/generation/adminPage/${nodeData.code}`,
    //     headers: {
    //     },
    //     // 通过URL传参，后端通过  @RequestParam 注解获取参数
    //     params: {},
    //     // 通过body传参，后端通过  @RequestBody 注解获取参数
    //     data: {},
    //     withCredentials: false,
    //     responseType: 'arraybuffer'
    //   }).then(res => {
    //     const fileUrl = window.URL.createObjectURL(new Blob([res.data]))
    //     // 创建超链接
    //     const fileLink = document.createElement('a')
    //     fileLink.href = fileUrl
    //     // 设置下载文件名
    //     let responseFileName = res.headers.filename
    //     // 解决中文乱码
    //     responseFileName = window.decodeURI(responseFileName)
    //     fileLink.setAttribute('download', responseFileName)
    //     document.body.appendChild(fileLink)
    //     // 模拟人工点击下载超链接
    //     fileLink.click()
    //     this.submitLoading = false
    //     // 释放资源
    //     document.body.removeChild(fileLink)
    //     window.URL.revokeObjectURL(fileUrl)
    //     this.step++
    //   }).catch((error) => {
    //     this.submitLoading = false
    //     console.error(error)
    //   })
    // },
    // 复制页面
    copyPege (nodeData, node) {
      this.$dataRoomAxios.post(`/${nodeData.type}/design/copy/${nodeData.code}`).then(() => {
        this.getDataList()
      })
    },
    // 新增大屏或新增页面，从空白新建
    addNew (parentNode, type) {
      this.$refs.AddDialog.init(undefined, this.parentNode, type)
      this.flag = true
    },
    // 大屏 dashboard从模版新建, 使用某个模版新建
    useIt (pageTemplateId, parentNode, type) {
      this.templateLoading = true
      const className = 'com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO'
      this.$dataRoomAxios.post(`/bigScreen/${type}/design/add/template`, {
        pageTemplateId,
        parentCode: parentNode.code,
        type,
        className
      }).then((code) => {
        const path = window.BS_CONFIG?.routers?.designUrl || '/big-screen/design'
        // const { href } = this.$router.resolve({
        //   path,
        //   query: {
        //     code: code
        //   }
        // })
        // window.open(href, '_self')
        this.$router.push({
          path,
          query: {
            code: code
          }
        })
      }).finally(() => {
        this.templateLoading = true
      })
    },
    // 新增页面/表单/目录
    addPageDesign (page) {
      const type = page.type
      const categories = page.categories
      if (type !== 'catalog') {
        // 如果是大屏，弹出选择模版页面
        if (['bigScreen'].includes(type)) {
          this.$refs.ChooseTemplateDialog.init(this.parentNode, type)
          return
        }
        this.$refs.AddDialog.init(undefined, this.parentNode, type, categories)
        this.flag = true
      } else {
        // 新增时初始化目录配置
        this.catalogData = {
          id: '',
          code: '',
          type: 'catalog',
          name: '',
          parentCode: this.parentNode.code,
          orderNum: 0
        }
        this.isAdd = true
        this.catalogVisible = true
      }
    },
    // 刷新页面
    reSearch (treeNode, id) {
      this.getDataList()
    },
    // 编辑
    toEdit (nodeData, nodeObj) {
      // 编辑目录
      if (nodeData.type === 'catalog') {
        this.catalogVisible = true
        this.catalogData.name = nodeData.name
        this.isAdd = false
        this.catalogData.id = nodeData.id
        this.catalogData.code = nodeData.code
        this.catalogData.orderNum = nodeData.orderNum
        this.parentNode = (!nodeData.parentCode || nodeData.parentCode === '0') ? { code: '0', name: '根目录' } : cloneDeep(nodeObj.parent.data)
        this.catalogData.parentCode = this.parentNode.code
        this.selectName = this.parentNode.name
      } else {
        this.$refs.AddDialog.init(nodeData, this.parentNode)
      }
    },
    // 点击新增/编辑目录
    addCatalog () {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        if (this.isAdd) {
          this.$dataRoomAxios.post('/bigScreen/category/add',
            {
              ...this.catalogData,
              id: '',
              code: ''
            }).then(data => {
            this.catalogVisible = false
            this.getDataList()
            this.flag = true
            // 关闭页面菜单的弹窗
            this.closePageMenuDialog()
          }).catch(() => {
          })
        } else {
          this.$dataRoomAxios.post('/bigScreen/category/update', { ...this.catalogData, excludeCategory: this.catalogData.code }).then(data => {
            this.catalogVisible = false
            this.getDataList()
          }).catch(() => {
          })
        }
      })
    },
    // 删除页面设计
    deletePageDesign (nodeData, node) {
      const type = getPageType(nodeData.type)// 由于类型与接口不统一需要转化一下
      const url = type === 'category' ? `/bigScreen/category/delete/${nodeData.code}` : `/bigScreen/${type}/design/delete/${nodeData.code}`// 接口地址
      this.$confirm('确定删除该页面设计？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(async () => {
        this.$dataRoomAxios.post(url).then(() => {
          this.$message({
            type: 'success',
            message: '删除成功'
          })
          this.flag = true
          this.activePage.code = ''
          this.chooseFirstNode()
          this.$refs.tree.remove(node)
          if (nodeData.type === 'catalog' && this.parentCode === nodeData.code) {
            this.parentCode = '0'
          }
        }).catch(() => {
          this.$message({
            type: 'error',
            message: '删除失败!'
          })
        })
      }).catch()
    },
    // 点击进入页面设计
    gopageDesign (nodeData) {
      const path = window.BS_CONFIG?.routers?.designUrl || '/big-screen/design'
      const openType = nodeData.type === 'report' ? '_blank' : '_self'
      const { href } = this.$router.resolve({
        path,
        query: {
          code: nodeData.code
        }
      })
      window.open(href, openType)
    }
  }
}
</script>

<style lang="scss" scoped>
  .page-type-cover {
    position: absolute;
    top: 0;
    left: 16px;
    color: #fff;
    background: #00000020;
    padding: 4px;
    font-size: 12px;
  }
  .page-manage-wrap{
    display: flex;
    .page-manage-menu{
      width: 260px;
      border-right: 2px solid #F5F7FA;
      .page-manage-menu-search{
        display: flex;
        align-items: center;
        padding: 10px 15px;
        box-sizing: border-box;
        justify-content: space-around;
        .input-with-select{
          margin-bottom: 0px;
        }
        .page-icon{
          font-size: 20px;
          margin-left: 10px;
          color: var(--bs-el-color-primary);
          &:hover{
            cursor: pointer;
          }
        }

      }
    }
    .page-manage-menu-list{
      width: 100%;
      overflow: auto;
      height: calc(100vh - 40px - 50px);
      .tree-node-name{
        width: 170px;
        display: inline-block;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .el-icon-document{
        font-size: 16px;
        padding: 5px 5px 0 0;
        color: #007afe;
      }
      .el-icon-notebook-1{
        font-size: 16px;
        padding: 5px 5px 0 0;
        color: #50D4FD;
      }
      .el-icon-folder{
        font-size: 16px;
        padding: 5px 5px 0 0;
        color: #6477FF;
      }
      .el-icon-folder-opened{
        font-size: 16px;
        padding: 5px 5px 0 0;
        color: #6477FF;
      }
    }
    .page-manage-content{
      width: calc(100vw - 260px);
      height: calc(100vh - 40px);
      .page-manage-content-top{
        height: 50px;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 20px;
        .page-name-icon{
          color: var(--bs-el-color-primary);
          padding-right: 10px;
        }
      }
      .page-manage-content-body-box{
        width: 100%;
        height: calc(100vh - 40px - 50px);
        background-color: #F5F7FA;
        .page-manage-content-body{
          height: 100%;
          background-color: #fff;
          position: relative;
          overflow: auto;
          overflow-x: hidden;
          ::v-deep .el-input__suffix-inner{
            /*pointer-events: none!important;*/
          }
          .preview-wrap{
            /*pointer-events: none;*/
            width: 100%;
            height: 100%;
            position: absolute;
            .admin-page-wrap {
              height: 100%;
              background: #F5F7FA;
            }
          }
          .empty-wrap{
            position: absolute;
            top:50%;
            left:50%;
            transform: translate(-50%,-50%);
            color: #AAAAAA;
          }
        }
      }
    }
  }
  .el-dropdown{
    cursor: pointer;
  }
  .catalog-dialog{
    ::v-deep .el-dialog__body{
      min-height: 80px;
    }
  }
  .el-icon-delete{
    color: #DF2A2A;
  }
  .el-dropdown-menu--mini .el-dropdown-menu__item i{
    padding-top: 6px;
  }
  .el-dropdown-menu--mini ::v-deep .el-dropdown-menu__item{
      display: flex;
      min-width: 100px!important;
      line-height: 36px;
    margin-bottom: 10px;
    .page-opt-list-icon{
      font-size: 16px;
      padding: 10px 5px 0 0;
      color: #007afe;
    }
    .page-dropdown-right{
      .page-name{
        font-size: 14px;
      }
      .page-desc{
        color: #878A8B;
        font-size: 12px;
        line-height: 20px;
      }
    }
  }
  .menu-span{
    width: 100%;
    display: flex;
    align-items: center;
    .el-dropdown{
      position: absolute;
      right: 10px;
    }
  }
  .disabled{
    pointer-events: auto!important;
    cursor: not-allowed!important;
  }
  .page-list-active{
    cursor: pointer;
    background-color: #F4F4F4;
  }
  .el-icon-rank{
    cursor: move;
  }
  .active-page-icon{
    margin-right: 5px;
  }
  .sort-icon {
    font-size: 20px;
    margin-left: 10px;
    color: var(--bs-el-color-primary);
    &:hover{
      cursor: pointer;
    }
  }
 /* 去除tree前面的小三角形*/
  .page-list-tree ::v-deep .el-tree-node__content > .el-tree-node__expand-icon{
    width: 20px;
    opacity: 0 !important;
  }
  /*选中树节点后*/
  .page-list-tree  ::v-deep .ztree li a.curSelectedNode span{
    color: var(--bs-el-color-primary)!important;
  }
  #settingDropdown{
    display: inline-block;
    float: right;
  }
  ::v-deep .el-tree-node{
    line-height: 40px;
    .el-tree-node__content{
      line-height: 40px;
      height: 100%;
    }
  }
  /*当前tree节点激活样式*/
 .page-list-tree ::v-deep .is-current>.el-tree-node__content{
    background: #007aff10;
    color: var(--bs-el-color-primary);
  }
  .page-list-tree ::v-deep .is-current>.el-tree-node__content::before{
    position: absolute;
    left: 0;
    border-left: 4px solid var(--bs-el-color-primary);
    content: "";
    height: 40px;
    width: 4px;
  }
  ::v-deep .el-icon-more{
    transform: rotate(90deg);
    color: #999999;
    font-size: 10px;
  }
  /*滚动条样式*/
  ::v-deep ::-webkit-scrollbar {
    width: 6px;
    border-radius: 4px;
    /*height: 4px;*/
  }
  ::v-deep ::-webkit-scrollbar-thumb {
    background: #dddddd !important;
    border-radius: 10px;
  }
  .padding {
    padding: 20px;
    background: #fff;
  }
  .catalog-cascader{
    width: 100%!important;
  }
  .delete-item{
    color:#ea0b30!important;
  }
</style>
