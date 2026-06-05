<script lang="ts">
import {defineComponent} from 'vue'

export default defineComponent({
  name: 'DrDateTimeControlPanel',
})
</script>
<script setup lang="ts">
import {computed} from 'vue'
import type {DrDateTimeConfig} from '../install.ts'
import {dateTimeFormatOptions} from '../time-format.ts'

const {chart} = defineProps<{
  chart: DrDateTimeConfig
}>()
const chartConfig = computed(() => chart)

const fontFamilyOptions = [
  {label: '微软雅黑', value: 'Microsoft YaHei'},
  {label: '宋体', value: 'SimSun'},
  {label: '黑体', value: 'SimHei'},
  {label: 'Arial', value: 'Arial'},
  {label: 'Helvetica', value: 'Helvetica'},
  {label: 'Courier New', value: 'Courier New'},
]

const fontWeightOptions = [
  {label: '正常 (400)', value: '400'},
  {label: '中等 (500)', value: '500'},
  {label: '半粗 (600)', value: '600'},
  {label: '粗体 (700)', value: '700'},
]

const horizontalAlignOptions = [
  {label: '左对齐', value: 'left'},
  {label: '居中', value: 'center'},
  {label: '右对齐', value: 'right'},
]

const verticalAlignOptions = [
  {label: '顶部', value: 'top'},
  {label: '居中', value: 'center'},
  {label: '底部', value: 'bottom'},
]
</script>

<template>
  <div class="dr-config-panel dr-date-time-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">格式</span>
                  <el-select v-model="chartConfig.props.format" class="dr-config-panel__control">
                    <el-option v-for="item in dateTimeFormatOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">水平</span>
                  <el-select v-model="chartConfig.props.align" class="dr-config-panel__control">
                    <el-option v-for="item in horizontalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">垂直</span>
                  <el-select v-model="chartConfig.props.verticalAlign" class="dr-config-panel__control">
                    <el-option v-for="item in verticalAlignOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="文字样式" name="textStyle">
          <div class="dr-config-panel__sub-section">
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.textStyle.fontSize" class="dr-config-panel__control" :min="12" :max="200" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字体</span>
                  <el-select v-model="chartConfig.props.textStyle.fontFamily" class="dr-config-panel__control" filterable allow-create>
                    <el-option v-for="item in fontFamilyOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字重</span>
                  <el-select v-model="chartConfig.props.textStyle.fontWeight" class="dr-config-panel__control">
                    <el-option v-for="item in fontWeightOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字距</span>
                  <el-input-number v-model="chartConfig.props.textStyle.letterSpacing" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.textStyle.color" show-alpha />
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
</style>
