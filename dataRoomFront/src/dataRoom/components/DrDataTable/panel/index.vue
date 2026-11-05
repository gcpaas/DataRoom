<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrDataTableControlPanel',
})
</script>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mockDataset, type DrDataTableConfig, type DrDataTablePropsInterface } from '../install.ts'
import { tableColumnFields } from '../column-fields'
import { getDatasetFieldNames } from '@/dataRoom/components/_shared/metric-table-utils.ts'
import type { ValueFormat } from '@/dataRoom/components/_shared/metric-table-utils.ts'

const { chart } = defineProps<{
  chart: DrDataTableConfig
}>()
const chartConfig = computed(() => chart)
type ColumnStyle = NonNullable<DrDataTablePropsInterface['columnStyles']>[number]
const selectedField = ref('')
const availableFields = computed(() => tableColumnFields.get(chart)
  ?? (chart.dataset?.code
    ? getDatasetFieldNames(chart.dataset.fields, 'displayFields')
    : mockDataset.fields.map(field => field.bindName)))
watch(availableFields, fields => {
  if (!fields.includes(selectedField.value)) selectedField.value = fields[0] || ''
}, { immediate: true })
const selectedStyle = computed(() => chart.props.columnStyles?.find(style => style.field === selectedField.value))
const updateColumnStyle = <K extends Exclude<keyof ColumnStyle, 'field'>>(key: K, value: ColumnStyle[K]) => {
  if (!availableFields.value.includes(selectedField.value)) return
  const styles = chartConfig.value.props.columnStyles ??= []
  let style = styles.find(item => item.field === selectedField.value)
  if (!style) {
    style = { field: selectedField.value }
    styles.push(style)
  }
  if (value === undefined || value === null || value === '') delete style[key]
  else style[key] = value
}
const resetColumnStyle = () => {
  chartConfig.value.props.columnStyles = (chartConfig.value.props.columnStyles ?? []).filter(style => style.field !== selectedField.value)
}

const pickerColor = (color: string) => {
  const variable = /^var\((--[\w-]+)\)$/.exec(color)
  return variable ? getComputedStyle(document.documentElement).getPropertyValue(variable[1]!).trim() : color
}

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
  { label: '原始数值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
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
                  <el-color-picker :model-value="pickerColor(chartConfig.props.global.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.global.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker :model-value="pickerColor(chartConfig.props.global.borderColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.global.borderColor = value || ''" />
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
          <el-form-item label="密度">
            <el-select v-model="chartConfig.props.table.size">
              <el-option v-for="item in tableSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高">
            <el-input-number v-model="chartConfig.props.rowStyle.height" class="dr-config-panel__control" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="空文本">
            <el-input v-model="chartConfig.props.table.emptyText" clearable />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示与颜色</span>
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
              <template v-if="chartConfig.props.table.stripe">
                <el-form-item class="dr-config-panel__sub-form-item">
                  <div class="dr-config-panel__sub-row">
                    <span class="dr-config-panel__sub-label" title="第一行为奇数行">奇数行</span>
                    <el-color-picker :model-value="pickerColor(chartConfig.props.rowStyle.oddBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.oddBackgroundColor = value || ''" />
                  </div>
                </el-form-item>
                <el-form-item class="dr-config-panel__sub-form-item">
                  <div class="dr-config-panel__sub-row">
                    <span class="dr-config-panel__sub-label">偶数行</span>
                    <el-color-picker :model-value="pickerColor(chartConfig.props.rowStyle.evenBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.evenBackgroundColor = value || ''" />
                  </div>
                </el-form-item>
              </template>
              <el-form-item v-else class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">普通背景</span>
                  <el-color-picker :model-value="pickerColor(chartConfig.props.rowStyle.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">悬停</span>
                  <el-color-picker :model-value="pickerColor(chartConfig.props.rowStyle.hoverBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.hoverBackgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">分割线</span>
                  <el-color-picker :model-value="pickerColor(chartConfig.props.rowStyle.borderColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.borderColor = value || ''" />
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
                  <el-color-picker :model-value="pickerColor(chartConfig.props.headerStyle.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.headerStyle.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker :model-value="pickerColor(chartConfig.props.headerStyle.color)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.headerStyle.color = value || ''" />
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
                  <el-color-picker :model-value="pickerColor(chartConfig.props.cellStyle.color)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.cellStyle.color = value || ''" />
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

        <el-collapse-item title="列样式配置" name="columnStyles">
          <el-form-item label="选择列">
            <el-select v-model="selectedField" placeholder="暂无可配置字段" filterable>
              <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
            </el-select>
          </el-form-item>
          <template v-if="selectedField">
            <el-form-item label="表头名">
              <el-input :model-value="selectedStyle?.label || ''" :placeholder="selectedField" clearable @update:model-value="value => updateColumnStyle('label', value)" />
            </el-form-item>
            <el-form-item label="列宽">
              <el-input-number :model-value="selectedStyle?.width" :min="50" :max="2000" placeholder="自适应" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('width', value)" />
            </el-form-item>
            <el-form-item label="表头字号">
              <el-input-number :model-value="selectedStyle?.headerFontSize" :min="10" :max="72" placeholder="跟随全表" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('headerFontSize', value)" />
            </el-form-item>
            <el-form-item label="表头颜色">
              <el-color-picker :model-value="pickerColor(selectedStyle?.headerColor || chart.props.headerStyle.color)" show-alpha @update:model-value="(value: string | null) => updateColumnStyle('headerColor', value || undefined)" />
            </el-form-item>
            <el-form-item label="正文字号">
              <el-input-number :model-value="selectedStyle?.fontSize" :min="10" :max="72" placeholder="跟随全表" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('fontSize', value)" />
            </el-form-item>
            <el-form-item label="正文颜色">
              <el-color-picker :model-value="pickerColor(selectedStyle?.color || chart.props.cellStyle.color)" show-alpha @update:model-value="(value: string | null) => updateColumnStyle('color', value || undefined)" />
            </el-form-item>
            <el-form-item label="溢出提示">
              <el-select :model-value="selectedStyle?.showTooltip === undefined ? 'inherit' : selectedStyle.showTooltip ? 'on' : 'off'" @update:model-value="(value: string) => updateColumnStyle('showTooltip', value === 'inherit' ? undefined : value === 'on')">
                <el-option label="跟随全表" value="inherit" />
                <el-option label="开启" value="on" />
                <el-option label="关闭" value="off" />
              </el-select>
            </el-form-item>
            <el-text size="small" type="info">留空时沿用全表设置；列宽留空为自适应。溢出提示在省略模式下生效。</el-text>
            <el-button text type="primary" @click="resetColumnStyle">恢复本列默认</el-button>
          </template>
          <el-text v-else size="small" type="info">数据加载后可选择实际字段，不支持手动新增列。</el-text>
        </el-collapse-item>

        <el-collapse-item title="格式化" name="formatting">
          <el-form-item label="数字">
            <el-select v-model="chartConfig.props.formatting.defaultNumberFormat">
              <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
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
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-data-table-config-panel {
  padding: 0;
}

.dr-data-table-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
