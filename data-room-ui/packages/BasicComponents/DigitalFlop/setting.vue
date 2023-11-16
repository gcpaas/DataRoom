<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <div>
        <el-form
          :model="config.customize"
          label-position="left"
          class="setting-body bs-el-form"
          label-width="100px"
        >
          <SettingTitle>标题</SettingTitle>
          <div class="lc-field-body">
            <el-form-item label="翻牌器名称">
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
          <SettingTitle v-if="config.border">
            边框
          </SettingTitle>
          <div class="lc-field-body">
            <BorderSetting
              v-if="config.border"
              label-width="100px"
              :config="config.border"
              :big-title="config.title"
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
            <el-form-item label="字体大小">
              <el-input-number
                v-model="config.customize.fontSize"
                class="bs-el-input-number"
                :min="12"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="字体权重">
              <el-input-number
                v-model="config.customize.fontWeight"
                class="bs-el-input-number"
                :min="0"
                :step="100"
              />
            </el-form-item>
            <el-form-item label="字体颜色">
              <ColorPicker
                v-model="config.customize.color"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item
              label="字体类型"
              label-width="100px"
            >
              <el-select
                v-model="config.customize.fontFamily"
                popper-class="bs-el-select"
                class="bs-el-select"
              >
                <el-option
                  v-for="item in fontFamilyList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="卡片宽度">
              <el-input-number
                v-model="config.customize.width"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="卡片高度">
              <el-input-number
                v-model="config.customize.height"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="卡片间距">
              <el-input-number
                v-model="config.customize.marginRight"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="卡片背景">
              <ColorPicker
                v-model="config.customize.bgColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="卡片圆角">
              <el-input-number
                v-model="config.customize.borderRadius"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="边框宽度">
              <el-input-number
                v-model="config.customize.borderWidth"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="卡片边框色">
              <ColorPicker
                v-model="config.customize.borderColor"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
            <el-form-item label="最小个数">
              <el-input-number
                v-model="config.customize.numberDigits"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="分隔个数">
              <el-input-number
                v-model="config.customize.formatter"
                class="bs-el-input-number"
                :min="0"
                :max="100"
                :step="1"
              />
            </el-form-item>
            <el-form-item label="占位符">
              <el-input
                v-model="config.customize.placeHolder"
                clearable
              />
            </el-form-item>
            <el-form-item label="头部单位">
              <el-input
                v-model="config.customize.slotLeft"
                clearable
              />
            </el-form-item>
            <el-form-item label="尾部单位">
              <el-input
                v-model="config.customize.slotRight"
                clearable
              />
            </el-form-item>
            <!-- 中线宽度 -->
            <el-form-item label="中线宽度">
              <el-input-number
                v-model="config.customize.lineStyle.height"
                class="bs-el-input-number"
                :min="0"
                :step="1"
              />
            </el-form-item>
            <!-- 中线颜色 -->
            <el-form-item label="中线颜色">
              <ColorPicker
                v-model="config.customize.lineStyle.color"
                :predefine="predefineThemeColors"
              />
            </el-form-item>
          </div>
        </el-form>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import { predefineColors } from 'data-room-ui/js/utils/colorList'
import fontList from 'data-room-ui/js/utils/fontList'
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
      fontFamilyList: fontList,
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
  mounted () {},
  methods: {}
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/settingWrap.scss';
.lc-field-body {
  padding: 12px 16px;
}
</style>
