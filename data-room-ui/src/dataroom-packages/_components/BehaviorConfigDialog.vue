<!-- 交互行为配置对话框 -->
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {ElMessage} from 'element-plus'
import {Delete, Plus, Rank} from '@element-plus/icons-vue'
import type {Behavior} from "@/dataroom-packages/components/type/Behavior.ts";
import type {ChartConfig} from "@/dataroom-packages/components/type/ChartConfig.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";

const props = defineProps<{
  modelValue: boolean
  behavior: Behavior
  chart: ChartConfig<unknown>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 当前选中的action索引
const activeActionIndex = ref<number>(0)

// 获取或初始化behavior配置
const getBehaviorConfig = () => {
  if (!props.chart.behaviors) {
    props.chart.behaviors = {}
  }
  if (!props.chart.behaviors[props.behavior.method]) {
    props.chart.behaviors[props.behavior.method] = {
      disabled: false,
      actions: []
    }
  }
  return props.chart.behaviors[props.behavior.method]
}

// 获取actions列表
const actions = computed(() => {
  const config = getBehaviorConfig()
  return config?.actions || []
})

// 当前选中的action
const currentAction = computed(() => {
  if (activeActionIndex.value >= 0 && activeActionIndex.value < actions.value.length) {
    return actions.value[activeActionIndex.value]
  }
  return null
})

// 添加新的action
const addAction = () => {
  const config = getBehaviorConfig()
  if (!config) {
    return
  }
  // 自动生成动作名称
  const actionCount = config.actions.length + 1
  const newAction: ChartAction = {
    name: `动作${actionCount}`,
    type: 'code',
    code: '// 请输入JS代码\n'
  }
  config.actions.push(newAction)
  activeActionIndex.value = config.actions.length - 1
  ElMessage.success('已添加新的动作')
}

// 删除action
const deleteAction = (index: number) => {
  const config = getBehaviorConfig()
  if (!config) {
    return
  }
  config.actions.splice(index, 1)
  // 调整选中索引
  if (activeActionIndex.value >= config.actions.length) {
    activeActionIndex.value = Math.max(0, config.actions.length - 1)
  }
  ElMessage.success('已删除动作')
}

// 拖拽排序相关
const dragStartIndex = ref<number>(-1)

const handleDragStart = (index: number) => {
  dragStartIndex.value = index
}

const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
}

const handleDrop = (e: DragEvent, dropIndex: number) => {
  e.preventDefault()
  if (dragStartIndex.value !== -1 && dragStartIndex.value !== dropIndex) {
    const config = getBehaviorConfig()
    if (!config) {
      return
    }
    const dragItem = config.actions[dragStartIndex.value]
    if (!dragItem) {
      return;
    }
    config.actions.splice(dragStartIndex.value, 1)
    config.actions.splice(dropIndex, 0, dragItem)

    // 更新选中索引
    if (activeActionIndex.value === dragStartIndex.value) {
      activeActionIndex.value = dropIndex
    } else if (dragStartIndex.value < activeActionIndex.value && dropIndex >= activeActionIndex.value) {
      activeActionIndex.value--
    } else if (dragStartIndex.value > activeActionIndex.value && dropIndex <= activeActionIndex.value) {
      activeActionIndex.value++
    }
  }
  dragStartIndex.value = -1
}

// 监听behavior变化，重置选中索引
watch(() => props.behavior, () => {
  activeActionIndex.value = 0
}, {immediate: true})

// 关闭对话框
const onClose = () => {
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog v-model="dialogVisible" :title="`${behavior.name}动作`" width="80%" :close-on-click-modal="false">
    <div class="dr-behavior-config-wrapper">
      <div class="action-list-wrapper">
        <div class="list-header">
          <span class="title">动作列表</span>
          <el-button type="primary" size="small" @click="addAction">
            <el-icon><Plus /></el-icon>
            添加
          </el-button>
        </div>
        <el-scrollbar>
          <div
            v-for="(action, index) in actions"
            :key="index"
            :class="{ 'action-item': true, active: index === activeActionIndex }"
            :draggable="true"
            @dragstart="handleDragStart(index)"
            @dragover="handleDragOver"
            @drop="(e: DragEvent) => handleDrop(e, index)"
            @click="activeActionIndex = index"
          >
            <el-icon class="drag-icon">
              <Rank />
            </el-icon>
            <div class="action-info">
              <div class="action-name">{{ action.name || `动作${index + 1}` }}</div>
              <div class="action-type">{{ action.type === 'code' ? '代码' : action.type }}</div>
            </div>
            <el-icon class="delete-icon" @click.stop="deleteAction(index)">
              <Delete />
            </el-icon>
          </div>
        </el-scrollbar>
      </div>
      <div class="action-form-wrapper">
        <el-form v-if="currentAction" label-width="100px" label-position="left" size="default">
          <el-form-item label="动作名称">
            <el-input
              v-model="currentAction.name"
              placeholder="请输入动作名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item label="动作类型">
            <el-select v-model="currentAction.type" disabled>
              <el-option label="代码" value="code"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="JS代码">
            <el-input
              v-model="currentAction.code"
              type="textarea"
              :rows="12"
              placeholder="请输入JavaScript代码"
            ></el-input>
          </el-form-item>
          <el-form-item label="说明">
            <el-alert type="info" :closable="false">
              <template #default>
                <div style="font-weight: bold">bep.params对象属性说明</div>
                <div v-for="param in behavior.paramsList" :key="param.name" style="margin-top: 4px;">
                  <strong>{{ param.name }}</strong> ({{ param.type }}): {{ param.desc }}
                </div>
                <div v-if="behavior.paramsList.length === 0" style="color: #999;">无参数</div>
              </template>
            </el-alert>
          </el-form-item>
        </el-form>
        <div v-else class="empty-action">
          <el-empty description="请选择或添加动作" />
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onClose">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dr-behavior-config-wrapper {
  display: grid;
  grid-template-columns: 400px auto;
  background-color: var(--dr-gray-50);
  gap: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  .action-list-wrapper {
    height: calc(70vh - 120px);
    background: var(--dr-white);
    padding: var(--space-4);
    margin: var(--space-4);
    border-radius: var(--radius-lg) 0 0 var(--radius-lg);
    box-shadow: var(--dr-shadow-border);

    :deep(.el-scrollbar__view) {
      padding: 2px;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--space-4);

      .title {
        font-size: 14px;
        font-weight: 600;
        color: var(--dr-gray-900);
      }

      :deep(.el-button) {
        border-radius: var(--radius-md);
      }
    }

    .action-item {
      margin: var(--space-2) 0;
      padding: var(--space-3);
      position: relative;
      cursor: move;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-radius: var(--radius-md);
      box-shadow: var(--dr-shadow-border);
      transition: all 0.2s ease;
      gap: var(--space-2);

      .drag-icon {
        font-size: 12px;
        color: var(--dr-gray-400);
        cursor: move;
        flex-shrink: 0;
        transition: color 0.2s ease;
      }

      .action-info {
        flex: 1;
        min-width: 0;

        .action-name {
          font-size: 14px;
          color: var(--dr-gray-900);
          font-weight: 500;
          margin-bottom: var(--space-1);
        }

        .action-type {
          font-size: 12px;
          color: var(--dr-gray-500);
        }
      }

      .delete-icon {
        font-size: 14px;
        color: var(--dr-danger);
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.2);
        }
      }

      &:hover {
        background: var(--dr-gray-100);
        cursor: pointer;

        .drag-icon {
          color: var(--dr-gray-700);
        }
      }

      &.active {
        background: var(--dr-blue-soft);
        box-shadow: 0px 0px 0px 1px var(--dr-blue-border);
      }
    }
  }

  .action-form-wrapper {
    background: var(--dr-white);
    padding: var(--space-4);
    margin: var(--space-4) var(--space-4) var(--space-4) 0;
    border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
    box-shadow: var(--dr-shadow-border);

    :deep(.el-form-item__label) {
      font-size: 14px;
      font-weight: 500;
      color: var(--dr-gray-700);
    }

    :deep(.el-input__wrapper),
    :deep(.el-select .el-input__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: 0px 0px 0px 1px var(--dr-gray-200);
      border: none;
      transition: box-shadow 0.2s ease;

      &:focus-within {
        box-shadow: var(--dr-shadow-focus);
      }
    }

    :deep(.el-textarea__inner) {
      border-radius: var(--radius-md);
      border: 1px solid var(--dr-gray-200);
      font-family: 'JetBrains Mono', 'SF Mono', SFMono-Regular, ui-monospace, Menlo, monospace;
      font-size: 13px;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;

      &:focus {
        border-color: var(--dr-blue);
        box-shadow: var(--dr-shadow-focus);
      }
    }

    :deep(.el-button) {
      border-radius: var(--radius-md);
    }

    .empty-action {
      height: calc(70vh - 120px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
