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
import damengImg from './assets/image/Dameng占位符.svg'
import db2Img from './assets/image/DB2占位符.svg'
import gbaseImg from './assets/image/GBase占位符.svg'
import goldendbImg from './assets/image/GoldenDB占位符.svg'
import greatdbImg from './assets/image/GreatDB.svg'
import sqlserverImg from './assets/image/SqlServer占位符.png'
import mongodbImg from './assets/image/MongoDB.svg'
import kingbaseImg from './assets/image/Kingbase.svg'
import clickhouseImg from './assets/image/ClickHouse.svg'
import mariadbImg from './assets/image/MariaDB.svg'
import oceanbaseImg from './assets/image/OceanBase.svg'
import hiveImg from './assets/image/Hive.svg'
import tdengineImg from './assets/image/TDengine.svg'
import druidImg from './assets/image/Druid.svg'
import elasticsearchImg from './assets/image/Elasticsearch.svg'
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
    url: '',
  },
})
const editorRef = ref()

// Excel查看数据对话框状态
const viewDataVisible = ref(false)
const viewDataCode = ref('')
const viewDataName = ref('')
const viewDataColumns = ref<ExcelColumn[]>([])

const isMessageBoxCancel = (error: unknown) => ['cancel', 'close'].includes(String(error))

// 数据源类型映射
const dataSourceTypeMap = {
  mysql: {
    name: 'MySQL',
    icon: '🐬',
    image: mysqlImg,
    description: '开源关系型数据库，广泛应用',
    component: defineAsyncComponent(() => import('./components/MysqlEditor.vue')),
  },
  postgresql: {
    name: 'PostgreSQL',
    icon: '🐘',
    image: postgresqlImg,
    description: '功能强大的开源对象关系数据库',
    component: defineAsyncComponent(() => import('./components/PostgresqlEditor.vue')),
  },
  oracle: {
    name: 'Oracle',
    icon: '🔷',
    image: oracleImg,
    description: '企业级商业关系型数据库',
    component: defineAsyncComponent(() => import('./components/OracleEditor.vue')),
  },
  doris: {
    name: 'Doris',
    icon: '🔶',
    image: dorisImg,
    description: 'Apache Doris实时分析数据仓库',
    component: defineAsyncComponent(() => import('./components/DorisEditor.vue')),
  },
  dameng: {
    name: '达梦',
    icon: 'DM',
    image: damengImg,
    description: '国产商业关系型数据库',
    component: defineAsyncComponent(() => import('./components/DamengEditor.vue')),
  },
  db2: {
    name: 'DB2',
    icon: 'DB2',
    image: db2Img,
    description: 'IBM企业级关系型数据库',
    component: defineAsyncComponent(() => import('./components/Db2Editor.vue')),
  },
  gbase: {
    name: 'GBase',
    icon: 'GB',
    image: gbaseImg,
    description: '南大通用关系型数据库',
    component: defineAsyncComponent(() => import('./components/GbaseEditor.vue')),
  },
  goldendb: {
    name: 'GoldenDB',
    icon: 'GDB',
    image: goldendbImg,
    description: '中兴分布式关系型数据库',
    component: defineAsyncComponent(() => import('./components/GoldenDbEditor.vue')),
  },
  greatdb: {
    name: 'GreatDB',
    icon: 'GDB',
    image: greatdbImg,
    description: '万里数据库，兼容 MySQL 协议',
    component: defineAsyncComponent(() => import('./components/GreatDbEditor.vue')),
  },
  sqlserver: {
    name: 'SqlServer',
    icon: '🔷',
    image: sqlserverImg,
    description: 'Microsoft SQL Server关系型数据库',
    component: defineAsyncComponent(() => import('./components/SqlServerEditor.vue')),
  },
  mongodb: {
    name: 'MongoDB',
    icon: 'MDB',
    image: mongodbImg,
    description: 'MongoDB JDBC SQL数据源',
    component: defineAsyncComponent(() => import('./components/MongoDbEditor.vue')),
  },
  kingbase: {
    name: '人大金仓',
    icon: 'KB',
    image: kingbaseImg,
    description: '人大金仓 KingbaseES 数据库',
    component: defineAsyncComponent(() => import('./components/KingbaseEditor.vue')),
  },
  clickhouse: {
    name: 'ClickHouse',
    icon: 'CH',
    image: clickhouseImg,
    description: '列式实时分析数据库',
    component: defineAsyncComponent(() => import('./components/ClickHouseEditor.vue')),
  },
  mariadb: {
    name: 'MariaDB',
    icon: 'MDB',
    image: mariadbImg,
    description: '兼容 MySQL 协议的开源数据库',
    component: defineAsyncComponent(() => import('./components/MariaDbEditor.vue')),
  },
  oceanbase: {
    name: 'OceanBase',
    icon: 'OB',
    image: oceanbaseImg,
    description: '分布式关系型数据库',
    component: defineAsyncComponent(() => import('./components/OceanBaseEditor.vue')),
  },
  hive: {
    name: 'Hive',
    icon: 'HV',
    image: hiveImg,
    description: '基于 HiveServer2 的数据仓库',
    component: defineAsyncComponent(() => import('./components/HiveEditor.vue')),
  },
  tdengine: {
    name: 'TDengine',
    icon: 'TD',
    image: tdengineImg,
    description: '面向时序数据的数据库',
    component: defineAsyncComponent(() => import('./components/TDengineEditor.vue')),
  },
  druid: {
    name: 'Druid',
    icon: 'DR',
    image: druidImg,
    description: 'Apache Druid 实时分析数据库',
    component: defineAsyncComponent(() => import('./components/DruidEditor.vue')),
  },
  es: {
    name: 'Elasticsearch',
    icon: 'ES',
    image: elasticsearchImg,
    description: '通过HTTP API连接Elasticsearch',
    component: defineAsyncComponent(() => import('./components/EsEditor.vue')),
  },
  excel: {
    name: 'Excel',
    icon: '📊',
    image: excelImg,
    description: '支持 xlsx 和 csv 格式文件',
    component: defineAsyncComponent(() => import('./components/ExcelEditor.vue')),
  },
} as const

type DataSourceTypeKey = keyof typeof dataSourceTypeMap

/**
 * 查询数据源列表
 */
const getDataSourceList = async () => {
  loading.value = true
  try {
    const params: { name?: string } = {}
    const keyword = searchName.value.trim()
    if (keyword) {
      params.name = keyword
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
        importMode: 'overwrite',
      } as ExcelDataSource,
    }
  } else if (dataSourceType === 'es') {
    currentDataSource.value = {
      name: '',
      dataSourceType: 'es',
      dataSource: {
        dataSourceType: 'es',
        baseUrl: '',
        authType: 'none',
        username: '',
        password: '',
        bearerToken: '',
        apiKey: '',
      },
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
    } else if (dataSourceType === 'dameng') {
      defaultDriverName = 'dm.jdbc.driver.DmDriver'
    } else if (dataSourceType === 'db2') {
      defaultDriverName = 'com.ibm.db2.jcc.DB2Driver'
    } else if (dataSourceType === 'gbase') {
      defaultDriverName = 'com.gbasedbt.jdbc.Driver'
    } else if (dataSourceType === 'goldendb') {
      defaultDriverName = 'com.mysql.cj.jdbc.Driver'
    } else if (dataSourceType === 'greatdb') {
      defaultDriverName = 'com.mysql.cj.jdbc.Driver'
    } else if (dataSourceType === 'sqlserver') {
      defaultDriverName = 'com.microsoft.sqlserver.jdbc.SQLServerDriver'
    } else if (dataSourceType === 'mongodb') {
      defaultDriverName = 'com.mongodb.jdbc.MongoDriver'
    } else if (dataSourceType === 'kingbase') {
      defaultDriverName = 'com.kingbase8.Driver'
    } else if (dataSourceType === 'clickhouse') {
      defaultDriverName = 'com.clickhouse.jdbc.ClickHouseDriver'
    } else if (dataSourceType === 'mariadb') {
      defaultDriverName = 'org.mariadb.jdbc.Driver'
    } else if (dataSourceType === 'oceanbase') {
      defaultDriverName = 'com.oceanbase.jdbc.Driver'
    } else if (dataSourceType === 'hive') {
      defaultDriverName = 'org.apache.hive.jdbc.HiveDriver'
    } else if (dataSourceType === 'tdengine') {
      defaultDriverName = 'com.taosdata.jdbc.ws.WebSocketDriver'
    } else if (dataSourceType === 'druid') {
      defaultDriverName = 'org.apache.calcite.avatica.remote.Driver'
    }

    currentDataSource.value = {
      name: '',
      dataSourceType,
      dataSource: {
        dataSourceType: dataSourceType,
        driverName: defaultDriverName,
        username: '',
        password: '',
        url: '',
      },
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
const handleDelete = async (item: DataSourceEntity) => {
  try {
    await ElMessageBox.confirm(`确定要删除${item.name}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await dataSourceApi.delete(item.code!)
    ElMessage.success('删除成功')
    await getDataSourceList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('删除失败:', error)
    }
  }
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
    await getDataSourceList()
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
      originalFileName: editorData.originalFileName,
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
            DATE: 'Date',
          }
          return {
            name: col.name,
            type: typeMap[col.type] || 'String',
            desc: col.originalHeader || col.name,
          }
        })

        await datasetApi.insert({
          name: editorData.name,
          dataSourceCode: dataSourceCode,
          datasetType: 'sql',
          dataset: {
            datasetType: 'sql',
            sql: `SELECT * FROM ${tableName} LIMIT 100`,
          },
          outputList,
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

const handleCardCommand = (command: string, item: DataSourceEntity) => {
  switch (command) {
    case 'viewData':
      void handleViewData(item)
      break
    case 'edit':
      void handleEdit(item)
      break
    case 'delete':
      void handleDelete(item)
      break
  }
}

// 页面加载时获取列表
onMounted(() => {
  void getDataSourceList()
})
</script>

<template>
  <div class="dr-data-source">
    <div class="page-header">
      <div class="search-box">
        <el-input v-model="searchName" placeholder="请输入数据源名称" :prefix-icon="Search" clearable @keyup.enter="getDataSourceList" />
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
                <el-dropdown trigger="click" @command="(command: string) => handleCardCommand(command, item)">
                  <el-icon class="more-icon">
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="viewData" v-if="item.dataSourceType === 'excel'">
                        <el-icon><View /></el-icon>
                        <span class="dropdown-item-label">查看数据</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="edit">
                        <el-icon><Edit /></el-icon>
                        <span class="dropdown-item-label">编辑</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" divided>
                        <el-icon><Delete /></el-icon>
                        <span class="dropdown-item-label">删除</span>
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
    <el-dialog v-model="typeSelectDialogVisible" title="选择数据源类型" width="800px" :close-on-click-modal="true">
      <el-scrollbar class="type-select-scrollbar" max-height="60vh">
        <div class="type-select-cards">
          <div v-for="(item, key) in dataSourceTypeMap" :key="key" class="type-card" @click="handleSelectType(key as DataSourceTypeKey)">
            <div class="type-card-image">
              <img :src="item.image" :alt="item.name" />
            </div>
            <div class="type-card-content">
              <div class="type-card-name">{{ item.name }}</div>
              <div class="type-card-desc">{{ item.description }}</div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </el-dialog>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" :width="currentDataSource.dataSourceType === 'excel' ? '800px' : '600px'" :close-on-click-modal="false">
      <el-scrollbar class="data-source-editor-scrollbar" max-height="65vh">
        <component :is="dataSourceTypeMap[currentDataSource.dataSourceType as DataSourceTypeKey].component" v-model="currentDataSource" ref="editorRef" />
      </el-scrollbar>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Excel查看数据对话框 -->
    <ExcelViewData v-model:visible="viewDataVisible" :data-source-code="viewDataCode" :data-source-name="viewDataName" :columns="viewDataColumns" />
  </div>
</template>

<style scoped lang="scss">
.dr-data-source {
  display: flex;
  box-sizing: content-box;
  flex-direction: column;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;

    .search-box {
      width: 300px;
    }

    .button-group {
      display: flex;
      gap: 8px;
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;

    .card-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
      padding: 2px;

      .data-source-card {
        background: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        transition:
          border-color 0.2s ease,
          background-color 0.2s ease;
        cursor: pointer;

        &:hover {
          border-color: var(--el-border-color);
        }

        .card-thumbnail {
          height: 180px;
          padding: 16px;
          background-color: var(--el-fill-color-extra-light);
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
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--el-border-color-lighter);

          .card-info {
            flex: 1;
            display: flex;
            align-items: center;
            overflow: hidden;
            margin-right: 8px;

            .type-label {
              flex-shrink: 0;
              font-size: 14px;
              color: var(--el-color-primary);
              font-weight: 500;
              margin-right: 16px;
            }

            .card-name {
              flex: 1;
              font-size: 14px;
              color: var(--el-text-color-primary);
              font-weight: 400;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .card-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-shrink: 0;

            .more-icon {
              font-size: 18px;
              color: var(--el-text-color-secondary);
              cursor: pointer;
              transition: color 0.2s;

              &:hover {
                color: var(--el-color-primary);
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
  gap: 16px;
  padding: 2px;

  .type-card {
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    padding: 20px 16px;
    cursor: pointer;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .type-card-image {
      width: 80px;
      height: 80px;
      margin-bottom: 12px;
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
        color: var(--el-text-color-primary);
        margin-bottom: 8px;
      }

      .type-card-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1.5;
        font-weight: 400;
      }
    }
  }
}

.dropdown-item-label {
  margin-left: 8px;
}

.data-source-editor-scrollbar {
  padding: 0 4px;
}
</style>
