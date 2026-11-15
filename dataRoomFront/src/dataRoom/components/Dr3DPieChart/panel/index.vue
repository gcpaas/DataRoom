<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { Dr3DPieChartConfig } from '../install'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'

defineOptions({ name: 'Dr3DPieChartControlPanel' })
const { chart } = defineProps<{ chart: Dr3DPieChartConfig }>()
const chartConfig = computed(() => chart)
function updateColor(index: number, value: string | null) {
  if (value) chartConfig.value.props.series.colors[index] = value
}
function addColor() {
  chartConfig.value.props.series.colors.push(chartConfig.value.props.series.colors[0] || chartConfig.value.props.tooltip.borderColor)
}
</script>
<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left"
      ><ConfigCollapse class="dr-config-panel__section"
        ><ConfigCollapseItem title="饼图样式" name="pie"
          ><DrFieldRow label="图形样式"
            ><DrSelectField v-model="chartConfig.props.pie.shape" class="dr-config-panel__control" aria-label="图形样式"
              ><el-option label="实心饼图" value="pie" /><el-option label="环形图" value="ring" /></DrSelectField
          ></DrFieldRow>
          <template v-if="chartConfig.props.pie.shape === 'ring'"
            ><DrFieldRow label="内径比例"
              ><DrNumberField v-model="chartConfig.props.pie.innerRadius" class="dr-config-panel__control" :min="10" :max="85" aria-label="环形内径占外径比例"
                ><template #suffix>%</template></DrNumberField
              ></DrFieldRow
            > </template
          ><DrFieldRow label="图形大小"
            ><DrNumberField v-model="chartConfig.props.pie.size" class="dr-config-panel__control" :min="10" :max="100" aria-label="图形占可用空间比例"
              ><template #suffix>%</template></DrNumberField
            ></DrFieldRow
          >
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">立体效果</span></template></el-form-item
            >
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="厚度"
                ><DrNumberField v-model="chartConfig.props.pie.depth" class="dr-config-panel__control" :min="0" :max="100" aria-label="饼图厚度"
                  ><template #suffix>px</template></DrNumberField
                ></DrFieldRow
              >
              <DrFieldRow label="俯视角"
                ><DrNumberField v-model="chartConfig.props.pie.elevation" class="dr-config-panel__control" :min="10" :max="85" aria-label="俯视角"
                  ><template #suffix>°</template></DrNumberField
                ></DrFieldRow
              >
              <el-text size="small" type="info">角度越小，图形越扁；角度越大，越接近俯视。</el-text
              ><DrFieldRow label="旋转角度"
                ><DrNumberField v-model="chartConfig.props.pie.rotation" class="dr-config-panel__control" :min="0" :max="360" aria-label="整体旋转角度"
                  ><template #suffix>°</template></DrNumberField
                ></DrFieldRow
              >
              <DrFieldRow label="扇区间隔"
                ><DrNumberField v-model="chartConfig.props.pie.gap" class="dr-config-panel__control" :min="0" :max="15" aria-label="扇区间隔角度"
                  ><template #suffix>°</template></DrNumberField
                ></DrFieldRow
              >
              <DrFieldRow label="侧面明暗"
                ><DrNumberField
                  v-model="chartConfig.props.pie.sideDarkness"
                  class="dr-config-panel__control"
                  :min="0"
                  :max="0.8"
                  aria-label="侧面压暗程度"
                  :step="0.05"
                ></DrNumberField
              ></DrFieldRow>
            </div>
          </div>
          <DrFieldRow label="扇区配色"
            ><div class="dr-config-panel__color-list">
              <div v-for="(value, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                <DrColorField :model-value="value" show-alpha :aria-label="`扇区 ${index + 1} 颜色`" @update:model-value="(value) => updateColor(index, value)" /><el-button
                  text
                  :icon="Delete"
                  size="small"
                  :aria-label="`删除扇区 ${index + 1} 颜色`"
                  :disabled="chartConfig.props.series.colors.length <= 1"
                  @click="chartConfig.props.series.colors.splice(index, 1)"
                />
              </div>
              <el-button plain @click="addColor">添加颜色</el-button>
            </div></DrFieldRow
          > </ConfigCollapseItem
        ><ConfigCollapseItem title="数据标签" name="label"
          ><div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">标签显示</span></template
              ><el-switch v-model="chartConfig.props.label.show" aria-label="显示标签"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="位置"
                ><DrSelectField v-model="chartConfig.props.label.position" class="dr-config-panel__control" aria-label="标签位置"
                  ><el-option label="外侧" value="outside" /><el-option label="内部" value="inside" /></DrSelectField
              ></DrFieldRow>
              <DrFieldRow label="内容"
                ><DrSelectField v-model="chartConfig.props.label.content" class="dr-config-panel__control" aria-label="标签内容"
                  ><el-option label="名称" value="name" /><el-option label="数值" value="value" /><el-option label="百分比" value="percent" /><el-option
                    label="名称和数值"
                    value="name+value" /><el-option label="名称和百分比" value="name+percent" /></DrSelectField
              ></DrFieldRow>
              <DrFieldRow label="字体" paired variant="number-color"
                ><template #first
                  ><DrNumberField v-model="chartConfig.props.label.fontSize" class="dr-config-panel__control" :min="8" :max="36" aria-label="标签字号"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.label.color" show-alpha aria-label="标签颜色" /></template></DrFieldRow
              ><DrFieldRow label="字重"
                ><DrSelectField v-model="chartConfig.props.label.fontWeight" class="dr-config-panel__control" aria-label="标签字重"
                  ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /></DrSelectField
              ></DrFieldRow>
              <DrFieldRow label="最小占比"
                ><DrNumberField v-model="chartConfig.props.label.minPercent" class="dr-config-panel__control" :min="0" :max="100" aria-label="显示标签的最小占比"
                  ><template #suffix>%</template></DrNumberField
                ></DrFieldRow
              >
              <el-text size="small" type="info">占比低于此值时隐藏标签；外侧标签自动避让，空间不足时优先显示较大扇区。</el-text>
            </div>
          </div>
          <template v-if="chartConfig.props.label.position === 'outside'"
            ><div class="dr-config-panel__sub-section">
              <el-form-item
                ><template #label><span class="dr-config-panel__group-title">引导线</span></template
                ><el-switch v-model="chartConfig.props.label.guideLine.show" aria-label="显示引导线"
              /></el-form-item>
              <div class="dr-config-panel__sub-form">
                <DrFieldRow label="线条" paired variant="number-color"
                  ><template #first
                    ><DrNumberField v-model="chartConfig.props.label.guideLine.width" class="dr-config-panel__control" :min="1" :max="8" aria-label="引导线宽度"
                      ><template #suffix>px</template></DrNumberField
                    ></template
                  ><template #second><DrColorField v-model="chartConfig.props.label.guideLine.color" show-alpha aria-label="引导线颜色" /></template></DrFieldRow
                ><DrFieldRow label="长度"
                  ><DrNumberField v-model="chartConfig.props.label.guideLine.length" class="dr-config-panel__control" :min="0" :max="40" aria-label="引导线长度"
                    ><template #suffix>px</template></DrNumberField
                  ></DrFieldRow
                >
              </div>
            </div></template
          ></ConfigCollapseItem
        ><ConfigCollapseItem title="图例" name="legend"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.legend.show" aria-label="显示图例" /></DrFieldRow>
          <DrFieldRow label="位置"
            ><DrSelectField v-model="chartConfig.props.legend.position" class="dr-config-panel__control" aria-label="图例位置"
              ><el-option label="顶部" value="top" /><el-option label="底部" value="bottom" /><el-option label="左侧" value="left" /><el-option
                label="右侧"
                value="right" /></DrSelectField
          ></DrFieldRow>
          <DrFieldRow label="字体" paired variant="number-color"
            ><template #first
              ><DrNumberField v-model="chartConfig.props.legend.textStyle.fontSize" class="dr-config-panel__control" :min="8" :max="36" aria-label="图例字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second><DrColorField v-model="chartConfig.props.legend.textStyle.color" show-alpha aria-label="图例颜色" /></template></DrFieldRow
          ><DrFieldRow label="字重"
            ><DrSelectField v-model="chartConfig.props.legend.textStyle.fontWeight" class="dr-config-panel__control" aria-label="图例字重"
              ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /></DrSelectField
          ></DrFieldRow>
          <DrFieldRow label="项目间距"
            ><DrNumberField v-model="chartConfig.props.legend.itemGap" class="dr-config-panel__control" :min="0" :max="60" aria-label="图例项目间距"
              ><template #suffix>px</template></DrNumberField
            ></DrFieldRow
          > </ConfigCollapseItem
        ><ConfigCollapseItem title="提示框" name="tooltip"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.tooltip.show" aria-label="显示提示框" /></DrFieldRow>
          <DrFieldRow label="显示占比"><el-switch v-model="chartConfig.props.tooltip.showPercent" aria-label="提示框显示占比" /></DrFieldRow>
          <DrFieldRow label="字体" paired variant="number-color"
            ><template #first
              ><DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="8" :max="36" aria-label="提示框字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" /></template></DrFieldRow
          ><DrFieldRow label="背景色"><DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha aria-label="提示框背景色" /></DrFieldRow>
          <DrFieldRow label="边框色"><DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha aria-label="提示框边框色" /></DrFieldRow> </ConfigCollapseItem
        ><ConfigCollapseItem title="数值格式" name="format"
          ><DrFieldRow label="小数位数"
            ><DrNumberField
              v-model="chartConfig.props.format.decimals"
              class="dr-config-panel__control"
              :min="0"
              :max="10"
              aria-label="数值小数位数，留空使用原始精度"
              placeholder="原始精度"
            ></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="占比小数"
            ><DrNumberField v-model="chartConfig.props.format.percentDecimals" class="dr-config-panel__control" :min="0" :max="4" aria-label="百分比小数位数"></DrNumberField
          ></DrFieldRow>
          <DrFieldRow label="前缀"><DrInputField v-model="chartConfig.props.format.prefix" aria-label="数值前缀" /></DrFieldRow>
          <DrFieldRow label="后缀"><DrInputField v-model="chartConfig.props.format.suffix" aria-label="数值后缀" /></DrFieldRow> </ConfigCollapseItem
        ><ConfigCollapseItem title="动画" name="animation"
          ><DrFieldRow label="启用"><el-switch v-model="chartConfig.props.animation.enabled" aria-label="启用动画" /></DrFieldRow>
          <DrFieldRow label="时长"
            ><DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="3000" aria-label="动画时长" :step="100"
              ><template #suffix>ms</template></DrNumberField
            ></DrFieldRow
          > </ConfigCollapseItem
        ><ConfigCollapseItem title="全局配置" name="global"
          ><DrFieldRow label="垂直边距" paired variant="equal"
            ><template #first
              ><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="200" aria-label="上内边距" label="上"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second
              ><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="200" aria-label="下内边距" label="下"
                ><template #suffix>px</template></DrNumberField
              ></template
            ></DrFieldRow
          ><DrFieldRow label="水平边距" paired variant="equal"
            ><template #first
              ><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="200" aria-label="左内边距" label="左"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second
              ><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="200" aria-label="右内边距" label="右"
                ><template #suffix>px</template></DrNumberField
              ></template
            ></DrFieldRow
          ></ConfigCollapseItem
        ></ConfigCollapse
      ></el-form
    >
  </div>
</template>
