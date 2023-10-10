<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      class="setting-body bs-el-form"
      label-position="left"
      label-width="90px"
    >
      <el-form
        :model="config.customize"
        class="setting-body bs-el-form"
        label-position="left"
        label-width="90px"
      >
        <SettingTitle>标题</SettingTitle>
        <el-form-item
          class="lc-field-body"
          label="指标卡名称"
        >
          <el-input
            v-model="config.title"
            clearable
          />
        </el-form-item>
        <SettingTitle>位置</SettingTitle>
        <div class="lc-field-body">
          <PosWhSetting :config="config" />
        </div>
         <!-- <SettingTitle v-if="config.border">边框</SettingTitle>
          <div class="lc-field-body">
            <BorderSetting
              v-if="config.border"
              label-width="100px"
              :config="config.border"
              :bigTitle='config.title'
            />
          </div> -->
        <SettingTitle>基础</SettingTitle>
        <div class="lc-field-body">
          <el-form-item label-width="100px" label="背景色">
            <ColorPicker
              v-model="config.customize.bgColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="边框颜色">
            <ColorPicker
              v-model="config.customize.borderColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="边框粗细">
            <el-input-number
              v-model="config.customize.borderWidth"
              :precision="0"
              class="bs-el-input-number"
              label="请输入粗细"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="边框圆角">
            <el-input-number
              v-model="config.customize.borderRadius"
              :precision="0"
              class="bs-el-input-number"
              label="请输入圆角值"
            />
          </el-form-item>
          <el-form-item
            label="图标链接"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.src"
              clearable
              placeholder="请输入链接"
            >
            </el-input>
          </el-form-item>
           <el-form-item
            label="单位"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.unit"
              clearable
              placeholder="请输入单位"
            >
            </el-input>
          </el-form-item>
          <el-form-item label-width="100px" label="单位字体大小">
            <el-input-number
              v-model="config.customize.unitSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入单位字体大小"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="单位字体颜色">
            <ColorPicker
              v-model="config.customize.unitColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="左右间距">
            <el-input-number
              v-model="config.customize.distance"
              :precision="0"
              class="bs-el-input-number"
              label="请输入左右间距"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="上下间距">
            <el-input-number
              v-model="config.customize.lineDistance"
              :precision="0"
              class="bs-el-input-number"
              label="请输入上下间距"
            />
          </el-form-item>
           <el-form-item label-width="100px" label="图标大小">
            <el-input-number
              v-model="config.customize.imgSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入图标大小"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="首行文字大小">
            <el-input-number
              v-model="config.customize.firstSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入首行文字大小"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="首行字体颜色">
            <ColorPicker
              v-model="config.customize.firstColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="首行字体粗细">
            <el-input-number
              v-model="config.customize.firstWeight"
              :precision="0"
              class="bs-el-input-number"
              label="请输入首行字体粗细"
            />
          </el-form-item>
          <el-form-item
            label="第二行文字内容"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.secondLine"
              clearable
              placeholder="请输入第二行文字内容"
            />
          </el-form-item>
           <el-form-item label-width="100px" label="第二行文字大小">
            <el-input-number
              v-model="config.customize.secondSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入首行字体粗细"
            />
          </el-form-item>
           <el-form-item label-width="100px" label="第二行字体颜色">
            <ColorPicker
              v-model="config.customize.secondColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label-width="100px" label="第二行字体粗细">
            <el-input-number
              v-model="config.customize.secondWeight"
              :precision="0"
              class="bs-el-input-number"
              label="请输入第二行字体粗细"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'BarSetting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting
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
