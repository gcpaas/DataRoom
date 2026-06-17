<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrDataTable',
})
</script>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import type { TableColumnCtx } from 'element-plus'
import type { DrDataTableConfig } from './install.ts'
import type {
  DatasetRow,
  SortOrder,
  TableColumnConfig,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'
import {
  buildColumnsFromRows,
  filterRows,
  formatMetricValue,
  getDatasetFieldNames,
  getFieldValue,
  getPaginationItems,
  normalizeRows,
  sortRows,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'

const { chart } = defineProps<{
  chart: DrDataTableConfig
}>()

const rawRows = ref<DatasetRow[]>([])
const keyword = ref('')
const debouncedKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(chart.props.pagination.pageSize)
type DefaultTableSortOrder = 'ascending' | 'descending'
const sortState = ref<{
  field: string
  order: SortOrder
}>({
  field: chart.props.sort.defaultField,
  order: chart.props.sort.defaultOrder,
})

let searchTimer = 0

const changeData = (datasetValue: unknown) => {
  rawRows.value = normalizeRows(datasetValue)
  currentPage.value = 1
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const datasetDisplayFields = computed(() => getDatasetFieldNames(chart.dataset?.fields, 'displayFields'))
const rowKeyField = computed(() => {
  const datasetRowKey = getDatasetFieldNames(chart.dataset?.fields, 'rowKeyField')[0]
  return datasetRowKey || chart.props.table.rowKey
})

const visibleColumns = computed<TableColumnConfig[]>(() => {
  const displayFields = datasetDisplayFields.value
  const columns = chart.props.table.autoColumns
    ? buildColumnsFromRows(rawRows.value, displayFields)
    : chart.props.table.columns

  return columns
    .filter(column => column.visible !== false && column.field)
    .filter(column => displayFields.length === 0 || displayFields.includes(column.field))
})

const filteredRows = computed(() => {
  return filterRows(rawRows.value, debouncedKeyword.value, chart.props.search.fields)
})

const sortedRows = computed(() => {
  if (!chart.props.sort.enabled) {
    return filteredRows.value
  }
  return sortRows(filteredRows.value, sortState.value.field, sortState.value.order)
})

const pagedRows = computed(() => {
  if (!chart.props.pagination.show) {
    return sortedRows.value
  }
  return getPaginationItems(sortedRows.value, currentPage.value, pageSize.value)
})

const tableDefaultSort = computed<{ prop: string; order: DefaultTableSortOrder } | undefined>(() => {
  if (!chart.props.sort.defaultField || chart.props.sort.defaultOrder === 'none') {
    return undefined
  }
  return {
    prop: chart.props.sort.defaultField,
    order: chart.props.sort.defaultOrder,
  }
})

const tableHeight = computed(() => {
  const searchHeight = chart.props.search.show ? 40 : 0
  const paginationHeight = chart.props.pagination.show ? 40 : 0
  return `calc(100% - ${searchHeight + paginationHeight}px)`
})

const rootStyle = computed<CSSProperties>(() => {
  const global = chart.props.global
  return {
    padding: global.padding.map(value => `${value}px`).join(' '),
    backgroundColor: global.backgroundColor,
    border: `${global.borderWidth}px solid ${global.borderColor}`,
    borderRadius: `${global.borderRadius}px`,
  } as CSSProperties
})

const paginationClass = computed(() => `dr-data-table__pagination dr-data-table__pagination--${chart.props.pagination.position}`)

const formatCellValue = (row: DatasetRow, column: TableColumnConfig) => {
  const value = getFieldValue(row, column.field)
  return formatMetricValue(value, {
    format: column.format || chart.props.formatting.defaultNumberFormat,
    dateFormat: chart.props.formatting.dateFormat,
    nullText: chart.props.formatting.nullText,
    emptyText: chart.props.formatting.nullText,
  })
}

const getRowKey = (row: DatasetRow): string => {
  const field = rowKeyField.value
  const value = getFieldValue(row, field)
  return value === undefined || value === null || value === '' ? String(rawRows.value.indexOf(row)) : String(value)
}

const getColumnWidth = (column: TableColumnConfig) => {
  return column.width && column.width > 0 ? column.width : undefined
}

const getColumnMinWidth = (column: TableColumnConfig) => {
  return column.minWidth && column.minWidth > 0 ? column.minWidth : 100
}

const getColumnSortable = () => {
  return chart.props.sort.enabled ? 'custom' : false
}

const getHeaderCellStyle = (): CSSProperties => {
  const style = chart.props.headerStyle
  const result: CSSProperties = {
    backgroundColor: style.backgroundColor,
    color: style.color,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    textAlign: style.textAlign,
    letterSpacing: '0',
  }
  if (style.height > 0) {
    result.height = `${style.height}px`
  }
  return result
}

const getRowStyle = ({ rowIndex }: { rowIndex: number }): CSSProperties => {
  const style = chart.props.rowStyle
  const result: CSSProperties = {
    backgroundColor: chart.props.table.stripe && rowIndex % 2 === 1 ? style.stripeBackgroundColor : style.backgroundColor,
  }
  if (style.height > 0) {
    result.height = `${style.height}px`
  }
  return result
}

const getCellStyle = ({ column }: { column: TableColumnCtx<DatasetRow> }): CSSProperties => {
  const style = chart.props.cellStyle
  const result: CSSProperties = {
    color: style.color,
    fontSize: `${style.fontSize}px`,
    fontWeight: style.fontWeight,
    padding: style.padding.map(value => `${value}px`).join(' '),
    letterSpacing: '0',
  }
  if (column.type !== 'index') {
    result.textAlign = (column.align || 'left') as CSSProperties['textAlign']
  }
  return result
}

const getCellClassName = () => `dr-data-table__cell dr-data-table__cell--${chart.props.cellStyle.overflow}`

const getRowIndex = (row: DatasetRow) => {
  const visibleIndex = sortedRows.value.indexOf(row)
  return visibleIndex >= 0 ? visibleIndex : rawRows.value.indexOf(row)
}

const handleRowClick = (row: DatasetRow) => {
  canvasInst.triggerChartBehavior(chart.id, 'rowClick', {
    row,
    rowIndex: getRowIndex(row),
  })
}

const handleCellClick = (row: DatasetRow, column: TableColumnCtx<DatasetRow>) => {
  const field = String(column.property || '')
  if (!field) {
    return
  }
  canvasInst.triggerChartBehavior(chart.id, 'cellClick', {
    row,
    field,
    value: getFieldValue(row, field),
  })
}

const handleSortChange = ({ prop, order }: { prop: string; order: SortOrder }) => {
  sortState.value = {
    field: prop || '',
    order: order || 'none',
  }
  currentPage.value = 1
  canvasInst.triggerChartBehavior(chart.id, 'sortChange', {
    field: sortState.value.field,
    order: sortState.value.order,
  })
}

const triggerPageChange = () => {
  canvasInst.triggerChartBehavior(chart.id, 'pageChange', {
    page: currentPage.value,
    pageSize: pageSize.value,
  })
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  triggerPageChange()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  triggerPageChange()
}

watch(keyword, value => {
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    debouncedKeyword.value = value
    currentPage.value = 1
  }, Math.max(chart.props.search.debounce, 0))
})

watch(
  () => chart.props.pagination.pageSize,
  value => {
    pageSize.value = value
    currentPage.value = 1
  },
)

watch(
  () => [chart.props.sort.defaultField, chart.props.sort.defaultOrder] as const,
  ([field, order]) => {
    sortState.value = { field, order }
    currentPage.value = 1
  },
)

watch(
  () => sortedRows.value.length,
  total => {
    const maxPage = Math.max(Math.ceil(total / Math.max(pageSize.value, 1)), 1)
    if (currentPage.value > maxPage) {
      currentPage.value = maxPage
    }
  },
)

defineExpose<ComponentExpose>({
  ...expose,
})
</script>

<template>
  <div class="dr-data-table" :id="chart.id" :style="rootStyle">
    <el-input
      v-if="chart.props.search.show"
      v-model="keyword"
      class="dr-data-table__search"
      :placeholder="chart.props.search.placeholder"
      clearable
      size="small"
    />

    <el-pagination
      v-if="chart.props.pagination.show && chart.props.pagination.position === 'topRight'"
      :class="paginationClass"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="chart.props.pagination.pageSizes"
      :layout="chart.props.pagination.layout"
      :total="sortedRows.length"
      small
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />

    <el-table
      class="dr-data-table__table"
      :data="pagedRows"
      :height="tableHeight"
      :row-key="getRowKey"
      :size="chart.props.table.size"
      :border="chart.props.table.border"
      :stripe="chart.props.table.stripe"
      :fit="chart.props.table.fit"
      :empty-text="chart.props.table.emptyText"
      :header-cell-style="getHeaderCellStyle"
      :row-style="getRowStyle"
      :cell-style="getCellStyle"
      :cell-class-name="getCellClassName"
      :default-sort="tableDefaultSort"
      @row-click="handleRowClick"
      @cell-click="handleCellClick"
      @sort-change="handleSortChange"
    >
      <el-table-column v-if="chart.props.table.showIndex" type="index" width="56" align="center" />
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.field"
        :prop="column.field"
        :label="column.label || column.field"
        :width="getColumnWidth(column)"
        :min-width="getColumnMinWidth(column)"
        :align="column.align || 'left'"
        :fixed="column.fixed || undefined"
        :sortable="getColumnSortable()"
        :show-overflow-tooltip="chart.props.cellStyle.showTooltip && chart.props.cellStyle.overflow === 'ellipsis'"
      >
        <template #default="{ row }">
          <span class="dr-data-table__cell-content">{{ formatCellValue(row, column) }}</span>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="chart.props.pagination.show && chart.props.pagination.position !== 'topRight'"
      :class="paginationClass"
      :current-page="currentPage"
      :page-size="pageSize"
      :page-sizes="chart.props.pagination.pageSizes"
      :layout="chart.props.pagination.layout"
      :total="sortedRows.length"
      small
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<style scoped lang="scss">
.dr-data-table {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  letter-spacing: 0;
}

.dr-data-table__search {
  flex: 0 0 auto;
  margin-bottom: 8px;
}

.dr-data-table__table {
  flex: 1 1 auto;
  min-height: 0;
  font-feature-settings: 'tnum';
}

.dr-data-table__pagination {
  box-sizing: border-box;
  display: flex;
  flex: 0 0 auto;
  padding-top: 8px;
}

.dr-data-table__pagination--topRight {
  justify-content: flex-end;
  padding-top: 0;
  padding-bottom: 8px;
}

.dr-data-table__pagination--bottomLeft {
  justify-content: flex-start;
}

.dr-data-table__pagination--bottomCenter {
  justify-content: center;
}

.dr-data-table__pagination--bottomRight {
  justify-content: flex-end;
}

.dr-data-table__cell-content {
  display: block;
  min-width: 0;
}

.dr-data-table__cell--ellipsis .dr-data-table__cell-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-data-table__cell--wrap .dr-data-table__cell-content {
  overflow-wrap: anywhere;
  white-space: normal;
}

.dr-data-table__cell--clip .dr-data-table__cell-content {
  overflow: hidden;
  white-space: nowrap;
}
</style>
