<!-- 组件库 -->
<script setup lang="ts">
import {computed, inject, ref} from 'vue'
import {pluginList} from '@/dataroom-packages/_components/PluginRegister.ts'
import {Search} from '@element-plus/icons-vue'
import {DrConst} from "@/dataroom-packages/constant/DrConst.ts";
import type {CanvasInst} from "@/dataroom-packages/PageDesigner/type/CanvasInst.ts";

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst

const searchName = ref('')
/**
 * 添加组件到画布
 * @param type
 */
const addChart = (type: string) => {
  canvasInst.addChart(type)
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
  <div class="dr-component-lib-wrapper">
    <div class="search">
      <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索" clearable></el-input>
    </div>
    <div class="component-card">
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
  padding: var(--space-2);
  box-sizing: border-box;
  overflow-x: hidden;
  background: var(--dr-gray-50);
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  & .search {
    width: 100%;
    margin-bottom: var(--space-3);

    :deep(.el-input__wrapper) {
      border-radius: var(--radius-md);
      box-shadow: var(--dr-shadow-border);
      border: none;
      transition: box-shadow 0.2s ease;

      &:focus-within {
        box-shadow: var(--dr-shadow-focus);
      }
    }
  }

  & .component-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-2);

    & .card {
      background-color: var(--dr-white);
      box-shadow: var(--dr-shadow-border);
      border-radius: var(--radius-md);
      border: none;
      overflow: hidden;
      padding: var(--space-2);
      transition: box-shadow 0.2s ease, transform 0.2s ease;

      &:hover {
        cursor: pointer;
        box-shadow: var(--dr-shadow-sm);
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
        padding: var(--space-1);
        box-sizing: border-box;

        & .el-image {
          width: 100%;
          height: 100%;
        }
      }

      & .desc {
        padding: var(--space-1) var(--space-1) 0;
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        font-weight: 500;
        color: var(--dr-gray-900);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}
</style>
