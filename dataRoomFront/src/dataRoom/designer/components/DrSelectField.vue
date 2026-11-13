<script setup lang="ts">
import { shallowRef } from 'vue'
import { ElSelect, type SelectInstance } from 'element-plus'

defineOptions({ inheritAttrs: false })
const selectRef = shallowRef<SelectInstance>()

// 模型、事件、禁用继承及作用域插槽全部交给 ElSelect，避免二次维护状态。
defineExpose(new Proxy({} as SelectInstance, {
  get: (target, key) => Reflect.has(target, key) ? Reflect.get(target, key) : Reflect.get(selectRef.value ?? {}, key),
  has: (target, key) => Reflect.has(target, key) || Reflect.has(selectRef.value ?? {}, key),
}))
</script>

<template>
  <ElSelect ref="selectRef" v-bind="$attrs" class="dr-select-field">
    <template v-for="(_, name) in $slots" #[name]="scope">
      <slot :name="name" v-bind="scope || {}" />
    </template>
  </ElSelect>
</template>

<style scoped lang="scss">
.dr-select-field {
  --el-select-font-size: 12px;
  font-size: 12px;
}

// 不修改通用颜色变量，避免影响插槽控件及传送到外部的下拉选项。
.dr-select-field :deep(> .el-select__wrapper) {
  font-size: var(--el-select-font-size);

  &,
  &:hover,
  &.is-focused,
  &.is-hovering:not(.is-focused),
  &.is-disabled,
  &.is-disabled:hover {
    background-color: var(--el-bg-color-page);
    box-shadow: none;
  }
}
</style>
