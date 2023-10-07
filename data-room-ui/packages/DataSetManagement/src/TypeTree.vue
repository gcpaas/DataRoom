<template>
  <div class="bs-theme-wrap">
    <div class="tree-box">
      <div class="ztree-filter-container filter-container">
        <el-input
          v-model="queryForm.searchKey"
          placeholder="请输入数据集分组"
          clearable
          class="ztree-input bs-el-input"
          @keyup.enter.native="reSearch()"
          @clear="reSearch()"
        />
        <el-button
          :loading="loading"
          type="primary"
          icon="el-icon-search"
          @click="reSearch()"
        >
          查询
        </el-button>
      </div>
      <br class="br">
      <el-tabs v-model="activeName">
        <el-tab-pane
          label="分组"
          name="group"
        />
        <el-tab-pane
          label="类型"
          name="type"
        />
      </el-tabs>
      <div
        v-show="activeName == 'group'"
        class="left"
      >
        <div class="ztree ztree-box">
          <el-scrollbar class="scroll">
            <el-empty v-show="noData" />
            <div
              v-if="!categoryData.length"
              style="text-align: center;"
            >
              <el-button
                type="text"
                icon="el-icon-plus"
                @click="addRootNode"
              >
                <span style="color: var(--bs-el-color-primary);">新增根节点</span>
              </el-button>
            </div>
            <ul
              v-show="!noData"
              id="datasetTypeTree"
              class="ztree"
            />
            <div
              v-loading="loading"
              class="loading"
              element-loading-text="正在加载数据"
              element-loading-spinner="el-icon-loading"
            />
          </el-scrollbar>
        </div>
        <div
          v-show="rightClickForm.visible"
          class="ztreeNodeMenu"
          @mouseleave="rightClickForm.visible = false"
          @mouseenter="rightClickForm.visible = true"
        >
          <div class="node-bottom-menu">
            <div class="triangle" />
            <ul>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.editOrg)"
              >
                <span slot="title">编辑</span>
              </li>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.deleteOrg)"
              >
                <span slot="title">删除</span>
              </li>
              <li @click="menuClick(editTypeConstant.addSiblingOrg)">
                <span slot="title">新增同级</span>
              </li>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.addChildOrg)"
              >
                <span slot="title">新增子级</span>
              </li>
            </ul>
          </div>
          <div class="node-top-menu">
            <ul>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.addChildOrg)"
              >
                <span slot="title">新增子级</span>
              </li>
              <li @click="menuClick(editTypeConstant.addSiblingOrg)">
                <span slot="title">新增同级</span>
              </li>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.deleteOrg)"
              >
                <span slot="title">删除</span>
              </li>
              <li
                v-if="!isBoth"
                @click="menuClick(editTypeConstant.editOrg)"
              >
                <span slot="title">编辑</span>
              </li>
            </ul>
            <div class="triangle" />
          </div>
        </div>
      </div>
      <div
        v-show="activeName == 'type'"
        class="left"
      >
        <div class="left-tab-box">
          <ul>
            <li
              v-for="(_type,index) in datasetTypeList"
              :key="index"
              :class="{ 'tab-style': true, 'tab-active': _type.datasetType == curType }"
              @click="getTypeData(_type.datasetType)"
            >
              <span>{{ _type.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <CategroyEditForm
        v-if="editFormVisible"
        ref="categroyEditForm"
        :app-code="appCode"
        @addOrUpdateNode="addOrUpdateNode"
      />
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import $ from 'jquery'
import 'ztree/js/jquery.ztree.core'
import 'ztree/js/jquery.ztree.exedit'
import 'ztree/js/jquery.ztree.exhide'
import 'data-room-ui/assets/style/zTree/metroStyle.css'
import 'data-room-ui/assets/style/zTree/zTree.scss'
import 'data-room-ui/assets/style/zTree/zTreeSelect.scss'
import { getCategoryTree, categoryRemove, categoryDele } from 'data-room-ui/js/utils/datasetConfigService'
import CategroyEditForm from './CategroyEditForm.vue'
export default {
  name: 'DatasetTypeTreeIndex',
  components: {
    CategroyEditForm
  },
  props: {
    datasetTypeList: {
      type: Array,
      default: () => (['original', 'custom', 'storedProcedure', 'json', 'script'])
    },
    appCode: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      activeName: 'group',
      categoryData: [],
      curType: '-1',
      noData: false,
      loading: false,
      rightTableIsTransition: '',
      flatData: [],
      queryForm: {
        searchKey: ''
      },
      ztreeObj: '',
      nodeData: '',
      rightClickForm: {
        visible: false,
        org: {}
      },
      editTypeConstant: {
        deleteOrg: 'deleteOrg',
        editOrg: 'editOrg',
        addChildOrg: 'addChildOrg',
        addSiblingOrg: 'addSiblingOrg'
      },
      editFormVisible: false,
      ztreeSetting: {
        view: {
          dblClickExpand: false,
          showTitle: false,
          addHoverDom: (treeId, treeNode) => {
            const nodeObj = $('#' + treeNode.tId + '_a')
            nodeObj.css({ 'background-color': '#f6f7fb', cursor: 'pointer' })
          },
          removeHoverDom: (treeId, treeNode) => {
            const nodeObj = $('#' + treeNode.tId + '_a')
            nodeObj.css({ 'background-color': 'rgba(0,0,0,0)' })
          },
          addDiyDom: this.addDiyDom
        },
        callback: {
          onClick: this.getNodeData,
          onExpand: this.expandNode
        }
      },
      isBoth: false // 是否为全部
    }
  },
  computed: { },
  mounted () {
    this.initLazyDatasetTypeTree()
  },

  methods: {
    // 新增根节点
    addRootNode () {
      this.editFormVisible = true
      this.$nextTick(() => {
        this.$refs.categroyEditForm.tableName = 'r_dataset'
        this.$refs.categroyEditForm.dialogFormVisible = true
        this.$refs.categroyEditForm.init({ parentId: 0 }, true)
        this.$refs.categroyEditForm.radio = 0
        this.$refs.categroyEditForm.title = '新增分组'
      })
    },
    addDiyDom (treeId, treeNode) {
      if (this.activeName === 'type') return
      if (treeNode.parentNode && treeNode.parentNode.id !== 2) return
      const aObj = $('#' + treeNode.tId + '_a')
      const editStr = "<span  id='diyBtn_" + treeNode.id + "' class='treeAddNode'>⋮</span>"
      aObj.after(editStr)
      const btn = $('#diyBtn_' + treeNode.id)
      if (btn) {
        const _this = this
        btn.bind('mouseenter', function () {
          if (treeNode.name === '全部' && treeNode.id === '') {
            _this.isBoth = true
          } else {
            _this.isBoth = false
          }
          _this.nodeData = treeNode
          _this.rightClickForm.org = treeNode
          _this.rightClickForm.visible = true
          let hieght = 0
          const nodeElObj = document.getElementById(treeNode.tId + '_a').getBoundingClientRect()
          const clientHeight = document.documentElement.clientHeight
          const clientY = nodeElObj.top + 34
          if (clientHeight - clientY < 200) {
            hieght = clientY - 200
            document.querySelector('.node-bottom-menu').style.display = 'none'
            const menu = document.querySelector('.node-top-menu')
            /* 菜单定位基于鼠标点击位置 */
            menu.style.display = ''
            menu.style.left = nodeElObj.right - 92 + 'px'
            menu.style.top = hieght + 20 + 25 + 'px'
            menu.style.position = 'fixed' // 为新创建的DIV指定绝对定位
            menu.style.width = 110 + 'px'
          } else {
            hieght = clientY
            document.querySelector('.node-top-menu').style.display = 'none'
            const menu = document.querySelector('.node-bottom-menu')
            /* 菜单定位基于鼠标点击位置 */
            menu.style.display = ''
            menu.style.left = nodeElObj.right - 92 + 'px'
            menu.style.top = hieght - 8 + 'px'
            menu.style.position = 'fixed' // 为新创建的DIV指定绝对定位
            menu.style.width = 110 + 'px'
          }
        })
        btn.bind('mouseout', function () {
          _this.rightClickForm.visible = false
        })
      }
    },
    // 初始化树节点
    initLazyDatasetTypeTree () {
      this.loading = true
      getCategoryTree({ type: 'dataset', moduleCode: this.appCode }).then((res) => {
        this.categoryData = res.map((item) => {
          return { isParent: item.hasChildren, ...item }
        })
        this.categoryData.unshift({ name: '全部', id: '', parentId: '0' })
        this.ztreeObj = $.fn.zTree.init($('#datasetTypeTree'), this.ztreeSetting, this.categoryData)
        this.$emit('reCategory')
      }).then((e) => {
        this.loading = false
      }).catch((e) => {
        this.loading = false
      })
    },
    // 节点展开
    expandNode (event, tree, nodeData) {
      if (nodeData.children) {
        nodeData.children.forEach((item) => {
          this.ztreeObj.showNode(item)
        })
      } else {
        this.loading = true
      }
    },
    // 未知
    expandedNodes () {
      if (this.rightTableIsTransition === 1) {
        this.$emit('expandedNodes', 1)
      } else {
        this.$emit('expandedNodes', this.flatTreeData(this.ztreeObj.getNodes()).length)
      }
      this.flatData = []
    },
    // filter方法
    filterNode (node) {
      const selfMatch = node.name.includes(this.queryForm.searchKey)
      const childMatch = false
      // 过滤非匹配的值
      return !(this.recursion(node, childMatch) || selfMatch)
    },
    // 子节点匹配 - 递归
    recursion (node, childMatch) {
      if (node.isParent) {
        for (let i = 0; i < node.children.length; i++) {
          if (node.children[i].name.includes(this.queryForm.searchKey)) {
            childMatch = true
            return childMatch
          } else {
            childMatch = this.recursion(node.children[i], childMatch)
          }
        }
      }
      return childMatch
    },
    // 查询
    reSearch () {
      this.activeName = 'group'
      if (this.queryForm.searchKey) {
        const treeObj = $.fn.zTree.getZTreeObj('datasetTypeTree')
        const nodes = treeObj.getNodesByParam('isHidden', true)
        treeObj.showNodes(nodes)
        const hiddenNodes = treeObj.getNodesByFilter(this.filterNode)
        treeObj.hideNodes(hiddenNodes)
        treeObj.expandAll(true)
      } else {
        this.initLazyDatasetTypeTree()
      }
    },
    // 节点点击事件
    getNodeData (treeId, treeNode, nodeData, clickFlag) {
      this.curType = '-1'
      this.$emit('nodeClick', nodeData, this.activeName)
    },
    // 类型点击事件
    getTypeData (datasetType) {
      this.curType = datasetType
      this.ztreeObj.cancelSelectedNode()
      this.$emit('nodeClick', datasetType, this.activeName)
    },
    // 更多事件
    menuClick (editType) {
      // 删除节点
      if (editType === this.editTypeConstant.deleteOrg) {
        categoryDele(this.rightClickForm.org.id).then((res) => {
          if (res == 0) {
            this.deleteOrg(this.rightClickForm.org)
          } else {
            this.$message.error('当前节点下存在已定义数据集，无法删除')
          }
        })
        return
      }
      // 编辑节点
      this.editFormVisible = true
      if (editType === this.editTypeConstant.editOrg) {
        this.$nextTick(() => {
          this.$refs.categroyEditForm.type = 'dataset'
          this.$refs.categroyEditForm.dialogFormVisible = true
          this.$refs.categroyEditForm.init(this.rightClickForm.org, false)
          this.$refs.categroyEditForm.title = '编辑分组'
        })
        return
      }
      // 新增同级节点
      if (editType === this.editTypeConstant.addSiblingOrg) {
        this.$nextTick(() => {
          this.$refs.categroyEditForm.type = 'dataset'
          this.$refs.categroyEditForm.dialogFormVisible = true
          this.$refs.categroyEditForm.init(this.rightClickForm.org, true, editType)
          this.$refs.categroyEditForm.radio = 0
          this.$refs.categroyEditForm.title = '新增分组'
        })
        return
      }
      // 新增子节点
      if (editType === this.editTypeConstant.addChildOrg) {
        this.$nextTick(() => {
          this.$refs.categroyEditForm.type = 'dataset'
          this.$refs.categroyEditForm.dialogFormVisible = true
          this.$refs.categroyEditForm.init(this.rightClickForm.org, true, editType)
          this.$refs.categroyEditForm.radio = 1
          this.$refs.categroyEditForm.title = '新增分组'
        })
      }
    },
    flatTreeData (data) {
      data.forEach(item => {
        this.flatData.push(item)
        if (item.children) {
          this.flatTreeData(item.children)
        }
      })
      return this.flatData
    },
    // 删除分类
    deleteOrg (org) {
      this.$confirm('删除数据集分组，确定进行删除操作?', '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          customClass: 'bs-el-message-box'
        }
      ).then(() => {
        if (!org.id) {
          return
        }
        categoryRemove(org.id).then((data) => {
          this.$message.success('操作成功')
          // this.ztreeObj.removeNode(org)
          // this.initLazyOrgTree()
          const removeNode = this.ztreeObj.getNodeByParam('id', org.id, null)
          this.ztreeObj.removeNode(removeNode)
          this.redrawTree()
          // 刷新右侧表格
          this.$emit('refreshData', org)
        })
      })
    },
    // 刷新右侧表格
    refreshData (cbObj) {
      // 刷新右侧表格
      this.$emit('refreshData', cbObj)
    },
    // 新增或修改节点
    addOrUpdateNode (params, isAdd) {
      if (!isAdd) {
        const editNode = this.ztreeObj.getNodeByParam('id', params.id, null)
        editNode.name = params.name
        this.ztreeObj.editName(editNode)
        this.ztreeObj.setEditable(false)
      } else {
        // 新增
        const parentNode = params.parentId === 0 ? null : this.ztreeObj.getNodeByParam('id', params.parentId, null)
        this.ztreeObj.addNodes(parentNode, params)
      }
      this.redrawTree()
    },
    // 重新绘制树
    redrawTree () {
      // 重新绘制ztree
      getCategoryTree({ type: 'dataset', moduleCode: this.appCode }).then((res) => {
        this.categoryData = res.map((item) => {
          return { isParent: item.hasChildren, ...item }
        })
        this.categoryData.unshift({ name: '全部', id: '', parentId: '0' })
      }).then((e) => {
        this.loading = false
      }).catch((e) => {
        this.loading = false
      })
    }
  }
}
</script>
<style lang="scss" scoped>
@import '../../assets/style/bsTheme.scss';

::v-deep .el-tabs {
  .el-tabs__header {
    margin: 0;

    .el-tabs__nav {
      width: 100%;

      .el-tabs__item {
        color: var(--bs-el-text);
        width: 50%;
        text-align: center;
      }

      .el-tabs__active-bar {
        display: none !important;
      }

      .el-tabs__item.is-active {
        color: var(--bs-el-color-primary) !important;
        border-bottom-color: var(--bs-el-border) !important;
      }
    }
  }
}
 ::v-deep .ztree {
    span {
      color: var(--bs-el-text);
    }

    li:hover {
      background: transparent !important;
      background-color: transparent !important;
    }

    .curSelectedNode {
      background: var(--bs-el-background-3) !important;
      background-color: var(--bs-el-background-3) !important;
    }

    a:hover {
      background: var(--bs-el-background-3) !important;
      background-color: var(--bs-el-background-3) !important;
    }
  }
::v-deep .el-tabs__nav-wrap::after {
  display: none !important;
}

.left-tab-box ul li {
  font-size: 12px;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  height: 34px;
  line-height: 40px;
  cursor: pointer;
  padding-left: 20px;
  margin: 2px 0;

  &:hover,
  &.tab-active {
    background-color: #f2f7fe;
  }

  &.tab-active::before {
    content: "";
    height: 34px;
    line-height: 40px;
    position: absolute;
    left: 0;
    border-left: 4px solid var(--bs-el-color-primary);
  }
}

.ztree-input {
  margin-right: 10px !important;
}

.ztree-box {
  height: 100%;
  overflow: hidden;
}

.el-textarea__inner {
  color: var(--bs-el-text);
  background-color: var(--bs-el-background-1) !important;
}
</style>
