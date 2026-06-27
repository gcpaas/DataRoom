<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Document, EditPen, Folder, Monitor, MoreFilled, Plus, Search, View } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { pageApi, type PageEntity } from './api'
import visualScreenPlaceholder from './assets/image/大屏占位符.png'
import pagePlaceholder from './assets/image/仪表盘占位符.png'
import directoryPlaceholder from './assets/image/目录占位符.png'
import { PageStatus } from '@/dataRoom/constants/PageStatus.ts'
import { PageType } from '@/dataRoom/constants/PageType.ts'
import { getPageDesignPath, getPagePreviewPath } from './page-route.ts'

interface AddTypeOption {
  type: string
  name: string
  description: string
  icon: typeof Folder
}

interface BreadcrumbItem {
  code: string
  name: string
}

const addTypeOptions: AddTypeOption[] = [
  { type: PageType.DIRECTORY, name: '目录', description: '用于分组管理页面和大屏资源', icon: Folder },
  { type: PageType.VISUAL_SCREEN, name: '大屏', description: '可视化大屏数据展示设计', icon: Monitor },
  { type: PageType.PAGE, name: '页面', description: '自定义仪表盘页面布局设计', icon: Document },
]

const router = useRouter()
const searchName = ref('')
const pageList = ref<PageEntity[]>([])
const loading = ref(false)
const addDialogVisible = ref(false)
const breadcrumbs = ref<BreadcrumbItem[]>([{ code: 'root', name: '全部' }])
const currentParentCode = ref('root')

const isDirectoryPage = (pageType?: string) => pageType === PageType.DIRECTORY

const isPublishedStatus = (status?: string) => status?.toLowerCase() === PageStatus.PUBLISHED

const isMessageBoxCancel = (error: unknown) => ['cancel', 'close'].includes(String(error))

const canOperatePage = (item: PageEntity) => !isDirectoryPage(item.pageType)

const canPublishPage = (item: PageEntity) => canOperatePage(item) && !isPublishedStatus(item.pageStatus)

const canOfflinePage = (item: PageEntity) => canOperatePage(item) && isPublishedStatus(item.pageStatus)

const getTypeName = (pageType?: string) => {
  switch (pageType) {
    case PageType.DIRECTORY:
      return '目录'
    case PageType.VISUAL_SCREEN:
      return '大屏'
    case PageType.PAGE:
      return '页面'
    default:
      return ''
  }
}

const getDialogTitle = (action: string, pageType: string) => `${action}${getTypeName(pageType) || '页面'}`

const openRouteInNewWindow = (path: string) => {
  if (!path) {
    return
  }
  const resolvedRoute = router.resolve({ path })
  window.open(resolvedRoute.href, '_blank', 'noopener')
}

const getPageList = async () => {
  loading.value = true
  try {
    const params: { name?: string; parentCode?: string } = {
      parentCode: currentParentCode.value,
    }
    const keyword = searchName.value.trim()
    if (keyword) {
      params.name = keyword
    }
    pageList.value = (await pageApi.list(params)) || []
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

const handleShowAddDialog = () => {
  addDialogVisible.value = true
}

const handleSelectType = (pageType: string) => {
  addDialogVisible.value = false
  void handleAdd(pageType)
}

const handleAdd = async (pageType: string) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入名称', getDialogTitle('新增', pageType), {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空',
    })

    await pageApi.insert({
      name: value,
      code: '',
      pageType,
      parentCode: currentParentCode.value,
    })
    ElMessage.success('新增成功')
    await getPageList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('新增失败:', error)
    }
  }
}

const handleEdit = async (item: PageEntity) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入名称', getDialogTitle('编辑', item.pageType), {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S+/,
      inputErrorMessage: '名称不能为空',
      inputValue: item.name,
    })

    await pageApi.updateName(item.code, value)
    ElMessage.success('修改成功')
    await getPageList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('修改失败:', error)
    }
  }
}

const handleDesign = (item: PageEntity) => {
  openRouteInNewWindow(getPageDesignPath(item))
}

const handlePublish = async (item: PageEntity) => {
  try {
    await ElMessageBox.confirm(`确定要发布${item.name}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await pageApi.publish({
      pageCode: item.code,
      remark: '发布',
    })
    ElMessage.success('发布成功')
    await getPageList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('发布失败:', error)
    }
  }
}

const handleOffline = async (item: PageEntity) => {
  try {
    await ElMessageBox.confirm(`确定要取消发布${item.name}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await pageApi.offline({
      code: item.code,
      remark: '取消发布',
    })
    ElMessage.success('取消发布成功')
    await getPageList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('取消发布失败:', error)
    }
  }
}

const handleDelete = async (page: PageEntity) => {
  try {
    await ElMessageBox.confirm(`确定要删除${page.name}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await pageApi.delete(page.code)
    ElMessage.success('删除成功')
    await getPageList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('删除失败:', error)
    }
  }
}

const handlePreview = (page: PageEntity) => {
  openRouteInNewWindow(getPagePreviewPath(page))
}

const handleCardClick = (item: PageEntity) => {
  if (isDirectoryPage(item.pageType)) {
    currentParentCode.value = item.code
    breadcrumbs.value.push({
      code: item.code,
      name: item.name,
    })
    void getPageList()
    return
  }

  handleDesign(item)
}

const handleCardCommand = (command: string, item: PageEntity) => {
  switch (command) {
    case 'edit':
      void handleEdit(item)
      break
    case 'design':
      handleDesign(item)
      break
    case 'publish':
      void handlePublish(item)
      break
    case 'offline':
      void handleOffline(item)
      break
    case 'delete':
      void handleDelete(item)
      break
    case 'preview':
      handlePreview(item)
      break
  }
}

const getStatusName = (status?: string) => (isPublishedStatus(status) ? '已发布' : '设计态')

const getStatusType = (status?: string) => (isPublishedStatus(status) ? 'success' : 'info')

const handleBreadcrumbClick = (index: number) => {
  const item = breadcrumbs.value[index]
  if (!item) return
  currentParentCode.value = item.code
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
  void getPageList()
}

const getDefaultPlaceholder = (pageType?: string) => {
  switch (pageType) {
    case PageType.DIRECTORY:
      return directoryPlaceholder
    case PageType.VISUAL_SCREEN:
      return visualScreenPlaceholder
    case PageType.PAGE:
    default:
      return pagePlaceholder
  }
}

const getThumbnailSrc = (item: PageEntity) => {
  if (isDirectoryPage(item.pageType)) {
    return getDefaultPlaceholder(item.pageType)
  }
  return item.thumbnail || getDefaultPlaceholder(item.pageType)
}

const getPlaceholderAlt = (pageType?: string) => `${getTypeName(pageType) || '默认'}占位图`

onMounted(() => {
  void getPageList()
})
</script>

<template>
  <div class="dr-page">
    <div class="page-header">
      <div class="search-box">
        <el-input
          v-model="searchName"
          placeholder="请输入页面名称"
          :prefix-icon="Search"
          clearable
          @keyup.enter="getPageList"
        />
      </div>
      <div class="button-group">
        <el-button :icon="Search" @click="getPageList">查询</el-button>
        <el-button type="primary" :icon="Plus" @click="handleShowAddDialog">新增</el-button>
      </div>
      <div class="breadcrumb-box">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="item.code"
            :class="{clickable: index < breadcrumbs.length - 1}"
            @click="index < breadcrumbs.length - 1 ? handleBreadcrumbClick(index) : null"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="page-content" v-loading="loading">
      <el-scrollbar>
        <div class="card-list">
          <div class="page-card" v-for="item in pageList" :key="item.code">
            <div class="card-thumbnail" @click="handleCardClick(item)">
              <el-image
                :src="getThumbnailSrc(item)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
                :class="{ 'thumbnail-image--directory': isDirectoryPage(item.pageType) }"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.pageType)" :alt="getPlaceholderAlt(item.pageType)"/>
                  </div>
                </template>
              </el-image>
              <div v-if="canOperatePage(item)" class="card-hover-overlay" @click.stop>
                <div class="card-hover-actions">
                  <el-button :icon="EditPen" @click="handleCardCommand('design', item)">设计</el-button>
                  <el-button :icon="View" @click="handleCardCommand('preview', item)">预览</el-button>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <div class="card-info">
                <span class="type-label">{{ getTypeName(item.pageType) }}</span>
                <span class="card-name" :title="item.name">{{ item.name }}</span>
              </div>
              <div class="card-actions">
                <el-tag :type="getStatusType(item.pageStatus)" size="small" v-if="item.pageType !== PageType.DIRECTORY">
                  {{ getStatusName(item.pageStatus) }}
                </el-tag>
                <el-dropdown trigger="click" @command="(command:string) => handleCardCommand(command, item)">
                  <el-icon class="more-icon">
                    <MoreFilled/>
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="design" v-if="canOperatePage(item)">设计</el-dropdown-item>
                      <el-dropdown-item command="publish" v-if="canPublishPage(item)">发布</el-dropdown-item>
                      <el-dropdown-item command="offline" v-if="canOfflinePage(item)">取消发布</el-dropdown-item>
                      <el-dropdown-item command="preview" v-if="canOperatePage(item)">预览</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
        <el-empty :image-size="200" v-if="!loading && pageList.length === 0" description="暂无页面"/>
      </el-scrollbar>
    </div>

    <!-- 新增类型选择对话框 -->
    <el-dialog v-model="addDialogVisible" title="选择新增类型" width="560px" :close-on-click-modal="true">
      <div class="add-type-cards">
        <div
          v-for="option in addTypeOptions"
          :key="option.type"
          class="add-type-card"
          @click="handleSelectType(option.type)"
        >
          <el-icon class="add-type-icon">
            <component :is="option.icon"/>
          </el-icon>
          <div class="add-type-name">{{ option.name }}</div>
          <div class="add-type-desc">{{ option.description }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dr-page {
  display: flex;
  box-sizing: content-box;
  flex-direction: column;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 16px;
    gap: 16px;

    .search-box {
      width: 300px;
    }

    .button-group {
      display: flex;
      gap: 8px;
    }

    .breadcrumb-box {
      flex: 1;
      display: flex;
      justify-content: flex-end;
      align-items: center;

      .clickable {
        cursor: pointer;
        color: var(--el-color-primary);
        transition: color 0.2s ease;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  }

  .page-content {
    flex: 1;
    overflow: hidden;

    .card-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      padding: 2px;
      margin-bottom: 20px;

      .page-card {
        background: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        transition: border-color 0.2s ease, background-color 0.2s ease;
        cursor: pointer;

        &:hover {
          border-color: var(--el-border-color);
        }

        .card-thumbnail {
          position: relative;
          width: 100%;
          height: 180px;
          background-color: var(--el-fill-color-extra-light);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
          box-sizing: border-box;

          .thumbnail-image {
            width: 100%;
            height: 100%;

            &.thumbnail-image--directory {
              width: 100px;
              height: 100px;
            }

            .image-error {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;

              img {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain;
              }
            }
          }

          .card-hover-overlay {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;

            &::before {
              content: '';
              position: absolute;
              inset: 0;
              background: var(--el-color-primary-light-9);
              opacity: 0.86;
            }

            .card-hover-actions {
              position: relative;
              z-index: 1;
              display: flex;
              align-items: center;
              gap: 12px;
            }
          }

          &:hover,
          &:focus-within {
            .card-hover-overlay {
              opacity: 1;
              pointer-events: auto;
            }
          }
        }

        .card-footer {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--el-border-color-lighter);

          .card-info {
            flex: 1;
            display: flex;
            align-items: center;
            overflow: hidden;
            margin-right: 8px;

            .type-label {
              flex-shrink: 0;
              font-size: 12px;
              font-weight: 500;
              line-height: 1.33;
              color: var(--el-color-primary);
              background: var(--el-color-primary-light-9);
              padding: 2px 8px;
              border-radius: 9999px;
              margin-right: 12px;
            }

            .card-name {
              flex: 1;
              font-size: 14px;
              font-weight: 600;
              color: var(--el-text-color-primary);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .card-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;

            .more-icon {
              font-size: 18px;
              color: var(--el-text-color-secondary);
              cursor: pointer;
              transition: color 0.2s ease;

              &:hover {
                color: var(--el-color-primary);
              }
            }
          }
        }
      }
    }
  }
}

.add-type-cards {
  display: flex;
  gap: 16px;
  justify-content: center;

  .add-type-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    .add-type-icon {
      font-size: 36px;
      color: var(--el-color-primary);
      margin-bottom: 12px;
    }

    .add-type-name {
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .add-type-desc {
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
      text-align: center;
      line-height: 1.4;
    }
  }
}
</style>
