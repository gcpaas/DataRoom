<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrProgressBarControlPanel',
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
import type { DrProgressBarConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrProgressBarConfig
}>()
const chartConfig = computed(() => chart)

const labelPositionOptions = [
  { label: '内部', value: 'inside' },
  { label: '外部', value: 'outside' },
  { label: '顶部', value: 'top' },
]

const labelFormatOptions = [
  { label: '百分比', value: 'percent' },
  { label: '数值', value: 'value' },
  { label: '自定义', value: 'custom' },
]

const fontWeightOptions = [
  { label: '正常 (400)', value: 'normal' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '细 (300)', value: '300' },
  { label: '中等 (500)', value: '500' },
  { label: '较粗 (800)', value: '800' },
]

const titlePositionOptions = [
  { label: '左侧', value: 'left' },
  { label: '顶部', value: 'top' },
]

const gradientDirectionOptions = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
]

const easingOptions = [
  { label: '线性', value: 'linear' },
  { label: '缓动', value: 'ease' },
  { label: '缓入', value: 'ease-in' },
  { label: '缓出', value: 'ease-out' },
  { label: '缓入缓出', value: 'ease-in-out' },
]
</script>

<template>
  <div class="dr-config-panel dr-progress-bar-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="数值配置" name="value">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="当前 / 最大" paired variant="equal">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.value.current" class="dr-config-panel__control" :min="0" :step="1" controls-position="right" aria-label="当前值" />
                </template>
                <template #second>
                  <DrNumberField v-model="chartConfig.props.value.max" class="dr-config-panel__control" :min="1" :step="1" controls-position="right" aria-label="最大值" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="进度配置" name="bar">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>基础样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">高度</span>
                  <DrNumberField v-model="chartConfig.props.bar.height" class="dr-config-panel__control" :min="4" :max="60" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">填充颜色</span>
                  <DrColorField v-model="chartConfig.props.bar.fillColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景颜色</span>
                  <DrColorField v-model="chartConfig.props.bar.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.bar.borderRadius" class="dr-config-panel__control" :min="0" :max="30" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="渐变" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">渐变</span></template>
              <el-switch v-model="chartConfig.props.bar.gradient.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="起始 / 结束" paired variant="equal">
                <template #first>
                  <DrColorField v-model="chartConfig.props.bar.gradient.startColor" show-alpha aria-label="渐变起始颜色" />
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.bar.gradient.endColor" show-alpha aria-label="渐变结束颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">方向</span>
                  <DrSelectField v-model="chartConfig.props.bar.gradient.direction" class="dr-config-panel__control">
                    <el-option v-for="item in gradientDirectionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标签" name="label">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
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
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.label.fontSize" class="dr-config-panel__control" :min="10" :max="36" :step="1" controls-position="right" aria-label="标签字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.label.color" show-alpha aria-label="标签颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">字重</span>
                  <DrSelectField v-model="chartConfig.props.label.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">格式</span>
                  <DrSelectField v-model="chartConfig.props.label.format" class="dr-config-panel__control">
                    <el-option v-for="item in labelFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">自定义模板</span>
                  <DrInputField v-model="chartConfig.props.label.customFormat" class="dr-config-panel__control" placeholder="{percent}%" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="轨道" name="track">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景颜色</span>
                  <DrColorField v-model="chartConfig.props.track.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.track.borderRadius" class="dr-config-panel__control" :min="0" :max="30" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="边框" name="border">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.border.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.border.width" class="dr-config-panel__control" :min="0" :max="5" :step="1" controls-position="right" aria-label="边框宽度"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.border.color" show-alpha aria-label="边框颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="标题" name="title">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="显示" label-width="72px" label-position="left">
              <el-switch v-model="chartConfig.props.title.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">标题文字</span>
                  <DrInputField v-model="chartConfig.props.title.text" class="dr-config-panel__control" placeholder="请输入标题" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">位置</span>
                  <DrSelectField v-model="chartConfig.props.title.position" class="dr-config-panel__control">
                    <el-option v-for="item in titlePositionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.title.fontSize" class="dr-config-panel__control" :min="10" :max="24" :step="1" controls-position="right" aria-label="标题字号"><template #suffix>px</template></DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.title.color" show-alpha aria-label="标题颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">标题宽度</span>
                  <DrNumberField v-model="chartConfig.props.title.width" class="dr-config-panel__control" :min="30" :max="200" :step="5" controls-position="right" />
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
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">缓动函数</span>
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

.dr-progress-bar-config-panel {
  padding: 0;
}

.dr-progress-bar-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
