<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrIframeConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrIframeConfig
}>()
const chartConfig = computed(() => chart)

const scrollingOptions = [
  { label: '自动', value: 'auto' },
  { label: '始终显示', value: 'yes' },
  { label: '始终隐藏', value: 'no' },
]

const borderStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
]
</script>
<template>
  <div class="dr-iframe-panel">
    <el-form :model="chartConfig" label-width="100px" label-position="left" size="small">

      <!-- 基础配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置" name="basic">
          <el-form-item label="页面地址">
            <el-input
              v-model="chartConfig.props.basic.url"
              placeholder="请输入URL地址（如 https://www.example.com）"
            >
              <template #prefix>
                <el-icon><Link /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="滚动条">
            <el-select v-model="chartConfig.props.basic.scrolling">
              <el-option
                v-for="item in scrollingOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item label="显示边框">
            <el-switch v-model="chartConfig.props.basic.frameBorder" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 自动刷新 -->
      <el-collapse>
        <el-collapse-item title="自动刷新" name="autoRefresh">
          <el-form-item label="启用刷新">
            <el-switch v-model="chartConfig.props.autoRefresh.enabled" />
          </el-form-item>

          <el-form-item v-if="chartConfig.props.autoRefresh.enabled" label="刷新间隔(秒)">
            <el-input-number
              v-model="chartConfig.props.autoRefresh.interval"
              :min="5"
              :max="3600"
              :step="5"
              controls-position="right"
            />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 样式配置 -->
      <el-collapse>
        <el-collapse-item title="样式配置" name="style">
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.style.borderRadius"
              :min="0"
              :max="200"
              :step="1"
              controls-position="right"
            />
          </el-form-item>

          <el-form-item label="背景颜色">
            <el-color-picker
              v-model="chartConfig.props.style.backgroundColor"
              show-alpha
            />
          </el-form-item>

          <el-form-item label="显示边框">
            <el-switch v-model="chartConfig.props.style.border.show" />
          </el-form-item>

          <template v-if="chartConfig.props.style.border.show">
            <el-form-item label="边框颜色">
              <el-color-picker v-model="chartConfig.props.style.border.color" />
            </el-form-item>

            <el-form-item label="边框宽度">
              <el-input-number
                v-model="chartConfig.props.style.border.width"
                :min="1"
                :max="20"
                :step="1"
                controls-position="right"
              />
            </el-form-item>

            <el-form-item label="边框样式">
              <el-select v-model="chartConfig.props.style.border.style">
                <el-option
                  v-for="item in borderStyleOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 安全沙箱 -->
      <el-collapse>
        <el-collapse-item title="安全沙箱" name="sandbox">
          <el-form-item label="允许脚本">
            <el-switch v-model="chartConfig.props.sandbox.allowScripts" />
          </el-form-item>

          <el-form-item label="允许同源">
            <el-switch v-model="chartConfig.props.sandbox.allowSameOrigin" />
          </el-form-item>

          <el-form-item label="允许表单">
            <el-switch v-model="chartConfig.props.sandbox.allowForms" />
          </el-form-item>

          <el-form-item label="允许弹窗">
            <el-switch v-model="chartConfig.props.sandbox.allowPopups" />
          </el-form-item>

          <el-form-item label="允许模态">
            <el-switch v-model="chartConfig.props.sandbox.allowModals" />
          </el-form-item>

          <el-form-item label="允许全屏">
            <el-switch v-model="chartConfig.props.sandbox.allowFullscreen" />
          </el-form-item>

          <el-form-item label="允许摄像头">
            <el-switch v-model="chartConfig.props.sandbox.allowCamera" />
          </el-form-item>

          <el-form-item label="允许麦克风">
            <el-switch v-model="chartConfig.props.sandbox.allowMicrophone" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-iframe-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dr-iframe-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-iframe-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-iframe-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.dr-iframe-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.dr-iframe-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-iframe-panel :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-iframe-panel :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-iframe-panel :deep(.el-input-number) {
  font-feature-settings: "tnum";
}

.dr-iframe-panel :deep(.el-select__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-iframe-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
  border: none;
}
</style>
