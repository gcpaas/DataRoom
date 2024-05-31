<template>
  <div class="dataroom-style-wrapper">
    <div class="title">
      {{ config.name }}
    </div>
    <el-form
      class="setting-body"
      label-width="100px"
      label-position="left"
    >
      <div class="dataroom-base-set-wrapper">
        <BaseSet :config="config" />
      </div>
      <div class="props-box">
        <el-form-item
          class="radio form-item-box"
          label="图片类型"
        >
          <el-radio-group
            v-model="config.props.imageType"
            size="mini"
          >
            <el-radio-button label="bitmap">
              位图
            </el-radio-button>
            <el-radio-button label="vector">
              矢量图
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item
          v-if="config.props.imageType ==='bitmap'"
          class="radio form-item-box"
          label="背景图"
        >
          <el-input v-model="config.props.backgroundImage" />
        </el-form-item>
        <el-form-item
          v-if="config.props.imageType ==='vector'"
          class="radio form-item-box"
          label="矢量图"
        >
          <el-input v-model="config.props.vectorImage" />
        </el-form-item>
        <el-form-item
          class="radio form-item-box"
          label=""
        >
          <el-upload
            ref="upload"
            class="avatar-uploader"
            accept=".jpg,.jpeg,.PNG,.JPG"
            :action="actionUrl"
            :data="fileUploadParam"
            :http-request="uploadRequest"
            :before-upload="beforeUpload"
            :on-success="uploadSuccess"
            :show-file-list="false"
            :auto-upload="true"
          >
            <img
              v-if="config.props.imageType ==='bitmap' && config.props.backgroundImage"
              :src="getCoverPicture(config.props.backgroundImage)"
              class="avatar"
              alt=""
            >
            <img
              v-else-if="config.props.imageType ==='vector' && config.props.vectorImage"
              :src="getCoverPicture(config.props.vectorImage)"
              class="avatar"
              alt=""
            >
            <div
              v-else
              class="empty-avatar-box"
            >
              <div>点击此处进行更改</div>
              <div class="el-icon-picture-outline" />
            </div>
            <div class="btn-box">
              <el-button
                size="mini"
                type="info"
                plain
                @click="changeImg"
              >
                更改
              </el-button>
              <el-button
                size="mini"
                type="info"
                plain
                @click.stop="removeImg"
              >
                删除
              </el-button>
            </div>
          </el-upload>
        </el-form-item>
        <el-form-item
          class="radio form-item-box"
          label="图片重复"
        >
          <el-select
            v-model="config.props.repeat"
            placeholder="请选择文本样式"
            @change="changeStyle"
          >
            <el-option
              label="不重复，拉伸满"
              value="no-repeat"
            />
            <el-option
              label="水平和垂直重复"
              value="repeat"
            />
            <el-option
              label="水平重复"
              value="repeat-x"
            />
            <el-option
              label="垂直重复"
              value="repeat-y"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          class="radio form-item-box"
          label="圆角"
        >
          <el-input-number v-model="config.props.radius" />
        </el-form-item>
        <el-collapse>
          <el-collapse-item title="超链接配置">
            <el-form-item
              class="radio form-item-box"
              label="超链接"
            >
              <el-input v-model="config.props.urlConfig.url" />
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="是否新开窗口"
            >
              <el-switch v-model="config.props.urlConfig.ifBlank" />
            </el-form-item>
          </el-collapse-item>
          <el-form-item
            class="radio form-item-box"
            label="手势光标"
          >
            <el-switch v-model="config.props.cursor" />
          </el-form-item>
          <el-collapse-item title="滤镜">
            <el-form-item
              class="radio form-item-box"
              label="色相"
            >
              <el-row>
                <el-col>
                  <el-switch v-model="config.props.filter.hue.show" />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-slider v-model="config.props.filter.hue.hue" />
                </el-col>
                <el-col
                  :span="10"
                  style="margin-left: 15px"
                >
                  <el-input-number
                    v-model="config.props.filter.hue.hue"
                    controls-position="right"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="饱和度"
            >
              <el-row>
                <el-col>
                  <el-switch v-model="config.props.filter.saturate.show" />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-slider v-model="config.props.filter.saturate.saturate" />
                </el-col>
                <el-col
                  :span="10"
                  style="margin-left: 15px"
                >
                  <el-input-number
                    v-model="config.props.filter.saturate.saturate"
                    controls-position="right"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="亮度"
            >
              <el-row>
                <el-col>
                  <el-switch v-model="config.props.filter.brightness.show" />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-slider v-model="config.props.filter.brightness.brightness" />
                </el-col>
                <el-col
                  :span="10"
                  style="margin-left: 15px"
                >
                  <el-input-number
                    v-model="config.props.filter.brightness.brightness"
                    controls-position="right"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="对比度"
            >
              <el-row>
                <el-col>
                  <el-switch v-model="config.props.filter.contrast.show" />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-slider v-model="config.props.filter.contrast.contrast" />
                </el-col>
                <el-col
                  :span="10"
                  style="margin-left: 15px"
                >
                  <el-input-number
                    v-model="config.props.filter.contrast.contrast"
                    controls-position="right"
                  />
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="不透明度"
            >
              <el-row>
                <el-col>
                  <el-switch v-model="config.props.filter.opacity.show" />
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="10">
                  <el-slider
                    v-model="config.props.filter.opacity.opacity"
                    :min="0"
                    :max="1"
                    :step="0.01"
                  />
                </el-col>
                <el-col
                  :span="10"
                  style="margin-left: 15px"
                >
                  <el-input-number
                    v-model="config.props.filter.opacity.opacity"
                    controls-position="right"
                  />
                </el-col>
              </el-row>
            </el-form-item>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-form>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import { fontWeightOptions, fonFamilyList, positionOptions } from '@gcpaas/data-room-ui/packages/js/utils/options'
import BaseSet from '@gcpaas/data-room-ui/packages/components/common/panel/baseSet/index.vue'
import { getFileUrl } from '@gcpaas/data-room-ui/packages/js/utils/file'
import { uploadRequest } from '@gcpaas/data-room-ui/packages/js/utils'
export default {
  name: '',
  components: {
    BaseSet
  },
  mixins: [commonMixins],
  inject: ['canvasInst'],
  props: {
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      fontWeightOptions,
      fonFamilyList,
      positionOptions,
      fileUploadParam: {
        hide: 1
      },
      actionUrl: window.SITE_CONFIG.dataRoom?.baseURL + '/dataroom/file/upload',
      headers: {
        ...window.SITE_CONFIG.dataRoom?.headers
      }
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType()
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    changeImg () {
      this.$nextTick(() => {
        this.$refs.upload.click()
      })
    },
    removeImg () {
      const config = this.config
      if (this.config.props.imageType === 'bitmap') {
        config.props.backgroundImage = ''
      } else {
        config.props.vectorImage = ''
      }
      this.changeStyle()
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
        const config = this.config
        if (this.config.props.imageType === 'bitmap') {
          config.props.backgroundImage = res.url
        } else {
          config.props.vectorImage = res.url
        }
        this.changeStyle()
      }).catch((err) => {
        this.uploadLoading = false
        console.log(err)
      })
    },
    uploadSuccess (response) {
      const config = this.config
      if (this.config.props.imageType === 'bitmap') {
        config.props.backgroundImage = response.data.url
      } else {
        config.props.vectorImage = response.data.url
      }
      this.changeStyle()
    },
    // 图片地址处理
    getCoverPicture (url) {
      if (url) {
        if (url.startsWith('data:image/')) {
          // 如果是Base64格式，则直接返回URL
          return url
        } else {
          // 如果不是Base64格式，则调用getFileUrl方法获取文件URL
          return getFileUrl(url)
        }
      } else { return '' }
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
.avatar-uploader{
  width: 100%;
  height: 160px;
  ::v-deep .el-upload--text{
    width: 100%;
    height: 100%;
    position: relative;
    .btn-box{
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background-color: rgba(0,0,0,0.3);
    }
    &:hover{
      .btn-box{
        display: flex;
      }

    }

  }
  img{
    width: 100%;
    height: 100%;
  }
  .empty-avatar-box{
    width: 100%;
    height: 100%;
    background-color: #EDEDED;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column-reverse;
  }
}
</style>
