<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrInputConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrInputConfig
}>()
const chartConfig = computed(() => chart)

/** 输入类型选项 */
const inputTypeOptions = [
  {label: '文本', value: 'text'},
  {label: '数字', value: 'number'},
  {label: '密码', value: 'password'},
]
</script>
<template>
  <div class="dr-input-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 基础配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置">
          <el-form-item label="输入类型">
            <el-select v-model="chartConfig.props.basic.inputType">
              <el-option
                v-for="item in inputTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="占位提示">
            <el-input v-model="chartConfig.props.basic.placeholder" placeholder="请输入占位文本" />
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="chartConfig.props.basic.defaultValue" placeholder="初始化时的默认值" />
          </el-form-item>
          <el-form-item label="清空按钮">
            <el-switch v-model="chartConfig.props.basic.clearable" />
          </el-form-item>
          <el-form-item label="禁用">
            <el-switch v-model="chartConfig.props.basic.disabled" />
          </el-form-item>
          <el-form-item label="只读">
            <el-switch v-model="chartConfig.props.basic.readonly" />
          </el-form-item>
          <el-form-item label="最大字符数">
            <el-input-number
              v-model="chartConfig.props.basic.maxLength"
              :min="0"
              :max="9999"
              :step="1"
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
              :max="60"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="文本颜色">
            <el-color-picker v-model="chartConfig.props.style.color" show-alpha />
          </el-form-item>
          <el-form-item label="占位符颜色">
            <el-color-picker v-model="chartConfig.props.style.placeholderColor" show-alpha />
          </el-form-item>
          <el-form-item label="背景色">
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
          <el-form-item label="高度">
            <el-input-number
              v-model="chartConfig.props.style.height"
              :min="24"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 聚焦样式 -->
      <el-collapse>
        <el-collapse-item title="聚焦样式">
          <el-form-item label="边框颜色">
            <el-color-picker v-model="chartConfig.props.focus.borderColor" show-alpha />
          </el-form-item>
          <el-form-item label="阴影颜色">
            <el-color-picker v-model="chartConfig.props.focus.shadowColor" show-alpha />
          </el-form-item>
          <el-form-item label="阴影大小">
            <el-input-number
              v-model="chartConfig.props.focus.shadowSize"
              :min="0"
              :max="20"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 全局变量配置 -->
      <el-collapse>
        <el-collapse-item title="全局变量">
          <el-form-item label="变量名">
            <el-input v-model="chartConfig.props.globalVar.globalVarName" placeholder="绑定的全局变量名" />
          </el-form-item>
          <el-form-item label="即时触发">
            <el-switch v-model="chartConfig.props.globalVar.triggerOnInput" />
            <span class="trigger-tip">开启后每次按键都更新变量，关闭则仅回车/失焦时更新</span>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-input-panel {
  padding: 12px;
}

.dr-input-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-input-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-input-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.trigger-tip {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
