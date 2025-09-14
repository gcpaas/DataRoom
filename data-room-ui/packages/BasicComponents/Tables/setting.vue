<template>
  <div>
    <el-form
      ref="form"
      :model="config"
      :rules="customRules"
      label-width="120px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="名称"
        >
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
      </div>
      <SettingTitle v-if="config.border">
        边框
      </SettingTitle>
      <div class="lc-field-body">
        <BorderSetting
          v-if="config.border"
          label-width="120px"
          :config="config.border"
          :big-title="config.title"
        />
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting
          :config="config"
          label-width="120px"
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
        <el-form-item label="表头颜色">
          <ColorPicker
            v-model="config.customize.headerBackgroundColor"
            placeholder="请选择表头颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="表头字体颜色">
          <ColorPicker
            v-model="config.customize.headerFontColor"
            style="width:180px"
            placeholder="请选择表头字体颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="表头字体大小">
          <el-input-number
            v-model="config.customize.headerFontSize"
            class="bs-el-input-number"
            :min="12"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="主体背景颜色">
          <ColorPicker
            v-model="config.customize.bodyBackgroundColor"
            placeholder="请选择主体背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="主体字体颜色">
          <ColorPicker
            v-model="config.customize.bodyFontColor"
            placeholder="请选择主体字体颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="主体字体大小">
          <el-input-number
            v-model="config.customize.bodyFontSize"
            class="bs-el-input-number"
            :min="12"
            :max="100"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="奇数行背景颜色">
          <ColorPicker
            v-model="config.customize.evenRowBackgroundColor"
            placeholder="请选择奇数行背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="偶数行背景颜色">
          <ColorPicker
            v-model="config.customize.oddRowBackgroundColor"
            placeholder="请选择偶数行背景颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
      </div>
      <SettingTitle>告警列</SettingTitle>
      <div class="lc-field-body">
        <el-form-item label="开启">
          <el-switch
            v-model="config.customize.alarmEnable"
            :active-value="true"
            :inactive-value="false"
            class="bs-el-switch"
          />
        </el-form-item>
        <el-form-item
          label="列标题"
        >
          <el-input
            v-model="config.customize.alarmTitle"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="告警图标"
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
              v-model="config.customize.alarmUrl"
              class="upload-tip"
              placeholder="或输入URL地址"
              clearable
            />
          </el-upload>
        </el-form-item>
        <el-form-item label="图标大小">
          <el-input-number
            v-model="config.customize.alarmSize"
            class="bs-el-input-number"
            :min="0"
            :step="1"
          />
        </el-form-item>
        <el-form-item label="告警列宽">
          <el-input-number
            v-model="config.customize.alarmLabelWidth"
            class="bs-el-input-number"
            :step="1"
            :min="0"
          />
        </el-form-item>
        <el-form-item label="告警条件">
          <el-input
            v-model="config.customize.alarmConditions"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import { chartSettingMixins } from 'data-room-ui/js/mixins/chartSettingMixins'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import { predefineColors } from 'data-room-ui/js/utils/colorList'
import * as tokenCacheService from 'data-room-ui/js/utils/tokenCacheService'
import { getFileUrl } from 'data-room-ui/js/utils/file'
export default {
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  mixins: [chartSettingMixins],
  data () {
    return {
      predefineThemeColors: predefineColors,
      upLoadUrl:
        window.BS_CONFIG?.httpConfigs?.baseURL + '/bigScreen/file/upload',
      fileUploadParam: {
        module: 'form'
      },
      headers: {
        ...window.BS_CONFIG?.httpConfigs?.headers,
        dataRoomToken: tokenCacheService.get()
      },
      fileList: [],
      accept: 'image/*'
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
    },
    pageCode () {
      return this.$route.query.code
    }
  },
  watch: {},
  mounted () { },
  methods: {
    handleUploadSuccess (res) {
      if (res.code === 200) {
        this.config.customize.alarmUrl = res.data.url
        this.fileList = [
          {
            name: this.config.title,
            url: this.config.customize.alarmUrl
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
      this.config.customize.alarmUrl = ''
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
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/settingWrap.scss";
.lc-field-body {
  padding: 12px 16px;
}
</style>
