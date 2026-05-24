<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAnalysisTable',
})
</script>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import { Search, Setting } from '@element-plus/icons-vue'
import { useDrComponent } from '@/dataroom-packages/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataroom-packages/components/type/ComponentExpose.ts'
import type { DrAnalysisTableConfig } from './install.ts'
import {
  aggregateRows,
  buildColumnsFromRows,
  filterRows,
  formatMetricValue,
  getDatasetFieldNames,
  getPaginationItems,
  matchConditionalRule,
  normalizeRows,
  sortRows,
  summarizeRows,
  toFiniteNumber,
  type DatasetRow,
  type SortOrder,
  type TableColumnConfig,
} from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

const { chart } = defineProps<{
  chart: DrAnalysisTableConfig
}>()

type SortState = {
  field: string
  order: SortOrder
}

type DisplayRow = DatasetRow & {
  __drRowIndex: number
}

type ColumnStateMap = Record<string, Partial<TableColumnConfig>>

const rawRows = ref<DatasetRow[]>([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(chart.props.pagination.pageSize)
const sorts = ref<SortState[]>([...chart.props.sort.defaultSorts])
const selectedRows = ref<DatasetRow[]>([])
const runtimeColumnState = ref<ColumnStateMap>({})

const changeData = (datasetValue: unknown) => {
  rawRows.value = normalizeRows(datasetValue)
  currentPage.value = 1
}

const { canvasInst, expose } = useDrComponent({
  chart,
  changeData,
})

const datasetFields = computed(() => chart.dataset?.fields)

const dimensionFields = computed(() => {
  return chart.props.analysis.dimensions.length > 0
    ? chart.props.analysis.dimensions
    : getDatasetFieldNames(datasetFields.value, 'dimensionFields')
})

const metricFields = computed(() => {
  return chart.props.analysis.metrics.length > 0
    ? chart.props.analysis.metrics
    : getDatasetFieldNames(datasetFields.value, 'metricFields')
})

const percentMetricFields = computed(() => {
  return chart.props.analysis.percentMetrics.length > 0
    ? chart.props.analysis.percentMetrics
    : getDatasetFieldNames(datasetFields.value, 'percentMetricFields')
})

const displayFields = computed(() => getDatasetFieldNames(datasetFields.value, 'displayFields'))

const rowKeyField = computed(() => {
  return chart.props.table.rowKey || getDatasetFieldNames(datasetFields.value, 'rowKeyField')[0] || ''
})

const totalFieldName = computed(() => getDatasetFieldNames(datasetFields.value, 'totalField')[0] || '')

const sourceRows = computed<DatasetRow[]>(() => {
  if (chart.props.analysis.mode !== 'aggregate') {
    return rawRows.value
  }
  const aggregations =
    chart.props.analysis.metricAggregations.length > 0
      ? chart.props.analysis.metricAggregations
      : metricFields.value.map(field => ({ field, method: 'sum' as const }))
  return aggregateRows(rawRows.value, dimensionFields.value, aggregations)
})

const rowsWithPercentMetrics = computed<DisplayRow[]>(() => {
  const rows: DisplayRow[] = sourceRows.value.map((row, index) => ({ ...row, __drRowIndex: index }))
  const fields = percentMetricFields.value.filter(Boolean)
  if (fields.length === 0) {
    return rows
  }
  const visibleBaseRows =
    chart.props.search.mode === 'client'
      ? filterRows(sourceRows.value, searchKeyword.value, chart.props.search.fields)
      : sourceRows.value
  const customTotal = totalFieldName.value ? toFiniteNumber(rawRows.value[0]?.[totalFieldName.value]) : undefined
  const resolveTotal = (field: string) => {
    if (chart.props.analysis.percentBase === 'customTotal' && customTotal !== undefined) {
      return customTotal
    }
    const baseRows = chart.props.analysis.percentBase === 'visibleRows' ? visibleBaseRows : sourceRows.value
    return baseRows.reduce((sum, row) => sum + (toFiniteNumber(row[field]) ?? 0), 0)
  }
  return rows.map(row => {
    const nextRow: DisplayRow = { ...row }
    for (const field of fields) {
      const value = toFiniteNumber(row[field])
      const total = resolveTotal(field)
      nextRow[`${field}_percent`] = value === undefined || total === 0 ? undefined : value / total
    }
    return nextRow
  })
})

const persistedColumnState = computed(() => {
  return new Map(chart.props.columns.columnConfig.map(column => [column.field, column]))
})

const mergeColumnState = (column: TableColumnConfig): TableColumnConfig => {
  const persistedState = persistedColumnState.value.get(column.field)
  const runtimeState = runtimeColumnState.value[column.field]
  return {
    ...column,
    ...(persistedState ?? {}),
    ...(runtimeState ?? {}),
  }
}

const baseColumns = computed<TableColumnConfig[]>(() => {
  if (!chart.props.columns.autoColumns) {
    return chart.props.columns.columnConfig
  }
  const preferredFields = [
    ...dimensionFields.value,
    ...metricFields.value,
    ...percentMetricFields.value,
    ...percentMetricFields.value.map(field => `${field}_percent`),
  ].filter(Boolean)
  const fields = preferredFields.length > 0 ? preferredFields : displayFields.value
  const columns = buildColumnsFromRows(rowsWithPercentMetrics.value, fields)
  return columns
    .filter(column => column.field !== '__drRowIndex')
    .map(column =>
      mergeColumnState({
        ...column,
        label: column.field.endsWith('_percent') ? `${column.field.replace(/_percent$/, '')}占比` : column.field,
        align: metricFields.value.includes(column.field) || column.field.endsWith('_percent') ? 'right' : column.align,
        format: column.field.endsWith('_percent') ? 'percent2' : metricFields.value.includes(column.field) ? 'thousand' : column.format,
      }),
    )
})

const visibleColumns = computed(() => {
  return baseColumns.value.filter(column => column.visible !== false)
})

const searchedRows = computed(() => {
  if (chart.props.search.mode !== 'client') {
    return rowsWithPercentMetrics.value
  }
  return filterRows(rowsWithPercentMetrics.value, searchKeyword.value, chart.props.search.fields)
})

const sortedRows = computed(() => {
  if (chart.props.sort.mode !== 'client' || sorts.value.length === 0) {
    return searchedRows.value
  }
  return sorts.value.reduce((rows, sort) => sortRows(rows, sort.field, sort.order), searchedRows.value)
})

const totalRows = computed(() => {
  if (chart.props.pagination.mode === 'datasetParams' && totalFieldName.value) {
    return toFiniteNumber(rawRows.value[0]?.[totalFieldName.value]) ?? sortedRows.value.length
  }
  return sortedRows.value.length
})

const tableRows = computed(() => {
  if (!chart.props.pagination.show || chart.props.pagination.mode !== 'client') {
    return sortedRows.value
  }
  return getPaginationItems(sortedRows.value, currentPage.value, pageSize.value)
})

const tableData = computed(() => {
  if (!chart.props.summary.show || chart.props.summary.position !== 'top') {
    return tableRows.value
  }
  return [summaryRow.value, ...tableRows.value]
})

const summaryRow = computed<DisplayRow>(() => {
  const fields = visibleColumns.value.map(column => column.field)
  const summary = summarizeRows(sortedRows.value, fields, chart.props.summary.methods)
  const row: DisplayRow = { ...summary, __drRowIndex: -1 }
  const labelField = visibleColumns.value[0]?.field
  if (labelField) {
    row[labelField] = chart.props.summary.label
  }
  return row
})

const maxAbsByField = computed(() => {
  const result = new Map<string, number>()
  for (const column of visibleColumns.value) {
    const max = Math.max(
      ...sortedRows.value.map(row => Math.abs(toFiniteNumber(row[column.field]) ?? 0)),
      0,
    )
    result.set(column.field, max)
  }
  return result
})

const minMaxByField = computed(() => {
  const result = new Map<string, { min: number; max: number }>()
  for (const column of visibleColumns.value) {
    const values = sortedRows.value.map(row => toFiniteNumber(row[column.field])).filter((value): value is number => value !== undefined)
    result.set(column.field, {
      min: values.length > 0 ? Math.min(...values) : 0,
      max: values.length > 0 ? Math.max(...values) : 0,
    })
  }
  return result
})

const wrapperStyle = computed<CSSProperties>(() => {
  const [top, right, bottom, left] = chart.props.global.padding
  return {
    padding: `${top}px ${right}px ${bottom}px ${left}px`,
    backgroundColor: chart.props.global.backgroundColor,
    borderColor: chart.props.global.borderColor,
    borderWidth: `${chart.props.global.borderWidth}px`,
    borderRadius: `${chart.props.global.borderRadius}px`,
  }
})

const tableHeight = computed(() => {
  const toolbarHeight = chart.props.search.show || chart.props.columns.showColumnSettings ? 44 : 0
  const paginationHeight = chart.props.pagination.show ? 40 : 0
  return Math.max(chart.h - toolbarHeight - paginationHeight - chart.props.global.padding[0] - chart.props.global.padding[2], 120)
})

const paginationClass = computed(() => `dr-analysis-table__pagination dr-analysis-table__pagination--${chart.props.pagination.position}`)

const getRowKey = (row: DisplayRow) => {
  return rowKeyField.value ? String(row[rowKeyField.value] ?? row.__drRowIndex) : String(row.__drRowIndex)
}

const columnSortable = computed(() => {
  return chart.props.sort.enabled ? (chart.props.sort.mode === 'client' ? 'custom' : 'custom') : false
})

const getColumnWidth = (column: TableColumnConfig) => {
  return chart.props.columns.allowResize ? column.width : undefined
}

const getColumnMinWidth = (column: TableColumnConfig) => {
  return column.minWidth ?? 100
}

const formatCell = (row: DatasetRow, column: TableColumnConfig) => {
  return formatMetricValue(row[column.field], {
    format: column.format,
    emptyText: chart.props.table.emptyText,
  })
}

const cellTextClass = (row: DatasetRow, field: string) => {
  const value = toFiniteNumber(row[field])
  if (
    value === undefined ||
    !chart.props.conditionalFormatting.enabled ||
    chart.props.conditionalFormatting.basicTrendColor === 'none'
  ) {
    return ''
  }
  if (value === 0) {
    return 'dr-analysis-table__cell-text--flat'
  }
  const positiveClass =
    chart.props.conditionalFormatting.basicTrendColor === 'increaseGreen'
      ? 'dr-analysis-table__cell-text--positive'
      : 'dr-analysis-table__cell-text--negative'
  const negativeClass =
    chart.props.conditionalFormatting.basicTrendColor === 'increaseGreen'
      ? 'dr-analysis-table__cell-text--negative'
      : 'dr-analysis-table__cell-text--positive'
  return value > 0 ? positiveClass : negativeClass
}

const shouldShowCellBar = (field: string) => {
  if (!chart.props.cellBars.show) {
    return false
  }
  return chart.props.cellBars.fields.length === 0 || chart.props.cellBars.fields.includes(field)
}

const getCellBarStyle = (row: DatasetRow, field: string): CSSProperties => {
  const value = toFiniteNumber(row[field])
  if (value === undefined || !shouldShowCellBar(field)) {
    return {}
  }
  const height = `${chart.props.cellBars.barHeight}%`
  const color = value < 0 ? chart.props.cellBars.negativeColor : chart.props.cellBars.positiveColor
  if (chart.props.cellBars.alignPositiveNegative) {
    const maxAbs = maxAbsByField.value.get(field) || 1
    const width = `${Math.min(Math.abs(value) / maxAbs, 1) * 50}%`
    return value < 0
      ? { height, width, backgroundColor: color, right: '50%' }
      : { height, width, backgroundColor: color, left: '50%' }
  }
  const minMax = minMaxByField.value.get(field) ?? { min: 0, max: 0 }
  const range = minMax.max - Math.min(minMax.min, 0)
  const width = range === 0 ? 0 : (Math.abs(value) / range) * 100
  return { height, width: `${Math.min(width, 100)}%`, backgroundColor: color, left: 0 }
}

const getConditionalStyle = (row: DatasetRow, field: string, target: 'cell' | 'row'): CSSProperties => {
  if (!chart.props.conditionalFormatting.enabled) {
    return {}
  }
  const rule = chart.props.conditionalFormatting.rules.find(item => {
    return item.field === field && item.target === target && matchConditionalRule(row[field], item)
  })
  if (!rule) {
    return {}
  }
  return {
    color: rule.textColor || undefined,
    backgroundColor: rule.backgroundColor || undefined,
  }
}

const getCellStyle = ({ row, column }: { row: DisplayRow; column: { property?: string } }): CSSProperties => {
  const field = column.property
  const [top, right, bottom, left] = chart.props.cellStyle.padding
  return {
    color: chart.props.cellStyle.color,
    fontSize: `${chart.props.cellStyle.fontSize}px`,
    fontWeight: chart.props.cellStyle.fontWeight,
    padding: `${top}px ${right}px ${bottom}px ${left}px`,
    ...getConditionalStyle(row, field ?? '', 'cell'),
  }
}

const getHeaderCellStyle = (): CSSProperties => {
  return {
    height: chart.props.headerStyle.height > 0 ? `${chart.props.headerStyle.height}px` : undefined,
    backgroundColor: chart.props.headerStyle.backgroundColor,
    color: chart.props.headerStyle.color,
    fontSize: `${chart.props.headerStyle.fontSize}px`,
    fontWeight: chart.props.headerStyle.fontWeight,
  }
}

const getRowStyle = ({ row, rowIndex }: { row: DisplayRow; rowIndex: number }): CSSProperties => {
  const firstMatchingRule = chart.props.conditionalFormatting.rules.find(rule => {
    return rule.target === 'row' && matchConditionalRule(row[rule.field], rule)
  })
  const isSelected = selectedRows.value.some(selectedRow => {
    return Number(selectedRow.__drRowIndex) === row.__drRowIndex
  })
  return {
    height: chart.props.rowStyle.height > 0 ? `${chart.props.rowStyle.height}px` : undefined,
    backgroundColor:
      isSelected
        ? chart.props.rowStyle.selectedBackgroundColor
        : rowIndex % 2 === 1 && chart.props.table.stripe
          ? chart.props.rowStyle.stripeBackgroundColor
          : chart.props.rowStyle.backgroundColor,
    ...(chart.props.conditionalFormatting.enabled && firstMatchingRule
      ? {
          color: firstMatchingRule.textColor,
          backgroundColor: firstMatchingRule.backgroundColor,
        }
      : {}),
  }
}

const overflowClass = computed(() => `dr-analysis-table__cell-text dr-analysis-table__cell-text--${chart.props.cellStyle.overflow}`)

const triggerColumnStateChange = () => {
  canvasInst.triggerChartBehavior(chart.id, 'columnStateChange', {
    columns: visibleColumns.value,
  })
}

const patchColumnState = (field: string, patch: Partial<TableColumnConfig>) => {
  if (!field) {
    return
  }
  if (chart.props.columns.persistState) {
    const existing = chart.props.columns.columnConfig.find(column => column.field === field)
    if (existing) {
      // Runtime column persistence intentionally writes back to the chart config.
       
      Object.assign(existing, patch)
    } else {
      // Runtime column persistence intentionally writes back to the chart config.
      // eslint-disable-next-line vue/no-mutating-props
      chart.props.columns.columnConfig.push({ field, label: field, visible: true, ...patch })
    }
  } else {
    runtimeColumnState.value = {
      ...runtimeColumnState.value,
      [field]: {
        ...(runtimeColumnState.value[field] ?? {}),
        ...patch,
      },
    }
  }
}

const toggleColumnVisible = (column: TableColumnConfig, visible: boolean) => {
  patchColumnState(column.field, { visible })
  triggerColumnStateChange()
}

const handleHeaderDragEnd = (newWidth: number, _oldWidth: number, column: { property?: string }) => {
  patchColumnState(String(column.property ?? ''), { width: newWidth })
  triggerColumnStateChange()
}

const setDatasetParam = (name: string, value: unknown) => {
  // Dataset-param mode stores transient query state in the chart dataset config before refresh.
  // eslint-disable-next-line vue/no-mutating-props
  chart.dataset.params[name] = {
    from: 'fixed',
    variableName: '',
    defaultValue: value,
  }
}

const syncDatasetParams = () => {
  if (chart.props.search.mode === 'datasetParams') {
    setDatasetParam('search', searchKeyword.value)
  }
  if (chart.props.sort.mode === 'datasetParams') {
    setDatasetParam('sorts', sorts.value)
  }
  if (chart.props.pagination.mode === 'datasetParams') {
    setDatasetParam('page', currentPage.value)
    setDatasetParam('pageSize', pageSize.value)
  }
}

const refreshDatasetParams = () => {
  syncDatasetParams()
  expose.autoRefreshData()
}

const handleRowClick = (row: DisplayRow) => {
  if (row.__drRowIndex === -1) {
    return
  }
  canvasInst.triggerChartBehavior(chart.id, 'rowClick', {
    row,
    rowIndex: row.__drRowIndex,
  })
}

const handleCellClick = (row: DisplayRow, column: { property?: string }) => {
  if (row.__drRowIndex === -1 || !column.property) {
    return
  }
  canvasInst.triggerChartBehavior(chart.id, 'cellClick', {
    row,
    field: column.property,
    value: row[column.property],
  })
}

const handleSelectionChange = (rows: DisplayRow[]) => {
  selectedRows.value = rows.filter(row => row.__drRowIndex !== -1)
  canvasInst.triggerChartBehavior(chart.id, 'selectionChange', {
    rows: selectedRows.value,
  })
}

const handleSortChange = ({ prop, order }: { prop: string; order: SortOrder }) => {
  const nextSort = { field: prop, order }
  sorts.value = chart.props.sort.multiSort
    ? [...sorts.value.filter(sort => sort.field !== prop), nextSort].filter(sort => sort.order && sort.order !== 'none')
    : order && order !== 'none'
      ? [nextSort]
      : []
  canvasInst.triggerChartBehavior(chart.id, 'sortChange', {
    sorts: sorts.value,
  })
  if (chart.props.sort.mode === 'datasetParams') {
    refreshDatasetParams()
  }
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  canvasInst.triggerChartBehavior(chart.id, 'pageChange', {
    page: currentPage.value,
    pageSize: pageSize.value,
  })
  if (chart.props.pagination.mode === 'datasetParams') {
    refreshDatasetParams()
  }
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  canvasInst.triggerChartBehavior(chart.id, 'pageChange', {
    page: currentPage.value,
    pageSize: pageSize.value,
  })
  if (chart.props.pagination.mode === 'datasetParams') {
    refreshDatasetParams()
  }
}

const getSummaryValues = ({ columns }: { columns: Array<{ property?: string; type?: string }> }) => {
  let labelApplied = false
  return columns.map(column => {
    if (!column.property) {
      return ''
    }
    if (!labelApplied) {
      labelApplied = true
      return chart.props.summary.label
    }
    return summaryRow.value[column.property] ?? ''
  })
}

let searchTimer: number | undefined
watch(searchKeyword, () => {
  currentPage.value = 1
  if (chart.props.search.mode !== 'datasetParams') {
    return
  }
  window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => {
    refreshDatasetParams()
  }, chart.props.search.debounce)
})

watch(
  () => chart.props.pagination.pageSize,
  value => {
    pageSize.value = value
    currentPage.value = 1
  },
)

defineExpose<ComponentExpose>(expose)
</script>

<template>
  <div class="dr-analysis-table" :style="wrapperStyle">
    <div
      v-if="chart.props.search.show || chart.props.columns.showColumnSettings"
      class="dr-analysis-table__toolbar"
    >
      <el-input
        v-if="chart.props.search.show"
        v-model="searchKeyword"
        class="dr-analysis-table__search"
        clearable
        :placeholder="chart.props.search.placeholder"
        :prefix-icon="Search"
        size="small"
      />
      <el-popover
        v-if="chart.props.columns.showColumnSettings"
        placement="bottom-end"
        trigger="click"
        width="220"
      >
        <template #reference>
          <el-button :icon="Setting" size="small" />
        </template>
        <div class="dr-analysis-table__column-settings">
          <el-checkbox
            v-for="column in baseColumns"
            :key="column.field"
            :model-value="column.visible !== false"
            :disabled="!chart.props.columns.allowHide"
            @update:model-value="toggleColumnVisible(column, Boolean($event))"
          >
            {{ column.label }}
          </el-checkbox>
        </div>
      </el-popover>
    </div>

    <el-pagination
      v-if="chart.props.pagination.show && chart.props.pagination.position === 'topRight'"
      :class="paginationClass"
      :current-page="currentPage"
      :layout="chart.props.pagination.layout"
      :page-size="pageSize"
      :page-sizes="chart.props.pagination.pageSizes"
      :total="totalRows"
      size="small"
      @current-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />

    <el-table
      class="dr-analysis-table__table"
      :data="tableData"
      :height="tableHeight"
      :row-key="getRowKey"
      :size="chart.props.table.size"
      :border="chart.props.table.border"
      :stripe="chart.props.table.stripe"
      :fit="chart.props.table.fit"
      :empty-text="chart.props.table.emptyText"
      :cell-style="getCellStyle"
      :header-cell-style="getHeaderCellStyle"
      :row-style="getRowStyle"
      :show-summary="chart.props.summary.show && chart.props.summary.position === 'bottom'"
      :summary-method="getSummaryValues"
      @row-click="handleRowClick"
      @cell-click="handleCellClick"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @header-dragend="handleHeaderDragEnd"
    >
      <el-table-column
        v-if="chart.props.table.showSelection"
        type="selection"
        width="48"
      />
      <el-table-column
        v-if="chart.props.table.showIndex"
        type="index"
        width="56"
        label="#"
      />
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.field"
        :prop="column.field"
        :label="column.label"
        :width="getColumnWidth(column)"
        :min-width="getColumnMinWidth(column)"
        :align="column.align"
        :fixed="column.fixed || undefined"
        :resizable="chart.props.columns.allowResize"
        :sortable="columnSortable"
        :show-overflow-tooltip="chart.props.cellStyle.showTooltip && chart.props.cellStyle.overflow === 'ellipsis'"
      >
        <template #default="{ row }">
          <div
            class="dr-analysis-table__cell"
            :style="getConditionalStyle(row, column.field, 'cell')"
          >
            <span
              v-if="shouldShowCellBar(column.field)"
              class="dr-analysis-table__cell-bar"
              :style="getCellBarStyle(row, column.field)"
            />
            <span :class="[overflowClass, cellTextClass(row, column.field)]">
              {{ formatCell(row, column) }}
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="chart.props.pagination.show && chart.props.pagination.position !== 'topRight'"
      :class="paginationClass"
      :current-page="currentPage"
      :layout="chart.props.pagination.layout"
      :page-size="pageSize"
      :page-sizes="chart.props.pagination.pageSizes"
      :total="totalRows"
      size="small"
      @current-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />
  </div>
</template>

<style scoped lang="scss">
.dr-analysis-table {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-style: solid;
}

.dr-analysis-table__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-bottom: 8px;
}

.dr-analysis-table__search {
  max-width: 240px;
}

.dr-analysis-table__column-settings {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}

.dr-analysis-table__table {
  flex: 1;
  min-height: 0;
}

.dr-analysis-table__cell {
  position: relative;
  min-height: 20px;
}

.dr-analysis-table__cell-bar {
  position: absolute;
  top: 50%;
  z-index: 0;
  transform: translateY(-50%);
  pointer-events: none;
}

.dr-analysis-table__cell-text {
  position: relative;
  z-index: 1;
  display: block;
  letter-spacing: 0;
  font-feature-settings: "tnum";
}

.dr-analysis-table__cell-text--ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dr-analysis-table__cell-text--wrap {
  white-space: normal;
  word-break: break-word;
}

.dr-analysis-table__cell-text--clip {
  overflow: hidden;
  white-space: nowrap;
}

.dr-analysis-table__cell-text--positive {
  color: var(--el-color-success);
}

.dr-analysis-table__cell-text--negative {
  color: var(--el-color-danger);
}

.dr-analysis-table__cell-text--flat {
  color: var(--el-text-color-secondary);
}

.dr-analysis-table__pagination {
  display: flex;
  padding-top: 8px;
}

.dr-analysis-table__pagination--topRight {
  justify-content: flex-end;
  padding-top: 0;
  padding-bottom: 8px;
}

.dr-analysis-table__pagination--bottomLeft {
  justify-content: flex-start;
}

.dr-analysis-table__pagination--bottomCenter {
  justify-content: center;
}

.dr-analysis-table__pagination--bottomRight {
  justify-content: flex-end;
}
</style>
