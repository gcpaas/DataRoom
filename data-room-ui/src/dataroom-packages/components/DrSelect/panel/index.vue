<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrSelectControlPanel',
})
</script>
<script setup lang="ts">
import type { DrSelectConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrSelectConfig
}>()
const chartConfig = computed(() => chart)

const sizeOptions = [
  { label: '小', value: 'small' },
  { label: '默认', value: 'default' },
  { label: '大', value: 'large' },
]

const addStaticOption = () => {
  const index = chartConfig.value.props.options.staticOptions.length + 1
  chartConfig.value.props.options.staticOptions.push({
    label: `选项${index}`,
    value: String(index),
  })
}

const removeStaticOption = (index: number) => {
  if (chartConfig.value.props.options.staticOptions.length > 1) {
    chartConfig.value.props.options.staticOptions.splice(index, 1)
  }
}
</script>

<template>
  <div class="dr-config-panel dr-select-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选择内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">占位</span>
                  <el-input v-model="chartConfig.props.basic.placeholder" class="dr-config-panel__control" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认值</span>
                  <el-input v-model="chartConfig.props.basic.defaultValue" class="dr-config-panel__control" placeholder="多选时用逗号分隔" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">尺寸</span>
                  <el-select v-model="chartConfig.props.basic.size" class="dr-config-panel__control">
                    <el-option v-for="item in sizeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选择状态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">多选</span>
                  <el-switch v-model="chartConfig.props.basic.multiple" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">可清空</span>
                  <el-switch v-model="chartConfig.props.basic.clearable" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">禁用</span>
                  <el-switch v-model="chartConfig.props.basic.disabled" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">可搜索</span>
                  <el-switch v-model="chartConfig.props.basic.filterable" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="输入框样式" name="style">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.style.fontSize" class="dr-config-panel__control" :min="12" :max="60" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本色</span>
                  <el-color-picker v-model="chartConfig.props.style.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">占位色</span>
                  <el-color-picker v-model="chartConfig.props.style.placeholderColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>边框与背景</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.style.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框宽</span>
                  <el-input-number v-model="chartConfig.props.style.borderWidth" class="dr-config-panel__control" :min="0" :max="10" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">高度</span>
                  <el-input-number v-model="chartConfig.props.style.height" class="dr-config-panel__control" :min="24" :max="100" :step="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="静态选项" name="options">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选项列表</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">选项列表</span>
                  <div class="dr-config-panel__stack">
                    <div v-for="(item, index) in chartConfig.props.options.staticOptions" :key="index" class="dr-config-panel__inline">
                      <el-input v-model="item.label" placeholder="显示文本" />
                      <el-input v-model="item.value" placeholder="值" />
                      <el-button type="danger" :icon="'Delete'" circle size="small" @click="removeStaticOption(index)" />
                    </div>
                    <el-button class="dr-select-config-panel__add-button" type="primary" size="small" @click="addStaticOption">添加选项</el-button>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>选项文字</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.options.optionFontSize" class="dr-config-panel__control" :min="12" :max="40" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本色</span>
                  <el-color-picker v-model="chartConfig.props.options.optionColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="下拉面板" name="dropdown">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>尺寸</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">最大高</span>
                  <el-input-number v-model="chartConfig.props.dropdown.maxHeight" class="dr-config-panel__control" :min="100" :max="600" :step="10" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>颜色</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">背景色</span>
                  <el-color-picker v-model="chartConfig.props.dropdown.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.dropdown.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">悬浮背景</span>
                  <el-color-picker v-model="chartConfig.props.dropdown.hoverBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中背景</span>
                  <el-color-picker v-model="chartConfig.props.dropdown.activeBgColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">选中色</span>
                  <el-color-picker v-model="chartConfig.props.dropdown.activeColor" show-alpha />
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
                  <el-input v-model="chartConfig.props.globalVar.globalVarName" class="dr-config-panel__control" placeholder="绑定的全局变量名" />
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
@use '@/dataroom-packages/assets/styles/chartConfigPanel.scss';

.dr-select-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-select-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-select-config-panel__add-button {
  width: 100%;
  margin-top: var(--space-2);
}
</style>
