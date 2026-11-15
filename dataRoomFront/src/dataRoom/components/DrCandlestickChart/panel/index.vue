<script setup lang="ts">
import { UP_COLOR, DOWN_COLOR } from '../defaults'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import { computed } from 'vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import type { DrCandlestickChartConfig } from '../install'

defineOptions({ name: 'DrCandlestickChartControlPanel' })
const { chart } = defineProps<{ chart: DrCandlestickChartConfig }>()
const chartConfig = computed(() => chart)
</script>

<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section" model-value="series">
        <ConfigCollapseItem title="K线样式" name="series">
          <DrFieldRow label="上涨颜色">
            <DrColorField :model-value="chartConfig.props.series.upColor" show-alpha @update:model-value="chartConfig.props.series.upColor = $event || UP_COLOR" />
          </DrFieldRow>
          <DrFieldRow label="下跌颜色">
            <DrColorField :model-value="chartConfig.props.series.downColor" show-alpha @update:model-value="chartConfig.props.series.downColor = $event || DOWN_COLOR" />
          </DrFieldRow>
          <DrFieldRow label="上涨空心"><el-switch v-model="chartConfig.props.series.upHollow" /></DrFieldRow>
          <DrFieldRow label="下跌空心"><el-switch v-model="chartConfig.props.series.downHollow" /></DrFieldRow>
          <DrFieldRow label="最大柱宽">
            <DrNumberField v-model="chartConfig.props.series.barMaxWidth" class="dr-config-panel__control" :min="1" :max="200" controls-position="right"><template #suffix>px</template></DrNumberField>
          </DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="横轴" name="xAxis">
          <DrFieldRow label="显示"><el-switch v-model="chartConfig.props.xAxis.show" /></DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴标签">
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props.xAxis.labelShow" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.xAxis.fontSize" class="dr-config-panel__control" :min="10" :max="48" controls-position="right" aria-label="横轴标签字号"><template #suffix>px</template></DrNumberField></template>
                <template #second><DrColorField v-model="chartConfig.props.xAxis.color" show-alpha aria-label="横轴标签颜色" /></template>
              </DrFieldRow>
            </div>
          </div>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="纵轴" name="yAxis">
          <DrFieldRow label="显示"><el-switch v-model="chartConfig.props.yAxis.show" /></DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item label="轴标签">
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props.yAxis.labelShow" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.fontSize" class="dr-config-panel__control" :min="10" :max="48" controls-position="right" aria-label="纵轴标签字号"><template #suffix>px</template></DrNumberField></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.color" show-alpha aria-label="纵轴标签颜色" /></template>
              </DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item label="网格线">
              <template #label><span class="dr-config-panel__group-title">网格线</span></template>
              <el-switch v-model="chartConfig.props.yAxis.splitLineShow" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.yAxis.splitLineWidth" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" aria-label="纵轴网格线宽度"><template #suffix>px</template></DrNumberField></template>
                <template #second><DrColorField v-model="chartConfig.props.yAxis.splitLineColor" show-alpha aria-label="纵轴网格线颜色" /></template>
              </DrFieldRow>
              <DrFieldRow label="样式">
                <DrSelectField v-model="chartConfig.props.yAxis.splitLineType" class="dr-config-panel__control" aria-label="纵轴网格线类型">
                  <el-option label="实线" value="solid" />
                  <el-option label="虚线" value="dashed" />
                  <el-option label="点线" value="dotted" />
                </DrSelectField>
              </DrFieldRow>
            </div>
          </div>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="提示框" name="tooltip">
          <DrFieldRow label="显示"><el-switch v-model="chartConfig.props.tooltip.show" /></DrFieldRow>
          <DrFieldRow label="背景色"><DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha /></DrFieldRow>
          <DrFieldRow label="边框色"><DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha /></DrFieldRow>
          <DrFieldRow label="字体" paired variant="number-color">
            <template #first><DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" aria-label="提示框字号"><template #suffix>px</template></DrNumberField></template>
            <template #second><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" /></template>
          </DrFieldRow>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>
