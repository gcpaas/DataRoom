<!-- 大屏设计器配置面板 -->
<script setup lang="ts">
/* eslint-disable vue/no-mutating-props */
import { computed, defineAsyncComponent, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCookie, getCookieName } from '@/dataroom-packages/_common/_cookie'
import { Delete, Picture, Setting } from '@element-plus/icons-vue'
import type { VisualScreenPageBasicConfig } from '@/dataroom-packages/PageDesigner/type/VisualScreenPageBasicConfig.ts'
import type { PageTimer } from '@/dataroom-packages/PageDesigner/type/PageTimer.ts'
import { getResourceUrl } from '@/dataroom-packages/_common/_utils.ts'
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

const activeTab = ref('config')

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

const toggleTimer = (timer: PageTimer, enabled: boolean) => {
  timer.enabled = enabled
  ElMessage.success(enabled ? '定时器已启用' : '定时器已禁用')
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
  <div class="control-panel">
    <div class="control-tabs">
      <div class="control-tabs-header" role="tablist" aria-label="大屏配置">
        <button type="button" class="control-tab" :class="{ active: activeTab === 'config' }" role="tab" :aria-selected="activeTab === 'config'" @click="activeTab = 'config'">
          配置
        </button>
        <button
          type="button"
          class="control-tab"
          :class="{ active: activeTab === 'interaction' }"
          role="tab"
          :aria-selected="activeTab === 'interaction'"
          @click="activeTab = 'interaction'"
        >
          交互
        </button>
      </div>
      <div class="control-tabs-content">
        <section v-show="activeTab === 'config'" class="control-tab-pane" role="tabpanel">
          <div class="tab-content">
            <el-form label-width="80px" label-position="left" size="small">
              <!-- 大屏尺寸配置 -->
              <el-divider content-position="left">大屏尺寸</el-divider>

              <el-form-item label="分辨率">
                <el-select v-model="selectedPreset" placeholder="请选择分辨率">
                  <el-option v-for="preset in RESOLUTION_PRESETS" :key="preset.value" :label="preset.label" :value="preset.value" />
                </el-select>
              </el-form-item>

              <el-form-item label="宽度">
                <el-input-number v-model="basicConfig.size.width" :min="320" :step="10" controls-position="right" class="field-full" />
              </el-form-item>

              <el-form-item label="高度">
                <el-input-number v-model="basicConfig.size.height" :min="320" :step="10" controls-position="right" class="field-full" />
              </el-form-item>

              <!-- 背景配置 -->
              <el-divider content-position="left">背景设置</el-divider>

              <el-form-item label="背景填充">
                <el-radio-group v-model="basicConfig.background.fill">
                  <el-radio value="color">颜色</el-radio>
                  <el-radio value="image">图片</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="背景颜色" v-if="basicConfig.background.fill === 'color'">
                <el-color-picker v-model="basicConfig.background.color" show-alpha></el-color-picker>
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
                              <el-icon>
                                <Picture />
                              </el-icon>
                              <span>加载失败</span>
                            </div>
                          </template>
                        </el-image>
                        <div v-else class="bg-placeholder">
                          <el-icon>
                            <Picture />
                          </el-icon>
                          <span>点击上传背景图</span>
                        </div>
                      </div>
                    </el-upload>
                  </div>
                </el-form-item>

                <el-form-item label="透明度">
                  <el-input-number v-model="basicConfig.background.opacity" :min="0" :max="100" :step="1" controls-position="right" class="field-full" />
                </el-form-item>

                <el-form-item label="填充方式">
                  <el-select v-model="basicConfig.background.repeat" placeholder="请选择填充方式">
                    <el-option label="不重复" value="no-repeat"></el-option>
                    <el-option label="重复" value="repeat"></el-option>
                    <el-option label="水平重复" value="repeat-x"></el-option>
                    <el-option label="垂直重复" value="repeat-y"></el-option>
                  </el-select>
                </el-form-item>
              </template>

              <!-- 缩放模式配置 -->
              <el-divider content-position="left">缩放模式</el-divider>

              <el-form-item label="预览缩放">
                <el-select v-model="basicConfig.size.zoom" placeholder="请选择缩放模式">
                  <el-option v-for="mode in ZOOM_MODES" :key="mode.value" :label="mode.label" :value="mode.value" />
                </el-select>
              </el-form-item>

              <div class="zoom-desc" v-if="basicConfig.size.zoom">
                {{ ZOOM_MODES.find((m) => m.value === basicConfig.size.zoom)?.desc }}
              </div>

              <el-divider content-position="left">标尺 / 参考线</el-divider>

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

              <div class="guide-section">
                <div class="guide-section-title">纵向参考线</div>
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
                <div v-else class="guide-empty">暂无纵向参考线</div>
              </div>

              <div class="guide-section">
                <div class="guide-section-title">横向参考线</div>
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
                <div v-else class="guide-empty">暂无横向参考线</div>
              </div>
            </el-form>
          </div>
        </section>
        <section v-show="activeTab === 'interaction'" class="control-tab-pane" role="tabpanel">
          <div class="tab-content">
            <div class="timer-header">
              <span class="timer-title">定时器</span>
              <el-button type="primary" size="small" plain @click="addTimer">添加定时器</el-button>
            </div>
            <div class="timer-list">
              <div class="timer-item" v-for="timer in timers" :key="timer.id">
                <div class="timer-info">
                  <div class="timer-name">{{ timer.name }}</div>
                  <div class="timer-desc">{{ timer.interval }} 毫秒1次</div>
                </div>
                <div class="timer-controls">
                  <el-switch v-model="timer.enabled" size="small" @change="(val: boolean) => toggleTimer(timer, val)" />
                  <el-icon class="setting-icon" @click="openTimerConfig(timer)">
                    <Setting />
                  </el-icon>
                  <el-icon class="delete-icon" @click="deleteTimer(timer.id)">
                    <Delete />
                  </el-icon>
                </div>
              </div>
              <div v-if="timers.length === 0" class="empty-timer">
                <el-empty description="暂无定时器，请点击上方按钮添加" :image-size="80" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- 定时器配置对话框 -->
    <TimerConfigDialog v-if="timerConfigDialogVisible && currentTimer" v-model="timerConfigDialogVisible" :timer="currentTimer" />
  </div>
</template>

<style scoped lang="scss">
.control-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  .control-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;

    .control-tabs-header {
      display: flex;
      flex: 0 0 auto;
      gap: 4px;
      padding: 0 16px;
      border-bottom: 1px solid var(--el-border-color-light);
    }

    .control-tab {
      position: relative;
      min-width: 56px;
      height: 40px;
      padding: 0 12px;
      border: 0;
      background: var(--el-bg-color);
      color: var(--el-text-color-secondary);
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .control-tab:hover {
      color: var(--el-text-color-regular);
    }

    .control-tab.active {
      color: var(--el-text-color-primary);
    }

    .control-tab.active::after {
      content: '';
      position: absolute;
      right: 12px;
      bottom: 0;
      left: 12px;
      height: 2px;
      background-color: var(--el-color-primary);
    }

    .control-tabs-content {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }

    .control-tab-pane {
      height: 100%;
      min-height: 0;
    }

    .tab-content {
      padding: 16px;
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;

      .field-full {
        width: 100%;
      }

      .zoom-desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        padding: 0 0 12px 80px;
        margin-top: -8px;
      }

      .guide-section {
        margin-bottom: 16px;
      }

      .guide-section-title {
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 500;
        line-height: 1.33;
        color: var(--el-text-color-secondary);
        letter-spacing: 0;
      }

      .guide-list {
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

      .guide-empty {
        color: var(--el-text-color-secondary);
        font-size: 12px;
        line-height: 1.5;
        letter-spacing: 0;
      }

      .timer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--el-border-color-light);

        .timer-title {
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
          color: var(--el-text-color-secondary);
          letter-spacing: 0;
        }
      }

      .timer-list {
        .timer-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          margin-bottom: 12px;
          background: var(--el-fill-color-blank);
          border: 1px solid var(--el-border-color);
          border-radius: 6px;
          transition: border-color 0.2s;
          cursor: pointer;

          &:hover {
            border-color: var(--el-border-color-darker);
          }

          .timer-info {
            flex: 1;
            min-width: 0;
            margin-right: 12px;

            .timer-name {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
              margin-bottom: 4px;
            }

            .timer-desc {
              font-size: 12px;
              color: var(--el-text-color-secondary);
              font-feature-settings: 'tnum';
            }
          }

          .timer-controls {
            display: flex;
            align-items: center;
            gap: 12px;

            .setting-icon,
            .delete-icon {
              cursor: pointer;
              transition: color 0.2s;
            }

            .setting-icon {
              color: var(--el-text-color-secondary);

              &:hover {
                color: var(--el-color-primary);
              }
            }

            .delete-icon {
              color: var(--el-color-danger);

              &:hover {
                opacity: 0.8;
              }
            }
          }
        }

        .empty-timer {
          padding: 40px 0;
        }
      }

      .bg-upload-section {
        width: 100%;

        .bg-uploader {
          width: 100%;
          display: block;
          cursor: pointer;
        }

        .bg-preview-box {
          width: 100%;
          height: 160px;
          border: 1px dashed var(--el-border-color);
          border-radius: 6px;
          overflow: hidden;
          position: relative;
          transition: border-color 0.2s;
          padding: 16px;
          box-sizing: border-box;

          &:hover {
            border-color: var(--el-color-primary);
          }

          .bg-image {
            width: 100%;
            height: 100%;
            display: block;
          }

          .bg-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--el-fill-color-extra-light);
            color: var(--el-text-color-secondary);
            font-size: 13px;
            border-radius: 4px;

            .el-icon {
              font-size: 48px;
              margin-bottom: 8px;
              color: var(--el-text-color-disabled);
            }
          }
        }
      }
    }
  }
}
</style>
