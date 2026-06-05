<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import type { CheckboxGroupValueType, FormInstance, FormRules } from 'element-plus'
import type { UserDTO, Role, UserStatus } from '../api'
import { userApi } from '../api'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  userId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  success: []
}>()

const formRef = ref<FormInstance>()
const loading = ref(false)
const roles = ref<Role[]>([])

const formData = reactive<UserDTO>({
  id: '',
  account: '',
  username: '',
  password: '',
  phone: '',
  role: '',
  status: 'NORMAL' as UserStatus,
  expireDate: null,
})

const confirmPassword = ref('')

const isEdit = ref(false)
const originalStatus = ref<UserStatus>('NORMAL')

const statusOptions = computed(() => [
  {
    value: 'NORMAL' as UserStatus,
    label: '正常',
    disabled: isEdit.value && originalStatus.value !== 'NORMAL' && originalStatus.value !== 'LOCKED',
  },
  {
    value: 'LOCKED' as UserStatus,
    label: '锁定',
    disabled: !isEdit.value || originalStatus.value !== 'LOCKED',
  },
  { value: 'DISABLED' as UserStatus, label: '禁用', disabled: false },
  { value: 'PASSWORD_EXPIRED' as UserStatus, label: '密码过期', disabled: false },
])

// 监听弹窗打开/关闭
watch(
  () => props.modelValue,
  async (newVal) => {
    if (newVal) {
      // 加载角色列表
      if (roles.value.length === 0) {
        try {
          roles.value = await userApi.roles()
        } catch (error) {
          console.error('加载角色列表失败:', error)
        }
      }

      if (props.userId) {
        // 编辑模式
        isEdit.value = true
        confirmPassword.value = ''
        loading.value = true
        try {
          const user = await userApi.detail(props.userId)
          Object.assign(formData, user)
          originalStatus.value = user.status
          formData.password = '' // 编辑时不清除密码
        } catch (error) {
          console.error('加载用户详情失败:', error)
          ElMessage.error('加载用户详情失败')
        } finally {
          loading.value = false
        }
      } else {
        // 新增模式
        isEdit.value = false
        resetFields()
      }
    }
  },
)

const rules = reactive<FormRules<UserDTO>>({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()

    // 校验密码
    if (formData.password) {
      if (formData.password.length < 6) {
        ElMessage.error('密码长度不能少于6位')
        return
      }
      if (formData.password !== confirmPassword.value) {
        ElMessage.error('两次输入的密码不一致')
        return
      }
    }

    if (isEdit.value && formData.status === 'NORMAL' && originalStatus.value !== 'NORMAL' && originalStatus.value !== 'LOCKED') {
      ElMessage.error('只有锁定用户才能恢复为正常状态')
      return
    }
    if (formData.status === 'LOCKED' && (!isEdit.value || originalStatus.value !== 'LOCKED')) {
      ElMessage.error('锁定状态只能由登录安全策略触发')
      return
    }

    loading.value = true
    if (isEdit.value) {
      await userApi.update(formData)
      ElMessage.success('更新成功')
    } else {
      if (!formData.password) {
        ElMessage.error('密码不能为空')
        loading.value = false
        return
      }
      await userApi.add(formData)
      ElMessage.success('新增成功')
    }
    emit('success')
    handleClose()
  } catch (error) {
    console.error('保存失败:', error)
  } finally {
    loading.value = false
  }
}

const resetFields = () => {
  formData.id = ''
  formData.account = ''
  formData.username = ''
  formData.password = ''
  formData.phone = ''
  formData.role = ''
  formData.status = 'NORMAL'
  formData.expireDate = null
  originalStatus.value = 'NORMAL'
  confirmPassword.value = ''
  formRef.value?.resetFields()
}

// 获取选中的角色数组
const getSelectedRoles = () => {
  return formData.role ? formData.role.split(',').filter(Boolean) : []
}

// 角色选择变化
const handleRoleChange = (values: CheckboxGroupValueType) => {
  formData.role = values.map(value => String(value)).join(',')
}

defineExpose({
  resetFields,
})
</script>

<template>
  <el-dialog :model-value="modelValue" :title="isEdit ? '编辑用户' : '新增用户'" width="500px" :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" class="user-edit-form" v-loading="loading">
      <el-form-item label="账号" prop="account">
        <el-input v-model="formData.account" placeholder="请输入账号" :disabled="isEdit" clearable />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
        <el-input v-model="formData.password" :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'" show-password clearable />
      </el-form-item>
      <el-form-item label="确认密码" v-if="formData.password || !isEdit">
        <el-input v-model="confirmPassword" :placeholder="isEdit ? '请再次输入密码' : '请再次输入密码'" show-password clearable />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" clearable />
      </el-form-item>
      <el-form-item label="角色">
        <el-checkbox-group :model-value="getSelectedRoles()" class="role-checkbox-group" @update:model-value="handleRoleChange">
          <el-checkbox v-for="role in roles" :key="role.code" :value="role.code" :disabled="role.code === 'sharer'">
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态" class="status-select">
          <el-option v-for="item in statusOptions" :key="item.value" :value="item.value" :label="item.label" :disabled="item.disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="有效期">
        <el-date-picker
          v-model="formData.expireDate"
          type="datetime"
          placeholder="不设置表示永久有效"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="expire-date-picker"
          clearable
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="handleConfirm" :loading="loading">
        {{ isEdit ? '更新' : '新增' }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.user-edit-form {
  .role-checkbox-group {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .status-select {
    width: 100%;
  }

  .expire-date-picker {
    width: 100%;
  }
}
</style>
