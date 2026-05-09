<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DataSourceEntity } from '../api'
import { encryptByRsa } from '@/dataroom-packages/_common/_encrypt'

const props = defineProps<{
  modelValue: DataSourceEntity
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataSourceEntity]
}>()

const formRef = ref<FormInstance>()

const formData = reactive<DataSourceEntity>({
  name: '',
  dataSourceType: 'doris',
  dataSource: {
    dataSourceType: 'doris',
    driverName: 'com.mysql.cj.jdbc.Driver',
    username: '',
    password: '',
    url: ''
  }
})

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      if (!formData.dataSource.driverName) {
        formData.dataSource.driverName = 'com.mysql.cj.jdbc.Driver'
      }
    }
  },
  { immediate: true, deep: true }
)

// 监听内部值变化，触发更新
watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)

const rules = reactive<FormRules<DataSourceEntity>>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  'dataSource.driverName': [{ required: true, message: '请输入驱动名称', trigger: 'blur' }],
  'dataSource.username': [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  'dataSource.password': [{ required: true, message: '请输入密码', trigger: 'blur' }],
  'dataSource.url': [{ required: true, message: '请输入连接地址', trigger: 'blur' }]
})

/**
 * 表单验证
 */
const validate = () => {
  return formRef.value?.validate()
}

/**
 * 重置表单
 */
const resetFields = () => {
  formRef.value?.resetFields()
}

/**
 * 获取加密后的数据源信息（用于保存）
 */
const getEncryptedData = (): DataSourceEntity => {
  const data = { ...formData }
  // 只有当密码字段有值时才加密
  if (data.dataSource?.password) {
    data.dataSource = {
      ...data.dataSource,
      password: encryptByRsa(data.dataSource.password)
    }
  }
  return data
}

defineExpose({
  validate,
  resetFields,
  getEncryptedData
})
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="数据源名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入数据源名称" clearable />
    </el-form-item>
    <el-form-item label="驱动名称" prop="dataSource.driverName">
      <el-input v-model="formData.dataSource.driverName" placeholder="请输入驱动名称" clearable />
    </el-form-item>
    <el-form-item label="用户名" prop="dataSource.username">
      <el-input v-model="formData.dataSource.username" placeholder="请输入用户名" clearable />
    </el-form-item>
    <el-form-item label="密码" prop="dataSource.password">
      <el-input
        v-model="formData.dataSource.password"
        type="password"
        placeholder="请输入密码"
        show-password
        clearable
      />
    </el-form-item>
    <el-form-item label="连接地址" prop="dataSource.url">
      <el-input
        v-model="formData.dataSource.url"
        type="textarea"
        :rows="3"
        placeholder="jdbc:mysql://localhost:9030/database?useUnicode=true&characterEncoding=utf8"
        clearable
      />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
:deep(.el-form) {
  padding: var(--space-5) var(--space-6);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .el-form-item__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--dr-gray-700);
  }

  .el-input__wrapper,
  .el-textarea__inner {
    border-radius: var(--radius-md);
    box-shadow: none;
    border: 1px solid var(--dr-gray-200);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--dr-gray-400);
    }

    &.is-focus,
    &:focus {
      border-color: var(--dr-blue);
      box-shadow: var(--dr-shadow-focus);
    }
  }

  .el-textarea__inner {
    &:focus {
      border-color: var(--dr-blue);
      box-shadow: var(--dr-shadow-focus);
    }
  }

  .el-input__inner,
  .el-textarea__inner {
    font-size: 14px;
    font-weight: 400;
    color: var(--dr-gray-900);

    &::placeholder {
      color: var(--dr-gray-500);
    }
  }
}
</style>
