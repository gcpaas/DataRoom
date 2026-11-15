<script setup lang="ts">
import { computed } from 'vue'
import { Delete } from '@element-plus/icons-vue'
import type { Dr3DBarChartConfig } from '../install'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'

defineOptions({ name: 'Dr3DBarChartControlPanel' })
const { chart } = defineProps<{ chart: Dr3DBarChartConfig }>()
const chartConfig = computed(() => chart)
function updateColor(index: number, value: string | null) {
  if (value) chartConfig.value.props.series.colors[index] = value
}
function addColor() {
  chartConfig.value.props.series.colors.push(chartConfig.value.props.series.colors[0] || chartConfig.value.props.series.gradient.startColor)
}

// 直接读写已保存的配置；兼容原有百分比及像素字符串，不复制 props。
const widthMode = computed({
  get: () => (chartConfig.value.props.series.barWidth == null ? 'auto' : 'fixed'),
  set: (mode: string) => {
    const series = chartConfig.value.props.series
    series.barWidth = mode === 'auto' ? null : (series.barWidth ?? series.barMaxWidth)
  },
})
function gapModel(field: 'barCategoryGap' | 'barGap') {
  const unit = computed({
    get: () => (chartConfig.value.props.series[field].trim().endsWith('%') ? '%' : 'px'),
    set: (value: string) => {
      const amount = Number.parseFloat(chartConfig.value.props.series[field]) || 0
      chartConfig.value.props.series[field] = `${amount}${value === '%' ? '%' : ''}`
    },
  })
  const amount = computed({
    get: () => Number.parseFloat(chartConfig.value.props.series[field]) || 0,
    set: (value: number) => {
      chartConfig.value.props.series[field] = `${Math.max(0, value)}${unit.value === '%' ? '%' : ''}`
    },
  })
  return { amount, unit }
}
const { amount: categoryGap, unit: categoryGapUnit } = gapModel('barCategoryGap')
const { amount: seriesGap, unit: seriesGapUnit } = gapModel('barGap')
</script>
<template>
  <div class="dr-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left"
      ><ConfigCollapse class="dr-config-panel__section"
        ><ConfigCollapseItem title="柱子样式" name="series"
          ><DrFieldRow label="柱体形状"
            ><DrSelectField v-model="chartConfig.props.series.shape" class="dr-config-panel__control" aria-label="柱体形状"
              ><el-option label="菱形立体柱" value="diamond" /><el-option label="圆柱" value="cylinder" /><el-option label="方柱" value="cuboid" /></DrSelectField></DrFieldRow
          ><DrFieldRow label="柱宽模式">
            <DrSelectField v-model="widthMode" class="dr-config-panel__control" aria-label="柱宽模式">
              <el-option label="自动适应" value="auto" />
              <el-option label="固定宽度" value="fixed" />
            </DrSelectField>
          </DrFieldRow>
          <DrFieldRow v-if="widthMode === 'auto'" label="最大柱宽">
            <DrNumberField v-model="chartConfig.props.series.barMaxWidth" class="dr-config-panel__control" :min="1" :max="200" aria-label="自动模式最大柱宽">
              <template #suffix>px</template>
            </DrNumberField>
          </DrFieldRow>
          <DrFieldRow v-else label="柱子宽度">
            <DrNumberField v-model="chartConfig.props.series.barWidth" class="dr-config-panel__control" :min="1" :max="200" aria-label="固定柱子宽度">
              <template #suffix>px</template>
            </DrNumberField>
          </DrFieldRow>
          <el-text size="small" type="info">{{ widthMode === 'auto' ? '按图表空间自动分配柱宽，不超过上限。' : '设置每根柱子的宽度；空间不足时自动缩小，避免重叠。' }}</el-text>
          <DrFieldRow label="组间留白" paired variant="equal">
            <template #first>
              <DrNumberField v-model="categoryGap" class="dr-config-panel__control" :min="0" :step="1" aria-label="组间留白数值">
                <template #suffix>{{ categoryGapUnit }}</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrSelectField v-model="categoryGapUnit" class="dr-config-panel__control" aria-label="组间留白单位">
                <el-option label="比例（%）" value="%" /><el-option label="像素（px）" value="px" />
              </DrSelectField>
            </template>
          </DrFieldRow>
          <el-text size="small" type="info">不同类目之间的留白，例如 1 月与 2 月之间。比例按每个类目的可用宽度计算，最多留出 95%。</el-text>
          <DrFieldRow label="同组柱距" paired variant="equal">
            <template #first>
              <DrNumberField v-model="seriesGap" class="dr-config-panel__control" :min="0" :step="1" aria-label="同组柱距数值">
                <template #suffix>{{ seriesGapUnit }}</template>
              </DrNumberField>
            </template>
            <template #second>
              <DrSelectField v-model="seriesGapUnit" class="dr-config-panel__control" aria-label="同组柱距单位">
                <el-option label="比例（%）" value="%" /><el-option label="像素（px）" value="px" />
              </DrSelectField>
            </template>
          </DrFieldRow>
          <el-text size="small" type="info">同一类目内多根柱子的距离，例如同月的销售额与利润。比例按柱宽计算，单系列时不生效。</el-text>
          <DrFieldRow label="不透明度"
            ><DrNumberField
              v-model="chartConfig.props.series.opacity"
              class="dr-config-panel__control"
              :min="0"
              :max="1"
              controls-position="right"
              aria-label="柱体不透明度"
              :step="0.05"
            ></DrNumberField></DrFieldRow
          ><DrFieldRow label="系列配色"
            ><div class="dr-config-panel__color-list">
              <div v-for="(value, index) in chartConfig.props.series.colors" :key="index" class="dr-config-panel__inline">
                <DrColorField :model-value="value" show-alpha :aria-label="`系列 ${index + 1} 颜色`" @update:model-value="(value) => updateColor(index, value)" /><el-button
                  :icon="Delete"
                  text
                  size="small"
                  :disabled="chartConfig.props.series.colors.length <= 1"
                  :aria-label="`删除系列 ${index + 1} 颜色`"
                  @click="chartConfig.props.series.colors.splice(index, 1)"
                />
              </div>
              <el-button plain @click="addColor">添加颜色</el-button>
            </div></DrFieldRow
          >
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">立体效果</span></template></el-form-item
            >
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="厚度比例"
                ><DrNumberField
                  v-model="chartConfig.props.series.depth"
                  class="dr-config-panel__control"
                  :min="0.05"
                  :max="1"
                  controls-position="right"
                  aria-label="立体厚度与柱宽比例"
                  :step="0.05"
                ></DrNumberField></DrFieldRow
              ><DrFieldRow label="顶部端面"><el-switch v-model="chartConfig.props.series.caps.topShow" aria-label="显示顶部端面" /></DrFieldRow
              ><DrFieldRow label="底部端面"><el-switch v-model="chartConfig.props.series.caps.bottomShow" aria-label="显示底部端面" /></DrFieldRow
              ><DrFieldRow label="跟随配色"><el-switch v-model="chartConfig.props.series.caps.autoColor" aria-label="端面跟随系列配色" /></DrFieldRow
              ><template v-if="!chartConfig.props.series.caps.autoColor"
                ><DrFieldRow label="顶面颜色"><DrColorField v-model="chartConfig.props.series.caps.topColor" show-alpha aria-label="顶面颜色" /></DrFieldRow
                ><DrFieldRow label="底面颜色"><DrColorField v-model="chartConfig.props.series.caps.bottomColor" show-alpha aria-label="底面颜色" /></DrFieldRow
                ><DrFieldRow v-if="chartConfig.props.series.shape === 'cuboid'" label="侧面颜色"
                  ><DrColorField v-model="chartConfig.props.series.caps.sideColor" show-alpha aria-label="侧面颜色" /></DrFieldRow></template
              ><DrFieldRow label="端面透明"
                ><DrNumberField
                  v-model="chartConfig.props.series.caps.opacity"
                  class="dr-config-panel__control"
                  :min="0"
                  :max="1"
                  controls-position="right"
                  aria-label="端面不透明度"
                  :step="0.05"
                ></DrNumberField
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">柱体渐变</span></template
              ><el-switch v-model="chartConfig.props.series.gradient.enabled" aria-label="启用柱体渐变"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <template v-if="chartConfig.props.series.gradient.enabled"
                ><DrFieldRow label="方向"
                  ><DrSelectField v-model="chartConfig.props.series.gradient.direction" class="dr-config-panel__control" aria-label="渐变方向"
                    ><el-option label="纵向" value="vertical" /><el-option label="横向" value="horizontal" /></DrSelectField></DrFieldRow
                ><DrFieldRow label="跟随配色"><el-switch v-model="chartConfig.props.series.gradient.autoColor" aria-label="渐变跟随系列配色" /></DrFieldRow
                ><template v-if="!chartConfig.props.series.gradient.autoColor"
                  ><DrFieldRow label="起点颜色"><DrColorField v-model="chartConfig.props.series.gradient.startColor" show-alpha aria-label="渐变起点颜色" /></DrFieldRow
                  ><DrFieldRow label="终点颜色"><DrColorField v-model="chartConfig.props.series.gradient.endColor" show-alpha aria-label="渐变终点颜色" /></DrFieldRow></template
                ><DrFieldRow label="不透明度" paired variant="equal"
                  ><template #first
                    ><DrNumberField
                      v-model="chartConfig.props.series.gradient.startOpacity"
                      label="起点"
                      class="dr-config-panel__control"
                      :min="0"
                      :max="1"
                      controls-position="right"
                      aria-label="渐变起点不透明度"
                      :step="0.05"
                    ></DrNumberField></template
                  ><template #second
                    ><DrNumberField
                      v-model="chartConfig.props.series.gradient.endOpacity"
                      label="终点"
                      class="dr-config-panel__control"
                      :min="0"
                      :max="1"
                      controls-position="right"
                      aria-label="渐变终点不透明度"
                      :step="0.05"
                    ></DrNumberField></template></DrFieldRow
              ></template>
            </div></div></ConfigCollapseItem
        ><ConfigCollapseItem title="数据标签" name="label"
          ><div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">标签显示</span></template
              ><el-switch v-model="chartConfig.props.series.label.show" aria-label="显示数据标签"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="位置"
                ><DrSelectField v-model="chartConfig.props.series.label.position" class="dr-config-panel__control" aria-label="标签位置"
                  ><el-option label="外侧" value="outside" /><el-option label="内部" value="inside" /></DrSelectField></DrFieldRow
              ><DrFieldRow label="端面距离"
                ><DrNumberField
                  v-model="chartConfig.props.series.label.distance"
                  class="dr-config-panel__control"
                  :min="0"
                  :max="80"
                  controls-position="right"
                  aria-label="标签与端面距离"
                  ><template #suffix>px</template></DrNumberField
                ></DrFieldRow
              ><DrFieldRow label="字体" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.series.label.fontSize"
                    class="dr-config-panel__control"
                    :min="8"
                    :max="48"
                    controls-position="right"
                    aria-label="标签字号"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.series.label.color" show-alpha aria-label="标签颜色" /></template></DrFieldRow
              ><DrFieldRow label="字重"
                ><DrSelectField v-model="chartConfig.props.series.label.fontWeight" class="dr-config-panel__control" aria-label="标签字重"
                  ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /><el-option label="细" value="300" /><el-option
                    label="中等"
                    value="500" /><el-option label="较粗" value="800" /></DrSelectField
              ></DrFieldRow>
            </div></div></ConfigCollapseItem
        ><ConfigCollapseItem title="X 轴" name="xAxis"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.xAxis.show" aria-label="X 轴显示" /></DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">轴线</span></template
              ><el-switch v-model="chartConfig.props.xAxis.axisLine.show" aria-label="X 轴轴线显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.xAxis.axisLine.width"
                    class="dr-config-panel__control"
                    :min="1"
                    :max="10"
                    controls-position="right"
                    aria-label="X 轴轴线宽度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.xAxis.axisLine.color" show-alpha aria-label="X 轴轴线颜色" /></template
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">轴标签</span></template
              ><el-switch v-model="chartConfig.props.xAxis.axisLabel.show" aria-label="X 轴标签显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.xAxis.axisLabel.fontSize"
                    class="dr-config-panel__control"
                    :min="8"
                    :max="48"
                    controls-position="right"
                    aria-label="X 轴标签字号"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.xAxis.axisLabel.color" show-alpha aria-label="X 轴标签颜色" /></template></DrFieldRow
              ><DrFieldRow label="字重"
                ><DrSelectField v-model="chartConfig.props.xAxis.axisLabel.fontWeight" class="dr-config-panel__control" aria-label="X 轴标签字重"
                  ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /><el-option label="细" value="300" /><el-option
                    label="中等"
                    value="500" /><el-option label="较粗" value="800" /></DrSelectField></DrFieldRow
              ><DrFieldRow label="字体家族"
                ><DrInputField v-model="chartConfig.props.xAxis.axisLabel.fontFamily" class="dr-config-panel__control" aria-label="X 轴字体家族" /></DrFieldRow
              ><DrFieldRow label="旋转角度"
                ><DrNumberField
                  v-model="chartConfig.props.xAxis.axisLabel.rotate"
                  class="dr-config-panel__control"
                  :min="-90"
                  :max="90"
                  controls-position="right"
                  aria-label="X 轴标签旋转角度"
                  ><template #suffix>°</template></DrNumberField
                ></DrFieldRow
              ><DrFieldRow label="显示间隔"
                ><DrNumberField
                  v-model="chartConfig.props.xAxis.axisLabel.interval"
                  class="dr-config-panel__control"
                  :min="0"
                  :max="100"
                  controls-position="right"
                  aria-label="X 轴标签间隔，零为全部"
                ></DrNumberField
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">刻度线</span></template
              ><el-switch v-model="chartConfig.props.xAxis.axisTick.show" aria-label="X 轴刻度显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="刻度" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.xAxis.axisTick.length"
                    class="dr-config-panel__control"
                    :min="0"
                    :max="20"
                    controls-position="right"
                    aria-label="X 轴刻度长度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.xAxis.axisTick.color" show-alpha aria-label="X 轴刻度颜色" /></template
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">网格线</span></template
              ><el-switch v-model="chartConfig.props.xAxis.splitLine.show" aria-label="X 轴网格线显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.xAxis.splitLine.width"
                    class="dr-config-panel__control"
                    :min="1"
                    :max="10"
                    controls-position="right"
                    aria-label="X 轴网格线宽度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.xAxis.splitLine.color" show-alpha aria-label="X 轴网格线颜色" /></template></DrFieldRow
              ><DrFieldRow label="样式"
                ><DrSelectField v-model="chartConfig.props.xAxis.splitLine.type" class="dr-config-panel__control" aria-label="X 轴网格线样式"
                  ><el-option label="实线" value="solid" /><el-option label="虚线" value="dashed" /><el-option label="点线" value="dotted" /></DrSelectField
              ></DrFieldRow>
            </div></div></ConfigCollapseItem
        ><ConfigCollapseItem title="Y 轴" name="yAxis"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.yAxis.show" aria-label="Y 轴显示" /></DrFieldRow
          ><DrFieldRow label="轴名称"><DrInputField v-model="chartConfig.props.yAxis.name" class="dr-config-panel__control" aria-label="Y 轴名称" /></DrFieldRow>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">显示范围</span></template
              ><el-switch v-model="chartConfig.props.yAxis.range.auto" aria-label="自动计算 Y 轴范围"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="范围" paired variant="equal"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.range.min"
                    label="最小"
                    class="dr-config-panel__control"
                    :min="-1000000000000"
                    :max="1000000000000"
                    controls-position="right"
                    aria-label="Y 轴最小值"
                    :disabled="chartConfig.props.yAxis.range.auto"
                  ></DrNumberField></template
                ><template #second
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.range.max"
                    label="最大"
                    class="dr-config-panel__control"
                    :min="-1000000000000"
                    :max="1000000000000"
                    controls-position="right"
                    aria-label="Y 轴最大值"
                    :disabled="chartConfig.props.yAxis.range.auto"
                  ></DrNumberField></template
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">轴线</span></template
              ><el-switch v-model="chartConfig.props.yAxis.axisLine.show" aria-label="Y 轴轴线显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.axisLine.width"
                    class="dr-config-panel__control"
                    :min="1"
                    :max="10"
                    controls-position="right"
                    aria-label="Y 轴轴线宽度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.yAxis.axisLine.color" show-alpha aria-label="Y 轴轴线颜色" /></template
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">轴标签</span></template
              ><el-switch v-model="chartConfig.props.yAxis.axisLabel.show" aria-label="Y 轴标签显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="字体" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.axisLabel.fontSize"
                    class="dr-config-panel__control"
                    :min="8"
                    :max="48"
                    controls-position="right"
                    aria-label="Y 轴标签字号"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.yAxis.axisLabel.color" show-alpha aria-label="Y 轴标签颜色" /></template></DrFieldRow
              ><DrFieldRow label="字重"
                ><DrSelectField v-model="chartConfig.props.yAxis.axisLabel.fontWeight" class="dr-config-panel__control" aria-label="Y 轴标签字重"
                  ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /><el-option label="细" value="300" /><el-option
                    label="中等"
                    value="500" /><el-option label="较粗" value="800" /></DrSelectField></DrFieldRow
              ><DrFieldRow label="字体家族"
                ><DrInputField v-model="chartConfig.props.yAxis.axisLabel.fontFamily" class="dr-config-panel__control" aria-label="Y 轴字体家族"
              /></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">刻度线</span></template
              ><el-switch v-model="chartConfig.props.yAxis.axisTick.show" aria-label="Y 轴刻度显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="刻度" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.axisTick.length"
                    class="dr-config-panel__control"
                    :min="0"
                    :max="20"
                    controls-position="right"
                    aria-label="Y 轴刻度长度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.yAxis.axisTick.color" show-alpha aria-label="Y 轴刻度颜色" /></template
              ></DrFieldRow>
            </div>
          </div>
          <div class="dr-config-panel__sub-section">
            <el-form-item
              ><template #label><span class="dr-config-panel__group-title">网格线</span></template
              ><el-switch v-model="chartConfig.props.yAxis.splitLine.show" aria-label="Y 轴网格线显示"
            /></el-form-item>
            <div class="dr-config-panel__sub-form">
              <DrFieldRow label="线条" paired variant="number-color"
                ><template #first
                  ><DrNumberField
                    v-model="chartConfig.props.yAxis.splitLine.width"
                    class="dr-config-panel__control"
                    :min="1"
                    :max="10"
                    controls-position="right"
                    aria-label="Y 轴网格线宽度"
                    ><template #suffix>px</template></DrNumberField
                  ></template
                ><template #second><DrColorField v-model="chartConfig.props.yAxis.splitLine.color" show-alpha aria-label="Y 轴网格线颜色" /></template></DrFieldRow
              ><DrFieldRow label="样式"
                ><DrSelectField v-model="chartConfig.props.yAxis.splitLine.type" class="dr-config-panel__control" aria-label="Y 轴网格线样式"
                  ><el-option label="实线" value="solid" /><el-option label="虚线" value="dashed" /><el-option label="点线" value="dotted" /></DrSelectField
              ></DrFieldRow>
            </div></div></ConfigCollapseItem
        ><ConfigCollapseItem title="图例" name="legend"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.legend.show" aria-label="显示图例" /></DrFieldRow
          ><DrFieldRow label="位置"
            ><DrSelectField v-model="chartConfig.props.legend.position" class="dr-config-panel__control" aria-label="图例位置"
              ><el-option label="顶部" value="top" /><el-option label="底部" value="bottom" /><el-option label="左侧" value="left" /><el-option
                label="右侧"
                value="right" /></DrSelectField></DrFieldRow
          ><DrFieldRow label="字体" paired variant="number-color"
            ><template #first
              ><DrNumberField
                v-model="chartConfig.props.legend.textStyle.fontSize"
                class="dr-config-panel__control"
                :min="8"
                :max="48"
                controls-position="right"
                aria-label="图例字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second><DrColorField v-model="chartConfig.props.legend.textStyle.color" show-alpha aria-label="图例文字颜色" /></template></DrFieldRow
          ><DrFieldRow label="字重"
            ><DrSelectField v-model="chartConfig.props.legend.textStyle.fontWeight" class="dr-config-panel__control" aria-label="图例字重"
              ><el-option label="正常" value="normal" /><el-option label="粗体" value="bold" /><el-option label="细" value="300" /><el-option label="中等" value="500" /><el-option
                label="较粗"
                value="800" /></DrSelectField></DrFieldRow
          ><DrFieldRow label="图标尺寸" paired variant="equal"
            ><template #first
              ><DrNumberField
                v-model="chartConfig.props.legend.itemWidth"
                label="宽"
                class="dr-config-panel__control"
                :min="1"
                :max="60"
                controls-position="right"
                aria-label="图例图标宽度"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second
              ><DrNumberField
                v-model="chartConfig.props.legend.itemHeight"
                label="高"
                class="dr-config-panel__control"
                :min="1"
                :max="60"
                controls-position="right"
                aria-label="图例图标高度"
                ><template #suffix>px</template></DrNumberField
              ></template
            ></DrFieldRow
          ><DrFieldRow label="项目间距"
            ><DrNumberField v-model="chartConfig.props.legend.itemGap" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" aria-label="图例项目间距"
              ><template #suffix>px</template></DrNumberField
            ></DrFieldRow
          ></ConfigCollapseItem
        ><ConfigCollapseItem title="提示框" name="tooltip"
          ><DrFieldRow label="显示"><el-switch v-model="chartConfig.props.tooltip.show" aria-label="显示提示框" /></DrFieldRow
          ><DrFieldRow label="触发方式"
            ><DrSelectField v-model="chartConfig.props.tooltip.trigger" class="dr-config-panel__control" aria-label="提示框触发方式"
              ><el-option label="按类目" value="axis" /><el-option label="按单柱" value="item" /></DrSelectField></DrFieldRow
          ><DrFieldRow label="字体" paired variant="number-color"
            ><template #first
              ><DrNumberField
                v-model="chartConfig.props.tooltip.textStyle.fontSize"
                class="dr-config-panel__control"
                :min="8"
                :max="48"
                controls-position="right"
                aria-label="提示框字号"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" /></template></DrFieldRow
          ><DrFieldRow label="背景色"><DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha aria-label="提示框背景色" /></DrFieldRow
          ><DrFieldRow label="边框色"><DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha aria-label="提示框边框色" /></DrFieldRow></ConfigCollapseItem
        ><ConfigCollapseItem title="数值格式" name="format"
          ><DrFieldRow label="小数位数"
            ><DrNumberField
              v-model="chartConfig.props.format.decimals"
              class="dr-config-panel__control"
              :min="0"
              :max="10"
              controls-position="right"
              aria-label="小数位数，留空使用原值"
              placeholder="原始精度"
            ></DrNumberField></DrFieldRow
          ><DrFieldRow label="前缀"><DrInputField v-model="chartConfig.props.format.prefix" class="dr-config-panel__control" aria-label="数值前缀" /></DrFieldRow
          ><DrFieldRow label="后缀"
            ><DrInputField v-model="chartConfig.props.format.suffix" class="dr-config-panel__control" aria-label="数值后缀" /></DrFieldRow></ConfigCollapseItem
        ><ConfigCollapseItem title="动画" name="animation"
          ><DrFieldRow label="启用"><el-switch v-model="chartConfig.props.animation.enabled" aria-label="启用动画" /></DrFieldRow
          ><DrFieldRow label="时长"
            ><DrNumberField
              v-model="chartConfig.props.animation.duration"
              class="dr-config-panel__control"
              :min="0"
              :max="5000"
              controls-position="right"
              aria-label="动画时长"
              :step="100"
              ><template #suffix>ms</template></DrNumberField
            ></DrFieldRow
          ><DrFieldRow label="缓动"
            ><DrSelectField v-model="chartConfig.props.animation.easing" class="dr-config-panel__control" aria-label="动画缓动"
              ><el-option label="线性" value="linear" /><el-option label="平滑减速" value="cubicOut" /><el-option label="弹性" value="elasticOut" /><el-option
                label="弹跳"
                value="bounceOut" /></DrSelectField></DrFieldRow></ConfigCollapseItem
        ><ConfigCollapseItem title="全局配置" name="global"
          ><DrFieldRow label="垂直边距" paired variant="equal"
            ><template #first
              ><DrNumberField
                v-model="chartConfig.props.global.padding[0]"
                label="上"
                class="dr-config-panel__control"
                :min="0"
                :max="200"
                controls-position="right"
                aria-label="上内边距"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second
              ><DrNumberField
                v-model="chartConfig.props.global.padding[2]"
                label="下"
                class="dr-config-panel__control"
                :min="0"
                :max="200"
                controls-position="right"
                aria-label="下内边距"
                ><template #suffix>px</template></DrNumberField
              ></template
            ></DrFieldRow
          ><DrFieldRow label="水平边距" paired variant="equal"
            ><template #first
              ><DrNumberField
                v-model="chartConfig.props.global.padding[3]"
                label="左"
                class="dr-config-panel__control"
                :min="0"
                :max="200"
                controls-position="right"
                aria-label="左内边距"
                ><template #suffix>px</template></DrNumberField
              ></template
            ><template #second
              ><DrNumberField
                v-model="chartConfig.props.global.padding[1]"
                label="右"
                class="dr-config-panel__control"
                :min="0"
                :max="200"
                controls-position="right"
                aria-label="右内边距"
                ><template #suffix>px</template></DrNumberField
              ></template
            ></DrFieldRow
          ></ConfigCollapseItem
        ></ConfigCollapse
      ></el-form
    >
  </div>
</template>
