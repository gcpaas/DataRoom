<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <el-form
        :model="config.customize"
        label-position="left"
        class="setting-body bs-el-form"
        label-width="120px"
      >
        <SettingTitle>标题</SettingTitle>
        <div class="lc-field-body">
          <el-form-item label="排名轮播表名称">
            <el-input
              v-model="config.title"
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
          <el-form-item label="数值单位">
            <el-input
              v-model="config.customize.unit"
              clearable
            />
          </el-form-item>
          <el-form-item label="自动排序">
            <el-switch
              v-model="config.customize.sort"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
          <el-form-item label="序号字体颜色">
            <ColorPicker
              v-model="config.customize.rankColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="序号字体大小">
            <el-input-number
              v-model="config.customize.rankFontSize"
              :min="12"
              class="bs-el-input-number"
              label="请输入字体大小"
            />
          </el-form-item>
          <el-form-item label="左侧数据字体颜色">
            <ColorPicker
              v-model="config.customize.infoNameColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="左侧数据字体大小">
            <el-input-number
              v-model="config.customize.infoNameFontSize"
              :min="12"
              class="bs-el-input-number"
              label="请输入字体大小"
            />
          </el-form-item>
          <el-form-item label="右侧数据字体颜色">
            <ColorPicker
              v-model="config.customize.rankingValueColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="右侧数据字体大小">
            <el-input-number
              v-model="config.customize.rankingValueFontSize"
              :min="12"
              class="bs-el-input-number"
              label="请输入字体大小"
            />
          </el-form-item>
          <el-form-item label="内部列颜色">
            <ColorPicker
              v-model="config.customize.insideColumnColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item label="底部边框颜色">
            <ColorPicker
              v-model="config.customize.rankingColumnBorderBottomColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'BarSetting',
  components: {
    PosWhSetting,
    ColorPicker,
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
