<template>
  <div class="dataroom-import-resource-wrap">
    <el-dialog
      :append-to-body="true"
      :close-on-click-modal="false"
      :visible.sync="formVisible"
      class="dataroom-el-dialog"
      :title="title[dataForm.type]"
      @close="closeHandler"
    >
      <el-form
        ref="dataForm"
        :model="dataForm"
        :rules="dataFormRules"
        class="bs-el-form"
        label-position="right"
        label-width="140px"
      >
        <el-form-item
          label="分组"
        >
          <el-select
            v-model="dataForm.module"
            class="bs-el-select"
            clearable
            placeholder="请选择分组"
            popper-class="bs-el-select"
          >
            <el-option
              v-for="catalogItem in catalogList"
              :key="catalogItem.id"
              :label="catalogItem.name"
              :value="catalogItem.code"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="名称"
          prop="originalName"
        >
          <el-input
            v-model="dataForm.originalName"
            autocomplete="off"
            class="bs-el-input"
            clearable
            maxlength="30"
            placeholder="请输入名称"
          />
        </el-form-item>

        <el-form-item
          v-if="dataForm.type === 'reference' && dataForm.id"
          label="地址"
          prop="url"
        >
          <el-input
            v-model="url"
            autocomplete="off"
            class="bs-el-input"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="dataForm.type === 'reference'"
          label="引用地址"
          prop="url"
        >
          <el-input
            v-model="dataForm.path"
            autocomplete="off"
            class="bs-el-input"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-else
          label="地址"
          prop="url"
        >
          <el-input
            v-model="url"
            autocomplete="off"
            class="bs-el-input"
            readonly
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="dataForm.type === 'reference'"
          label="类型"
          prop="extension"
        >
          <el-radio-group v-model="dataForm.extension">
            <el-radio
              v-for="(item,index) in typeList"
              :key="index"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="dataForm.type !== 'picture'"
          label="封面"
          prop="extension"
        >
          <el-upload
            ref="uploadDeviceRealImg"
            class="cover-picture-upload-box"
            accept=".jpg,.jpeg,.PNG,.JPG"
            :action="actionUrl"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess"
            :data="fileUploadParam"
            :http-request="uploadRequest"
            :on-remove="removeImg"
            :auto-upload="true"
          >
            <el-button :loading="uploadLoading">
              上传
            </el-button>
          </el-upload>
          <div
            v-show="dataForm.coverUrl"
            class="img-box"
          >
            <el-image
              :src="getCoverPicture(dataForm.coverUrl)"
            />
            <div
              class="el-icon-delete"
              @click="removeImg"
            />
          </div>
        </el-form-item>
        <el-form-item
          v-if="dataForm.type === 'picture'"
          label="预览"
          prop="extension"
        >
          <div
            class="img-box"
          >
            <el-image
              :src="getCoverPicture(dataForm.url)"
            />
          </div>
        </el-form-item>
      </el-form>
      <div
        slot="footer"
        class="dialog-footer"
      >
        <el-button
          class="bs-el-button-default"
          @click="formVisible = false"
        >
          取消
        </el-button>
        <el-button
          :loading="sureLoading"
          type="primary"
          @click="addOrUpdate"
        >
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'
import axios from 'axios'
import { uploadRequest } from '@gcpaas/data-room-ui/packages/js/utils'

export default {
  name: 'ImportResource',
  catalogCode: {
    type: {
      type: String,
      default: ''
    }
  },
  data () {
    return {
      title: {
        picture: '图片素材',
        video: '视频素材',
        reference: '引用素材'
      },
      url: '',
      catalogList: [],
      fileUploadParam: {
        hide: 1
      },
      actionUrl: window.SITE_CONFIG.dataRoom?.baseURL + '/dataroom/file/upload',
      sourceExtends: window.SITE_CONFIG.dataRoom?.sourceExtends || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'xls', 'xlsx', 'csv'],
      headers: {
        ...window.SITE_CONFIG.dataRoom?.headers
      },
      formVisible: false,
      uploadLoading: false,
      sureLoading: false,
      typeList: [
        {
          label: '图片', value: 'picture'
        },
        {
          label: '视频', value: 'video'
        }
      ],
      dataForm: {
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
      dataFormRules: {
        originalName: [
          {
            required: true,
            message: '请输入名称',
            trigger: 'blur'
          },
          {
            max: 30,
            message: '名称最多30个字符',
            trigger: 'blur'
          }
        ],
        path: [
          {
            required: true,
            message: '请输入引用资源地址',
            trigger: 'blur'
          }
        ]
      },
      // 推荐的资源类型
      recommendType: '',
      showRecommendType: false,
      typeMap: {
        image: '图片',
        link: '外链',
        video: '视频',
        audio: '音频',
        videoStream: '视频流',
        other: '其他'
      },
      imageExtends: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'],
      videoExtends: ['mp4', 'avi', 'rmvb', 'rm', 'flv', '3gp', 'wmv', 'mkv', 'mov', 'mpeg', 'mpg', 'dat', 'vob', 'asf', 'wmv9', 'rm', 'rmvb', 'mp4', '3gp', 'mov', 'm4v', 'avi', 'dat', 'mkv', 'flv', 'vob', 'mpg', 'mpeg', 'ts', 'tp', 'm2ts', 'swf', 'divx', 'asx', 'asf', 'wm', 'wmv', 'wmr', 'ram', 'rm', 'rpm', 'rt', 'rp', 'smi', 'smil', 'amv', 'dmv', 'navi', 'pva', 'swf', '3g2', '3gp2', '3gpp', '3gpp2', 'm1v', 'm2p', 'm2t', 'm2v', 'mp2v', 'mpe', 'mpv2', 'qt', 'qtm', 'rv', 'viv', 'vivo', 'wvx', 'wmx'],
      audioExtends: ['mp3', 'wav', 'wma', 'ogg', 'ape', 'acc', 'flac', 'm4a', 'm4r', 'amr', 'mid', 'ra', 'au', 'aiff', 'aac', 'ac3', 'mmf', 'ogg', 'vqf', 'wv', 'ape', 'mpc', 'tta', 'ra', 'rm', 'rmx', 'voc', 'spx', 'mka', 'opus'],
      videoStreamExtends: ['rtmp', 'rtsp', 'hls', 'flv', 'm3u8']
    }
  },
  methods: {
    init (dataForm = this.dataForm) {
      this.formVisible = true
      this.dataForm = dataForm
      this.url = this.getCoverPicture(this.dataForm.url)
      this.getModuleList()
      this.$nextTick(() => {
        // 清空校验
        this.$refs.dataForm.clearValidate()
      })
    },
    getModuleList () {
      this.$dataRoomAxios.get('/dataroom/type/list/resourceCatalog').then(res => {
        this.catalogList = res
      })
    },
    // 获取封面地址
    getCoverPicture (url) {
      if (url.startsWith('data:image/')) {
        // 如果是Base64格式，则直接返回URL
        return url
      } else {
        // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
        return getFileUrl(url)
      }
    },
    beforeUpload () {

    },
    // 自定义请求上传文件
    uploadRequest (params) {
      uploadRequest(params).then((res) => {
        this.uploadLoading = false
        this.$message({
          type: 'success',
          message: '上传成功'
        })
        this.dataForm.coverUrl = res.url
        this.dataForm.coverId = res.id
      }).catch((err) => {
        this.uploadLoading = false
        console.log(err)
      })
    },
    // 上传封面
    uploadSuccess (response, file) {
      if (response.code !== 200) {
        this.$message.error(response.msg)
        const idx = this.$refs.uploadDeviceRealImg.uploadFiles.findIndex(
          item => item.uid === file.uid
        )
        this.$refs.uploadDeviceRealImg.uploadFiles.splice(idx, 1)
      } else {
        this.dataForm.coverUrl = response.data.url
        this.dataForm.coverId = response.data.id
      }
    },
    // 删除封面
    removeImg () {
      this.dataForm.coverUrl = ''
      this.dataForm.coverId = ''
    },
    addOrUpdate () {
      // 表单验证
      this.$refs.dataForm.validate(valid => {
        if (valid) {
          this.sureLoading = true
          let url = ''
          if (this.dataForm.id) {
            url = window?.SITE_CONFIG?.dataRoom?.baseURL + '/dataroom/file/update'
          } else {
            url = window?.SITE_CONFIG?.dataRoom?.baseURL + '/dataroom/file/add'
          }
          const formData = new FormData()
          Object.keys(this.dataForm).forEach(key => {
            formData.append(key, this.dataForm[key])
          })
          this.$dataRoomAxios.upload(url, formData).then(res => {
            this.sureLoading = false
            this.$message.success('操作成功')
            this.formVisible = false
            this.$emit('refresh')
            this.closeHandler()
          }).catch(() => {
            this.sureLoading = false
          })
        }
      })
    },
    // 关闭弹窗
    closeHandler () {
      this.dataForm = {
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
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@gcpaas/data-room-ui/packages/assets/style/index.scss';
.cover-picture-upload-box{
  ::v-deep .el-upload-list{
    display: none;
  }
}
.img-box{
  margin-top: 10px;
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
</style>
