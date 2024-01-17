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
        <SettingTitle>旋转</SettingTitle>
        <div class="lc-field-body">
          <RotateSetting
            :config="config"
          />
        </div>
        <SettingTitle>基础</SettingTitle>
        <div class="lc-field-body">
          <el-form-item
            label-width="100px"
            label="渐变背景色一"
          >
            <ColorPicker
              v-model="config.customize.gradientColor0"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="渐变背景色二"
          >
            <ColorPicker
              v-model="config.customize.gradientColor1"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="渐变色方向"
          >
            <el-select
              v-model="config.customize.gradientDirection"
              popper-class="bs-el-select"
              class="bs-el-select"
            >
              <el-option
                v-for="iconPosition in options"
                :key="iconPosition.value"
                :label="iconPosition.label"
                :value="iconPosition.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="边框颜色"
          >
            <ColorPicker
              v-model="config.customize.borderColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="边框粗细"
          >
            <el-input-number
              v-model="config.customize.borderWidth"
              :precision="0"
              class="bs-el-input-number"
              label="请输入粗细"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="边框圆角"
          >
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
            />
          </el-form-item>
          <el-form-item
            label="单位"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.unit"
              clearable
              placeholder="请输入单位"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="单位字体大小"
          >
            <el-input-number
              v-model="config.customize.unitSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入单位字体大小"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="单位字体颜色"
          >
            <ColorPicker
              v-model="config.customize.unitColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="左右间距"
          >
            <el-input-number
              v-model="config.customize.distance"
              :precision="0"
              class="bs-el-input-number"
              label="请输入左右间距"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="上下间距"
          >
            <el-input-number
              v-model="config.customize.lineDistance"
              :precision="0"
              class="bs-el-input-number"
              label="请输入上下间距"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="图标大小"
          >
            <el-input-number
              v-model="config.customize.imgSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入图标大小"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="第一行字体大小"
          >
            <el-input-number
              v-model="config.customize.firstSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入第一行字体大小"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="第一行字体颜色"
          >
            <ColorPicker
              v-model="config.customize.firstColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="第一行字体粗细"
          >
            <el-input-number
              v-model="config.customize.firstWeight"
              :precision="0"
              :step="100"
              class="bs-el-input-number"
              label="请输入第一行字体粗细"
            />
          </el-form-item>
          <el-form-item
            label="第一行文字内容"
            label-width="100px"
          >
            <el-input
              v-model="config.customize.secondLine"
              clearable
              placeholder="请输入第一行文字内容"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="第二行字体大小"
          >
            <el-input-number
              v-model="config.customize.secondSize"
              :precision="0"
              class="bs-el-input-number"
              label="请输入第二行字体大小"
            />
          </el-form-item>
          <el-form-item
            label="数据文字类型"
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
            label-width="100px"
            label="第二行字体颜色"
          >
            <ColorPicker
              v-model="config.customize.secondColor"
              :predefine="predefineThemeColors"
            />
          </el-form-item>
          <el-form-item
            label-width="100px"
            label="第二行字体粗细"
          >
            <el-input-number
              v-model="config.customize.secondWeight"
              :precision="0"
              :step="100"
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
import { predefineColors } from 'data-room-ui/js/utils/colorList'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
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
      options: [
        {
          label: '从左到右',
          value: 'to right'
        },
        {
          label: '从右到左',
          value: 'to left'
        },
        {
          label: '从上到下',
          value: 'to bottom'
        },
        {
          label: '从下到上',
          value: 'to top'
        },
        {
          label: '从左上到右下',
          value: 'to bottom right'
        },
        {
          label: '从右上到左下',
          value: 'to bottom left'
        },
        {
          label: '从左下到右上',
          value: 'to top right'
        },
        {
          label: '从右下到左上',
          value: 'to top left'
        }
      ],
      // 预设主题色
      predefineThemeColors: predefineColors,
      fontFamilyList: fontList
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
