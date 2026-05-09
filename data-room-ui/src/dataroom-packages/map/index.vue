<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Upload, Edit, MoreFilled } from '@element-plus/icons-vue'
import { mapApi, type MapEntity, type RegionInfo } from './api'
import * as echarts from 'echarts'

const searchName = ref('')
const mapList = ref<MapEntity[]>([])
const loading = ref(false)
const selectedMap = ref<MapEntity | null>(null)
const regionList = ref<RegionInfo[]>([])
const chartRef = ref<HTMLDivElement>()
let chartInstance: echarts.ECharts | null = null

// 新增对话框
const addDialogVisible = ref(false)
const addForm = ref({
  name: '',
  geoJson: '',
})
const uploadFileName = ref('')

// 编辑对话框
const editDialogVisible = ref(false)
const editForm = ref({
  id: '',
  code: '',
  name: '',
  geoJson: '',
})
const editUploadFileName = ref('')

// 过滤后的地图列表
const filteredMapList = computed(() => {
  if (!searchName.value) return mapList.value
  return mapList.value.filter((item) => item.name.includes(searchName.value))
})

/**
 * 查询地图列表
 */
const getMapList = async () => {
  loading.value = true
  try {
    const res = await mapApi.list()
    mapList.value = res || []
    // 默认激活第一个地图
    if (mapList.value.length > 0 && !selectedMap.value) {
      const first = mapList.value[0]
      if (first) {
        handleMapClick(first)
      }
    }
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    loading.value = false
  }
}

interface GeoJsonData {
  features?: Array<{
    properties?: Record<string, unknown>
    [key: string]: unknown
  }>
  [key: string]: unknown
}

/**
 * 点击地图树节点
 */
const handleMapClick = async (item: MapEntity) => {
  if (selectedMap.value?.code === item.code) return
  selectedMap.value = item
  if (!item.code) return

  try {
    const detail = await mapApi.detail(item.code)
    if (detail.geoJson) {
      const geoData = JSON.parse(detail.geoJson) as GeoJsonData
      renderMap(detail.name, geoData)
      parseRegions(geoData)
    } else {
      regionList.value = []
      clearMap()
    }
  } catch (error) {
    console.error('加载地图数据失败:', error)
    ElMessage.error('加载地图数据失败')
  }
}

/**
 * 从GeoJSON解析区域信息
 */
const parseRegions = (geoData: GeoJsonData) => {
  const regions: RegionInfo[] = []
  if (geoData.features) {
    for (const feature of geoData.features) {
      const props = feature.properties || {}
      const name = String(props.name || '')
      // 优先使用center，其次centroid，再次cp
      const center = (props.center || props.centroid || props.cp) as
        | [number, number]
        | undefined
      if (name && center && Array.isArray(center) && center.length >= 2) {
        regions.push({
          name,
          longitude: Number(center[0]),
          latitude: Number(center[1]),
        })
      }
    }
  }
  regionList.value = regions
}

/**
 * 渲染ECharts地图
 */
const renderMap = (mapName: string, geoData: GeoJsonData) => {
  nextTick(() => {
    if (!chartRef.value) return

    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value)
    }

    // 注册地图
    const registerName = `custom_${mapName}`
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    echarts.registerMap(registerName, geoData as any)

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'item',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          return params.name
        },
      },
      series: [
        {
          type: 'map',
          map: registerName,
          roam: true,
          label: {
            show: true,
            fontSize: 10,
            color: '#333',
          },
          itemStyle: {
            areaColor: '#e0ecff',
            borderColor: '#7babea',
            borderWidth: 1,
          },
          emphasis: {
            label: {
              color: '#fff',
              fontSize: 12,
            },
            itemStyle: {
              areaColor: '#4d90e8',
            },
          },
          select: {
            label: {
              color: '#fff',
            },
            itemStyle: {
              areaColor: '#3478f6',
            },
          },
        },
      ],
    }

    chartInstance.setOption(option, true)
    chartInstance.resize()
  })
}

/**
 * 清空地图
 */
const clearMap = () => {
  if (chartInstance) {
    chartInstance.clear()
  }
}

/**
 * 打开新增对话框
 */
const openAddDialog = () => {
  addForm.value = { name: '', geoJson: '' }
  uploadFileName.value = ''
  addDialogVisible.value = true
}

/**
 * 处理GeoJSON文件上传
 */
const handleFileChange = (file: File) => {
  if (!file) return
  uploadFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const content = e.target?.result as string
      // 验证是否为合法JSON
      JSON.parse(content)
      addForm.value.geoJson = content
    } catch {
      ElMessage.error('文件内容不是有效的JSON格式')
      addForm.value.geoJson = ''
      uploadFileName.value = ''
    }
  }
  reader.readAsText(file)
}

/**
 * 触发文件选择
 */
const fileInputRef = ref<HTMLInputElement>()
const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const onFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFileChange(file)
  }
  // 清空 input，允许重复选择同一文件
  target.value = ''
}

/**
 * 新增地图
 */
const handleAdd = async () => {
  if (!addForm.value.name) {
    ElMessage.warning('请输入地图名称')
    return
  }
  if (!addForm.value.geoJson) {
    ElMessage.warning('请上传GeoJSON文件')
    return
  }
  try {
    await mapApi.insert({
      name: addForm.value.name,
      geoJson: addForm.value.geoJson,
      uploadedGeoJson: 1,
    })
    ElMessage.success('新增成功')
    addDialogVisible.value = false
    getMapList()
  } catch (error) {
    console.error('新增失败:', error)
  }
}

/**
 * 编辑地图 - 打开编辑对话框
 */
const handleEdit = (item: MapEntity) => {
  editForm.value = {
    id: item.id || '',
    code: item.code || '',
    name: item.name,
    geoJson: '',
  }
  editUploadFileName.value = ''
  editDialogVisible.value = true
}

/**
 * 处理编辑对话框中的文件上传
 */
const editFileInputRef = ref<HTMLInputElement>()
const triggerEditFileInput = () => {
  editFileInputRef.value?.click()
}

const onEditFileInputChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    editUploadFileName.value = file.name
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const content = ev.target?.result as string
        JSON.parse(content)
        editForm.value.geoJson = content
      } catch {
        ElMessage.error('文件内容不是有效的JSON格式')
        editForm.value.geoJson = ''
        editUploadFileName.value = ''
      }
    }
    reader.readAsText(file)
  }
  target.value = ''
}

/**
 * 保存编辑
 */
const handleEditSave = async () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入地图名称')
    return
  }
  try {
    const updateData: MapEntity = {
      id: editForm.value.id,
      code: editForm.value.code,
      name: editForm.value.name.trim(),
    }
    // 如果上传了新文件才更新geoJson
    if (editForm.value.geoJson) {
      updateData.geoJson = editForm.value.geoJson
      updateData.uploadedGeoJson = 1
    }
    await mapApi.update(updateData)
    ElMessage.success('修改成功')
    editDialogVisible.value = false
    // 如果当前正在查看的地图被编辑了，重新加载预览
    const editedCode = editForm.value.code
    await getMapList()
    if (selectedMap.value?.code === editedCode && editForm.value.geoJson) {
      selectedMap.value = null
      const updated = mapList.value.find((m) => m.code === editedCode)
      if (updated) {
        nextTick(() => handleMapClick(updated))
      }
    }
  } catch (error) {
    console.error('修改失败:', error)
  }
}

/**
 * 删除地图
 */
const handleDelete = (item: MapEntity) => {
  ElMessageBox.confirm(`确定要删除"${item.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        await mapApi.delete(item.code!)
        ElMessage.success('删除成功')
        if (selectedMap.value?.code === item.code) {
          selectedMap.value = null
          regionList.value = []
          clearMap()
        }
        getMapList()
      } catch (error) {
        console.error('删除失败:', error)
      }
    })
    .catch(() => {})
}

/**
 * 下拉菜单命令处理
 */
const handleDropdownCommand = (command: string, item: MapEntity) => {
  if (command === 'edit') {
    handleEdit(item)
  } else if (command === 'delete') {
    handleDelete(item)
  }
}

// 窗口resize时重绘地图
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  getMapList()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理
import { onUnmounted } from 'vue'
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
  chartInstance = null
})
</script>

<template>
  <div class="dr-map-manager">
    <!-- 左侧：地图列表 -->
    <div class="map-tree-panel">
      <div class="panel-header">
        <el-input
          v-model="searchName"
          placeholder="请输入地图名称"
          clearable
          size="default"
        />
        <el-button type="primary" :icon="Plus" @click="openAddDialog" size="default">
          新增
        </el-button>
      </div>
      <div class="panel-body" v-loading="loading">
        <el-scrollbar>
          <div class="map-list">
            <div
              v-for="item in filteredMapList"
              :key="item.id"
              class="map-list-item"
              :class="{ active: selectedMap?.code === item.code }"
              @click="handleMapClick(item)"
            >
              <span class="item-name" :title="item.name">{{ item.name }}</span>
              <el-dropdown
                class="item-more"
                trigger="click"
                @command="(cmd: string) => handleDropdownCommand(cmd, item)"
              >
                <el-icon class="more-icon" @click.stop>
                  <MoreFilled />
                </el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="edit">
                      <el-icon><Edit /></el-icon>
                      <span style="margin-left: 8px">编辑</span>
                    </el-dropdown-item>
                    <el-dropdown-item command="delete">
                      <el-icon><Delete /></el-icon>
                      <span style="margin-left: 8px">删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          <el-empty
            :image-size="80"
            v-if="!loading && filteredMapList.length === 0"
            description="暂无地图数据"
          />
        </el-scrollbar>
      </div>
    </div>

    <!-- 中间：地图预览 -->
    <div class="map-preview-panel">
      <div class="panel-title">地图预览</div>
      <div class="map-chart-container">
        <div ref="chartRef" class="map-chart" v-show="selectedMap"></div>
        <el-empty
          :image-size="120"
          v-if="!selectedMap"
          description="请在左侧选择地图"
        />
      </div>
    </div>

    <!-- 右侧：区域列表 -->
    <div class="region-list-panel">
      <div class="panel-title">区域列表</div>
      <div class="region-table-container">
        <el-table
          :data="regionList"
          border
          size="small"
          height="100%"
          :header-cell-style="{
            background: '#f5f7fa',
            color: '#606266',
            fontWeight: 600,
            fontSize: '13px',
          }"
        >
          <el-table-column prop="name" label="区域名" min-width="100" show-overflow-tooltip />
          <el-table-column prop="longitude" label="经度" min-width="100">
            <template #default="{ row }">
              {{ row.longitude?.toFixed(6) }}
            </template>
          </el-table-column>
          <el-table-column prop="latitude" label="纬度" min-width="100">
            <template #default="{ row }">
              {{ row.latitude?.toFixed(6) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增地图对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增地图" width="500px" :close-on-click-modal="false">
      <el-form label-width="120px">
        <el-form-item label="地图名称" required>
          <el-input v-model="addForm.name" placeholder="请输入地图名称" />
        </el-form-item>
        <el-form-item label="GeoJSON文件" required>
          <div class="upload-area">
            <input
              ref="fileInputRef"
              type="file"
              accept=".json,.geojson"
              style="display: none"
              @change="onFileInputChange"
            />
            <el-button :icon="Upload" @click="triggerFileInput">
              选择文件
            </el-button>
            <span class="upload-file-name" v-if="uploadFileName">{{ uploadFileName }}</span>
            <span class="upload-tip" v-else>支持 .json / .geojson 格式</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAdd">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑地图对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑地图" width="500px" :close-on-click-modal="false">
      <el-form label-width="120px">
        <el-form-item label="地图名称" required>
          <el-input v-model="editForm.name" placeholder="请输入地图名称" />
        </el-form-item>
        <el-form-item label="GeoJSON文件">
          <div class="upload-area">
            <input
              ref="editFileInputRef"
              type="file"
              accept=".json,.geojson"
              style="display: none"
              @change="onEditFileInputChange"
            />
            <el-button :icon="Upload" @click="triggerEditFileInput">
              重新上传
            </el-button>
            <span class="upload-file-name" v-if="editUploadFileName">{{ editUploadFileName }}</span>
            <span class="upload-tip" v-else>不上传则保留原有地图数据</span>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleEditSave">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.dr-map-manager {
  display: flex;
  height: 100%;
  gap: 16px;
  overflow: hidden;

  // 左侧地图树面板
  .map-tree-panel {
    width: 260px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    border-radius: 4px;
    overflow: hidden;

    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);

      .el-input {
        flex: 1;
      }
    }

    .panel-body {
      flex: 1;
      overflow: hidden;

      .map-list {
        .map-list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          border-bottom: 1px solid var(--el-border-color-lighter, #f0f0f0);

          &:hover {
            background-color: #f5f7fa;
          }

          &.active {
            background-color: #ecf5ff;
            color: var(--el-color-primary);
          }

          .item-name {
            flex: 1;
            font-size: 13px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .item-more {
            flex-shrink: 0;
            opacity: 0;
            transition: all 0.2s;
            margin-left: 8px;

            .more-icon {
              font-size: 16px;
              color: #999;
              cursor: pointer;
              outline: none;

              &:hover {
                color: var(--el-color-primary);
              }
            }
          }

          &:hover .item-more {
            opacity: 1;
          }
        }
      }
    }
  }

  // 中间地图预览面板
  .map-preview-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    border-radius: 4px;
    overflow: hidden;

    .panel-title {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
    }

    .map-chart-container {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      .map-chart {
        width: 100%;
        height: 100%;
      }
    }
  }

  // 右侧区域列表面板
  .region-list-panel {
    width: 340px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-light, #e4e7ed);
    border-radius: 4px;
    overflow: hidden;

    .panel-title {
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary, #303133);
      border-bottom: 1px solid var(--el-border-color-light, #e4e7ed);
    }

    .region-table-container {
      flex: 1;
      overflow: hidden;
      padding: 8px;
    }
  }
}

.upload-area {
  display: flex;
  align-items: center;
  gap: 8px;

  .upload-file-name {
    font-size: 13px;
    color: var(--el-color-primary);
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .upload-tip {
    font-size: 12px;
    color: #999;
  }
}
</style>
