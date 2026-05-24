<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrFullScreenControlPanel',
})
</script>
<script setup lang="ts">
import type { DrFullScreenConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: DrFullScreenConfig
}>()
const chartConfig = computed(() => chart)

const cursorOptions = [
  { label: '手型', value: 'pointer' },
  { label: '默认', value: 'default' },
  { label: '手形', value: 'hand' },
]
</script>

<template>
  <div class="dr-config-panel dr-full-screen-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="图标配置" name="icon">
          <el-form-item label="进入图标">
            <el-input v-model="chartConfig.props.icon.enterIcon" placeholder="图标名称" />
          </el-form-item>
          <el-form-item label="退出图标">
            <el-input v-model="chartConfig.props.icon.exitIcon" placeholder="图标名称" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>图标样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">大小</span>
                  <el-input-number v-model="chartConfig.props.icon.iconSize" class="dr-config-panel__control" :min="12" :max="64" :step="2" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.icon.iconColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">悬停色</span>
                  <el-color-picker v-model="chartConfig.props.icon.hoverColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="提示文字" name="tooltip">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文本内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">进入</span>
                  <el-input v-model="chartConfig.props.tooltip.enterText" class="dr-config-panel__control" placeholder="进入全屏" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">退出</span>
                  <el-input v-model="chartConfig.props.tooltip.exitText" class="dr-config-panel__control" placeholder="退出全屏" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="样式配置" name="style">
          <el-form-item label="常驻显示">
            <el-switch v-model="chartConfig.props.style.alwaysShow" />
          </el-form-item>
          <el-form-item label="鼠标样式">
            <el-select v-model="chartConfig.props.style.cursor">
              <el-option v-for="item in cursorOptions" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>容器样式</span>
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
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">内边距</span>
                  <el-input-number v-model="chartConfig.props.style.padding" class="dr-config-panel__control" :min="0" :max="32" :step="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>边框</span>
              <el-switch v-model="chartConfig.props.style.border.show" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.style.border.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">宽度</span>
                  <el-input-number v-model="chartConfig.props.style.border.width" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" />
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

.dr-full-screen-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-full-screen-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
