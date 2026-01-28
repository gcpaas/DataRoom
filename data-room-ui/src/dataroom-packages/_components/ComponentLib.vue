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
        <div class="desc">{{ plugin.desc }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dr-component-lib-wrapper {
  padding: 8px 8px;
  box-sizing: border-box;
  overflow-x: hidden;

  & .search {
    width: 100%;
    margin-bottom: 16px;
  }

  & .component-card {
    display: flex;
    flex-direction: column;
    gap: 8px;

    & .card {
      background-color: var(--dr-bg2);
      border: 1px solid var(--dr-border);
      overflow: hidden;

      &:hover {
        cursor: pointer;
        border: 1px solid var(--dr-primary);
      }

      & .image {
        width: 100%;
        height: 70px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        box-sizing: border-box;

        & .el-image {
          width: 100%;
          height: 100%;
        }
      }

      & .desc {
        padding-left: 16px;
        background-color: white;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        color: var(--dr-text1);
      }
    }
  }
}
</style>
