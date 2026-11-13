<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrMetricCardControlPanel',
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
import type { DrMetricCardConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrMetricCardConfig
}>()
const chartConfig = computed(() => chart)

const directionOptions = [
  { label: '纵向', value: 'vertical' },
  { label: '横向', value: 'horizontal' },
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
  { label: '前缀', value: 'prefix' },
  { label: '后缀', value: 'suffix' },
  { label: '上方', value: 'top' },
  { label: '下方', value: 'bottom' },
]

const operatorOptions = [
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
  { label: '等于', value: '=' },
  { label: '不等于', value: '!=' },
  { label: '包含', value: 'contains' },
  { label: '为空', value: 'empty' },
  { label: '非空', value: 'notEmpty' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '缓出', value: 'cubicOut' },
  { label: '弹性', value: 'elasticOut' },
  { label: '回弹', value: 'bounceOut' },
]

const addConditionalRule = () => {
  chartConfig.value.props.conditional.rules.push({
    operator: '>=',
    value: 0,
    valueColor: '#67c23a',
    backgroundColor: 'rgba(0, 0, 0, 0)',
    borderColor: 'rgba(0, 0, 0, 0)',
  })
}

const removeConditionalRule = (index: number) => {
  chartConfig.value.props.conditional.rules.splice(index, 1)
}
</script>

<template>
  <div class="dr-config-panel dr-metric-card-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="全局配置" name="global">
          <DrFieldRow label="垂直边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" label="上" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" label="下" /></template>
          </DrFieldRow>
          <DrFieldRow label="水平边距" paired variant="equal">
            <template #first><DrNumberField v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" label="左" /></template>
            <template #second><DrNumberField v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" label="右" /></template>
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
                  <DrNumberField v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="20" :step="1" controls-position="right" aria-label="边框宽度"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.global.borderColor" show-alpha aria-label="边框颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
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
                  <DrNumberField v-model="chartConfig.props.global.shadow.blur" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" aria-label="阴影模糊"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.global.shadow.color" show-alpha aria-label="阴影颜色" />
                </template>
              </DrFieldRow>
              <DrFieldRow label="偏移 X/Y" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.global.shadow.offsetX" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" aria-label="X 偏移"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.global.shadow.offsetY" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" aria-label="Y 偏移"><template #suffix>px</template></DrNumberField>
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局" name="layout">
          <el-form-item label="方向">
            <DrSelectField v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
              <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>
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
          <el-form-item label="间距">
            <DrNumberField v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="48" :step="1" controls-position="right" />
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标题" name="title">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.title.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">文本</span>
                  <DrInputField v-model="chartConfig.props.title.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.title.fontSize" class="dr-config-panel__control" :min="10" :max="48" :step="1" controls-position="right" aria-label="标题字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.title.color" show-alpha aria-label="标题颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.title.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="数值" name="value">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">默认值</span>
                  <DrNumberField v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式</span>
                  <DrSelectField v-model="chartConfig.props.value.format" class="dr-config-panel__control">
                    <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">小数位</span>
                  <DrNumberField v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">千分位</span>
                  <el-switch v-model="chartConfig.props.value.thousandSeparator" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">前缀</span>
                  <DrInputField v-model="chartConfig.props.value.prefix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">后缀</span>
                  <DrInputField v-model="chartConfig.props.value.suffix" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">空文本</span>
                  <DrInputField v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文字样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="120" :step="1" controls-position="right" aria-label="数值字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.value.color" show-alpha aria-label="数值颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.value.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">行高</span>
                  <DrNumberField v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="2" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="副标题" name="subtitle">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.subtitle.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">文本</span>
                  <DrInputField v-model="chartConfig.props.subtitle.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.subtitle.fontSize" class="dr-config-panel__control" :min="10" :max="36" :step="1" controls-position="right" aria-label="副标题字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.subtitle.color" show-alpha aria-label="副标题颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.subtitle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="单位" name="unit">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.unit.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">文本</span>
                  <DrInputField v-model="chartConfig.props.unit.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.unit.position" class="dr-config-panel__control">
                    <el-option v-for="item in unitPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.unit.fontSize" class="dr-config-panel__control" :min="10" :max="48" :step="1" controls-position="right" aria-label="单位字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.unit.color" show-alpha aria-label="单位颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间距</span>
                  <DrNumberField v-model="chartConfig.props.unit.gap" class="dr-config-panel__control" :min="0" :max="32" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="条件样式" name="conditional">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="启用" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.conditional.enabled" />
            </el-form-item>
            <div class="dr-config-panel__stack">
              <div v-for="(rule, index) in chartConfig.props.conditional.rules" :key="index" class="dr-metric-card-config-panel__rule">
                <el-form class="dr-config-panel__sub-form" :model="rule" label-width="72px" label-position="left">
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">条件</span>
                      <DrSelectField v-model="rule.operator" class="dr-config-panel__control">
                        <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label" :value="item.value" />
                      </DrSelectField>
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">阈值</span>
                      <DrInputField v-model="rule.value" class="dr-config-panel__control" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">数值色</span>
                      <DrColorField v-model="rule.valueColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景</span>
                      <DrColorField v-model="rule.backgroundColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label dr-config-panel__field-label">边框色</span>
                      <DrColorField v-model="rule.borderColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-button class="config-panel-text" @click="removeConditionalRule(index)">删除规则</el-button>
                </el-form>
              </div>
              <el-button class="config-panel-text" type="primary" @click="addConditionalRule">新增规则</el-button>
            </div>
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
                  <DrNumberField v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
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
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-metric-card-config-panel {
  padding: 0;
}

.dr-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-metric-card-config-panel__rule {
  padding-bottom: 8px;
}
</style>
