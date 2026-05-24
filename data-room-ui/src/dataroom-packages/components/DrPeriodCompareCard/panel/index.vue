<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrPeriodCompareCardControlPanel',
})
</script>
<script setup lang="ts">
import type {DrPeriodCompareCardConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrPeriodCompareCardConfig
}>()
const chartConfig = computed(() => chart)

const dataModeOptions = [
  {label: '自动回退', value: 'autoFallback'},
  {label: '字段直传', value: 'fields'},
  {label: '序列计算', value: 'series'},
]

const sortByTimeOptions = [
  {label: '升序', value: 'asc'},
  {label: '降序', value: 'desc'},
  {label: '不排序', value: 'none'},
]

const zeroPolicyOptions = [
  {label: '显示空值', value: 'empty'},
  {label: '显示 0', value: 'zero'},
  {label: '显示无穷', value: 'infinite'},
]

const valueFormatOptions = [
  {label: '原始值', value: 'value'},
  {label: '整数', value: 'integer'},
  {label: '一位小数', value: 'float1'},
  {label: '两位小数', value: 'float2'},
  {label: '百分比', value: 'percent'},
  {label: '千分位', value: 'thousand'},
  {label: '货币', value: 'currency'},
]

const rateFormatOptions = [
  {label: '百分比整数', value: 'percent0'},
  {label: '百分比一位', value: 'percent1'},
  {label: '百分比两位', value: 'percent2'},
]

const indicatorTypeOptions = [
  {label: '箭头', value: 'arrow'},
  {label: '三角形', value: 'triangle'},
  {label: '文本', value: 'text'},
  {label: '不显示', value: 'none'},
]

const positiveDirectionOptions = [
  {label: '上升为正', value: 'increaseGood'},
  {label: '下降为正', value: 'decreaseGood'},
  {label: '中性', value: 'neutral'},
]

const layoutModeOptions = [
  {label: '紧凑', value: 'compact'},
  {label: '水平', value: 'horizontal'},
  {label: '垂直', value: 'vertical'},
]

const alignOptions = [
  {label: '左对齐', value: 'left'},
  {label: '居中', value: 'center'},
  {label: '右对齐', value: 'right'},
]

const fontWeightOptions = [
  {label: '正常', value: 'normal'},
  {label: '粗体', value: 'bold'},
  {label: '更粗', value: 'bolder'},
]

const easingOptions = [
  {label: '线性', value: 'linear'},
  {label: '平滑减速', value: 'cubicOut'},
  {label: '弹性', value: 'elasticOut'},
  {label: '弹跳', value: 'bounceOut'},
]
</script>

<template>
  <div class="dr-config-panel dr-period-compare-card-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="全局配置" name="global">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">上</span>
                  <el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">右</span>
                  <el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">下</span>
                  <el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">左</span>
                  <el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="80" controls-position="right" />
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
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-input v-model="chartConfig.props.global.backgroundColor" class="dr-config-panel__control" placeholder="CSS 变量或 transparent" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-input v-model="chartConfig.props.global.borderColor" class="dr-config-panel__control" placeholder="CSS 变量或 transparent" />
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

        <el-collapse-item title="数据模式" name="dataMode">
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.dataMode.mode">
              <el-option v-for="item in dataModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="滞后期">
            <el-input-number v-model="chartConfig.props.dataMode.lag" class="dr-config-panel__control" :min="1" :max="365" controls-position="right" />
          </el-form-item>
          <el-form-item label="排序">
            <el-select v-model="chartConfig.props.dataMode.sortByTime">
              <el-option v-for="item in sortByTimeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="零值">
            <el-select v-model="chartConfig.props.dataMode.zeroPolicy">
              <el-option v-for="item in zeroPolicyOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="标题" name="title">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.title.show" />
          </el-form-item>
          <el-form-item label="文本">
            <el-input v-model="chartConfig.props.title.text" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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

        <el-collapse-item title="当前值" name="current">
          <el-form-item label="标签">
            <el-input v-model="chartConfig.props.current.label" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input-number v-model="chartConfig.props.current.defaultValue" class="dr-config-panel__control" controls-position="right" />
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="chartConfig.props.current.format">
              <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>数值文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">前缀</span>
                  <el-input v-model="chartConfig.props.current.prefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">后缀</span>
                  <el-input v-model="chartConfig.props.current.suffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.current.fontSize" class="dr-config-panel__control" :min="12" :max="120" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-input v-model="chartConfig.props.current.color" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.current.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="对比信息" name="comparison">
          <el-form-item label="标签">
            <el-input v-model="chartConfig.props.comparison.label" />
          </el-form-item>
          <el-form-item label="对比值">
            <el-switch v-model="chartConfig.props.comparison.showPreviousValue" />
          </el-form-item>
          <el-form-item label="变化值">
            <el-switch v-model="chartConfig.props.comparison.showChangeValue" />
          </el-form-item>
          <el-form-item label="变化率">
            <el-switch v-model="chartConfig.props.comparison.showChangeRate" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>变化显示</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">率格式</span>
                  <el-select v-model="chartConfig.props.comparison.rateFormat" class="dr-config-panel__control">
                    <el-option v-for="item in rateFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">值前缀</span>
                  <el-input v-model="chartConfig.props.comparison.changeValuePrefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">值后缀</span>
                  <el-input v-model="chartConfig.props.comparison.changeValueSuffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="涨跌指示" name="indicator">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.indicator.show" />
          </el-form-item>
          <el-form-item label="样式">
            <el-select v-model="chartConfig.props.indicator.type">
              <el-option v-for="item in indicatorTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="方向">
            <el-select v-model="chartConfig.props.indicator.positiveDirection">
              <el-option v-for="item in positiveDirectionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色与尺寸</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">正向色</span>
                  <el-input v-model="chartConfig.props.indicator.positiveColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">负向色</span>
                  <el-input v-model="chartConfig.props.indicator.negativeColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">中性色</span>
                  <el-input v-model="chartConfig.props.indicator.neutralColor" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">图标</span>
                  <el-input-number v-model="chartConfig.props.indicator.iconSize" class="dr-config-panel__control" :min="8" :max="40" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="模式">
            <el-select v-model="chartConfig.props.layout.mode">
              <el-option v-for="item in layoutModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.layout.horizontalAlign">
              <el-option v-for="item in alignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="间距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="48" controls-position="right" />
          </el-form-item>
          <el-form-item label="标签宽">
            <el-input-number v-model="chartConfig.props.layout.labelWidth" class="dr-config-panel__control" :min="0" :max="160" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="对比文本" name="textStyle">
          <el-form-item label="标签字号">
            <el-input-number v-model="chartConfig.props.textStyle.labelFontSize" class="dr-config-panel__control" :min="10" :max="36" controls-position="right" />
          </el-form-item>
          <el-form-item label="标签颜色">
            <el-input v-model="chartConfig.props.textStyle.labelColor" />
          </el-form-item>
          <el-form-item label="数值字号">
            <el-input-number v-model="chartConfig.props.textStyle.compareFontSize" class="dr-config-panel__control" :min="10" :max="48" controls-position="right" />
          </el-form-item>
          <el-form-item label="数值字重">
            <el-select v-model="chartConfig.props.textStyle.compareFontWeight">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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

.dr-period-compare-card-config-panel {
  padding: 0;
}

.dr-period-compare-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
