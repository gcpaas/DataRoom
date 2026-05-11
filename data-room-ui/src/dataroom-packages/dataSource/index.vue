<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, MoreFilled, Edit, Delete, View } from '@element-plus/icons-vue'
import { dataSourceApi, type DataSourceEntity, type ExcelDataSource, type ExcelColumn } from './api'
import { datasetApi } from '../dataset/api'
import { buildExcelUpdatePayload } from './excelSave'
import ExcelViewData from './components/ExcelViewData.vue'
import mysqlImg from './assets/image/MySQL占位符.png'
import postgresqlImg from './assets/image/PostgreSQL占位符.png'
import oracleImg from './assets/image/Oracle占位符.png'
import dorisImg from './assets/image/Doris占位符.png'
import sqlserverImg from './assets/image/SqlServer占位符.png'
import excelImg from './assets/image/Excel占位符.png'

const searchName = ref('')
const dataSourceList = ref<DataSourceEntity[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
const typeSelectDialogVisible = ref(false)
const currentDataSource = ref<DataSourceEntity>({
  name: '',
  dataSourceType: 'mysql',
  dataSource: {
    dataSourceType: 'mysql',
    driverName: 'com.mysql.cj.jdbc.Driver',
    username: '',
    password: '',
    url: ''
  }
})
const editorRef = ref()

// Excel查看数据对话框状态
const viewDataVisible = ref(false)
const viewDataCode = ref('')
const viewDataName = ref('')
const viewDataColumns = ref<ExcelColumn[]>([])

// 数据源类型映射
const dataSourceTypeMap = {
  mysql: {
    name: 'MySQL',
    icon: '🐬',
    image: mysqlImg,
    description: '开源关系型数据库，广泛应用',
    component: defineAsyncComponent(() => import('./components/MysqlEditor.vue'))
  },
  postgresql: {
    name: 'PostgreSQL',
    icon: '🐘',
    image: postgresqlImg,
    description: '功能强大的开源对象关系数据库',
    component: defineAsyncComponent(() => import('./components/PostgresqlEditor.vue'))
  },
  oracle: {
    name: 'Oracle',
    icon: '🔷',
    image: oracleImg,
    description: '企业级商业关系型数据库',
    component: defineAsyncComponent(() => import('./components/OracleEditor.vue'))
  },
  doris: {
    name: 'Doris',
    icon: '🔶',
    image: dorisImg,
    description: 'Apache Doris实时分析数据仓库',
    component: defineAsyncComponent(() => import('./components/DorisEditor.vue'))
  },
  sqlserver: {
    name: 'SqlServer',
    icon: '🔷',
    image: sqlserverImg,
    description: 'Microsoft SQL Server关系型数据库',
    component: defineAsyncComponent(() => import('./components/SqlServerEditor.vue'))
  },
  excel: {
    name: 'Excel',
    icon: '📊',
    image: excelImg,
    description: '支持 xlsx 和 csv 格式文件',
    component: defineAsyncComponent(() => import('./components/ExcelEditor.vue'))
  }
} as const

type DataSourceTypeKey = keyof typeof dataSourceTypeMap

/**
 * 查询数据源列表
 */
const getDataSourceList = async () => {
  loading.value = true
  try {
    const params: { name?: string } = {}
    if (searchName.value) {
      params.name = searchName.value
    }
    const res = await dataSourceApi.list(params)
    dataSourceList.value = res || []
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

/**
 * 打开数据源类型选择对话框
 */
const openTypeSelectDialog = () => {
  typeSelectDialogVisible.value = true
}

/**
 * 选择数据源类型并新增
 */
const handleSelectType = (dataSourceType: DataSourceTypeKey) => {
  typeSelectDialogVisible.value = false
  handleAdd(dataSourceType)
}

/**
 * 新增数据源
 */
const handleAdd = (dataSourceType: DataSourceTypeKey) => {
  dialogTitle.value = `新增${dataSourceTypeMap[dataSourceType].name}数据源`

  if (dataSourceType === 'excel') {
    currentDataSource.value = {
      name: '',
      dataSourceType: 'excel',
      dataSource: {
        dataSourceType: 'excel',
        tableName: '',
        columns: [],
        originalFileName: '',
        rowCount: 0,
        importMode: 'overwrite'
      } as ExcelDataSource
    }
  } else {
    // 根据数据源类型设置默认驱动名称
    let defaultDriverName = ''
    if (dataSourceType === 'mysql') {
      defaultDriverName = 'com.mysql.cj.jdbc.Driver'
    } else if (dataSourceType === 'postgresql') {
      defaultDriverName = 'org.postgresql.Driver'
    } else if (dataSourceType === 'oracle') {
      defaultDriverName = 'oracle.jdbc.driver.OracleDriver'
    } else if (dataSourceType === 'doris') {
      defaultDriverName = 'com.mysql.cj.jdbc.Driver'
    } else if (dataSourceType === 'sqlserver') {
      defaultDriverName = 'com.microsoft.sqlserver.jdbc.SQLServerDriver'
    }

    currentDataSource.value = {
      name: '',
      dataSourceType,
      dataSource: {
        dataSourceType: dataSourceType,
        driverName: defaultDriverName,
        username: '',
        password: '',
        url: ''
      }
    }
  }
  dialogVisible.value = true
}

/**
 * 编辑数据源
 */
const handleEdit = async (item: DataSourceEntity) => {
  try {
    const res = await dataSourceApi.detail(item.code!)
    dialogTitle.value = `编辑${dataSourceTypeMap[item.dataSourceType as DataSourceTypeKey].name}数据源`
    currentDataSource.value = res
    dialogVisible.value = true
  } catch (error) {
    console.error('查询详情失败:', error)
  }
}

/**
 * 删除数据源
 */
const handleDelete = (item: DataSourceEntity) => {
  ElMessageBox.confirm(`确定要删除${item.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        await dataSourceApi.delete(item.code!)
        ElMessage.success('删除成功')
        getDataSourceList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

/**
 * 查看Excel数据
 */
const handleViewData = async (item: DataSourceEntity) => {
  try {
    const res = await dataSourceApi.detail(item.code!)
    const excelDs = res.dataSource as ExcelDataSource
    viewDataCode.value = item.code!
    viewDataName.value = item.name
    viewDataColumns.value = excelDs.columns || []
    viewDataVisible.value = true
  } catch (error) {
    console.error('查询详情失败:', error)
  }
}

/**
 * 保存数据源
 */
const handleSave = async () => {
  try {
    await editorRef.value?.validate()

    if (currentDataSource.value.dataSourceType === 'excel') {
      // Excel类型特殊处理
      await handleSaveExcel()
    } else {
      // 通用关系型数据源保存
      const encryptedData = editorRef.value?.getEncryptedData()
      if (!encryptedData) {
        throw new Error('获取数据失败')
      }

      if (currentDataSource.value.code) {
        await dataSourceApi.update(encryptedData)
        ElMessage.success('更新成功')
      } else {
        await dataSourceApi.insert(encryptedData)
        ElMessage.success('新增成功')
      }
    }

    dialogVisible.value = false
    getDataSourceList()
  } catch (error: unknown) {
    if (error instanceof Error && error.message) {
      ElMessage.error(error.message)
    }
    console.error('保存失败:', error)
  }
}

/**
 * 保存Excel数据源
 */
const handleSaveExcel = async () => {
  const editorData = editorRef.value?.getEncryptedData()
  if (!editorData) {
    throw new Error('获取数据失败')
  }

  if (currentDataSource.value.code) {
    await dataSourceApi.update(buildExcelUpdatePayload(currentDataSource.value, editorData))

    // 编辑模式：如果有新文件上传，继续执行重新导入
    if (editorRef.value?.hasNewFile) {
      const file = editorRef.value.selectedFile
      const importMode = editorRef.value.importMode
      await dataSourceApi.excelReimport(currentDataSource.value.code, file, importMode)
      ElMessage.success('更新并导入成功')
    } else {
      ElMessage.success('更新成功')
    }
  } else {
    // 新增模式：创建表并导入
    // 确保表名有excel_前缀
    let tableName = editorData.tableName
    if (!tableName.startsWith('excel_')) {
      tableName = 'excel_' + tableName
    }

    const result = await dataSourceApi.excelCreateAndImport({
      name: editorData.name,
      tableName: tableName,
      uploadId: editorData.uploadId,
      columns: editorData.columns,
      originalFileName: editorData.originalFileName
    })
    ElMessage.success('创建成功')

    // 自动创建同名数据集
    try {
      const dataSourceCode = typeof result === 'object' ? result.code : undefined
      if (dataSourceCode) {
        // 将Excel列映射为数据集出参字段列表
        const outputList = (editorData.columns || []).map((col: ExcelColumn) => {
          const typeMap: Record<string, string> = {
            VARCHAR: 'String',
            INTEGER: 'int',
            DECIMAL: 'String',
            DATE: 'Date'
          }
          return {
            name: col.name,
            type: typeMap[col.type] || 'String',
            desc: col.originalHeader || col.name
          }
        })

        await datasetApi.insert({
          name: editorData.name,
          dataSourceCode: dataSourceCode,
          datasetType: 'relational',
          dataset: {
            datasetType: 'relational',
            sql: `SELECT * FROM ${tableName} LIMIT 100`
          },
          outputList
        })
        ElMessage.success('已自动创建同名数据集')
      }
    } catch (e) {
      console.error('自动创建数据集失败:', e)
      ElMessage.warning('数据源创建成功，但自动创建数据集失败')
    }
  }
}

/**
 * 获取数据源类型名称
 */
const getTypeName = (type: string) => {
  const key = type as DataSourceTypeKey
  return dataSourceTypeMap[key]?.name || type
}

/**
 * 获取数据源类型图片
 */
const getTypeImage = (type: string) => {
  const key = type as DataSourceTypeKey
  return dataSourceTypeMap[key]?.image || ''
}

// 页面加载时获取列表
onMounted(() => {
  getDataSourceList()
})
</script>

<template>
  <div class="dr-data-source">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchName"
          placeholder="请输入数据源名称"
          :prefix-icon="Search"
          clearable
          @keyup.enter="getDataSourceList"
        />
      </div>
      <div class="button-group">
        <el-button :icon="Search" @click="getDataSourceList">查询</el-button>
        <el-button type="primary" :icon="Plus" @click="openTypeSelectDialog">新增</el-button>
      </div>
    </div>

    <div class="page-content" v-loading="loading">
      <el-scrollbar>
        <div class="card-list">
          <div class="data-source-card" v-for="item in dataSourceList" :key="item.id">
            <div class="card-thumbnail">
              <img :src="getTypeImage(item.dataSourceType)" :alt="getTypeName(item.dataSourceType)" class="thumbnail-image" />
            </div>
            <div class="card-footer">
              <div class="card-info">
                <span class="type-label">{{ getTypeName(item.dataSourceType) }}</span>
                <span class="card-name" :title="item.name">{{ item.name }}</span>
              </div>
              <div class="card-actions">
                <el-dropdown
                  trigger="click"
                  @command="
                    (command: string) => {
                      if (command === 'edit') handleEdit(item)
                      else if (command === 'delete') handleDelete(item)
                      else if (command === 'viewData') handleViewData(item)
                    }
                  "
                >
                  <el-icon class="more-icon">
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="viewData" v-if="item.dataSourceType === 'excel'">
                        <el-icon><View /></el-icon>
                        <span style="margin-left: 8px">查看数据</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>
                        <span style="margin-left: 8px">编辑</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon><Delete /></el-icon>
                        <span style="margin-left: 8px">删除</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
        <el-empty :image-size="200" v-if="!loading && dataSourceList.length === 0" description="暂无数据源" />
      </el-scrollbar>
    </div>

    <!-- 数据源类型选择对话框 -->
    <el-dialog v-model="typeSelectDialogVisible" title="选择数据源类型" width="680px" :close-on-click-modal="true">
      <div class="type-select-cards">
        <div
          v-for="(item, key) in dataSourceTypeMap"
          :key="key"
          class="type-card"
          @click="handleSelectType(key as DataSourceTypeKey)"
        >
          <div class="type-card-image">
            <img :src="item.image" :alt="item.name" />
          </div>
          <div class="type-card-content">
            <div class="type-card-name">{{ item.name }}</div>
            <div class="type-card-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      :width="currentDataSource.dataSourceType === 'excel' ? '800px' : '600px'"
      :close-on-click-modal="false"
    >
      <component
        :is="dataSourceTypeMap[currentDataSource.dataSourceType as DataSourceTypeKey].component"
        v-model="currentDataSource"
        ref="editorRef"
      />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Excel查看数据对话框 -->
    <ExcelViewData
      v-model:visible="viewDataVisible"
      :data-source-code="viewDataCode"
      :data-source-name="viewDataName"
      :columns="viewDataColumns"
    />
  </div>
</template>

<style scoped lang="scss">
.dr-data-source {
  display: flex;
  box-sizing: content-box;
  flex-direction: column;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: var(--space-4);
    gap: var(--space-4);

    .search-box {
      width: 300px;

      :deep(.el-input__wrapper) {
        border-radius: var(--radius-md);
        box-shadow: none;
        border: 1px solid var(--dr-gray-200);
        transition: border-color 0.2s, box-shadow 0.2s;

        &:hover {
          border-color: var(--dr-gray-400);
        }

        &.is-focus {
          border-color: var(--dr-blue);
          box-shadow: var(--dr-shadow-focus);
        }
      }
    }

    .button-group {
      display: flex;
      gap: var(--space-2);

      :deep(.el-button) {
        border-radius: var(--radius-md);
        font-weight: 500;
      }

      :deep(.el-button--primary) {
        background-color: var(--dr-blue);
        border-color: var(--dr-blue);

        &:hover {
          background-color: var(--dr-blue-hover);
          border-color: var(--dr-blue-hover);
        }

        &:active {
          background-color: var(--dr-blue-pressed);
          border-color: var(--dr-blue-pressed);
        }
      }

      :deep(.el-button--default) {
        background: var(--dr-white);
        box-shadow: var(--dr-shadow-border);
        border: none;

        &:hover {
          background: var(--dr-white);
          box-shadow: var(--dr-shadow-sm);
          color: var(--dr-blue);
        }
      }
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;

    .card-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-4);
      margin-bottom: var(--space-5);
      padding: 2px;

      .data-source-card {
        background: var(--dr-white);
        box-shadow: var(--dr-shadow-border);
        border: none;
        border-radius: var(--radius-lg);
        overflow: hidden;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
        cursor: pointer;

        &:hover {
          box-shadow: var(--dr-shadow-md);
          transform: translateY(-1px);
        }

        .card-thumbnail {
          height: 180px;
          padding: var(--space-4);
          background-color: var(--dr-gray-50);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M6 4v4M4 6h4' stroke='%23e5e6eb' stroke-width='1' fill='none'/%3E%3C/svg%3E");
          background-size: 12px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;

          .thumbnail-image {
            width: 60%;
            height: 60%;
            object-fit: contain;
          }
        }

        .card-footer {
          padding: var(--space-3) var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: inset 0 1px 0 0 rgba(0, 0, 0, 0.06);

          .card-info {
            flex: 1;
            display: flex;
            align-items: center;
            overflow: hidden;
            margin-right: var(--space-2);

            .type-label {
              flex-shrink: 0;
              font-size: 14px;
              color: var(--dr-blue);
              font-weight: 500;
              margin-right: var(--space-4);
            }

            .card-name {
              flex: 1;
              font-size: 14px;
              color: var(--dr-gray-700);
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .card-actions {
            display: flex;
            align-items: center;
            gap: var(--space-4);
            flex-shrink: 0;

            .more-icon {
              font-size: 18px;
              color: var(--dr-gray-500);
              cursor: pointer;
              transition: color 0.2s;

              &:hover {
                color: var(--dr-blue);
              }
            }
          }
        }
      }
    }
  }
}

.type-select-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-4);
  padding: 2px;

  .type-card {
    box-shadow: var(--dr-shadow-border);
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-5) var(--space-4);
    cursor: pointer;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &:hover {
      box-shadow: var(--dr-shadow-md);
      transform: translateY(-2px);
    }

    .type-card-image {
      width: 80px;
      height: 80px;
      margin-bottom: var(--space-3);
      display: flex;
      align-items: center;
      justify-content: center;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    .type-card-content {
      .type-card-name {
        font-size: 16px;
        font-weight: 600;
        color: var(--dr-gray-900);
        margin-bottom: var(--space-2);
      }

      .type-card-desc {
        font-size: 12px;
        color: var(--dr-gray-500);
        line-height: 1.5;
        font-weight: 400;
      }
    }
  }
}
</style>
