<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Refresh, Search } from '@element-plus/icons-vue'
import { operationLogApi, type OperationLogEntity, type OperationLogResultStatus } from './api'

const loading = ref(false)
const logList = ref<OperationLogEntity[]>([])
const searchKeyword = ref('')
const resultStatus = ref<OperationLogResultStatus | ''>('')
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

const statusMap: Record<string, { label: string; type: 'success' | 'danger' | 'info' }> = {
  SUCCESS: { label: '成功', type: 'success' },
  FAILURE: { label: '失败', type: 'danger' },
}

const requestMethodMap: Record<string, string> = {
  GET: 'primary',
  POST: 'success',
  PUT: 'warning',
  DELETE: 'danger',
}

const formatDate = (date: string | null | undefined) => {
  if (!date) return '-'
  const value = new Date(date)
  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, '0')
  const day = String(value.getDate()).padStart(2, '0')
  const hours = String(value.getHours()).padStart(2, '0')
  const minutes = String(value.getMinutes()).padStart(2, '0')
  const seconds = String(value.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const getStatusMeta = (status: string | undefined) => {
  if (!status) {
    return { label: '-', type: 'info' as const }
  }
  return statusMap[status] || { label: status, type: 'info' as const }
}

const getRequestMethodType = (method: string | undefined) => {
  return (requestMethodMap[method || ''] || 'info') as 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const getLogList = () => {
  loading.value = true
  operationLogApi
    .page({
      keyword: searchKeyword.value || undefined,
      resultStatus: resultStatus.value || undefined,
      current: currentPage.value,
      size: pageSize.value,
    })
    .then((res) => {
      logList.value = res.data || []
      total.value = res.total || 0
      currentPage.value = Number(res.current || currentPage.value)
      pageSize.value = Number(res.size || pageSize.value)
    })
    .catch((error: unknown) => {
      console.error('查询访问日志失败:', error)
    })
    .finally(() => {
      loading.value = false
    })
}

const handleSearch = () => {
  currentPage.value = 1
  getLogList()
}

const handleReset = () => {
  searchKeyword.value = ''
  resultStatus.value = ''
  currentPage.value = 1
  getLogList()
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  getLogList()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getLogList()
}

onMounted(() => {
  getLogList()
})
</script>

<template>
  <div class="dr-operation-log">
    <div class="search-area">
      <el-input v-model="searchKeyword" class="search-input" placeholder="请输入操作人、业务名称或访问地址" clearable @keyup.enter="handleSearch" />
      <el-select v-model="resultStatus" class="status-select" placeholder="结果状态" clearable>
        <el-option label="成功" value="SUCCESS" />
        <el-option label="失败" value="FAILURE" />
      </el-select>
      <div class="button-group">
        <el-button :icon="Search" @click="handleSearch">查询</el-button>
        <el-button :icon="Refresh" @click="handleReset">重置</el-button>
      </div>
    </div>

    <div class="table-area" v-loading="loading">
      <div class="table-wrapper">
        <el-table :data="logList" border class="log-table">
          <el-table-column prop="operatorName" label="操作人" min-width="120">
            <template #default="{ row }">
              <span>{{ row.operatorName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="businessName" label="业务" min-width="120">
            <template #default="{ row }">
              <span>{{ row.businessName || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actionDesc" label="操作说明" min-width="140">
            <template #default="{ row }">
              <span>{{ row.actionDesc || row.actionType || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="requestUri" label="访问地址" min-width="260" show-overflow-tooltip />
          <el-table-column prop="requestMethod" label="方法" width="90">
            <template #default="{ row }">
              <el-tag :type="getRequestMethodType(row.requestMethod)" size="small" class="method-tag">
                {{ row.requestMethod || '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="resultStatus" label="结果" width="90">
            <template #default="{ row }">
              <el-tag :type="getStatusMeta(row.resultStatus).type" size="small" class="status-tag">
                {{ getStatusMeta(row.resultStatus).label }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="responseCode" label="响应码" width="100">
            <template #default="{ row }">
              <span>{{ row.responseCode ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="durationMs" label="耗时(ms)" width="110">
            <template #default="{ row }">
              <span class="metric-text">{{ row.durationMs ?? '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="clientIp" label="IP" min-width="140">
            <template #default="{ row }">
              <span class="metric-text">{{ row.clientIp || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="requestTime" label="访问时间" min-width="180">
            <template #default="{ row }">
              <span class="metric-text">{{ formatDate(row.requestTime || row.createDate) }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
  </div>
</template>

<style scoped lang="scss">
.dr-operation-log {
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
  }

  .search-input {
    width: 320px;
  }

  .status-select {
    width: 160px;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .table-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: var(--el-fill-color-blank);
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    padding: 16px;
    box-sizing: border-box;
    overflow: hidden;
  }

  .table-wrapper {
    flex: 1;
    overflow: auto;
  }

  .log-table {
    width: 100%;
  }

  .metric-text {
    font-feature-settings: 'tnum';
  }

  .status-tag,
  .method-tag {
    border-radius: 9999px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}
</style>
