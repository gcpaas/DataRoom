<!-- 组件库 -->
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { pluginList } from '@/dataroom-packages/_components/PluginRegister.ts'
import { Search } from '@element-plus/icons-vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { CanvasInst } from '@/dataroom-packages/PageDesigner/type/CanvasInst.ts'

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const emit = defineEmits(['close'])
const componentLibVisible = ref(true)

const searchName = ref('')
/**
 * 添加组件到画布
 * @param type
 */
const addChart = (type: string) => {
  const chart = canvasInst.addChart(type)
  canvasInst.commitChartAdd(chart)
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
  <el-dialog v-model="componentLibVisible" title="组件库" width="80%" :close-on-click-modal="false" @closed="emit('close')">
    <div class="dr-component-lib-wrapper">
      <div class="search">
        <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索" clearable></el-input>
      </div>
      <el-scrollbar class="component-card-scrollbar">
        <div class="component-card">
          <div class="card" v-for="plugin in filterPluginList" :key="plugin.name" @click="addChart(plugin.type)">
            <div class="image">
              <el-image :src="plugin.thumbnail" lazy fit="contain" />
            </div>
            <div class="desc">{{ plugin.name }}</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.dr-component-lib-wrapper {
  display: flex;
  flex-direction: column;
  height: 600px;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  overflow-x: hidden;
  background: var(--el-bg-color);
  font-family:
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    sans-serif;

  & .search {
    flex-shrink: 0;
    width: 50%;
    margin: 0 auto 16px;
  }

  & .component-card-scrollbar {
    flex: 1;
    min-height: 0;
  }

  & .component-card {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding-right: 4px;
    padding-bottom: 4px;

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
