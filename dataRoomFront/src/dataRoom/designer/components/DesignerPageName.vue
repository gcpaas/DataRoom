<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { EditPen } from '@element-plus/icons-vue'
import { ElMessage, type InputInstance } from 'element-plus'
import DrInputField from './DrInputField.vue'
import { pageApi } from '@/dataRoom/page/api'

const props = defineProps<{ name: string; pageCode: string }>()
const emit = defineEmits<{ updated: [name: string] }>()
const editing = ref(false)
const saving = ref(false)
const draft = ref('')
const inputRef = ref<InputInstance>()

const startEditing = async () => {
  draft.value = props.name
  editing.value = true
  await nextTick()
  inputRef.value?.focus()
  inputRef.value?.select()
}

const save = async () => {
  if (!editing.value || saving.value) return
  editing.value = false
  const name = draft.value.trim()
  if (!name) {
    ElMessage.warning('名称不能为空')
    return
  }
  if (name === props.name || !props.pageCode) return
  saving.value = true
  try {
    await pageApi.updateName(props.pageCode, name)
    emit('updated', name)
    ElMessage.success('修改成功')
  } catch (error) {
    console.error('修改页面名称失败', error)
  } finally {
    saving.value = false
  }
}

const onEnter = (event: Event | KeyboardEvent) => {
  if (event instanceof KeyboardEvent && !event.isComposing) inputRef.value?.blur()
}
</script>

<template>
  <div class="designer-page-name" @keydown.stop @keyup.stop>
    <div v-if="editing" class="name-input">
      <DrInputField
        ref="inputRef"
        v-model="draft"
        aria-label="页面名称"
        placeholder="请输入页面名称"
        :maxlength="50"
        @blur="save"
        @keydown.enter="onEnter"
        @keydown.esc="editing = false"
      />
    </div>
    <template v-else>
      <span class="name-text" :title="name">{{ name }}</span>
      <el-button
        text
        size="small"
        :disabled="saving || !pageCode"
        aria-label="修改页面名称"
        title="修改页面名称"
        @click="startEditing"
      >
        <el-icon><EditPen /></el-icon>
      </el-button>
    </template>
  </div>
</template>

<style scoped lang="scss">
.designer-page-name {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  margin-left: 16px;
}

.name-text {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
}

.name-input {
  width: 240px;
  max-width: 100%;
}
</style>
