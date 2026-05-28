<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { userApi, type UserEntity, type UserStatus } from './api'
import UserEdit from './components/UserEdit.vue'

const loading = ref(false)
const userList = ref<UserEntity[]>([])
const searchKeyword = ref('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 编辑弹窗
const editDialogVisible = ref(false)
const editUserId = ref<string>('')

type StatusTagType = 'primary' | 'success' | 'warning' | 'info' | 'danger'
type UserPageResponse = UserEntity[] | { data?: UserEntity[]; total?: number }

const statusMap: Record<UserStatus, { label: string; type: StatusTagType }> = {
  NORMAL: { label: '正常', type: 'success' },
  DISABLED: { label: '禁用', type: 'danger' },
  PASSWORD_EXPIRED: { label: '密码过期', type: 'warning' },
}

const roleNameMap: Record<string, string> = {
  manager: '管理员',
  developer: '开发者',
  sharer: '访问者',
}

const getStatusMeta = (status: UserStatus) => statusMap[status] || { label: status, type: 'info' }

const isExpired = (expireDate: string | Date | null | undefined) => {
  if (!expireDate) return false
  return new Date(expireDate).getTime() <= Date.now()
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

const formatExpireDate = (date: string | Date | null | undefined) => {
  if (!date) return '永久有效'
  return formatDate(date)
}

const getUserList = () => {
  loading.value = true
  userApi
    .page({
      keyword: searchKeyword.value || undefined,
      current: currentPage.value,
      size: pageSize.value,
    })
    .then((res: UserPageResponse) => {
      if (Array.isArray(res)) {
        userList.value = res
        total.value = res.length
        return
      }
      userList.value = res.data || []
      total.value = res.total || userList.value.length
    })
    .catch((error: unknown) => {
      console.error('查询用户失败:', error)
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

const handleReset = () => {
  searchKeyword.value = ''
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
  const userId = row.id
  ElMessageBox.confirm(`确定要删除用户「${row.username}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      return userApi.delete(userId)
    })
    .then(() => {
      ElMessage.success('删除成功')
      getUserList()
    })
    .catch((error: unknown) => {
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
      <el-input v-model="searchKeyword" class="search-input" placeholder="请输入账号或用户名" clearable @keyup.enter="handleSearch" />
      <div class="button-group">
        <el-button :icon="Search" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-area" v-loading="loading">
      <el-table :data="userList" border class="user-table">
        <el-table-column prop="account" label="账号" min-width="120" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="phone" label="联系电话" min-width="120" />
        <el-table-column prop="role" label="角色" min-width="180">
          <template #default="{ row }">
            <el-tag v-for="r in row.role ? row.role.split(',') : []" :key="r" size="small" class="role-tag">
              {{ roleNameMap[r] || r }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusMeta(row.status).type" size="small" class="status-tag">
              {{ getStatusMeta(row.status).label }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="expireDate" label="有效期" min-width="180">
          <template #default="{ row }">
            <el-tag v-if="!row.expireDate" type="info" size="small" class="status-tag">永久有效</el-tag>
            <el-tag v-else :type="isExpired(row.expireDate) ? 'danger' : 'success'" size="small" class="status-tag">
              {{ formatExpireDate(row.expireDate) }}
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
    <UserEdit v-model="editDialogVisible" :user-id="editUserId" @success="handleEditSuccess" />
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
    gap: 12px;
    margin-bottom: 16px;
    padding: 16px;
    background: var(--el-fill-color-blank);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    box-sizing: border-box;

    .search-input {
      width: 300px;
    }

    .button-group {
      display: flex;
      gap: 8px;
    }
  }

  .table-area {
    flex: 1;
    background: var(--el-fill-color-blank);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    padding: 16px;
    box-sizing: border-box;
    overflow: auto;

    .user-table {
      width: 100%;
    }

    .role-tag {
      margin-right: 4px;
      border-radius: 9999px;
    }

    .role-tag:last-child {
      margin-right: 0;
    }

    .status-tag {
      border-radius: 9999px;
    }

    .pagination {
      display: flex;
      justify-content: flex-end;
      margin-top: 16px;
    }
  }
}
</style>
