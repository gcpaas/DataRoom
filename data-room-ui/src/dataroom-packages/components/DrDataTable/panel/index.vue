<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrDataTableControlPanel',
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrDataTableConfig } from '../install.ts'
import type { TableColumnConfig, ValueFormat } from '@/dataroom-packages/components/_shared/metric-table-utils.ts'

const { chart } = defineProps<{
  chart: DrDataTableConfig
}>()
const chartConfig = computed(() => chart)

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '加粗', value: 'bolder' },
]

const formatOptions: Array<{ label: string; value: ValueFormat }> = [
  { label: '文本', value: 'text' },
  { label: '原始数值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
  { label: '日期时间', value: 'date' },
]

const tableSizeOptions = [
  { label: '宽松', value: 'large' },
  { label: '默认', value: 'default' },
  { label: '紧凑', value: 'small' },
]

const overflowOptions = [
  { label: '省略', value: 'ellipsis' },
  { label: '换行', value: 'wrap' },
  { label: '裁切', value: 'clip' },
]

const paginationLayoutOptions = [
  { label: '页码', value: 'prev, pager, next' },
  { label: '总数 + 页码', value: 'total, prev, pager, next' },
  { label: '每页条数 + 页码', value: 'sizes, prev, pager, next' },
]

const paginationPositionOptions = [
  { label: '左下', value: 'bottomLeft' },
  { label: '居中下', value: 'bottomCenter' },
  { label: '右下', value: 'bottomRight' },
  { label: '右上', value: 'topRight' },
]

const sortOrderOptions = [
  { label: '不排序', value: 'none' },
  { label: '升序', value: 'ascending' },
  { label: '降序', value: 'descending' },
]

const fixedOptions = [
  { label: '不固定', value: '' },
  { label: '左固定', value: 'left' },
  { label: '右固定', value: 'right' },
]

const pageSizesText = computed({
  get: () => chartConfig.value.props.pagination.pageSizes.join(', '),
  set: value => {
    chartConfig.value.props.pagination.pageSizes = value
      .split(',')
      .map(item => Number(item.trim()))
      .filter(item => Number.isFinite(item) && item > 0)
  },
})

const searchFieldsText = computed({
  get: () => chartConfig.value.props.search.fields.join(', '),
  set: value => {
    chartConfig.value.props.search.fields = value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean)
  },
})

const addColumn = () => {
  chartConfig.value.props.table.columns.push({
    field: '',
    label: '新列',
    width: 120,
    minWidth: 100,
    align: 'left',
    fixed: '',
    format: 'text',
    visible: true,
  })
}

const removeColumn = (index: number) => {
  chartConfig.value.props.table.columns.splice(index, 1)
}

const moveColumn = (index: number, direction: -1 | 1) => {
  const columns = chartConfig.value.props.table.columns
  const targetIndex = index + direction
  if (targetIndex < 0 || targetIndex >= columns.length) {
    return
  }
  const [column] = columns.splice(index, 1)
  if (!column) {
    return
  }
  columns.splice(targetIndex, 0, column)
}

const columnTitle = (column: TableColumnConfig, index: number) => {
  return column.label || column.field || `列 ${index + 1}`
}
</script>

<template>
  <div class="dr-config-panel dr-data-table-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="全局配置" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>外观</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.global.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.global.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框宽</span>
                  <el-input-number v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="20" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-for="(label, index) in ['上', '右', '下', '左']" :key="label" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">{{ label }}</span>
                  <el-input-number v-model="chartConfig.props.global.padding[index]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="表格" name="table">
          <el-form-item label="自动列">
            <el-switch v-model="chartConfig.props.table.autoColumns" />
          </el-form-item>
          <el-form-item label="行键">
            <el-input v-model="chartConfig.props.table.rowKey" clearable placeholder="空值时使用数据集字段或行索引" />
          </el-form-item>
          <el-form-item label="密度">
            <el-select v-model="chartConfig.props.table.size">
              <el-option v-for="item in tableSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="空文本">
            <el-input v-model="chartConfig.props.table.emptyText" clearable />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示项</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框</span>
                  <el-switch v-model="chartConfig.props.table.border" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">斑马纹</span>
                  <el-switch v-model="chartConfig.props.table.stripe" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">撑满</span>
                  <el-switch v-model="chartConfig.props.table.fit" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">序号列</span>
                  <el-switch v-model="chartConfig.props.table.showIndex" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="手动列" name="columns">
          <el-form-item label="列配置">
            <el-button type="primary" plain @click="addColumn">新增列</el-button>
          </el-form-item>

          <div v-for="(column, index) in chartConfig.props.table.columns" :key="index" class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>{{ columnTitle(column, index) }}</span>
              <el-switch v-model="column.visible" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字段</span>
                  <el-input v-model="column.field" class="dr-config-panel__control" clearable />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">标题</span>
                  <el-input v-model="column.label" class="dr-config-panel__control" clearable />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="column.width" class="dr-config-panel__control" :min="0" :max="1000" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最小宽</span>
                  <el-input-number v-model="column.minWidth" class="dr-config-panel__control" :min="0" :max="1000" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">对齐</span>
                  <el-select v-model="column.align" class="dr-config-panel__control">
                    <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">固定</span>
                  <el-select v-model="column.fixed" class="dr-config-panel__control">
                    <el-option v-for="item in fixedOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式</span>
                  <el-select v-model="column.format" class="dr-config-panel__control">
                    <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-data-table-config-panel__column-actions">
                  <el-button plain :disabled="index === 0" @click="moveColumn(index, -1)">上移</el-button>
                  <el-button plain :disabled="index === chartConfig.props.table.columns.length - 1" @click="moveColumn(index, 1)">下移</el-button>
                  <el-button type="danger" plain @click="removeColumn(index)">删除</el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="表头样式" name="headerStyle">
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.headerStyle.height" class="dr-config-panel__control" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.headerStyle.textAlign">
              <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景</span>
                  <el-color-picker v-model="chartConfig.props.headerStyle.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.headerStyle.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.headerStyle.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.headerStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="行样式" name="rowStyle">
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.rowStyle.height" class="dr-config-panel__control" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">普通行</span>
                  <el-color-picker v-model="chartConfig.props.rowStyle.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">斑马纹</span>
                  <el-color-picker v-model="chartConfig.props.rowStyle.stripeBackgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">悬停</span>
                  <el-color-picker v-model="chartConfig.props.rowStyle.hoverBackgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">分割线</span>
                  <el-color-picker v-model="chartConfig.props.rowStyle.borderColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="单元格样式" name="cellStyle">
          <el-form-item label="溢出">
            <el-select v-model="chartConfig.props.cellStyle.overflow">
              <el-option v-for="item in overflowOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="提示">
            <el-switch v-model="chartConfig.props.cellStyle.showTooltip" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.cellStyle.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.cellStyle.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.cellStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-for="(label, index) in ['上', '右', '下', '左']" :key="label" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">{{ label }}</span>
                  <el-input-number v-model="chartConfig.props.cellStyle.padding[index]" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="搜索" name="search">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.search.show" />
          </el-form-item>
          <el-form-item label="占位">
            <el-input v-model="chartConfig.props.search.placeholder" clearable />
          </el-form-item>
          <el-form-item label="防抖">
            <el-input-number v-model="chartConfig.props.search.debounce" class="dr-config-panel__control" :min="0" :max="2000" controls-position="right" />
          </el-form-item>
          <el-form-item label="字段">
            <el-input v-model="searchFieldsText" clearable placeholder="逗号分隔，空值搜索全部字段" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="排序" name="sort">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.sort.enabled" />
          </el-form-item>
          <el-form-item label="字段">
            <el-input v-model="chartConfig.props.sort.defaultField" clearable />
          </el-form-item>
          <el-form-item label="方向">
            <el-select v-model="chartConfig.props.sort.defaultOrder">
              <el-option v-for="item in sortOrderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="分页" name="pagination">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.pagination.show" />
          </el-form-item>
          <el-form-item label="每页">
            <el-input-number v-model="chartConfig.props.pagination.pageSize" class="dr-config-panel__control" :min="1" :max="500" controls-position="right" />
          </el-form-item>
          <el-form-item label="可选">
            <el-input v-model="pageSizesText" clearable placeholder="例如 10, 20, 50, 100" />
          </el-form-item>
          <el-form-item label="布局">
            <el-select v-model="chartConfig.props.pagination.layout">
              <el-option v-for="item in paginationLayoutOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="位置">
            <el-select v-model="chartConfig.props.pagination.position">
              <el-option v-for="item in paginationPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="格式化" name="formatting">
          <el-form-item label="数字">
            <el-select v-model="chartConfig.props.formatting.defaultNumberFormat">
              <el-option v-for="item in formatOptions.filter(item => item.value !== 'text' && item.value !== 'date')" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-input v-model="chartConfig.props.formatting.dateFormat" clearable />
          </el-form-item>
          <el-form-item label="空值">
            <el-input v-model="chartConfig.props.formatting.nullText" clearable />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-data-table-config-panel {
  padding: 0;
}

.dr-data-table-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-data-table-config-panel__column-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  width: 100%;
}
</style>
