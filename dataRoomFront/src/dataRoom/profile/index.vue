<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/dataRoom/utils/request.ts'
import { encryptByRsa } from '@/dataRoom/utils/encrypt'

interface UserInfo {
  id: string
  account: string
  username: string
  role: string
}

const userInfo = ref<UserInfo>({
  id: '',
  account: '',
  username: '',
  role: '',
})

const loading = ref(false)
const editForm = ref({
  username: '',
  password: '',
  confirmPassword: '',
})

const allRoles = [
  { code: 'manager', name: '管理员' },
  { code: 'developer', name: '开发者' },
  { code: 'sharer', name: '访问者' },
]

const getRoles = (roleStr: string) => {
  if (!roleStr) return []
  return roleStr.split(',').filter(Boolean)
}

const handleSave = async () => {
  if (!editForm.value.username) {
    ElMessage.warning('用户名不能为空')
    return
  }
  if (editForm.value.password) {
    if (editForm.value.password !== editForm.value.confirmPassword) {
      ElMessage.warning('两次输入的密码不一致')
      return
    }
    if (editForm.value.password.length < 6) {
      ElMessage.warning('密码长度不能少于6位')
      return
    }
  }
  loading.value = true
  try {
    let encryptedPassword: string | null = null
    if (editForm.value.password) {
      encryptedPassword = encryptByRsa(editForm.value.password)
      if (!encryptedPassword) {
        ElMessage.error('密码加密失败,请重试')
        loading.value = false
        return
      }
    }
    await request.post('/dataRoom/user/profile/update', {
      username: editForm.value.username,
      password: encryptedPassword,
    })
    ElMessage.success('保存成功')
    editForm.value.password = ''
    editForm.value.confirmPassword = ''
    // 刷新用户信息
    loadUserInfo()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  editForm.value.username = userInfo.value.username
  editForm.value.password = ''
  editForm.value.confirmPassword = ''
}

const loadUserInfo = () => {
  request.get<UserInfo>('/dataRoom/user/current').then((res) => {
    userInfo.value = {
      id: res.id || '',
      account: res.account || '',
      username: res.username || '',
      role: res.role || '',
    }
    editForm.value.username = res.username || ''
  })
}

onMounted(() => {
  loadUserInfo()
})
</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-container">
      <h2 class="profile-title">个人信息</h2>
      <el-form label-width="100px" class="profile-form">
        <el-form-item label="账号">
          <el-input v-model="userInfo.account" disabled />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="editForm.password" placeholder="请输入新密码（不修改则留空）" show-password clearable />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input v-model="editForm.confirmPassword" placeholder="请再次输入密码" show-password clearable />
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group :model-value="getRoles(userInfo.role)" disabled>
            <el-checkbox v-for="role in allRoles" :key="role.code" :label="role.code" :value="role.code">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSave" :loading="loading">保存</el-button>
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
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;
}

.profile-container {
  width: 500px;
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  box-sizing: border-box;
  padding: 32px 40px;

  .profile-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 28px;
    color: var(--el-text-color-primary);
    text-align: center;
    letter-spacing: 0;
  }
}
</style>
