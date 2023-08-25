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
      <div class="bs-setting-wrap">
        <el-form-item
          label="标题"
          label-width="100px"
          prop="title"
        >
          <el-input
            v-model="config.customize.title"
            placeholder="请输入标题"
            clearable
          />
        </el-form-item>
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting :config="config" />
      </div>
      <SettingTitle>基础</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="标题字体大小"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.fontSize"
            placeholder="请输入标题字体大小"
            clearable
          >
            <template slot="append">
              px
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="标题字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontWeight"
            class="bs-el-input-number"
            placeholder="请输入标题字体权重"
          />
        </el-form-item>
        <TextGradient v-model="config.customize.color" />
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import TextGradient from 'data-room-ui/BigScreenDesign/RightSetting/TextGradient/index'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'ThemeSwitcherSetting',
  components: {
    TextGradient,
    PosWhSetting,
    SettingTitle
  },
  data () {
    return {
      rules: {
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' }
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
  },
  mounted () {},
  methods: {
  }
}
</script>

<style lang="scss" scoped>
  @import "../../assets/style/settingWrap.scss";
  .bs-setting-wrap{
    padding-top: 16px;
  }
  .lc-field-body {
    padding: 12px 16px;
  }
</style>
