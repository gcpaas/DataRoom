<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      class="setting-body"
      label-position="left"
      label-width="90px"
    >
      <el-form
      :model="config.customize"
      class="setting-body"
      label-position="left"
      label-width="90px"
    >
      <SettingTitle>标题</SettingTitle>
      <el-form-item class="lc-field-body" label="装饰名称">
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
          <el-form-item label="装饰主颜色">
            <ColorPicker
              v-model="config.customize.decorationColor1"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="装饰副颜色">
            <ColorPicker
              v-model="config.customize.decorationColor2"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="单次动画时长">
            <el-input-number
              v-model="config.customize.dur"
              :precision="0"
              class="bs-el-input-number"
              label="请输入时长(s)"
            />
          </el-form-item>
        </div>

    </el-form>
    </el-form>
  </div>
</template>
<script>
import ColorPicker from 'packages/ColorPicker/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
import SettingTitle from 'packages/SettingTitle/index.vue'
export default {
  name: 'BarSetting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle
  },
  data () {
    return {
      // 预设主题色
      predefineThemeColors: [
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
  watch: {},
  mounted () {
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
.lc-field-body {
  padding: 12px 16px;
}
</style>
