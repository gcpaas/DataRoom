<script lang="ts">
import { defineComponent } from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type { DrTextConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrTextConfig
}>()
const chartConfig = computed(() => chart)

/** 字体粗细预设选项 */
const fontWeightOptions = [
  { label: '极细 (100)', value: '100' },
  { label: '细 (200)', value: '200' },
  { label: '较细 (300)', value: '300' },
  { label: '正常 (400)', value: 'normal' },
  { label: '中等 (500)', value: '500' },
  { label: '半粗 (600)', value: '600' },
  { label: '粗体 (700)', value: 'bold' },
  { label: '较粗 (800)', value: '800' },
  { label: '极粗 (900)', value: '900' },
]

/** 字体族预设选项 */
const fontFamilyOptions = [
  { label: '微软雅黑', value: 'Microsoft YaHei' },
  { label: '宋体', value: 'SimSun' },
  { label: '黑体', value: 'SimHei' },
  { label: '楷体', value: 'KaiTi' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Courier New', value: 'Courier New' },
]

/** 边框样式选项 */
const borderStyleOptions = [
  { label: '实线', value: 'solid' },
  { label: '虚线', value: 'dashed' },
  { label: '点线', value: 'dotted' },
  { label: '无', value: 'none' },
]
</script>
<template>
  <div class="dr-text-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 标题名 -->
      <el-form-item label="标题名">
        <el-input v-model="chartConfig.props.text" />
      </el-form-item>

      <!-- 文本样式（可折叠） -->
      <el-collapse>
        <el-collapse-item title="文本样式">
          <el-form-item label="字号">
            <el-input-number
              v-model="chartConfig.props.textStyle.fontSize"
              :min="12"
              :max="200"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="字重">
            <el-select v-model="chartConfig.props.textStyle.fontWeight" filterable allow-create>
              <el-option
                v-for="item in fontWeightOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="字体">
            <el-select v-model="chartConfig.props.textStyle.fontFamily" filterable allow-create>
              <el-option
                v-for="item in fontFamilyOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="字色">
            <el-color-picker v-model="chartConfig.props.textStyle.color" show-alpha />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 对齐方式 -->
      <el-form-item label="对齐方式">
        <el-select v-model="chartConfig.props.align">
          <el-option label="左对齐" value="left" />
          <el-option label="居中" value="center" />
          <el-option label="右对齐" value="right" />
        </el-select>
      </el-form-item>

      <!-- 文字排列方式（垂直对齐） -->
      <el-form-item label="垂直对齐">
        <el-select v-model="chartConfig.props.verticalAlign">
          <el-option label="顶部对齐" value="top" />
          <el-option label="居中" value="center" />
          <el-option label="底部对齐" value="bottom" />
        </el-select>
      </el-form-item>

      <!-- 文字间隔 -->
      <el-form-item label="文字间隔">
        <el-input-number
          v-model="chartConfig.props.letterSpacing"
          :min="0"
          :max="100"
          :step="1"
          controls-position="right"
        >
          <template #suffix>px</template>
        </el-input-number>
      </el-form-item>

      <!-- 背景样式 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">背景样式</span>
              <el-switch v-model="chartConfig.props.background.enabled" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.background.enabled">
            <el-form-item label="背景色">
              <el-color-picker v-model="chartConfig.props.background.color" show-alpha />
            </el-form-item>
            <el-form-item label="圆角">
              <el-input-number
                v-model="chartConfig.props.background.borderRadius"
                :min="0"
                :max="100"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="背景边框">
              <div class="border-config">
                <div class="border-row">
                  <el-input-number
                    v-model="chartConfig.props.background.border.width"
                    :min="0"
                    :max="20"
                    :step="1"
                    controls-position="right"
                  />
                  <span class="unit">px</span>
                </div>
                <div class="border-label">粗细</div>
                <div class="border-row">
                  <el-select v-model="chartConfig.props.background.border.style">
                    <el-option
                      v-for="item in borderStyleOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
                <div class="border-label">样式</div>
                <div class="border-row">
                  <el-color-picker v-model="chartConfig.props.background.border.color" show-alpha />
                </div>
                <div class="border-label">颜色</div>
              </div>
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 省略号 -->
      <el-form-item label="省略号">
        <el-switch v-model="chartConfig.props.ellipsis" />
      </el-form-item>

      <!-- 超链接配置 -->
      <el-collapse>
        <el-collapse-item title="超链接配置">
          <el-form-item label="超链接">
            <el-input v-model="chartConfig.props.hyperlink.url" placeholder="请输入链接地址" />
          </el-form-item>
          <el-form-item label="是否新开窗口">
            <el-switch v-model="chartConfig.props.hyperlink.openNewWindow" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-text-panel {
  padding: 12px;
}

.dr-text-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-text-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-text-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.collapse-title-text {
  font-weight: bold;
}

.collapse-title-switch {
  display: flex;
  align-items: center;
  width: 100%;
}

.collapse-title-switch :deep(.el-switch) {
  margin-left: auto;
  margin-right: 32px;
}

.border-config {
  width: 100%;
}

.border-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.border-row .unit {
  color: #999;
  font-size: 12px;
}

.border-label {
  color: #999;
  font-size: 12px;
  margin-bottom: 8px;
}
</style>
