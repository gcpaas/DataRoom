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
          label="字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontWeight"
            class="bs-el-input-number"
            placeholder="请输入标题字体权重"
            :min="0"
            :step="100"
          />
        </el-form-item>
        <!-- 走马灯走向 -->
        <el-form-item
          label="滚动方向"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.direction"
            class="bs-el-select"
            popper-class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              v-for="direction in directionList"
              :key="direction.value"
              :label="direction.label"
              :value="direction.value"
            />
          </el-select>
        </el-form-item>
        <!-- 滚动速度 -->
        <el-form-item
          label="滚动间隔"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.dur"
            class="bs-el-input-number"
            placeholder="请输入滚动间隔"
            :min="1"
            :step="1"
          >
            <template slot="append">
              s
            </template>
          </el-input-number>
        </el-form-item>
        <!-- 图标选择 -->
        <el-form-item
          label="图标选择"
          label-width="100px"
        >
          <!-- <IconPicker v-model="config.customize.icon.name" /> -->
          <el-select
            v-model="config.customize.icon.name"
            class="bs-el-select"
            popper-class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              v-for="(icbroadcaston,index) in broadcastList"
              :key="index"
              :label="icbroadcaston.label"
              :value="icbroadcaston.value"
            >
              <icon-svg :name="icbroadcaston.value" />
              <span style="float: right; color: #8492a6; font-size: 13px">{{ icbroadcaston.label }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <!-- 图标位置 -->
        <el-form-item
          v-if="config.customize.icon.name"
          label="图标位置"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.icon.position"
            class="bs-el-select"
            popper-class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              v-for="iconPosition in iconPositionOptions"
              :key="iconPosition.value"
              :label="iconPosition.label"
              :value="iconPosition.value"
            />
          </el-select>
        </el-form-item>
        <!-- 图标颜色 -->
        <el-form-item
          v-if="config.customize.icon.name"
          label="图标颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.icon.color"
            placeholder="请选择图标颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="文字颜色类型">
          <el-select
            v-model="config.customize.textColorType"
            popper-class="bs-el-select"
            class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              label="纯色"
              value="pure"
            />
            <el-option
              label="渐变色"
              value="gradient"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.textColorType === 'pure'"
          label="文字颜色"
        >
          <ColorPicker
            v-model="config.customize.textColor"
            placeholder="请选择文字颜色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.textColorType === 'gradient'"
          label="文字渐变色方向"
        >
          <el-select
            v-model="config.customize.textGradientDirection"
            popper-class="bs-el-select"
            class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              v-for="direction in gradientDirection"
              :key="direction.value"
              :label="direction.label"
              :value="direction.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.textColorType === 'gradient'"
          label="文字渐变开始色"
        >
          <ColorPicker
            v-model="config.customize.textGradientColor0"
            placeholder="请选择渐变色开始色值"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.textColorType === 'gradient'"
          label="文字渐变结束色"
        >
          <ColorPicker
            v-model="config.customize.textGradientColor1"
            placeholder="请选择渐变色结束色值"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item label="背景色类型">
          <el-select
            v-model="config.customize.backgroundColorType"
            popper-class="bs-el-select"
            class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              label="透明"
              value="transparent"
            />
            <el-option
              label="纯色"
              value="pure"
            />
            <el-option
              label="渐变色"
              value="gradient"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.backgroundColorType === 'pure'"
          label="背景色"
        >
          <ColorPicker
            v-model="config.customize.backgroundColor"
            placeholder="请选择背景色"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.backgroundColorType === 'gradient'"
          label="背景渐变色方向"
        >
          <el-select
            v-model="config.customize.bgGradientDirection"
            popper-class="bs-el-select"
            class="bs-el-select"
            filterable
            clearable
          >
            <el-option
              v-for="direction in gradientDirection"
              :key="direction.value"
              :label="direction.label"
              :value="direction.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.backgroundColorType === 'gradient'"
          label="背景渐变开始色"
        >
          <ColorPicker
            v-model="config.customize.bgGradientColor0"
            placeholder="请选择渐变色开始色值"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.backgroundColorType === 'gradient'"
          label="背景渐变结束色"
        >
          <ColorPicker
            v-model="config.customize.bgGradientColor1"
            placeholder="请选择渐变色结束色值"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
      </div>
      <SettingTitle>其他</SettingTitle>
      <div class="lc-field-body">
        <!-- 是否开启语音播报 -->
        <el-form-item
          label="语音播报"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.voiceBroadcast"
            :active-value="true"
            :inactive-value="false"
            class="bs-el-switch"
          />
        </el-form-item>
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
import IconSvg from 'data-room-ui/SvgIcon'
import {predefineColors} from "data-room-ui/js/utils/colorList";
export default {
  name: 'MarqueeSetting',
  components: {
    PosWhSetting,
    ColorPicker,
    SettingTitle,
    RotateSetting,
    IconSvg,
    BorderSetting
  },
  data () {
    return {
      predefineThemeColors: predefineColors,
      directionList: [
        {
          value: 'right',
          label: '从右到左'
        },
        {
          value: 'left',
          label: '从左到右'
        },
        {
          value: 'top',
          label: '从上到下'
        },
        {
          value: 'bottom',
          label: '从下到上'
        }
      ],
      gradientDirection: [
        {
          label: '从左到右',
          value: 'to right'
        },
        {
          label: '从上到下',
          value: 'to bottom'
        },

        {
          label: '从左上到右下',
          value: 'to bottom right'
        },
        {
          label: '从左下到右上',
          value: 'to top right'
        }
      ],
      iconPositionOptions: [
        {
          label: '左侧',
          value: 'left'
        },
        {
          label: '右侧',
          value: 'right'
        }
      ],
      broadcastList: [
        {
          label: '广播1',
          value: 'broadcast-1'
        },
        {
          label: '广播2',
          value: 'broadcast-2'
        },
        {
          label: '广播3',
          value: 'broadcast-3'
        },
        {
          label: '广播4',
          value: 'broadcast-4'
        },
        {
          label: '广播5',
          value: 'broadcast-5'
        },
        {
          label: '广播6',
          value: 'broadcast-6'
        },
        {
          label: '广播7',
          value: 'broadcast-7'
        },
        {
          label: '广播8',
          value: 'broadcast-8'
        },
        {
          label: '广播9',
          value: 'broadcast-9'
        },
        {
          label: '广播10',
          value: 'broadcast-10'
        },
        {
          label: '广播11',
          value: 'broadcast-11'
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
  mounted () { },
  methods: {
    changeStyle () { }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/settingWrap.scss';
@import '../../assets/style/bsTheme.scss';

.bs-setting-wrap {
  padding: 12px 16px;
}

.lc-field-body {
  padding: 12px 16px;
}
</style>
