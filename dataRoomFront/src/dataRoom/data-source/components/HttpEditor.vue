<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DataSourceEntity, HttpDataSource, KeyVal } from '../api'
import { encryptByRsa } from '@/dataRoom/utils/encrypt'

const props = defineProps<{
  modelValue: DataSourceEntity
}>()

const formRef = ref<FormInstance>()

const defaultHttpDataSource = (): HttpDataSource => ({
  dataSourceType: 'http',
  baseUrl: '',
  headerList: [],
})

const formData = reactive<DataSourceEntity>({
  name: '',
  dataSourceType: 'http',
  dataSource: defaultHttpDataSource(),
})

const httpConfig = computed(() => formData.dataSource as HttpDataSource)

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      formData.dataSource = {
        ...defaultHttpDataSource(),
        ...newVal.dataSource,
        dataSourceType: 'http',
        headerList: [...(newVal.dataSource?.headerList || [])],
      }
    }
  },
  { immediate: true },
)

const rules = reactive<FormRules<DataSourceEntity>>({
  name: [{ required: true, message: '请输入数据源名称', trigger: 'blur' }],
  'dataSource.baseUrl': [{ required: true, message: '请输入访问地址', trigger: 'blur' }],
})

const validate = () => {
  return formRef.value?.validate()
}

const resetFields = () => {
  formRef.value?.resetFields()
}

const addHeader = () => {
  if (!httpConfig.value.headerList) {
    httpConfig.value.headerList = []
  }
  httpConfig.value.headerList.push({ key: '', val: '', encrypted: false })
}

const removeHeader = (index: number) => {
  httpConfig.value.headerList?.splice(index, 1)
}

const encryptHeader = (header: KeyVal): KeyVal => {
  if (header.encrypted && header.val && header.val !== '******') {
    return {
      ...header,
      val: encryptByRsa(header.val),
    }
  }
  return { ...header }
}

const getEncryptedData = (): DataSourceEntity => {
  const dataSource: HttpDataSource = {
    ...httpConfig.value,
    headerList: (httpConfig.value.headerList || []).map(encryptHeader),
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
    <el-form-item label="访问地址" prop="dataSource.baseUrl">
      <el-input v-model="httpConfig.baseUrl" placeholder="https://api.example.com/base" clearable />
    </el-form-item>
    <el-form-item label="请求头">
      <div class="http-header-section">
        <el-button size="small" @click="addHeader">添加请求头</el-button>
        <el-table :data="httpConfig.headerList" border class="http-header-table">
          <el-table-column label="Key" width="160">
            <template #default="{ row }">
              <el-input v-model="row.key" size="small" placeholder="Key" />
            </template>
          </el-table-column>
          <el-table-column label="Value">
            <template #default="{ row }">
              <el-input v-model="row.val" size="small" placeholder="Value" />
            </template>
          </el-table-column>
          <el-table-column label="加密" width="80">
            <template #default="{ row }">
              <el-checkbox v-model="row.encrypted" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80" fixed="right">
            <template #default="{ $index }">
              <el-button type="danger" size="small" link @click="removeHeader($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-form-item>
  </el-form>
</template>

<style scoped lang="scss">
.data-source-editor-form {
  padding: 20px 24px;
}

.http-header-section {
  width: 100%;
}

.http-header-table {
  margin-top: 8px;
}
</style>
