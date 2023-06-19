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
          label="时间字体大小"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.fontSize"
            placeholder="请输入时间字体大小"
          >
            <template slot="append">
              px
            </template>
          </el-input>
        </el-form-item>
        <el-form-item
          label="时间字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontWeight"
            class="bs-el-input-number"
            placeholder="请输入时间字体权重"
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
        <el-form-item
          label="字体颜色"
          label-width="100px"
        >
          <el-color-picker v-model="config.customize.color" />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'packages/SettingTitle/index.vue'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'CurrentTimeSetting',
  components: {
    PosWhSetting,
    SettingTitle
  },
  data () {
    return {
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
 @import "../~packages/assets/style/settingWrap.scss";
.setting-wrap{
  padding: 12px 16px;
}
</style>
