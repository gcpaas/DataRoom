<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { pageApi, type PageHistoryItem } from '@/dataroom-packages/page/api'

const props = defineProps<{
  modelValue: boolean
  pageCode: string
  hasUnsavedChanges: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'rolled-back': [history: PageHistoryItem]
}>()

const pageSize = 20

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const loading = ref(false)
const rollbackLoadingId = ref<string>()
const currentPage = ref(1)
const total = ref(0)
const historyList = ref<PageHistoryItem[]>([])

const padNumber = (value: number) => value.toString().padStart(2, '0')

const formatDateTime = (value?: string) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(date.getSeconds())}`
}

const resetHistoryPage = () => {
  currentPage.value = 1
  total.value = 0
  historyList.value = []
}

const loadHistory = async (page = 1) => {
  if (!props.pageCode) {
    resetHistoryPage()
    return
  }

  loading.value = true
  try {
    const response = await pageApi.historyList({
      code: props.pageCode,
      pageStatus: 'history',
      current: page,
      size: pageSize,
    })
    historyList.value = response.data || []
    total.value = response.total || 0
    currentPage.value = response.current || page
  } catch {
    ElMessage.error('历史记录加载失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleClosed = () => {
  rollbackLoadingId.value = undefined
}

const handlePageChange = (page: number) => {
  void loadHistory(page)
}

const handleRollback = async (history: PageHistoryItem) => {
  if (props.hasUnsavedChanges) {
    ElMessage.warning('请先保存后再回滚')
    return
  }
  if (!history.id) {
    ElMessage.error('历史记录缺少标识，无法回滚')
    return
  }

  try {
    await ElMessageBox.confirm(
      '将先备份当前设计态，再回滚到所选历史版本，是否继续？',
      '回滚确认',
      {
        type: 'warning',
        confirmButtonText: '确认回滚',
        cancelButtonText: '取消',
      },
    )
  } catch {
    return
  }

  rollbackLoadingId.value = history.id
  try {
    await pageApi.historyRollback(history.id)
    ElMessage.success('回滚成功')
    visible.value = false
    emit('rolled-back', history)
  } catch {
    ElMessage.error('回滚失败，请稍后重试')
  } finally {
    rollbackLoadingId.value = undefined
  }
}

watch(
  () => props.modelValue,
  (opened) => {
    if (!opened) {
      return
    }
    resetHistoryPage()
    void loadHistory(1)
  },
)

watch(
  () => props.pageCode,
  () => {
    if (!props.modelValue) {
      return
    }
    resetHistoryPage()
    void loadHistory(1)
  },
)
</script>

<template>
  <el-dialog
    v-model="visible"
    title="历史记录"
    width="760px"
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="page-history-dialog" v-loading="loading">
      <el-table :data="historyList" border empty-text="暂无历史记录">
        <el-table-column prop="createDate" label="时间" min-width="180">
          <template #default="{ row }">
            <span class="page-history-dialog__time">{{ formatDateTime(row.createDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <span>{{ row.remark || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              :loading="rollbackLoadingId === row.id"
              @click="handleRollback(row)"
            >
              回滚
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="page-history-dialog__pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="total, prev, pager, next"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.page-history-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-history-dialog__pagination {
  display: flex;
  justify-content: flex-end;
}

.page-history-dialog__time {
  font-feature-settings: 'tnum';
}
</style>
