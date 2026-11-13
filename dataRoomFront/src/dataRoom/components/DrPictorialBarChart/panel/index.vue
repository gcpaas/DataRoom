<script setup lang="ts">
import { computed } from 'vue'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import type { DrPictorialBarChartConfig } from '../install'
defineOptions({ name: 'DrPictorialBarChartControlPanel' })
const { chart } = defineProps<{ chart: DrPictorialBarChartConfig }>()
const chartConfig = computed(() => chart)
</script>
<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig.props" label-width="90px" label-position="left"
      ><ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="山峰" name="mountain"
          ><el-form-item label="峰宽 (%)"
            ><DrNumberField v-model="chartConfig.props.mountain.width" :min="10" :max="300" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="不透明度"
            ><DrNumberField v-model="chartConfig.props.mountain.opacity" :min="0" :max="1" :step="0.05" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="分类配色"><el-switch v-model="chartConfig.props.mountain.colorByCategory" /></el-form-item
          ><el-form-item label="颜色"
            ><div class="dr-config-panel__color-list">
              <div v-for="(color, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                <DrColorField :model-value="color" @update:model-value="chartConfig.props.series.colors[index] = $event || color" /><el-button
                  text
                  icon="Delete"
                  :disabled="chartConfig.props.series.colors.length <= 1"
                  @click="chartConfig.props.series.colors.splice(index, 1)"
                />
              </div>
              <el-button plain @click="chartConfig.props.series.colors.push(chartConfig.props.series.colors[0] || '')">添加颜色</el-button>
            </div></el-form-item
          ></ConfigCollapseItem
        >
        <ConfigCollapseItem title="顶部图片" name="image"
          ><el-form-item label="显示图片"><el-switch v-model="chartConfig.props.image.show" /></el-form-item
          ><el-form-item label="默认图片"><DrInputField v-model="chartConfig.props.image.url" placeholder="完整地址或素材库相对地址" /></el-form-item
          ><el-form-item label="宽度"
            ><DrNumberField v-model="chartConfig.props.image.width" :min="1" :max="500" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="高度"
            ><DrNumberField v-model="chartConfig.props.image.height" :min="1" :max="500" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="峰顶间距"
            ><DrNumberField v-model="chartConfig.props.image.gap" :min="0" :max="200" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
        ></ConfigCollapseItem>
        <ConfigCollapseItem title="分类轴" name="xAxis"
          ><el-form-item label="分类名称"><el-switch v-model="chartConfig.props.xAxis.show" /></el-form-item
          ><el-form-item label="字号"
            ><DrNumberField v-model="chartConfig.props.xAxis.fontSize" :min="8" :max="72" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="文字颜色"><DrColorField v-model="chartConfig.props.xAxis.color" /></el-form-item
          ><el-form-item label="旋转角度"
            ><DrNumberField v-model="chartConfig.props.xAxis.rotate" :min="-90" :max="90" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
        ></ConfigCollapseItem>
        <ConfigCollapseItem title="数值轴" name="yAxis"
          ><el-form-item label="显示数值轴"><el-switch v-model="chartConfig.props.yAxis.show" /></el-form-item
          ><el-form-item label="自动最大值"><el-switch v-model="chartConfig.props.yAxis.autoMax" /></el-form-item
          ><template v-if="!chartConfig.props.yAxis.autoMax"
            ><el-form-item label="最大值"
              ><DrNumberField
                v-model="chartConfig.props.yAxis.max"
                :min="1"
                :max="1000000000"
                :step="1"
                class="dr-config-panel__control"
                controls-position="right" /></el-form-item></template
          ><el-form-item label="网格线"><el-switch v-model="chartConfig.props.yAxis.splitLine" /></el-form-item
          ><el-form-item label="文字颜色"><DrColorField v-model="chartConfig.props.yAxis.color" /></el-form-item
          ><el-form-item label="线条颜色"><DrColorField v-model="chartConfig.props.yAxis.lineColor" /></el-form-item
        ></ConfigCollapseItem>
        <ConfigCollapseItem title="标签与提示" name="label"
          ><el-form-item label="数值标签"><el-switch v-model="chartConfig.props.label.show" /></el-form-item
          ><el-form-item label="标签字号"
            ><DrNumberField v-model="chartConfig.props.label.fontSize" :min="8" :max="72" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="标签颜色"><DrColorField v-model="chartConfig.props.label.color" /></el-form-item
          ><el-form-item label="小数位数"
            ><DrNumberField v-model="chartConfig.props.label.decimals" :min="0" :max="10" :step="1" class="dr-config-panel__control" controls-position="right" /></el-form-item
          ><el-form-item label="单位"><DrInputField v-model="chartConfig.props.label.unit" /></el-form-item
          ><el-form-item label="悬浮提示"><el-switch v-model="chartConfig.props.tooltip.show" /></el-form-item
        ></ConfigCollapseItem>
        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="右" /></template>
          </DrFieldRow>
        </ConfigCollapseItem> </ConfigCollapse
    ></el-form>
  </div>
</template>
