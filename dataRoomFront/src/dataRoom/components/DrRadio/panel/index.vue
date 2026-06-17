<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrRadioControlPanel',
})
</script>
<script setup lang="ts">
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>默认状态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认值</span>
                  <el-input v-model="chartConfig.props.basic.defaultValue" class="dr-config-panel__control" placeholder="对应选项的 value" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">禁用</span>
                  <el-switch v-model="chartConfig.props.basic.disabled" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="布局配置" name="layout">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>排列</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">方向</span>
                  <el-select v-model="chartConfig.props.layout.direction" class="dr-config-panel__control">
                    <el-option v-for="item in directionOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">间距</span>
                  <el-input-number v-model="chartConfig.props.layout.gap" class="dr-config-panel__control" :min="0" :max="100" :step="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="样式配置" name="style">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.style.fontSize" class="dr-config-panel__control" :min="12" :max="40" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中色</span>
                  <el-color-picker v-model="chartConfig.props.style.activeColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">未选中色</span>
                  <el-color-picker v-model="chartConfig.props.style.inactiveColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选项块</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中背景</span>
                  <el-color-picker v-model="chartConfig.props.style.activeBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认背景</span>
                  <el-color-picker v-model="chartConfig.props.style.inactiveBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>内边距</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item v-for="(label, index) in ['上边距', '右边距', '下边距', '左边距']" :key="label" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">{{ label }}</span>
                  <el-input-number v-model="chartConfig.props.style.padding[index]" class="dr-config-panel__control" :min="0" :max="50" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="选项配置" name="options">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选项列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">选项列表</span>
                  <div class="dr-config-panel__stack">
                    <div v-for="(option, index) in chartConfig.props.options.staticOptions" :key="index" class="dr-config-panel__inline">
                      <el-input v-model="option.label" placeholder="显示文本" />
                      <el-input v-model="option.value" placeholder="值" />
                      <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeOption(index)" />
                    </div>
                    <el-button class="dr-radio-config-panel__add-button" type="primary" size="small" @click="addOption">添加选项</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="全局变量" name="globalVar">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>变量绑定</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">变量名</span>
                  <el-input v-model="chartConfig.props.globalVar.globalVarName" class="dr-config-panel__control" placeholder="输入全局变量名称" />
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

.dr-radio-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

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
