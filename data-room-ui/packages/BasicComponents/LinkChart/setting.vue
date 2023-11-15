<!--
 * @description: 标题属性设置面板
 * @Date: 2022-08-17 16:53:28
 * @Author: shiyi
-->
<template>
  <div>
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
      <div class="bs-setting-wrap">
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
      <div class="bs-setting-wrap">
        <el-form-item
          label="URL"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.url"
            placeholder="请输入URL地址"
            clearable
          />
        </el-form-item>
        <el-form-item
          label="打开方式"
          label-width="100px"
          prop="title"
        >
          <el-select
            v-model="config.customize.openType"
            popper-class="bs-el-select"
            class="bs-el-select"
          >
            <el-option
              v-for="(type) in openTypeList"
              :key="type.label"
              :label="type.label"
              :value="type.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.openType === 'dialog'"
          label="弹窗宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.dialogW"
            class="bs-el-input-number"
            placeholder="请输入弹窗宽度"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.openType === 'dialog'"
          label="弹窗高度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.dialogH"
            class="bs-el-input-number"
            placeholder="请输入弹窗高度"
            clearable
          />
        </el-form-item>
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
            :min="0"
            :step="100"
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
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
export default {
  name: 'LinkChartSetting',
  components: {
    TextGradient,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  data () {
    return {
      openTypeList: [
        {
          label: '当前窗口',
          value: '_self'
        },
        {
          label: '新窗口',
          value: '_blank'
        },
        {
          label: '弹窗',
          value: 'dialog'
        }
      ],
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
    padding: 12px 16px;
  }
</style>
