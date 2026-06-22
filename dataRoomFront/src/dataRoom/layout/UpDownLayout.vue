<script setup lang="ts">
import logo from '@/dataRoom/assets/logo.png'
import userAvatar from '@/dataRoom/layout/assets/image/user.png'
import { useRoute, useRouter } from 'vue-router'
import request from '@/dataRoom/utils/request.ts'
import { removeCookie } from '@/dataRoom/utils/cookie'
import { onMounted, ref } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
interface CurrentUser {
  realName?: string
  username?: string
}

const jumpMenu = (path: string) => {
  router.push({
    path: path,
  })
}
const username = ref('')

// 判断菜单是否激活
const isMenuActive = (path: string) => {
  return route.path.includes(path)
}

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  if (command === 'logout') {
    // 删除cookie中的token
    removeCookie()
    // 跳转到登录页
    router.push('/login')
  } else if (command === 'profile') {
    router.push('/dataRoom/console/profile')
  } else if (command === 'console') {
    router.push('/dataRoom/console/user')
  }
}

onMounted(() => {
  request.get<CurrentUser>(`/dataRoom/user/current`).then((res) => {
    username.value = res.realName || res.username || ''
  })
})
</script>

<template>
  <div class="dr-up-down-layout">
    <div class="header">
      <div class="logo" @click="jumpMenu('/')"><img :src="logo" /></div>
      <div class="title">DataRoom设计器</div>
      <div class="menu">
        <div class="item" :class="{ active: isMenuActive('/dataRoom/page') }" @click="jumpMenu('/dataRoom/page/index')">页面设计</div>
        <div class="item" :class="{ active: isMenuActive('/dataRoom/resource') }" @click="jumpMenu('/dataRoom/resource/index')">素材库</div>
        <div class="item" :class="{ active: isMenuActive('/dataRoom/dataSource') }" @click="jumpMenu('/dataRoom/dataSource/index')">数据源</div>
        <div class="item" :class="{ active: isMenuActive('/dataRoom/dataset') }" @click="jumpMenu('/dataRoom/dataset/index')">数据集</div>
        <div class="item" :class="{ active: isMenuActive('/dataRoom/map') }" @click="jumpMenu('/dataRoom/map/index')">地图</div>
      </div>
      <a class="help-link" href="https://www.yuque.com/gc-starter/dataroom-plus/start" target="_blank" rel="noopener noreferrer">帮助</a>
      <div class="user">
        <el-dropdown @command="handleCommand">
          <span class="user-dropdown-trigger">
            <img :src="userAvatar" class="user-avatar" alt="用户头像" />
            {{ username }}
            <el-icon class="user-dropdown-icon">
              <arrow-down />
            </el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="console">控制台</el-dropdown-item>
              <el-dropdown-item command="profile" divided>个人信息</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <RouterView class="router-view" />
  </div>
</template>

<style scoped lang="scss">
.dr-up-down-layout {
  height: 100vh;
  width: 100%;
  background-color: var(--el-bg-color-page);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  & .router-view {
    padding: 16px;
    box-sizing: border-box;
    background-color: var(--el-fill-color-blank);
    margin: 16px;
    border-radius: 8px;
    border: 1px solid var(--el-border-color);
    height: calc(100vh - 48px - 32px);
    overflow: hidden;
  }

  & .header {
    background-color: var(--el-bg-color);
    height: 48px;
    width: 100%;
    line-height: 48px;
    border-bottom: 1px solid var(--el-border-color);
    color: var(--el-text-color-primary);
    font-weight: 500;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;

    & .logo {
      display: flex;
      align-items: center;
      cursor: pointer;

      & img {
        height: 28px;
      }
    }

    & .title {
      margin-left: 16px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      letter-spacing: 0;
    }

    & .menu {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      height: 100%;

      & .item {
        cursor: pointer;
        display: flex;
        align-items: center;
        height: 100%;
        box-sizing: border-box;
        font-size: 14px;
        font-weight: 500;
        line-height: 1;
        color: var(--el-text-color-primary);
        padding: 0 12px;
        border-radius: 6px;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
        position: relative;

        &:hover {
          background-color: var(--el-fill-color-lighter);
        }

        &.active {
          color: var(--el-color-primary);

          &::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);
            width: calc(100% - 24px);
            height: 2px;
            background-color: var(--el-color-primary);
            border-radius: 1px;
          }
        }
      }
    }

    & .help-link {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-regular);
      text-decoration: none;
      margin-right: 16px;
      margin-left: 16px;
      cursor: pointer;
      flex-shrink: 0;
      white-space: nowrap;
      transition: color 0.2s ease;
      border-radius: 6px;
      padding: 4px 8px;

      &:hover {
        color: var(--el-color-primary);
        background-color: var(--el-color-primary-light-9);
      }
    }

    & .user {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-shrink: 0;

      .user-dropdown-trigger {
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        font-size: 14px;
        font-weight: 500;
        transition: color 0.2s ease;
        line-height: 1;
        outline: none;
        color: var(--el-text-color-primary);
        border-radius: 6px;
        padding: 4px 8px;

        &:hover {
          color: var(--el-color-primary);
        }

        &:focus {
          outline: none;
        }

        .user-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          margin-right: 8px;
          object-fit: cover;
          border: 1px solid var(--el-border-color-light);
        }

        .user-dropdown-icon {
          margin-left: 4px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }
}
</style>
