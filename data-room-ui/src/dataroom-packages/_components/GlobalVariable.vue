<!-- 全局变量 -->
<script setup lang="ts">
import {ref, watch} from 'vue'
import {v4 as uuidv4} from 'uuid'
import {Search} from '@element-plus/icons-vue'
import {ElMessageBox} from 'element-plus'
import type {GlobalVariable} from "@/dataroom-packages/PageDesigner/type/GlobalVariable.ts";

const props = defineProps<{
  globalVariable: GlobalVariable[]
}>()

const globalVariableVisible = ref(true)
const activeGlobalVariable = ref<GlobalVariable>()

/**
 * 默认激活第一个
 */
watch(
  () => props.globalVariable,
  (newVal) => {
    if (newVal && newVal.length > 0 && !activeGlobalVariable.value) {
      activeGlobalVariable.value = newVal[0]
    }
  }, {immediate: true}
)
const onClose = () => {
  globalVariableVisible.value = false
}
const searchName = ref('')
/**
 * 新增变量
 */
const onAdd = () => {
  const inst: GlobalVariable = {
    id: uuidv4(),
    from: 'static',
    name: 'name' + uuidv4(),
    urlName: '',
    remark: '变量备注描述' + uuidv4(),
    defaultValue: '默认值',
    script: '',
  }
  props.globalVariable.push(inst)
  activeGlobalVariable.value = inst
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
  <el-dialog v-model="globalVariableVisible" title="全局变量" width="80%">
    <div class="global-variable-wrapper">
      <div class="variable-wrapper">
        <div class="search">
          <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索"></el-input>
          <el-button type="primary" @click="onAdd">新增</el-button>
        </div>
        <el-scrollbar>
          <div :class="{ variable: true, active: item.id === activeGlobalVariable?.id }" v-for="item in globalVariable" :key="item.id" @click="activeGlobalVariable = item">
            <div class="name">{{ item.name }}</div>
            <div class="remark">{{ item.remark }}</div>
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
            <el-select v-model="activeGlobalVariable.from" placeholder="请选择">
              <el-option label="静态" value="static"></el-option>
              <el-option label="URL" value="url"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="URL参数名称" v-if="activeGlobalVariable.from === 'url'">
            <el-input v-model="activeGlobalVariable.urlName"></el-input>
          </el-form-item>
          <el-form-item label="默认值">
            <el-input v-model="activeGlobalVariable.defaultValue"></el-input>
          </el-form-item>
          <el-form-item label="脚本">
            <el-input v-model="activeGlobalVariable.script" type="textarea" :rows="6"></el-input>
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
  background-color: var(--dr-bg2);
  gap: 0;

  & .variable-wrapper {
    height: calc(70vh - 120px);
    background: white;
    padding: 16px;
    margin: 16px;
    border-radius: 4px 0 0 4px;

    & .search {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    & .variable {
      margin: 8px 0;
      padding: 8px;
      position: relative;

      & .name {
        font-size: 14px;
        color: var(--dr-text);
        font-weight: bold;
      }

      & .remark {
        font-size: 14px;
        color: #999;
        margin-top: 8px;
      }

      & .delete {
        position: absolute;
        right: 8px;
        top: 8px;
        font-size: 12px;
        color: var(--el-color-danger);
      }

      &:hover {
        background: var(--dr-primary1);
        cursor: pointer;
      }
    }

    & .active {
      background: var(--dr-primary1);
    }
  }

  & .variable-form-wrapper {
    background: #fff;
    padding: 16px;
    margin: 16px 16px 16px 0;
    border-radius: 0 4px 4px 0;
  }
}
</style>
