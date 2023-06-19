<!--
 * @description: 外链
 * @Date: 2022-09-01 15:26:34
 * @Author: xingheng
-->

<template>
  <div>
    <el-form
      ref="form"
      label-width="100px"
      label-position="left"
      :model="config"
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
      <SettingTitle>基础</SettingTitle>
      <div class="setting-wrap">
        <el-form-item
          label="链接"
          label-width="100px"
        >
          <el-input
            v-model="config.url"
            type="textarea"
            rows="4"
            placeholder="请输入链接"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'IframeChartSetting',
  components: {
    PosWhSetting,
    SettingTitle
  },
  data () {
    return {
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
@import "../~packages/assets/style/settingWrap.scss";
.setting-wrap{
  padding: 12px 16px;
}
</style>
