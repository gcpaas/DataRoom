<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrTrendMetricCardControlPanel',
})
</script>
<script setup lang="ts">
import type { DrTrendMetricCardConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrTrendMetricCardConfig
}>()
const chartConfig = computed(() => chart)

const alignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const trendPositionOptions = [
  { label: '底部', value: 'bottom' },
  { label: '右侧', value: 'right' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

const valueFormatOptions = [
  { label: '原始值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '1 位小数', value: 'float1' },
  { label: '2 位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
]

const compareModeOptions = [
  { label: '变化值', value: 'value' },
  { label: '变化率', value: 'rate' },
  { label: '值和率', value: 'both' },
]

const chartTypeOptions = [
  { label: '折线', value: 'line' },
  { label: '面积', value: 'area' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '平滑减速', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '弹跳', value: 'bounceOut' },
]
</script>

<template>
  <div class="dr-config-panel dr-trend-metric-card-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="全局" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">上</span>
                  <el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">右</span>
                  <el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">下</span>
                  <el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">左</span>
                  <el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="100" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>容器</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景</span>
                  <el-input v-model="chartConfig.props.global.backgroundColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-input v-model="chartConfig.props.global.borderColor" class="dr-config-panel__control" />
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
                  <el-input-number v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="趋势位置">
            <el-select v-model="chartConfig.props.layout.trendPosition">
              <el-option v-for="item in trendPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="文本对齐">
            <el-select v-model="chartConfig.props.layout.horizontalAlign">
              <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="间距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="48" controls-position="right" />
          </el-form-item>
          <el-form-item label="趋势高">
            <el-input-number v-model="chartConfig.props.layout.trendHeight" class="dr-config-panel__control" :min="30" :max="180" controls-position="right" />
          </el-form-item>
          <el-form-item label="趋势宽">
            <el-input-number v-model="chartConfig.props.layout.trendWidth" class="dr-config-panel__control" :min="80" :max="320" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="标题" name="title">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.title.show" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">内容</span>
                  <el-input v-model="chartConfig.props.title.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.title.fontSize" class="dr-config-panel__control" :min="10" :max="48" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.title.color" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.title.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="数值" name="value">
          <el-form-item label="默认值">
            <el-input-number v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" controls-position="right" />
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="chartConfig.props.value.format">
              <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">小数位</span>
                  <el-input-number v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">前缀</span>
                  <el-input v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">后缀</span>
                  <el-input v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="120" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.value.color" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="时间" name="timestamp">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.timestamp.show" />
          </el-form-item>
          <el-form-item label="格式">
            <el-input v-model="chartConfig.props.timestamp.format" />
          </el-form-item>
          <el-form-item label="前缀">
            <el-input v-model="chartConfig.props.timestamp.prefix" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.timestamp.fontSize" class="dr-config-panel__control" :min="10" :max="32" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.timestamp.color" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="对比" name="compare">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.compare.show" />
          </el-form-item>
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.compare.mode">
              <el-option v-for="item in compareModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">正向色</span>
                  <el-input v-model="chartConfig.props.compare.positiveColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">负向色</span>
                  <el-input v-model="chartConfig.props.compare.negativeColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">持平色</span>
                  <el-input v-model="chartConfig.props.compare.neutralColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.compare.fontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="趋势" name="trend">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.trend.show" />
          </el-form-item>
          <el-form-item label="类型">
            <el-select v-model="chartConfig.props.trend.chartType">
              <el-option v-for="item in chartTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="平滑">
            <el-switch v-model="chartConfig.props.trend.smooth" />
          </el-form-item>
          <el-form-item label="从零开始">
            <el-switch v-model="chartConfig.props.trend.startYAxisAtZero" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>线条和点</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">线宽</span>
                  <el-input-number v-model="chartConfig.props.trend.lineWidth" class="dr-config-panel__control" :min="1" :max="12" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">线色</span>
                  <el-input v-model="chartConfig.props.trend.lineColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">显示点</span>
                  <el-switch v-model="chartConfig.props.trend.showSymbol" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">点大小</span>
                  <el-input-number v-model="chartConfig.props.trend.symbolSize" class="dr-config-panel__control" :min="1" :max="20" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>面积</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">填充色</span>
                  <el-input v-model="chartConfig.props.trend.areaColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">透明度</span>
                  <el-input-number v-model="chartConfig.props.trend.areaOpacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.05" :precision="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="坐标轴" name="axis">
          <el-form-item label="X 轴">
            <el-switch v-model="chartConfig.props.axis.showXAxis" />
          </el-form-item>
          <el-form-item label="Y 轴">
            <el-switch v-model="chartConfig.props.axis.showYAxis" />
          </el-form-item>
          <el-form-item label="极值">
            <el-switch v-model="chartConfig.props.axis.showMinMaxLabel" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>标签</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.axis.labelColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.axis.labelFontSize" class="dr-config-panel__control" :min="8" :max="24" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="提示框" name="tooltip">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <el-form-item label="模板">
            <el-input v-model="chartConfig.props.tooltip.formatter" type="textarea" :rows="3" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.animation.enabled" />
          </el-form-item>
          <el-form-item label="时长">
            <el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" controls-position="right" />
          </el-form-item>
          <el-form-item label="缓动">
            <el-select v-model="chartConfig.props.animation.easing">
              <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-trend-metric-card-config-panel {
  padding: 0;
}

.dr-trend-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
