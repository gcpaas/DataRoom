<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { Search, Plus, MoreFilled, Folder, Picture, VideoCamera, Check } from '@element-plus/icons-vue'
import { resourceApi, type ResourceEntity } from './api'
import { getCookie, getCookieName } from '@/dataroom-packages/_common/_cookie'
import directoryPlaceholder from '../page/assets/image/目录占位符.png'
import imagePlaceholder from './assets/image/图片占位符.png'
import videoPlaceholder from './assets/image/视频占位符.png'
import {ResourceType} from "@/dataroom-packages/constant/ResourceType.ts";

interface Props {
  selectable?: boolean // 是否可选择模式
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false
})


const emit = defineEmits<{
  'update:selectedResource': [resource: ResourceEntity | null]
}>()

const searchName = ref('')
const resourceList = ref<ResourceEntity[]>([])
const loading = ref(false)
const selectedResource = ref<ResourceEntity | null>(null)

// 面包屑导航
interface BreadcrumbItem {
  code: string
  name: string
}
const breadcrumbs = ref<BreadcrumbItem[]>([{ code: 'root', name: '全部' }])
const currentParentCode = ref('root')

// 上传相关
const uploadDialogVisible = ref(false)
const editingResource = ref<ResourceEntity | null>(null)
const uploadRef = ref<InstanceType<typeof ElUpload>>()
const uploadUrl = `${import.meta.env.VITE_API_BASE_URL}/dataRoom/resource/upload`
const resourceBaseUrl = import.meta.env.VITE_RESOURCE_BASE_URL || ''

// 上传请求头，携带token
const uploadHeaders = computed(() => {
  const cookieName = getCookieName()
  const cookieValue = getCookie(cookieName)
  return {
    [cookieName]: cookieValue
  }
})

// 获取完整的资源URL
const getResourceUrl = (url?: string) => {
  if (!url) return ''
  // 如果URL已经是完整的http/https地址，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  // 否则拼接基础路径
  return `${resourceBaseUrl}${url}`
}

/**
 * 查询
 */
const getResourceList = () => {
  loading.value = true
  try {
    const params: { name?: string; parentCode?: string } = {
      parentCode: currentParentCode.value
    }
    if (searchName.value) {
      params.name = searchName.value
    }
    resourceApi.list(params).then((res) => {
      resourceList.value = res || []
    })
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 上传资源
const handleUpload = (command?: string) => {
  if (command === 'directory') {
    // 对于目录，直接弹出对话框让用户输入名称，不需要上传文件
    editingResource.value = {
      name: '',
      resourceType: ResourceType.DIRECTORY,
      parentCode: currentParentCode.value
    }
    uploadDialogVisible.value = true
  } else {
    // 对于图片和视频，需要上传文件
    editingResource.value = {
      name: '',
      resourceType: command === 'video' ? ResourceType.VIDEO : ResourceType.IMAGE,
      parentCode: currentParentCode.value
    }
    uploadDialogVisible.value = true
  }
}

// 编辑资源
const handleEdit = (item: ResourceEntity) => {
  editingResource.value = { ...item }
  uploadDialogVisible.value = true
}

// 文件上传成功回调 - 只更新临时数据，不直接保存
const handleUploadSuccess = (response: any) => {
  if (response) {
    console.log(response)
    const res = response.data as ResourceEntity
    // 将上传返回的数据中的path、url、size、resourceType、originalName更新到editingResource
    // 如果用户没有填写资源名称，则使用原始文件名自动填充
    editingResource.value = {
      ...editingResource.value,
      name: editingResource.value?.name || res.originalName || response.name,
      originalName: res.originalName,
      path: res.path,
      url: res.url,
      size: res.size,
      resourceType: res.resourceType || editingResource.value?.resourceType!
    }
    ElMessage.success('文件上传成功，请点击确定保存')
  }
}

// 文件上传错误回调
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

// 删除资源
const handleDelete = (resource: ResourceEntity) => {
  ElMessageBox.confirm(`确定要删除${resource.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      resourceApi.delete(resource.id!).then((res) => {
        ElMessage.success('删除成功')
        getResourceList()
      })
    } catch (error) {
      console.error('删除失败:', error)
    }
  }).catch(() => {
  })
}

/**
 * 点击卡片
 * @param item
 */
const handleCardClick = (item: ResourceEntity) => {
  if (props.selectable) {
    // 选择模式：只能选择非目录的资源
    if (item.resourceType !== ResourceType.DIRECTORY) {
      toggleResourceSelection(item)
    } else {
      // 如果是目录,进入该目录
      currentParentCode.value = item.id || ''
      breadcrumbs.value.push({
        code: item.id || '',
        name: item.name
      })
      getResourceList()
    }
  } else {
    // 非选择模式：原有逻辑
    if (item.resourceType === ResourceType.DIRECTORY) {
      // 如果是目录,进入该目录
      currentParentCode.value = item.id || ''
      breadcrumbs.value.push({
        code: item.id || '',
        name: item.name
      })
      getResourceList()
    } else {
      // 对于图片或视频，可能需要预览或其他操作
      // 暂时不做任何操作，或者可以实现预览功能
      console.log('点击了非目录资源:', item)
    }
  }
}

/**
 * 切换资源选中状态(单选模式)
 * @param item
 */
const toggleResourceSelection = (item: ResourceEntity) => {
  // 单选模式:直接替换为当前选中项
  const isSameItem = selectedResource.value?.id === item.id
  if (isSameItem) {
    // 如果点击的是已选中的项,则取消选中
    selectedResource.value = null
  } else {
    // 否则替换为当前项
    selectedResource.value = item
  }
  emit('update:selectedResource', selectedResource.value)
}

/**
 * 检查资源是否被选中
 * @param item
 */
const isResourceSelected = (item: ResourceEntity) => {
  return selectedResource.value?.id === item.id
}

/**
 * 获取类型名称
 * @param resourceType
 */
const getTypeName = (resourceType: string) => {
  switch (resourceType) {
    case ResourceType.DIRECTORY:
      return '目录'
    case ResourceType.IMAGE:
      return '图片'
    case ResourceType.VIDEO:
      return '视频'
    default:
      return ''
  }
}

/**
 * 获取类型图标
 * @param resourceType
 */
const getTypeIcon = (resourceType: string) => {
  switch (resourceType) {
    case ResourceType.DIRECTORY:
      return Folder
    case ResourceType.IMAGE:
      return Picture
    case ResourceType.VIDEO:
      return VideoCamera
    default:
      return null
  }
}

/**
 * 获取默认占位图
 * @param resourceType
 */
const getDefaultPlaceholder = (resourceType: string) => {
  switch (resourceType) {
    case ResourceType.DIRECTORY:
      return directoryPlaceholder
    case ResourceType.IMAGE:
      return imagePlaceholder
    case ResourceType.VIDEO:
      return videoPlaceholder
    default:
      return imagePlaceholder
  }
}

/**
 * 面包屑点击
 * @param index
 */
const handleBreadcrumbClick = (index: number) => {
  const item = breadcrumbs.value[index]!
  currentParentCode.value = item.code
  breadcrumbs.value = breadcrumbs.value.slice(0, index + 1)
  getResourceList()
}

// 确认保存
const handleEditConfirm = () => {
  if (!editingResource.value?.name) {
    ElMessage.warning('请输入资源名称')
    return
  }

  // 对于图片和视频类型，需要检查是否已上传文件
  if (editingResource.value?.resourceType !== ResourceType.DIRECTORY) {
    if (!editingResource.value?.path && !editingResource.value?.id) {
      ElMessage.warning('请先上传文件')
      return
    }
  }

  if (editingResource.value?.id) {
    // 更新资源
    resourceApi.update(editingResource.value).then(() => {
      ElMessage.success('更新成功')
      uploadDialogVisible.value = false
      getResourceList()
    })
  } else {
    // 新增资源
    resourceApi.insert(editingResource.value).then(() => {
      ElMessage.success('创建成功')
      uploadDialogVisible.value = false
      getResourceList()
    })
  }
}

// 页面加载时获取列表
onMounted(() => {
  getResourceList()
})
</script>

<template>
  <div class="dr-resource">
    <div class="resource-header">
      <div class="search-box">
        <el-input
          v-model="searchName"
          placeholder="请输入资源名称"
          :prefix-icon="Search"
          clearable
          @keyup.enter="getResourceList"
        />
      </div>
      <div class="button-group">
        <el-button :icon="Search" @click="getResourceList">查询</el-button>
        <el-dropdown trigger="click" @command="handleUpload">
          <el-button type="primary" :icon="Plus">
            新增<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="directory">
                <el-icon><Folder /></el-icon>
                <span>目录</span>
              </el-dropdown-item>
              <el-dropdown-item command="image">
                <el-icon><Picture /></el-icon>
                <span>图片</span>
              </el-dropdown-item>
              <el-dropdown-item command="video">
                <el-icon><VideoCamera /></el-icon>
                <span>视频</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="breadcrumb-box">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item
            v-for="(item, index) in breadcrumbs"
            :key="item.code"
            :class="{ clickable: index < breadcrumbs.length - 1 }"
            @click="index < breadcrumbs.length - 1 ? handleBreadcrumbClick(index) : null"
          >
            {{ item.name }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
    </div>

    <div class="resource-content" v-loading="loading">
      <el-scrollbar>
        <div class="card-list">
          <div class="resource-card" v-for="item in resourceList" :key="item.id" :class="{ selected: props.selectable && isResourceSelected(item) }">
            <div class="card-thumbnail" @click="handleCardClick(item)">
              <!-- 选中标记 -->
              <div class="selection-overlay" v-if="props.selectable && item.resourceType !== ResourceType.DIRECTORY">
                <el-icon class="selection-icon" v-if="isResourceSelected(item)">
                  <Check />
                </el-icon>
              </div>
              <!-- 缩略图 -->
              <el-image
                v-if="item.resourceType === ResourceType.DIRECTORY"
                :src="getDefaultPlaceholder(item.resourceType)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image directory"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.resourceType)" alt="目录占位图"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else-if="item.resourceType === ResourceType.IMAGE"
                :src="item.url ? getResourceUrl(item.url) : getDefaultPlaceholder(item.resourceType)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.resourceType)" alt="图片占位符"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else-if="item.resourceType === ResourceType.VIDEO"
                :src="getDefaultPlaceholder(item.resourceType)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image video"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.resourceType)" alt="视频占位符"/>
                  </div>
                </template>
              </el-image>
              <el-image
                v-else
                :src="getDefaultPlaceholder(ResourceType.IMAGE)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(ResourceType.IMAGE)" alt="默认占位图"/>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="card-footer">
              <div class="card-info">
                <span class="type-label">{{ getTypeName(item.resourceType) }}</span>
                <span class="card-name" :title="item.name">{{ item.name }}</span>
              </div>
              <div class="card-actions" v-if="!props.selectable">
                <el-dropdown trigger="click" @command="(command: string) => {
                  if (command === 'edit') handleEdit(item)
                  else if (command === 'delete') handleDelete(item)
                }">
                  <el-icon class="more-icon">
                    <MoreFilled />
                  </el-icon>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </div>
        <el-empty :image-size="200" v-if="!loading && resourceList.length === 0" description="暂无资源" />
      </el-scrollbar>
    </div>

    <!-- 上传/编辑对话框 -->
    <el-dialog
      :title="editingResource?.id ? '编辑资源' : '上传资源'"
      v-model="uploadDialogVisible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px">
        <el-form-item label="资源名称">
          <el-input v-model="editingResource!.name" placeholder="请输入资源名称" />
        </el-form-item>
        <el-form-item label="资源类型">
          <el-select v-model="editingResource!.resourceType" placeholder="请选择资源类型" :disabled="!!editingResource?.id">
            <el-option :value="ResourceType.DIRECTORY" label="目录" />
            <el-option :value="ResourceType.IMAGE" label="图片" />
            <el-option :value="ResourceType.VIDEO" label="视频" />
          </el-select>
        </el-form-item>
        <el-form-item label="上传文件" v-if="editingResource?.resourceType !== ResourceType.DIRECTORY">
          <el-upload
            ref="uploadRef"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :auto-upload="true"
            :show-file-list="true"
            :limit="1"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ editingResource?.id ? '点击选择文件重新上传' : '请选择要上传的文件' }}
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editingResource!.remark"
            type="textarea"
            placeholder="请输入描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="uploadDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          @click="handleEditConfirm()"
        >
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dr-resource {
  display: flex;
  box-sizing: content-box;
  flex-direction: column;

  .resource-header {
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

  .resource-content {
    flex: 1;
    overflow: hidden;

    .card-list {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;

      .resource-card {
        background: #fff;
        border: 1px solid var(--dr-border);
        border-radius: 4px;
        overflow: hidden;
        transition: all 0.3s;
        cursor: pointer;

        &:hover {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }

        &.selected {
          border: 2px solid var(--el-color-primary);
          box-shadow: 0 2px 12px 0 rgba(64, 158, 255, 0.3);
        }

        .card-thumbnail {
          width: 100%;
          height: 180px;
          background: var(--dr-bg2);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
          position: relative;

          .selection-overlay {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10;

            .selection-icon {
              font-size: 24px;
              color: var(--el-color-primary);
            }
          }

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

          .video {
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
</style>
