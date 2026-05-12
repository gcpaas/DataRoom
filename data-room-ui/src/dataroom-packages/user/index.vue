<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Search, Plus} from '@element-plus/icons-vue'
import {userApi, type UserEntity, type UserStatus} from './api'
import UserEdit from './components/UserEdit.vue'

const loading = ref(false)
const userList = ref<UserEntity[]>([])
const searchAccount = ref('')
const searchUsername = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑弹窗
const editDialogVisible = ref(false)
const editUserId = ref<string>('')

const statusMap: Record<UserStatus, { label: string; type: string }> = {
  'NORMAL': {label: '正常', type: 'success'},
  'DISABLED': {label: '禁用', type: 'danger'},
  'PASSWORD_EXPIRED': {label: '密码过期', type: 'warning'}
}

const roleNameMap: Record<string, string> = {
  'manager': '管理员',
  'developer': '开发者',
  'sharer': '访问者'
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getUserList = () => {
  loading.value = true
  userApi.page({
    account: searchAccount.value || undefined,
    username: searchUsername.value || undefined,
    current: currentPage.value,
    size: pageSize.value
  }).then((res: any) => {
    // 响应拦截器已返回 data，故 res 直接是数组
    userList.value = Array.isArray(res) ? res : []
    total.value = res?.total || (Array.isArray(res) ? res.length : 0)
  }).catch((error: any) => {
    console.error('查询用户失败:', error)
  }).finally(() => {
    loading.value = false
  })
}

const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

const handleReset = () => {
  searchAccount.value = ''
  searchUsername.value = ''
  currentPage.value = 1
  getUserList()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getUserList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getUserList()
}

const handleAdd = () => {
  editUserId.value = ''
  editDialogVisible.value = true
}

const handleEdit = (row: UserEntity) => {
  editUserId.value = row.id || ''
  editDialogVisible.value = true
}

const handleDelete = (row: UserEntity) => {
  if (!row.id) return
  ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    return userApi.delete(row.id)
  }).then(() => {
    ElMessage.success('删除成功')
    getUserList()
  }).catch((error: any) => {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
    }
  })
}

const handleEditSuccess = () => {
  getUserList()
}

onMounted(() => {
  getUserList()
})
</script>

<template>
  <div class="dr-user">
    <!-- 搜索区域 -->
    <div class="search-area">
      <div class="search-form">
        <el-input
          v-model="searchAccount"
          placeholder="请输入账号"
          clearable
          @keyup.enter="handleSearch"
          style="width: 200px"
        />
        <el-input
          v-model="searchUsername"
          placeholder="请输入用户名"
          clearable
          @keyup.enter="handleSearch"
          style="width: 200px"
        />
      </div>
      <div class="button-group">
        <el-button :icon="Search" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-area" v-loading="loading">
      <el-table :data="userList" border style="width: 100%">
        <el-table-column prop="account" label="账号" min-width="120"/>
        <el-table-column prop="username" label="用户名" min-width="120"/>
        <el-table-column prop="phone" label="联系电话" min-width="120"/>
        <el-table-column prop="role" label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag
              v-for="r in (row.role ? row.role.split(',') : [])"
              :key="r"
              size="small"
              style="margin-right: 4px; border-radius: 9999px; border: none;"
            >
              {{ roleNameMap[r] || r }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag
              :type="statusMap[row.status]?.type || 'info'"
              size="small"
              style="border-radius: 9999px; border: none;"
            >
              {{ statusMap[row.status]?.label || row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updateDate" label="更新时间" min-width="160">
          <template #default="{ row }">
            <span>{{ formatDate(row.updateDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>

    <!-- 编辑弹窗 -->
    <UserEdit
      v-model="editDialogVisible"
      :user-id="editUserId"
      @success="handleEditSuccess"
    />
  </div>
</template>

<style scoped lang="scss">
.dr-user {
  height: 100%;
  display: flex;
  flex-direction: column;

  .search-area {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    padding: 16px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);

    .search-form {
      display: flex;
      gap: 12px;
    }

    .button-group {
      display: flex;
      gap: 8px;

      :deep(.el-button) {
        border-radius: 6px;
        font-weight: 500;

        &:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #fff, 0 0 0 4px #3478f6;
        }
      }

      :deep(.el-button--primary) {
        background-color: #3478f6;
        border-color: #3478f6;

        &:hover {
          background-color: #2563eb;
          border-color: #2563eb;
        }
      }
    }
  }

  .table-area {
    flex: 1;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    padding: 16px;
    overflow: auto;

    :deep(.el-table) {
      font-size: 14px;
      color: #1d2129;
      border-radius: 6px;
      overflow: hidden;

      th {
        font-weight: 500;
        color: #4e5969;
        background-color: #f7f8fa;
      }

      td {
        padding: 12px 0;
      }

      .el-button {
        font-weight: 500;
        padding: 4px 8px;
      }

      .el-button--primary {
        color: #3478f6;
      }

      .el-button--danger {
        color: #f53f3f;
      }
    }

    .pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;

      :deep(.el-pagination) {
        .el-pagination__total {
          font-size: 14px;
          color: #4e5969;
        }

        .el-pager li {
          border-radius: 6px;
          font-weight: 500;

          &.is-active {
            background-color: #3478f6;
            color: #fff;
          }
        }

        .el-pagination__jump {
          font-size: 14px;
          color: #4e5969;
        }
      }
    }
  }
}
</style>
