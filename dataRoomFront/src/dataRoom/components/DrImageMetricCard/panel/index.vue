<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrImageMetricCardControlPanel',
})
</script>

<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" label="右" /></template>
          </DrFieldRow>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>卡片样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景</span>
                  <DrColorField v-model="chartConfig.props.global.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <DrFieldRow label="边框" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="40" :step="1" controls-position="right" aria-label="边框宽度"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.global.borderColor" show-alpha aria-label="边框颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="阴影" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">阴影</span></template>
              <el-switch v-model="chartConfig.props.global.shadow.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="模糊 / 色" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.global.shadow.blur" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" aria-label="阴影模糊"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.global.shadow.color" show-alpha aria-label="阴影颜色" />
                </template>
              </DrFieldRow>
              <DrFieldRow label="偏移 X/Y" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.global.shadow.offsetX" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" aria-label="X 偏移"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.global.shadow.offsetY" class="dr-config-panel__control" :min="-120" :max="120" :step="1" controls-position="right" aria-label="Y 偏移"><template #suffix>px</template></DrNumberField>
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局" name="layout">
          <el-form-item label="图文">
            <DrSelectField v-model="chartConfig.props.layout.imagePosition" class="dr-config-panel__control">
              <el-option v-for="item in imagePositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="顺序">
            <DrSelectField v-model="chartConfig.props.layout.contentOrder" class="dr-config-panel__control">
              <el-option v-for="item in contentOrderOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <DrFieldRow label="图文 / 行距" paired variant="equal">
            <template #first>
              <DrNumberField v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="120" :step="1" controls-position="right" aria-label="图文间距"><template #suffix>px</template></DrNumberField>
            </template>
            <template #second>
              <DrNumberField v-model="chartConfig.props.layout.rowGap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" aria-label="行间距"><template #suffix>px</template></DrNumberField>
            </template>
          </DrFieldRow>
          <el-form-item label="水平">
            <DrSelectField v-model="chartConfig.props.layout.horizontalAlign" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="垂直">
            <DrSelectField v-model="chartConfig.props.layout.verticalAlign" class="dr-config-panel__control">
              <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="图片" name="image">
          <el-form-item label="地址">
            <DrInputField v-model="chartConfig.props.image.url" class="dr-config-panel__control" clearable />
          </el-form-item>
          <DrFieldRow label="宽 / 高" paired variant="equal">
            <template #first>
              <DrNumberField v-model="chartConfig.props.image.width" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" aria-label="图片宽度"><template #suffix>px</template></DrNumberField>
            </template>
            <template #second>
              <DrNumberField v-model="chartConfig.props.image.height" class="dr-config-panel__control" :min="1" :max="1000" :step="1" controls-position="right" aria-label="图片高度"><template #suffix>px</template></DrNumberField>
            </template>
          </DrFieldRow>
          <el-form-item label="填充">
            <DrSelectField v-model="chartConfig.props.image.repeatMode" class="dr-config-panel__control">
              <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="圆角">
            <DrNumberField v-model="chartConfig.props.image.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" />
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="描述" name="description">
          <el-form-item label="文本">
            <DrInputField v-model="chartConfig.props.description.text" class="dr-config-panel__control" clearable />
          </el-form-item>
          <DrFieldRow label="字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.description.fontSize" class="dr-config-panel__control" :min="10" :max="120" :step="1" controls-position="right" aria-label="描述字号"><template #suffix>px</template></DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.description.color" show-alpha aria-label="描述颜色" />
            </template>
          </DrFieldRow>
          <el-form-item label="字重">
            <DrSelectField v-model="chartConfig.props.description.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="行高">
            <DrNumberField v-model="chartConfig.props.description.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <DrSelectField v-model="chartConfig.props.description.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="数值" name="value">
          <el-form-item label="默认值">
            <DrNumberField v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="格式">
            <DrSelectField v-model="chartConfig.props.value.format" class="dr-config-panel__control">
              <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="小数位">
            <DrNumberField v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
          </el-form-item>
          <el-form-item label="千分位">
            <el-switch v-model="chartConfig.props.value.thousandSeparator" />
          </el-form-item>
          <el-form-item label="前缀">
            <DrInputField v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="后缀">
            <DrInputField v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="空文本">
            <DrInputField v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" clearable />
          </el-form-item>
          <DrFieldRow label="字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="160" :step="1" controls-position="right" aria-label="数值字号"><template #suffix>px</template></DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.value.color" show-alpha aria-label="数值颜色" />
            </template>
          </DrFieldRow>
          <el-form-item label="字重">
            <DrSelectField v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="行高">
            <DrNumberField v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
          <el-form-item label="对齐">
            <DrSelectField v-model="chartConfig.props.value.align" class="dr-config-panel__control">
              <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="发光" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">发光</span></template>
              <el-switch v-model="chartConfig.props.value.glow.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="模糊 / 色" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.value.glow.blur" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" aria-label="发光模糊"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.value.glow.color" show-alpha aria-label="发光颜色" />
                </template>
              </DrFieldRow>
              <DrFieldRow label="偏移 X/Y" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.value.glow.offsetX" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" aria-label="X 偏移"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.value.glow.offsetY" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" aria-label="Y 偏移"><template #suffix>px</template></DrNumberField>
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="单位" name="unit">
          <el-form-item label="文本">
            <DrInputField v-model="chartConfig.props.unit.text" class="dr-config-panel__control" clearable />
          </el-form-item>
          <el-form-item label="位置">
            <DrSelectField v-model="chartConfig.props.unit.position" class="dr-config-panel__control">
              <el-option v-for="item in unitPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="间距">
            <DrNumberField v-model="chartConfig.props.unit.gap" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
          </el-form-item>
          <DrFieldRow label="字体" paired variant="number-color">
            <template #first>
              <DrNumberField v-model="chartConfig.props.unit.fontSize" class="dr-config-panel__control" :min="10" :max="80" :step="1" controls-position="right" aria-label="单位字号"><template #suffix>px</template></DrNumberField>
            </template>
            <template #second>
              <DrColorField v-model="chartConfig.props.unit.color" show-alpha aria-label="单位颜色" />
            </template>
          </DrFieldRow>
          <el-form-item label="字重">
            <DrSelectField v-model="chartConfig.props.unit.fontWeight" class="dr-config-panel__control">
              <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="行高">
            <DrNumberField v-model="chartConfig.props.unit.lineHeight" class="dr-config-panel__control" :min="0.8" :max="3" :step="0.1" controls-position="right" />
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="动画" name="animation">
          <el-form-item label="启用">
            <el-switch v-model="chartConfig.props.animation.enabled" />
          </el-form-item>
          <el-form-item label="时长">
            <DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
          </el-form-item>
          <el-form-item label="缓动">
            <DrSelectField v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
              <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-image-metric-card-config-panel {
  padding: 0;
}

.dr-image-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
