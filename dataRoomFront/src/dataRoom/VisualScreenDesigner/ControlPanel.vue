<!-- 大屏设计器配置面板 -->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCookie, getCookieName } from '@/dataRoom/_common/_cookie'
import { Delete, Picture, Setting } from '@element-plus/icons-vue'
import type { VisualScreenPageBasicConfig } from '@/dataRoom/PageDesigner/type/VisualScreenPageBasicConfig.ts'
import type { PageTimer } from '@/dataRoom/PageDesigner/type/PageTimer.ts'
import { getResourceUrl } from '@/dataRoom/_common/_utils.ts'
import { v4 as uuidv4 } from 'uuid'
import { clampVisualScreenGuidePosition, isVisualScreenGuideLocked, normalizeVisualScreenRulerConfig, type VisualScreenGuide, type VisualScreenGuideAxis } from './ruler'

const TimerConfigDialog = defineAsyncComponent(() => import('../PageDesigner/TimerConfigDialog.vue'))

const { basicConfig } = defineProps<{
  basicConfig: VisualScreenPageBasicConfig
}>()

const normalizeRulerConfig = () => {
  basicConfig.ruler = normalizeVisualScreenRulerConfig(basicConfig.ruler, basicConfig.size?.width || 0, basicConfig.size?.height || 0)
}

normalizeRulerConfig()

const rulerConfig = computed(() => basicConfig.ruler!)

watch([() => basicConfig.size?.width, () => basicConfig.size?.height], normalizeRulerConfig)

if (!basicConfig.timers) {
  basicConfig.timers = []
}

// ==================== 尺寸预设 ====================

interface ResolutionPreset {
  label: string
  value: string
  width: number
  height: number
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  { label: '1920×1080 (Full HD)', value: '1920x1080', width: 1920, height: 1080 },
  { label: '2560×1440 (2K QHD)', value: '2560x1440', width: 2560, height: 1440 },
  { label: '3840×2160 (4K UHD)', value: '3840x2160', width: 3840, height: 2160 },
  { label: '1280×720 (HD)', value: '1280x720', width: 1280, height: 720 },
  { label: '1366×768', value: '1366x768', width: 1366, height: 768 },
  { label: '自定义', value: 'custom', width: 0, height: 0 },
]

const ZOOM_MODES = [
  { label: '宽度铺满', value: 'fitWidth', desc: '宽度铺满视口，高度按比例缩放' },
  { label: '高度铺满', value: 'fitHeight', desc: '高度铺满视口，宽度按比例缩放' },
  { label: '全屏铺满', value: 'cover', desc: '完全铺满视口，可能变形' },
  { label: '等比缩放', value: 'contain', desc: '保持比例居中显示，可能留黑边' },
  { label: '不缩放', value: 'none', desc: '原始大小居中显示' },
]

/**
 * 根据当前宽高匹配预设
 */
const matchPreset = (width: number, height: number): string => {
  const matched = RESOLUTION_PRESETS.find((p) => p.value !== 'custom' && p.width === width && p.height === height)
  return matched ? matched.value : 'custom'
}

const selectedPreset = ref<string>(matchPreset(basicConfig.size?.width || 1920, basicConfig.size?.height || 1080))
let isPresetChanging = false

watch(selectedPreset, (val) => {
  if (val === 'custom') return
  const preset = RESOLUTION_PRESETS.find((p) => p.value === val)
  if (preset) {
    isPresetChanging = true
    basicConfig.size.width = preset.width
    basicConfig.size.height = preset.height
  }
})

watch([() => basicConfig.size?.width, () => basicConfig.size?.height], ([w, h]) => {
  if (isPresetChanging) {
    isPresetChanging = false
    return
  }
  if (w && h) {
    selectedPreset.value = matchPreset(w, h)
  }
})

// ==================== 定时器 ====================

const timers = computed(() => {
  return basicConfig.timers || []
})

const timerConfigDialogVisible = ref(false)
const currentTimer = ref<PageTimer | null>(null)

const activePanelNames = ref(['size', 'background', 'zoom', 'ruler', 'timer'])
const currentZoomModeDesc = computed(() => {
  return ZOOM_MODES.find((mode) => mode.value === basicConfig.size.zoom)?.desc || ''
})

// ==================== 上传相关 ====================

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL
const uploadUrl = `${apiBaseUrl}/dataRoom/resource/upload`
const cookieName = getCookieName()
const cookieValue = getCookie(cookieName)
const uploadHeaders = reactive({
  [cookieName]: cookieValue,
})

/**
 * 背景图上传成功回调
 */
const handleBgUploadSuccess = (response: { data?: { url?: string } }) => {
  if (response && response.data) {
    basicConfig.background.url = response.data.url || ''
    ElMessage.success('背景图上传成功')
  }
}

/**
 * 上传失败回调
 */
const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

// ==================== 定时器操作 ====================

const addTimer = () => {
  const timerCount = timers.value.length + 1
  const newTimer: PageTimer = {
    id: `timer_${uuidv4()}`,
    name: `定时器${timerCount}`,
    enabled: false,
    interval: 5000,
    actions: [],
  }
  timers.value.push(newTimer)
}

const toggleTimer = (timer: PageTimer, enabled: string | number | boolean) => {
  const normalizedEnabled = Boolean(enabled)
  timer.enabled = normalizedEnabled
  ElMessage.success(normalizedEnabled ? '定时器已启用' : '定时器已禁用')
}

const openTimerConfig = (timer: PageTimer) => {
  currentTimer.value = timer
  timerConfigDialogVisible.value = true
}

const deleteTimer = (id: string) => {
  ElMessageBox.confirm('确定要删除这个定时器吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = timers.value.findIndex((item) => item.id === id)
      timers.value.splice(index, 1)
      ElMessage.success('定时器已删除')
    })
    .catch(() => {
      // 用户取消删除
    })
}

// ==================== 标尺与参考线 ====================

const getGuideList = (axis: VisualScreenGuideAxis) => {
  return axis === 'vertical' ? rulerConfig.value.verticalGuides : rulerConfig.value.horizontalGuides
}

const isGuideLocked = (guide: VisualScreenGuide) => {
  return isVisualScreenGuideLocked(guide, rulerConfig.value.guidesLocked)
}

const updateGuidePosition = (axis: VisualScreenGuideAxis, guide: VisualScreenGuide, value: number | undefined) => {
  if (isGuideLocked(guide)) {
    return
  }
  guide.position = clampVisualScreenGuidePosition(axis, Number(value), basicConfig.size?.width || 0, basicConfig.size?.height || 0)
}

const deleteGuide = (axis: VisualScreenGuideAxis, guide: VisualScreenGuide) => {
  if (isGuideLocked(guide)) {
    return
  }
  const list = getGuideList(axis)
  const index = list.findIndex((item) => item.id === guide.id)
  if (index >= 0) {
    list.splice(index, 1)
  }
}

const clearUnlockedGuides = () => {
  rulerConfig.value.verticalGuides = rulerConfig.value.verticalGuides.filter((guide) => isGuideLocked(guide))
  rulerConfig.value.horizontalGuides = rulerConfig.value.horizontalGuides.filter((guide) => isGuideLocked(guide))
  ElMessage.success('已清空未锁定参考线')
}
</script>

<template>
  <div class="dr-config-panel dr-visual-screen-config-panel">
    <el-form class="dr-config-panel__form" :model="basicConfig" label-width="72px" size="small" label-position="left">
      <el-collapse v-model="activePanelNames" class="dr-config-panel__section">
        <el-collapse-item title="画布尺寸" name="size">
          <el-form-item label="分辨率">
            <el-select v-model="selectedPreset" class="dr-config-panel__control" placeholder="请选择分辨率">
              <el-option v-for="preset in RESOLUTION_PRESETS" :key="preset.value" :label="preset.label" :value="preset.value" />
            </el-select>
          </el-form-item>

          <el-form-item label="宽度">
            <el-input-number v-model="basicConfig.size.width" class="dr-config-panel__control" :min="320" :step="10" controls-position="right" />
          </el-form-item>

          <el-form-item label="高度">
            <el-input-number v-model="basicConfig.size.height" class="dr-config-panel__control" :min="320" :step="10" controls-position="right" />
          </el-form-item>
        </el-collapse-item>

        <el-collapse-item title="背景" name="background">
          <el-form-item label="背景填充">
            <el-radio-group v-model="basicConfig.background.fill">
              <el-radio value="color">颜色</el-radio>
              <el-radio value="image">图片</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item v-if="basicConfig.background.fill === 'color'" label="背景颜色">
            <el-color-picker v-model="basicConfig.background.color" show-alpha />
          </el-form-item>

          <template v-if="basicConfig.background.fill === 'image'">
            <el-form-item label="背景图片">
              <div class="bg-upload-section">
                <el-upload
                  :action="uploadUrl"
                  :headers="uploadHeaders"
                  :on-success="handleBgUploadSuccess"
                  :on-error="handleUploadError"
                  :show-file-list="false"
                  accept="image/*"
                  class="bg-uploader"
                >
                  <div class="bg-preview-box">
                    <el-image v-if="basicConfig.background.url" :src="getResourceUrl(basicConfig.background.url)" fit="contain" class="bg-image" lazy>
                      <template #error>
                        <div class="bg-placeholder">
                          <el-icon class="bg-placeholder-icon">
                            <Picture />
                          </el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                    <div v-else class="bg-placeholder">
                      <el-icon class="bg-placeholder-icon">
                        <Picture />
                      </el-icon>
                      <span>点击上传背景图</span>
                    </div>
                  </div>
                </el-upload>
              </div>
            </el-form-item>

            <el-form-item label="透明度">
              <el-input-number v-model="basicConfig.background.opacity" class="dr-config-panel__control" :min="0" :max="100" :step="1" controls-position="right" />
            </el-form-item>

            <el-form-item label="填充方式">
              <el-select v-model="basicConfig.background.repeat" class="dr-config-panel__control" placeholder="请选择填充方式">
                <el-option label="不重复" value="no-repeat" />
                <el-option label="重复" value="repeat" />
                <el-option label="水平重复" value="repeat-x" />
                <el-option label="垂直重复" value="repeat-y" />
              </el-select>
            </el-form-item>
          </template>
        </el-collapse-item>

        <el-collapse-item title="预览缩放" name="zoom">
          <el-form-item label="缩放模式">
            <el-select v-model="basicConfig.size.zoom" class="dr-config-panel__control" placeholder="请选择缩放模式">
              <el-option v-for="mode in ZOOM_MODES" :key="mode.value" :label="mode.label" :value="mode.value" />
            </el-select>
          </el-form-item>

          <div v-if="currentZoomModeDesc" class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">缩放说明</div>
            <div class="panel-desc">{{ currentZoomModeDesc }}</div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="标尺 / 参考线" name="ruler">
          <el-form-item label="显示标尺">
            <el-switch v-model="rulerConfig.visible" size="small" />
          </el-form-item>

          <el-form-item label="显示参考线">
            <el-switch v-model="rulerConfig.guidesVisible" size="small" />
          </el-form-item>

          <el-form-item label="锁定全部">
            <el-switch v-model="rulerConfig.guidesLocked" size="small" />
          </el-form-item>

          <el-form-item label="清空">
            <el-button size="small" plain @click="clearUnlockedGuides">清空未锁定</el-button>
          </el-form-item>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">纵向参考线</div>
            <div v-if="rulerConfig.verticalGuides.length > 0" class="guide-list">
              <div v-for="guide in rulerConfig.verticalGuides" :key="guide.id" class="guide-row">
                <span class="guide-axis-label">X</span>
                <el-input-number
                  :model-value="guide.position"
                  :min="0"
                  :max="basicConfig.size.width"
                  :step="1"
                  size="small"
                  controls-position="right"
                  class="guide-position-input"
                  :disabled="isGuideLocked(guide)"
                  @update:model-value="(value: number | undefined) => updateGuidePosition('vertical', guide, value)"
                />
                <el-switch v-model="guide.locked" size="small" :disabled="rulerConfig.guidesLocked" />
                <el-button size="small" text :disabled="isGuideLocked(guide)" @click="deleteGuide('vertical', guide)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else class="panel-empty">暂无纵向参考线</div>
          </div>

          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">横向参考线</div>
            <div v-if="rulerConfig.horizontalGuides.length > 0" class="guide-list">
              <div v-for="guide in rulerConfig.horizontalGuides" :key="guide.id" class="guide-row">
                <span class="guide-axis-label">Y</span>
                <el-input-number
                  :model-value="guide.position"
                  :min="0"
                  :max="basicConfig.size.height"
                  :step="1"
                  size="small"
                  controls-position="right"
                  class="guide-position-input"
                  :disabled="isGuideLocked(guide)"
                  @update:model-value="(value: number | undefined) => updateGuidePosition('horizontal', guide, value)"
                />
                <el-switch v-model="guide.locked" size="small" :disabled="rulerConfig.guidesLocked" />
                <el-button size="small" text :disabled="isGuideLocked(guide)" @click="deleteGuide('horizontal', guide)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div v-else class="panel-empty">暂无横向参考线</div>
          </div>
        </el-collapse-item>

        <el-collapse-item title="定时器" name="timer">
          <div class="dr-config-panel__sub-section">
            <div class="dr-config-panel__sub-title">
              <span>定时器列表</span>
              <el-button type="primary" size="small" plain @click="addTimer">添加定时器</el-button>
            </div>
            <div class="timer-list">
              <div v-for="timer in timers" :key="timer.id" class="timer-item">
                <div class="timer-info">
                  <div class="timer-name">{{ timer.name }}</div>
                  <div class="timer-desc">{{ timer.interval }} 毫秒1次</div>
                </div>
                <div class="timer-controls">
                  <el-switch v-model="timer.enabled" size="small" @change="(val: string | number | boolean) => toggleTimer(timer, val)" />
                  <el-button size="small" text @click="openTimerConfig(timer)">
                    <el-icon><Setting /></el-icon>
                  </el-button>
                  <el-button size="small" text type="danger" @click="deleteTimer(timer.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
              <div v-if="timers.length === 0" class="empty-timer">
                <el-empty description="暂无定时器，请点击上方按钮添加" :image-size="80" />
              </div>
            </div>
          </div>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <TimerConfigDialog v-if="timerConfigDialogVisible && currentTimer" v-model="timerConfigDialogVisible" :timer="currentTimer" />
  </div>
</template>

<style scoped lang="scss">
@use '@/dataRoom/assets/styles/chartConfigPanel.scss';

.dr-visual-screen-config-panel {
  --el-collapse-border-color: var(--el-bg-color);

  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.dr-visual-screen-config-panel .dr-config-panel__form {
  box-sizing: border-box;
  min-height: 0;
  padding: 12px;
  overflow-y: auto;
}

.dr-visual-screen-config-panel .dr-config-panel__section {
  margin-bottom: 0;
}

.panel-desc,
.panel-empty {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.5;
  letter-spacing: 0;
}

.guide-list,
.timer-list {
  display: grid;
  gap: 8px;
}

.guide-row {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
}

.guide-axis-label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0;
  font-feature-settings: 'tnum';
}

.guide-position-input {
  width: 100%;
}

.timer-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.2s;
}

.timer-item:hover {
  border-color: var(--el-border-color-darker);
}

.timer-info {
  flex: 1;
  min-width: 0;
}

.timer-name {
  margin-bottom: 4px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0;
}

.timer-desc {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  letter-spacing: 0;
  font-feature-settings: 'tnum';
}

.timer-controls {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 4px;
}

.empty-timer {
  padding: 24px 0;
}

.bg-upload-section,
.bg-uploader {
  display: block;
  width: 100%;
}

.bg-uploader {
  cursor: pointer;
}

.bg-preview-box {
  box-sizing: border-box;
  position: relative;
  width: 100%;
  height: 160px;
  padding: 16px;
  overflow: hidden;
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  transition: border-color 0.2s;
}

.bg-preview-box:hover {
  border-color: var(--el-color-primary);
}

.bg-image {
  display: block;
  width: 100%;
  height: 100%;
}

.bg-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: var(--el-fill-color-extra-light);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  letter-spacing: 0;
}

.bg-placeholder-icon {
  margin-bottom: 8px;
  color: var(--el-text-color-disabled);
  font-size: 48px;
}
</style>
