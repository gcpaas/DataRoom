<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'RemoteComponentControlPanel',
})
</script>
<script setup lang="ts">
import type { RemoteComponentConfig } from '../install.ts'
import { computed } from 'vue'

const { chart } = defineProps<{
  chart: RemoteComponentConfig
}>()
const chartConfig = computed(() => chart)
</script>

<template>
  <div class="dr-config-panel remote-component-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" size="small" label-position="left">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="文本配置" name="text">
          <el-form-item label="文本">
            <el-input v-model="chartConfig.props.text" placeholder="请输入文本" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>文字样式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">字号</span>
                  <el-input-number v-model="chartConfig.props.fontSize" class="dr-config-panel__control" :min="10" :max="80" controls-position="right" />
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

.remote-component-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.remote-component-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}
</style>
