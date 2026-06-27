<!-- 全局变量 -->
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { Search } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { Codemirror } from 'vue-codemirror'
import { javascript } from '@codemirror/lang-javascript'
import { eclipse } from '@uiw/codemirror-theme-eclipse'
import {
  GLOBAL_VARIABLE_SOURCE_OPTIONS,
  asCodeGlobalVariableConfig,
  asStaticGlobalVariableConfig,
  asUrlGlobalVariableConfig,
  createDefaultGlobalVariableConfig,
  getGlobalVariableSourceLabel,
  type GlobalVariable,
  type GlobalVariableSource,
  type StaticGlobalVariableConfig,
} from '@/dataRoom/designer/types/GlobalVariable.ts'

const props = defineProps<{
  globalVariable: GlobalVariable[]
}>()
const emit = defineEmits(['close'])

const globalVariableVisible = ref(true)
const activeGlobalVariable = ref<GlobalVariable>()
const jsEditorExtensions = [javascript(), eclipse]

const staticConfig = computed(() => {
  return activeGlobalVariable.value?.source === 'static' ? asStaticGlobalVariableConfig(activeGlobalVariable.value) : undefined
})
const urlConfig = computed(() => {
  return activeGlobalVariable.value?.source === 'url' ? asUrlGlobalVariableConfig(activeGlobalVariable.value) : undefined
})
const codeConfig = computed(() => {
  return activeGlobalVariable.value?.source === 'code' ? asCodeGlobalVariableConfig(activeGlobalVariable.value) : undefined
})

/**
 * 默认激活第一个
 */
watch(
  () => props.globalVariable,
  (newVal) => {
    if (newVal && newVal.length > 0 && !activeGlobalVariable.value) {
      activeGlobalVariable.value = newVal[0]
    }
  },
  { immediate: true },
)
const onClose = () => {
  globalVariableVisible.value = false
}
const searchName = ref('')

/**
 * 根据搜索名称过滤变量列表
 */
const filteredVariables = computed(() => {
  if (!searchName.value) {
    return props.globalVariable
  }
  const keyword = searchName.value.toLowerCase()
  return props.globalVariable.filter((item) => item.name.toLowerCase().includes(keyword) || item.remark?.toLowerCase().includes(keyword))
})

/**
 * 生成变量名称：var_ + 5位随机小写字母和数字
 */
const generateVarName = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let suffix = ''
  for (let i = 0; i < 5; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `var_${suffix}`
}

/**
 * 新增变量
 */
const onAdd = () => {
  const inst: GlobalVariable = {
    id: uuidv4(),
    name: generateVarName(),
    remark: '',
    source: 'static',
    config: createDefaultGlobalVariableConfig('static') as StaticGlobalVariableConfig,
  }
  // eslint-disable-next-line vue/no-mutating-props -- 全局变量弹窗实时编辑父级页面配置数组
  props.globalVariable.push(inst)
  activeGlobalVariable.value = inst
}
const onSourceChange = (source: GlobalVariableSource) => {
  if (!activeGlobalVariable.value) {
    return
  }
  activeGlobalVariable.value.source = source
  activeGlobalVariable.value.config = createDefaultGlobalVariableConfig(source)
}
/**
 * 删除变量
 * @param variable
 */
const onDelete = (variable: GlobalVariable) => {
  ElMessageBox.confirm(`确定删除${variable.name}变量吗?`, '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 根据id判断用filter过滤
    const index = props.globalVariable.findIndex((item) => item.id === variable.id)
    if (index > -1) {
      // eslint-disable-next-line vue/no-mutating-props -- 全局变量弹窗实时编辑父级页面配置数组
      props.globalVariable.splice(index, 1)
    }
    if (props.globalVariable.length == 0) {
      activeGlobalVariable.value = undefined
      return
    }
    if (activeGlobalVariable.value?.id === variable.id) {
      // 获取第一个
      activeGlobalVariable.value = props.globalVariable[0]
    }
  })
}
</script>
<template>
  <el-dialog v-model="globalVariableVisible" title="全局变量" width="80%" @closed="emit('close')">
    <div class="global-variable-wrapper">
      <div class="variable-wrapper">
        <div class="search">
          <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索"></el-input>
          <el-button type="primary" @click="onAdd">新增</el-button>
        </div>
        <el-scrollbar>
          <div :class="{ variable: true, active: item.id === activeGlobalVariable?.id }" v-for="item in filteredVariables" :key="item.id" @click="activeGlobalVariable = item">
            <div class="name">{{ item.name }}</div>
            <div class="meta">
              <el-tag size="small">{{ getGlobalVariableSourceLabel(item.source) }}</el-tag>
              <span class="remark" v-if="item.remark">{{ item.remark }}</span>
            </div>
            <span class="delete" @click.stop="onDelete(item)">删除</span>
          </div>
        </el-scrollbar>
      </div>
      <div class="variable-form-wrapper">
        <el-form ref="form" :model="activeGlobalVariable" label-width="100px" v-if="activeGlobalVariable">
          <el-form-item label="变量名称">
            <el-input v-model="activeGlobalVariable.name"></el-input>
          </el-form-item>
          <el-form-item label="来源">
            <el-select :model-value="activeGlobalVariable.source" placeholder="请选择" @change="onSourceChange">
              <el-option
                v-for="item in GLOBAL_VARIABLE_SOURCE_OPTIONS"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>
          <template v-if="staticConfig">
            <el-form-item label="变量值">
              <el-input v-model="staticConfig.value"></el-input>
            </el-form-item>
          </template>
          <template v-if="urlConfig">
            <el-form-item label="URL参数名称">
              <el-input v-model="urlConfig.paramName"></el-input>
            </el-form-item>
            <el-form-item label="默认值">
              <el-input v-model="urlConfig.defaultValue"></el-input>
            </el-form-item>
          </template>
          <el-form-item label="JS脚本" v-if="codeConfig">
            <div class="script-editor">
              <Codemirror
                v-model="codeConfig.code"
                :extensions="jsEditorExtensions"
                :indent-with-tab="true"
                :tab-size="2"
              />
            </div>
          </el-form-item>
          <el-form-item label="变量描述">
            <el-input v-model="activeGlobalVariable.remark" type="textarea"></el-input>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.global-variable-wrapper {
  display: grid;
  grid-template-columns: 400px auto;
  background-color: var(--el-fill-color-light);
  gap: 0;
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  & .variable-wrapper {
    height: calc(70vh - 120px);
    background: var(--el-fill-color-blank);
    padding: 16px;
    margin: 16px;
    border-radius: 8px 0 0 8px;
    border: 1px solid var(--el-border-color);

    & .search {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    & .variable {
      margin: 8px 0;
      padding: 12px;
      position: relative;
      border-radius: 6px;
      border: 1px solid var(--el-border-color);
      transition:
        background-color 0.2s ease,
        border-color 0.2s ease;

      & .name {
        font-size: 14px;
        color: var(--el-text-color-primary);
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }

      & .meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        min-width: 0;
      }

      & .remark {
        flex: 1;
        min-width: 0;
        font-size: 12px;
        color: var(--el-text-color-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & .delete {
        position: absolute;
        right: 8px;
        top: 8px;
        font-size: 12px;
        color: var(--el-color-danger);
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      &:hover {
        background: var(--el-fill-color-lighter);
        border-color: var(--el-border-color-darker);
        cursor: pointer;

        & .delete {
          opacity: 1;
        }
      }
    }

    & .active {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary-light-8);

      & .delete {
        opacity: 1;
      }
    }
  }

  & .variable-form-wrapper {
    background: var(--el-fill-color-blank);
    padding: 16px;
    margin: 16px 16px 16px 0;
    border-radius: 0 8px 8px 0;
    border: 1px solid var(--el-border-color);

    & .script-editor {
      width: 100%;
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      overflow: hidden;

      :deep(.cm-editor) {
        height: 240px;
      }
    }
  }
}
</style>
