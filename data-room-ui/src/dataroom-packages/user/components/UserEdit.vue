<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserDTO, Role, UserStatus } from '../api'
import { userApi } from '../api'
import { ElMessage } from 'element-plus'

const props = defineProps<{
  modelValue: boolean
  userId?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'success': []
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
  status: 'NORMAL' as UserStatus
})

const isEdit = ref(false)

const statusOptions = [
  { value: 'NORMAL', label: '正常' },
  { value: 'DISABLED', label: '禁用' },
  { value: 'PASSWORD_EXPIRED', label: '密码过期' }
]

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
        loading.value = true
        try {
          const user = await userApi.detail(props.userId)
          Object.assign(formData, user)
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
  }
)

const rules = reactive<FormRules<UserDTO>>({
  account: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const handleConfirm = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    if (isEdit.value) {
      await userApi.update(formData)
      ElMessage.success('更新成功')
    } else {
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
  formRef.value?.resetFields()
}

// 获取选中的角色数组
const getSelectedRoles = () => {
  return formData.role ? formData.role.split(',').filter(Boolean) : []
}

// 角色选择变化
const handleRoleChange = (values: string[]) => {
  formData.role = values.join(',')
}

defineExpose({
  resetFields
})
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    :title="isEdit ? '编辑用户' : '新增用户'"
    width="500px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      v-loading="loading"
    >
      <el-form-item label="账号" prop="account">
        <el-input
          v-model="formData.account"
          placeholder="请输入账号"
          :disabled="isEdit"
          clearable
        />
      </el-form-item>
      <el-form-item label="用户名" prop="username">
        <el-input v-model="formData.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="密码" :prop="isEdit ? '' : 'password'">
        <el-input
          v-model="formData.password"
          :placeholder="isEdit ? '留空则不修改密码' : '请输入密码'"
          show-password
          clearable
        />
      </el-form-item>
      <el-form-item label="联系电话">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" clearable />
      </el-form-item>
      <el-form-item label="角色">
        <el-checkbox-group
          :model-value="getSelectedRoles()"
          @update:model-value="handleRoleChange"
        >
          <el-checkbox
            v-for="role in roles"
            :key="role.code"
            :value="role.code"
            :disabled="role.code === 'sharer'"
          >
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择状态">
          <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :value="item.value"
            :label="item.label"
          />
        </el-select>
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
.el-dialog {
  border-radius: 8px;

  :deep(.el-dialog__header) {
    padding: 20px 24px 16px;
    border-bottom: 1px solid #e5e6eb;
    margin-right: 0;

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
  }

  :deep(.el-dialog__body) {
    padding: 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #e5e6eb;
  }
}

.el-form {
  :deep(.el-form-item__label) {
    font-size: 14px;
    font-weight: 500;
    color: #4e5969;
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px #e5e6eb inset;

    &:focus-within {
      box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
    }
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: #f7f8fa;
    box-shadow: none;
  }

  :deep(.el-select) {
    width: 100%;

    .el-input__wrapper {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #e5e6eb inset;

      &:focus-within {
        box-shadow: 0 0 0 1px #3478f6 inset, 0 0 0 2px #fff, 0 0 0 4px #3478f6;
      }
    }
  }

  :deep(.el-checkbox-group) {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .el-checkbox {
      margin-right: 0;

      .el-checkbox__label {
        font-size: 14px;
        color: #1d2129;
      }
    }
  }
}

.el-button {
  border-radius: 6px;
  font-weight: 500;
}

.el-button--primary {
  background-color: #3478f6;
  border-color: #3478f6;

  &:hover {
    background-color: #2563eb;
    border-color: #2563eb;
  }

  &:focus {
    background-color: #2563eb;
    border-color: #2563eb;
  }
}

.el-button--default {
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08);
  border: none;

  &:hover {
    box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.04);
  }
}
</style>