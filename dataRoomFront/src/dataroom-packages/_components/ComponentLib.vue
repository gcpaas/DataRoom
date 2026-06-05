<!-- 组件库 -->
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { pluginList } from '@/dataroom-packages/_components/PluginRegister.ts'
import { Search } from '@element-plus/icons-vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { CanvasInst } from '@/dataroom-packages/PageDesigner/type/CanvasInst.ts'

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const props = withDefaults(
  defineProps<{
    mode?: 'panel' | 'dialog'
  }>(),
  {
    mode: 'panel',
  },
)
const emit = defineEmits(['add'])

const searchName = ref('')
/**
 * 添加组件到画布
 * @param type
 */
const addChart = (type: string) => {
  canvasInst.addChart(type)
  emit('add', type)
}

/**
 * 动态筛选
 */
const filterPluginList = computed(() => {
  return pluginList.filter((item) => {
    for (let i = 0; i < item.tags.length; i++) {
      if (item.name.includes(searchName.value) || item.desc.includes(searchName.value)) {
        return true
      }
    }
    return false
  })
})
</script>
<template>
  <div :class="['dr-component-lib-wrapper', { 'dr-component-lib-wrapper--dialog': props.mode === 'dialog', 'dr-component-lib-wrapper--panel': props.mode === 'panel' }]">
    <div :class="['search', { 'search--dialog': props.mode === 'dialog' }]">
      <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索" clearable></el-input>
    </div>
    <div :class="['component-card', { 'component-card--dialog': props.mode === 'dialog', 'component-card--panel': props.mode === 'panel' }]">
      <div class="card" v-for="plugin in filterPluginList" :key="plugin.name" @click="addChart(plugin.type)">
        <div class="image">
          <el-image :src="plugin.thumbnail" lazy fit="contain" />
        </div>
        <div class="desc">{{ plugin.name }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dr-component-lib-wrapper {
  padding: 8px;
  box-sizing: border-box;
  overflow-x: hidden;
  background: var(--el-fill-color-light);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  & .search {
    width: 100%;
    margin-bottom: 12px;

    &--dialog {
      width: 50%;
      margin: 0 auto 16px;
    }
  }

  &--dialog {
    height: 60vh;
    padding: 0;
    background: var(--el-bg-color);
    overflow-y: auto;
  }

  & .component-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;

    &--dialog {
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      padding-right: 4px;
    }

    & .card {
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      overflow: hidden;
      padding: 8px;
      transition:
        border-color 0.2s ease,
        transform 0.2s ease;

      &:hover {
        cursor: pointer;
        border-color: var(--el-border-color-darker);
        transform: scale(1.02);
      }

      &:active {
        transform: scale(1);
      }

      & .image {
        width: 100%;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        box-sizing: border-box;

        & .el-image {
          width: 100%;
          height: 100%;
        }
      }

      & .desc {
        padding: 4px 4px 0;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

    }
  }
}
</style>
