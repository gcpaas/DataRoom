<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import type { DatasetEntity } from '../api'
import { datasetApi } from '../api'
import { ElMessage } from 'element-plus'
import { parseParams } from '@/dataroom-packages/_common/_utils'
import { Codemirror } from 'vue-codemirror'
import { sql } from '@codemirror/lang-sql'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import DatasetEditorLayout from './DatasetEditorLayout.vue'

interface DataSourceOption {
  code?: string
  name?: string
  dataSourceType?: string
}

const props = defineProps<{
  modelValue: DatasetEntity
  dataSourceList?: DataSourceOption[]
  onSave?: () => Promise<void>
  onClose?: () => void
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DatasetEntity]
}>()

const formRef = ref<FormInstance>()
const previewData = ref<unknown>([])

// CodeMirror 扩展配置：SQL语言 + Eclipse主题，与JSON数据集保持一致
const cmExtensions = [sql(), eclipse]
const sqlDataSourceTypes = new Set([
  'mysql',
  'postgresql',
  'oracle',
  'doris',
  'dameng',
  'db2',
  'gbase',
  'goldendb',
  'greatdb',
  'sqlserver',
  'mongodb',
  'kingbase',
  'clickhouse',
  'mariadb',
  'oceanbase',
  'hive',
  'tdengine',
  'druid',
  'excel'
])
const sqlDataSourceList = computed(() => (props.dataSourceList || []).filter(item => item.dataSourceType && sqlDataSourceTypes.has(item.dataSourceType)))

const formData = reactive<DatasetEntity>({
  name: '',
  datasetType: 'sql',
  parentCode: 'root',
  dataSourceCode: '',
  dataset: {
    datasetType: 'sql',
    sql: ''
  },
  inputList: [],
  outputList: []
})

// 监听外部传入的值变化
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      Object.assign(formData, newVal)
      if (!formData.dataset) {
        formData.dataset = {
          datasetType: 'sql',
          sql: ''
        }
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

const rules = reactive<FormRules<DatasetEntity>>({
  name: [{ required: true, message: '请输入数据集名称', trigger: 'blur' }],
  dataSourceCode: [{ required: true, message: '请选择SQL数据源', trigger: 'change' }]
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
 * 获取数据
 */
const getData = (): DatasetEntity => {
  return { ...formData }
}

/**
 * 测试数据集
 */
const test = async () => {
  try {
    // 验证必填字段
    if (!formData.dataSourceCode) {
      ElMessage.error('请先选择数据源')
      return
    }
    if (!formData.dataset || !('sql' in formData.dataset) || !formData.dataset.sql) {
      ElMessage.error('请先输入SQL语句')
      return
    }

    // 调用测试接口
    const res = await datasetApi.test({ dataset: formData })
    previewData.value = res.data
    if (res.outputList && res.outputList.length > 0) {
      // 保存现有的用户配置
      const existingConfig = new Map(
        (formData.outputList || []).map(item => [item.name, { type: item.type, desc: item.desc }])
      )
      // 更新字段列表，保留用户已配置的类型和描述
      formData.outputList = res.outputList.map(field => ({
        name: field.name,
        type: existingConfig.get(field.name)?.type || field.type || 'String',
        desc: existingConfig.get(field.name)?.desc || field.desc || ''
      }))
      ElMessage.success('测试成功，字段列表已更新')
    } else {
      ElMessage.warning('未获取到字段信息')
    }
  } catch (error) {
    console.error('测试数据集失败:', error)
    ElMessage.error('测试失败')
  }
}

/**
 * 解析SQL中的入参
 * 匹配 #{paramName} 格式
 */
const parseInputParams = () => {
  if (!formData.dataset || !('sql' in formData.dataset) || !formData.dataset.sql) {
    ElMessage.warning('请先输入SQL语句')
    return
  }

  const sql = formData.dataset.sql
  const paramNames = parseParams(sql)

  if (paramNames.length === 0) {
    ElMessage.info('未发现任何参数')
    return
  }

  // 保存现有的参数配置
  const existingParams = new Map(
    (formData.inputList || []).map(item => [item.name, item])
  )

  // 生成新的参数列表，保留已存在的配置
  formData.inputList = paramNames.map(name => {
    const existing = existingParams.get(name)
    return existing || {
      name,
      type: 'String',
      required: false,
      defaultVal: '',
      desc: ''
    }
  })

  ElMessage.success(`成功解析${paramNames.length}个参数`)
}

/**
 * 格式化SQL
 */
const formatSql = async () => {
  try {
    if (formData.dataset && 'sql' in formData.dataset && formData.dataset.sql) {
      const { format: formatSqlText } = await import('sql-formatter')
      formData.dataset.sql = formatSqlText(formData.dataset.sql, {
        language: 'sql',
        tabWidth: 2,
        linesBetweenQueries: 1,
        paramTypes: {
          custom: [{ regex: '#\\{[\\w.]+\\}' }]
        }
      })
      ElMessage.success('格式化成功')
    }
  } catch (error) {
    console.error('格式化SQL失败:', error)
    ElMessage.error('SQL格式错误，无法格式化')
  }
}

/**
 * 测试并保存
 */
const testAndSave = async () => {
  try {
    // 先验证表单
    await validate()

    // 先测试
    await test()

    // 然后保存
    if (props.onSave) {
      await props.onSave()
    }
  } catch (error) {
    console.error('测试并保存失败:', error)
  }
}

defineExpose({
  validate,
  resetFields,
  getData,
  test,
  testAndSave
})
</script>

<template>
  <DatasetEditorLayout :preview-data="previewData">
    <el-form class="dataset-editor-form" ref="formRef" :model="formData" :rules="rules" label-width="100px">
      <el-form-item label="数据集名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入数据集名称" clearable />
      </el-form-item>
      <el-form-item label="数据源" prop="dataSourceCode">
        <el-select v-model="formData.dataSourceCode" placeholder="请选择数据源" clearable>
          <el-option
            v-for="item in sqlDataSourceList"
            :key="item.code"
            :label="item.name"
            :value="item.code"
          >
            <span class="datasource-option">
              <span class="datasource-option__name">{{ item.name }}</span>
              <span class="datasource-option__type">{{ item.dataSourceType }}</span>
            </span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SQL语句">
        <div class="sql-editor-shell">
          <div
            v-if="formData.dataset && 'sql' in formData.dataset"
            class="codemirror-wrapper"
          >
            <Codemirror
              v-model="formData.dataset.sql"
              :extensions="cmExtensions"
              placeholder="请输入SQL语句，例如：SELECT * FROM table WHERE id = #{id}"
            />
          </div>
          <div class="sql-format-action">
            <el-button size="small" @click="formatSql">格式化</el-button>
          </div>
        </div>
      </el-form-item>
      <el-form-item label="入参配置">
        <div class="dataset-form-section">
          <el-button size="small" @click="parseInputParams">
            入参解析
          </el-button>
          <el-table class="dataset-form-table dataset-form-table--spaced" :data="formData.inputList" border>
            <el-table-column label="参数名" width="120">
              <template #default="{ row }">
                <span>{{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="类型" width="100">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small" placeholder="类型">
                  <el-option label="String" value="String" />
                  <el-option label="Number" value="Number" />
                  <el-option label="Boolean" value="Boolean" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="必填" width="80">
              <template #default="{ row }">
                <el-checkbox v-model="row.required" />
              </template>
            </el-table-column>
            <el-table-column label="默认值" width="120">
              <template #default="{ row }">
                <el-input v-model="row.defaultVal" size="small" placeholder="默认值" />
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template #default="{ row }">
                <el-input v-model="row.desc" size="small" placeholder="描述" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  size="small"
                  link
                  @click="formData.inputList?.splice($index, 1)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form-item>
      <el-form-item label="字段列表">
        <div class="dataset-form-section">
          <el-table class="dataset-form-table" :data="formData.outputList" border>
            <el-table-column prop="name" label="字段名" width="200" />
            <el-table-column label="类型" width="150">
              <template #default="{ row }">
                <el-select v-model="row.type" size="small" placeholder="类型">
                  <el-option label="String" value="String" />
                  <el-option label="Number" value="Number" />
                  <el-option label="Boolean" value="Boolean" />
                  <el-option label="Object" value="Object" />
                  <el-option label="Array" value="Array" />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="描述">
              <template #default="{ row }">
                <el-input v-model="row.desc" size="small" placeholder="描述" />
              </template>
            </el-table-column>
          </el-table>
          <el-empty
            v-if="!formData.outputList || formData.outputList.length === 0"
            description="请点击测试按钮获取字段列表"
            :image-size="100"
          />
        </div>
      </el-form-item>
    </el-form>
  </DatasetEditorLayout>
</template>

<style scoped lang="scss">
.dataset-editor-form {
  min-width: 0;
}

.dataset-form-section {
  width: 100%;
}

.dataset-form-table {
  width: 100%;
  font-feature-settings: 'tnum';
}

.dataset-form-table--spaced {
  margin-top: 8px;
}

.sql-editor-shell {
  position: relative;
  width: 100%;
  overflow: hidden;
}

.sql-format-action {
  position: absolute;
  right: 12px;
  bottom: 16px;
  z-index: 1;
}

.codemirror-wrapper {
  width: 100%;
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--el-color-primary);
  }

  :deep(.cm-editor) {
    height: 360px;
    max-width: 100%;
    font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
    font-size: 13px;

    .cm-scroller {
      overflow: auto;
    }

    .cm-content {
      max-width: 100%;
    }

    .cm-cursor,
    .cm-dropCursor {
      border-left-color: var(--el-text-color-primary);
    }

    .cm-gutters {
      background-color: var(--el-fill-color-extra-light);
      border-right: 1px solid var(--el-border-color-lighter);
      color: var(--el-text-color-secondary);
    }

    .cm-activeLineGutter {
      color: var(--el-text-color-primary);
    }
  }
}

.datasource-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &__name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 14px;
    font-weight: 400;
    color: var(--el-text-color-primary);
  }

  &__type {
    flex-shrink: 0;
    margin-left: 12px;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
  }
}
</style>
