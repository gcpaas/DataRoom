<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules, LoadFunction } from 'element-plus'
import type { DatasetEntity } from '../api'
import { datasetApi } from '../api'
import { dataSourceApi, type DataSourceColumnMeta, type DataSourceTableMeta } from '@/dataroom-packages/dataSource/api'
import { ElMessage } from 'element-plus'
import { Expand, Fold, Grid, Refresh } from '@element-plus/icons-vue'
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

interface DataSourceMetaTreeNode {
  id: string
  label: string
  nodeType: 'table' | 'column'
  tableName?: string
  type?: string
  comment?: string
  isLeaf?: boolean
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
const metadataPanelCollapsed = ref(false)
const metadataTreeLoading = ref(false)
const metadataTreeKey = ref(0)
const metadataTreeProps = {
  label: 'label',
  isLeaf: 'isLeaf'
}

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
const selectedDataSourceName = computed(() => {
  if (!formData.dataSourceCode) {
    return '未选择数据源'
  }
  return sqlDataSourceList.value.find(item => item.code === formData.dataSourceCode)?.name || formData.dataSourceCode
})
const metadataTreeEmptyText = computed(() => formData.dataSourceCode ? '暂无表信息' : '请选择数据源')

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

watch(
  () => formData.dataSourceCode,
  () => {
    metadataTreeKey.value += 1
  }
)

const toTableNode = (table: DataSourceTableMeta): DataSourceMetaTreeNode => ({
  id: `table:${table.name}`,
  label: table.name,
  nodeType: 'table',
  tableName: table.name,
  comment: table.comment,
  isLeaf: false
})

const toColumnNode = (tableName: string, column: DataSourceColumnMeta): DataSourceMetaTreeNode => ({
  id: `column:${tableName}:${column.name}`,
  label: column.name,
  nodeType: 'column',
  tableName,
  type: column.type,
  comment: column.comment,
  isLeaf: true
})

const reloadMetadataTree = () => {
  metadataTreeKey.value += 1
}

const loadMetadataTables = async (): Promise<DataSourceMetaTreeNode[]> => {
  const dataSourceCode = formData.dataSourceCode
  if (!dataSourceCode) {
    return []
  }
  metadataTreeLoading.value = true
  try {
    const tables = await dataSourceApi.listTables(dataSourceCode)
    if (dataSourceCode !== formData.dataSourceCode) {
      return []
    }
    return tables.map(toTableNode)
  } catch (error) {
    console.error('获取数据源表信息失败:', error)
    ElMessage.error('获取表信息失败')
    return []
  } finally {
    metadataTreeLoading.value = false
  }
}

const loadMetadataColumns = async (tableName: string): Promise<DataSourceMetaTreeNode[]> => {
  const dataSourceCode = formData.dataSourceCode
  if (!dataSourceCode) {
    return []
  }
  try {
    const columns = await dataSourceApi.listColumns(dataSourceCode, tableName)
    if (dataSourceCode !== formData.dataSourceCode) {
      return []
    }
    return columns.map(column => toColumnNode(tableName, column))
  } catch (error) {
    console.error('获取数据源字段信息失败:', error)
    ElMessage.error('获取字段信息失败')
    return []
  }
}

const loadMetadataTreeNode: LoadFunction = (node, resolve) => {
  void (async () => {
    if (node.level === 0) {
      resolve(await loadMetadataTables())
      return
    }
    const nodeData = node.data as DataSourceMetaTreeNode | undefined
    if (!nodeData || nodeData.nodeType !== 'table' || !nodeData.tableName) {
      resolve([])
      return
    }
    resolve(await loadMetadataColumns(nodeData.tableName))
  })()
}

const copyMetadataNodeName = async (data: DataSourceMetaTreeNode) => {
  const name = data.nodeType === 'table' ? data.tableName || data.label : data.label
  if (!name) {
    return
  }
  try {
    await navigator.clipboard.writeText(name)
  } catch (error) {
    console.error('复制表结构节点名称失败:', error)
    ElMessage.error('复制失败,请手动复制')
  }
}

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
    <template #before-panel>
      <aside v-if="!metadataPanelCollapsed" class="sql-metadata-panel">
        <div class="sql-metadata-panel__header">
          <div class="sql-metadata-panel__title">
            <span>表结构</span>
            <span class="sql-metadata-panel__source">{{ selectedDataSourceName }}</span>
          </div>
          <div class="sql-metadata-panel__actions">
            <el-button
              link
              :icon="Refresh"
              :disabled="!formData.dataSourceCode"
              @click="reloadMetadataTree"
            />
            <el-button link :icon="Fold" @click="metadataPanelCollapsed = true" />
          </div>
        </div>
        <el-scrollbar class="sql-metadata-panel__body">
          <el-tree
            class="sql-metadata-tree"
            :key="metadataTreeKey"
            lazy
            :load="loadMetadataTreeNode"
            :props="metadataTreeProps"
            node-key="id"
            highlight-current
            :expand-on-click-node="true"
            :empty-text="metadataTreeEmptyText"
            v-loading="metadataTreeLoading"
            @node-click="copyMetadataNodeName"
          >
            <template #default="{ data }">
              <div class="sql-metadata-node">
                <el-icon v-if="data.nodeType === 'table'" class="sql-metadata-node__icon">
                  <Grid />
                </el-icon>
                <span v-if="data.nodeType === 'table'" class="sql-metadata-node__label">{{ data.label }}</span>
                <span v-else class="sql-metadata-node__content">
                  <span class="sql-metadata-node__label">{{ data.label }}</span>
                  <span v-if="data.type" class="sql-metadata-node__type">{{ data.type }}</span>
                  <span v-if="data.comment?.trim()" class="sql-metadata-node__comment">{{ data.comment }}</span>
                </span>
              </div>
            </template>
          </el-tree>
        </el-scrollbar>
      </aside>
      <div v-else class="sql-metadata-collapsed">
        <el-button :icon="Expand" @click="metadataPanelCollapsed = false" />
      </div>
    </template>

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
            :value="item.code || ''"
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
.sql-metadata-panel {
  display: flex;
  flex-direction: column;
  flex: 0 0 260px;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 48px;
    padding: 8px 10px 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    box-sizing: border-box;
  }

  &__title {
    display: flex;
    flex-direction: column;
    min-width: 0;
    color: var(--el-text-color-primary);
    font-size: 14px;
    font-weight: 500;
    line-height: 1.57;
    letter-spacing: 0;
  }

  &__source {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__body {
    flex: 1;
    min-height: 0;
    padding: 8px;
    box-sizing: border-box;
  }
}

.sql-metadata-collapsed {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  flex: 0 0 40px;
  min-width: 0;
  min-height: 0;
  padding-top: 4px;
}

.sql-metadata-node {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  width: 100%;
  min-height: 26px;
  padding: 3px 0;
  box-sizing: border-box;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.57;
  letter-spacing: 0;

  &__icon {
    flex-shrink: 0;
    margin-top: 2px;
    color: var(--el-text-color-regular);
  }

  &__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-width: 0;
    gap: 2px;
  }

  &__label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__type {
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__comment {
    overflow: hidden;
    color: var(--el-text-color-placeholder);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.5;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.sql-metadata-tree {
  --el-tree-node-content-height: auto;
}

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
