<script setup lang="ts">
import { shallowRef } from 'vue'
import { ElInput, type InputInstance } from 'element-plus'

defineOptions({ inheritAttrs: false })
const inputRef = shallowRef<InputInstance>()

// 不声明模型和禁用默认值，由 ElInput 原样处理 attrs、事件及表单继承。
// 代理原实例，保留 focus、input、textarea、select、clear 等公开能力。
defineExpose(new Proxy({} as InputInstance, {
  get: (target, key) => Reflect.has(target, key) ? Reflect.get(target, key) : Reflect.get(inputRef.value ?? {}, key),
  has: (target, key) => Reflect.has(target, key) || Reflect.has(inputRef.value ?? {}, key),
}))
</script>

<template>
  <ElInput ref="inputRef" v-bind="$attrs" class="dr-input-field">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </ElInput>
</template>

<style scoped lang="scss">
.dr-input-field {
  --el-input-font-size: 12px;
  --el-input-bg-color: var(--el-bg-color-page);
  --el-input-border-color: transparent;
  --el-input-hover-border-color: transparent;
  --el-input-focus-border-color: transparent;
  font-size: 12px;
}

.dr-input-field :deep(> .el-input__wrapper) {
  font-size: var(--el-input-font-size);
}

// 禁用态不读取 input 专用背景、边框变量，仅覆盖本体的直接子节点。
.dr-input-field.is-disabled :deep(> .el-input__wrapper) {
  background-color: var(--el-input-bg-color);
  box-shadow: none;
}

.dr-input-field.is-disabled :deep(> .el-textarea__inner) {
  box-shadow: none;
}
</style>
