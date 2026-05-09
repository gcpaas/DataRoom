<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrRadioConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrRadioConfig
}>()
const chartConfig = computed(() => chart)

/** 添加静态选项 */
const addOption = () => {
  const index = chartConfig.value.props.options.staticOptions.length + 1
  chartConfig.value.props.options.staticOptions.push({
    label: `选项${index}`,
    value: String(index)
  })
}

/** 删除静态选项 */
const removeOption = (index: number) => {
  chartConfig.value.props.options.staticOptions.splice(index, 1)
}

/** 方向选项 */
const directionOptions = [
  {label: '水平', value: 'horizontal'},
  {label: '垂直', value: 'vertical'}
]
</script>

<template>
  <div class="dr-radio-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 基础配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置">
          <el-form-item label="默认选中值">
            <el-input v-model="chartConfig.props.basic.defaultValue" placeholder="对应选项的value" />
          </el-form-item>
          <el-form-item label="禁用">
            <el-switch v-model="chartConfig.props.basic.disabled" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 布局配置 -->
      <el-collapse>
        <el-collapse-item title="布局配置">
          <el-form-item label="排列方向">
            <el-select v-model="chartConfig.props.layout.direction">
              <el-option
                v-for="item in directionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="选项间距">
            <el-input-number
              v-model="chartConfig.props.layout.gap"
              :min="0"
              :max="100"
              :step="2"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 样式配置 -->
      <el-collapse>
        <el-collapse-item title="样式配置">
          <el-form-item label="字号">
            <el-input-number
              v-model="chartConfig.props.style.fontSize"
              :min="12"
              :max="40"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="选中文字色">
            <el-color-picker v-model="chartConfig.props.style.activeColor" show-alpha />
          </el-form-item>
          <el-form-item label="选中背景色">
            <el-color-picker v-model="chartConfig.props.style.activeBgColor" show-alpha />
          </el-form-item>
          <el-form-item label="未选中文字色">
            <el-color-picker v-model="chartConfig.props.style.inactiveColor" show-alpha />
          </el-form-item>
          <el-form-item label="未选中背景色">
            <el-color-picker v-model="chartConfig.props.style.inactiveBgColor" show-alpha />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.style.borderRadius"
              :min="0"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内边距(上)">
            <el-input-number
              v-model="chartConfig.props.style.padding[0]"
              :min="0"
              :max="50"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内边距(右)">
            <el-input-number
              v-model="chartConfig.props.style.padding[1]"
              :min="0"
              :max="50"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内边距(下)">
            <el-input-number
              v-model="chartConfig.props.style.padding[2]"
              :min="0"
              :max="50"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内边距(左)">
            <el-input-number
              v-model="chartConfig.props.style.padding[3]"
              :min="0"
              :max="50"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 选项配置 -->
      <el-collapse>
        <el-collapse-item title="选项配置">
          <div class="option-list">
            <div
              v-for="(option, index) in chartConfig.props.options.staticOptions"
              :key="index"
              class="option-item"
            >
              <el-input
                v-model="option.label"
                placeholder="显示文本"
                class="option-input"
              />
              <el-input
                v-model="option.value"
                placeholder="值"
                class="option-input"
              />
              <el-button
                type="danger"
                :icon="'Delete'"
                circle
                size="small"
                @click="removeOption(index)"
              />
            </div>
          </div>
          <el-button type="primary" size="small" @click="addOption" style="margin-top: 8px;">
            添加选项
          </el-button>
        </el-collapse-item>
      </el-collapse>

      <!-- 全局变量配置 -->
      <el-collapse>
        <el-collapse-item title="全局变量">
          <el-form-item label="变量名">
            <el-input
              v-model="chartConfig.props.globalVar.globalVarName"
              placeholder="输入全局变量名称"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-radio-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dr-radio-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-radio-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-radio-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.dr-radio-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.dr-radio-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-radio-panel :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-radio-panel :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-radio-panel :deep(.el-input-number) {
  font-feature-settings: "tnum";
}

.dr-radio-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-radio-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
  border: none;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.option-input {
  flex: 1;
}
</style>
