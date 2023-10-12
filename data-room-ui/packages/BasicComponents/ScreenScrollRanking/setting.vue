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
        label-width="100px"
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
        </div>
      </el-form>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
export default {
  name: 'BarSetting',
  components: {
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
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
