<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrInputControlPanel',
})
</script>
<script setup lang="ts">
import type { DrInputConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrInputConfig
}>()
const chartConfig = computed(() => chart)

const inputTypeOptions = [
  { label: '文本', value: 'text' },
  { label: '数字', value: 'number' },
  { label: '密码', value: 'password' },
]
</script>
<template>
  <div class="dr-config-panel dr-input-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>输入内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">类型</span>
                  <el-select v-model="chartConfig.props.basic.inputType" class="dr-config-panel__control">
                    <el-option v-for="item in inputTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">占位</span>
                  <el-input v-model="chartConfig.props.basic.placeholder" class="dr-config-panel__control" placeholder="请输入占位文本" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">默认值</span>
                  <el-input v-model="chartConfig.props.basic.defaultValue" class="dr-config-panel__control" placeholder="初始化时的默认值" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">长度</span>
                  <el-input-number v-model="chartConfig.props.basic.maxLength" class="dr-config-panel__control" :min="0" :max="9999" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>输入状态</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
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
                  <span class="dr-config-panel__sub-label">只读</span>
                  <el-switch v-model="chartConfig.props.basic.readonly" />
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
                  <el-input-number v-model="chartConfig.props.style.fontSize" class="dr-config-panel__control" :min="12" :max="60" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">文本颜色</span>
                  <el-color-picker v-model="chartConfig.props.style.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">占位符色</span>
                  <el-color-picker v-model="chartConfig.props.style.placeholderColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>输入框</span>
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
                  <el-input-number v-model="chartConfig.props.style.height" class="dr-config-panel__control" :min="24" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="聚焦样式" name="focus">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>焦点反馈</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">边框色</span>
                  <el-color-picker v-model="chartConfig.props.focus.borderColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影色</span>
                  <el-color-picker v-model="chartConfig.props.focus.shadowColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">阴影</span>
                  <el-input-number v-model="chartConfig.props.focus.shadowSize" class="dr-config-panel__control" :min="0" :max="20" :step="1" controls-position="right" />
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
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">即时</span>
                  <div class="dr-config-panel__stack">
                    <el-switch v-model="chartConfig.props.globalVar.triggerOnInput" />
                    <span class="dr-input-config-panel__hint">开启后每次按键都更新变量，关闭则仅回车/失焦时更新</span>
                  </div>
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

.dr-input-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-input-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-input-config-panel__hint {
  display: block;
  margin-top: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
