<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnCtx } from 'element-plus'

type PreviewRow = Record<string, unknown>

const props = defineProps<{
  data?: unknown
}>()

const isPreviewRow = (value: unknown): value is PreviewRow => {
  return Object.prototype.toString.call(value) === '[object Object]'
}

const previewRows = computed<PreviewRow[]>(() => {
  const rawData = props.data
  const rows = Array.isArray(rawData) ? rawData : rawData == null ? [] : [rawData]

  return rows.map(row => {
    if (isPreviewRow(row)) {
      return row
    }
    return {
      value: row,
    }
  })
})

const previewColumns = computed(() => {
  const columns = new Set<string>()
  previewRows.value.forEach(row => {
    Object.keys(row).forEach(column => columns.add(column))
  })
  return Array.from(columns)
})

const formatPreviewCell = (_row: PreviewRow, _column: TableColumnCtx<PreviewRow>, cellValue: unknown) => {
  if (cellValue == null) {
    return ''
  }
  if (typeof cellValue === 'object') {
    try {
      return JSON.stringify(cellValue)
    } catch {
      return String(cellValue)
    }
  }
  return String(cellValue)
}
</script>

<template>
  <section class="dataset-preview-table-panel">
    <div class="dataset-preview-table-wrap">
      <el-table
        v-if="previewColumns.length > 0"
        class="dataset-preview-table"
        :data="previewRows"
        border
        height="100%"
      >
        <el-table-column
          v-for="column in previewColumns"
          :key="column"
          :prop="column"
          :label="column"
          min-width="120"
          show-overflow-tooltip
          :formatter="formatPreviewCell"
        />
      </el-table>
      <el-empty
        v-else
        class="dataset-preview-empty"
        description="点击【仅测试】来显示数据"
        :image-size="100"
      />
    </div>
  </section>
</template>

<style scoped lang="scss">
.dataset-preview-table-panel {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  height: 100%;
}

.dataset-preview-table-wrap {
  flex: 1;
  min-height: 0;
}

.dataset-preview-table {
  width: 100%;
  font-feature-settings: 'tnum';
}

.dataset-preview-empty {
  height: 100%;
}
</style>
