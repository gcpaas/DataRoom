<script setup lang="ts">
import {defineAsyncComponent, onMounted, ref} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {ArrowDown, Delete, Document, Edit, Folder, MoreFilled, Plus, Refresh, Search} from '@element-plus/icons-vue'
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

// 页面加载时初始化
onMounted(() => {
  loadTree()
  loadDataSourceList()
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
        <el-dropdown trigger="click" @command="
          (command: string) => {
            if (command === 'addFolder') handleAddFolder()
            else if (command === 'addJson') handleAddDataset('json')
            else if (command === 'addHttp') handleAddDataset('http')
            else if (command === 'addRelational') handleAddDataset('relational')
          }
        ">
          <el-button type="primary" :icon="Plus">
            新增
            <el-icon class="el-icon--right">
              <ArrowDown/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="addFolder">
                <el-icon>
                  <Folder/>
                </el-icon>
                <span>新增目录</span>
              </el-dropdown-item>
              <el-dropdown-item command="addJson">
                <span>{{ datasetTypeMap.json.icon }}</span>
                <span style="margin-left: 8px">新增JSON数据集</span>
              </el-dropdown-item>
              <el-dropdown-item command="addHttp">
                <span>{{ datasetTypeMap.http.icon }}</span>
                <span style="margin-left: 8px">新增HTTP数据集</span>
              </el-dropdown-item>
              <el-dropdown-item command="addRelational">
                <span>{{ datasetTypeMap.relational.icon }}</span>
                <span style="margin-left: 8px">新增关系型数据集</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <el-scrollbar class="tree-content">
        <el-tree
          ref="treeRef"
          :data="treeData"
          node-key="code"
          :props="{ label: 'label', children: 'children' }"
          :expand-on-click-node="false"
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
                    if (command === 'addFolder') handleAddFolder(data)
                    else if (command === 'addJson') handleAddDataset('json', data)
                    else if (command === 'addHttp') handleAddDataset('http', data)
                    else if (command === 'addRelational') handleAddDataset('relational', data)
                    else if (command === 'edit') handleEditNode(data)
                    else if (command === 'delete') handleDeleteNode(data)
                  }
                "
              >
                <el-icon class="more-icon" @click.stop>
                  <MoreFilled/>
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <template v-if="data.datasetType === 'directory'">
                      <el-dropdown-item command="addFolder">
                        <el-icon>
                          <Folder/>
                        </el-icon>
                        <span>新增目录</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="addJson">
                        <span>{{ datasetTypeMap.json.icon }}</span>
                        <span style="margin-left: 8px">新增JSON数据集</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="addHttp">
                        <span>{{ datasetTypeMap.http.icon }}</span>
                        <span style="margin-left: 8px">新增HTTP数据集</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="addRelational">
                        <span>{{ datasetTypeMap.relational.icon }}</span>
                        <span style="margin-left: 8px">新增关系型数据集</span>
                      </el-dropdown-item>
                    </template>
                    <el-dropdown-item command="edit">
                      <el-icon>
                        <Edit/>
                      </el-icon>
                      <span>编辑</span>
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
            <el-tab-pane label="字段说明" name="outputParams"/>
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
  </div>
</template>

<style scoped lang="scss">
.dr-dataset {
  display: flex;
  height: 100%;
  gap: 16px;
  overflow: hidden;

  .dataset-left {
    width: 300px;
    background: #fff;
    border: 1px solid var(--dr-border);
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;

    .tree-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 12px 16px;
      flex-shrink: 0;

      .search-input {
        flex: 1;

        .search-icon {
          color: var(--el-text-color-secondary);
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
          border-radius: 4px;

          &:hover {
            background-color: var(--el-fill-color-light);

            .more-icon {
              opacity: 1;
            }
          }
        }
      }

      .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;

        .node-content {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 1;
          overflow: hidden;

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
          transition: opacity 0.3s;
          color: var(--el-text-color-regular);

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .dataset-right {
    flex: 1;
    background: #fff;
    border: 1px solid var(--dr-border);
    border-radius: 4px;
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

      .dataset-tabs {
        flex: 1;

        :deep(.el-tabs__header) {
          margin-bottom: 0;
          border-bottom: none;
        }

        :deep(.el-tabs__nav-wrap)::after {
          display: none;
        }
      }

      .right-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
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
    }
  }

  // 对话框内的滚动条
  :deep(.el-dialog) {
    .el-scrollbar__bar {
      z-index: 10;
    }
  }
}
</style>
