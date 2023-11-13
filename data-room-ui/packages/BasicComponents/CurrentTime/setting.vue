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
          label="字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontSize"
            class="bs-el-input-number"
            placeholder="请输入字体大小"
            :min="0"
          />
        </el-form-item>
        <el-form-item
          label="字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontWeight"
            class="bs-el-input-number"
            :min="0"
            :step="100"
            placeholder="请输入字体权重"
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
        <el-form-item
          label="字体颜色"
          label-width="100px"
        >
          <el-color-picker
            v-model="config.customize.color"
            class="bs-el-color-picker"
            popper-class="bs-el-color-picker"
          />
        </el-form-item>
        <el-form-item
          label="时间格式"
          label-width="100px"
        >
          <el-select
            v-model="config.dateFormat"
            placeholder="请选择时间格式"
            clearable
          >
            <el-option
              v-for="item in dateFormatList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
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
import fontList from 'data-room-ui/js/utils/fontList'
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
      fontFamilyList: fontList,
      activeName: 'data',
      dateFormatList: [
        { label: '年-月-日 时:分:秒', value: 'YYYY-MM-DD HH:mm:ss' },
        { label: '年/月/日 时/分/秒', value: 'YYYY/MM/DD HH/mm/ss' }
      ],
      HeaderFontSizeList: [
        { label: '正常', value: 16 },
        { label: '较小', value: 14 },
        { label: '较大', value: 30 }
      ],
      numberFormatList: [
        { label: '原始数据', value: 'value' },
        { label: '千位分隔', value: 'kilobit' }
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
