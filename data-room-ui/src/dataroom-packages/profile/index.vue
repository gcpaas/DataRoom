<script setup lang="ts">
import {onMounted, ref} from 'vue'
import request from '@/dataroom-packages/_common/_request.ts'

interface UserInfo {
  account: string
  username: string
  role: string
}

const userInfo = ref<UserInfo>({
  account: '',
  username: '',
  role: ''
})

const allRoles = [
  {code: 'manager', name: '管理员'},
  {code: 'developer', name: '开发者'},
  {code: 'sharer', name: '访问者'}
]

const roleNameMap: Record<string, string> = {
  'manager': '管理员',
  'developer': '开发者',
  'sharer': '访问者'
}

const getRoles = (roleStr: string) => {
  if (!roleStr) return []
  return roleStr.split(',').filter(Boolean)
}

onMounted(() => {
  request.get<UserInfo>('/dataRoom/user/current').then((res) => {
    userInfo.value = {
      account: res.account || '',
      username: res.username || '',
      role: res.role || ''
    }
  })
})
</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-container">
      <h2 class="profile-title">个人信息</h2>
      <el-form label-width="100px" class="profile-form">
        <el-form-item label="账号">
          <el-input v-model="userInfo.account" disabled/>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userInfo.username" disabled/>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group :model-value="getRoles(userInfo.role)" disabled>
            <el-checkbox v-for="role in allRoles" :key="role.code" :label="role.code" :value="role.code">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 48px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.profile-container {
  width: 500px;
  background: #fff;
  border-radius: 8px;
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 4px 12px rgba(0, 0, 0, 0.06);
  padding: 32px 40px;

  .profile-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 28px;
    color: #1d2129;
    text-align: center;
  }

  .profile-form {
    :deep(.el-form-item__label) {
      font-size: 14px;
      font-weight: 500;
      color: #4e5969;
    }

    :deep(.el-input__wrapper) {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #e5e6eb inset;
    }

    :deep(.el-input.is-disabled .el-input__wrapper) {
      background-color: #f7f8fa;
    }

    :deep(.el-input.is-disabled .el-input__inner) {
      color: #1d2129;
      -webkit-text-fill-color: #1d2129;
    }

    :deep(.el-checkbox.is-disabled .el-checkbox__label) {
      color: #1d2129;
    }

    :deep(.el-checkbox.is-disabled.is-checked .el-checkbox__inner) {
      background-color: #3478f6;
      border-color: #3478f6;
    }
  }
}
</style>
