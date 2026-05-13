<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { resourceApi, type ResourceEntity, type MaterialConfig, type LightingConfig, type BackgroundConfig, type ModelConfig } from '@/dataroom-packages/resource/api'
import ThreeModelViewer from './ThreeModelViewer.vue'

interface Props {
  visible: boolean
  resource: ResourceEntity | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const resourceBaseUrl = import.meta.env.VITE_RESOURCE_BASE_URL || ''
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

const getResourceUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  return `${resourceBaseUrl}${url}`
}

const uploadHeaders = computed(() => {
  const tokenName = import.meta.env.VITE_TOKEN_NAME || 't_token'
  const tokenKey = import.meta.env.VITE_TOKEN_KEY || 't_token'
  return {
    [tokenName]: localStorage.getItem(tokenKey) || ''
  }
})

const uploadCoverUrl = computed(() => {
  return `${apiBaseUrl}/dataRoom/resource/uploadModelCover?id=${props.resource?.id}`
})

const activeTab = ref('info')

// Default configs
const defaultMaterialConfig: MaterialConfig = {
  color: '#4a90e2',
  roughness: 0.5,
  metalness: 0.3,
  opacity: 1.0,
  transparent: false,
  wireframe: false
}

const defaultLightingConfig: LightingConfig = {
  ambient: { enabled: true, color: '#ffffff', intensity: 0.6 },
  directional: { enabled: true, color: '#ffffff', intensity: 0.8 },
  point: { enabled: false, color: '#ff9900', intensity: 1.0 }
}

const defaultBackgroundConfig: BackgroundConfig = {
  type: 'color',
  value: '#1a1a2e'
}

// Local config state
const localMaterialConfig = ref<MaterialConfig>({ ...defaultMaterialConfig })
const localLightingConfig = ref<LightingConfig>({ ...defaultLightingConfig })
const localBackgroundConfig = ref<BackgroundConfig>({ ...defaultBackgroundConfig })
const localModelFormat = ref<string>('')

// Three.js viewer ref
const viewerRef = ref<InstanceType<typeof ThreeModelViewer>>()
const capturingCover = ref(false)

// Load config from resource
const loadConfig = () => {
  console.log('[ModelPreview] loadConfig called, resource config:', props.resource?.config)
  if (props.resource?.config) {
    try {
      const config = JSON.parse(props.resource.config) as ModelConfig
      console.log('[ModelPreview] Parsed config:', config)
      if (config.format) {
        localModelFormat.value = config.format
      }
      if (config.material) {
        localMaterialConfig.value = { ...defaultMaterialConfig, ...config.material }
      }
      if (config.lighting) {
        localLightingConfig.value = {
          ambient: { ...defaultLightingConfig.ambient, ...config.lighting.ambient },
          directional: { ...defaultLightingConfig.directional, ...config.lighting.directional },
          point: { ...defaultLightingConfig.point, ...config.lighting.point }
        }
      }
      if (config.background) {
        localBackgroundConfig.value = { ...defaultBackgroundConfig, ...config.background }
      }
    } catch (e) {
      console.error('Failed to parse config:', e)
    }
  }
}

// Watch resource change
watch(() => props.resource, (newResource) => {
  if (newResource) {
    console.log('[ModelPreview] Resource changed:', newResource.id, 'config:', newResource.config)
    loadConfig()
  }
}, { immediate: true })

// Computed model URL
const modelUrl = computed(() => {
  if (!props.resource?.url) return ''
  return getResourceUrl(props.resource.url)
})

// Computed cover image URL
const coverImage = computed(() => {
  if (!props.resource?.thumbnail) return ''
  return getResourceUrl(props.resource.thumbnail)
})

// Format file size
const formatFileSize = (sizeInKB?: number) => {
  if (!sizeInKB) return '未知'
  if (sizeInKB < 1024) return `${sizeInKB.toFixed(2)} KB`
  return `${(sizeInKB / 1024).toFixed(2)} MB`
}

// Capture cover
const handleCaptureCover = () => {
  if (!viewerRef.value || !props.resource) return
  capturingCover.value = true

  const base64 = viewerRef.value.captureImage()
  if (!base64) {
    ElMessage.error('截图失败')
    capturingCover.value = false
    return
  }

  // Convert base64 to blob and upload
  fetch(base64)
    .then(res => res.blob())
    .then(blob => {
      const formData = new FormData()
      formData.append('file', blob, `cover_${Date.now()}.png`)
      return resourceApi.uploadModelCover(props.resource!.id!, formData)
    })
    .then(() => {
      ElMessage.success('封面截取成功')
      emit('success')
      // Reload resource to get new thumbnail
    })
    .catch(() => {
      ElMessage.error('封面上传失败')
    })
    .finally(() => {
      capturingCover.value = false
    })
}

// Upload cover
const handleCoverUpload = (response: any) => {
  if (response && response.data && props.resource) {
    const res = response.data as ResourceEntity
    emit('success')
    ElMessage.success('封面上传成功')
  }
}

// Load error handler
const handleLoadError = (error: any) => {
  console.error('[ModelPreview] Load error:', error)
  ElMessage.error('模型加载失败: ' + (error?.message || error))
}

// Save config
const handleSaveConfig = async () => {
  if (!props.resource?.id) return

  const config: ModelConfig = {
    material: localMaterialConfig.value,
    lighting: localLightingConfig.value,
    background: localBackgroundConfig.value
  }

  try {
    await resourceApi.updateModelConfig({
      id: props.resource.id,
      config: JSON.stringify(config)
    })
    ElMessage.success('配置保存成功')
    emit('success')
  } catch (error) {
    ElMessage.error('配置保存失败')
  }
}

// Reset config
const handleResetConfig = () => {
  localMaterialConfig.value = { ...defaultMaterialConfig }
  localLightingConfig.value = { ...defaultLightingConfig }
  localBackgroundConfig.value = { ...defaultBackgroundConfig }
}

// Close dialog
const handleClose = () => {
  emit('update:visible', false)
}

// Download model
const handleDownload = () => {
  if (!props.resource?.url) return
  const link = document.createElement('a')
  link.href = getResourceUrl(props.resource.url)
  link.download = props.resource.name || 'model'
  link.click()
}

// Material color update
const handleMaterialColorChange = (color: string) => {
  localMaterialConfig.value.color = color
  viewerRef.value?.updateMaterial(localMaterialConfig.value)
}

// Lighting handlers
const handleAmbientChange = () => {
  viewerRef.value?.updateLighting(localLightingConfig.value)
}

const handleDidirectionalChange = () => {
  viewerRef.value?.updateLighting(localLightingConfig.value)
}

const handlePointChange = () => {
  viewerRef.value?.updateLighting(localLightingConfig.value)
}

// Background change
const handleBackgroundChange = (color: string) => {
  localBackgroundConfig.value.value = color
  viewerRef.value?.updateBackground(localBackgroundConfig.value)
}
</script>

<template>
  <el-dialog
    :title="`${resource?.name || ''}–详情`"
    :model-value="visible"
    @update:model-value="emit('update:visible', $event)"
    width="900px"
    :close-on-click-modal="true"
    destroy-on-close
    class="model-preview-dialog"
  >
    <div class="model-preview-content">
      <div class="model-preview-left">
        <div class="model-viewer-container">
          <ThreeModelViewer
            ref="viewerRef"
            :model-url="modelUrl"
            :cover-image="coverImage"
            :material-config="localMaterialConfig"
            :lighting-config="localLightingConfig"
            :background-config="localBackgroundConfig"
            @load-error="handleLoadError"
          />
        </div>
        <div class="model-actions">
          <el-button type="primary" :loading="capturingCover" @click="handleCaptureCover">
            截取封面
          </el-button>
          <el-upload
            :action="uploadCoverUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleCoverUpload"
            accept="image/*"
          >
            <template #trigger>
              <el-button>上传封面</el-button>
            </template>
          </el-upload>
          <el-button @click="handleDownload">下载模型</el-button>
        </div>
      </div>
      <div class="model-preview-right">
        <el-tabs v-model="activeTab" class="model-tabs">
          <el-tab-pane label="模型信息" name="info">
            <div class="info-section">
              <div class="info-item">
                <span class="info-label">文件名称：</span>
                <span class="info-value">{{ resource?.name }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件格式：</span>
                <span class="info-value">{{ localModelFormat || '未知' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">文件大小：</span>
                <span class="info-value tnum">{{ formatFileSize(resource?.size) }}</span>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="封面设置" name="cover">
            <div class="cover-section">
              <div class="cover-preview">
                <el-image
                  v-if="resource?.thumbnail"
                  :src="coverImage"
                  fit="contain"
                  class="cover-image"
                />
                <div v-else class="cover-empty">暂无封面</div>
              </div>
              <div class="cover-actions">
                <el-button type="primary" :loading="capturingCover" @click="handleCaptureCover">
                  截取封面
                </el-button>
                <el-upload
                  :action="uploadCoverUrl"
                  :headers="uploadHeaders"
                  :show-file-list="false"
                  :on-success="handleCoverUpload"
                  accept="image/*"
                >
                  <template #trigger>
                    <el-button>上传封面</el-button>
                  </template>
                </el-upload>
              </div>
            </div>
          </el-tab-pane>
          <el-tab-pane label="参数配置" name="config">
            <div class="config-section">
              <!-- Material Config -->
              <div class="config-group">
                <h4>材质设置</h4>
                <div class="config-item">
                  <span class="config-label">颜色</span>
                  <el-color-picker
                    :model-value="localMaterialConfig.color"
                    @change="handleMaterialColorChange"
                  />
                </div>
                <div class="config-item">
                  <span class="config-label">粗糙度</span>
                  <el-slider
                    :model-value="localMaterialConfig.roughness * 100"
                    @update:model-value="(v: number) => { localMaterialConfig.roughness = v / 100; viewerRef?.updateMaterial(localMaterialConfig) }"
                    :min="0"
                    :max="100"
                    :show-tooltip="true"
                  />
                  <span class="config-value">{{ (localMaterialConfig.roughness * 100).toFixed(0) }}%</span>
                </div>
                <div class="config-item">
                  <span class="config-label">金属度</span>
                  <el-slider
                    :model-value="localMaterialConfig.metalness * 100"
                    @update:model-value="(v: number) => { localMaterialConfig.metalness = v / 100; viewerRef?.updateMaterial(localMaterialConfig) }"
                    :min="0"
                    :max="100"
                    :show-tooltip="true"
                  />
                  <span class="config-value">{{ (localMaterialConfig.metalness * 100).toFixed(0) }}%</span>
                </div>
                <div class="config-item">
                  <span class="config-label">透明度</span>
                  <el-slider
                    :model-value="localMaterialConfig.opacity * 100"
                    @update:model-value="(v: number) => { localMaterialConfig.opacity = v / 100; localMaterialConfig.transparent = v < 100; viewerRef?.updateMaterial(localMaterialConfig) }"
                    :min="0"
                    :max="100"
                    :show-tooltip="true"
                  />
                  <span class="config-value">{{ (localMaterialConfig.opacity * 100).toFixed(0) }}%</span>
                </div>
                <div class="config-item">
                  <span class="config-label">线框模式</span>
                  <el-switch
                    :model-value="localMaterialConfig.wireframe"
                    @update:model-value="(v: boolean) => { localMaterialConfig.wireframe = v; viewerRef?.updateMaterial(localMaterialConfig) }"
                  />
                </div>
              </div>

              <!-- Lighting Config -->
              <div class="config-group">
                <h4>光照设置</h4>
                <div class="config-item">
                  <span class="config-label">环境光</span>
                  <el-switch
                    :model-value="localLightingConfig.ambient.enabled"
                    @update:model-value="(v: boolean) => { localLightingConfig.ambient.enabled = v; handleAmbientChange() }"
                  />
                </div>
                <div class="config-item" v-if="localLightingConfig.ambient.enabled">
                  <span class="config-label">环境光强度</span>
                  <el-slider
                    :model-value="localLightingConfig.ambient.intensity * 100"
                    @update:model-value="(v: number) => { localLightingConfig.ambient.intensity = v / 100; handleAmbientChange() }"
                    :min="0"
                    :max="100"
                  />
                  <span class="config-value">{{ (localLightingConfig.ambient.intensity * 100).toFixed(0) }}%</span>
                </div>
                <div class="config-item">
                  <span class="config-label">平行光</span>
                  <el-switch
                    :model-value="localLightingConfig.directional.enabled"
                    @update:model-value="(v: boolean) => { localLightingConfig.directional.enabled = v; handleDidirectionalChange() }"
                  />
                </div>
                <div class="config-item" v-if="localLightingConfig.directional.enabled">
                  <span class="config-label">平行光强度</span>
                  <el-slider
                    :model-value="localLightingConfig.directional.intensity * 100"
                    @update:model-value="(v: number) => { localLightingConfig.directional.intensity = v / 100; handleDidirectionalChange() }"
                    :min="0"
                    :max="100"
                  />
                  <span class="config-value">{{ (localLightingConfig.directional.intensity * 100).toFixed(0) }}%</span>
                </div>
                <div class="config-item">
                  <span class="config-label">点光源</span>
                  <el-switch
                    :model-value="localLightingConfig.point.enabled"
                    @update:model-value="(v: boolean) => { localLightingConfig.point.enabled = v; handlePointChange() }"
                  />
                </div>
                <div class="config-item" v-if="localLightingConfig.point.enabled">
                  <span class="config-label">点光源强度</span>
                  <el-slider
                    :model-value="localLightingConfig.point.intensity * 100"
                    @update:model-value="(v: number) => { localLightingConfig.point.intensity = v / 100; handlePointChange() }"
                    :min="0"
                    :max="100"
                  />
                  <span class="config-value">{{ (localLightingConfig.point.intensity * 100).toFixed(0) }}%</span>
                </div>
              </div>

              <!-- Background Config -->
              <div class="config-group">
                <h4>背景设置</h4>
                <div class="config-item">
                  <span class="config-label">背景颜色</span>
                  <el-color-picker
                    :model-value="localBackgroundConfig.value"
                    @change="handleBackgroundChange"
                  />
                </div>
              </div>

              <!-- Actions -->
              <div class="config-actions">
                <el-button @click="handleResetConfig">重置</el-button>
                <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.model-preview-content {
  display: flex;
  gap: 20px;
  height: 500px;

  .model-preview-left {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .model-viewer-container {
      flex: 1;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
    }

    .model-actions {
      display: flex;
      gap: 8px;
    }
  }

  .model-preview-right {
    width: 320px;
    flex-shrink: 0;

    .model-tabs {
      height: 100%;
      display: flex;
      flex-direction: column;

      :deep(.el-tabs__header) {
        margin-bottom: 12px;
      }

      :deep(.el-tabs__content) {
        flex: 1;
        overflow-y: auto;
      }
    }
  }
}

.info-section {
  padding: 8px 0;

  .info-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;

    .info-label {
      color: #86909c;
      width: 80px;
      flex-shrink: 0;
    }

    .info-value {
      color: #1d2129;
    }
  }
}

.cover-section {
  .cover-preview {
    width: 100%;
    height: 160px;
    background: #f7f8fa;
    border-radius: 8px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);

    .cover-image {
      width: 100%;
      height: 100%;
    }

    .cover-empty {
      color: #86909c;
      font-size: 14px;
    }
  }

  .cover-actions {
    display: flex;
    gap: 8px;
  }
}

.config-section {
  .config-group {
    margin-bottom: 20px;

    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #1d2129;
    }
  }

  .config-item {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    gap: 12px;

    .config-label {
      width: 90px;
      flex-shrink: 0;
      font-size: 13px;
      color: #4e5969;
    }

    .config-value {
      width: 45px;
      text-align: right;
      font-size: 12px;
      color: #86909c;
      flex-shrink: 0;
    }

    :deep(.el-slider) {
      flex: 1;
    }
  }

  .config-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
  }
}

.tnum {
  font-feature-settings: "tnum";
}

// Element Plus overrides
:deep(.el-tabs__item) {
  font-size: 14px;
}

:deep(.el-button) {
  border-radius: 6px;
  font-weight: 500;
}

:deep(.el-button--primary) {
  background: #3478f6;
  border-color: #3478f6;

  &:hover {
    background: #2563eb;
    border-color: #2563eb;
  }
}
</style>
