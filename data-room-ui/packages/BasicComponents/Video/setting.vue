<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body"
    >
      <slot name="top" />
      <el-form
        :model="config.customize"
        label-position="left"
        class="setting-body"
        label-width="90px"
      >
        <SettingTitle>标题</SettingTitle>
        <el-form-item label="播放器名称" class="lc-field-body">
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
        <SettingTitle>位置</SettingTitle>
        <div class="lc-field-body">
          <PosWhSetting :config="config" />
        </div>
        <SettingTitle>基础</SettingTitle>
        <div class="lc-field-body">
          <el-form-item label="视频链接">
            <el-input
              v-model="config.customize.videoUrl"
              clearable
            />
          </el-form-item>
          <el-form-item label="视频封面">
            <el-input
              v-model="config.customize.posterUrl"
              clearable
            />
          </el-form-item>
          <el-form-item label="视频格式">
            <el-select
              v-model="config.customize.videoType"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="item in videoTypeList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'Border14Setting',
  components: {
    PosWhSetting,
    SettingTitle
  },
  props: {
    config: {
      type: Object,
      required: true
    },
    predefineThemeColors: {
      type: Array,
      default: () => {
        return [
          '#007aff',
          '#1aa97b',
          '#ff4d53',
          '#1890FF',
          '#DF0E1B',
          '#0086CC',
          '#2B74CF',
          '#00BC9D',
          '#ED7D32'
        ]
      }
    }
  },
  data () {
    return {
      videoTypeList: [
        {
          label: 'mp4',
          value: 'video/mp4'
        },
        {
          label: 'm3u8',
          value: 'application/x-mpegURL'
        },
        {
          label: 'flv',
          value: 'video/x-flv'
        },
        {
          label: 'mov',
          value: 'rtmp/mp4'
        }
      ]
    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
.lc-field-body {
  padding: 12px 16px;
}
</style>
