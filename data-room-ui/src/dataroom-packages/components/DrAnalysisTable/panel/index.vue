<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrAnalysisTableControlPanel',
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrAnalysisTableConfig } from '../install.ts'
import type { AggregationMethod, ConditionalOperator, TableColumnConfig, ValueFormat } from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

const { chart } = defineProps<{
  chart: DrAnalysisTableConfig
}>()

const chartConfig = computed(() => chart)
type SortOrderValue = DrAnalysisTableConfig['props']['sort']['defaultSorts'][number]['order']

const formatOptions: Array<{ label: string; value: ValueFormat }> = [
  { label: '文本', value: 'text' },
  { label: '数值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '1位小数', value: 'float1' },
  { label: '2位小数', value: 'float2' },
  { label: '百分比', value: 'percent2' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
  { label: '日期', value: 'date' },
]

const aggregationOptions: Array<{ label: string; value: AggregationMethod }> = [
  { label: '求和', value: 'sum' },
  { label: '平均', value: 'avg' },
  { label: '最小', value: 'min' },
  { label: '最大', value: 'max' },
  { label: '计数', value: 'count' },
]

const operatorOptions: Array<{ label: string; value: ConditionalOperator }> = [
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
  { label: '等于', value: '=' },
  { label: '不等于', value: '!=' },
  { label: '包含', value: 'contains' },
  { label: '为空', value: 'empty' },
  { label: '非空', value: 'notEmpty' },
]

const toArrayText = (value: string[]) => value.join(',')
const parseArrayText = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean)

const dimensionsText = computed({
  get: () => toArrayText(chartConfig.value.props.analysis.dimensions),
  set: value => {
    chartConfig.value.props.analysis.dimensions = parseArrayText(value)
  },
})

const metricsText = computed({
  get: () => toArrayText(chartConfig.value.props.analysis.metrics),
  set: value => {
    chartConfig.value.props.analysis.metrics = parseArrayText(value)
  },
})

const percentMetricsText = computed({
  get: () => toArrayText(chartConfig.value.props.analysis.percentMetrics),
  set: value => {
    chartConfig.value.props.analysis.percentMetrics = parseArrayText(value)
  },
})

const searchFieldsText = computed({
  get: () => toArrayText(chartConfig.value.props.search.fields),
  set: value => {
    chartConfig.value.props.search.fields = parseArrayText(value)
  },
})

const cellBarFieldsText = computed({
  get: () => toArrayText(chartConfig.value.props.cellBars.fields),
  set: value => {
    chartConfig.value.props.cellBars.fields = parseArrayText(value)
  },
})

const pageSizesText = computed({
  get: () => chartConfig.value.props.pagination.pageSizes.join(','),
  set: value => {
    chartConfig.value.props.pagination.pageSizes = parseArrayText(value).map(Number).filter(Number.isFinite)
  },
})

const defaultSortsText = computed({
  get: () => chartConfig.value.props.sort.defaultSorts.map(item => `${item.field}:${item.order}`).join(','),
  set: value => {
    chartConfig.value.props.sort.defaultSorts = parseArrayText(value)
      .map(item => {
        const [field = '', order = 'ascending'] = item.split(':').map(part => part.trim())
        const normalizedOrder: SortOrderValue = order === 'descending' || order === 'none' ? order : 'ascending'
        return {
          field,
          order: normalizedOrder,
        }
      })
      .filter(item => item.field)
  },
})

const addColumn = () => {
  chartConfig.value.props.columns.columnConfig.push({
    field: '',
    label: '新列',
    width: 140,
    minWidth: 100,
    align: 'left',
    fixed: '',
    visible: true,
    format: 'text',
  })
}

const removeColumn = (index: number) => {
  chartConfig.value.props.columns.columnConfig.splice(index, 1)
}

const moveColumn = (index: number, direction: -1 | 1) => {
  const nextIndex = index + direction
  const columns = chartConfig.value.props.columns.columnConfig
  if (nextIndex < 0 || nextIndex >= columns.length) {
    return
  }
  const [column] = columns.splice(index, 1)
  if (column) {
    columns.splice(nextIndex, 0, column)
  }
}

const addAggregation = () => {
  chartConfig.value.props.analysis.metricAggregations.push({ field: '', method: 'sum' })
}

const removeAggregation = (index: number) => {
  chartConfig.value.props.analysis.metricAggregations.splice(index, 1)
}

const addSummaryMethod = () => {
  chartConfig.value.props.summary.methods.push({ field: '', method: 'sum' })
}

const removeSummaryMethod = (index: number) => {
  chartConfig.value.props.summary.methods.splice(index, 1)
}

const addConditionalRule = () => {
  chartConfig.value.props.conditionalFormatting.rules.push({
    field: '',
    operator: '>=',
    value: 0,
    target: 'cell',
    textColor: '#67c23a',
    backgroundColor: 'rgba(0, 0, 0, 0)',
  })
}

const removeConditionalRule = (index: number) => {
  chartConfig.value.props.conditionalFormatting.rules.splice(index, 1)
}

const columnConfig = computed<TableColumnConfig[]>(() => chartConfig.value.props.columns.columnConfig)
</script>

<template>
  <div class="dr-config-panel dr-analysis-table-config-panel">
    <el-form
      class="dr-config-panel__form"
      :model="chartConfig"
      label-width="60px"
      size="small"
      label-position="left"
    >
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="全局配置" name="global">
          <el-form-item label="内边距">
            <el-input-number v-model="chartConfig.props.global.padding[0]" :min="0" :max="80" controls-position="right" />
            <el-input-number v-model="chartConfig.props.global.padding[1]" :min="0" :max="80" controls-position="right" />
            <el-input-number v-model="chartConfig.props.global.padding[2]" :min="0" :max="80" controls-position="right" />
            <el-input-number v-model="chartConfig.props.global.padding[3]" :min="0" :max="80" controls-position="right" />
          </el-form-item>
          <el-form-item label="背景">
            <el-color-picker v-model="chartConfig.props.global.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框色">
            <el-color-picker v-model="chartConfig.props.global.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框">
            <el-input-number v-model="chartConfig.props.global.borderWidth" :min="0" :max="20" controls-position="right" />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number v-model="chartConfig.props.global.borderRadius" :min="0" :max="40" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="表格" name="table">
          <el-form-item label="行键">
            <el-input v-model="chartConfig.props.table.rowKey" clearable />
          </el-form-item>
          <el-form-item label="密度">
            <el-select v-model="chartConfig.props.table.size">
              <el-option label="宽松" value="large" />
              <el-option label="默认" value="default" />
              <el-option label="紧凑" value="small" />
            </el-select>
          </el-form-item>
          <el-form-item label="边框">
            <el-switch v-model="chartConfig.props.table.border" />
          </el-form-item>
          <el-form-item label="斑马纹">
            <el-switch v-model="chartConfig.props.table.stripe" />
          </el-form-item>
          <el-form-item label="自适应">
            <el-switch v-model="chartConfig.props.table.fit" />
          </el-form-item>
          <el-form-item label="序号列">
            <el-switch v-model="chartConfig.props.table.showIndex" />
          </el-form-item>
          <el-form-item label="多选列">
            <el-switch v-model="chartConfig.props.table.showSelection" />
          </el-form-item>
          <el-form-item label="空文本">
            <el-input v-model="chartConfig.props.table.emptyText" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="分析" name="analysis">
          <el-form-item label="模式">
            <el-radio-group v-model="chartConfig.props.analysis.mode">
              <el-radio-button label="raw">明细</el-radio-button>
              <el-radio-button label="aggregate">聚合</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="维度">
            <el-input v-model="dimensionsText" placeholder="字段名用逗号分隔" />
          </el-form-item>
          <el-form-item label="指标">
            <el-input v-model="metricsText" placeholder="字段名用逗号分隔" />
          </el-form-item>
          <el-form-item label="百分比">
            <el-input v-model="percentMetricsText" placeholder="字段名用逗号分隔" />
          </el-form-item>
          <el-form-item label="占比基准">
            <el-select v-model="chartConfig.props.analysis.percentBase">
              <el-option label="列总计" value="columnTotal" />
              <el-option label="可见行" value="visibleRows" />
              <el-option label="自定义总数" value="customTotal" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>聚合方法</span>
              <el-button text type="primary" @click="addAggregation">添加</el-button>
            </div>
            <el-form
              class="dr-config-panel__sub-form"
              :model="chartConfig"
              label-width="72px"
              size="small"
              label-position="left"
            >
              <div
                v-for="(item, index) in chartConfig.props.analysis.metricAggregations"
                :key="index"
                class="dr-analysis-table-config-panel__list-row"
              >
                <el-input v-model="item.field" placeholder="字段" />
                <el-select v-model="item.method">
                  <el-option v-for="option in aggregationOptions" :key="option.value" :label="option.label" :value="option.value" />
                </el-select>
                <el-button text type="danger" @click="removeAggregation(index)">删除</el-button>
              </div>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="列配置" name="columns">
          <el-form-item label="自动列">
            <el-switch v-model="chartConfig.props.columns.autoColumns" />
          </el-form-item>
          <el-form-item label="列设置">
            <el-switch v-model="chartConfig.props.columns.showColumnSettings" />
          </el-form-item>
          <el-form-item label="拖宽">
            <el-switch v-model="chartConfig.props.columns.allowResize" />
          </el-form-item>
          <el-form-item label="排序">
            <el-switch v-model="chartConfig.props.columns.allowReorder" />
          </el-form-item>
          <el-form-item label="隐藏">
            <el-switch v-model="chartConfig.props.columns.allowHide" />
          </el-form-item>
          <el-form-item label="持久化">
            <el-switch v-model="chartConfig.props.columns.persistState" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>手动列</span>
              <el-button text type="primary" @click="addColumn">添加</el-button>
            </div>
            <div
              v-for="(column, index) in columnConfig"
              :key="index"
              class="dr-analysis-table-config-panel__column-card"
            >
              <el-input v-model="column.field" placeholder="字段" />
              <el-input v-model="column.label" placeholder="标题" />
              <el-select v-model="column.align">
                <el-option label="左" value="left" />
                <el-option label="中" value="center" />
                <el-option label="右" value="right" />
              </el-select>
              <el-select v-model="column.format">
                <el-option v-for="option in formatOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <el-input-number v-model="column.width" :min="60" :max="600" controls-position="right" />
              <el-input-number v-model="column.minWidth" :min="40" :max="600" controls-position="right" />
              <el-select v-model="column.fixed">
                <el-option label="不固定" value="" />
                <el-option label="左固定" value="left" />
                <el-option label="右固定" value="right" />
              </el-select>
              <el-switch v-model="column.visible" />
              <el-button text :disabled="!chartConfig.props.columns.allowReorder || index === 0" @click="moveColumn(index, -1)">上移</el-button>
              <el-button text :disabled="!chartConfig.props.columns.allowReorder || index === columnConfig.length - 1" @click="moveColumn(index, 1)">下移</el-button>
              <el-button text type="danger" @click="removeColumn(index)">删除</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="搜索" name="search">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.search.show" />
          </el-form-item>
          <el-form-item label="占位">
            <el-input v-model="chartConfig.props.search.placeholder" />
          </el-form-item>
          <el-form-item label="字段">
            <el-input v-model="searchFieldsText" placeholder="空值表示全部字段" />
          </el-form-item>
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.search.mode">
              <el-option label="前端搜索" value="client" />
              <el-option label="数据集参数" value="datasetParams" />
            </el-select>
          </el-form-item>
          <el-form-item label="防抖">
            <el-input-number v-model="chartConfig.props.search.debounce" :min="0" :max="2000" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="排序" name="sort">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.sort.enabled" />
          </el-form-item>
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.sort.mode">
              <el-option label="前端排序" value="client" />
              <el-option label="数据集参数" value="datasetParams" />
            </el-select>
          </el-form-item>
          <el-form-item label="多列">
            <el-switch v-model="chartConfig.props.sort.multiSort" />
          </el-form-item>
          <el-form-item label="默认">
            <el-input v-model="defaultSortsText" placeholder="字段:ascending,字段:descending" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="分页" name="pagination">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.pagination.show" />
          </el-form-item>
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.pagination.mode">
              <el-option label="前端分页" value="client" />
              <el-option label="数据集参数" value="datasetParams" />
            </el-select>
          </el-form-item>
          <el-form-item label="每页">
            <el-input-number v-model="chartConfig.props.pagination.pageSize" :min="1" :max="1000" controls-position="right" />
          </el-form-item>
          <el-form-item label="选项">
            <el-input v-model="pageSizesText" />
          </el-form-item>
          <el-form-item label="布局">
            <el-select v-model="chartConfig.props.pagination.layout">
              <el-option label="简洁" value="prev, pager, next" />
              <el-option label="含总数" value="total, prev, pager, next" />
              <el-option label="完整" value="total, sizes, prev, pager, next" />
            </el-select>
          </el-form-item>
          <el-form-item label="位置">
            <el-select v-model="chartConfig.props.pagination.position">
              <el-option label="左下" value="bottomLeft" />
              <el-option label="居中" value="bottomCenter" />
              <el-option label="右下" value="bottomRight" />
              <el-option label="右上" value="topRight" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="合计行" name="summary">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.summary.show" />
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="chartConfig.props.summary.label" />
          </el-form-item>
          <el-form-item label="位置">
            <el-radio-group v-model="chartConfig.props.summary.position">
              <el-radio-button label="bottom">底部</el-radio-button>
              <el-radio-button label="top">顶部</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>合计方法</span>
              <el-button text type="primary" @click="addSummaryMethod">添加</el-button>
            </div>
            <div
              v-for="(item, index) in chartConfig.props.summary.methods"
              :key="index"
              class="dr-analysis-table-config-panel__list-row"
            >
              <el-input v-model="item.field" placeholder="字段" />
              <el-select v-model="item.method">
                <el-option v-for="option in aggregationOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <el-button text type="danger" @click="removeSummaryMethod(index)">删除</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="数据条" name="cellBars">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.cellBars.show" />
          </el-form-item>
          <el-form-item label="字段">
            <el-input v-model="cellBarFieldsText" placeholder="空值表示所有数值字段" />
          </el-form-item>
          <el-form-item label="正负">
            <el-switch v-model="chartConfig.props.cellBars.alignPositiveNegative" />
          </el-form-item>
          <el-form-item label="正值色">
            <el-color-picker v-model="chartConfig.props.cellBars.positiveColor" show-alpha />
          </el-form-item>
          <el-form-item label="负值色">
            <el-color-picker v-model="chartConfig.props.cellBars.negativeColor" show-alpha />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.cellBars.barHeight" :min="10" :max="100" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="条件格式" name="conditionalFormatting">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.conditionalFormatting.enabled" />
          </el-form-item>
          <el-form-item label="趋势色">
            <el-select v-model="chartConfig.props.conditionalFormatting.basicTrendColor">
              <el-option label="无" value="none" />
              <el-option label="上涨为绿" value="increaseGreen" />
              <el-option label="上涨为红" value="increaseRed" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>规则</span>
              <el-button text type="primary" @click="addConditionalRule">添加</el-button>
            </div>
            <div
              v-for="(rule, index) in chartConfig.props.conditionalFormatting.rules"
              :key="index"
              class="dr-analysis-table-config-panel__rule-card"
            >
              <el-input v-model="rule.field" placeholder="字段" />
              <el-select v-model="rule.operator">
                <el-option v-for="option in operatorOptions" :key="option.value" :label="option.label" :value="option.value" />
              </el-select>
              <el-input v-model="rule.value" placeholder="比较值" />
              <el-select v-model="rule.target">
                <el-option label="单元格" value="cell" />
                <el-option label="整行" value="row" />
              </el-select>
              <el-color-picker v-model="rule.textColor" show-alpha />
              <el-color-picker v-model="rule.backgroundColor" show-alpha />
              <el-button text type="danger" @click="removeConditionalRule(index)">删除</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="表头样式" name="headerStyle">
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.headerStyle.height" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="背景">
            <el-color-picker v-model="chartConfig.props.headerStyle.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="文字色">
            <el-color-picker v-model="chartConfig.props.headerStyle.color" show-alpha />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.headerStyle.fontSize" :min="10" :max="36" controls-position="right" />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.headerStyle.fontWeight">
              <el-option label="常规" value="normal" />
              <el-option label="强调" value="bold" />
              <el-option label="更强" value="bolder" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="行样式" name="rowStyle">
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.rowStyle.height" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="背景">
            <el-color-picker v-model="chartConfig.props.rowStyle.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="斑马纹">
            <el-color-picker v-model="chartConfig.props.rowStyle.stripeBackgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="悬停">
            <el-color-picker v-model="chartConfig.props.rowStyle.hoverBackgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="选中">
            <el-color-picker v-model="chartConfig.props.rowStyle.selectedBackgroundColor" show-alpha />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="单元格样式" name="cellStyle">
          <el-form-item label="文字色">
            <el-color-picker v-model="chartConfig.props.cellStyle.color" show-alpha />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.cellStyle.fontSize" :min="10" :max="36" controls-position="right" />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.cellStyle.fontWeight">
              <el-option label="常规" value="normal" />
              <el-option label="强调" value="bold" />
              <el-option label="更强" value="bolder" />
            </el-select>
          </el-form-item>
          <el-form-item label="内边距">
            <el-input-number v-model="chartConfig.props.cellStyle.padding[0]" :min="0" :max="40" controls-position="right" />
            <el-input-number v-model="chartConfig.props.cellStyle.padding[1]" :min="0" :max="40" controls-position="right" />
            <el-input-number v-model="chartConfig.props.cellStyle.padding[2]" :min="0" :max="40" controls-position="right" />
            <el-input-number v-model="chartConfig.props.cellStyle.padding[3]" :min="0" :max="40" controls-position="right" />
          </el-form-item>
          <el-form-item label="溢出">
            <el-select v-model="chartConfig.props.cellStyle.overflow">
              <el-option label="省略" value="ellipsis" />
              <el-option label="换行" value="wrap" />
              <el-option label="裁切" value="clip" />
            </el-select>
          </el-form-item>
          <el-form-item label="提示">
            <el-switch v-model="chartConfig.props.cellStyle.showTooltip" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-analysis-table-config-panel {
  padding: 0;
}

.dr-analysis-table-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-analysis-table-config-panel__list-row,
.dr-analysis-table-config-panel__column-card,
.dr-analysis-table-config-panel__rule-card {
  display: grid;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.dr-analysis-table-config-panel__list-row {
  grid-template-columns: minmax(0, 1fr) 96px auto;
}

.dr-analysis-table-config-panel__column-card {
  grid-template-columns: minmax(0, 1fr);
}

.dr-analysis-table-config-panel__rule-card {
  grid-template-columns: minmax(0, 1fr);
}
</style>
