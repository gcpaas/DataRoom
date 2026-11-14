<script setup lang="ts">
import { computed } from 'vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import type { DrFunnelChartConfig } from '../install'

defineOptions({ name: 'DrFunnelChartControlPanel' })
const { chart } = defineProps<{ chart: DrFunnelChartConfig }>()
const chartConfig = computed(() => chart)
const addColor = () => chartConfig.value.props.series.colors.push(chartConfig.value.props.series.colors[0] || '')
const removeColor = (index: number) => {
  if (chartConfig.value.props.series.colors.length > 1) chartConfig.value.props.series.colors.splice(index, 1)
}
</script>

<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig.props" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="漏斗" name="funnel">
          <el-form-item label="排序方式">
            <DrSelectField v-model="chartConfig.props.funnel.sort" class="dr-config-panel__control">
              <el-option label="数值降序" value="descending" />
              <el-option label="数值升序" value="ascending" />
              <el-option label="数据顺序" value="none" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="区块间距">
            <DrNumberField v-model="chartConfig.props.funnel.gap" class="dr-config-panel__control" :min="0" :max="30" controls-position="right"><template #suffix>px</template></DrNumberField>
          </el-form-item>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="标签" name="label">
          <el-form-item label="显示标签"><el-switch v-model="chartConfig.props.label.show" /></el-form-item>
          <template v-if="chartConfig.props.label.show">
            <el-form-item label="文字颜色"><DrColorField v-model="chartConfig.props.label.color" show-alpha /></el-form-item>
            <el-form-item label="标签内容">
              <DrSelectField v-model="chartConfig.props.label.content" class="dr-config-panel__control">
                <el-option label="名称" value="name" />
                <el-option label="数值" value="value" />
                <el-option label="名称 + 数值" value="name+value" />
              </DrSelectField>
            </el-form-item>
            <el-form-item label="标签位置">
              <DrSelectField v-model="chartConfig.props.label.position" class="dr-config-panel__control">
                <el-option label="内部" value="inside" />
                <el-option label="外部" value="outside" />
              </DrSelectField>
            </el-form-item>
          </template>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="配色" name="series">
          <el-form-item label="系列颜色">
            <div class="dr-config-panel__color-list">
              <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                <DrColorField :model-value="color" show-alpha :aria-label="`阶段颜色 ${index + 1}`" @update:model-value="chartConfig.props.series.colors[index] = $event || color" />
                <el-button text :aria-label="`删除颜色 ${index + 1}`" icon="Delete" :disabled="chartConfig.props.series.colors.length <= 1" @click="removeColor(index)" />
              </div>
              <el-button plain @click="addColor">添加颜色</el-button>
            </div>
          </el-form-item>
        </ConfigCollapseItem>
        <ConfigCollapseItem v-if="chartConfig.props.tooltip?.textStyle" title="提示框配色" name="tooltipAppearance">
          <el-form-item label="背景色"><DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha /></el-form-item>
          <el-form-item label="边框色"><DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha /></el-form-item>
          <el-form-item label="文字色"><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha /></el-form-item>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>
