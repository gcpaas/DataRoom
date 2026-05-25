<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox, ElUpload } from 'element-plus'
import { Box, Check, Folder, MoreFilled, Picture, Plus, Search, VideoCamera } from '@element-plus/icons-vue'
import { resourceApi, type ResourceEntity } from './api'
import { getCookie, getCookieName } from '@/dataroom-packages/_common/_cookie'
import directoryPlaceholder from '../page/assets/image/目录占位符.png'
import imagePlaceholder from './assets/image/图片占位符.png'
import videoPlaceholder from './assets/image/视频占位符.png'
import modelPlaceholder from './assets/image/模型占位符.png'
import { ResourceType } from '@/dataroom-packages/constant/ResourceType.ts'
import ModelPreview from '@/dataroom-packages/three/ModelPreview.vue'

interface Props {
  selectable?: boolean // 是否可选择模式
}

interface UploadResponse {
  name?: string
  data?: ResourceEntity
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false,
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

// 新增类型选择对话框
const typeSelectDialogVisible = ref(false)
const resourceTypeOptions = [
  {
    type: ResourceType.DIRECTORY,
    name: '目录',
    description: '创建文件夹来归类管理资源',
    icon: Folder,
  },
  {
    type: ResourceType.IMAGE,
    name: '图片',
    description: '上传JPG、PNG等格式图片',
    icon: Picture,
  },
  {
    type: ResourceType.VIDEO,
    name: '视频',
    description: '上传MP4等格式的视频文件',
    icon: VideoCamera,
  },
  {
    type: ResourceType.MODEL,
    name: '3D模型',
    description: '上传GLB、GLTF、OBJ、STL格式3D模型',
    icon: Box,
  },
]

// 图片详情弹框
const imageDetailDialogVisible = ref(false)
const imageDetailResource = ref<ResourceEntity | null>(null)
const imageNaturalWidth = ref(0)
const imageNaturalHeight = ref(0)
const imageReUploadRef = ref<InstanceType<typeof ElUpload>>()

// 视频详情弹框
const videoDetailDialogVisible = ref(false)
const videoDetailResource = ref<ResourceEntity | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const videoNaturalWidth = ref(0)
const videoNaturalHeight = ref(0)
const coverUploadRef = ref<InstanceType<typeof ElUpload>>()
const capturingCover = ref(false)

// 模型详情弹框
const modelDetailDialogVisible = ref(false)
const modelDetailResource = ref<ResourceEntity | null>(null)

// 上传请求头，携带token
const uploadHeaders = computed(() => {
  const cookieName = getCookieName()
  const cookieValue = getCookie(cookieName)
  return {
    [cookieName]: cookieValue,
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

// 格式化文件大小
const formatFileSize = (sizeInKB?: number) => {
  if (!sizeInKB) return '未知'
  if (sizeInKB < 1024) return `${sizeInKB.toFixed(2)} KB`
  return `${(sizeInKB / 1024).toFixed(2)} MB`
}

// 格式化日期时间为 yyyy-MM-dd HH:mm:ss
const formatDateTime = (dateStr?: string) => {
  if (!dateStr) return '未知'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/**
 * 查询
 */
const getResourceList = async () => {
  loading.value = true
  try {
    const params: { name?: string; parentCode?: string } = {
      parentCode: currentParentCode.value,
    }
    const keyword = searchName.value.trim()
    if (keyword) {
      params.name = keyword
    }
    resourceList.value = (await resourceApi.list(params)) || []
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

// 打开新增类型选择对话框
const handleAdd = () => {
  typeSelectDialogVisible.value = true
}

// 选择资源类型后打开对应的新增表单
const handleSelectType = (type: string) => {
  typeSelectDialogVisible.value = false
  let resourceType: (typeof ResourceType)[keyof typeof ResourceType]
  switch (type) {
    case ResourceType.DIRECTORY:
      resourceType = ResourceType.DIRECTORY
      break
    case ResourceType.VIDEO:
      resourceType = ResourceType.VIDEO
      break
    case ResourceType.MODEL:
      resourceType = ResourceType.MODEL
      break
    default:
      resourceType = ResourceType.IMAGE
  }
  editingResource.value = {
    name: '',
    resourceType,
    parentCode: currentParentCode.value,
  }
  uploadDialogVisible.value = true
}

// 编辑资源
const handleEdit = (item: ResourceEntity) => {
  editingResource.value = { ...item }
  uploadDialogVisible.value = true
}

// 文件上传成功回调 - 只更新临时数据，不直接保存
const handleUploadSuccess = (response: UploadResponse) => {
  if (response?.data) {
    const res = response.data
    if (!editingResource.value) return
    // 将上传返回的数据中的path、url、size、resourceType、originalName更新到editingResource
    // 如果用户没有填写资源名称，则使用原始文件名自动填充
    editingResource.value = {
      ...editingResource.value,
      name: editingResource.value.name || res.originalName || response.name || '',
      originalName: res.originalName,
      path: res.path,
      url: res.url,
      size: res.size,
      resourceType: res.resourceType || editingResource.value.resourceType || ResourceType.IMAGE,
    }
    ElMessage.success('文件上传成功，请点击确定保存')
  }
}

// 文件上传错误回调
const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const isMessageBoxCancel = (error: unknown) => ['cancel', 'close'].includes(String(error))

// 删除资源
const handleDelete = async (resource: ResourceEntity) => {
  if (!resource.id) return
  try {
    await ElMessageBox.confirm(`确定要删除${resource.name}吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await resourceApi.delete(resource.id)
    ElMessage.success('删除成功')
    await getResourceList()
  } catch (error) {
    if (!isMessageBoxCancel(error)) {
      console.error('删除失败:', error)
    }
  }
}

const openDirectory = (item: ResourceEntity) => {
  currentParentCode.value = item.id || ''
  breadcrumbs.value.push({
    code: item.id || '',
    name: item.name,
  })
  void getResourceList()
}

const isDirectoryResource = (resourceType?: string) => resourceType === ResourceType.DIRECTORY

const isSelectableResource = (item: ResourceEntity) => !isDirectoryResource(item.resourceType)

/**
 * 点击卡片
 * @param item
 */
const handleCardClick = (item: ResourceEntity) => {
  if (props.selectable) {
    if (isSelectableResource(item)) {
      toggleResourceSelection(item)
    } else {
      openDirectory(item)
    }
    return
  }

  if (isDirectoryResource(item.resourceType)) {
    openDirectory(item)
  } else if (item.resourceType === ResourceType.IMAGE) {
    openImageDetail(item)
  } else if (item.resourceType === ResourceType.VIDEO) {
    openVideoDetail(item)
  } else if (item.resourceType === ResourceType.MODEL) {
    openModelDetail(item)
  }
}

// 打开图片详情弹框
const openImageDetail = (item: ResourceEntity) => {
  imageDetailResource.value = { ...item }
  imageNaturalWidth.value = 0
  imageNaturalHeight.value = 0
  imageDetailDialogVisible.value = true
  // 获取图片尺寸
  if (item.url) {
    const img = new Image()
    img.onload = () => {
      imageNaturalWidth.value = img.naturalWidth
      imageNaturalHeight.value = img.naturalHeight
    }
    img.src = getResourceUrl(item.url)
  }
}

// 图片重新上传成功
const handleImageReUploadSuccess = (response: UploadResponse) => {
  if (response?.data) {
    const res = response.data
    if (!imageDetailResource.value) return
    imageDetailResource.value = {
      ...imageDetailResource.value,
      originalName: res.originalName,
      path: res.path,
      url: res.url,
      size: res.size,
    }
    // 更新到数据库
    resourceApi.update(imageDetailResource.value!).then(() => {
      ElMessage.success('图片更新成功')
      void getResourceList()
      // 重新获取图片尺寸
      if (imageDetailResource.value?.url) {
        const img = new Image()
        img.onload = () => {
          imageNaturalWidth.value = img.naturalWidth
          imageNaturalHeight.value = img.naturalHeight
        }
        img.src = getResourceUrl(imageDetailResource.value.url)
      }
    })
  }
}

// 打开视频详情弹框
const openVideoDetail = (item: ResourceEntity) => {
  videoDetailResource.value = { ...item }
  videoNaturalWidth.value = 0
  videoNaturalHeight.value = 0
  videoDetailDialogVisible.value = true
  nextTick(() => {
    if (videoRef.value) {
      videoRef.value.addEventListener('loadedmetadata', () => {
        videoNaturalWidth.value = videoRef.value!.videoWidth
        videoNaturalHeight.value = videoRef.value!.videoHeight
      })
    }
  })
}

// 视频截图作为封面
const handleVideoCapturecover = () => {
  if (!videoRef.value) return
  capturingCover.value = true
  const video = videoRef.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  canvas.toBlob((blob) => {
    if (!blob) {
      ElMessage.error('截图失败')
      capturingCover.value = false
      return
    }
    const formData = new FormData()
    formData.append('file', blob, `cover_${Date.now()}.png`)
    // 上传截图
    const cookieName = getCookieName()
    const cookieValue = getCookie(cookieName)
    fetch(uploadUrl, {
      method: 'POST',
      headers: { [cookieName]: cookieValue },
      body: formData,
    })
      .then((res) => res.json())
      .then((response) => {
        const res = response.data as ResourceEntity
        videoDetailResource.value = {
          ...videoDetailResource.value!,
          thumbnail: res.url,
        }
        // 更新到数据库
        resourceApi.update(videoDetailResource.value!).then(() => {
          ElMessage.success('封面更新成功')
          capturingCover.value = false
          void getResourceList()
        })
      })
      .catch(() => {
        ElMessage.error('封面上传失败')
        capturingCover.value = false
      })
  }, 'image/png')
}

// 手动上传封面成功
const handleCoverUploadSuccess = (response: UploadResponse) => {
  if (response?.data) {
    const res = response.data
    if (!videoDetailResource.value) return
    videoDetailResource.value = {
      ...videoDetailResource.value,
      thumbnail: res.url,
    }
    // 更新到数据库
    resourceApi.update(videoDetailResource.value!).then(() => {
      ElMessage.success('封面更新成功')
      void getResourceList()
    })
  }
}

// 打开模型详情弹框
const openModelDetail = (item: ResourceEntity) => {
  modelDetailResource.value = { ...item }
  modelDetailDialogVisible.value = true
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
    case ResourceType.MODEL:
      return '3D模型'
    default:
      return ''
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
    case ResourceType.MODEL:
      return modelPlaceholder
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
  void getResourceList()
}

// 模型封面上传成功回调
const handleModelCoverUploadSuccess = (response: UploadResponse) => {
  if (response?.data) {
    const res = response.data
    if (!editingResource.value) return
    editingResource.value = {
      ...editingResource.value,
      thumbnail: res.url,
    }
    ElMessage.success('封面上传成功')
  }
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
      void getResourceList()
    })
  } else {
    // 新增资源
    resourceApi.insert(editingResource.value).then(() => {
      ElMessage.success('创建成功')
      uploadDialogVisible.value = false
      void getResourceList()
    })
  }
}

const getResourceThumbnailSrc = (item: ResourceEntity) => {
  if (item.resourceType === ResourceType.IMAGE && item.url) {
    return getResourceUrl(item.url)
  }
  if ((item.resourceType === ResourceType.VIDEO || item.resourceType === ResourceType.MODEL) && item.thumbnail) {
    return getResourceUrl(item.thumbnail)
  }
  return getDefaultPlaceholder(item.resourceType)
}

const getResourceThumbnailClass = (item: ResourceEntity) => ({
  'thumbnail-image--directory': item.resourceType === ResourceType.DIRECTORY,
  'thumbnail-image--media': item.resourceType === ResourceType.VIDEO || item.resourceType === ResourceType.MODEL,
})

const getPlaceholderAlt = (resourceType?: string) => `${getTypeName(resourceType || '') || '默认'}占位图`

const handleCardCommand = (command: string, item: ResourceEntity) => {
  switch (command) {
    case 'edit':
      handleEdit(item)
      break
    case 'delete':
      void handleDelete(item)
      break
  }
}

// 页面加载时获取列表
onMounted(() => {
  void getResourceList()
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
        <el-button type="primary" :icon="Plus" @click="handleAdd">新增</el-button>
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
          <div
            class="resource-card"
            v-for="item in resourceList"
            :key="item.id"
            :class="{ selected: props.selectable && isResourceSelected(item) }"
          >
            <div class="card-thumbnail" @click="handleCardClick(item)">
              <div class="selection-overlay" v-if="props.selectable && isSelectableResource(item)">
                <el-icon class="selection-icon" v-if="isResourceSelected(item)">
                  <Check />
                </el-icon>
              </div>
              <el-image
                :src="getResourceThumbnailSrc(item)"
                :lazy="true"
                fit="contain"
                class="thumbnail-image"
                :class="getResourceThumbnailClass(item)"
              >
                <template #error>
                  <div class="image-error">
                    <img :src="getDefaultPlaceholder(item.resourceType)" :alt="getPlaceholderAlt(item.resourceType)" />
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
                <el-dropdown trigger="click" @command="(command: string) => handleCardCommand(command, item)">
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

    <!-- 新增类型选择对话框 -->
    <el-dialog
      title="选择资源类型"
      v-model="typeSelectDialogVisible"
      width="560px"
      :close-on-click-modal="true"
    >
      <div class="type-select-cards">
        <div
          class="type-card"
          v-for="item in resourceTypeOptions"
          :key="item.type"
          @click="handleSelectType(item.type)"
        >
          <div class="type-card-icon">
            <el-icon :size="32"><component :is="item.icon" /></el-icon>
          </div>
          <div class="type-card-name">{{ item.name }}</div>
          <div class="type-card-desc">{{ item.description }}</div>
        </div>
      </div>
    </el-dialog>

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
            <el-option :value="ResourceType.MODEL" label="3D模型" />
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
            :accept="editingResource?.resourceType === ResourceType.MODEL ? '.glb,.gltf,.obj,.stl' : undefined"
          >
            <template #trigger>
              <el-button type="primary">选择文件</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">
                {{ editingResource?.id ? '点击选择文件重新上传' : '请选择要上传的文件' }}
                <span v-if="editingResource?.resourceType === ResourceType.MODEL">（支持 GLB、GLTF、OBJ、STL 格式）</span>
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <!-- 模型封面 -->
        <el-form-item label="模型封面" v-if="editingResource?.resourceType === ResourceType.MODEL">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :on-success="handleModelCoverUploadSuccess"
            :on-error="handleUploadError"
            :auto-upload="true"
            :show-file-list="false"
            accept="image/*"
          >
            <template #trigger>
              <el-button>选择封面图片</el-button>
            </template>
            <template #tip>
              <div class="el-upload__tip">请选择 JPG、PNG 格式的封面图片</div>
            </template>
          </el-upload>
          <div v-if="editingResource?.thumbnail" class="model-cover-preview">
            <el-image :src="getResourceUrl(editingResource.thumbnail)" fit="cover" class="model-cover-image" />
          </div>
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

    <!-- 图片详情弹框 -->
    <el-dialog
      :title="`${imageDetailResource?.name || ''}–详情`"
      v-model="imageDetailDialogVisible"
      width="720px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="image-detail-content">
        <div class="image-detail-preview">
          <el-image
            :src="getResourceUrl(imageDetailResource?.url)"
            fit="contain"
            class="detail-image"
          />
        </div>
        <div class="image-detail-info">
          <h3>文件信息</h3>
          <div class="info-item">
            <span class="info-label">文件名称：</span>
            <span class="info-value">{{ imageDetailResource?.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">文件大小：</span>
            <span class="info-value tnum">{{ formatFileSize(imageDetailResource?.size) }}</span>
          </div>
          <div class="info-item" v-if="imageNaturalWidth && imageNaturalHeight">
            <span class="info-label">文件尺寸：</span>
            <span class="info-value tnum">{{ imageNaturalWidth }} x {{ imageNaturalHeight }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">上传时间：</span>
            <span class="info-value tnum">{{ formatDateTime(imageDetailResource?.createDate) }}</span>
          </div>
          <div class="image-detail-actions">
            <el-upload
              ref="imageReUploadRef"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :on-success="handleImageReUploadSuccess"
              :on-error="handleUploadError"
              :auto-upload="true"
              :show-file-list="false"
              accept="image/*"
            >
              <template #trigger>
                <el-button type="primary">重新上传</el-button>
              </template>
            </el-upload>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 视频详情弹框 -->
    <el-dialog
      :title="`${videoDetailResource?.name || ''}–详情`"
      v-model="videoDetailDialogVisible"
      width="860px"
      :close-on-click-modal="true"
      destroy-on-close
    >
      <div class="video-detail-content">
        <div class="video-detail-left">
          <div class="video-detail-player">
            <video
              ref="videoRef"
              :src="getResourceUrl(videoDetailResource?.url)"
              controls
              class="detail-video"
              crossorigin="anonymous"
            />
          </div>
        </div>
        <div class="video-detail-right">
          <div class="video-detail-info">
            <h3>文件信息</h3>
            <div class="info-item">
              <span class="info-label">文件名称：</span>
              <span class="info-value">{{ videoDetailResource?.name }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">文件大小：</span>
              <span class="info-value tnum">{{ formatFileSize(videoDetailResource?.size) }}</span>
            </div>
            <div class="info-item" v-if="videoNaturalWidth && videoNaturalHeight">
              <span class="info-label">文件尺寸：</span>
              <span class="info-value tnum">{{ videoNaturalWidth }} x {{ videoNaturalHeight }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">上传时间：</span>
              <span class="info-value tnum">{{ formatDateTime(videoDetailResource?.createDate) }}</span>
            </div>
          </div>
          <div class="video-detail-cover">
            <h3>封面信息</h3>
            <div class="cover-preview">
              <el-image
                v-if="videoDetailResource?.thumbnail"
                :src="getResourceUrl(videoDetailResource.thumbnail)"
                fit="contain"
                class="cover-image"
              />
              <div v-else class="cover-empty">暂无封面</div>
            </div>
            <div class="cover-actions">
              <el-button type="primary" :loading="capturingCover" @click="handleVideoCapturecover">截取封面</el-button>
              <el-upload
                ref="coverUploadRef"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :on-success="handleCoverUploadSuccess"
                :on-error="handleUploadError"
                :auto-upload="true"
                :show-file-list="false"
                accept="image/*"
              >
                <template #trigger>
                  <el-button>上传封面</el-button>
                </template>
              </el-upload>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 模型详情弹框 -->
    <ModelPreview
      :visible="modelDetailDialogVisible"
      :resource="modelDetailResource"
      @success="getResourceList"
      @update:visible="modelDetailDialogVisible = $event"
    />
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
        transition: color 0.2s ease;

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
      grid-template-columns: repeat(6, 1fr);
      gap: 16px;
      padding: 2px;
      margin-bottom: 20px;

      .resource-card {
        background: var(--el-fill-color-blank);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
        cursor: pointer;

        &:hover {
          border-color: var(--el-border-color);
          transform: scale(1.02);
        }

        &.selected {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
        }

        .card-thumbnail {
          width: 100%;
          height: 180px;
          background-color: var(--el-fill-color-extra-light);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;

          .selection-overlay {
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
            z-index: 10;

            .selection-icon {
              font-size: 18px;
              color: var(--el-color-primary);
            }
          }

          .thumbnail-image {
            max-width: 100%;
            max-height: 100%;

            &.thumbnail-image--directory {
              width: 100px;
              height: 100px;
            }

            &.thumbnail-image--media {
              width: 100%;
              height: 100%;
            }

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
              font-weight: 400;
              color: var(--el-text-color-primary);
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
              color: var(--el-text-color-secondary);
              cursor: pointer;
              transition: color 0.2s ease;
              border-radius: 4px;
              padding: 2px;

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

.type-select-cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding: 16px 0;

  .type-card {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 16px;
    background: var(--el-fill-color-blank);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;

    &:hover {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      transform: scale(1.02);
    }

    .type-card-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--el-color-primary-light-9);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
      color: var(--el-color-primary);
    }

    .type-card-name {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .type-card-desc {
      font-size: 12px;
      font-weight: 400;
      color: var(--el-text-color-secondary);
      text-align: center;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
}

.model-cover-preview {
  margin-top: 8px;
}

.model-cover-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.image-detail-content {
  display: flex;
  gap: 24px;

  .image-detail-preview {
    flex: 1;
    min-width: 0;
    background: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-light);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    min-height: 300px;

    .detail-image {
      max-width: 100%;
      max-height: 400px;
    }
  }

  .image-detail-info {
    width: 220px;
    flex-shrink: 0;

    h3 {
      margin: 0 0 16px 0;
      font-size: 12px;
      font-weight: 500;
      color: var(--el-text-color-secondary);
      text-transform: uppercase;
      letter-spacing: 0;
    }

    .info-item {
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 1.57;

      .info-label {
        color: var(--el-text-color-secondary);
        font-weight: 400;
      }

      .info-value {
        color: var(--el-text-color-primary);
        font-weight: 400;
        font-feature-settings: "tnum";
      }
    }

    .image-detail-actions {
      margin-top: 24px;
    }
  }
}

.video-detail-content {
  display: flex;
  gap: 24px;
  align-items: stretch;

  .video-detail-left {
    flex: 1;
    min-width: 0;

    .video-detail-player {
      width: 100%;
      height: 100%;
      background: var(--el-text-color-primary);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: center;

      .detail-video {
        width: 100%;
        display: block;
      }
    }
  }

  .video-detail-right {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .video-detail-info,
    .video-detail-cover {
      h3 {
        margin: 0 0 10px 0;
        font-size: 12px;
        font-weight: 500;
        color: var(--el-text-color-secondary);
        text-transform: uppercase;
        letter-spacing: 0;
      }

      .info-item {
        margin-bottom: 6px;
        font-size: 14px;
        line-height: 1.57;

        .info-label {
          color: var(--el-text-color-secondary);
          font-weight: 400;
        }

        .info-value {
          color: var(--el-text-color-primary);
          font-weight: 400;
          font-feature-settings: "tnum";
        }
      }
    }

    .video-detail-cover {
      .cover-preview {
        width: 100%;
        height: 90px;
        background: var(--el-fill-color-extra-light);
        border: 1px solid var(--el-border-color-light);
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 10px;

        .cover-image {
          width: 100%;
          height: 100%;
        }

        .cover-empty {
          color: var(--el-text-color-secondary);
          font-size: 14px;
          font-weight: 400;
        }
      }

      .cover-actions {
        display: flex;
        flex-direction: row;
        gap: 8px;
        align-items: center;
      }
    }
  }
}

.tnum {
  font-feature-settings: "tnum";
}
</style>
