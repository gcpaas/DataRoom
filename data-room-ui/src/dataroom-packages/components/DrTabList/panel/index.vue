<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrTabListConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrTabListConfig
}>()
const chartConfig = computed(() => chart)

/** 添加静态标签 */
const addStaticTab = () => {
  const tabs = chartConfig.value.props.options.staticTabs
  const index = tabs.length + 1
  tabs.push({label: `标签${index}`, value: `tab${index}`})
}

/** 删除静态标签 */
const removeStaticTab = (index: number) => {
  chartConfig.value.props.options.staticTabs.splice(index, 1)
}
</script>
<template>
  <div class="dr-tab-list-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 基础配置 -->
      <el-collapse>
        <el-collapse-item title="基础配置">
          <el-form-item label="默认选中">
            <el-input-number
              v-model="chartConfig.props.basic.defaultIndex"
              :min="0"
              :max="chartConfig.props.options.staticTabs.length - 1"
              :step="1"
              controls-position="right"
            />
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
              <el-option label="水平" value="horizontal" />
              <el-option label="垂直" value="vertical" />
            </el-select>
          </el-form-item>
          <el-form-item label="对齐方式">
            <el-select v-model="chartConfig.props.layout.align">
              <el-option label="起始" value="start" />
              <el-option label="居中" value="center" />
              <el-option label="末尾" value="end" />
              <el-option label="拉伸" value="stretch" />
            </el-select>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 标签样式 -->
      <el-collapse>
        <el-collapse-item title="标签样式">
          <el-form-item label="字号">
            <el-input-number
              v-model="chartConfig.props.tabStyle.fontSize"
              :min="12"
              :max="40"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="文本颜色">
            <el-color-picker v-model="chartConfig.props.tabStyle.color" show-alpha />
          </el-form-item>
          <el-form-item label="选中颜色">
            <el-color-picker v-model="chartConfig.props.tabStyle.activeColor" show-alpha />
          </el-form-item>
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.tabStyle.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="选中背景">
            <el-color-picker v-model="chartConfig.props.tabStyle.activeBgColor" show-alpha />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.tabStyle.borderRadius"
              :min="0"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="间距">
            <el-input-number
              v-model="chartConfig.props.tabStyle.gap"
              :min="0"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="高度">
            <el-input-number
              v-model="chartConfig.props.tabStyle.height"
              :min="0"
              :max="100"
              :step="1"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="底部边框">
            <el-switch v-model="chartConfig.props.tabStyle.borderBottom.show" />
          </el-form-item>
          <template v-if="chartConfig.props.tabStyle.borderBottom.show">
            <el-form-item label="边框颜色">
              <el-color-picker v-model="chartConfig.props.tabStyle.borderBottom.color" show-alpha />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                v-model="chartConfig.props.tabStyle.borderBottom.width"
                :min="1"
                :max="10"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 指示器配置 -->
      <el-collapse>
        <el-collapse-item title="指示器配置">
          <el-form-item label="显示指示器">
            <el-switch v-model="chartConfig.props.indicator.show" />
          </el-form-item>
          <template v-if="chartConfig.props.indicator.show">
            <el-form-item label="颜色">
              <el-color-picker v-model="chartConfig.props.indicator.color" show-alpha />
            </el-form-item>
            <el-form-item label="粗细">
              <el-input-number
                v-model="chartConfig.props.indicator.height"
                :min="1"
                :max="10"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
            <el-form-item label="圆角">
              <el-input-number
                v-model="chartConfig.props.indicator.borderRadius"
                :min="0"
                :max="10"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

      <!-- 标签配置 -->
      <el-collapse>
        <el-collapse-item title="标签配置">
          <div class="static-tabs-list">
            <div
              v-for="(tab, index) in chartConfig.props.options.staticTabs"
              :key="index"
              class="static-tab-item"
            >
              <el-input v-model="tab.label" placeholder="标签名" class="tab-input" />
              <el-input v-model="tab.value" placeholder="标签值" class="tab-input" />
              <el-button
                type="danger"
                :icon="'Delete'"
                circle
                size="small"
                @click="removeStaticTab(index)"
              />
            </div>
          </div>
          <el-button type="primary" size="small" @click="addStaticTab" style="margin-top: 8px; width: 100%">
            添加标签
          </el-button>
        </el-collapse-item>
      </el-collapse>

      <!-- 全局变量配置 -->
      <el-collapse>
        <el-collapse-item title="全局变量">
          <el-form-item label="变量名">
            <el-input v-model="chartConfig.props.globalVar.globalVarName" placeholder="输入全局变量名称" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-tab-list-panel {
  padding: 12px;
}

.dr-tab-list-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-tab-list-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-tab-list-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.static-tabs-list {
  width: 100%;
}

.static-tab-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.tab-input {
  flex: 1;
}
</style>
