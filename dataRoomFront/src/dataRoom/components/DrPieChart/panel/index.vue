<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrPieChartControlPanel',
})
</script>
<script setup lang="ts">
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
import type { DrPieChartConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrPieChartConfig
}>()
const chartConfig = computed(() => chart)

const fontWeightOptions = [
  { label: '正常 (400)', value: 'normal' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '细 (300)', value: '300' },
  { label: '中等 (500)', value: '500' },
  { label: '较粗 (800)', value: '800' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]

const labelPositionOptions = [
  { label: '内部', value: 'inside' },
  { label: '外部', value: 'outside' },
  { label: '蜘蛛线', value: 'spider' },
]

const labelContentOptions = [
  { label: '名称', value: 'name' },
  { label: '数值', value: 'value' },
  { label: '百分比', value: 'percent' },
  { label: '名称 + 数值', value: 'name+value' },
  { label: '名称 + 百分比', value: 'name+percent' },
]

const valueFormatOptions = [
  { label: '默认', value: 'default' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '百分比（一位）', value: 'percent1' },
  { label: '千分位', value: 'thousand' },
  { label: '千分位（一位）', value: 'thousand1' },
]

const activeColors = computed(() => {
  const { pie, series } = chartConfig.value.props
  return pie.roseType && series.roseColors ? series.roseColors : series.colors
})

const updateColor = (index: number, color: string) => {
  activeColors.value[index] = color
}

const addColor = () => {
  activeColors.value.push(activeColors.value[0] || '')
}

const removeColor = (index: number) => {
  if (activeColors.value.length > 1) {
    activeColors.value.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-pie-chart-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="图形布局" name="pie">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>半径与中心</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="半径" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.pie.innerRadius" class="dr-config-panel__control" :min="0" :max="90" controls-position="right" label="内" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.pie.outerRadius" class="dr-config-panel__control" :min="10" :max="100" controls-position="right" label="外" /></template>
              </DrFieldRow>
              <DrFieldRow label="中心" paired variant="equal">
                <template #first><DrInputField v-model="chartConfig.props.pie.center[0]" class="dr-config-panel__control" placeholder="如 50%" :input-style="{ textAlign: 'center' }" aria-label="中心 X"><template #prefix>X</template></DrInputField></template>
                <template #second><DrInputField v-model="chartConfig.props.pie.center[1]" class="dr-config-panel__control" placeholder="如 50%" :input-style="{ textAlign: 'center' }" aria-label="中心 Y"><template #prefix>Y</template></DrInputField></template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>角度与形态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">起始角度</span>
                  <DrNumberField v-model="chartConfig.props.pie.startAngle" class="dr-config-panel__control" :min="0" :max="360" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">玫瑰图</span>
                  <DrSelectField v-model="chartConfig.props.pie.roseType" class="dr-config-panel__control">
                    <el-option label="关闭" :value="false" />
                    <el-option label="半径模式" value="radius" />
                    <el-option label="面积模式" value="area" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="中心内容" name="centerContent">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.centerContent.show" />
          </el-form-item>
          <el-form-item label="内容类型">
            <DrSelectField v-model="chartConfig.props.centerContent.type">
              <el-option label="文本" value="text" />
              <el-option label="图片" value="image" />
            </DrSelectField>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>标题</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">文本</span>
                  <DrInputField v-model="chartConfig.props.centerContent.title.text" class="dr-config-panel__control" placeholder="总计" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.centerContent.title.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" label="字" aria-label="中心标题字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.centerContent.title.color" show-alpha aria-label="中心标题颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.centerContent.title.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">Y偏移</span>
                  <DrNumberField v-model="chartConfig.props.centerContent.title.offsetY" class="dr-config-panel__control" :min="-100" :max="100" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>数值</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字段</span>
                  <DrInputField v-model="chartConfig.props.centerContent.value.field" class="dr-config-panel__control" placeholder="留空则显示总计" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.centerContent.value.fontSize" class="dr-config-panel__control" :min="10" :max="60" controls-position="right" label="字" aria-label="中心数值字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.centerContent.value.color" show-alpha aria-label="中心数值颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.centerContent.value.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">Y偏移</span>
                  <DrNumberField v-model="chartConfig.props.centerContent.value.offsetY" class="dr-config-panel__control" :min="-100" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式化</span>
                  <DrSelectField v-model="chartConfig.props.centerContent.value.format" class="dr-config-panel__control">
                    <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">前缀</span>
                  <DrInputField v-model="chartConfig.props.centerContent.value.prefix" class="dr-config-panel__control" placeholder="可选" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">后缀</span>
                  <DrInputField v-model="chartConfig.props.centerContent.value.suffix" class="dr-config-panel__control" placeholder="可选" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>图片</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">图片URL</span>
                  <DrInputField v-model="chartConfig.props.centerContent.image.url" class="dr-config-panel__control" placeholder="图片地址" />
                </div>
              </el-form-item>
              <DrFieldRow label="尺寸" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.centerContent.image.width" class="dr-config-panel__control" :min="10" :max="200" controls-position="right" label="宽" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.centerContent.image.height" class="dr-config-panel__control" :min="10" :max="200" controls-position="right" label="高" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标签" name="label">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.label.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.label.position" class="dr-config-panel__control">
                    <el-option v-for="item in labelPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">内容</span>
                  <DrSelectField v-model="chartConfig.props.label.content" class="dr-config-panel__control">
                    <el-option v-for="item in labelContentOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.label.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="标签字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.label.color" show-alpha aria-label="标签颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.label.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="引导线" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">引导线</span></template>
              <el-switch v-model="chartConfig.props.label.guideLine.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线段长度" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.label.guideLine.length" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" label="一段" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.label.guideLine.length2" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" label="二段" /></template>
              </DrFieldRow>
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.label.guideLine.lineWidth" class="dr-config-panel__control" :min="1" :max="5" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.label.guideLine.color" show-alpha aria-label="引导线颜色" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="图例" name="legend">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.legend.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.legend.position" class="dr-config-panel__control">
                    <el-option label="顶部" value="top" />
                    <el-option label="底部" value="bottom" />
                    <el-option label="左侧" value="left" />
                    <el-option label="右侧" value="right" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.legend.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="图例字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.legend.textStyle.color" show-alpha aria-label="图例文字颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.legend.textStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间距</span>
                  <DrNumberField v-model="chartConfig.props.legend.itemGap" class="dr-config-panel__control" :min="0" :max="60" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="提示框" name="tooltip">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.tooltip.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.tooltip.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">边框色</span>
                  <DrColorField v-model="chartConfig.props.tooltip.borderColor" show-alpha />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.tooltip.textStyle.fontSize" class="dr-config-panel__control" :min="10" :max="24" controls-position="right" label="字" aria-label="提示框字号" /></template>
                <template #second><DrColorField v-model="chartConfig.props.tooltip.textStyle.color" show-alpha aria-label="提示框文字颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">显示占比</span>
                  <el-switch v-model="chartConfig.props.tooltip.showPercent" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="扇区样式" name="series">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>扇区边框</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="边框" paired variant="number-color">
                <template #first><DrNumberField v-model="chartConfig.props.pie.borderWidth" class="dr-config-panel__control" :min="0" :max="10" controls-position="right" label="宽" /></template>
                <template #second><DrColorField v-model="chartConfig.props.pie.borderColor" show-alpha aria-label="扇区边框颜色" /></template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">扇形圆角</span>
                  <DrNumberField v-model="chartConfig.props.pie.borderRadius" class="dr-config-panel__control" :min="0" :max="30" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>选中状态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中模式</span>
                  <DrSelectField v-model="chartConfig.props.series.selectedMode" class="dr-config-panel__control">
                    <el-option label="关闭" :value="false" />
                    <el-option label="单选" value="single" />
                    <el-option label="多选" value="multiple" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中偏移</span>
                  <DrNumberField v-model="chartConfig.props.series.selectedOffset" class="dr-config-panel__control" :min="0" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">最小角度</span>
                  <DrNumberField v-model="chartConfig.props.series.minAngle" class="dr-config-panel__control" :min="0" :max="30" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="小数合并" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">小数合并</span></template>
              <el-switch v-model="chartConfig.props.series.merge.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">最大数量</span>
                  <DrNumberField v-model="chartConfig.props.series.merge.maxCount" class="dr-config-panel__control" :min="2" :max="50" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">合并标签</span>
                  <DrInputField v-model="chartConfig.props.series.merge.mergeLabel" class="dr-config-panel__control" placeholder="其他" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>颜色列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">颜色列表</span>
                  <div class="dr-config-panel__color-list">
                    <div v-for="(color, index) in activeColors" :key="index" class="dr-config-panel__inline">
                      <DrColorField :model-value="color" show-alpha @update:model-value="(val: string | null) => updateColor(index, val || color)" />
                      <el-button class="config-panel-text" text size="small" aria-label="删除颜色" title="删除颜色" :icon="'Delete'" :disabled="activeColors.length <= 1" @click="removeColor(index)" />
                    </div>
                    <el-button class="config-panel-text" plain @click="addColor">添加颜色</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.animation.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">时长</span>
                  <DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right"><template #suffix>ms</template></DrNumberField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">缓动</span>
                  <DrSelectField v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
                    <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="200" controls-position="right" label="右" /></template>
          </DrFieldRow>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-pie-chart-config-panel {
  padding: 0;
}

.dr-pie-chart-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
