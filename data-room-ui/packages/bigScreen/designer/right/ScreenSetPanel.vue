<template>
  <div class="dataroom-bigscreen-screen-panel-wrap">
    <div class="top-box">
      页面配置
    </div>
    <div class="main-box">
      <el-form
        label-width="116px"
        label-position="left"
      >
        <el-form-item label="尺寸">
          <el-input-number
            v-model="pageInfo.pageConfig.w"
            controls-position="right"
          />
          <el-input-number
            v-model="pageInfo.pageConfig.h"
            style="margin-top: 8px"
            controls-position="right"
          />
        </el-form-item>
        <el-form-item label="不透明度">
          <el-slider
            v-model="pageInfo.pageConfig.opacity"
            class="slider-box"
            :min="0"
            :max="1"
            :step="0.01"
          />
        </el-form-item>
        <el-form-item label="背景">
          <el-color-picker
            v-model="pageInfo.pageConfig.bgColor"
            show-alpha
          />
        </el-form-item>
        <el-form-item label="缩放方式">
          <el-select
            v-model="pageInfo.pageConfig.fitMode"
            @change="clickHandle"
          >
            <el-option
              v-for="(item,index) in fitModeList"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="背景自动填充">
          <el-switch
            v-model="pageInfo.pageConfig.autofill"
          />
        </el-form-item>
        <el-form-item label="封面设置">
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 3px"
            >
              <el-button
                style="margin-bottom: 10px;"
                @click="createdImg"
              >
                页面截图
              </el-button>
            </el-col>
            <el-col
              :span="12"
              style="padding-left: 3px"
            >
              <el-upload
                ref="uploadDeviceRealImg"
                class="cover-picture-upload-box"
                accept=".jpg,.jpeg,.PNG,.JPG"
                :action="actionUrl"
                :limit="1"
                :on-success="uploadImg"
                :data="fileUploadParam"
                :http-request="uploadRequest"
                :on-remove="removeImg"
                :before-upload="beforeUpload"
                :auto-upload="true"
              >
                <el-button>
                  上传封面
                </el-button>
              </el-upload>
            </el-col>
          </el-row>
          <div
            v-if="pageInfo.coverPicture"
            class="img-box"
          >
            <el-image
              :src="getCoverPicture(pageInfo.coverPicture)"
            />
            <div
              class="el-icon-delete"
              @click="removeImg"
            />
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { toPng } from 'html-to-image'
import { compressImage, showSize, uploadRequest } from '@gcpaas/data-room-ui/packages/js/utils'
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'

export default {
  name: '',
  components: {},
  props: {},
  data () {
    return {
      fileUploadParam: {
        hide: 1
      },
      actionUrl: window.SITE_CONFIG.dataRoom?.baseURL + '/dataroom/file/upload',
      sourceExtends: window.SITE_CONFIG.dataRoom?.sourceExtends || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
      headers: {
        ...window.SITE_CONFIG.dataRoom?.headers
      },
      activeFitMode: 'fitWidth',
      fitModeList:
        [{ label: '等比宽度铺满可滚动', value: 'fitWidth' },
          { label: '等比高度铺满居中', value: 'fitHeightCenter' },
          { label: '全屏铺满', value: 'cover' },
          { label: '等比高度可滚动', value: 'fitHeight' },
          { label: '居中', value: 'auto' },
          { label: '不缩放', value: 'none' }]
    }
  },
  inject: ['canvasInst'],
  computed: {
    pageInfo () {
      return this.canvasInst.pageInfo
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    // 获取大屏封面地址
    getCoverPicture (url) {
      if (url.startsWith('data:image/')) {
        // 如果是Base64格式，则直接返回URL
        return url
      } else {
        // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
        return getFileUrl(url)
      }
    },
    // 页面截图
    createdImg () {
      this.saveAndPreviewLoading = true
      const node = document.querySelector('.dataroom-bigscreen-render-wrap')
      toPng(node)
        .then((dataUrl) => {
          // const link = document.createElement('a')
          // link.download = `${this.pageInfo.name}.png`
          // link.href = dataUrl
          // link.click()
          // link.addEventListener('click', () => {
          //   link.remove()
          // })
          if (dataUrl) {
            const _pageInfo = JSON.parse(JSON.stringify(this.pageInfo))
            if (showSize(dataUrl) > 200) {
              // this.$message.info('由于封面图片过大，进行压缩中')
              compressImage(dataUrl, { width: 1280, height: 720, size: 400, quality: 1 }).then(res => {
                _pageInfo.coverPicture = res
              })
            } else {
              _pageInfo.coverPicture = dataUrl
            }
            this.canvasInst.updatePageInfo(_pageInfo)
          }
          this.saveAndPreviewLoading = false
        }).catch((error) => {
          console.info('error', error)
          this.saveAndPreviewLoading = false
          if (error.type === 'error') {
          // 判断的error.currentTarget是img标签，如果是的，就弹出消息说是图片跨域
            if (error.currentTarget.tagName.toLowerCase() === 'img') {
            // 确认框
              this.$confirm('图片资源跨域导致使用toDataURL API生成图片失败，请将图片上传到资源库，然后在组件中使用资源库中的图片资源，确保没有跨域问题。', '提示', {
                confirmButtonText: '确定',
                showCancelButton: false,
                type: 'warning',
                customClass: 'bs-el-message-box'
              }).then(() => { }).catch(() => { })
            }
          } else {
            this.$message.warning('生成封面数据出现错误，请检查是否使用了跨域图片')
          }
        })
    },
    // 自定义请求上传文件
    uploadRequest (params) {
      uploadRequest(params).then((res) => {
        this.uploadLoading = false
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        const _pageInfo = JSON.parse(JSON.stringify(this.pageInfo))
        _pageInfo.coverPicture = res.url
        this.canvasInst.updatePageInfo(_pageInfo)
      }).catch((err) => {
        this.uploadLoading = false
        console.log(err)
      })
    },
    // 上传封面
    uploadImg (response, file) {
      if (response.code !== 200) {
        this.$message.error(response.msg)
        const idx = this.$refs.uploadDeviceRealImg.uploadFiles.findIndex(
          item => item.uid === file.uid
        )
        this.$refs.uploadDeviceRealImg.uploadFiles.splice(idx, 1)
      } else {
        const _pageInfo = JSON.parse(JSON.stringify(this.pageInfo))
        _pageInfo.coverPicture = response.data.url
        this.canvasInst.updatePageInfo(_pageInfo)
      }
    },
    // 删除封面
    removeImg () {
      const _pageInfo = JSON.parse(JSON.stringify(this.pageInfo))
      _pageInfo.coverPicture = ''
      this.canvasInst.updatePageInfo(_pageInfo)
    },
    beforeUpload (file) {
      if (file.size > 30 * 1024 * 1024) {
        this.$message.error('上传图片大小不能超过 30MB!')
        return false
      }
      return new Promise(resolve => {
        this.$nextTick(() => {
          resolve()
        })
      })
    },
    // 选择大屏缩放方式
    clickHandle (mode) {
      this.activeFitMode = mode
    }

  }
}
</script>

<style scoped lang="scss">
.dataroom-bigscreen-screen-panel-wrap{
  width: 100%;
  height: 100%;
  color: #1a1a1a;
  font-size: 12px;
  .top-box{
    height: 40px;
    line-height: 40px;
    text-align: center;
    //border-top: 1px solid #ededed;
    border-bottom: 1px solid #ededed;
  }
  .main-box{
    padding-top: 16px;
    padding-left: 32px;
    padding-right: 24px;
    .fix-box{
      width: 160px;
      height:30px;
      display: flex;
      justify-content: space-between;
      background-color: #EAEAEA;
      border-radius: 4px;
      padding: 6px;
      box-sizing: border-box;
      .fix-item{
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 2px 5px;
        box-sizing: border-box;
        &:hover{
          cursor: pointer;
          background-color: #D9D9D9;
        }
        img{
          width: 100%;
          height: 100%;
        }
      }
      .active-fix-item{
        background-color: #D9D9D9;
      }
    }
  }
  .slider-box{
    width: 120px
  }
  ::v-deep .el-form-item{
    margin-bottom: 8px!important;
  }
  ::v-deep .el-form-item__label{
    font-size: 12px;
  }
  .cover-picture-upload-box{
    ::v-deep .el-upload-list{
      display: none;
    }
  }
  .img-box{
    width: 160px;
    height: 120px;
    position: relative;
    border: 1px solid #D9D9D9;
    ::v-deep .el-image{
      width: 100%;
      height: 100%;
    }
    .el-icon-delete{
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      font-size: 24px;
      cursor: pointer;
      color: #fff;
      position: absolute;
      display: none;
      justify-content: center;
      align-items: center;
      background-color: rgba(0,0,0,.5);
    }
    &:hover{
      cursor: pointer;
        .el-icon-delete{
          display: flex;
        }
    }
  }

}
</style>
