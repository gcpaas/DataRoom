<template>
  <div class="big-screen-list-wrap">
    <div class="internal-box">
      <div class="top-search-wrap">
        <el-input
          v-model="searchKey"
          class="bs-el-input"
          clearable
          placeholder="请输入图片名称"
          prefix-icon="el-icon-search"
          @clear="reSearch"
          @keyup.enter.native="reSearch"
        />
        <el-select
          v-model="extend"
          class="bs-el-select"
          clearable
          placeholder="请选择图片格式"
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
          style="margin-right: 10px"
          type="primary"
          @click="reSearch"
        >
          搜索
        </el-button>
        <el-upload
          :action="upLoadUrl"
          :before-upload="beforeUpload"
          :data="{ module: code }"
          :file-list="fileList"
          :headers="headers"
          :on-error="uploadError"
          :on-success="uploadSuccess"
          :show-file-list="false"
          class="upload-demo"
          multiple
        >
          <el-button
            type="primary"
          >
            上传资源
          </el-button>
        </el-upload>
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
          v-for="screen in list"
          :key="screen.id"
          :style="{
            width: gridComputed ? 'auto' : '290px'
          }"
          class="big-screen-card-wrap"
        >
          <div class="big-screen-card-inner">
            <div class="screen-card__hover">
              <div class="screen-card__hover-box">
                <div class="preview">
                  <div
                    class="screen-card__oper-label circle"
                    @click="preview(screen)"
                  >
                    <span>预览</span>
                  </div>
                  <div
                    class="circle"
                    @click="downLoad(screen)"
                  >
                    <span>下载</span>
                  </div>
                  <div
                    class="circle"
                    @click="del(screen)"
                  >
                    <span>删除</span>
                  </div>
                  <div
                    class="circle"
                    @click="copy(screen)"
                  >
                    <span>链接</span>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="imgExtends.includes(screen.extension)" class="big-screen-card-img">
              <el-image
                :src="getCoverPicture(screen.url)"
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
            <div v-else class="big-screen-card-img">
              <el-image
                :src="getUrl(screen)"
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
                :title="screen.originalName"
                class="left-bigscreen-title"
              >
                {{ screen.originalName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="empty"
      >
        暂无数据
      </div>

      <div class="footer-pagination-wrap">
        <!-- <div class="footer-pagination-wrap-text">
        总共 {{ totalCount }} 个项目
      </div> -->
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

    <!-- 新增或编辑弹窗 -->
    <EditForm
      ref="EditForm"
      @refreshData="reSearch"
    />
  </div>
</template>
<script>
import {pageMixins} from 'data-room-ui/js/mixins/page'
import EditForm from './EditForm.vue'
import { getFileUrl } from 'data-room-ui/js/utils/file'

export default {
  name: 'BigScreenList',
  mixins: [pageMixins],
  props: {
    type: {
      type: String,
      default: 'bigScreen' // bigScreen | template
    },
    catalogInfo: {
      type: Object,
      default: () => {
      }
    }
  },
  components: {EditForm},
  data() {
    return {
      upLoadUrl: window.BS_CONFIG?.httpConfigs?.baseURL + '/bigScreen/file/upload',
      searchKey: '',
      extend: '',
      sourceExtends: window.BS_CONFIG?.sourceExtends || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
      options: [],
      list: [],
      fileUploadParam: {},
      headers: {
        ...window.BS_CONFIG?.httpConfigs?.headers
      },
      fileList: [],
      loading: false,
      imgExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'],
      otherExtends: {
        video: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'f4v', 'rmvb', 'rm', '3gp', 'dat', 'ts', 'mts', 'vob'],
        audio: ['mp3', 'wav', 'wma', 'ogg', 'aac', 'flac', 'ape', 'm4a', 'm4r', 'amr', 'ac3'],
        excel: ['xls', 'xlsx', 'csv'],
        word: ['doc', 'docx'],
        ppt: ['ppt', 'pptx'],
        pdf: ['pdf']
      }
    }
  },
  computed: {
    code() {
      return this.catalogInfo?.page?.code
    },
    gridComputed() {
      return this.list.length > 3
    }
  },
  watch: {
    code(value) {
      this.current = 1
      this.getDataList()
    }
  },
  mounted() {
    this.getOptions()
    this.getDataList()
  },
  methods: {
    getUrl(file) {
      let extension = file.extension
      if (this.otherExtends.video.includes(extension)) {
        return require('./images/video.svg')
      }
      if (this.otherExtends.audio.includes(extension)) {
        return require('./images/audio.svg')
      }
      if (this.otherExtends.excel.includes(extension)) {
        return require('./images/excel.svg')
      }
      if (this.otherExtends.word.includes(extension)) {
        return require('./images/word.svg')
      }
      if (this.otherExtends.ppt.includes(extension)) {
        return require('./images/ppt.svg')
      }
      if (this.otherExtends.pdf.includes(extension)) {
        return require('./images/pdf.svg')
      }
      return require('./images/unknown.svg')
    },
    uploadError() {
      this.$message({
        type: 'error',
        message: '上传失败'
      })
    },
    beforeUpload(file) {
      // 获取文件后缀
      const extension = file.name.split('.').pop()
      // 判断文件类型是否符合要求
      const isValidFileType = this.sourceExtends.includes(extension)
      if (!isValidFileType) {
        this.$message.error('不支持的文件类型：' + extension)
      }
      return isValidFileType
    },
    uploadSuccess(response, file, fileList) {
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
    },
    getOptions() {
      this.options = []
      this.options.push({label: '全部', value: ''})
      this.sourceExtends.forEach((ext) => this.options.push({label: ext, value: ext}))
    },
    getDataList() {
      this.loading = true
      this.$dataRoomAxios.get('/bigScreen/file', {
        module: this.catalogInfo.page.code,
        current: this.current,
        size: this.size,
        extension: this.extend,
        searchKey: this.searchKey
      })
        .then((data) => {
          this.list = data.list
          this.totalCount = data.totalCount
        })
        .finally(() => {
          this.loading = false
        })
    },
    preview(screen) {
      window.open(getFileUrl(screen.url), '_blank')
    },
    downLoad(screen) {
      this.$dataRoomAxios.download(`/bigScreen/file/download/${screen.id}`)
    },
    del(screen) {
      this.$confirm('确定删除该资源？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        customClass: 'bs-el-message-box'
      })
        .then(async () => {
          this.$dataRoomAxios.post(`/bigScreen/file/delete/${screen.id}`)
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
    copy(screen) {
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
     * 获取封面图片,如果是相对路径则拼接上文件访问前缀地址
     * @param url
     * @returns {*}
     */
    getCoverPicture (url) {
      return getFileUrl(url)
    },
  }
}
</script>

<style lang="scss" scoped>
@import '../assets/style/bsTheme.scss';

.big-screen-list-wrap {
  .el-select {
    display: inline-block !important;
    position: relative !important;
    width: auto !important;
  }

  position: relative;
  height: calc(100%);
  // height: calc(100% - 16px);
  // padding: 16px;
  color: #9ea9b2;
  // margin:0 16px;
  margin-left: 16px;
  background-color: var(--bs-background-2) !important;

  .internal-box {
    height: calc(100% - 32px);
    padding: 16px;
  }

  .top-search-wrap {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 12px;

    .el-input {
      width: 200px;
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }

    .el-select {
      margin-right: 20px;

      ::v-deep .el-input__inner {
        background-color: var(--bs-background-1) !important;
      }
    }
  }

  .list-wrap {
    /* display: grid; */
    overflow: auto;
    padding-right: 5px;
    // 间隙自适应
    justify-content: space-around;
    // max-height: calc(100vh - 304px);
    max-height: calc(100% - 90px);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    grid-gap: 15px;
    padding-bottom: 10px;
    // ::v-deep .el-loading-mask {
    //   display: flex;
    //   align-items: center;
    //   justify-content: center;
    //   height: calc(100vh - 260px) !important;
    //   z-index: 999;
    //   top: 50px;
    // }

    .big-screen-card-wrap {
      position: relative;
      height: 230px;
      cursor: pointer;

      &:hover {
        .screen-card__hover {
          height: 230px;
        }
      }

      .screen-card__hover {
        position: absolute;
        z-index: 999;
        top: 0;
        right: 0;
        left: 0;
        display: flex;
        overflow: hidden;
        align-items: center;
        justify-content: center;
        height: 0;
        transition: height 0.4s;
        background: #00000099;

        .screen-card__hover-box {
          position: absolute;
          width: 100%;
          height: 100%;
          background: #00000080;
          display: flex;
          overflow: hidden;
          align-items: center;
          justify-content: center;
        }

        .preview {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
          width: 100%;
          cursor: pointer;
          color: var(--bs-el-color-primary);

          .circle {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border: 1px solid var(--bs-el-color-primary);
            border-radius: 50%;

            &:hover {
              color: #fff;
              background: var(--bs-el-color-primary);
            }

            span {
              font-size: 12px;
            }
          }
        }
      }

      .big-screen-card-inner {
        overflow: hidden;
        width: 100%;
        height: 100%;
        cursor: pointer;
        background-color: var(--bs-background-2);
        box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
        color: var(--bs-el-title);
        border: 1px solid var(--bs-background-1);

        &:hover {
          color: var(--bs-el-text);
          border: 1px solid var(--bs-el-color-primary);
        }

        .add-big-screen-card-text {
          color: var(--bs-el-color-primary);
          font-size: 24px;
        }

        .big-screen-card-img {
          width: 100%;
          height: 180px;

          img {
            width: 100%;
            height: 100%;

            object-fit: cover;
          }

          ::v-deep .image-slot {
            height: 100%;
            background-color: var(--bs-background-2);
            display: flex;
            align-items: center;
            justify-content: center;
          }

          ::v-deep .el-image__error {
            background-color: #1d1d1d;
          }
        }

        .big-screen-bottom {
          display: flex;
          align-items: center;
          flex-direction: row;
          justify-content: space-between;
          box-sizing: border-box;
          width: 100%;
          /*height: 26px;*/
          padding: 0 10px;
          height: calc(100% - 180px);
          color: var(--bs-el-title);
          background-color: var(--bs-background-2);

          .left-bigscreen-title {
            font-size: 14px;
            overflow: hidden;
            width: 100%;
            white-space: nowrap;
            text-overflow: ellipsis;
          }

          .right-bigscreen-time-title {
            font-size: 14px;
            overflow: hidden;
            width: 140px;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }

        .big-screen-card-text {
          font-size: 14px;
          padding: 10px;
          text-align: center;
          color: #333;
        }
      }

      .big-screen-card-inner-add {
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }

  .el-loading-parent--relative {
    position: unset !important;
  }

  .footer-pagination-wrap {
    right: 16px;
    bottom: 16px;
    position: absolute;
  }
}

.bs-pagination {
  ::v-deep .el-input__inner {
    width: 110px !important;
    border: none;
    background: var(--bs-el-background-1);
  }
}

.empty {
  width: 100%;
  height: 70%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
