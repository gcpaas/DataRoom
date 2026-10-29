<script setup lang="ts">
import { computed } from 'vue'
import { Monitor, View, EditPen } from '@element-plus/icons-vue'
import type { PageResult } from '../types'
import { PageType } from '@/dataRoom/constants/PageType.ts'
import { PageStatus } from '@/dataRoom/constants/PageStatus.ts'

const props = defineProps<{
  result: PageResult
}>()

const isVisualScreen = computed(() => props.result.pageType === PageType.VISUAL_SCREEN)

const typeLabel = computed(() => (isVisualScreen.value ? '大屏' : '页面'))

const title = computed(() => {
  const actionLabel = props.result.action === 'created' ? '已创建' : '已更新'
  return `${typeLabel.value}${actionLabel}`
})

const displayName = computed(() => props.result.pageName || props.result.pageCode)

/**
 * 组装站内 hash 路由地址并在新标签页打开
 */
const openInNewTab = (path: string) => {
  if (!path) {
    return
  }
  const base = window.location.href.split('#')[0]
  window.open(`${base}#${path}`, '_blank')
}

const openPreview = () => {
  const code = props.result.pageCode
  const path = isVisualScreen.value
    ? `/dataRoom/visualScreenPreview/${PageStatus.DESIGN}/${code}`
    : `/dataRoom/pagePreviewer/${PageStatus.DESIGN}/${code}`
  openInNewTab(path)
}

const openDesigner = () => {
  const code = props.result.pageCode
  const path = isVisualScreen.value
    ? `/dataRoom/visualScreenDesigner/${code}`
    : `/dataRoom/pageDesigner/${code}`
  openInNewTab(path)
}
</script>

<template>
  <div class="page-result-card">
    <div class="page-result-card__icon">
      <el-icon :size="20"><Monitor /></el-icon>
    </div>
    <div class="page-result-card__body">
      <div class="page-result-card__title">{{ title }}</div>
      <div class="page-result-card__name">{{ displayName }}</div>
      <div class="page-result-card__actions">
        <el-button size="small" type="primary" plain :icon="View" @click="openPreview">
          打开预览
        </el-button>
        <el-button size="small" :icon="EditPen" @click="openDesigner">打开设计器</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-result-card {
  display: flex;
  gap: 12px;
  padding: 12px;
  margin-top: 8px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  background: var(--el-bg-color-overlay);
  max-width: 360px;

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    border-radius: 8px;
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }

  &__body {
    min-width: 0;
    flex: 1;
  }

  &__title {
    font-size: 13px;
    color: var(--el-text-color-primary);
    font-weight: 600;
    line-height: 20px;
  }

  &__name {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 18px;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    margin-top: 8px;
    display: flex;
    gap: 8px;
  }
}
</style>
