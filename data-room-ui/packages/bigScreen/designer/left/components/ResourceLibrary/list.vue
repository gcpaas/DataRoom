<template>
  <div class="dataroom-resource-wrap dataroom-page-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-input
          v-model="searchKey"
          class="bs-el-input"
          clearable
          placeholder="请输入素材名称"
          prefix-icon="el-icon-search"
          @clear="reSearch"
          @keyup.enter.native="reSearch"
        />
        <el-select
          v-model="resourceTypeList"
          class="bs-el-select"
          clearable
          multiple
          placeholder="请选择素材类型"
          popper-class="bs-el-select"
          @change="reSearch"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
        <el-button
          style="margin-right: 10px;margin-left: 20px"
          type="primary"
          @click="reSearch"
        >
          搜索
        </el-button>
      </div>
      <div
        v-if="list.length !== 0"
        v-loading="loading"
        :style="{
          display: gridComputed ? 'grid' : 'flex',
          justifyContent: gridComputed ? 'space-around' : 'flex-start'
        }"
        class="list-wrap bs-scrollbar"
        element-loading-text="加载中"
      >
        <!-- <div v-if="list.length !== 0"> -->
        <div
          v-for="resource in list"
          :key="resource.id"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
          class="big-screen-card-wrap"
          @click="handleCardClick(resource)"
        >
          <div
            class="big-screen-card-inner"
            :class="{'active-card':currentId === resource.id}"
          >
            <div
              class="big-screen-card-img"
            >
              <div class="big-screen-type">
                {{ typeDesc[resource.type] }}
              </div>
              <el-image
                :src="getCoverPicture(resource)"
                fit="contain"
                style="width: 100%; height: 100%"
              >
                <div
                  slot="placeholder"
                  class="image-slot"
                >
                  加载中···
                </div>
              </el-image>
            </div>
            <div class="big-screen-bottom">
              <div
                :title="resource.originalName"
                class="left-bigscreen-title"
              >
                {{ resource.originalName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <el-empty
        v-else
        class="empty-box"
        description="暂无数据"
      />
      <div class="footer-pagination-wrap">
        <div class="bs-pagination">
          <el-pagination
            :current-page="current"
            :page-size="size"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalCount"
            background
            class="bs-el-pagination"
            layout="total, prev, pager, next, sizes"
            next-text="下一页"
            popper-class="bs-el-pagination"
            prev-text="上一页"
            @current-change="currentChangeHandle"
            @size-change="sizeChangeHandle"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { pageMixins } from '@gcpaas/data-room-ui/packages/js/mixins/page'
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'
import pictureConfig from '@gcpaas/data-room-ui/packages/components/media/picture/bigScreenDefinition'
export default {
  name: 'ResourceList',
  mixins: [pageMixins],
  props: {
    type: {
      type: String,
      default: 'page'
    },
    catalogInfo: {
      type: Object,
      default: () => {
      }
    },
    resourceType: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      currentId: null,
      typeDesc: {
        picture: '图片',
        video: '视频',
        reference: '引用'
      },
      uploadLoading: false,
      typeList: [
        {
          label: '上传图片', value: 'picture'
        },
        {
          label: '上传视频', value: 'video'
        },
        {
          label: '资源引用', value: 'reference'
        }
      ],
      options: [
        {
          label: '全部', value: ''
        },
        {
          label: '图片', value: 'picture'
        },
        {
          label: '视频', value: 'video'
        },
        {
          label: '引用', value: 'reference'
        }
      ],
      acceptOption: {
        picture: 'image/*',
        video: 'video/*',
        reference: ''
      }, // 限制上传的文件类型
      uploadParams: {
        name: '',
        coverId: '',
        coverUrl: '',
        extension: '',
        hide: 0,
        id: '',
        module: '',
        type: 'picture',
        originalName: '',
        path: '',
        url: ''
      },
      file: null,
      upLoadUrl: window.SITE_CONFIG.dataRoom?.baseURL + '/dataroom/file/add',
      replaceUrl: window.SITE_CONFIG.dataRoom?.baseURL + '/dataroom/file/replace',
      searchKey: '',
      extend: '',
      resourceTypeList: [],
      sourceExtends: window.SITE_CONFIG.dataRoom?.sourceExtends || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
      list: [],
      fileUploadParam: {},
      headers: {
        ...window.SITE_CONFIG.dataRoom?.headers
      },
      fileList: [],
      loading: false,
      imgExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'image'],
      otherExtends: {
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'f4v', 'rmvb', 'rm', '3gp', 'dat', 'ts', 'mts', 'vob'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'ape', 'm4a', 'm4r', 'amr', 'ac3'],
        excel: ['xls', 'xlsx', 'csv'],
        word: ['doc', 'docx'],
        ppt: ['ppt', 'pptx'],
        pdf: ['pdf']
      },
      importResourcePath: '<reference_resource>'
    }
  },
  computed: {
    catalogCode () {
      return this.catalogInfo?.page?.code
    },
    gridComputed () {
      return this.list.length > 3
    }
  },
  watch: {
    catalogCode (value) {
      this.current = 1
      this.uploadParams.module = value
      this.getDataList()
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.resourceTypeList = this.resourceType || []
      this.getDataList()
    },
    handleCardClick (item) {
      this.currentId = item.id
      this.$emit('changeResource', item)
    },
    // 选择上传的资源类型
    selectHandler (type) {
      this.uploadParams.type = type.value
      if (type.value === 'reference') {
        this.importResource()
      } else {
        // 放置页面未更新就触发了上传的点击事件
        setTimeout(() => {
          this.$refs.uploadBtn.$el.click()
        }, 100)
      }
    },
    uploadError () {
      this.$message({
        type: 'error',
        message: '上传失败'
      })
    },
    beforeUpload (file) {
      this.uploadLoading = true
      this.$message({
        type: 'warning',
        message: '正在上传'
      })

      // // 获取文件后缀
      // const extension = file.name.split('.').pop()
      // // 判断文件类型是否符合要求
      // const isValidFileType = this.sourceExtends.includes(extension)
      // if (!isValidFileType) {
      //   this.$message.error('不支持的文件类型：' + extension)
      // }
      // return isValidFileType
    },
    uploadSuccess (response, file, fileList) {
      if (response.code === 200) {
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.getDataList()
      } else {
        this.$message({
          type: 'error',
          message: response.msg
        })
      }
      this.uploadLoading = false
    },
    getDataList () {
      this.loading = true
      this.$dataRoomAxios.get('/dataroom/file', {
        module: this.catalogInfo.page.code,
        type: this.resourceTypeList,
        current: this.current,
        size: this.size,
        extension: this.extend,
        searchKey: this.searchKey,
        hide: 0
      })
        .then((data) => {
          this.list = data.list
          this.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    preview (screen) {
      window.open(getFileUrl(this.getCoverPicture(screen)), '_blank')
    },
    downLoad (screen) {
      this.$dataRoomAxios.download(`/dataroom/file/download/${screen.id}`)
    },
    del (screen) {
      this.$confirm('确定删除该资源？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(`/dataroom/file/delete/${screen.id}`)
            .then(() => {
              this.$message({
                type: 'success',
                message: '删除成功'
              })
              this.getDataList()
            })
            .catch(() => {
              this.$message({
                type: 'error',
                message: '删除失败!'
              })
            })
        })
        .catch()
    },
    copy (screen) {
      this.$message.success('复制成功')
      const transfer = document.createElement('input')
      document.body.appendChild(transfer)
      transfer.value = getFileUrl(screen.url) // 这里表示想要复制的内容
      transfer.focus()
      transfer.select()
      if (document.execCommand('copy')) {
        document.execCommand('copy')
      }
      transfer.blur()
      transfer.style.display = 'none'
    },
    /**
     * 导入资源
     */
    importResource () {
      this.$refs.importResource.init(this.uploadParams)
    },
    editResource (resource) {
      const uploadParams = {
        name: resource.name,
        coverId: resource.coverId,
        coverUrl: resource.coverUrl,
        extension: resource.extension,
        hide: resource.hide,
        id: resource.id,
        module: resource.module,
        type: resource.type,
        originalName: resource.originalName,
        path: resource.path,
        url: resource.url
      }
      this.$refs.importResource.init(uploadParams)
    },

    /**
     * 获取封面图片,如果是相对路径则拼接上文件访问前缀地址
     * @param resource
     * @returns {*}
     */
    getCoverPicture (resource) {
      const url = resource.type === 'picture' ? resource.url : resource.coverUrl
      if (url.startsWith('data:image/')) {
        // 如果是Base64格式，则直接返回URL
        return url
      } else {
        // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
        return getFileUrl(url)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/pageList.scss';
.dataroom-page-list-wrap{
  position: relative;
  margin-left: 0;
  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: sticky;
    top: 0;
    padding: 16px 0 0 16px;
    background-color: #fff;
  }
  .footer-pagination-wrap{
    position: absolute;
    width:auto;
    left: 16px;
    bottom:0;
    background-color: #ffffff;
    z-index: 3000;
  }
  .active-card{
    border: 1px solid #007aff!important;
  }
  .bs-pagination{
    text-align: left;
  }
}
</style>
