<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, MoreFilled, Edit, Delete } from '@element-plus/icons-vue'
import { dataSourceApi, type DataSourceEntity } from './api'
import mysqlImg from './assets/image/MySQL占位符.png'
import postgresqlImg from './assets/image/PostgreSQL占位符.png'
import oracleImg from './assets/image/Oracle占位符.png'
import dorisImg from './assets/image/Doris占位符.png'

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
  }
} as const

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
const handleSelectType = (dataSourceType: 'mysql' | 'postgresql' | 'oracle' | 'doris') => {
  typeSelectDialogVisible.value = false
  handleAdd(dataSourceType)
}

/**
 * 新增数据源
 */
const handleAdd = (dataSourceType: 'mysql' | 'postgresql' | 'oracle' | 'doris') => {
  dialogTitle.value = `新增${dataSourceTypeMap[dataSourceType].name}数据源`

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
  }

  currentDataSource.value = {
    name: '',
    dataSourceType,
    dataSource: {
      dataSourceType : dataSourceType,
      driverName: defaultDriverName,
      username: '',
      password: '',
      url: ''
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
    dialogTitle.value = `编辑${dataSourceTypeMap[item.dataSourceType].name}数据源`
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
 * 保存数据源
 */
const handleSave = async () => {
  try {
    await editorRef.value?.validate()
    // 获取加密后的数据
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
    dialogVisible.value = false
    getDataSourceList()
  } catch (error) {
    console.error('保存失败:', error)
  }
}

/**
 * 获取数据源类型名称
 */
const getTypeName = (type: string) => {
  const key = type as keyof typeof dataSourceTypeMap
  return dataSourceTypeMap[key]?.name || type
}

/**
 * 获取数据源类型图片
 */
const getTypeImage = (type: string) => {
  const key = type as keyof typeof dataSourceTypeMap
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
                    }
                  "
                >
                  <el-icon class="more-icon">
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
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
    <el-dialog v-model="typeSelectDialogVisible" title="选择数据源类型" width="620px" :close-on-click-modal="true">
      <div class="type-select-cards">
        <div
          v-for="(item, key) in dataSourceTypeMap"
          :key="key"
          class="type-card"
          @click="handleSelectType(key as 'mysql' | 'postgresql' | 'oracle' | 'doris')"
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
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="600px" :close-on-click-modal="false">
      <component
        :is="dataSourceTypeMap[currentDataSource.dataSourceType as keyof typeof dataSourceTypeMap].component"
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
  display: flex;
  gap: var(--space-4);
  justify-content: center;
  padding: 2px;

  .type-card {
    flex: 1;
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
