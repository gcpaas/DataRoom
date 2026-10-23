<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrModel3DControlPanel',
})
</script>
<script setup lang="ts">
import type { DrModel3DConfig } from '../install.ts'
import { computed } from 'vue'
import { MODEL_SCALE_MIN, MODEL_SCALE_MAX, normalizeModelTransformConfig } from '@/dataRoom/three/modelConfig'
import { getResourceUrl } from '@/dataRoom/utils/index.ts'

const { chart } = defineProps<{
  chart: DrModel3DConfig
}>()
const chartConfig = computed(() => chart)
const positionAxes = ['x', 'y', 'z'] as const
const resetTransform = () => {
  Object.assign(chartConfig.value.props, normalizeModelTransformConfig(null))
}
</script>

<template>
  <div class="dr-config-panel dr-model-3d-config-panel">
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="60px" label-position="left" size="small">
      <el-collapse class="dr-config-panel__section">
        <el-collapse-item title="基础配置" name="basic">
          <el-form-item label="模型地址">
            <el-input v-model="chartConfig.props.modelUrl" placeholder="请输入模型地址或选择素材" />
          </el-form-item>
          <el-form-item label="模型格式">
            <el-select v-model="chartConfig.props.modelFormat" placeholder="自动识别" clearable>
              <el-option label="自动识别" value="" />
              <el-option label="GLB" value="glb" />
              <el-option label="GLTF" value="gltf" />
              <el-option label="OBJ" value="obj" />
              <el-option label="STL" value="stl" />
            </el-select>
          </el-form-item>
          <el-form-item label="封面图片">
            <el-input v-model="chartConfig.props.coverImage" placeholder="请输入封面图片地址" />
          </el-form-item>
          <el-form-item label="自动旋转">
            <el-switch v-model="chartConfig.props.autoRotate" />
          </el-form-item>
          <el-form-item label="允许交互">
            <el-switch v-model="chartConfig.props.interactionEnabled" />
          </el-form-item>

          <div v-if="chartConfig.props.coverImage" class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>封面预览</span>
            </div>
            <div class="dr-model-3d-config-panel__preview">
              <el-image class="dr-model-3d-config-panel__preview-image" :src="getResourceUrl(chartConfig.props.coverImage)" fit="contain">
                <template #error>
                  <div class="dr-model-3d-config-panel__preview-error">封面加载失败</div>
                </template>
              </el-image>
            </div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="模型变换" name="transform">
          <el-form-item label="缩放倍率">
            <el-input-number v-model="chartConfig.props.modelScale" :min="MODEL_SCALE_MIN" :max="MODEL_SCALE_MAX" :step="0.1" :value-on-clear="1" controls-position="right" />
          </el-form-item>
          <el-form-item v-for="axis in positionAxes" :key="axis" :label="`${axis.toUpperCase()} 偏移`">
            <el-input-number v-model="chartConfig.props.modelPosition[axis]" :step="0.1" :value-on-clear="0" controls-position="right" />
          </el-form-item>
          <el-text size="small" type="info">偏移使用场景单位，非像素；超出视野时可重置。</el-text>
          <el-form-item>
            <el-button @click="resetTransform">重置变换</el-button>
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="材质配置" name="material">
          <el-form-item label="线框模式">
            <el-switch v-model="chartConfig.props.material.wireframe" />
          </el-form-item>
          <el-form-item label="透明材质">
            <el-switch v-model="chartConfig.props.material.transparent" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>材质参数</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.material.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">粗糙度</span>
                  <el-input-number v-model="chartConfig.props.material.roughness" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">金属度</span>
                  <el-input-number v-model="chartConfig.props.material.metalness" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">透明度</span>
                  <el-input-number v-model="chartConfig.props.material.opacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="光照配置" name="lighting">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>环境光</span>
              <el-switch v-model="chartConfig.props.lighting.ambient.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.lighting.ambient.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">强度</span>
                  <el-input-number
                    v-model="chartConfig.props.lighting.ambient.intensity"
                    class="dr-config-panel__control"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    controls-position="right"
                  />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>平行光</span>
              <el-switch v-model="chartConfig.props.lighting.directional.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.lighting.directional.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">强度</span>
                  <el-input-number
                    v-model="chartConfig.props.lighting.directional.intensity"
                    class="dr-config-panel__control"
                    :min="0"
                    :max="1"
                    :step="0.1"
                    controls-position="right"
                  />
                </div>
              </el-form-item>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>点光源</span>
              <el-switch v-model="chartConfig.props.lighting.point.enabled" size="small" />
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" size="small" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">颜色</span>
                  <el-color-picker v-model="chartConfig.props.lighting.point.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label">强度</span>
                  <el-input-number v-model="chartConfig.props.lighting.point.intensity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>

        <el-collapse-item title="背景配置" name="background">
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.background.value" show-alpha />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-model-3d-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  padding: 0;
}

.dr-model-3d-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.dr-model-3d-config-panel__preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.dr-model-3d-config-panel__preview-image,
.dr-model-3d-config-panel__preview-error {
  width: 100%;
  height: 100%;
}

.dr-model-3d-config-panel__preview-error {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
}
</style>
