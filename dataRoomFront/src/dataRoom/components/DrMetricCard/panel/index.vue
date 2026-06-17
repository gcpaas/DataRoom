<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrMetricCardControlPanel',
})
</script>
<script setup lang="ts">
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
                  <el-input-number v-model="chartConfig.props.global.padding[0]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">右</span>
                  <el-input-number v-model="chartConfig.props.global.padding[1]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">下</span>
                  <el-input-number v-model="chartConfig.props.global.padding[2]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">左</span>
                  <el-input-number v-model="chartConfig.props.global.padding[3]" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
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
                  <el-input-number v-model="chartConfig.props.global.borderWidth" class="dr-config-panel__control" :min="0" :max="20" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.global.borderRadius" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
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
                  <el-input-number v-model="chartConfig.props.global.shadow.blur" class="dr-config-panel__control" :min="0" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">X偏移</span>
                  <el-input-number v-model="chartConfig.props.global.shadow.offsetX" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">Y偏移</span>
                  <el-input-number v-model="chartConfig.props.global.shadow.offsetY" class="dr-config-panel__control" :min="-80" :max="80" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局" name="layout">
          <el-form-item label="方向">
            <el-select v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
              <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
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
          <el-form-item label="间距">
            <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="48" :step="1" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="标题" name="title">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.title.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本</span>
                  <el-input v-model="chartConfig.props.title.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.title.fontSize" class="dr-config-panel__control" :min="10" :max="48" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.title.color" show-alpha />
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
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认值</span>
                  <el-input-number v-model="chartConfig.props.value.defaultValue" class="dr-config-panel__control" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式</span>
                  <el-select v-model="chartConfig.props.value.format" class="dr-config-panel__control">
                    <el-option v-for="item in valueFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">小数位</span>
                  <el-input-number v-model="chartConfig.props.value.decimalPlaces" class="dr-config-panel__control" :min="0" :max="8" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">千分位</span>
                  <el-switch v-model="chartConfig.props.value.thousandSeparator" size="small" />
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
                  <span class="dr-config-panel__sub-label">空文本</span>
                  <el-input v-model="chartConfig.props.value.emptyText" class="dr-config-panel__control" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.value.fontSize" class="dr-config-panel__control" :min="12" :max="120" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.value.color" show-alpha />
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
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">行高</span>
                  <el-input-number v-model="chartConfig.props.value.lineHeight" class="dr-config-panel__control" :min="0.8" :max="2" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="副标题" name="subtitle">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.subtitle.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本</span>
                  <el-input v-model="chartConfig.props.subtitle.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.subtitle.fontSize" class="dr-config-panel__control" :min="10" :max="36" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.subtitle.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.subtitle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="单位" name="unit">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.unit.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本</span>
                  <el-input v-model="chartConfig.props.unit.text" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">位置</span>
                  <el-select v-model="chartConfig.props.unit.position" class="dr-config-panel__control">
                    <el-option v-for="item in unitPositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.unit.fontSize" class="dr-config-panel__control" :min="10" :max="48" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.unit.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">间距</span>
                  <el-input-number v-model="chartConfig.props.unit.gap" class="dr-config-panel__control" :min="0" :max="32" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="条件样式" name="conditional">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.conditional.enabled" size="small" />
            </div>
            <div class="dr-config-panel__stack">
              <div v-for="(rule, index) in chartConfig.props.conditional.rules" :key="index" class="dr-metric-card-config-panel__rule">
                <el-form class="dr-config-panel__sub-form" :model="rule" label-width="72px" size="small" label-position="left">
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">条件</span>
                      <el-select v-model="rule.operator" class="dr-config-panel__control">
                        <el-option v-for="item in operatorOptions" :key="item.value" :label="item.label" :value="item.value" />
                      </el-select>
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">阈值</span>
                      <el-input v-model="rule.value" class="dr-config-panel__control" />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">数值色</span>
                      <el-color-picker v-model="rule.valueColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">背景</span>
                      <el-color-picker v-model="rule.backgroundColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-form-item class="dr-config-panel__sub-form-item">
                    <div class="dr-config-panel__sub-row">
                      <span class="dr-config-panel__sub-label">边框色</span>
                      <el-color-picker v-model="rule.borderColor" show-alpha />
                    </div>
                  </el-form-item>
                  <el-button size="small" @click="removeConditionalRule(index)">删除规则</el-button>
                </el-form>
              </div>
              <el-button size="small" type="primary" @click="addConditionalRule">新增规则</el-button>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="动画" name="animation">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>启用</span>
              <el-switch v-model="chartConfig.props.animation.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">时长</span>
                  <el-input-number v-model="chartConfig.props.animation.duration" class="dr-config-panel__control" :min="0" :max="5000" :step="100" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">缓动</span>
                  <el-select v-model="chartConfig.props.animation.easing" class="dr-config-panel__control">
                    <el-option v-for="item in easingOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-metric-card-config-panel {
  padding: 0;
}

.dr-metric-card-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-metric-card-config-panel__rule {
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
</style>
