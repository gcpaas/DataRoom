<template>
  <div class="bs-theme-wrap">
    <div class="tree-box">
      <div class="dataroom-dataset-type-tree-filter-container filter-container">
        <el-input
          v-model="queryForm.searchKey"
          class="dataroom-dataset-type-tree-input bs-el-input"
          clearable
          :placeholder="activeName === 'tag' ? '请输入标签名称' : '请输入数据集分组'"
          @clear="reSearch()"
          @keyup.enter.native="reSearch()"
        />
        <el-button
          :loading="loading"
          icon="el-icon-search"
          type="primary"
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
        <el-tab-pane
          label="标签"
          name="tag"
        />
      </el-tabs>
      <div
        v-show="activeName === 'group'"
        class="left"
      >
        <div class="dataroom-dataset-type-tree dataroom-dataset-type-el-tree-box">
          <el-scrollbar
            :key="updateKey"
            class="scroll"
          >
            <!-- <el-empty v-show="noData" /> -->
            <div v-show="noData">
              <span>
                暂无数据
              </span>
            </div>
            <div
              v-if="!categoryData.length"
              style="text-align: center"
            >
              <el-button
                icon="el-icon-plus"
                type="text"
                @click="addRootNode"
              >
                <span style="color: var(--bs-el-color-primary)">新增根节点</span>
              </el-button>
            </div>
            <el-tree
              v-if="categoryData.length"
              ref="datasetTypeTree"
              :data="categoryData"
              :expand-on-click-node="false"
              node-key="id"
              :current-node-key="categoryData[0].id"
              :props="{
                label: 'name',
                id:'id',
                children: 'children',
              }"
              :filter-node-method="filterNode"
              @node-click="clickNode"
            >
              <span
                slot-scope="{ node, data }"
                class="custom-tree-node"
              >
                <span>{{ data.name }}</span>
                <el-popover
                  trigger="hover"
                  placement="bottom"
                  popper-class="tree-popover"
                  @show="openNodeMenu(node, data)"
                >
                  <el-menu active-text-color="#000000">
                    <el-menu-item
                      v-if="!isBoth"
                      @click="menuClick(editTypeConstant.editOrg)"
                    >
                      <span slot="title">编辑</span>
                    </el-menu-item>
                    <el-menu-item
                      v-if="!isBoth"
                      @click="menuClick(editTypeConstant.deleteOrg)"
                    >
                      <span slot="title">删除</span>
                    </el-menu-item>
                    <el-menu-item
                      @click="menuClick(editTypeConstant.addSiblingOrg)"
                    >
                      <span slot="title">新增同级</span>
                    </el-menu-item>
                    <el-menu-item
                      v-if="!isBoth"
                      @click="menuClick(editTypeConstant.addChildOrg)"
                    >
                      <span
                        slot="title"
                        class="menu-icon"
                      > 新增子级 </span>
                    </el-menu-item>
                  </el-menu>
                  <i
                    slot="reference"
                    class="el-icon-more"
                  />
                </el-popover>
              </span>
            </el-tree>
            <div
              v-loading="loading"
              class="loading"
              element-loading-spinner="el-icon-loading"
              element-loading-text="正在加载数据"
            />
          </el-scrollbar>
        </div>
        <div
          class="add-catalog-box"
          @click="menuClick(editTypeConstant.addSiblingOrg)"
        >
          <i class="el-icon-plus" />
          <div>新建分组</div>
        </div>
      </div>
      <div
        v-show="activeName == 'type'"
        class="left"
      >
        <div class="left-tab-box">
          <ul>
            <li
              v-for="(_type, index) in datasetTypeList"
              :key="index"
              :class="{
                'tab-style': true,
                'tab-active':
                  _type.datasetType === curType ||
                  (!curType && !_type.componentName),
              }"
              @click="getTypeData(_type.datasetType)"
            >
              <span>{{ _type.name }}</span>
            </li>
          </ul>
        </div>
      </div>
      <div
        v-show="activeName === 'tag'"
        class="left"
      >
        <div class="tag-box">
          <el-scrollbar
            v-if="labelList.length>0"
            ref="list"
            :key="updateKey"
            class="scroll"
          >
            <ul class="tag-list">
              <li
                v-for="item in labelList"
                :key="item.id"
                :class="{
                  'tab-active':tagActiveList.includes(item.id)
                }"
                @click="clicTag(item)"
              >
                {{ item.labelName }}
                <el-popover
                  v-if="item.id"
                  trigger="hover"
                  placement="bottom"
                  popper-class="tree-popover"
                >
                  <el-menu active-text-color="#000000">
                    <el-menu-item @click="editTag(item)">
                      <span slot="title">编辑</span>
                    </el-menu-item>
                    <el-menu-item @click="delTag(item)">
                      <span slot="title">删除</span>
                    </el-menu-item>
                  </el-menu>
                  <i
                    slot="reference"
                    class="el-icon-more"
                  />
                </el-popover>
              </li>
            </ul>
          </el-scrollbar>
        </div>
        <div
          class="add-catalog-box"
          @click="addTag()"
        >
          <i class="el-icon-plus" />
          <div>新建标签</div>
        </div>
      </div>
      <CategroyEditForm
        v-if="editFormVisible"
        ref="categroyEditForm"
        :app-code="appCode"
        :tree-data="categoryData"
        @addOrUpdateNode="addOrUpdateNode"
      />
      <label-edit
        ref="labelEditRef"
        @afterEdit="init()"
      />
    </div>
  </div>
</template>

<script>
import LabelEdit from '@gcpaas/data-room-ui/packages/dataSet/components/LabelConfigEdit.vue'
import { labelList, removeLabel } from '@gcpaas/data-room-ui/packages/assets/js/api/LabelConfigService.js'
import CategroyEditForm from '@gcpaas/data-room-ui/packages/dataSet/components/CategroyEditForm.vue'
import { categoryDele, categoryRemove, getCategoryTree } from '@gcpaas/data-room-ui/packages/assets/js/api/datasetConfigService.js'

export default {
  name: 'DatasetTypeTreeIndex',
  components: {
    CategroyEditForm,
    LabelEdit
  },
  props: {
    datasetTypeList: {
      type: Array,
      default: () => [
        'original',
        'custom',
        'storedProcedure',
        'json',
        'script'
      ]
    },
    appCode: {
      type: String,
      default: ''
    }
  },
  data: function () {
    return {
      tagActiveList: [],
      count: 0,
      updateKey: Math.random(),
      isPopoverShow: false,
      activeName: 'group',
      // 标签列表
      labelList: [],
      // 列表分页
      tabPage: {
        currentPage: 1,
        pageSize: 20
      },
      categoryData: [{ name: '全部', id: '', parentId: '0' }],
      curType: null,
      noData: false,
      loading: false,
      flatData: [],
      queryForm: {
        searchKey: ''
      },
      nodeData: '',
      rightClickForm: {
        visible: true,
        org: {}
      },
      editTypeConstant: {
        deleteOrg: 'deleteOrg',
        editOrg: 'editOrg',
        addChildOrg: 'addChildOrg',
        addSiblingOrg: 'addSiblingOrg'
      },
      editFormVisible: false,
      isBoth: false // 是否为全部
    }
  },
  computed: {},
  watch: {
    activeName (val) {
      this.tagActiveList = []
      if (val === 'group') {
        this.curType = null
        this.$emit('nodeClick', { name: '全部', id: '' }, 'group')
        const treeRef = this.$refs.datasetTypeTree
        if (treeRef) {
          const currentNode = treeRef.getCurrentNode()
          if (currentNode && currentNode.id !== '') {
            currentNode.isCurrent = false
            treeRef.setCurrentKey('')
          }
        }
        this.setDefaultCurrentNode(true)
      } else if (val === 'type') {
        this.curType = ''
        this.$emit('nodeClick', '-1', 'type')
      } else if (val === 'tag') {
        this.tagActiveList = ['']
        this.$emit('nodeClick', [''], 'tag')
        this.handleScroll()
      }
      this.updateKey = Math.random()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    loadMoreData () {
      this.tabPage.currentPage++
      const params = {
        current: this.tabPage.currentPage,
        size: 30,
        labelName: '',
        labelType: ''
      }
      labelList(params).then((res) => {
        this.labelList = this.labelList.concat(res.list)
      })
    },
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
    // 初始化树节点
    init () {
      this.loading = true
      this.tabPage.currentPage = 1
      const list = this.$refs.list
      if (list) {
        // 滚动条回到顶部
        list.$el.querySelector('.el-scrollbar__wrap').scrollTop = 0
      }
      // 获取分组数据
      this.categoryData = [{ name: '全部', id: '', parentId: '0' }]
      getCategoryTree({ type: 'dataset', moduleCode: this.appCode })
        .then((res) => {
          this.loading = false
          res.forEach((item) => {
            this.categoryData.push({ isParent: item.hasChildren,  ...item })
          })
          this.$emit('reCategory')
        })
        .catch((e) => {
          this.loading = false
        })
        // 获取标签数据
      const params = {
        current: this.tabPage.currentPage,
        size: 30,
        labelName: '',
        labelType: ''
      }
      labelList(params).then((res) => {
        this.updateKey = Math.random()
        this.labelList = res.list
        // 加入最上面一条全部数据
        this.labelList.unshift({ labelName: '全部', id: '' })
        // 根据 res.totalCount 计算执行 loadMoreData 方法的次数
        this.count = Math.ceil(res.totalCount / 30) + 1
        this.handleScroll()
      })
    },
    // filter方法
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 查询
    reSearch () {
      this.activeName = 'group'
      if (this.queryForm.searchKey) {
        this.$refs.datasetTypeTree.filter(this.queryForm.searchKey)
      } else {
        this.init()
      }
    },
    openNodeMenu (node, data) {
      this.rightClickForm.org = data
      this.isPopoverShow = node.isCurrent
      if (data.name === '全部' && data.id === '') {
        this.isBoth = true
      } else {
        this.isBoth = false
      }
    },
    // 节点点击事件
    getNodeData (treeId, treeNode, nodeData, clickFlag) {
      this.curType = null
      this.$emit('nodeClick', nodeData, this.activeName)
    },
    // 类型点击事件
    getTypeData (datasetType) {
      this.curType = datasetType
      this.$emit('nodeClick', datasetType, this.activeName)
    },
    // 更多事件
    menuClick (editType) {
      // 删除节点
      if (editType === this.editTypeConstant.deleteOrg) {
        categoryDele(this.rightClickForm.org.id).then((res) => {
          if (res === 0) {
            this.deleteOrg(this.rightClickForm.org)
          } else {
            this.$message.error('当前节点下存在已定义数据集，无法删除')
          }
        })
        return
      }
      if (window.SITE_CONFIG.dataRoom.datasetBtn.disabled) {
        this.$message.error(window.SITE_CONFIG.dataRoom.datasetBtn.message)
        return
      }
      // 编辑节点
      this.editFormVisible = true
      if (editType === this.editTypeConstant.editOrg) {
        this.$nextTick(() => {
          this.$refs.categroyEditForm.type = 'dataset'
          this.$refs.categroyEditForm.dialogFormVisible = true
          this.$refs.categroyEditForm.init(this.rightClickForm.org, false, editType)
          this.$refs.categroyEditForm.title = '编辑分组'
        })
        return
      }
      // 新增同级节点
      if (editType === this.editTypeConstant.addSiblingOrg) {
        this.$nextTick(() => {
          this.$refs.categroyEditForm.type = 'dataset'
          this.$refs.categroyEditForm.dialogFormVisible = true
          this.$refs.categroyEditForm.init(
            this.rightClickForm.org,
            true,
            editType
          )
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
          this.$refs.categroyEditForm.init(
            this.rightClickForm.org,
            true,
            editType
          )
          this.$refs.categroyEditForm.radio = 1
          this.$refs.categroyEditForm.title = '新增分组'
        })
      }
    },
    flatTreeData (data) {
      data.forEach((item) => {
        this.flatData.push(item)
        if (item.children) {
          this.flatTreeData(item.children)
        }
      })
      return this.flatData
    },
    // 删除分类
    deleteOrg (org) {
      this.$confirm('删除数据集分组，确定进行删除操作?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        if (!org.id) {
          return
        }
        categoryRemove(org.id).then((data) => {
          this.$message.success('操作成功')
          this.$refs.datasetTypeTree.remove(org.id)
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
      let parentNode = this.$refs.datasetTypeTree.getNode(params.parentId)
      if (!isAdd) {
        // 编辑=》先删除，再新增
        this.$refs.datasetTypeTree.remove(params.id)
      }
      // 新增
      if(parentNode) {
        // 新增子节点
        this.$refs.datasetTypeTree.append(params, parentNode)
      } else {
        // 新增根节点
        this.categoryData.push(params)
      }
    },
    clickNode (nodeData) {
      this.curType = '-1'
      this.rightClickForm.org = nodeData
      this.$emit('nodeClick', nodeData, 'group')
      this.setDefaultCurrentNode(nodeData.id === '')
    },
    // 点击标签
    clicTag (item) {
      const tagSet = new Set(this.tagActiveList)
      if (item.id === '') {
        // 如果点击的是全部，则清空其他选中的标签, 加入全部标签
        tagSet.clear()
        tagSet.add('')
      } else {
        // 如果点击的是其他标签，则清空全部标签
        tagSet.delete('')
        if (tagSet.has(item.id)) {
          // 如果 item.id 已经存在，则删除
          tagSet.delete(item.id)
        } else {
          // 如果 item.id 不存在，则添加
          tagSet.add(item.id)
        }
      }
      this.tagActiveList = Array.from(tagSet)

      this.$emit('nodeClick', this.tagActiveList, 'tag')
    },
    // 新增标签
    addTag () {
      this.$refs.labelEditRef.init()
    },
    // 编辑标签
    editTag (item) {
      this.$refs.labelEditRef.init(item)
    },
    // 删除标签
    delTag (item) {
      this.$confirm('确定删除当前标签吗?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      }).then(() => {
        removeLabel(item.id).then(() => {
          this.$message.success('删除成功')
        }).then(() => {
          this.init()
        })
      }).catch(() => { })
    },
    // eltree 默认高亮第一个
    setDefaultCurrentNode (bol) {
      const tree = this.$refs.datasetTypeTree
      if (tree && tree.store && tree.store.root.childNodes.length > 0) {
        const firstNode = tree.store.root.childNodes[0]
        if (firstNode) {
          this.$set(firstNode, 'isCurrent', bol)
        }
      }
    },
    // 监听标签分组的滚动
    handleScroll () {
      this.$nextTick(() => {
        const list = this.$refs.list
        const scrollWrap = list.$el.querySelector('.el-scrollbar__wrap')
        const scrollHandler = () => {
          const scrollTop = scrollWrap.scrollTop
          const scrollHeight = scrollWrap.scrollHeight
          const clientHeight = scrollWrap.clientHeight
          if (scrollTop + clientHeight >= scrollHeight) {
            if (this.tabPage.currentPage < this.count) {
              this.loadMoreData()
            }
          }
        }

        const removeScrollListener = () => {
          scrollWrap.removeEventListener('scroll', scrollHandler)
        }

        removeScrollListener() // 移除之前的监听

        scrollWrap.addEventListener('scroll', scrollHandler)
        this.$once('hook:beforeDestroy', removeScrollListener)
      })
    }
  }
}
</script>

<style lang="scss">
.tree-popover {
  width: 110px;
  padding: 0;
  min-width: 0;
  .el-menu {
    border-radius: 4px;
    padding: 10px 0 5px 0;
    border-right: 0px solid;
    .el-menu-item {
      height: 27.5px;
      text-align: left;
      line-height: 17.5px;
      padding: 5px 10px 5px 10px !important;
      &:hover {
        color: #409eff;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
@import "../assets/css/typeTree.scss";
@import "../assets/css/typeTreeSelect.scss";
.el-icon-more {
  color: #000000;
  transform: rotate(90deg) !important;
}
::v-deep .el-tabs {
  .el-tabs__header {
    margin: 0;

    .el-tabs__nav {
      width: 100%;

      .el-tabs__item {
        // width: 50%;
        text-align: center;
      }

      .el-tabs__active-bar {
        display: none !important;
      }

      .el-tabs__item {
        color: #000000;
      }
      .el-tabs__item.is-active {
        color: #409eff;
      }
    }
  }
}
::v-deep .el-tree-node__expand-icon.is-leaf {
  width: 12px;
  &:before {
    display: none;
  }
}
::v-deep .el-tabs__nav-wrap::after {
  display: none !important;
}

.left-tab-box ul {
  margin: 0;
  padding-left: 0px;
  li {
    font-size: 12px;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-align: center;
    -webkit-align-items: center;
    -ms-flex-align: center;
    align-items: center;
    height: 36px;
    line-height: 40px;
    cursor: pointer;
    padding-left: 24px;
    &:hover,
    &.tab-active {
      color: #409eff;
      background-color: #f2f7fe;
    }

    &.tab-active::before {
      content: "";
      height: 36px;
      line-height: 40px;
      position: absolute;
      left: 0;
      border-left: 4px solid #409eff;
    }
  }
}
.dataroom-dataset-type-tree-input {
  margin-right: 10px !important;
}

.dataroom-dataset-type-el-tree-box {
  overflow: hidden;
  height: calc(100vh - 316px);
  ::v-deep .el-scrollbar__wrap {
    overflow-x: unset;
  }
}

.el-textarea__inner {
  // color: var(--bs-el-text);
  background-color: var(--bs-el-background-1) !important;
}

// el-tree样式
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 20px;
}
::v-deep .el-tree {
  .el-tree-node {
    .el-tree-node__content {
      height: 36px;
    }

    .custom-tree-node {
      overflow: hidden;
      position: relative;
      font-size: 12px;
      padding-right: 30px;
      span {
        color: #000000;
        // 溢出出现滚动条
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .el-popover__reference-wrapper{
        bottom: 0;
        right: 15px;
        position: absolute;
      }
    }
  }
  .is-current {
    .el-tree-node__content {
      background-color: rgba(64, 158, 255, 0.1);
      span{
        color: #409eff;
      }
      // &::before {
      //   content: "";
      //   height: 100%;
      //   border-left: 4px solid #409eff;
      //   position: relative;
      //   left: 0;
      // }
    }
  }
}
.add-catalog-box {
  font-size: 14px;
  color: #76838F;
  padding: 10px 0;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 10px;
  margin: 0 8px;
  &:hover {
    background-color: rgba(0, 122, 255, 0.063);
    cursor: pointer;
    color: #36474f;
  }
  .el-icon-plus {
    padding: 0 5px;
  }
}

// el-tag 样式调整
::v-deep .el-tabs__nav{
  display: flex;
  justify-content: space-around;
}
// 标签列表
.tag-box{
  overflow: hidden;
  height: calc(100vh - 316px);
  .scroll{
    height: 100%;
    width: 100%;
  }
}
.tag-list{
  // max-height: 69vh;
  // overflow-x: hidden;
  // overflow-y: auto;
  padding: 0;
  margin: 0;
  li{
  display: flex;
    height: 36px;
    font-size: 12px;
    line-height: 36px;
    list-style: none;
    cursor: pointer;
    padding-left: 24px;
    position: relative;
    &:hover{
      background-color: #f5f7fa;
    }
    .el-icon-more{
      top: 50%;
      right: 15px;
      position: absolute;
      transform: translateY(-50%) rotate(90deg) !important;
    }
  }
  .tab-active{
    color: #409eff;
    background-color: #f2f7fe;
    &.tab-active::before {
      content: "";
      height: 36px;
      line-height: 40px;
      position: absolute;
      left: 0;
      border-left: 4px solid #409eff;
    }
  }
}
// 隐藏横向滚动条
::v-deep .el-scrollbar__wrap{
  overflow-x: hidden;
}
</style>
