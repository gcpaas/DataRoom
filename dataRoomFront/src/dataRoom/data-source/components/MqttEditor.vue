<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import type { DataSourceEntity, MqttDataSource } from '../api'
import { dataSourceApi } from '../api'
import { encryptByRsa } from '@/dataRoom/utils/encrypt'

const props = defineProps<{
  modelValue: DataSourceEntity
}>()

const formRef = ref<FormInstance>()
const testing = ref(false)
const testResult = ref<{ success: boolean; message: string } | null>(null)

const defaultMqttDataSource = (): MqttDataSource => ({
  dataSourceType: 'mqtt',
  protocol: 'tcp',
  host: '',
  port: 1883,
  clientId: '',
  authMode: 'none',
  username: '',
  password: '',
  defaultTopic: '',
  connectionTimeoutSeconds: 10,
})

const formData = reactive<DataSourceEntity>({
  name: '',
  dataSourceType: 'mqtt',
  dataSource: defaultMqttDataSource(),
})

const mqttConfig = computed(() => formData.dataSource as MqttDataSource)
const authMode = computed(() => mqttConfig.value.authMode || 'none')
const isEdit = computed(() => !!props.modelValue?.code)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      formData.dataSource = {
        ...defaultMqttDataSource(),
        ...newVal.dataSource,
        dataSourceType: 'mqtt',
      }
    }
  },
  { immediate: true },
)

const defaultPorts: Record<string, number> = { tcp: 1883, tls: 8883, ws: 8083, wss: 8084 }

watch(
  () => mqttConfig.value.protocol,
  (newProtocol) => {
    if (newProtocol && defaultPorts[newProtocol]) {
      mqttConfig.value.port = defaultPorts[newProtocol]
    }
  },
)

const requireWhenAuthMode = (matchedMode: string, message: string) => {
  return (_rule: unknown, value: string, callback: (error?: Error) => void) => {
    if (authMode.value === matchedMode && !value && !isEdit.value) {
      callback(new Error(message))
      return
    }
    callback()
  }
}

const rules = reactive<FormRules<DataSourceEntity>>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  'dataSource.host': [{ required: true, message: '请输入服务地址', trigger: 'blur' }],
  'dataSource.port': [{ required: true, message: '请输入端口', trigger: 'blur' }],
  'dataSource.authMode': [{ required: true, message: '请选择认证方式', trigger: 'change' }],
  'dataSource.username': [
    { validator: requireWhenAuthMode('usernamePassword', '请输入用户名'), trigger: 'blur' },
  ],
  'dataSource.password': [
    { validator: requireWhenAuthMode('usernamePassword', '请输入密码'), trigger: 'blur' },
  ],
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const testConnection = async () => {
  testing.value = true
  testResult.value = null
  try {
    const payload = getEncryptedData()
    const result = await dataSourceApi.test(payload)
    testResult.value = { success: result.success, message: result.message }
    if (result.success) {
      ElMessage.success('连接测试成功')
    } else {
      ElMessage.warning(result.message)
    }
  } catch {
    ElMessage.error('连接测试失败')
  } finally {
    testing.value = false
  }
}

const getEncryptedData = (): DataSourceEntity => {
  const dataSource = { ...mqttConfig.value }
  if (dataSource.password && dataSource.password !== '******') {
    dataSource.password = encryptByRsa(dataSource.password)
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
  testConnection,
})
</script>

<template>
  <el-form class="data-source-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="110px">
    <el-form-item label="数据源名称" prop="name">
      <el-input v-model="formData.name" placeholder="请输入数据源名称" clearable />
    </el-form-item>
    <el-form-item label="连接协议" prop="dataSource.protocol">
      <el-select v-model="mqttConfig.protocol" placeholder="请选择连接协议">
        <el-option label="TCP (明文)" value="tcp" />
        <el-option label="TCP+TLS (加密)" value="tls" />
        <el-option label="WebSocket" value="ws" />
        <el-option label="WebSocket+TLS" value="wss" />
      </el-select>
    </el-form-item>
    <el-form-item v-if="mqttConfig.protocol === 'tls' || mqttConfig.protocol === 'wss'" label="CA证书" prop="dataSource.caCertificate">
      <el-input
        v-model="mqttConfig.caCertificate"
        type="textarea"
        :rows="4"
        placeholder="可选，留空则使用JVM默认信任库；自签名证书需粘贴CA证书内容"
      />
    </el-form-item>
    <el-form-item v-if="mqttConfig.protocol === 'ws' || mqttConfig.protocol === 'wss'" label="访问路径" prop="dataSource.path">
      <el-input v-model="mqttConfig.path" placeholder="/mqtt" clearable />
    </el-form-item>
    <el-form-item label="服务地址" prop="dataSource.host">
      <el-input v-model="mqttConfig.host" placeholder="broker.example.com" clearable />
    </el-form-item>
    <el-form-item label="端口" prop="dataSource.port">
      <el-input-number v-model="mqttConfig.port" :min="1" :max="65535" />
    </el-form-item>
    <el-form-item label="Client ID" prop="dataSource.clientId">
      <el-input v-model="mqttConfig.clientId" placeholder="可选，留空自动生成" clearable />
    </el-form-item>
    <el-form-item label="认证方式" prop="dataSource.authMode">
      <el-select v-model="mqttConfig.authMode" placeholder="请选择认证方式">
        <el-option label="无认证" value="none" />
        <el-option label="账号密码" value="usernamePassword" />
      </el-select>
    </el-form-item>
    <template v-if="authMode === 'usernamePassword'">
      <el-form-item label="用户名" prop="dataSource.username">
        <el-input v-model="mqttConfig.username" placeholder="请输入用户名" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="dataSource.password">
        <el-input
          v-model="mqttConfig.password"
          type="password"
          :placeholder="isEdit ? '留空表示不更新' : '请输入密码'"
          show-password
          clearable
        />
      </el-form-item>
    </template>
    <el-form-item label="默认主题" prop="dataSource.defaultTopic">
      <el-input v-model="mqttConfig.defaultTopic" placeholder="factory/line-1/metrics" clearable />
    </el-form-item>
    <el-form-item label="连接超时(秒)" prop="dataSource.connectionTimeoutSeconds">
      <el-input-number v-model="mqttConfig.connectionTimeoutSeconds" :min="1" :max="60" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" :loading="testing" @click="testConnection">连接测试</el-button>
      <span v-if="testResult" :style="{ marginLeft: '12px', color: testResult.success ? 'var(--el-color-success)' : 'var(--el-color-danger)' }">
        {{ testResult.message }}
      </span>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.data-source-editor-form {
  padding: 20px 24px;
}
</style>
