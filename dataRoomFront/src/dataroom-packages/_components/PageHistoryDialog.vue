<script setup lang="ts">
import { computed, nextTick, ref, type ComponentPublicInstance, watch } from 'vue'
import { ElMessage, ElMessageBox, type InputInstance } from 'element-plus'
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
const deleteLoadingId = ref<string>()
const remarkSavingId = ref<string>()
const editingRemarkId = ref<string>()
const editingRemark = ref('')
const originalRemark = ref('')
const remarkInputRefs = ref<Record<string, InputInstance | undefined>>({})
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
  resetRemarkEdit()
}

const normalizeRemark = (value?: string | null) => value ?? ''

const resetRemarkEdit = () => {
  editingRemarkId.value = undefined
  editingRemark.value = ''
  originalRemark.value = ''
}

const setRemarkInputRef = (id?: string) => (input: Element | ComponentPublicInstance | null) => {
  if (!id) {
    return
  }
  if (input) {
    remarkInputRefs.value[id] = input as InputInstance
    return
  }
  delete remarkInputRefs.value[id]
}

const startRemarkEdit = async (history: PageHistoryItem) => {
  if (!history.id || remarkSavingId.value) {
    return
  }
  editingRemarkId.value = history.id
  editingRemark.value = normalizeRemark(history.remark)
  originalRemark.value = editingRemark.value
  await nextTick()
  remarkInputRefs.value[history.id]?.focus()
}

const finishRemarkEdit = async (history: PageHistoryItem) => {
  const id = history.id
  if (!id || editingRemarkId.value !== id || remarkSavingId.value === id) {
    return
  }

  const nextRemark = editingRemark.value
  const previousRemark = originalRemark.value
  if (nextRemark === previousRemark) {
    resetRemarkEdit()
    return
  }

  remarkSavingId.value = id
  try {
    await pageApi.historyRemark({ id, remark: nextRemark })
    history.remark = nextRemark
    ElMessage.success('备注已更新')
    resetRemarkEdit()
  } catch {
    history.remark = previousRemark
    ElMessage.error('备注更新失败，请稍后重试')
    resetRemarkEdit()
  } finally {
    remarkSavingId.value = undefined
  }
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
  deleteLoadingId.value = undefined
  remarkSavingId.value = undefined
  resetRemarkEdit()
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

const handleDelete = async (history: PageHistoryItem) => {
  if (!history.id) {
    ElMessage.error('历史记录缺少标识，无法删除')
    return
  }

  deleteLoadingId.value = history.id
  try {
    await pageApi.historyDelete(history.id)
    ElMessage.success('删除成功')
    const nextPage = historyList.value.length === 1 && currentPage.value > 1
      ? currentPage.value - 1
      : currentPage.value
    await loadHistory(nextPage)
  } catch {
    ElMessage.error('删除失败，请稍后重试')
  } finally {
    deleteLoadingId.value = undefined
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
    align-center
    destroy-on-close
    @closed="handleClosed"
  >
    <div class="page-history-dialog" v-loading="loading">
      <el-table
        :data="historyList"
        border
        empty-text="暂无历史记录"
        max-height="calc(100vh - 260px)"
      >
        <el-table-column prop="createDate" label="时间" min-width="180">
          <template #default="{ row }">
            <span class="page-history-dialog__time">{{ formatDateTime(row.createDate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="320" show-overflow-tooltip>
          <template #default="{ row }">
            <el-input
              v-if="editingRemarkId === row.id"
              :ref="setRemarkInputRef(row.id)"
              v-model="editingRemark"
              size="small"
              clearable
              :disabled="remarkSavingId === row.id"
              @keyup.enter="finishRemarkEdit(row)"
              @blur="finishRemarkEdit(row)"
            />
            <span
              v-else
              class="page-history-dialog__remark"
              @click="startRemarkEdit(row)"
            >
              {{ row.remark || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <el-space :size="8">
              <el-button
                type="primary"
                link
                :loading="rollbackLoadingId === row.id"
                @click="handleRollback(row)"
              >
                回滚
              </el-button>
              <el-popconfirm
                title="确认删除这条历史记录？"
                confirm-button-text="删除"
                cancel-button-text="取消"
                width="200"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    type="danger"
                    link
                    :loading="deleteLoadingId === row.id"
                  >
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </el-space>
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
  flex: 0 0 auto;
  justify-content: flex-end;
}

.page-history-dialog__time {
  font-feature-settings: 'tnum';
}

.page-history-dialog__remark {
  display: block;
  min-height: 24px;
  cursor: text;
}
</style>
