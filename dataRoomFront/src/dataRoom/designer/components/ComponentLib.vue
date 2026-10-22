<!-- 组件库 -->
<script setup lang="ts">
import { computed, inject, nextTick, ref, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import type { ScrollbarInstance } from 'element-plus'
import { componentLibTagList, pluginList } from '@/dataRoom/designer/registry/PluginRegister.ts'
import { getActiveComponentGroup, groupComponents } from './component-lib.ts'
import { Check, Search } from '@element-plus/icons-vue'
import { DrConst } from '@/dataRoom/constants/DrConst.ts'
import type { CanvasInst } from '@/dataRoom/designer/types/CanvasInst.ts'

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

const componentGroups = computed(() => groupComponents(pluginList, componentLibTagList, searchName.value))
const activeTag = ref('')
const categoryScrollbar = ref<ScrollbarInstance>()
const componentScrollbar = ref<ScrollbarInstance>()
const componentScroller = computed(() => componentScrollbar.value?.wrapRef)
const groupContainer = ref<HTMLElement>()
const scrollEndSpace = ref(0)

const getGroupPositions = () => {
  const scroller = componentScroller.value
  if (!scroller) return []
  const viewportTop = scroller.getBoundingClientRect().top + scroller.clientTop
  return Array.from(groupContainer.value?.querySelectorAll<HTMLElement>('[data-group-tag]') ?? []).map((group) => ({
    tag: group.dataset.groupTag!,
    top: group.getBoundingClientRect().top - viewportTop + scroller.scrollTop,
  }))
}

const syncActiveCategory = () => {
  const scroller = componentScroller.value
  if (!scroller || scroller.clientHeight === 0) return
  activeTag.value = getActiveComponentGroup(getGroupPositions(), scroller.scrollTop, scroller.clientHeight, scroller.scrollHeight)
}

const scrollToCategory = (tag: string) => {
  const group = getGroupPositions().find((item) => item.tag === tag)
  if (!group || !componentScroller.value) return
  // 仅移动右侧容器，直接定位避免平滑滚动经过中间分类时高亮闪动。
  componentScrollbar.value?.scrollTo({ top: Math.max(0, group.top), behavior: 'instant' })
  syncActiveCategory()
}

watch(
  activeTag,
  () => {
    const nav = categoryScrollbar.value?.wrapRef
    const button = Array.from(nav?.querySelectorAll<HTMLElement>('[data-category-tag]') ?? []).find((item) => item.dataset.categoryTag === activeTag.value)
    if (!nav || !button) return
    const navRect = nav.getBoundingClientRect()
    const buttonRect = button.getBoundingClientRect()
    if (buttonRect.top < navRect.top) {
      categoryScrollbar.value?.setScrollTop(nav.scrollTop + buttonRect.top - navRect.top)
    } else if (buttonRect.bottom > navRect.bottom) {
      categoryScrollbar.value?.setScrollTop(nav.scrollTop + buttonRect.bottom - navRect.bottom)
    }
  },
  { flush: 'post' },
)

watch(componentGroups, async () => {
  await nextTick()
  componentScrollbar.value?.scrollTo({ top: 0, behavior: 'instant' })
  activeTag.value = componentGroups.value[0]?.tag ?? ''
  await refreshScrollLayout()
})

const refreshScrollLayout = async () => {
  const scroller = componentScroller.value
  const lastGroup = groupContainer.value?.lastElementChild as HTMLElement | null
  // 预留末组定位空间，避免点击倒数分类时因滚动触底而误选最后一类。
  scrollEndSpace.value = scroller && lastGroup && componentGroups.value.length > 1 ? Math.max(0, scroller.clientHeight - lastGroup.offsetHeight) : 0
  await nextTick()
  componentScrollbar.value?.update()
  categoryScrollbar.value?.update()
  syncActiveCategory()
}

// 弹框打开、视口变化或卡片换行时重新计算，不缓存可能失效的分组高度。
useResizeObserver([componentScroller, groupContainer], refreshScrollLayout)
</script>
<template>
  <el-dialog v-model="componentLibVisible" title="组件库" width="80%" :close-on-click-modal="false" @opened="refreshScrollLayout" @closed="emit('close')">
    <div class="dr-component-lib-wrapper">
      <div class="component-toolbar">
        <el-input v-model="searchName" :suffix-icon="Search" placeholder="搜索组件名称或描述" aria-label="搜索组件" clearable />
      </div>
      <div class="component-browser">
        <div class="category-pane">
          <el-scrollbar ref="categoryScrollbar" height="100%">
            <nav class="category-nav" aria-label="组件分类">
              <button
                v-for="group in componentGroups"
                :key="group.tag"
                type="button"
                class="category-button"
                :class="{ 'category-button--active': activeTag === group.tag }"
                :data-category-tag="group.tag"
                :aria-current="activeTag === group.tag ? 'true' : undefined"
                @click="scrollToCategory(group.tag)"
              >
                <span>{{ group.name }}</span>
                <span class="category-count">{{ group.plugins.length }}</span>
              </button>
            </nav>
          </el-scrollbar>
        </div>
        <div class="component-card-scrollbar">
          <el-scrollbar ref="componentScrollbar" height="100%" :tabindex="0" role="region" aria-label="组件列表" @scroll="syncActiveCategory">
            <div ref="groupContainer">
              <section v-for="group in componentGroups" :key="group.tag" class="component-group" :data-group-tag="group.tag" :aria-label="group.name">
                <h3 class="group-title">
                  {{ group.name }}<span class="category-count">{{ group.plugins.length }}</span>
                </h3>
                <div class="component-card">
                  <button
                    v-for="plugin in group.plugins"
                    :key="plugin.type"
                    type="button"
                    class="card"
                    :class="{ 'card--selected': isPluginSelected(plugin.type) }"
                    :aria-pressed="isPluginSelected(plugin.type)"
                    :aria-label="plugin.name"
                    @click="togglePluginSelection(plugin.type)"
                  >
                    <span v-if="isPluginSelected(plugin.type)" class="selection-overlay" aria-hidden="true">
                      <el-icon class="selection-icon"><Check /></el-icon>
                    </span>
                    <span class="image">
                      <img class="thumbnail-image" :src="plugin.thumbnail" alt="" loading="lazy" />
                    </span>
                    <span class="card-footer">
                      <span class="card-heading">
                        <span class="card-name" :title="plugin.name">{{ plugin.name }}</span>
                        <span class="card-type" :title="plugin.type">{{ plugin.type }}</span>
                      </span>
                      <span class="card-desc" :title="plugin.desc">{{ plugin.desc }}</span>
                    </span>
                  </button>
                </div>
              </section>
              <el-empty v-if="componentGroups.length === 0" description="未找到匹配的组件" />
            </div>
            <div :style="{ height: `${scrollEndSpace}px` }" aria-hidden="true" />
          </el-scrollbar>
        </div>
      </div>
      <div class="footer">
        <div class="selection-summary">已选 {{ selectedPluginTypes.length }} 个组件</div>
        <div class="footer-actions">
          <el-button @click="closeDialog">取消</el-button>
          <el-button type="primary" :disabled="selectedPluginTypes.length === 0" @click="handleConfirm">插入</el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<style scoped lang="scss">
.dr-component-lib-wrapper {
  display: flex;
  flex-direction: column;
  height: min(600px, 65vh);
  letter-spacing: 0;
  padding: 0;
  box-sizing: border-box;
  overflow: hidden;
  overflow-x: hidden;
  background: var(--el-bg-color);

  & .component-toolbar {
    flex-shrink: 0;
    width: min(360px, 100%);
    align-self: center;
    margin-bottom: 16px;
  }

  & .component-browser {
    display: grid;
    grid-template-columns: 144px minmax(0, 1fr);
    gap: 20px;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }

  & .category-pane {
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    border-right: 1px solid var(--el-border-color-lighter);
  }

  & .category-nav {
    padding: 0 12px 12px 0;
  }

  & .category-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    width: 100%;
    min-height: 36px;
    margin-bottom: 4px;
    padding: 8px 12px;
    border: 0;
    border-radius: 4px;
    background: var(--el-fill-color-blank);
    color: var(--el-text-color-regular);
    font: inherit;
    letter-spacing: 0;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &--active {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }

  & .category-count {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    font-feature-settings: 'tnum';
  }

  & .component-card-scrollbar {
    overflow: hidden;
    min-height: 0;
    min-width: 0;
  }

  & .component-group {
    padding: 4px 16px 24px 4px;
  }

  & .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px;
    padding-top: 2px;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  & .category-button:focus-visible,
  & .card:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }

  & .component-card {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(240px, 100%), 1fr));
    gap: 20px;

    & .card {
      position: relative;
      min-width: 0;
      padding: 0;
      font: inherit;
      letter-spacing: 0;
      text-align: left;
      background-color: var(--el-fill-color-blank);
      border: 1px solid var(--el-border-color-light);
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        box-shadow 0.2s ease;

      &:hover,
      &:focus-visible {
        border-color: var(--el-border-color-darker);
        box-shadow: var(--el-box-shadow-light);

        & .thumbnail-image {
          transform: scale(1.08);
        }
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
        aspect-ratio: 4 / 3;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 12px;
        background: var(--el-fill-color-blank);
        box-sizing: border-box;

        & .thumbnail-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          transition: transform 0.3s ease;
          transform-origin: center;
        }
      }

      & .card-footer {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0;
        padding: 12px 16px;
        border-top: 1px solid var(--el-border-color-lighter);
        box-sizing: border-box;
      }

      & .card-heading {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        min-width: 0;
      }

      & .card-type,
      & .card-desc {
        min-width: 0;
        font-size: 12px;
        line-height: 1.5;
        color: var(--el-text-color-secondary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      & .card-type {
        flex: 0 1 auto;
        max-width: 50%;
        margin-left: auto;
        text-align: right;
      }

      & .card-desc {
        display: block;
        min-height: 18px;
      }

      & .card-name {
        flex: 1 1 0;
        min-width: 0;
        font-size: 14px;
        font-weight: 400;
        line-height: 1.57;
        letter-spacing: 0;
        color: var(--el-text-color-primary);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
@media (prefers-reduced-motion: reduce) {
  .dr-component-lib-wrapper .component-card .card {
    transition: none;

    & .image .thumbnail-image {
      transition: none;
      transform: none;
    }
  }
}
</style>
