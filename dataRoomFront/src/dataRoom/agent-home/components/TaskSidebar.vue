<script setup lang="ts">
import { Delete, Edit, Setting } from '@element-plus/icons-vue'
import type { AgentTask } from '../types'

defineProps<{
  tasks: AgentTask[]
  currentThreadId: string
  loading?: boolean
}>()

const emit = defineEmits<{
  (e: 'new-task'): void
  (e: 'select', task: AgentTask): void
  (e: 'rename', task: AgentTask): void
  (e: 'delete', task: AgentTask): void
  (e: 'open-console'): void
}>()

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * 相对时间：刚刚 / N分钟前 / N小时前 / N天前 / 超过30天显示日期
 */
const formatRelativeTime = (value?: string): string => {
  if (!value) {
    return ''
  }
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) {
    return ''
  }
  const diff = Date.now() - time
  if (diff < MINUTE) {
    return '刚刚'
  }
  if (diff < HOUR) {
    return `${Math.floor(diff / MINUTE)}分钟前`
  }
  if (diff < DAY) {
    return `${Math.floor(diff / HOUR)}小时前`
  }
  if (diff < 30 * DAY) {
    return `${Math.floor(diff / DAY)}天前`
  }
  const date = new Date(time)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}
</script>

<template>
  <aside class="task-sidebar">
    <div class="task-sidebar__header">
      <span class="task-sidebar__brand">DataRoom设计器</span>
    </div>

    <div class="task-sidebar__menu">
      <div class="menu-item" @click="emit('new-task')">
        <el-icon><Edit /></el-icon>
        <span>新建任务</span>
      </div>
      <div class="menu-item" @click="emit('open-console')">
        <el-icon><Setting /></el-icon>
        <span>设计器</span>
      </div>
    </div>

    <div class="task-sidebar__list-title">任务 {{ tasks.length }}</div>

    <div v-loading="loading" class="task-sidebar__list">
      <el-scrollbar height="100%">
        <div class="task-sidebar__list-content">
          <el-empty v-if="!loading && tasks.length === 0" description="暂无任务" :image-size="60" />
          <div
            v-for="task in tasks"
            :key="task.threadId"
            class="task-item"
            :class="{ 'task-item--active': task.threadId === currentThreadId }"
            :title="task.title"
            @click="emit('select', task)"
          >
            <span class="task-item__name">{{ task.title }}</span>
            <span class="task-item__time">{{ formatRelativeTime(task.updateDate || task.createDate) }}</span>
            <div class="task-item__ops" @click.stop>
              <el-icon title="重命名" @click="emit('rename', task)"><Edit /></el-icon>
              <el-icon title="删除" @click="emit('delete', task)"><Delete /></el-icon>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.task-sidebar {
  display: flex;
  flex-direction: column;
  width: 260px;
  height: 100%;
  flex-shrink: 0;
  border-right: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-page);

  &__header {
    display: flex;
    align-items: center;
    padding: 16px;
  }

  &__brand {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  &__menu {
    padding: 0 8px 8px;
  }

  &__list-title {
    padding: 8px 16px 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  &__list {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  &__list-content {
    padding: 0 8px 16px;
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  line-height: 22px;
  color: var(--el-text-color-primary);

  &:hover,
  &:active {
    background: var(--el-border-color);
  }
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;

  &:hover,
  &:active,
  &--active {
    background: var(--el-border-color);
  }

  &__name {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: var(--el-text-color-primary);
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    // 末尾渐隐遮罩：仅控制透明度通道，超长文本向右淡出
    mask-image: linear-gradient(to right, #000 85%, transparent);
  }

  &__time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    line-height: 22px;
  }

  // hover 时隐藏时间，名称占据整行宽度
  &:hover &__time {
    display: none;
  }

  &__ops {
    display: none;
    gap: 6px;
    flex-shrink: 0;
    color: var(--el-text-color-secondary);
  }

  &:hover &__ops {
    display: flex;
  }
}
</style>
