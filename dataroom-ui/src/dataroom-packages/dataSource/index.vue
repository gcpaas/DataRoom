<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, MoreFilled, Edit, Delete, Connection } from '@element-plus/icons-vue'
import { dataSourceApi, type DataSourceEntity } from './api'
import mysqlImg from './assets/image/MySQL占位符.png'
import postgresqlImg from './assets/image/PostgreSQL占位符.png'
import oracleImg from './assets/image/Oracle占位符.png'

const searchName = ref('')
const dataSourceList = ref<DataSourceEntity[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('')
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
    component: defineAsyncComponent(() => import('./components/MysqlEditor.vue'))
  },
  postgresql: {
    name: 'PostgreSQL',
    icon: '🐘',
    image: postgresqlImg,
    component: defineAsyncComponent(() => import('./components/PostgresqlEditor.vue'))
  },
  oracle: {
    name: 'Oracle',
    icon: '🔷',
    image: oracleImg,
    component: defineAsyncComponent(() => import('./components/OracleEditor.vue'))
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
 * 新增数据源
 */
const handleAdd = (dataSourceType: 'mysql' | 'postgresql' | 'oracle') => {
  dialogTitle.value = `新增${dataSourceTypeMap[dataSourceType].name}数据源`

  // 根据数据源类型设置默认驱动名称
  let defaultDriverName = ''
  if (dataSourceType === 'mysql') {
    defaultDriverName = 'com.mysql.cj.jdbc.Driver'
  } else if (dataSourceType === 'postgresql') {
    defaultDriverName = 'org.postgresql.Driver'
  } else if (dataSourceType === 'oracle') {
    defaultDriverName = 'oracle.jdbc.driver.OracleDriver'
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
 * 获取数据源类型图标
 */
const getTypeIcon = (type: string) => {
  const key = type as keyof typeof dataSourceTypeMap
  return dataSourceTypeMap[key]?.icon || '📦'
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
        <el-dropdown trigger="click" @command="handleAdd">
          <el-button type="primary" :icon="Plus">
            新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="mysql">
                <span>{{ dataSourceTypeMap.mysql.icon }}</span>
                <span style="margin-left: 8px">MySQL</span>
              </el-dropdown-item>
              <el-dropdown-item command="postgresql">
                <span>{{ dataSourceTypeMap.postgresql.icon }}</span>
                <span style="margin-left: 8px">PostgreSQL</span>
              </el-dropdown-item>
              <el-dropdown-item command="oracle">
                <span>{{ dataSourceTypeMap.oracle.icon }}</span>
                <span style="margin-left: 8px">Oracle</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
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

      .data-source-card {
        background: #fff;
        border: 1px solid var(--dr-border);
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .card-thumbnail {
          height: 180px;
          padding: 16px;
          background: var(--dr-bg2);
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
          border-top: 1px solid var(--dr-border);

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
              color: var(--dr-text);
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
              color: var(--dr-text);
              cursor: pointer;
              transition: color 0.3s;

              &:hover {
                color: var(--dr-primary);
              }
            }
          }
        }
      }
    }
  }
}
</style>
