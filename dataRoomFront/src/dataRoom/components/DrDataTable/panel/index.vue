<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrDataTableControlPanel',
})
</script>

<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="全局配置" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>外观</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField :model-value="pickerColor(chartConfig.props.global.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.global.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <DrFieldRow label="边框" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="20" controls-position="right" aria-label="边框宽度"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField :model-value="pickerColor(chartConfig.props.global.borderColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.global.borderColor = value || ''" aria-label="边框颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" label="右" /></template>
          </DrFieldRow>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="表格" name="table">
          <el-form-item label="密度">
            <DrSelectField v-model="chartConfig.props.table.size">
              <el-option v-for="item in tableSizeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="行高">
            <DrNumberField v-model="chartConfig.props.rowStyle.height" class="dr-config-panel__control" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="空文本">
            <DrInputField v-model="chartConfig.props.table.emptyText" clearable />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">边框</span>
                  <el-switch v-model="chartConfig.props.table.border" />
                </div>
              </el-form-item>
              <el-form-item label="斑马纹" class="dr-config-panel__sub-form-item" label-width="72px">
                <template #label><span class="dr-config-panel__group-title">斑马纹</span></template>
                <el-switch v-model="chartConfig.props.table.stripe" />
              </el-form-item>
              <template v-if="chartConfig.props.table.stripe">
                <DrFieldRow label="奇数 / 偶数" paired variant="equal" title="第一行为奇数行">
                  <template #first>
                    <DrColorField :model-value="pickerColor(chartConfig.props.rowStyle.oddBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.oddBackgroundColor = value || ''" aria-label="奇数行背景" />
                  </template>
                  <template #second>
                    <DrColorField :model-value="pickerColor(chartConfig.props.rowStyle.evenBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.evenBackgroundColor = value || ''" aria-label="偶数行背景" />
                  </template>
                </DrFieldRow>
              </template>
              <el-form-item v-else class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">普通背景</span>
                  <DrColorField :model-value="pickerColor(chartConfig.props.rowStyle.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">悬停</span>
                  <DrColorField :model-value="pickerColor(chartConfig.props.rowStyle.hoverBackgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.hoverBackgroundColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">分割线</span>
                  <DrColorField :model-value="pickerColor(chartConfig.props.rowStyle.borderColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.rowStyle.borderColor = value || ''" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">撑满</span>
                  <el-switch v-model="chartConfig.props.table.fit" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">序号列</span>
                  <el-switch v-model="chartConfig.props.table.showIndex" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="表头样式" name="headerStyle">
          <el-form-item label="高度">
            <DrNumberField v-model="chartConfig.props.headerStyle.height" class="dr-config-panel__control" :min="0" :max="120" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <DrSelectField v-model="chartConfig.props.headerStyle.textAlign">
              <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文字</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景</span>
                  <DrColorField :model-value="pickerColor(chartConfig.props.headerStyle.backgroundColor)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.headerStyle.backgroundColor = value || ''" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.headerStyle.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" aria-label="表头字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField :model-value="pickerColor(chartConfig.props.headerStyle.color)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.headerStyle.color = value || ''" aria-label="表头颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.headerStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="单元格样式" name="cellStyle">
          <el-form-item label="溢出">
            <DrSelectField v-model="chartConfig.props.cellStyle.overflow">
              <el-option v-for="item in overflowOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="提示">
            <el-switch v-model="chartConfig.props.cellStyle.showTooltip" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文字</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.cellStyle.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" aria-label="单元格字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField :model-value="pickerColor(chartConfig.props.cellStyle.color)" show-alpha @update:model-value="(value: string | null) => chartConfig.props.cellStyle.color = value || ''" aria-label="单元格颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.cellStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="垂直边距" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.cellStyle.padding[0]" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" label="上" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.cellStyle.padding[2]" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" label="下" /></template>
              </DrFieldRow>
              <DrFieldRow label="水平边距" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.cellStyle.padding[3]" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" label="左" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.cellStyle.padding[1]" class="dr-config-panel__control" :min="0" :max="40" controls-position="right" label="右" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="列样式配置" name="columnStyles">
          <el-form-item label="选择列">
            <DrSelectField v-model="selectedField" placeholder="暂无可配置字段" filterable>
              <el-option v-for="field in availableFields" :key="field" :label="field" :value="field" />
            </DrSelectField>
          </el-form-item>
          <template v-if="selectedField">
            <el-form-item label="表头名">
              <DrInputField :model-value="selectedStyle?.label || ''" :placeholder="selectedField" clearable @update:model-value="value => updateColumnStyle('label', value)" />
            </el-form-item>
            <el-form-item label="列宽">
              <DrNumberField :model-value="selectedStyle?.width" :min="50" :max="2000" placeholder="自适应" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('width', value)" />
            </el-form-item>
            <DrFieldRow label="表头字体" paired variant="number-color">
              <template #first>
                <DrNumberField :model-value="selectedStyle?.headerFontSize" :min="10" :max="72" placeholder="跟随全表" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('headerFontSize', value)" aria-label="本列表头字号"><template #suffix>px</template></DrNumberField>
              </template>
              <template #second>
                <DrColorField :model-value="pickerColor(selectedStyle?.headerColor || chart.props.headerStyle.color)" show-alpha @update:model-value="(value: string | null) => updateColumnStyle('headerColor', value || undefined)" aria-label="本列表头颜色" />
              </template>
            </DrFieldRow>
            <DrFieldRow label="正文字体" paired variant="number-color">
              <template #first>
                <DrNumberField :model-value="selectedStyle?.fontSize" :min="10" :max="72" placeholder="跟随全表" controls-position="right" @update:model-value="(value: number | undefined) => updateColumnStyle('fontSize', value)" aria-label="本列正文字号"><template #suffix>px</template></DrNumberField>
              </template>
              <template #second>
                <DrColorField :model-value="pickerColor(selectedStyle?.color || chart.props.cellStyle.color)" show-alpha @update:model-value="(value: string | null) => updateColumnStyle('color', value || undefined)" aria-label="本列正文颜色" />
              </template>
            </DrFieldRow>
            <el-form-item label="溢出提示">
              <DrSelectField :model-value="selectedStyle?.showTooltip === undefined ? 'inherit' : selectedStyle.showTooltip ? 'on' : 'off'" @update:model-value="(value: string) => updateColumnStyle('showTooltip', value === 'inherit' ? undefined : value === 'on')">
                <el-option label="跟随全表" value="inherit" />
                <el-option label="开启" value="on" />
                <el-option label="关闭" value="off" />
              </DrSelectField>
            </el-form-item>
            <el-text class="config-panel-text" size="small" type="info">留空时沿用全表设置；列宽留空为自适应。溢出提示在省略模式下生效。</el-text>
            <el-button class="config-panel-text" text type="primary" @click="resetColumnStyle">恢复本列默认</el-button>
          </template>
          <el-text class="config-panel-text" v-else size="small" type="info">数据加载后可选择实际字段，不支持手动新增列。</el-text>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="格式化" name="formatting">
          <el-form-item label="数字">
            <DrSelectField v-model="chartConfig.props.formatting.defaultNumberFormat">
              <el-option v-for="item in formatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="日期">
            <DrInputField v-model="chartConfig.props.formatting.dateFormat" clearable />
          </el-form-item>
          <el-form-item label="空值">
            <DrInputField v-model="chartConfig.props.formatting.nullText" clearable />
          </el-form-item>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-data-table-config-panel {
  padding: 0;
}

.dr-data-table-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
