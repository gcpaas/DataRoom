<!-- 定时器配置对话框 -->
<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Delete, Plus, Rank} from '@element-plus/icons-vue'
import type {PageTimer} from "@/dataroom-packages/PageDesigner/type/PageTimer.ts";
import type {ChartAction} from "@/dataroom-packages/components/type/ChartAction.ts";

const props = defineProps<{
  modelValue: boolean
  timer: PageTimer
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

// 获取actions列表
const actions = computed(() => {
  return props.timer.actions || []
})

// 当前选中的action
const currentAction = computed(() => {
  if (activeActionIndex.value >= 0 && activeActionIndex.value < actions.value.length) {
    return actions.value[activeActionIndex.value]
  }
  return null
})

/**
 * 添加新的动作
 */
const addAction = () => {
  const actionCount = props.timer.actions.length + 1
  const newAction: ChartAction = {
    name: `动作${actionCount}`,
    type: 'code',
    code: '// 请输入JS代码\n// 可以在这里执行定时任务，例如：\nconsole.log("定时器动作执行");\n'
  }
  props.timer.actions.push(newAction)
  activeActionIndex.value = props.timer.actions.length - 1
}

/**
 * 删除动作
 * @param index
 */
const deleteAction = (index: number) => {
  ElMessageBox.confirm(
    '确定要删除这个动作吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
    props.timer.actions.splice(index, 1)
    // 调整选中索引
    if (activeActionIndex.value >= props.timer.actions.length) {
      activeActionIndex.value = Math.max(0, props.timer.actions.length - 1)
    }
  }).catch(() => {
    // 用户取消删除
  })
}

// 拖拽排序
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
    const dragItem = props.timer.actions[dragStartIndex.value]
    if (!dragItem) {
      return
    }
    props.timer.actions.splice(dragStartIndex.value, 1)
    props.timer.actions.splice(dropIndex, 0, dragItem)

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

// 监听timer变化，重置选中索引
watch(() => props.timer, () => {
  activeActionIndex.value = 0
}, {immediate: true})

// 关闭对话框
const onClose = () => {
  dialogVisible.value = false
}

/**
 * 确认保存
 */
const onConfirm = () => {
  // 验证定时器配置
  if (!props.timer.name.trim()) {
    ElMessage.warning('请输入定时器名称')
    return
  }
  if (props.timer.interval < 500) {
    ElMessage.warning('定时器间隔不能小于500ms')
    return
  }
  dialogVisible.value = false
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`定时器配置 - ${timer.name}`"
    width="80%"
    :close-on-click-modal="false"
  >
    <el-scrollbar class="dialog-scrollbar">
      <div class="dr-timer-config-wrapper">
        <!-- 基本配置区域 -->
        <div class="basic-config-section">
          <el-form label-position="left" size="default" inline class="inline-form">
            <el-form-item label="名称">
              <el-input
                v-model="timer.name"
                placeholder="请输入定时器名称"
                clearable
                style="width: 200px"
              ></el-input>
            </el-form-item>
            <el-form-item label="执行间隔">
              <el-input-number
                v-model="timer.interval"
                :min="100"
                :max="3600000"
                :step="1000"
                controls-position="right"
                style="width: 150px"
              />
              <span class="form-tip">单位：毫秒</span>
            </el-form-item>
            <el-form-item label="启用状态">
              <el-switch v-model="timer.enabled"/>
            </el-form-item>
          </el-form>
        </div>

        <!-- 动作配置区域 -->
        <div class="action-config-section">
          <div class="action-list-wrapper">
            <div class="list-header">
              <span class="title">动作列表</span>
              <el-button type="primary" size="small" @click="addAction">
                <el-icon>
                  <Plus/>
                </el-icon>
                添加
              </el-button>
            </div>
            <div class="action-list-content">
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
                  <Rank/>
                </el-icon>
                <div class="action-info">
                  <div class="action-name">{{ action.name || `动作${index + 1}` }}</div>
                  <div class="action-type">{{ action.type === 'code' ? '代码' : action.type }}</div>
                </div>
                <el-icon class="delete-icon" @click.stop="deleteAction(index)">
                  <Delete/>
                </el-icon>
              </div>
              <div v-if="actions.length === 0" class="empty-action-list">
                <el-empty description="暂无动作，请点击上方按钮添加" :image-size="60"/>
              </div>
            </div>
          </div>
          <div class="action-form-wrapper">
            <div v-if="currentAction" class="form-content">
              <el-form label-width="100px" label-position="left" size="default">
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
                    :rows="15"
                    placeholder="请输入JavaScript代码"
                  ></el-input>
                </el-form-item>
                <el-form-item label="说明">
                  <el-alert type="info" :closable="false">
                    <template #default>
                      <div style="line-height: 1.6;">
                        <div><strong>定时器说明：</strong></div>
                        <div>• 定时器会按照设定的间隔时间重复执行动作列表中的所有动作</div>
                        <div>• 动作按照列表顺序依次执行</div>
                        <div>• 可以通过拖拽调整动作执行顺序</div>
                        <div>• 只有启用状态的定时器才会执行</div>
                      </div>
                    </template>
                  </el-alert>
                </el-form-item>
              </el-form>
            </div>
            <div v-else class="empty-action">
              <el-empty description="请选择或添加动作"/>
            </div>
          </div>
        </div>
      </div>
    </el-scrollbar>
    <template #footer>
      <el-button @click="onClose">取消</el-button>
      <el-button type="primary" @click="onConfirm">确定</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.dialog-scrollbar {
  height: calc(70vh - 60px);
  padding: 0 4px;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }

  :deep(.el-scrollbar__bar) {
    z-index: 10 !important;
  }
}

.dr-timer-config-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 4px;

  .basic-config-section {
    background: var(--el-fill-color-light);
    padding: 16px;
    border-radius: 6px;

    .inline-form {
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 16px;

      :deep(.el-form-item) {
        margin-bottom: 0;
        margin-right: 0;
      }
    }

    .form-tip {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      margin-left: 8px;
    }

    .status-text {
      margin-left: 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);

      &.enabled {
        color: var(--el-color-success);
        font-weight: 500;
      }
    }
  }

  .action-config-section {
    display: grid;
    grid-template-columns: 350px auto;
    background-color: var(--el-fill-color-lighter);
    gap: 0;
    border-radius: 6px;
    overflow: hidden;
    min-height: 500px;

    .action-list-wrapper {
      background: white;
      padding: 16px;
      border-right: 1px solid var(--dr-border);
      display: flex;
      flex-direction: column;

      .list-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--dr-border);
        flex-shrink: 0;

        .title {
          font-size: 15px;
          font-weight: 500;
          color: var(--dr-text);
        }
      }

      .action-list-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
      }

      .action-item {
        margin-bottom: 16px;
        padding: 12px;
        position: relative;
        cursor: move;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-radius: 4px;
        border: 1px solid var(--dr-border);
        transition: all 0.3s;
        gap: 8px;
        background: var(--dr-bg2);

        &:last-child {
          margin-bottom: 0;
        }

        .drag-icon {
          font-size: 18px;
          color: var(--el-text-color-regular);
          cursor: move;
          flex-shrink: 0;
          transition: color 0.3s;
        }

        .action-info {
          flex: 1;
          min-width: 0;

          .action-name {
            font-size: 14px;
            color: var(--dr-text);
            font-weight: 500;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-type {
            font-size: 12px;
            color: var(--el-text-color-secondary);
          }
        }

        .delete-icon {
          font-size: 16px;
          color: var(--el-color-danger);
          cursor: pointer;
          transition: transform 0.3s;

          &:hover {
            transform: scale(1.2);
          }
        }

        &:hover {
          background: var(--el-color-primary-light-9);
          cursor: pointer;

          .drag-icon {
            color: var(--dr-primary);
          }
        }

        &.active {
          background: var(--el-color-primary-light-9);
          border-color: var(--dr-primary);
          box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
        }
      }

      .empty-action-list {
        padding: 20px;
        text-align: center;
      }
    }

    .action-form-wrapper {
      background: #fff;
      padding: 16px;
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      overflow-x: hidden;

      .form-content {
        flex: 1;
      }

      .empty-action {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
      }
    }
  }
}
</style>
