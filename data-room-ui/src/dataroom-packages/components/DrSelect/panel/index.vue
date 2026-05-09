<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrSelectConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrSelectConfig
}>()
const chartConfig = computed(() => chart)

/** 新增静态选项 */
const addStaticOption = () => {
  const index = chartConfig.value.props.options.staticOptions.length + 1
  chartConfig.value.props.options.staticOptions.push({
    label: `选项${index}`,
    value: String(index),
  })
}

/** 删除静态选项 */
const removeStaticOption = (index: number) => {
  chartConfig.value.props.options.staticOptions.splice(index, 1)
}
</script>

<template>
  <div class="dr-select-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 基础配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置">
          <el-form-item label="占位文本">
            <el-input v-model="chartConfig.props.basic.placeholder" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="chartConfig.props.basic.defaultValue" placeholder="多选时用逗号分隔" />
          </el-form-item>
          <el-form-item label="多选模式">
            <el-switch v-model="chartConfig.props.basic.multiple" />
          </el-form-item>
          <el-form-item label="可清空">
            <el-switch v-model="chartConfig.props.basic.clearable" />
          </el-form-item>
          <el-form-item label="禁用">
            <el-switch v-model="chartConfig.props.basic.disabled" />
          </el-form-item>
          <el-form-item label="可搜索">
            <el-switch v-model="chartConfig.props.basic.filterable" />
          </el-form-item>
          <el-form-item label="尺寸">
            <el-select v-model="chartConfig.props.basic.size">
              <el-option label="小" value="small" />
              <el-option label="默认" value="default" />
              <el-option label="大" value="large" />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 输入框样式 -->
      <el-collapse>
        <el-collapse-item title="输入框样式">
          <el-form-item label="文本字号">
            <el-input-number
              v-model="chartConfig.props.style.fontSize"
              :min="12"
              :max="60"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="文本颜色">
            <el-color-picker v-model="chartConfig.props.style.color" show-alpha />
          </el-form-item>
          <el-form-item label="占位文本色">
            <el-color-picker v-model="chartConfig.props.style.placeholderColor" show-alpha />
          </el-form-item>
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框颜色">
            <el-color-picker v-model="chartConfig.props.style.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="边框宽度">
            <el-input-number
              v-model="chartConfig.props.style.borderWidth"
              :min="0"
              :max="10"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="边框圆角">
            <el-input-number
              v-model="chartConfig.props.style.borderRadius"
              :min="0"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="输入框高度">
            <el-input-number
              v-model="chartConfig.props.style.height"
              :min="24"
              :max="100"
              :step="2"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 选项配置 -->
      <el-collapse>
        <el-collapse-item title="静态选项">
          <div class="static-options-list">
            <div
              v-for="(item, index) in chartConfig.props.options.staticOptions"
              :key="index"
              class="static-option-item"
            >
              <el-input
                v-model="item.label"
                placeholder="显示文本"
                class="option-input"
              />
              <el-input
                v-model="item.value"
                placeholder="值"
                class="option-input"
              />
              <el-button
                type="danger"
                :icon="'Delete'"
                circle
                size="small"
                @click="removeStaticOption(index)"
              />
            </div>
          </div>
          <el-button type="primary" size="small" @click="addStaticOption" style="width: 100%; margin-top: 8px;">
            + 添加选项
          </el-button>
          <el-form-item label="选项字号" style="margin-top: 12px;">
            <el-input-number
              v-model="chartConfig.props.options.optionFontSize"
              :min="12"
              :max="40"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="选项文本色">
            <el-color-picker v-model="chartConfig.props.options.optionColor" show-alpha />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 下拉面板样式 -->
      <el-collapse>
        <el-collapse-item title="下拉面板样式">
          <el-form-item label="最大高度">
            <el-input-number
              v-model="chartConfig.props.dropdown.maxHeight"
              :min="100"
              :max="600"
              :step="10"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="面板背景色">
            <el-color-picker v-model="chartConfig.props.dropdown.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="面板边框色">
            <el-color-picker v-model="chartConfig.props.dropdown.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="悬浮背景色">
            <el-color-picker v-model="chartConfig.props.dropdown.hoverBgColor" show-alpha />
          </el-form-item>
          <el-form-item label="选中背景色">
            <el-color-picker v-model="chartConfig.props.dropdown.activeBgColor" show-alpha />
          </el-form-item>
          <el-form-item label="选中文本色">
            <el-color-picker v-model="chartConfig.props.dropdown.activeColor" show-alpha />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 全局变量配置 -->
      <el-collapse>
        <el-collapse-item title="全局变量">
          <el-form-item label="变量名称">
            <el-input
              v-model="chartConfig.props.globalVar.globalVarName"
              placeholder="绑定的全局变量名"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-select-panel {
  padding: 12px;
}

.dr-select-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-select-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-select-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.static-options-list {
  width: 100%;
}

.static-option-item {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.static-option-item .option-input {
  flex: 1;
}
</style>
