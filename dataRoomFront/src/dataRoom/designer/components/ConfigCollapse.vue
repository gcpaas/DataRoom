<script lang="ts">
import type { InjectionKey, Ref } from 'vue'

export type ConfigCollapseName = string | number
export const configCollapseKey: InjectionKey<{
  activeNames: Ref<ConfigCollapseName[]>
  toggle: (name: ConfigCollapseName) => void
}> = Symbol('ConfigCollapse')
</script>

<script setup lang="ts">
import { provide, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: ConfigCollapseName | ConfigCollapseName[]
  accordion?: boolean
}>(), {
  modelValue: () => [],
  accordion: true,
})
const emit = defineEmits<{
  'update:modelValue': [value: ConfigCollapseName | ConfigCollapseName[]]
  change: [value: ConfigCollapseName | ConfigCollapseName[]]
}>()
const activeNames = ref<ConfigCollapseName[]>([])
watch(() => props.modelValue, value => {
  const names = Array.isArray(value) ? [...value] : value === '' ? [] : [value]
  activeNames.value = props.accordion ? names.slice(0, 1) : names
}, { immediate: true, deep: true })
watch(() => props.accordion, accordion => {
  if (accordion) activeNames.value = activeNames.value.slice(0, 1)
})

const toggle = (name: ConfigCollapseName) => {
  const active = activeNames.value.includes(name)
  activeNames.value = props.accordion
    ? (active ? [] : [name])
    : (active ? activeNames.value.filter(item => item !== name) : [...activeNames.value, name])
  const value = props.accordion ? (activeNames.value[0] ?? '') : [...activeNames.value]
  emit('update:modelValue', value)
  emit('change', value)
}
provide(configCollapseKey, { activeNames, toggle })
</script>

<template>
  <div class="config-collapse"><slot /></div>
</template>

<style scoped>
.config-collapse {
  min-width: 0;
  padding: 0;
  font-size: 12px;
}
</style>
