<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrImageMetricCardControlPanel',
})
</script>

<script setup lang="ts">
import { computed } from 'vue'
import type { DrImageMetricCardConfig } from '../install.ts'

const { chart } = defineProps<{
  chart: DrImageMetricCardConfig
}>()

const chartConfig = computed(() => chart)

const imagePositionOptions = [
  { label: '左图右文', value: 'left' },
  { label: '右图左文', value: 'right' },
]

const contentOrderOptions = [
  { label: '描述在上', value: 'descriptionFirst' },
  { label: '数值在上', value: 'valueFirst' },
]

const horizontalAlignOptions = [
  { label: '左对齐', value: 'left' },
  { label: '居中', value: 'center' },
  { label: '右对齐', value: 'right' },
]

const verticalAlignOptions = [
  { label: '顶部', value: 'top' },
  { label: '居中', value: 'center' },
  { label: '底部', value: 'bottom' },
]

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]

const fontWeightOptions = [
  { label: '正常', value: 'normal' },
  { label: '粗体', value: 'bold' },
  { label: '更粗', value: 'bolder' },
]

const valueFormatOptions = [
  { label: '原始值', value: 'value' },
  { label: '整数', value: 'integer' },
  { label: '一位小数', value: 'float1' },
  { label: '两位小数', value: 'float2' },
  { label: '百分比', value: 'percent' },
  { label: '千分位', value: 'thousand' },
  { label: '货币', value: 'currency' },
]

const unitPositionOptions = [
  { label: '描述后', value: 'descriptionSuffix' },
  { label: '数值前', value: 'valuePrefix' },
  { label: '数值后', value: 'valueSuffix' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '缓出', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '回弹', value: 'bounceOut' },
]
</script>

<template>
  <div class="dr-config-panel dr-image-metric-card-config-panel">
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
                  <el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">右</span>
                  <el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">下</span>
                  <el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">左</span>
                  <el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>卡片样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景</span>
                  <el-color-picker v-model="chartConfig.props.global.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.global.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框宽</span>
                  <el-input-number v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="40" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>阴影</span>
              <el-switch v-model="chartConfig.props.global.shadow.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.global.shadow.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">模糊</span>
                  <el-input-number v-model="chartConfig.props.global.shadow.blur" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">X偏移</span>
                  <el-input-number v-model="chartConfig.props.global.shadow.offsetX" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">Y偏移</span>
                  <el-input-number v-model="chartConfig.props.global.shadow.offsetY" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="图文">
            <el-select v-model="chartConfig.props.layout.imagePosition" class="dr-config-panel__control">
              <el-option v-for="item in imagePositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="顺序">
            <el-select v-model="chartConfig.props.layout.contentOrder" class="dr-config-panel__control">
              <el-option v-for="item in contentOrderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="图文距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="行间距">
            <el-input-number v-model="chartConfig.props.layout.rowGap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="水平">
            <el-select v-model="chartConfig.props.layout.horizontalAlign" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="垂直">
            <el-select v-model="chartConfig.props.layout.verticalAlign" class="dr-config-panel__control">
              <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="图片" name="image">
          <el-form-item label="地址">
            <el-input v-model="chartConfig.props.image.url" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="宽度">
            <el-input-number v-model="chartConfig.props.image.width" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number v-model="chartConfig.props.image.height" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="填充">
            <el-select v-model="chartConfig.props.image.repeatMode" class="dr-config-panel__control">
              <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number v-model="chartConfig.props.image.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="描述" name="description">
          <el-form-item label="文本">
            <el-input v-model="chartConfig.props.description.text" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.description.fontSize" class="dr-config-panel__control" :min="10" :max="120" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.description.color" show-alpha />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.description.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高">
            <el-input-number v-model="chartConfig.props.description.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.description.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="数值" name="value">
          <el-form-item label="默认值">
            <el-input-number v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="格式">
            <el-select v-model="chartConfig.props.value.format" class="dr-config-panel__control">
              <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="小数位">
            <el-input-number v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="千分位">
            <el-switch v-model="chartConfig.props.value.thousandSeparator" size="small" />
          </el-form-item>
          <el-form-item label="前缀">
            <el-input v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="后缀">
            <el-input v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="空文本">
            <el-input v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="160" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.value.color" show-alpha />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高">
            <el-input-number v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <el-select v-model="chartConfig.props.value.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>发光</span>
              <el-switch v-model="chartConfig.props.value.glow.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.value.glow.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">模糊</span>
                  <el-input-number v-model="chartConfig.props.value.glow.blur" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">X偏移</span>
                  <el-input-number v-model="chartConfig.props.value.glow.offsetX" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">Y偏移</span>
                  <el-input-number v-model="chartConfig.props.value.glow.offsetY" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="单位" name="unit">
          <el-form-item label="文本">
            <el-input v-model="chartConfig.props.unit.text" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="位置">
            <el-select v-model="chartConfig.props.unit.position" class="dr-config-panel__control">
              <el-option v-for="item in unitPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="间距">
            <el-input-number v-model="chartConfig.props.unit.gap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="字号">
            <el-input-number v-model="chartConfig.props.unit.fontSize" class="dr-config-panel__control" :min="10" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.unit.color" show-alpha />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.unit.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="行高">
            <el-input-number v-model="chartConfig.props.unit.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.animation.enabled" size="small" />
          </el-form-item>
          <el-form-item label="时长">
            <el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
          </el-form-item>
          <el-form-item label="缓动">
            <el-select v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
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

.dr-image-metric-card-config-panel {
  padding: 0;
}

.dr-image-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
