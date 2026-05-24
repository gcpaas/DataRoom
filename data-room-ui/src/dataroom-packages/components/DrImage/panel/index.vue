<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrImageControlPanel',
})
</script>
<script setup lang="ts">
import type { DrImageConfig } from '../install.ts'
import { computed } from 'vue'
import { getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'

const { chart } = defineProps<{
  chart: DrImageConfig
}>()
const chartConfig = computed(() => chart)

const repeatModeOptions = [
  { label: '不重复，拉伸满', value: 'no-repeat-stretch' },
  { label: '不重复，等比适应', value: 'no-repeat-contain' },
  { label: '不重复，居中', value: 'no-repeat-center' },
  { label: '平铺', value: 'repeat' },
  { label: '水平平铺', value: 'repeat-x' },
  { label: '垂直平铺', value: 'repeat-y' },
]
</script>
<template>
  <div class="dr-config-panel dr-image-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="图片配置" name="image">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>图片来源</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">类型</span>
                  <el-radio-group v-model="chartConfig.props.imageType">
                    <el-radio-button value="bitmap">位图</el-radio-button>
                    <el-radio-button value="svg">矢量图</el-radio-button>
                  </el-radio-group>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">地址</span>
                  <el-input v-model="chartConfig.props.url" class="dr-config-panel__control" placeholder="请输入图片地址">
                    <template #prefix>
                      <el-icon><Link /></el-icon>
                    </template>
                  </el-input>
                </div>
              </el-form-item>
              <el-form-item v-if="chartConfig.props.url" class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row dr-config-panel__sub-row--start">
                  <span class="dr-config-panel__sub-label">预览</span>
                  <div class="dr-image-config-panel__preview">
                    <el-image :src="getResourceUrl(chartConfig.props.url)" fit="contain" class="dr-image-config-panel__preview-image">
                      <template #error>
                        <div class="dr-image-config-panel__preview-error">图片加载失败</div>
                      </template>
                    </el-image>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>显示方式</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">图片重复</span>
                  <el-select v-model="chartConfig.props.repeatMode" class="dr-config-panel__control">
                    <el-option v-for="item in repeatModeOptions" :key="item.value" :label="item.label" :value="item.value" />
                  </el-select>
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">圆角</span>
                  <el-input-number v-model="chartConfig.props.borderRadius" class="dr-config-panel__control" :min="0" :max="500" :step="1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="超链接" name="hyperlink">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>链接行为</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">地址</span>
                  <el-input v-model="chartConfig.props.hyperlink.url" class="dr-config-panel__control" placeholder="请输入链接地址" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">新窗口</span>
                  <el-switch v-model="chartConfig.props.hyperlink.openNewWindow" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">手势</span>
                  <el-switch v-model="chartConfig.props.hyperlink.cursorPointer" />
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

.dr-image-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-image-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-image-config-panel__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 120px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.dr-image-config-panel__preview-image {
  width: 100%;
  height: 100%;
}

.dr-image-config-panel__preview-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
