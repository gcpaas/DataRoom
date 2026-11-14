<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrDataTable',
})
</script>

<script setup lang="ts">
import { tooltipPopperStyle } from '../../theme/defaults'
import type { CSSProperties } from 'vue'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { tableColumnFields } from './column-fields'
import type { TableColumnCtx } from 'element-plus'
import { mockDataset, type DrDataTableConfig } from './install.ts'
import { shouldUseDefaultChartData } from '@/dataRoom/components/_shared/chart-data-defaults.ts'
import type { DatasetRow, TableColumnConfig } from '@/dataRoom/components/_shared/metric-table-utils.ts'
import {
  buildColumnsFromRows,
  formatMetricValue,
  getDatasetFieldNames,
  getFieldValue,
  normalizeRows,
} from '@/dataRoom/components/_shared/metric-table-utils.ts'
import { useDrComponent } from '@/dataRoom/hooks/use-dr-component'
import type { ComponentExpose } from '@/dataRoom/components/type/ComponentExpose.ts'

const { chart } = defineProps<{
  chart: DrDataTableConfig
}>()

const rawRows = ref<DatasetRow[]>([])
const usingMockData = ref(false)
const mockDisplayFields = mockDataset.fields
  .filter(field => field.name === 'displayFields')
  .map(field => field.bindName)

// 初次插入或解绑数据集时显示样例；绑定后立即清除样例，避免被误认为真实数据。
watch(() => chart.dataset?.code, () => {
  usingMockData.value = shouldUseDefaultChartData(chart)
  rawRows.value = usingMockData.value
    ? normalizeRows(mockDataset.dataset).map(row => ({ ...row }))
    : []
}, { immediate: true, flush: 'sync' })

const changeData = (datasetValue: unknown) => {
  usingMockData.value = false
  rawRows.value = normalizeRows(datasetValue)
}

const { canvasInst, expose } = useDrComponent({ chart, changeData })

const visibleColumns = computed(() => {
  const fields = getDatasetFieldNames(chart.dataset?.fields, 'displayFields')
  return buildColumnsFromRows(rawRows.value, usingMockData.value ? mockDisplayFields : fields)
})

watch(() => visibleColumns.value.map(column => column.field), fields => {
  tableColumnFields.set(chart, fields)
}, { immediate: true })
onBeforeUnmount(() => tableColumnFields.delete(chart))

const columnStyleMap = computed(() => new Map(
  (chart.props.columnStyles ?? []).map(style => [style.field, style]),
))
const getColumnStyle = (field: string) => columnStyleMap.value.get(field)
const getColumnTooltip = (field: string) => chart.props.cellStyle.overflow === 'ellipsis'
  && (getColumnStyle(field)?.showTooltip ?? chart.props.cellStyle.showTooltip)

const rootStyle = computed<CSSProperties>(() => {
  const global = chart.props.global
  return {
    padding: global.padding.map(value => `${value}px`).join(' '),
    backgroundColor: global.backgroundColor,
    border: `${global.borderWidth}px solid ${global.borderColor}`,
    borderRadius: `${global.borderRadius}px`,
  }
})

// 同步 Table 各层背景及文字变量，透明背景不会被内部默认底色遮挡。
const tableStyle = computed<CSSProperties>(() => ({
  '--el-table-bg-color': 'transparent',
  '--el-table-tr-bg-color': chart.props.rowStyle.backgroundColor,
  '--el-table-header-bg-color': chart.props.headerStyle.backgroundColor,
  '--el-table-text-color': chart.props.cellStyle.color,
  '--el-table-header-text-color': chart.props.headerStyle.color,
  '--el-table-row-hover-bg-color': chart.props.rowStyle.hoverBackgroundColor,
  // 外框伪元素使用 border-color，单元格分割线单独保留。
  '--el-table-border-color': 'transparent',
  '--el-table-border': `1px solid ${chart.props.rowStyle.borderColor}`,
}))

const formatCellValue = (row: DatasetRow, column: TableColumnConfig) => {
  const value = getFieldValue(row, column.field)
  return formatMetricValue(value, {
    format: value instanceof Date ? 'date' : typeof value === 'number' ? chart.props.formatting.defaultNumberFormat : 'text',
    dateFormat: chart.props.formatting.dateFormat,
    nullText: chart.props.formatting.nullText,
  })
}

const getHeaderCellStyle = ({ column }: { column: TableColumnCtx<DatasetRow> }): CSSProperties => {
  const style = chart.props.headerStyle
  const override = getColumnStyle(column.property)
  return {
    backgroundColor: style.backgroundColor,
    color: override?.headerColor || style.color,
    fontSize: `${override?.headerFontSize || style.fontSize}px`,
    fontWeight: style.fontWeight,
    textAlign: style.textAlign,
    letterSpacing: '0',
    height: style.height > 0 ? `${style.height}px` : undefined,
  }
}

// 不启用 Element Plus 内置 stripe，避免其单元格背景覆盖自定义行背景。
const getRowStyle = ({ rowIndex }: { rowIndex: number }): CSSProperties => {
  const style = chart.props.rowStyle
  return {
    backgroundColor: chart.props.table.stripe
      ? rowIndex % 2 === 0 ? style.oddBackgroundColor : style.evenBackgroundColor
      : style.backgroundColor,
    height: style.height > 0 ? `${style.height}px` : undefined,
  }
}

const getCellStyle = ({ column }: { column: TableColumnCtx<DatasetRow> }): CSSProperties => {
  const style = chart.props.cellStyle
  const override = getColumnStyle(column.property)
  return {
    color: override?.color || style.color,
    fontSize: `${override?.fontSize || style.fontSize}px`,
    fontWeight: style.fontWeight,
    // Tooltip 内容按整列宽度渲染，td 不能再叠加水平 padding。
    padding: `${style.padding[0]}px 0 ${style.padding[2]}px`,
    letterSpacing: '0',
  }
}

const cellContentStyle = computed<CSSProperties>(() => ({
  paddingLeft: `${chart.props.cellStyle.padding[3]}px`,
  paddingRight: `${chart.props.cellStyle.padding[1]}px`,
}))

const getCellClassName = () => `dr-data-table__cell dr-data-table__cell--${chart.props.cellStyle.overflow}`

const handleRowClick = (row: DatasetRow) => {
  canvasInst.triggerChartBehavior(chart.id, 'rowClick', {
    row,
    rowIndex: rawRows.value.indexOf(row),
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

defineExpose<ComponentExpose>({ ...expose })
</script>

<template>
  <div class="dr-data-table" :id="chart.id" :style="rootStyle">
    <el-table
      :tooltip-options="{ popperStyle: tooltipPopperStyle(chart.props.tooltip) }"
      class="dr-data-table__table"
      :style="tableStyle"
      :data="rawRows"
      height="100%"
      :size="chart.props.table.size"
      :border="chart.props.table.border"
      :fit="chart.props.table.fit"
      :empty-text="chart.props.table.emptyText"
      :header-cell-style="getHeaderCellStyle"
      :row-style="getRowStyle"
      :cell-style="getCellStyle"
      :cell-class-name="getCellClassName"
      @row-click="handleRowClick"
      @cell-click="handleCellClick"
    >
      <el-table-column v-if="chart.props.table.showIndex" type="index" width="56" align="center" />
      <el-table-column
        v-for="column in visibleColumns"
        :key="column.field"
        :prop="column.field"
        :label="getColumnStyle(column.field)?.label || column.label"
        :width="getColumnStyle(column.field)?.width || undefined"
        :min-width="chart.props.table.fit ? 1 : 100"
        :show-overflow-tooltip="getColumnTooltip(column.field)"
      >
        <template #default="{ row }">
          <span class="dr-data-table__cell-content" :style="cellContentStyle">{{ formatCellValue(row, column) }}</span>
        </template>
      </el-table-column>
    </el-table>
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

.dr-data-table__table {
  flex: 1 1 auto;
  width: 100%;
  min-width: 0;
  min-height: 0;
  font-feature-settings: 'tnum';
}

.dr-data-table__cell-content {
  box-sizing: border-box;
  width: 100%;
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
