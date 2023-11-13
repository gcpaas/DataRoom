<!--
 * @description: 指标组件案例设计面板
 * @Date: 2022-08-17 16:53:28
 * @Author: xingheng
-->
<template>
  <div class="setting-wrap">
    <el-form
      ref="form"
      label-width="100px"
      label-position="left"
      :model="config"
      class="bs-el-form"
    >
      <SettingTitle>标题</SettingTitle>
      <el-form-item
        class="lc-field-body"
        label="标题"
        label-width="100px"
      >
        <el-input
          v-model="config.title"
          placeholder="请输入标题"
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
            popper-class="bs-el-color-picker"
            class="bs-el-color-picker"
          />
        </el-form-item>
        <el-form-item
          label="结束日期"
          label-width="100px"
        >
          <el-date-picker
            v-model="config.endTime"
            style="position: relative;"
            popper-class="bs-el-date-picker"
            type="datetime"
            align="left"
            size="mini"
            placeholder="请选择结束日期"
            :picker-options="pickerOptions"
            value-format="timestamp"
            :append-to-body="false"
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
import fontList from 'data-room-ui/js/utils/fontList'
export default {
  name: 'TimeCountDownSetting',
  components: {
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  data () {
    return {
      fontFamilyList: fontList,
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - 8.64e7
        }
      },
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
  watch: {},
  mounted () {
    this.initEndTime()
  },
  methods: {
    initEndTime () {
      if (this.config.endTime) {
        this.config.endTime = new Date(this.config.endTime).getTime()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/settingWrap.scss";
.setting-wrap {
  padding-top: 16px;
}
.el-date-editor.el-input,
.el-date-editor.el-input__inner {
  width: 100%;
}
.lc-field-body {
  padding: 12px 16px;
}
</style>
