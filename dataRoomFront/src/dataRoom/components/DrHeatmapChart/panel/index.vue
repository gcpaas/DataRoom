<script setup lang="ts">
import { upgradeHeatmapProps } from '../heatmap-config'
import { computed } from 'vue'
import DrInputField from '../../../designer/components/DrInputField.vue'
import DrSelectField from '../../../designer/components/DrSelectField.vue'
import DrNumberField from '../../../designer/components/DrNumberField.vue'
import DrColorField from '../../../designer/components/DrColorField.vue'
import DrFieldRow from '../../../designer/components/DrFieldRow.vue'
import ConfigCollapse from '../../../designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '../../../designer/components/ConfigCollapseItem.vue'
import type { DrHeatmapChartConfig } from '../install'

defineOptions({ name: 'DrHeatmapChartControlPanel' })
const { chart } = defineProps<{ chart: DrHeatmapChartConfig }>()
upgradeHeatmapProps(chart.props)
const chartConfig = computed(() => chart)
const axes = [
  { key: 'xAxis', label: 'X 轴' },
  { key: 'yAxis', label: 'Y 轴' },
] as const
const invalidRange = computed(() => !Number.isFinite(chart.props.series.min) || !Number.isFinite(chart.props.series.max) || chart.props.series.min >= chart.props.series.max)
</script>

<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem v-for="axis in axes" :key="axis.key" :title="axis.label" :name="axis.key">
          <DrFieldRow label="显示"><el-switch v-model="chartConfig.props[axis.key].show" /></DrFieldRow>
          <DrFieldRow label="名称"><DrInputField v-model="chartConfig.props[axis.key].name" /></DrFieldRow>
          <DrFieldRow label="名称字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props[axis.key].nameTextStyle.fontSize" class="dr-config-panel__control" :min="1" :max="72" :aria-label="`${axis.label}名称字号`">
                <template #suffix>px</template>
              </DrNumberField>
            </template>
            <template #second><DrColorField v-model="chartConfig.props[axis.key].nameTextStyle.color" show-alpha :aria-label="`${axis.label}名称颜色`" /></template>
          </DrFieldRow>
          <DrFieldRow label="反向"><el-switch v-model="chartConfig.props[axis.key].inverse" /></DrFieldRow>
          <DrFieldRow label="类目顺序">
            <DrSelectField
              v-model="chartConfig.props[axis.key].categories"
              multiple
              filterable
              allow-create
              default-first-option
              class="dr-config-panel__control"
              placeholder="留空按数据顺序，输入后回车添加"
              :aria-label="`${axis.label}类目顺序`"
            >
              <el-option v-for="item in chartConfig.props[axis.key].categories" :key="item" :label="item" :value="item" />
            </DrSelectField>
          </DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item>
              <template #label><span class="dr-config-panel__group-title">轴标签</span></template>
              <el-switch v-model="chartConfig.props[axis.key].axisLabel.show" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first
                  ><DrNumberField v-model="chartConfig.props[axis.key].axisLabel.fontSize" :min="1" :max="72" :aria-label="`${axis.label}标签字号`"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                >
                <template #second><DrColorField v-model="chartConfig.props[axis.key].axisLabel.color" show-alpha :aria-label="`${axis.label}标签颜色`" /></template>
              </DrFieldRow>
              <DrFieldRow label="旋转"
                ><DrNumberField v-model="chartConfig.props[axis.key].axisLabel.rotate" :min="-90" :max="90" :aria-label="`${axis.label}标签旋转角度`"
              /></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item>
              <template #label><span class="dr-config-panel__group-title">轴线</span></template>
              <el-switch v-model="chartConfig.props[axis.key].axisLine.show" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first
                  ><DrNumberField v-model="chartConfig.props[axis.key].axisLine.width" :min="0" :max="10" :aria-label="`${axis.label}轴线宽度`"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                >
                <template #second><DrColorField v-model="chartConfig.props[axis.key].axisLine.color" show-alpha :aria-label="`${axis.label}轴线颜色`" /></template>
              </DrFieldRow>
            </div>
          </div>
          <DrFieldRow label="分隔区域"><el-switch v-model="chartConfig.props[axis.key].splitArea" /></DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="格子" name="series">
          <DrFieldRow label="背景色"><DrColorField v-model="chartConfig.props.series.backgroundColor" :show-alpha="false" aria-label="格子背景色" /></DrFieldRow>
          <DrFieldRow label="分段数"
            ><DrNumberField v-model="chartConfig.props.series.segments" :min="1" :max="100" :precision="0" :step="1" step-strictly aria-label="格子分段数"
          /></DrFieldRow>
          <DrFieldRow label="最小值"><DrNumberField v-model="chartConfig.props.series.min" aria-label="格子最小值" /></DrFieldRow>
          <DrFieldRow label="最大值"><DrNumberField v-model="chartConfig.props.series.max" aria-label="格子最大值" /></DrFieldRow>
          <el-alert v-if="invalidRange" title="最小值必须小于最大值，且均为有效数值" type="error" :closable="false" />

          <DrFieldRow label="系列名称"><DrInputField v-model="chartConfig.props.series.name" /></DrFieldRow>
          <DrFieldRow label="边框" paired variant="number-color">
            <template #first
              ><DrNumberField v-model="chartConfig.props.series.borderWidth" :min="0" :max="10" aria-label="格子边框宽度"><template #suffix>px</template></DrNumberField></template
            >
            <template #second><DrColorField v-model="chartConfig.props.series.borderColor" show-alpha aria-label="格子边框颜色" /></template>
          </DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item>
              <template #label><span class="dr-config-panel__group-title">数值标签</span></template>
              <el-switch v-model="chartConfig.props.series.label.show" />
            </el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first
                  ><DrNumberField v-model="chartConfig.props.series.label.fontSize" :min="1" :max="72" aria-label="格子标签字号"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                >
                <template #second><DrColorField v-model="chartConfig.props.series.label.color" show-alpha aria-label="格子标签颜色" /></template>
              </DrFieldRow>
            </div>
          </div>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="提示框" name="tooltip">
          <DrFieldRow label="显示"><el-switch v-model="chartConfig.props.tooltip.show" /></DrFieldRow>
          <DrFieldRow label="背景颜色"><DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha /></DrFieldRow>
          <DrFieldRow label="边框颜色"><DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha /></DrFieldRow>
          <DrFieldRow label="文字颜色"><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha /></DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first
              ><DrNumberField v-model="chartConfig.props.global.padding[0]" :min="0" aria-label="上边距"><template #suffix>px</template></DrNumberField></template
            >
            <template #second
              ><DrNumberField v-model="chartConfig.props.global.padding[2]" :min="0" aria-label="下边距"><template #suffix>px</template></DrNumberField></template
            >
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first
              ><DrNumberField v-model="chartConfig.props.global.padding[3]" :min="0" aria-label="左边距"><template #suffix>px</template></DrNumberField></template
            >
            <template #second
              ><DrNumberField v-model="chartConfig.props.global.padding[1]" :min="0" aria-label="右边距"><template #suffix>px</template></DrNumberField></template
            >
          </DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="动画" name="animation">
          <DrFieldRow label="启用"><el-switch v-model="chartConfig.props.animation.enabled" /></DrFieldRow>
          <DrFieldRow label="动画时长"
            ><DrNumberField v-model="chartConfig.props.animation.duration" :min="0" :max="5000" :step="100"><template #suffix>ms</template></DrNumberField></DrFieldRow
          >
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>
