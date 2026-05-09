<script setup lang="ts">
import {ref, onMounted} from 'vue'
import {ElMessage, ElMessageBox} from 'element-plus'
import {Search, Plus, MoreFilled, Folder, Monitor, Document} from '@element-plus/icons-vue'
import {useRouter} from 'vue-router'
import {pageApi, type PageEntity} from './api'
import visualScreenPlaceholder from './assets/image/大屏占位符.png'
import pagePlaceholder from './assets/image/仪表盘占位符.png'
import directoryPlaceholder from './assets/image/目录占位符.png'
import {PageType} from "@/dataroom-packages/constant/PageType.ts";
import {PageStatus} from "@/dataroom-packages/constant/PageStatus.ts";

// 新增类型选择对话框
const addDialogVisible = ref(false)

interface AddTypeOption {
  type: string
  name: string
  description: string
  icon: typeof Folder
}

const addTypeOptions: AddTypeOption[] = [
  {type: PageType.DIRECTORY, name: '目录', description: '用于分组管理页面和大屏资源', icon: Folder},
  {type: PageType.VISUAL_SCREEN, name: '大屏', description: '可视化大屏数据展示设计', icon: Monitor},
  {type: PageType.PAGE, name: '页面', description: '自定义仪表盘页面布局设计', icon: Document}
]

const handleShowAddDialog = () => {
  addDialogVisible.value = true
}

const handleSelectType = (pageType: string) => {
  addDialogVisible.value = false
  handleAdd(pageType)
}

const router = useRouter()
const searchName = ref('')
const pageList = ref<PageEntity[]>([])
const loading = ref(false)

// 面包屑导航
interface BreadcrumbItem {
  code: string
  name: string
}

const breadcrumbs = ref<BreadcrumbItem[]>([{code: 'root', name: '全部'}])
const currentParentCode = ref('root')

/**
 * 查询
 */
const getPageList = () => {
  loading.value = true
  try {
    const params: { name?: string; parentCode?: string } = {
      parentCode: currentParentCode.value
    }
    if (searchName.value) {
      params.name = searchName.value
    }
    pageApi.list(params).then((res) => {
      pageList.value = res || []
    })
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增页面/目录/大屏
const handleAdd = (pageType: string) => {
  let title = '新增页面'
  if (pageType === PageType.DIRECTORY) {
    title = '新增目录'
  } else if (pageType === PageType.VISUAL_SCREEN) {
    title = '新增大屏'
  }

  ElMessageBox.prompt('请输入名称', title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空'
  }).then(async ({value}) => {
    try {
      pageApi.insert({
        name: value,
        code: '',
        pageType: pageType,
        parentCode: currentParentCode.value
      }).then((res) => {
        ElMessage.success('新增成功')
        getPageList()
      })
    } catch (error) {
      console.error('新增失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 编辑名称
 * @param item
 */
const handleEdit = (item: PageEntity) => {
  let title = '编辑页面'
  if (item.pageType === PageType.DIRECTORY) {
    title = '编辑目录'
  } else if (item.pageType === PageType.VISUAL_SCREEN) {
    title = '编辑大屏'
  }

  ElMessageBox.prompt('请输入名称', title, {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '名称不能为空',
    inputValue: item.name
  }).then(async ({value}) => {
    try {
      pageApi.update({
        ...item,
        name: value
      }).then((res) => {
        ElMessage.success('修改成功')
        getPageList()
      })
    } catch (error) {
      console.error('修改失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 进入设计器
 * @param item
 */
const handleDesign = (item: PageEntity) => {
  if (item.pageType === PageType.VISUAL_SCREEN) {
    router.push({
      path: `/dataRoom/visualScreenDesigner/${item.code}`
    })
    return
  } else if (item.pageType === PageType.PAGE) {
    router.push({
      path: `/dataRoom/pageDesigner/${item.code}`
    })
    return
  }
}

/**
 * 发布
 * @param item
 */
const handlePublish = async (item: PageEntity) => {
  ElMessageBox.confirm(`确定要发布${item.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await pageApi.publish({
        pageCode: item.code,
        remark: '发布'
      })
      ElMessage.success('发布成功')
      getPageList()
    } catch (error) {
      console.error('发布失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 取消发布
 * @param item
 */
const handleOffline = async (item: PageEntity) => {
  ElMessageBox.confirm(`确定要取消发布${item.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await pageApi.offline({
        code: item.code,
        remark: '取消发布'
      })
      ElMessage.success('取消发布成功')
      getPageList()
    } catch (error) {
      console.error('取消发布失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 删除
 * @param page
 */
const handleDelete = (page: PageEntity) => {
  ElMessageBox.confirm(`确定要删除${page.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      pageApi.delete(page.code).then((res) => {
        ElMessage.success('删除成功')
        getPageList()
      })
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 预览
 * @param page
 */
const handlePreview = (page: PageEntity) => {
  let path = '/dataRoom/pagePreviewer'
  if (page.pageType === 'visualScreen') {
    path = '/dataRoom/visualScreenPreview'
  }
  router.push({
    path: path,
    query: {code: page.code}
  })
}

/**
 * 点击卡片
 * @param item
 */
const handleCardClick = (item: PageEntity) => {
  if (item.pageType === PageType.DIRECTORY) {
    // 如果是目录,进入该目录
    currentParentCode.value = item.code
    breadcrumbs.value.push({
      code: item.code,
      name: item.name
    })
    getPageList()
  } else {
    // 如果是页面或大屏,进入设计器
    handleDesign(item)
  }
}

/**
 * 获取类型名称
 * @param pageType
 */
const getTypeName = (pageType: string) => {
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

/**
 * 获取状态名称
 * @param status
 */
const getStatusName = (status?: string) => {
  switch (status?.toLowerCase()) {
    case PageStatus.PUBLISHED:
      return '已发布'
    case PageStatus.DESIGN:
      return '设计态'
    default:
      return '设计态'
  }
}

/**
 * 获取状态类型
 * @param status
 */
const getStatusType = (status?: string) => {
  switch (status?.toLowerCase()) {
    case PageStatus.PUBLISHED:
      return 'success'
    case PageStatus.DESIGN:
    default:
      return 'info'
  }
}

/**
 * 面包屑点击
 * @param index
 */
const handleBreadcrumbClick = (index: number) => {
  const item = breadcrumbs.value[index]
  if (!item) return
  currentParentCode.value = item.code
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
  getPageList()
}

/**
 * 获取默认占位图
 * @param pageType
 */
const getDefaultPlaceholder = (pageType: string) => {
  switch (pageType) {
    case PageType.DIRECTORY:
      return directoryPlaceholder
    case PageType.VISUAL_SCREEN:
      return visualScreenPlaceholder
    case PageType.PAGE:
      return pagePlaceholder
    default:
      return ''
  }
}

// 页面加载时获取列表
onMounted(() => {
  getPageList()
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
          <div class="page-card" v-for="item in pageList" :key="item.id">
            <div class="card-thumbnail" @click="handleCardClick(item)">
              <!-- 缩略图 -->
              <el-image
                v-if="item.pageType === PageType.DIRECTORY"
                :src="getDefaultPlaceholder(item.pageType)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image directory"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.pageType)" alt="目录占位图"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else-if="item.pageType === PageType.VISUAL_SCREEN"
                :src="item.thumbnail ? item.thumbnail : 'placeholder'"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.pageType)" alt="大屏占位图"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else-if="item.pageType === PageType.PAGE"
                :src="item.thumbnail ? item.thumbnail : 'placeholder'"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.pageType)" alt="页面占位图"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else
                :src="getDefaultPlaceholder(PageType.PAGE)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(PageType.PAGE)" alt="默认占位图"/>
                  </div>
                </template>
              </el-image>
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
                <el-dropdown trigger="click" @command="(command:string) => {
                  if (command === 'edit') handleEdit(item)
                  else if (command === 'design') handleDesign(item)
                  else if (command === 'publish') handlePublish(item)
                  else if (command === 'offline') handleOffline(item)
                  else if (command === 'delete') handleDelete(item)
                  else if (command === 'preview') handlePreview(item)
                }">
                  <el-icon class="more-icon">
                    <MoreFilled/>
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="design" v-if="item.pageType !== PageType.DIRECTORY">设计</el-dropdown-item>
                      <el-dropdown-item command="publish" v-if="item.pageStatus?.toLowerCase() !== PageStatus.PUBLISHED && item.pageType !== PageType.DIRECTORY">发布</el-dropdown-item>
                      <el-dropdown-item command="offline" v-if="item.pageStatus?.toLowerCase() === PageStatus.PUBLISHED && item.pageType !== PageType.DIRECTORY">取消发布</el-dropdown-item>
                      <el-dropdown-item command="preview" v-if="item.pageType !== PageType.DIRECTORY">预览</el-dropdown-item>
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
      margin-bottom: 20px;

      .page-card {
        background: #fff;
        border: 1px solid var(--dr-border);
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        .card-thumbnail {
          width: 100%;
          height: 180px;
          background-color: #f8f9fa;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12'%3E%3Cpath d='M6 4v4M4 6h4' stroke='%23dcdfe6' stroke-width='1' fill='none'/%3E%3C/svg%3E");
          background-size: 12px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;

          .thumbnail-image {
            width: 100%;
            height: 100%;

            .image-error {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;

              img {
                width: 60%;
                height: 60%;
                object-fit: contain;
              }
            }
          }

          .directory {
            width: 100px !important;
            height: 100px !important;
          }
        }

        .card-footer {
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--dr-border);

          .card-info {
            flex: 1;
            display: flex;
            align-items: center;
            overflow: hidden;
            margin-right: 8px;

            .type-label {
              flex-shrink: 0;
              font-size: 14px;
              color: var(--el-color-primary);
              font-weight: 500;
              margin-right: 16px;
            }

            .card-name {
              flex: 1;
              font-size: 14px;
              color: var(--dr-text);
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }

          .card-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            flex-shrink: 0;

            .more-icon {
              font-size: 18px;
              color: var(--dr-text);
              cursor: pointer;
              transition: color 0.3s;

              &:hover {
                color: var(--dr-primary);
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
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      border-color: var(--el-color-primary);
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    }

    .add-type-icon {
      font-size: 36px;
      color: var(--el-color-primary);
      margin-bottom: 12px;
    }

    .add-type-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .add-type-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
      text-align: center;
      line-height: 1.4;
    }
  }
}
</style>
