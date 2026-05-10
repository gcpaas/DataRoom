<script setup lang="ts">
import { ref, watch } from 'vue'
import { dataSourceApi, type ExcelColumn } from '../api'

const props = defineProps<{
  visible: boolean
  dataSourceCode: string
  dataSourceName: string
  columns: ExcelColumn[]
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const loading = ref(false)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tableData = ref<Record<string, any>[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(100)

/**
 * 加载数据
 */
const loadData = async () => {
  if (!props.dataSourceCode) return
  loading.value = true
  try {
    const result = await dataSourceApi.excelViewData(
      props.dataSourceCode,
      currentPage.value,
      pageSize.value
    )
    tableData.value = result.data || []
    total.value = result.total || 0
  } catch (error: unknown) {
    console.error('查询数据失败:', error)
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

/**
 * 分页变更
 */
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadData()
}

/**
 * 对话框打开时加载数据
 */
watch(
  () => props.visible,
  (val) => {
    if (val) {
      currentPage.value = 1
      loadData()
    }
  }
)

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="handleClose"
    :title="`查看数据 - ${dataSourceName}`"
    width="900px"
    :close-on-click-modal="false"
  >
    <div class="view-data-content" v-loading="loading">
      <el-table :data="tableData" border size="small" max-height="500" style="width: 100%">
        <el-table-column
          v-for="col in columns"
          :key="col.name"
          :prop="col.name"
          :label="col.originalHeader || col.name"
          min-width="120"
          show-overflow-tooltip
        />
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[50, 100, 200, 500]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.view-data-content {
  .pagination-wrapper {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
