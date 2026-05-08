<script setup lang="ts">
import {onMounted, ref} from 'vue'
import request from '@/dataroom-packages/_common/_request.ts'

interface UserInfo {
  username: string
  realName: string
  roleCodeList: string[]
}

const userInfo = ref<UserInfo>({
  username: '',
  realName: '',
  roleCodeList: []
})

const allRoles = [
  {code: 'manager', name: '管理员'},
  {code: 'developer', name: '开发者'},
  {code: 'sharer', name: '访问者'}
]

onMounted(() => {
  request.get<UserInfo>('/dataRoom/user/current').then((res) => {
    userInfo.value = {
      username: res.username || '',
      realName: res.realName || '',
      roleCodeList: res.roleCodeList || []
    }
  })
})
</script>

<template>
  <div class="profile-wrapper">
    <div class="profile-container">
      <h2 class="profile-title">个人信息</h2>
      <el-form label-width="100px" class="profile-form">
        <el-form-item label="账号名">
          <el-input v-model="userInfo.username" disabled/>
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="userInfo.realName" disabled/>
        </el-form-item>
        <el-form-item label="角色">
          <el-checkbox-group v-model="userInfo.roleCodeList" disabled>
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
  padding-top: 40px;
}

.profile-container {
  width: 500px;

  .profile-title {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 24px;
    color: var(--dr-text1);
    text-align: center;
  }

  .profile-form {
    :deep(.el-input.is-disabled .el-input__inner) {
      color: var(--dr-text1);
    }

    :deep(.el-checkbox.is-disabled .el-checkbox__label) {
      color: var(--dr-text1);
    }
  }
}
</style>
