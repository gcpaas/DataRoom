<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface ConsoleMenuItem {
  key: string
  label: string
  path: string
}

const router = useRouter()
const route = useRoute()

const consoleMenus: ConsoleMenuItem[] = [
  {
    key: 'user',
    label: '用户管理',
    path: '/dataRoom/console/user',
  },
  {
    key: 'profile',
    label: '个人信息',
    path: '/dataRoom/console/profile',
  },
  {
    key: 'log',
    label: '访问日志',
    path: '/dataRoom/console/log',
  },
]
const defaultConsolePath = '/dataRoom/console/user'

const activeMenuPath = computed(() => {
  const matchedMenu = consoleMenus.find((item) => route.path.startsWith(item.path))
  return matchedMenu?.path || defaultConsolePath
})

const jumpToMenu = (path: string) => {
  if (path !== route.path) {
    router.push(path)
  }
}
</script>

<template>
  <div class="dr-console-layout">
    <aside class="dr-console-layout__sidebar">
      <div class="dr-console-layout__sidebar-header">
        <h2 class="dr-console-layout__title">控制台</h2>
      </div>
      <div class="dr-console-layout__menu">
        <button
          v-for="item in consoleMenus"
          :key="item.key"
          type="button"
          class="dr-console-layout__menu-item"
          :class="{ 'is-active': activeMenuPath === item.path }"
          @click="jumpToMenu(item.path)"
        >
          <span class="dr-console-layout__menu-label">{{ item.label }}</span>
        </button>
      </div>
    </aside>
    <section class="dr-console-layout__content">
      <RouterView />
    </section>
  </div>
</template>

<style scoped lang="scss">
.dr-console-layout {
  display: flex;
  height: 100%;
  min-height: 0;
  gap: 16px;
  background: transparent;

  &__sidebar {
    width: 200px;
    flex-shrink: 0;
    align-self: stretch;
    margin: 16px 0 16px 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color);
    border-radius: 8px;
    padding: 16px 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow: hidden;
  }

  &__sidebar-header {
    padding: 0 16px 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  &__title {
    margin: 0;
    font-size: 20px;
    line-height: 1.3;
    font-weight: 600;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__menu {
    display: flex;
    flex-direction: column;
  }

  &__menu-item {
    width: 100%;
    border: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: transparent;
    padding: 12px 16px;
    box-sizing: border-box;
    text-align: left;
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      background: var(--el-fill-color-lighter);
    }

    &.is-active {
      background: var(--el-color-primary-light-9);
      box-shadow: inset 2px 0 0 var(--el-color-primary);
    }
  }

  &__menu-label {
    font-size: 14px;
    line-height: 1.57;
    font-weight: 500;
    color: var(--el-text-color-primary);
    letter-spacing: 0;
  }

  &__content {
    flex: 1;
    min-width: 0;
    min-height: 0;
    margin: 16px 16px 16px 0;
    overflow: auto;
    background: transparent;
    border: 0;
    border-radius: 0;
    padding: 0;
    box-sizing: border-box;
  }
}
</style>
