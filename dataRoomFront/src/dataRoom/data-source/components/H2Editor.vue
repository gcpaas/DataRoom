<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DataSourceEntity } from '../api'
import { encryptByRsa } from '@/dataRoom/utils/encrypt'

const props = defineProps<{
  modelValue: DataSourceEntity
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DataSourceEntity]
}>()

const formRef = ref<FormInstance>()

const formData = reactive<DataSourceEntity>({
  name: '',
  dataSourceType: 'h2',
  dataSource: {
    dataSourceType: 'h2',
    driverName: 'org.h2.Driver',
    username: '',
    password: '',
    url: '',
  },
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      if (!formData.dataSource.driverName) {
        formData.dataSource.driverName = 'org.h2.Driver'
      }
    }
  },
  { immediate: true, deep: true },
)

watch(
  formData,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true },
)

const rules = reactive<FormRules<DataSourceEntity>>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  'dataSource.driverName': [{ required: true, message: '请输入驱动名称', trigger: 'blur' }],
  'dataSource.username': [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  'dataSource.url': [{ required: true, message: '请输入连接地址', trigger: 'blur' }],
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const getEncryptedData = (): DataSourceEntity => {
  const data = { ...formData }
  if (data.dataSource?.password) {
    data.dataSource = {
      ...data.dataSource,
      password: encryptByRsa(data.dataSource.password),
    }
  }
  return data
}

defineExpose({
  validate,
  resetFields,
  getEncryptedData,
})
</script>

<template>
  <el-form class="data-source-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="100px">
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
      <el-input v-model="formData.dataSource.password" type="password" placeholder="请输入密码" show-password clearable />
    </el-form-item>
    <el-form-item label="连接地址" prop="dataSource.url">
      <el-input v-model="formData.dataSource.url" type="textarea" :rows="3" placeholder="jdbc:h2:file:./db/dataroom" clearable />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.data-source-editor-form {
  padding: 20px 24px;
}
</style>
