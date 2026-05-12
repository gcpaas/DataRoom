<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DrModel3DControlPanel',
})
</script>
<script setup lang="ts">
import type { DrModel3DConfig } from '../install.ts'
import { computed } from 'vue'
import {getResourceUrl} from "@/dataroom-packages/_common/_utils.ts";

const { chart } = defineProps<{
  chart: DrModel3DConfig
}>()
const chartConfig = computed(() => chart)
</script>
<template>
  <div class="dr-model-3d-panel">
    <el-form :model="chartConfig" label-width="80px" label-position="left" size="small">

      <!-- 模型地址 -->
      <el-form-item label="模型地址">
        <el-input v-model="chartConfig.props.modelUrl" placeholder="请输入模型地址或选择素材" />
      </el-form-item>

      <!-- 封面图片 -->
      <el-form-item label="封面图片">
        <el-input v-model="chartConfig.props.coverImage" placeholder="请输入封面图片地址" />
      </el-form-item>

      <!-- 封面预览 -->
      <el-form-item v-if="chartConfig.props.coverImage" label=" ">
        <div class="cover-preview">
          <el-image :src="getResourceUrl(chartConfig.props.coverImage)" fit="contain">
            <template #error>
              <div class="preview-error">封面加载失败</div>
            </template>
          </el-image>
        </div>
      </el-form-item>

      <!-- 自动旋转 -->
      <el-form-item label="自动旋转">
        <el-switch v-model="chartConfig.props.autoRotate" />
      </el-form-item>

      <!-- 允许交互 -->
      <el-form-item label="允许交互">
        <el-switch v-model="chartConfig.props.interactionEnabled" />
      </el-form-item>

      <!-- 材质配置 -->
      <el-collapse>
        <el-collapse-item title="材质配置">
          <el-form-item label="颜色">
            <el-color-picker v-model="chartConfig.props.material.color" />
          </el-form-item>
          <el-form-item label="粗糙度">
            <el-slider v-model="chartConfig.props.material.roughness" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
          <el-form-item label="金属度">
            <el-slider v-model="chartConfig.props.material.metalness" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
          <el-form-item label="透明度">
            <el-slider v-model="chartConfig.props.material.opacity" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
          <el-form-item label="线框模式">
            <el-switch v-model="chartConfig.props.material.wireframe" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 光照配置 -->
      <el-collapse>
        <el-collapse-item title="光照配置">
          <el-form-item label="环境光">
            <el-switch v-model="chartConfig.props.lighting.ambient.enabled" />
          </el-form-item>
          <el-form-item v-if="chartConfig.props.lighting.ambient.enabled" label="环境光强度">
            <el-slider v-model="chartConfig.props.lighting.ambient.intensity" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
          <el-form-item label="平行光">
            <el-switch v-model="chartConfig.props.lighting.directional.enabled" />
          </el-form-item>
          <el-form-item v-if="chartConfig.props.lighting.directional.enabled" label="平行光强度">
            <el-slider v-model="chartConfig.props.lighting.directional.intensity" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
          <el-form-item label="点光源">
            <el-switch v-model="chartConfig.props.lighting.point.enabled" />
          </el-form-item>
          <el-form-item v-if="chartConfig.props.lighting.point.enabled" label="点光源强度">
            <el-slider v-model="chartConfig.props.lighting.point.intensity" :min="0" :max="1" :step="0.1" :show-tooltip="true" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

      <!-- 背景配置 -->
      <el-collapse>
        <el-collapse-item title="背景配置">
          <el-form-item label="背景颜色">
            <el-color-picker v-model="chartConfig.props.background.value" />
          </el-form-item>
        </el-collapse-item>
      </el-collapse>

    </el-form>
  </div>
</template>

<style scoped>
.dr-model-3d-panel {
  padding: 12px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.dr-model-3d-panel :deep(.el-collapse) {
  border: none;
  margin-bottom: 8px;
}

.dr-model-3d-panel :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 600;
  color: #1d2129;
  border-bottom: none;
  height: 36px;
  line-height: 36px;
}

.dr-model-3d-panel :deep(.el-collapse-item__wrap) {
  border-bottom: none;
}

.dr-model-3d-panel :deep(.el-collapse-item__content) {
  padding-top: 8px;
}

.dr-model-3d-panel :deep(.el-form-item__label) {
  font-size: 12px;
  font-weight: 500;
  color: #4e5969;
}

.dr-model-3d-panel :deep(.el-form-item) {
  margin-bottom: 4px;
}

.dr-model-3d-panel :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #e5e6eb inset;
}

.dr-model-3d-panel :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
}

.dr-model-3d-panel :deep(.el-slider) {
  width: 100%;
}

.dr-model-3d-panel :deep(.el-color-picker__trigger) {
  border-radius: 6px;
  border: none;
}

.cover-preview {
  width: 100%;
  height: 80px;
  border-radius: 8px;
  box-shadow: 0 0 0 1px #e5e6eb;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-preview .el-image {
  width: 100%;
  height: 100%;
}

.preview-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #86909c;
  font-size: 12px;
}
</style>
