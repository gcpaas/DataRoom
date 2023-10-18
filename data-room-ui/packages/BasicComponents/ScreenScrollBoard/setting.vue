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
          label="轮播表名称"
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
          <el-form-item label="表头背景色">
            <ColorPicker
              v-model="config.customize.headerBGC"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="偶数行背景色">
            <ColorPicker
              v-model="config.customize.oddRowBGC"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="奇数行背景色">
            <ColorPicker
              v-model="config.customize.evenRowBGC"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label="轮播时间间隔"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.waitTime"
              clearable
              placeholder="请输入时间间隔"
            >
              <template slot="append">
                ms
              </template>
            </el-input>
          </el-form-item>
          <el-form-item label="显示行数">
            <el-input-number
              v-model="config.customize.rowNum"
              :precision="0"
              class="bs-el-input-number"
              label="请输入行数"
            />
          </el-form-item>
          <el-form-item
            label="表头高度"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.headerHeight"
              clearable
              placeholder="请输入表头高度"
            />
          </el-form-item>
          <el-form-item
            label="行号表头"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.indexHeader"
              clearable
              placeholder="请输入行号表头"
            />
          </el-form-item>
          <el-form-item label="是否显示行号">
            <el-switch
              v-model="config.customize.index"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
          <el-form-item label="悬浮暂停轮播">
            <el-switch
              v-model="config.customize.hoverPause"
              :active-value="true"
              :inactive-value="false"
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
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'BarSetting',
  components: {
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  data () {
    return {
      // 预设主题色
      predefineThemeColors: predefineColors
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
