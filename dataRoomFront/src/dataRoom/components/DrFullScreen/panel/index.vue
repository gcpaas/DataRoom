<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrFullScreenControlPanel',
})
</script>
<script setup lang="ts">
import DrFieldRow from '@/dataRoom/designer/components/DrFieldRow.vue'
import DrInputField from '@/dataRoom/designer/components/DrInputField.vue'
import DrSelectField from '@/dataRoom/designer/components/DrSelectField.vue'
import DrNumberField from '@/dataRoom/designer/components/DrNumberField.vue'
import DrColorField from '@/dataRoom/designer/components/DrColorField.vue'
import ConfigCollapse from '@/dataRoom/designer/components/ConfigCollapse.vue'
import ConfigCollapseItem from '@/dataRoom/designer/components/ConfigCollapseItem.vue'
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="图标配置" name="icon">
          <el-form-item label="进入图标">
            <DrInputField v-model="chartConfig.props.icon.enterIcon" placeholder="图标名称" />
          </el-form-item>
          <el-form-item label="退出图标">
            <DrInputField v-model="chartConfig.props.icon.exitIcon" placeholder="图标名称" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>图标样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="图标" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.icon.iconSize" class="dr-config-panel__control" :min="12" :max="64" :step="2" controls-position="right" aria-label="图标大小">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.icon.iconColor" show-alpha aria-label="图标颜色" />
                </template>
              </DrFieldRow>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">悬停色</span>
                  <DrColorField v-model="chartConfig.props.icon.hoverColor" show-alpha />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="提示文字" name="tooltip">
          <el-form-item label="显示">
            <el-switch v-model="chartConfig.props.tooltip.show" />
          </el-form-item>
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>文本内容</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">进入</span>
                  <DrInputField v-model="chartConfig.props.tooltip.enterText" class="dr-config-panel__control" placeholder="进入全屏" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">退出</span>
                  <DrInputField v-model="chartConfig.props.tooltip.exitText" class="dr-config-panel__control" placeholder="退出全屏" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="样式配置" name="style">
          <el-form-item label="常驻显示">
            <el-switch v-model="chartConfig.props.style.alwaysShow" />
          </el-form-item>
          <el-form-item label="鼠标样式">
            <DrSelectField v-model="chartConfig.props.style.cursor">
              <el-option v-for="item in cursorOptions" :key="item.value" :label="item.label" :value="item.value" />
            </DrSelectField>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>容器样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">背景色</span>
                  <DrColorField v-model="chartConfig.props.style.backgroundColor" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">圆角</span>
                  <DrNumberField v-model="chartConfig.props.style.borderRadius" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">内边距</span>
                  <DrNumberField v-model="chartConfig.props.style.padding" class="dr-config-panel__control" :min="0" :max="32" :step="2" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="边框" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">边框</span></template>
              <el-switch v-model="chartConfig.props.style.border.show" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="线条" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.style.border.width" class="dr-config-panel__control" :min="1" :max="10" :step="1" controls-position="right" aria-label="边框宽度">
                    <template #suffix>px</template>
                  </DrNumberField>
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.style.border.color" show-alpha aria-label="边框颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-full-screen-config-panel {
  padding: 0;
}

.dr-full-screen-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
