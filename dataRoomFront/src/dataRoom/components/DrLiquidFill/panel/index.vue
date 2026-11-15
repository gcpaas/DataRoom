<script setup lang="ts">
import { computed } from 'vue'
import type { DrLiquidFillConfig } from '../install'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
const { chart } = defineProps<{ chart: DrLiquidFillConfig }>()
const chartConfig = computed(() => chart)
</script>
<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse :accordion="false" class="dr-config-panel__section" :model-value="['liquid', 'detail', 'title']">
        <ConfigCollapseItem title="水球" name="liquid">
          <DrFieldRow label="形状"
            ><DrSelectField v-model="chartConfig.props.liquid.shape" class="dr-config-panel__control"
              ><el-option label="圆形" value="circle" /><el-option label="定位水滴" value="pin" /><el-option label="圆角矩形" value="roundRect" /><el-option
                label="菱形"
                value="diamond" /></DrSelectField
          ></DrFieldRow>
          <DrFieldRow label="最小值"
            ><DrNumberField v-model="chartConfig.props.liquid.min" class="dr-config-panel__control" :min="-1000000000" :max="1000000000" aria-label="最小值"></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="最大值"
            ><DrNumberField v-model="chartConfig.props.liquid.max" class="dr-config-panel__control" :min="-1000000000" :max="1000000000" aria-label="最大值"></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="尺寸"
            ><DrNumberField v-model="chartConfig.props.liquid.radius" class="dr-config-panel__control" :min="10" :max="95" aria-label="尺寸"
              ><template #suffix>%</template></DrNumberField
            ></DrFieldRow
          >
          <DrFieldRow label="水体颜色"><DrColorField v-model="chartConfig.props.liquid.color" show-alpha aria-label="水体颜色" /></DrFieldRow>
          <DrFieldRow label="背景颜色"><DrColorField v-model="chartConfig.props.liquid.backgroundColor" show-alpha aria-label="背景颜色" /></DrFieldRow>
          <DrFieldRow label="波浪层数"
            ><DrNumberField v-model="chartConfig.props.liquid.waveCount" class="dr-config-panel__control" :min="1" :max="4" aria-label="波浪层数"></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="波浪振幅"
            ><DrNumberField v-model="chartConfig.props.liquid.amplitude" class="dr-config-panel__control" :min="0" :max="30" aria-label="波浪振幅"
              ><template #suffix>px</template></DrNumberField
            ></DrFieldRow
          >
          <DrFieldRow label="波浪动画"><el-switch v-model="chartConfig.props.liquid.animated" aria-label="波浪动画" /></DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="外边框" name="outline">
          <DrFieldRow label="显示边框"><el-switch v-model="chartConfig.props.outline.show" aria-label="显示边框" /></DrFieldRow>
          <DrFieldRow label="线宽颜色" paired variant="number-color">
            <template #first
              ><DrNumberField v-model="chartConfig.props.outline.width" :min="0" :max="20" class="dr-config-panel__control" aria-label="边框线宽"
                ><template #suffix>px</template></DrNumberField
              ></template
            >
            <template #second><DrColorField v-model="chartConfig.props.outline.color" show-alpha aria-label="边框颜色" /></template> </DrFieldRow
          ><DrFieldRow label="边框间距"
            ><DrNumberField v-model="chartConfig.props.outline.gap" class="dr-config-panel__control" :min="0" :max="30" aria-label="边框间距"
              ><template #suffix>px</template></DrNumberField
            ></DrFieldRow
          >
        </ConfigCollapseItem>
        <ConfigCollapseItem title="数值" name="detail">
          <DrFieldRow label="显示数值"><el-switch v-model="chartConfig.props.detail.show" aria-label="显示数值" /></DrFieldRow>
          <DrFieldRow label="字号颜色" paired variant="number-color">
            <template #first
              ><DrNumberField v-model="chartConfig.props.detail.fontSize" :min="10" :max="100" class="dr-config-panel__control" aria-label="数值字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            >
            <template #second><DrColorField v-model="chartConfig.props.detail.color" show-alpha aria-label="数值颜色" /></template> </DrFieldRow
          ><DrFieldRow label="显示格式"
            ><DrSelectField v-model="chartConfig.props.detail.format" class="dr-config-panel__control"
              ><el-option label="百分比" value="percent" /><el-option label="原始值" value="value" /></DrSelectField
          ></DrFieldRow>
          <DrFieldRow label="小数位数"
            ><DrNumberField v-model="chartConfig.props.detail.decimals" class="dr-config-panel__control" :min="0" :max="10" aria-label="小数位数"></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="后缀"><DrInputField v-model="chartConfig.props.detail.suffix" class="dr-config-panel__control" /></DrFieldRow>
        </ConfigCollapseItem>
        <ConfigCollapseItem title="标题" name="title">
          <DrFieldRow label="显示标题"><el-switch v-model="chartConfig.props.title.show" aria-label="显示标题" /></DrFieldRow>
          <DrFieldRow label="固定标题"><DrInputField v-model="chartConfig.props.title.text" class="dr-config-panel__control" placeholder="留空使用数据标题" /></DrFieldRow>
          <DrFieldRow label="字号颜色" paired variant="number-color">
            <template #first
              ><DrNumberField v-model="chartConfig.props.title.fontSize" :min="10" :max="100" class="dr-config-panel__control" aria-label="标题字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            >
            <template #second><DrColorField v-model="chartConfig.props.title.color" show-alpha aria-label="标题颜色" /></template> </DrFieldRow
          ><DrFieldRow label="文字间距"
            ><DrNumberField v-model="chartConfig.props.title.gap" class="dr-config-panel__control" :min="0" :max="100" aria-label="文字间距"
              ><template #suffix>px</template></DrNumberField
            ></DrFieldRow
          >
        </ConfigCollapseItem>
      </ConfigCollapse></el-form
    >
  </div>
</template>
