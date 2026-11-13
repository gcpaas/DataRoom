<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  // 组件类型需与当前组件目录名保持一致
  name: 'DrModel3DControlPanel',
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
    <el-form class="dr-config-panel__form" :model="chartConfig" label-width="72px" label-position="left">
      <ConfigCollapse class="dr-config-panel__section">
        <ConfigCollapseItem title="基础配置" name="basic">
          <el-form-item label="模型地址">
            <DrInputField v-model="chartConfig.props.modelUrl" placeholder="请输入模型地址或选择素材" />
          </el-form-item>
          <el-form-item label="模型格式">
            <DrSelectField v-model="chartConfig.props.modelFormat" placeholder="自动识别" clearable>
              <el-option label="自动识别" value="" />
              <el-option label="GLB" value="glb" />
              <el-option label="GLTF" value="gltf" />
              <el-option label="OBJ" value="obj" />
              <el-option label="STL" value="stl" />
            </DrSelectField>
          </el-form-item>
          <el-form-item label="封面图片">
            <DrInputField v-model="chartConfig.props.coverImage" placeholder="请输入封面图片地址" />
          </el-form-item>
          <el-form-item label="自动旋转">
            <el-switch v-model="chartConfig.props.autoRotate" />
          </el-form-item>
          <el-form-item label="允许交互">
            <el-switch v-model="chartConfig.props.interactionEnabled" />
          </el-form-item>

          <div v-if="chartConfig.props.coverImage" class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
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
        </ConfigCollapseItem>

        <ConfigCollapseItem title="模型变换" name="transform">
          <el-form-item label="缩放倍率">
            <DrNumberField v-model="chartConfig.props.modelScale" :min="MODEL_SCALE_MIN" :max="MODEL_SCALE_MAX" :step="0.1" :value-on-clear="1" controls-position="right" />
          </el-form-item>
          <el-form-item v-for="axis in positionAxes" :key="axis" :label="`${axis.toUpperCase()} 偏移`">
            <DrNumberField v-model="chartConfig.props.modelPosition[axis]" :step="0.1" :value-on-clear="0" controls-position="right" />
          </el-form-item>
          <el-text class="config-panel-text" size="small" type="info">偏移使用场景单位，非像素；超出视野时可重置。</el-text>
          <el-form-item>
            <el-button class="config-panel-text" @click="resetTransform">重置变换</el-button>
          </el-form-item>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="材质配置" name="material">
          <el-form-item label="线框模式">
            <el-switch v-model="chartConfig.props.material.wireframe" />
          </el-form-item>
          <el-form-item label="透明材质">
            <el-switch v-model="chartConfig.props.material.transparent" />
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__group-title">
              <span>材质参数</span>
            </div>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">颜色</span>
                  <DrColorField v-model="chartConfig.props.material.color" show-alpha />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">粗糙度</span>
                  <DrNumberField v-model="chartConfig.props.material.roughness" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">金属度</span>
                  <DrNumberField v-model="chartConfig.props.material.metalness" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
              <el-form-item class="dr-config-panel__sub-form-item" label-width="0">
                <div class="dr-config-panel__sub-row">
                  <span class="dr-config-panel__sub-label dr-config-panel__field-label">透明度</span>
                  <DrNumberField v-model="chartConfig.props.material.opacity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" />
                </div>
              </el-form-item>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="光照配置" name="lighting">
          <div class="dr-config-panel__sub-section">
            <el-form-item label="环境光" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">环境光</span></template>
              <el-switch v-model="chartConfig.props.lighting.ambient.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="光照" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.lighting.ambient.intensity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" label="强" aria-label="环境光强度" />
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.lighting.ambient.color" show-alpha aria-label="环境光颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="平行光" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">平行光</span></template>
              <el-switch v-model="chartConfig.props.lighting.directional.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="光照" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.lighting.directional.intensity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" label="强" aria-label="平行光强度" />
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.lighting.directional.color" show-alpha aria-label="平行光颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>

          <div class="dr-config-panel__sub-section">
            <el-form-item label="点光源" label-width="72px" label-position="left">
              <template #label><span class="dr-config-panel__group-title">点光源</span></template>
              <el-switch v-model="chartConfig.props.lighting.point.enabled" />
            </el-form-item>
            <el-form class="dr-config-panel__sub-form" :model="chartConfig" label-width="72px" label-position="left">
              <DrFieldRow label="光照" paired variant="number-color">
                <template #first>
                  <DrNumberField v-model="chartConfig.props.lighting.point.intensity" class="dr-config-panel__control" :min="0" :max="1" :step="0.1" controls-position="right" label="强" aria-label="点光源强度" />
                </template>
                <template #second>
                  <DrColorField v-model="chartConfig.props.lighting.point.color" show-alpha aria-label="点光源颜色" />
                </template>
              </DrFieldRow>
            </el-form>
          </div>
        </ConfigCollapseItem>

        <ConfigCollapseItem title="背景配置" name="background">
          <el-form-item label="背景颜色">
            <DrColorField v-model="chartConfig.props.background.value" show-alpha />
          </el-form-item>
        </ConfigCollapseItem>
      </ConfigCollapse>
    </el-form>
  </div>
</template>

<style scoped lang="scss">

.dr-model-3d-config-panel {
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
