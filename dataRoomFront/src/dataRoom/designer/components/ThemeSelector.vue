<script setup lang="ts">
import { ref, useId } from 'vue'
import { ElMessageBox } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import themeIcon from '../assets/icons/theme.svg'
import { getTheme, themes } from '@/dataRoom/theme/registry'
import type { ChartTheme } from '@/dataRoom/theme/types'

const props = defineProps<{ themeId?: string; disabled?: boolean }>()
const emit = defineEmits<{ select: [themeId: string] }>()
const visible = ref(false)
const confirming = ref(false)
const previewId = useId()

const selectTheme = async (theme: ChartTheme) => {
  if (confirming.value || props.disabled) return
  confirming.value = true
  visible.value = false
  try {
    await ElMessageBox.confirm(
      `自定义样式会被覆盖, 确定应用${theme.name}主题吗?`,
      '切换主题',
      { confirmButtonText: '应用主题', cancelButtonText: '取消', type: 'warning', distinguishCancelAndClose: true },
    )
    emit('select', theme.id)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') console.error(error)
  } finally {
    confirming.value = false
  }
}
</script>

<template>
  <el-popover v-model:visible="visible" trigger="click" placement="bottom-end" :width="480" title="主题" :disabled="disabled || confirming">
    <template #reference>
      <el-button size="small" :disabled="disabled || confirming" :aria-expanded="visible">
        <span class="theme-selector__trigger">
          <img :src="themeIcon" width="16" height="16" alt="" aria-hidden="true" />
          <span>主题</span>
          <el-icon aria-hidden="true"><ArrowDown /></el-icon>
        </span>
      </el-button>
    </template>
    <div class="theme-selector">
      <div class="theme-selector__list">
        <button
          v-for="theme in themes" :key="theme.id" type="button"
          class="theme-selector__option" :aria-pressed="getTheme(themeId)?.id === theme.id"
          :disabled="confirming" @click="selectTheme(theme)"
        >
          <svg class="theme-selector__preview" viewBox="0 0 144 90" role="img" :aria-label="`${theme.name}柱状图预览`">
            <defs>
              <linearGradient v-for="(color, index) in theme.series.colors" :id="`${previewId}-${theme.id}-${index}`" :key="index" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" :stop-color="color" :stop-opacity="theme.series.gradient.startOpacity" />
                <stop offset="1" :stop-color="color" :stop-opacity="theme.series.gradient.endOpacity" />
              </linearGradient>
            </defs>
            <rect width="144" height="90" rx="4" :fill="theme.background.primary" />
            <text x="12" y="17" font-size="8" :fill="theme.text.primary">数据趋势</text>
            <path d="M16 32H132 M16 49H132" :stroke="theme.border.secondary" />
            <path d="M16 24V70H132" :stroke="theme.border.primary" fill="none" />
            <rect v-for="(_, index) in theme.series.colors" :key="index" :x="26 + index * (104 / theme.series.colors.length)" :y="70 - ([26, 42, 33, 48][index % 4] ?? 26)" width="14" :height="[26, 42, 33, 48][index % 4]" :fill="`url(#${previewId}-${theme.id}-${index})`" />
            <text v-for="(_, index) in theme.series.colors" :key="index" :x="29 + index * (104 / theme.series.colors.length)" y="82" font-size="7" :fill="theme.text.secondary">{{ index + 1 }}</text>
          </svg>
          <span class="theme-selector__name">{{ theme.name }}</span>
          <span class="theme-selector__description">{{ theme.description }}</span>
        </button>
      </div>
    </div>
  </el-popover>
</template>

<style scoped lang="scss">
.theme-selector__trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.theme-selector__list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}
.theme-selector__option {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  padding: 6px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  color: var(--el-text-color-primary);
  font: inherit;
  letter-spacing: 0;
  text-align: left;
  cursor: pointer;
  &:hover, &[aria-pressed='true'] { border-color: var(--el-color-primary); }
  &:focus-visible { outline: 2px solid var(--el-color-primary); outline-offset: 2px; }
  &:disabled { cursor: default; }
}
.theme-selector__preview { width: 100%; height: auto; }
.theme-selector__description { color: var(--el-text-color-secondary); font-size: var(--el-font-size-extra-small); }
</style>
