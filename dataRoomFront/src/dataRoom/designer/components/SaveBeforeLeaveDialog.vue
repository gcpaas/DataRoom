<script setup lang="ts">
import type { SaveBeforeLeaveAction } from '@/dataRoom/designer/utils/save-before-leave'

const visible = defineModel<boolean>({
  required: true,
})

const emit = defineEmits<{
  action: [action: SaveBeforeLeaveAction]
}>()

const emitAction = (action: SaveBeforeLeaveAction) => {
  visible.value = false
  emit('action', action)
}
</script>

<template>
  <el-dialog
    v-model="visible"
    title="提示"
    width="400px"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <span>是否保存后返回？</span>
    <template #footer>
      <el-button @click="emitAction('cancel')">取消</el-button>
      <el-button @click="emitAction('discard')">不保存</el-button>
      <el-button type="primary" @click="emitAction('confirm')">确认</el-button>
    </template>
  </el-dialog>
</template>
