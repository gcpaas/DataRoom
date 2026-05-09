<script lang="ts">
import {defineComponent} from 'vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts"

export default defineComponent({
  name: DrConst.THIS_PLUGIN_TYPE + 'ControlPanel',
})
</script>
<script setup lang="ts">
import type {DrFullScreenConfig} from '../install.ts'
import {computed} from 'vue'

const {chart} = defineProps<{
  chart: DrFullScreenConfig
}>()
const chartConfig = computed(() => chart)

/** 鼠标样式选项 */
const cursorOptions = [
  {label: '手型', value: 'pointer'},
  {label: '默认', value: 'default'},
  {label: '手形', value: 'hand'},
]
</script>
<template>
  <div class="dr-fullscreen-panel">
    <el-form :model="chartConfig" label-width="100px" size="small" label-position="left">

      <!-- 图标配置 -->
      <el-collapse>
        <el-collapse-item title="图标配置">
          <el-form-item label="进入全屏图标">
            <el-input v-model="chartConfig.props.icon.enterIcon" placeholder="图标名称" />
          </el-form-item>
          <el-form-item label="退出全屏图标">
            <el-input v-model="chartConfig.props.icon.exitIcon" placeholder="图标名称" />
          </el-form-item>
          <el-form-item label="图标大小">
            <el-input-number
              v-model="chartConfig.props.icon.iconSize"
              :min="12"
              :max="64"
              :step="2"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="图标颜色">
            <el-color-picker v-model="chartConfig.props.icon.iconColor" show-alpha />
          </el-form-item>
          <el-form-item label="悬停颜色">
            <el-color-picker v-model="chartConfig.props.icon.hoverColor" show-alpha />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 提示文字配置 -->
      <el-collapse>
        <el-collapse-item title="提示文字">
          <el-form-item label="显示提示">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <el-form-item label="进入全屏提示">
            <el-input v-model="chartConfig.props.tooltip.enterText" placeholder="进入全屏" />
          </el-form-item>
          <el-form-item label="退出全屏提示">
            <el-input v-model="chartConfig.props.tooltip.exitText" placeholder="退出全屏" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 样式配置 -->
      <el-collapse>
        <el-collapse-item title="样式配置">
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.style.backgroundColor" show-alpha />
          </el-form-item>
          <el-form-item label="圆角">
            <el-input-number
              v-model="chartConfig.props.style.borderRadius"
              :min="0"
              :max="100"
              :step="5"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="内边距">
            <el-input-number
              v-model="chartConfig.props.style.padding"
              :min="0"
              :max="32"
              :step="2"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item label="鼠标样式">
            <el-select v-model="chartConfig.props.style.cursor">
              <el-option
                v-for="item in cursorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="常驻显示">
            <el-switch v-model="chartConfig.props.style.alwaysShow" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 边框配置 -->
      <el-collapse>
        <el-collapse-item>
          <template #title>
            <div class="collapse-title-switch">
              <span class="collapse-title-text">边框</span>
              <el-switch v-model="chartConfig.props.style.border.show" @click.stop />
            </div>
          </template>
          <template v-if="chartConfig.props.style.border.show">
            <el-form-item label="边框颜色">
              <el-color-picker v-model="chartConfig.props.style.border.color" show-alpha />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                v-model="chartConfig.props.style.border.width"
                :min="1"
                :max="10"
                :step="1"
                controls-position="right"
              />
            </el-form-item>
          </template>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-fullscreen-panel {
  padding: 12px;
}

.dr-fullscreen-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 12px;
}

.dr-fullscreen-panel :deep(.el-collapse-item__header) {
  font-weight: bold;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-fullscreen-panel :deep(.el-collapse-item__wrap) {
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
</style>
