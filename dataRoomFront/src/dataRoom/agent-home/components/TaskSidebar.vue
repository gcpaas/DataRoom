<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Coin, Delete, Edit, Setting } from '@element-plus/icons-vue'
import config from '../../../../package.json'
import userAvatar from '@/dataRoom/layout/assets/image/user.png'
import request from '@/dataRoom/utils/request'
import { removeCookie } from '@/dataRoom/utils/cookie'
import { userApi } from '@/dataRoom/user/api'
import { getCasConfig, resolveLogoutTarget } from '@/dataRoom/cas'
import type { AgentTask } from '../types'

/** 前端版本号：取自 package.json，头部展示时冠以 v 前缀 */
const appVersion = config.version

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
  (e: 'open-dataset'): void
}>()

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const router = useRouter()
const username = ref('')
const userMenuVisible = ref(false)

interface CurrentUser {
  realName?: string
  username?: string
}

const externalLinks: Record<string, string> = {
  repository: 'https://gitee.com/gcpaas/DataRoom',
  manual: 'https://www.yuque.com/gc-starter/dataroom-plus/index',
  feedback: 'https://gitee.com/gcpaas/DataRoom/issues',
}

/**
 * 底部用户区下拉命令：外部链接新窗口打开，内部个人信息页和退出登录保留原有行为。
 */
const handleUserCommand = async (command: string) => {
  userMenuVisible.value = false
  const externalUrl = externalLinks[command]
  if (externalUrl) {
    window.open(externalUrl, '_blank', 'noopener,noreferrer')
    return
  }

  if (command === 'logout') {
    const logoutTarget = resolveLogoutTarget(getCasConfig())
    try {
      await userApi.logout()
    } catch (error) {
      console.error('退出登录失败:', error)
    } finally {
      removeCookie()
      if (logoutTarget === '/login') {
        await router.push(logoutTarget)
      } else {
        window.location.href = logoutTarget
      }
    }
  } else if (command === 'profile') {
    // 新窗口打开个人信息页，保留当前 Agent 会话页（与"设计器/数据集"菜单行为一致）
    const { href } = router.resolve('/dataRoom/console/profile')
    window.open(href, '_blank', 'noopener,noreferrer')
  }
}

onMounted(() => {
  request.get<CurrentUser>(`/dataRoom/user/current`).then((res) => {
    username.value = res.realName || res.username || ''
  })
})

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
      <span class="task-sidebar__version">v{{ appVersion }}</span>
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
      <div class="menu-item" @click="emit('open-dataset')">
        <el-icon><Coin /></el-icon>
        <span>数据集</span>
      </div>
    </div>

    <div class="task-sidebar__list-title">任务 ({{ tasks.length }})</div>

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

    <div class="task-sidebar__user">
      <!-- Dropdown 内置缩放过渡不可配置，使用 Popover 的公开属性关闭动画与等待。 -->
      <el-popover
        v-model:visible="userMenuVisible"
        trigger="click"
        placement="top-start"
        transition=""
        :show-after="0"
        :hide-after="0"
        :persistent="true"
        :width="220"
      >
        <template #reference>
          <div
            class="task-sidebar__user-trigger"
            role="button"
            tabindex="0"
            aria-label="用户菜单"
            :aria-expanded="userMenuVisible"
            @keydown.esc="userMenuVisible = false"
          >
            <img :src="userAvatar" class="task-sidebar__user-avatar" alt="用户头像" />
            <span class="task-sidebar__user-name">{{ username }}</span>
          </div>
        </template>
        <div class="user-actions" role="group" aria-label="用户操作" @keydown.esc="userMenuVisible = false">
          <button type="button" class="user-actions__item" @click="handleUserCommand('repository')">开源仓库</button>
          <button type="button" class="user-actions__item" @click="handleUserCommand('manual')">帮助手册</button>
          <button type="button" class="user-actions__item" @click="handleUserCommand('feedback')">意见反馈</button>
          <button type="button" class="user-actions__item" @click="handleUserCommand('profile')">个人信息</button>
          <button type="button" class="user-actions__item" @click="handleUserCommand('logout')">退出登录</button>
        </div>
      </el-popover>
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
  background: var(--el-fill-color-lighter);

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

  // 版本号：标题右侧 16px，小号淡色，与标题基线居中对齐
  &__version {
    margin-left: 16px;
    font-size: 12px;
    line-height: 22px;
    color: var(--el-text-color-secondary);
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

  // 底部用户区：固定在侧栏底部，位于任务列表滚动区之外，不随列表滚动
  &__user {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    padding: 8px;
    border-top: 1px solid var(--el-border-color-light);
  }

  &__user-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    outline: none;

    // hover 底色与菜单项、任务条目保持一致（Base Fill）
    &:hover,
    &:active {
      background: var(--el-fill-color);
    }
  }

  // 圆形头像：与全局头部共用同一头像资源
  &__user-avatar {
    width: 28px;
    height: 28px;
    flex-shrink: 0;
    border-radius: 50%;
    object-fit: cover;
    border: 1px solid var(--el-border-color-light);
  }

  // 用户名：主文本色加粗（规范字重上限 600），限宽省略
  &__user-name {
    width: 140px;
    font-size: 12px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 22px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

}

.user-actions {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 2px 0;

  &__item {
    display: block;
    width: 100%;
    height: 36px;
    padding: 0 12px;
    border: 0;
    border-radius: 4px;
    background: var(--el-bg-color-overlay);
    color: var(--el-text-color-primary);
    font: inherit;
    font-size: 13px;
    line-height: 22px;
    letter-spacing: 0;
    text-align: left;
    white-space: nowrap;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      outline: none;
      background: var(--el-fill-color);
    }
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  line-height: 22px;
  color: var(--el-text-color-primary);

  // 与任务列表条目保持一致的 hover 底色（Base Fill）
  &:hover,
  &:active {
    background: var(--el-fill-color);
  }
}

.task-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  cursor: pointer;

  // hover 与激活态共用 Base Fill 底色，视觉层级一致
  &:hover,
  &:active,
  &--active {
    background: var(--el-fill-color);
  }

  // 激活任务名称：主题色加粗
  &--active {
    .task-item__name {
      color: var(--el-color-primary);
      font-weight: 600;
    }
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
