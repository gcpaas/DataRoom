<!--
 * @description: 标题属性设置面板
 * @Date: 2022-08-17 16:53:28
 * @Author: shiyi
-->
<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      label-width="100px"
      label-position="left"
      :model="config"
      :rules="rules"
      class="bs-el-form"
    >
      <SettingTitle>标题</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="标题"
          label-width="100px"
          prop="title"
        >
          <el-input
            v-model="config.title"
            placeholder="请输入标题"
            clearable
          />
        </el-form-item>
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting :config="config" />
      </div>
      <SettingTitle v-if="config.border">边框</SettingTitle>
      <div class="lc-field-body">
        <BorderSetting
          v-if="config.border"
          label-width="100px"
          :config="config.border"
          :bigTitle='config.title'
        />
      </div>
      <SettingTitle>旋转</SettingTitle>
          <div class="lc-field-body">
            <RotateSetting
              :config="config"
            />
          </div>
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="URL"
          label-width="100px"
          prop="customize.url"
          style="margin-bottom: 14px"
        >
          <el-upload
            class="bs-el-upload"
            :class="{ hide: fileList.length >= 1 }"
            :action="upLoadUrl"
            :data="fileUploadParam"
            :headers="headers"
            :accept="accept"
            :file-list="fileList"
            :auto-upload="true"
            :limit="1"
            list-type="picture-card"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            :before-upload="beforeUpload"
          >
            <i
              slot="default"
              class="el-icon-plus"
            />
            <div
              slot="file"
              slot-scope="{ file }"
            >
              <img
                class="el-upload-list__item-thumbnail"
                :src="getCoverPicture(file.url)"
                alt=""
              >
              <span class="el-upload-list__item-actions">
                <span
                  class="el-upload-list__item-delete"
                  @click="handleRemove(file)"
                >
                  <i class="el-icon-delete" />
                </span>
              </span>
            </div>
            <el-input
              slot="tip"
              v-model="config.customize.url"
              class="upload-tip"
              placeholder="或输入URL地址"
              clearable
            />
          </el-upload>
        </el-form-item>
        <el-form-item
          label="不透明度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.opacity"
            class="bs-el-input-number"
            placeholder="请输入不透明度"
            :min="0.01"
            :max="1"
            :precision="2"
            :step="0.01"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import { getFileUrl } from 'data-room-ui/js/utils/file'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
export default {
  name: 'PicSetting',
  components: {
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  data () {
    return {
      upLoadUrl:
        window.BS_CONFIG?.httpConfigs?.baseURL + '/bigScreen/file/upload',
      fileUploadParam: {
        module: 'form'
      },
      headers: {
        ...window.BS_CONFIG?.httpConfigs?.headers
      },
      fileList: [],
      accept: 'image/*',
      hideUpload: false,
      rules: {
        'customize.url': [
          // 地址校验 NOTE 暂时移除校验，因为通过系统上传的图片，url是相对路径，无法通过校验
          // {
          //   validator: (rule, value, callback) => {
          //     if (value) {
          //       const reg = /^(http|https):\/\/([\w.]+\/?)\S*/
          //       if (!reg.test(value)) {
          //         callback(new Error('请输入正确的URL地址'))
          //       } else {
          //         callback()
          //       }
          //     } else {
          //       callback()
          //     }
          //   },
          //   trigger: 'blur'
          // }
        ]
      }
    }
  },
  computed: {
    config: {
      get () {
        return this.$store.state.bigScreen.activeItemConfig
      },
      set (val) {
        this.$store.state.bigScreen.activeItemConfig = val
      }
    }
  },
  watch: {
    'config.customize.url': function (val) {
      if (val) {
        this.fileList = [
          {
            name: this.config.title,
            url: this.config.customize.url
          }
        ]
      } else {
        this.fileList = []
      }
    }
  },
  mounted () {
    if (this.config.customize.url) {
      this.fileList = [
        {
          name: this.config.title,
          url: this.config.customize.url
        }
      ]
    } else {
      this.fileList = []
    }
  },
  methods: {
    handleUploadSuccess (res) {
      if (res.code === 200) {
        this.config.customize.url = res.data.url
        this.fileList = [
          {
            name: this.config.title,
            url: this.config.customize.url
          }
        ]
      } else {
        this.$message.error(res.msg)
        this.fileList = []
      }
    },
    handleUploadError () {
      this.$message.error('上传失败')
    },
    handleRemove () {
      this.fileList = []
      this.config.customize.url = ''
    },
    beforeUpload (file) {
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传图片大小不能超过 2MB!')
      }
      return isLt2M
    },
    /**
     * 获取图片访问地址,如果是相对路径则拼接上文件访问前缀地址
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
@import '../../assets/style/settingWrap.scss';

.bs-slider {
  .el-input-number__decrease {
    background: var(--bs-el-background-1);
    border-right: 1px solid var(--bs-background-1);
  }

  .el-input-number__increase {
    background: var(--bs-el-background-1);
    border-left: 1px solid var(--bs-background-1);
  }
}

.bs-setting-wrap {
  padding-top: 16px;

  ::v-deep .hide .el-upload--picture-card {
    display: none !important;
  }

  ::v-deep .el-upload-list__item {
    transition: none !important;
  }

  ::v-deep .el-upload--picture-card {
    margin-bottom: 12px !important;
  }
}

.lc-field-body {
  padding: 12px 16px;
}
</style>
