<!-- 组件库 -->
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import { pluginList } from '@/dataroom-packages/_components/PluginRegister.ts'
import { Check, Search } from '@element-plus/icons-vue'
import { DrConst } from '@/dataroom-packages/constant/DrConst.ts'
import type { CanvasInst } from '@/dataroom-packages/PageDesigner/type/CanvasInst.ts'

const canvasInst = inject(DrConst.CANVAS_INST) as CanvasInst
const emit = defineEmits(['close'])
const componentLibVisible = ref(true)

const searchName = ref('')
const selectedPluginTypes = ref<string[]>([])
/**
 * 切换组件选中状态
 * @param type
 */
const togglePluginSelection = (type: string) => {
  const targetIndex = selectedPluginTypes.value.indexOf(type)
  if (targetIndex >= 0) {
    selectedPluginTypes.value.splice(targetIndex, 1)
    return
  }
  selectedPluginTypes.value.push(type)
}

const isPluginSelected = (type: string) => selectedPluginTypes.value.includes(type)

const closeDialog = () => {
  componentLibVisible.value = false
}

/**
 * 按选中顺序逐个插入组件
 */
const handleConfirm = () => {
  selectedPluginTypes.value.forEach((type) => {
    const chart = canvasInst.addChart(type)
    canvasInst.commitChartAdd(chart)
  })
  closeDialog()
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
          <div
            class="card"
            v-for="plugin in filterPluginList"
            :key="plugin.name"
            :class="{ 'card--selected': isPluginSelected(plugin.type) }"
            @click="togglePluginSelection(plugin.type)"
          >
            <div class="selection-overlay" v-if="isPluginSelected(plugin.type)">
              <el-icon class="selection-icon">
                <Check />
              </el-icon>
            </div>
            <div class="image">
              <el-image :src="plugin.thumbnail" lazy fit="contain" />
            </div>
            <div class="desc">{{ plugin.name }}</div>
          </div>
        </div>
      </el-scrollbar>
      <div class="footer">
        <div class="selection-summary">已选 {{ selectedPluginTypes.length }} 个组件</div>
        <div class="footer-actions">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :disabled="selectedPluginTypes.length === 0" @click="handleConfirm">确定</el-button>
        </div>
      </div>
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
    gap: 16px;
    padding: 2px 4px 20px 2px;

    & .card {
      position: relative;
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      overflow: hidden;
      transition: border-color 0.2s ease, background-color 0.2s ease;

      &:hover {
        cursor: pointer;
        border-color: var(--el-border-color);
      }

      &.card--selected {
        background: var(--el-color-primary-light-9);
        border-color: var(--el-color-primary);
      }

      & .selection-overlay {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-light);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1;

        & .selection-icon {
          font-size: 18px;
          color: var(--el-color-primary);
        }
      }

      & .image {
        width: 100%;
        height: 96px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px 16px 12px;
        background: var(--el-fill-color-extra-light);
        box-sizing: border-box;

        & .el-image {
          width: 100%;
          height: 100%;
        }
      }

      & .desc {
        padding: 12px 12px 14px;
        line-height: 1.5;
        font-size: 12px;
        font-weight: 500;
        color: var(--el-text-color-primary);
        text-align: center;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        border-top: 1px solid var(--el-border-color-lighter);
      }
    }
  }

  & .footer {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
    gap: 16px;
  }

  & .selection-summary {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }

  & .footer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
