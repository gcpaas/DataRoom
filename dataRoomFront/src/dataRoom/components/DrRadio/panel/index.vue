<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrRadioControlPanel',
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
import type { DrRadioConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrRadioConfig
}>()
const chartConfig = computed(() => chart)

const directionOptions = [
  { label: '水平', value: 'horizontal' },
  { label: '垂直', value: 'vertical' },
]

const addOption = () => {
  const index = chartConfig.value.props.options.staticOptions.length + 1
  chartConfig.value.props.options.staticOptions.push({
    label: `选项${index}`,
    value: String(index),
  })
}

const removeOption = (index: number) => {
  if (chartConfig.value.props.options.staticOptions.length > 1) {
    chartConfig.value.props.options.staticOptions.splice(index, 1)
  }
}
</script>
<template>
  <div class="dr-config-panel dr-radio-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">默认值</span>
                  <DrInputField v-model="chartConfig.props.basic.defaultValue" class="dr-config-panel__control" placeholder="对应选项的 value" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">禁用</span>
                  <el-switch v-model="chartConfig.props.basic.disabled" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="布局配置" name="layout">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">方向</span>
                  <DrSelectField v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
                    <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </DrSelectField>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">间距</span>
                  <DrNumberField v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="100" :step="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="样式配置" name="style">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="字体" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.style.fontSize" class="dr-config-panel__control" :min="12" :max="40" :step="1" controls-position="right" aria-label="选项字号">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.style.inactiveColor" show-alpha aria-label="未选中文字颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中色</span>
                  <DrColorField v-model="chartConfig.props.style.activeColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>选项块</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选中背景</span>
                  <DrColorField v-model="chartConfig.props.style.activeBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">默认背景</span>
                  <DrColorField v-model="chartConfig.props.style.inactiveBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="垂直边距" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.style.padding[0]" class="dr-config-panel__control" :min="0" :max="50" :step="1" controls-position="right" label="上" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.style.padding[2]" class="dr-config-panel__control" :min="0" :max="50" :step="1" controls-position="right" label="下" /></template>
              </DrFieldRow>
              <DrFieldRow label="水平边距" paired variant="equal">
                <template #first><DrNumberField v-model="chartConfig.props.style.padding[3]" class="dr-config-panel__control" :min="0" :max="50" :step="1" controls-position="right" label="左" /></template>
                <template #second><DrNumberField v-model="chartConfig.props.style.padding[1]" class="dr-config-panel__control" :min="0" :max="50" :step="1" controls-position="right" label="右" /></template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="选项配置" name="options">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">选项列表</span>
                  <div class="dr-config-panel__stack">
                    <div v-for="(option, index) in chartConfig.props.options.staticOptions" :key="index" class="dr-config-panel__inline">
                      <DrInputField v-model="option.label" placeholder="显示文本" />
                      <DrInputField v-model="option.value" placeholder="值" />
                      <el-button class="config-panel-text" type="danger" :icon="'Delete'" circle @click="removeOption(index)" />
                    </div>
                    <el-button class="dr-radio-config-panel__add-button config-panel-text" type="primary" @click="addOption">添加选项</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="全局变量" name="globalVar">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">变量名</span>
                  <DrInputField v-model="chartConfig.props.globalVar.globalVarName" class="dr-config-panel__control" placeholder="输入全局变量名称" />
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

.dr-radio-config-panel {
  padding: 0;
}

.dr-radio-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-radio-config-panel__add-button {
  width: 100%;
  margin-top: 8px;
}
</style>
