<!--
 * @description: 指标组件案例设计面板
 * @Date: 2022-08-17 16:53:28
 * @Author: xingheng
-->
<template>
  <div>
    <el-form
      ref="form"
      label-width="100px"
      label-position="left"
      :model="config"
      class="bs-el-form"
    >
      <SettingTitle>标题</SettingTitle>
      <div class="setting-wrap">
        <el-form-item
          label="标题"
          label-width="100px"
        >
          <el-input
            v-model="config.title"
            placeholder="请输入标题"
          />
        </el-form-item>
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="setting-wrap">
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
      <div class="setting-wrap">
        <el-form-item
          label="html内容"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.htmlStr"
            type="textarea"
            :rows="5"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
export default {
  name: 'CurrentTimeSetting',
  components: {
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  data () {
    return {
      activeName: 'data'
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
  },
  mounted () {},
  methods: {
  }
}
</script>

<style lang="scss" scoped>
 @import "../../assets/style/settingWrap.scss";
 @import "../../assets/style/bsTheme.scss";
.setting-wrap{
  padding: 12px 16px;
}
</style>
