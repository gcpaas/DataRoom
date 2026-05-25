<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DataSourceEntity, EsDataSource } from '../api'
import { encryptByRsa } from '@/dataroom-packages/_common/_encrypt'

const props = defineProps<{
  modelValue: DataSourceEntity
}>()

const formRef = ref<FormInstance>()

const defaultEsDataSource = (): EsDataSource => ({
  dataSourceType: 'es',
  baseUrl: '',
  authType: 'none',
  username: '',
  password: '',
  bearerToken: '',
  apiKey: '',
})

const formData = reactive<DataSourceEntity>({
  name: '',
  dataSourceType: 'es',
  dataSource: defaultEsDataSource(),
})

const esConfig = computed(() => formData.dataSource as EsDataSource)
const authType = computed(() => esConfig.value.authType || 'none')

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      formData.dataSource = {
        ...defaultEsDataSource(),
        ...newVal.dataSource,
        dataSourceType: 'es',
      }
    }
  },
  { immediate: true },
)

const requireWhenAuthType = (matchedAuthType: EsDataSource['authType'], message: string) => {
  return (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (authType.value === matchedAuthType && !value) {
      callback(new Error(message))
      return
    }
    callback()
  }
}

const rules = reactive<FormRules<DataSourceEntity>>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  'dataSource.baseUrl': [{ required: true, message: '请输入基础地址', trigger: 'blur' }],
  'dataSource.authType': [{ required: true, message: '请选择认证方式', trigger: 'change' }],
  'dataSource.username': [{ validator: requireWhenAuthType('basic', '请输入用户名'), trigger: 'blur' }],
  'dataSource.password': [{ validator: requireWhenAuthType('basic', '请输入密码'), trigger: 'blur' }],
  'dataSource.bearerToken': [{ validator: requireWhenAuthType('bearer', '请输入Bearer Token'), trigger: 'blur' }],
  'dataSource.apiKey': [{ validator: requireWhenAuthType('apiKey', '请输入API Key'), trigger: 'blur' }],
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const getEncryptedData = (): DataSourceEntity => {
  const dataSource = {
    ...esConfig.value,
  }
  if (dataSource.password) {
    dataSource.password = encryptByRsa(dataSource.password)
  }
  if (dataSource.bearerToken) {
    dataSource.bearerToken = encryptByRsa(dataSource.bearerToken)
  }
  if (dataSource.apiKey) {
    dataSource.apiKey = encryptByRsa(dataSource.apiKey)
  }
  return {
    ...formData,
    dataSource,
  }
}

defineExpose({
  validate,
  resetFields,
  getEncryptedData,
})
</script>

<template>
  <el-form class="data-source-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="110px">
    <el-form-item label="数据源名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入数据源名称" clearable />
    </el-form-item>
    <el-form-item label="基础地址" prop="dataSource.baseUrl">
      <el-input v-model="esConfig.baseUrl" placeholder="http://localhost:9200" clearable />
    </el-form-item>
    <el-form-item label="认证方式" prop="dataSource.authType">
      <el-select v-model="esConfig.authType" placeholder="请选择认证方式">
        <el-option label="无认证" value="none" />
        <el-option label="Basic Auth" value="basic" />
        <el-option label="Bearer Token" value="bearer" />
        <el-option label="API Key" value="apiKey" />
      </el-select>
    </el-form-item>
    <template v-if="authType === 'basic'">
      <el-form-item label="用户名" prop="dataSource.username">
        <el-input v-model="esConfig.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="dataSource.password">
        <el-input v-model="esConfig.password" type="password" placeholder="请输入密码" show-password clearable />
      </el-form-item>
    </template>
    <el-form-item v-if="authType === 'bearer'" label="Token" prop="dataSource.bearerToken">
      <el-input v-model="esConfig.bearerToken" type="password" placeholder="请输入Bearer Token" show-password clearable />
    </el-form-item>
    <el-form-item v-if="authType === 'apiKey'" label="API Key" prop="dataSource.apiKey">
      <el-input v-model="esConfig.apiKey" type="password" placeholder="请输入API Key" show-password clearable />
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.data-source-editor-form {
  padding: 20px 24px;
}
</style>
