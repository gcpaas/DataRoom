<script setup lang="ts">
import {computed, defineAsyncComponent, nextTick, onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, Document, Edit, Folder, MoreFilled, Plus, Rank, Refresh, Search} from '@element-plus/icons-vue'
import {datasetApi, type DatasetEntity, type DatasetTreeNode} from './api'
import {dataSourceApi} from '../dataSource/api'

// 定义 props
const props = defineProps<{
  selectable?: boolean // 是否为选择模式
}>()

// 定义 emits
const emit = defineEmits<{
  'update:selectedDataset': [dataset: DatasetEntity]
}>()

const loading = ref(false)
const treeRef = ref()
const treeData = ref<DatasetTreeNode[]>([])
const allDatasetList = ref<DatasetEntity[]>([])
const searchKeyword = ref('')
const selectedNode = ref<DatasetEntity | null>(null)
const activeTab = ref('preview')
const paramsTab = ref('input')

// 数据预览相关
const previewLoading = ref(false)
const previewData = ref<any[]>([])
const previewColumns = ref<string[]>([])

// 编辑对话框
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentDataset = ref<DatasetEntity>({
  name: '',
  code: '',
  datasetType: 'json',
  parentCode: 'root'
})
const editorRef = ref()

// 数据源列表
const dataSourceList = ref<any[]>([])

// 类型选择对话框
const typeSelectVisible = ref(false)
const typeSelectParentNode = ref<DatasetTreeNode | undefined>()

// 新增类型选项
const addTypeOptions = [
  {
    key: 'directory',
    name: '目录',
    description: '用于分类管理数据集'
  },
  {
    key: 'json',
    name: 'JSON数据集',
    description: '直接编写JSON静态数据'
  },
  {
    key: 'http',
    name: 'HTTP数据集',
    description: '通过HTTP接口获取数据'
  },
  {
    key: 'relational',
    name: '关系型数据集',
    description: '通过SQL查询关系型数据库'
  }
]

// 移动对话框
const moveDialogVisible = ref(false)
const moveTargetNode = ref<DatasetTreeNode | null>(null) // 要移动的节点
const moveTargetParentCode = ref<string>('root') // 移动目标父级code

// 构建移动树数据：只显示目录，并排除选中节点及其子节点
const moveTreeData = computed(() => {
  if (!moveTargetNode.value) return []
  const movingCode = moveTargetNode.value.code
  // 收集需要排除的节点code（选中节点及其所有子节点）
  const excludeCodes = new Set<string>()
  const collectChildCodes = (code: string) => {
    excludeCodes.add(code)
    allDatasetList.value
      .filter(item => item.parentCode === code)
      .forEach(item => {
        if (item.code) collectChildCodes(item.code)
      })
  }
  if (movingCode) collectChildCodes(movingCode)

  // 只保留目录类型且不在排除列表中的节点
  const directories = allDatasetList.value.filter(
    item => item.datasetType === 'directory' && !excludeCodes.has(item.code!)
  )
  return buildTree(directories, 'root')
})

// 数据集类型映射
const datasetTypeMap = {
  json: {
    name: 'JSON',
    icon: '📄',
    component: defineAsyncComponent(() => import('./components/JsonEditor.vue'))
  },
  http: {
    name: 'HTTP',
    icon: '🌐',
    component: defineAsyncComponent(() => import('./components/HttpEditor.vue'))
  },
  relational: {
    name: '关系型数据库',
    icon: '🗄️',
    component: defineAsyncComponent(() => import('./components/RelationalEditor.vue'))
  }
} as const

/**
 * 加载树数据
 */
const loadTree = async () => {
  loading.value = true
  try {
    const res = await datasetApi.list({})
    allDatasetList.value = res || []
    filterTree()
  } catch (error) {
    console.error('加载数据集列表失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 过滤树数据
 */
const filterTree = () => {
  if (!searchKeyword.value.trim()) {
    // 如果没有搜索关键字，显示完整树
    treeData.value = buildTree(allDatasetList.value, 'root')
  } else {
    // 如果有搜索关键字，过滤数据
    const keyword = searchKeyword.value.trim().toLowerCase()
    const filteredList = allDatasetList.value.filter(item =>
      item.name.toLowerCase().includes(keyword)
    )
    // 构建过滤后的树，包含匹配项及其所有父级
    const matchedCodes = new Set(filteredList.map(item => item.code))
    const needParentCodes = new Set<string>()

    filteredList.forEach(item => {
      let parentCode = item.parentCode
      while (parentCode && parentCode !== 'root') {
        needParentCodes.add(parentCode)
        const parent = allDatasetList.value.find(p => p.code === parentCode)
        parentCode = parent?.parentCode
      }
    })

    const finalList = allDatasetList.value.filter(item =>
      matchedCodes.has(item.code) || needParentCodes.has(item.code!)
    )
    treeData.value = buildTree(finalList, 'root')
  }
}

/**
 * 构建树形结构
 */
const buildTree = (list: DatasetEntity[], parentCode: string): DatasetTreeNode[] => {
  return list
    .filter((item) => (item.parentCode || 'root') === parentCode)
    .map((item) => {
      const node: DatasetTreeNode = {
        id: item.id,
        label: item.name,
        code: item.code,
        datasetType: item.datasetType,
        parentCode: item.parentCode,
        children: item.datasetType === 'directory' ? buildTree(list, item.code!) : undefined
      }
      return node
    })
}

/**
 * 树节点点击
 */
const handleNodeClick = async (data: DatasetTreeNode, node: any) => {
  if (data.datasetType === 'directory') {
    // 目录节点：切换展开/折叠状态
    node.expanded = !node.expanded
    return
  }
  // 手动设置高亮（因为 @click.stop 阻止了 el-tree 默认行为）
  treeRef.value?.setCurrentKey(data.code)
  try {
    const detail = await datasetApi.detail(data.code!)
    selectedNode.value = detail
    activeTab.value = 'preview'
    // 如果是选择模式，发送选中事件
    if (props.selectable) {
      emit('update:selectedDataset', detail)
    }
    // 自动执行一次数据预览
    handleRefresh()
  } catch (error) {
    console.error('加载数据集详情失败:', error)
  }
}

/**
 * 处理搜索
 */
const handleSearch = () => {
  filterTree()
}

/**
 * 清空搜索
 */
const handleClearSearch = () => {
  searchKeyword.value = ''
  filterTree()
}

/**
 * 打开类型选择对话框
 */
const handleOpenTypeSelect = (node?: DatasetTreeNode) => {
  typeSelectParentNode.value = node
  typeSelectVisible.value = true
}

/**
 * 选择新增类型
 */
const handleTypeSelect = (type: string) => {
  typeSelectVisible.value = false
  if (type === 'directory') {
    handleAddFolder(typeSelectParentNode.value)
  } else {
    handleAddDataset(type as 'json' | 'http' | 'relational', typeSelectParentNode.value)
  }
}

/**
 * 新增目录
 */
const handleAddFolder = (node?: DatasetTreeNode) => {
  ElMessageBox.prompt('请输入目录名称', '新增目录', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  })
    .then(async ({value}) => {
      try {
        await datasetApi.insert({
          name: value,
          datasetType: 'directory',
          parentCode: node?.code || 'root'
        } as DatasetEntity)
        ElMessage.success('新增成功')
        loadTree()
      } catch (error) {
        console.error('新增失败:', error)
      }
    })
    .catch(() => {
    })
}

/**
 * 新增数据集
 */
const handleAddDataset = (datasetType: 'json' | 'http' | 'relational', node?: DatasetTreeNode) => {
  dialogTitle.value = `新增${datasetTypeMap[datasetType].name}数据集`
  currentDataset.value = {
    name: '',
    datasetType,
    parentCode: node?.code || 'root',
    inputList: [],
    outputList: [],
    dataset:
      datasetType === 'json'
        ? {datasetType: 'json', json: ''}
        : datasetType === 'http'
          ? {datasetType: 'http', url: '', method: 'GET', headerList: [], body: '', respJsonPath: ''}
          : {datasetType: 'relational', sql: ''}
  }
  dialogVisible.value = true
}

/**
 * 编辑节点
 */
const handleEditNode = async (node: DatasetTreeNode) => {
  if (node.datasetType === 'directory') {
    // 编辑目录名称
    ElMessageBox.prompt('请输入目录名称', '编辑目录', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空',
      inputValue: node.label
    })
      .then(async ({value}) => {
        try {
          const detail = await datasetApi.detail(node.code!)
          await datasetApi.update({
            ...detail,
            name: value
          })
          ElMessage.success('更新成功')
          loadTree()
        } catch (error) {
          console.error('更新失败:', error)
        }
      })
      .catch(() => {
      })
  } else {
    // 编辑数据集
    handleEdit()
  }
}

/**
 * 删除节点
 */
const handleDeleteNode = (node: DatasetTreeNode) => {
  ElMessageBox.confirm(`确定要删除${node.label}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await datasetApi.delete(node.code!)
        ElMessage.success('删除成功')
        if (selectedNode.value?.code === node.code) {
          selectedNode.value = null
        }
        loadTree()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {
    })
}

/**
 * 打开移动对话框
 */
const handleMoveNode = (node: DatasetTreeNode) => {
  moveTargetNode.value = node
  moveTargetParentCode.value = node.parentCode || 'root'
  moveDialogVisible.value = true
}

/**
 * 移动树节点点击
 */
const handleMoveTreeNodeClick = (data: DatasetTreeNode) => {
  moveTargetParentCode.value = data.code || 'root'
}

/**
 * 确认移动
 */
const handleConfirmMove = async () => {
  if (!moveTargetNode.value?.code) return
  try {
    const detail = await datasetApi.detail(moveTargetNode.value.code)
    await datasetApi.update({
      ...detail,
      parentCode: moveTargetParentCode.value
    })
    ElMessage.success('移动成功')
    moveDialogVisible.value = false
    loadTree()
  } catch (error) {
    console.error('移动失败:', error)
  }
}

/**
 * 编辑数据集
 */
const handleEdit = async () => {
  if (!selectedNode.value) {
    return
  }
  try {
    const detail = await datasetApi.detail(selectedNode.value.code!)
    const typeKey = detail.datasetType as keyof typeof datasetTypeMap
    dialogTitle.value = `编辑${datasetTypeMap[typeKey].name}数据集`
    currentDataset.value = detail
    dialogVisible.value = true
  } catch (error) {
    console.error('加载数据集详情失败:', error)
  }
}

/**
 * 保存数据集
 */
const handleSave = async () => {
  try {
    await editorRef.value?.validate()
    const data = editorRef.value?.getData()
    if (!data) {
      throw new Error('获取数据失败')
    }

    if (currentDataset.value.code) {
      await datasetApi.update(data)
      ElMessage.success('更新成功')
      // 如果当前选中的是该数据集，刷新详情
      if (selectedNode.value?.code === data.code) {
        const detail = await datasetApi.detail(data.code!)
        selectedNode.value = detail
      }
    } else {
      await datasetApi.insert(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    loadTree()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

/**
 * 关闭对话框
 */
const handleCloseDialog = () => {
  dialogVisible.value = false
}

/**
 * 刷新数据预览
 */
const handleRefresh = async () => {
  if (!selectedNode.value?.code) {
    return
  }
  previewLoading.value = true
  try {
    const res = await datasetApi.run({
      datasetCode: selectedNode.value.code
    })
    // 处理返回的数据
    const data = res.data
    if (Array.isArray(data)) {
      previewData.value = data
      // 从数据中提取列名
      if (previewData.value.length > 0) {
        previewColumns.value = Object.keys(previewData.value[0])
      } else {
        previewColumns.value = []
      }
    } else {
      // 如果不是数组，尝试转换为数组
      previewData.value = data ? [data] : []
      if (previewData.value.length > 0) {
        previewColumns.value = Object.keys(previewData.value[0])
      } else {
        previewColumns.value = []
      }
    }
  } catch (error) {
    console.error('执行数据集失败:', error)
    ElMessage.error('执行数据集失败')
  } finally {
    previewLoading.value = false
  }
}

/**
 * 加载数据源列表
 */
const loadDataSourceList = async () => {
  try {
    const res = await dataSourceApi.list({})
    dataSourceList.value = res || []
  } catch (error) {
    console.error('加载数据源列表失败:', error)
  }
}

/**
 * 自动展开第一个节点并激活第一个数据集
 * 深度优先遍历树，展开目录节点，找到第一个非目录数据集后激活
 */
const autoActivateFirstDataset = async () => {
  await nextTick()
  if (!treeRef.value || treeData.value.length === 0) return

  // 深度优先搜索：在给定节点列表中找到第一个数据集
  const findFirstDataset = (nodes: DatasetTreeNode[]): DatasetTreeNode | null => {
    for (const node of nodes) {
      if (node.datasetType !== 'directory') {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findFirstDataset(node.children)
        if (found) return found
      }
    }
    return null
  }

  // 逐个根节点尝试查找
  for (const rootNode of treeData.value) {
    let targetDataset: DatasetTreeNode | null = null

    if (rootNode.datasetType !== 'directory') {
      // 根节点本身就是数据集
      targetDataset = rootNode
    } else if (rootNode.children && rootNode.children.length > 0) {
      // 展开根目录节点
      const elNode = treeRef.value.getNode(rootNode.code)
      if (elNode) elNode.expanded = true
      // 在子节点中查找第一个数据集
      targetDataset = findFirstDataset(rootNode.children)
    }

    if (targetDataset) {
      // 展开所有祖先节点
      const expandAncestors = (code: string) => {
        const item = allDatasetList.value.find(d => d.code === code)
        if (item?.parentCode && item.parentCode !== 'root') {
          expandAncestors(item.parentCode)
          const parentElNode = treeRef.value.getNode(item.parentCode)
          if (parentElNode) parentElNode.expanded = true
        }
      }
      expandAncestors(targetDataset.code!)

      // 设置当前节点高亮
      treeRef.value.setCurrentKey(targetDataset.code)

      // 模拟点击激活该数据集
      const elNode = treeRef.value.getNode(targetDataset.code)
      if (elNode) {
        handleNodeClick(targetDataset, elNode)
      }
      return
    }
  }
}

// 页面加载时初始化
onMounted(async () => {
  await loadTree()
  loadDataSourceList()
  autoActivateFirstDataset()
})

// 测试按钮loading状态
const testLoading = ref(false)
const testAndSaveLoading = ref(false)

/**
 * 仅测试
 */
const handleTest = async () => {
  try {
    testLoading.value = true
    await editorRef.value?.test()
  } finally {
    testLoading.value = false
  }
}

/**
 * 测试并保存
 */
const handleTestAndSave = async () => {
  try {
    testAndSaveLoading.value = true
    await editorRef.value?.testAndSave()
  } finally {
    testAndSaveLoading.value = false
  }
}
</script>

<template>
  <div class="dr-dataset">
    <div class="dataset-left">
      <div class="tree-header">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索数据集"
          clearable
          @keyup.enter="handleSearch"
          @clear="handleClearSearch"
          class="search-input"
        >
          <template #prefix>
            <el-icon class="search-icon">
              <Search/>
            </el-icon>
          </template>
        </el-input>
        <el-button type="primary" :icon="Plus" @click="handleOpenTypeSelect()">
            新增
          </el-button>
      </div>
      <el-scrollbar class="tree-content">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="code"
          :props="{ label: 'label', children: 'children' }"
          :expand-on-click-node="false"
          highlight-current
          v-loading="loading"
        >
          <template #default="{ node, data }">
            <div class="custom-tree-node" @click.stop="handleNodeClick(data, node)">

              <div class="node-content">
                <el-icon v-if="data.datasetType === 'directory'">
                  <Folder/>
                </el-icon>
                <el-icon v-else>
                  <Document/>
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
              </div>
              <el-dropdown
                trigger="click"
                @command="
                  (command: string) => {
                    if (command === 'add') handleOpenTypeSelect(data)
                    else if (command === 'edit') handleEditNode(data)
                    else if (command === 'move') handleMoveNode(data)
                    else if (command === 'delete') handleDeleteNode(data)
                  }
                "
              >
                <el-icon class="more-icon" @click.stop>
                  <MoreFilled/>
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item v-if="data.datasetType === 'directory'" command="add">
                      <el-icon>
                        <Plus/>
                      </el-icon>
                      <span>新增</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="edit">
                      <el-icon>
                        <Edit/>
                      </el-icon>
                      <span>编辑</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="move">
                      <el-icon>
                        <Rank/>
                      </el-icon>
                      <span>移动至</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" divided>
                      <el-icon>
                        <Delete/>
                      </el-icon>
                      <span>删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>

    <div class="dataset-right">
      <template v-if="selectedNode">
        <div class="right-header">
          <el-tabs v-model="activeTab" class="dataset-tabs">
            <el-tab-pane label="数据预览" name="preview"/>
            <el-tab-pane v-if="selectedNode.datasetType !== 'json'" label="入参预览" name="inputParams"/>
            <el-tab-pane label="字段列表" name="outputParams"/>
          </el-tabs>
          <div class="right-actions">
            <el-button link :icon="Edit" @click="handleEdit">编辑</el-button>
            <el-button link :icon="Refresh" @click="handleRefresh">刷新</el-button>
          </div>
        </div>
        <div class="right-content">
          <el-scrollbar>
            <!-- 数据预览 -->
            <div v-show="activeTab === 'preview'" class="preview-container" v-loading="previewLoading">
              <el-table :data="previewData" border style="width: 100%">
                <el-table-column
                  v-for="col in previewColumns"
                  :key="col"
                  :prop="col"
                  :label="col"
                  min-width="120"
                />
              </el-table>
              <el-empty v-if="!previewLoading && previewData.length === 0" description="暂无数据"/>
            </div>

            <!-- 入参预览 -->
            <div v-show="activeTab === 'inputParams'" class="params-container">
              <el-table :data="selectedNode.inputList || []" border style="width: 100%">
                <el-table-column prop="name" label="参数名" min-width="120"/>
                <el-table-column prop="type" label="类型" min-width="100"/>
                <el-table-column prop="required" label="必填" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.required ? 'danger' : 'info'" size="small">
                      {{ row.required ? '是' : '否' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="defaultVal" label="默认值" min-width="120"/>
                <el-table-column prop="desc" label="描述" min-width="150"/>
              </el-table>
              <el-empty
                v-if="!selectedNode.inputList || selectedNode.inputList.length === 0"
                description="暂无入参"
                :image-size="100"
              />
            </div>

            <!-- 出参预览 -->
            <div v-show="activeTab === 'outputParams'" class="params-container">
              <el-table :data="selectedNode.outputList || []" border style="width: 100%">
                <el-table-column prop="name" label="参数名" min-width="120"/>
                <el-table-column prop="type" label="类型" min-width="100"/>
                <el-table-column prop="desc" label="描述" min-width="150"/>
              </el-table>
              <el-empty
                v-if="!selectedNode.outputList || selectedNode.outputList.length === 0"
                description="暂无出参"
                :image-size="100"
              />
            </div>
          </el-scrollbar>
        </div>
      </template>
      <el-empty v-else description="请选择数据集" :image-size="200"/>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="800px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <el-scrollbar max-height="60vh">
        <component
          :is="datasetTypeMap[currentDataset.datasetType as keyof typeof datasetTypeMap].component"
          v-if="currentDataset.datasetType !== 'directory'"
          v-model="currentDataset"
          :data-source-list="dataSourceList"
          :on-save="handleSave"
          :on-close="handleCloseDialog"
          ref="editorRef"
        />
      </el-scrollbar>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button @click="handleTest" :loading="testLoading">仅测试</el-button>
          <el-button type="primary" @click="handleTestAndSave" :loading="testAndSaveLoading">测试并保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 类型选择对话框 -->
    <el-dialog
      v-model="typeSelectVisible"
      title="选择新增类型"
      width="560px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="type-select-cards">
        <div
          v-for="item in addTypeOptions"
          :key="item.key"
          class="type-card"
          @click="handleTypeSelect(item.key)"
        >
          <div class="type-card-icon">
            <el-icon v-if="item.key === 'directory'"><Folder/></el-icon>
            <el-icon v-else-if="item.key === 'json'"><Document/></el-icon>
            <el-icon v-else-if="item.key === 'http'"><Document/></el-icon>
            <el-icon v-else><Document/></el-icon>
          </div>
          <div class="type-card-info">
            <div class="type-card-name">{{ item.name }}</div>
            <div class="type-card-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 移动对话框 -->
    <el-dialog
      v-model="moveDialogVisible"
      title="移动至"
      width="480px"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <div class="move-dialog-content">
        <div class="move-hint">请选择目标目录：</div>
        <div class="move-tree-wrap">
          <div
            class="move-tree-root"
            :class="{ active: moveTargetParentCode === 'root' }"
            @click="moveTargetParentCode = 'root'"
          >
            <el-icon><Folder/></el-icon>
            <span>根目录</span>
          </div>
          <el-tree
            :data="moveTreeData"
            node-key="code"
            :props="{ label: 'label', children: 'children' }"
            :expand-on-click-node="false"
            default-expand-all
            highlight-current
            @node-click="handleMoveTreeNodeClick"
          >
            <template #default="{ data: nodeData }">
              <div class="move-tree-node">
                <el-icon><Folder/></el-icon>
                <span>{{ nodeData.label }}</span>
              </div>
            </template>
          </el-tree>
        </div>
      </div>
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmMove">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dr-dataset {
  display: flex;
  height: 100%;
  gap: 16px;
  overflow: hidden;
  padding: 2px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .dataset-left {
    width: 300px;
    background: #fff;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;

    .tree-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 16px;
      flex-shrink: 0;
      border-bottom: 1px solid #e5e6eb;

      .search-input {
        flex: 1;

        :deep(.el-input__wrapper) {
          border-radius: 6px;
          box-shadow: 0 0 0 1px #e5e6eb inset;

          &:focus-within {
            box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
          }
        }

        .search-icon {
          color: #86909c;
        }
      }

      :deep(.el-button--primary) {
        background-color: #3478f6;
        border-color: #3478f6;
        border-radius: 6px;
        font-weight: 500;

        &:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      }
    }

    .tree-content {
      flex: 1;
      padding: 8px;
      overflow: hidden;

      :deep(.el-scrollbar__wrap) {
        max-height: 100%;
      }

      :deep(.el-scrollbar__bar) {
        z-index: 10 !important;
      }

      :deep(.el-tree) {
        .el-tree-node__content {
          height: 36px;
          border-radius: 6px;

          &:hover {
            background-color: #f7f8fa;

            .more-icon {
              opacity: 1;
            }
          }
        }

        .el-tree-node.is-current > .el-tree-node__content {
          background-color: rgba(52, 120, 246, 0.08);
        }
      }

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        font-weight: 400;
        color: #1d2129;
        padding-right: 8px;

        .node-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          overflow: hidden;

          .el-icon {
            color: #4e5969;
          }

          .node-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .more-icon {
          font-size: 16px;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.2s;
          color: #4e5969;

          &:hover {
            color: #3478f6;
          }
        }
      }
    }
  }

  .dataset-right {
    flex: 1;
    background: #fff;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;

    .right-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      flex-shrink: 0;
      border-bottom: 1px solid #e5e6eb;

      .dataset-tabs {
        flex: 1;

        :deep(.el-tabs__header) {
          margin-bottom: 0;
          border-bottom: none;
        }

        :deep(.el-tabs__nav-wrap)::after {
          display: none;
        }

        :deep(.el-tabs__item) {
          font-size: 14px;
          font-weight: 500;
          color: #86909c;

          &.is-active {
            color: #1d2129;
          }
        }

        :deep(.el-tabs__active-bar) {
          background-color: #3478f6;
          height: 2px;
        }
      }

      .right-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;

        :deep(.el-button) {
          font-weight: 500;
          color: #4e5969;

          &:hover {
            color: #3478f6;
          }
        }
      }
    }

    .right-content {
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      :deep(.el-scrollbar) {
        height: 100%;
      }

      :deep(.el-scrollbar__bar) {
        z-index: 10;
      }

      .preview-container,
      .params-container {
        padding: 16px;
      }

      :deep(.el-table) {
        font-size: 13px;
        color: #1d2129;
        font-feature-settings: 'tnum';

        th {
          font-weight: 500;
          color: #4e5969;
          background-color: #f7f8fa;
        }
      }
    }
  }

  // 对话框内的滚动条
  :deep(.el-dialog) {
    border-radius: 8px;

    .el-dialog__header {
      font-weight: 600;
      color: #1d2129;
    }

    .el-dialog__body .el-scrollbar__view {
      padding: 2px;
    }

    .el-scrollbar__bar {
      z-index: 10;
    }

    .dialog-footer {
      .el-button {
        border-radius: 6px;
        font-weight: 500;
      }

      .el-button--primary {
        background-color: #3478f6;
        border-color: #3478f6;

        &:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      }

      .el-button--default {
        box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
        border: none;

        &:hover {
          box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04);
        }
      }
    }
  }
}

// 类型选择卡片样式
.type-select-cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 8px 2px;

  .type-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background: #fff;

    &:hover {
      box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04);
      background-color: #f7f8fa;
    }

    .type-card-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background-color: rgba(52, 120, 246, 0.08);
      color: #3478f6;
      font-size: 20px;
      flex-shrink: 0;
    }

    .type-card-info {
      flex: 1;
      min-width: 0;

      .type-card-name {
        font-size: 14px;
        font-weight: 500;
        color: #1d2129;
        margin-bottom: 4px;
      }

      .type-card-desc {
        font-size: 12px;
        color: #86909c;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 移动对话框样式
.move-dialog-content {
  padding: 2px;

  .move-hint {
    font-size: 14px;
    font-weight: 400;
    color: #4e5969;
    margin-bottom: 12px;
  }

  .move-tree-wrap {
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    border-radius: 8px;
    padding: 8px;
    max-height: 360px;
    overflow-y: auto;

    .move-tree-root {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 400;
      margin-bottom: 4px;
      color: #1d2129;

      &:hover {
        background-color: #f7f8fa;
      }

      &.active {
        background-color: rgba(52, 120, 246, 0.08);
        color: #3478f6;
        font-weight: 500;
      }
    }

    .move-tree-node {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #1d2129;
    }
  }
}
</style>
