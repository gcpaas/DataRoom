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
      <SettingTitle>基础</SettingTitle>
      <div class="bs-setting-wrap">
        <el-form-item
          label="链接地址"
          label-width="100px"
          prop="title"
        >
          <el-input
            v-model="config.customize.url"
            placeholder="请输入链接地址"
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
              v-for="type in openTypeList"
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
            placeholder="请输入标题字体权重"
          />
        </el-form-item>
        <TextGradient v-model="config.customize.color" />
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import TextGradient from 'packages/BigScreenDesign/RightSetting/TextGradient/index'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'LinkChartSetting',
  components: {
    TextGradient,
    PosWhSetting,
    SettingTitle
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
  @import "../~packages/assets/style/settingWrap.scss";
  .bs-setting-wrap{
    padding: 12px 16px;
  }
</style>
