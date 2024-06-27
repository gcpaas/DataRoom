<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <SettingTitle>标题</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="标题"
          label-width="100px"
        >
          <el-input
            v-model="config.title"
            placeholder="请输入标题"
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
      <SettingTitle>图表</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="图形背景色"
          label-width="100px"
        >
          <el-radio-group
            v-model="lineColorType"
            style="margin-bottom: 8px;"
          >
            <el-radio :label="'theme'">
              颜色字段
            </el-radio>
            <el-radio :label="'customize'">
              自定义
            </el-radio>
          </el-radio-group>
          <el-select
            v-if="lineColorType === 'theme'"
            v-model="config.customize.normal.lineColor"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择颜色字段"
          >
            <el-option
              v-for="item in colorFields"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <ColorPicker
            v-if="lineColorType === 'customize'"
            v-model="config.customize.normal.lineColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="图形弯曲度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.normal.lineCurveness"
            :min="0"
            :max="1"
            :step="0.1"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item
          label="矩形边框色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.normal.itemBorderColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="矩形边框宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.normal.itemBorderWidth"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item

          label="矩形边框样式"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.normal.itemBorderType"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in borderTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item

          label="标签位置"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.normal.labelPosition"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in labelPositionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="标签颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.normal.labelColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="标签字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.normal.labelSize"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item
          label="标签字体粗细"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.normal.labelFontWeight"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in fontWeightList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <SettingTitle>
        高亮设置
      </SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          label="图形背景色"
          label-width="100px"
        >
          <el-radio-group v-model="lineColorType">
            <el-radio :label="'theme'">
              颜色字段
            </el-radio>
            <el-radio :label="'customize'">
              自定义
            </el-radio>
          </el-radio-group>
          <el-select
            v-if="lineColorType === 'theme'"
            v-model="config.customize.emphasis.lineColor"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择颜色字段"
          >
            <el-option
              v-for="item in colorFields"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
          <ColorPicker
            v-if="lineColorType === 'customize'"
            v-model="config.customize.emphasis.lineColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="矩形边框色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.emphasis.itemBorderColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="矩形边框宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.emphasis.itemBorderWidth"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item

          label="矩形边框样式"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.emphasis.itemBorderType"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in borderTypeList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="标签颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.emphasis.labelColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="标签字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.emphasis.labelSize"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item
          label="标签字体粗细"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.emphasis.labelFontWeight"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in fontWeightList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <SettingTitle>
        边距
      </SettingTitle>
      <div class="lc-field-body">
        <el-form-item label="上边距">
          <el-input-number
            v-model="config.customize.top"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item label="下边距">
          <el-input-number
            v-model="config.customize.bottom"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item label="左边距">
          <el-input-number
            v-model="config.customize.left"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item label="右边距">
          <el-input-number
            v-model="config.customize.right"
            class="bs-el-input-number"
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>
<script>
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import { chartSettingMixins } from 'data-room-ui/js/mixins/chartSettingMixins'
import ColorSelect from 'data-room-ui/ColorMultipleSelect/index.vue'
import ColorPicker from 'data-room-ui/ColorPicker/index.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
import { predefineColors } from 'data-room-ui/js/utils/colorList'
export default {
  name: 'BarSetting',
  components: {
    ColorPicker,
    SettingTitle,
    PosWhSetting,
    BorderSetting,
    RotateSetting
  },
  mixins: [chartSettingMixins],
  props: {},
  data () {
    return {
      lineColorType: 'theme',
      fontWeightList: [
        {
          label: '正常',
          value: 'normal'
        },
        {
          label: '粗体',
          value: 'bold'
        },
        {
          label: '加粗',
          value: 'bolder'
        },
        {
          label: '细体',
          value: 'lighter'
        }
      ],
      colorFields: [
        {
          label: '起始字段',
          value: 'source'
        },
        {
          label: '目标字段',
          value: 'target'
        },
        {
          label: '渐变色',
          value: 'gradient'
        }
      ],
      borderTypeList: [
        {
          label: '实线',
          value: 'solid'
        },
        {
          label: '虚线',
          value: 'dashed'
        },
        {
          label: '点线',
          value: 'dotted'
        }
      ],
      labelPositionList: [
        {
          label: '顶部',
          value: 'top'
        },

        {
          label: '底部',
          value: 'bottom'
        },
        {
          label: '靠左',
          value: 'left'
        },
        {
          label: '靠右',
          value: 'right'
        },
        {
          label: '内部',
          value: 'inside'
        },
        {
          label: '内部靠左',

          value: 'insideLeft'
        },
        {
          label: '内部靠右',
          value: 'insideRight'
        },
        {
          label: '内部顶部',
          value: 'insideTop '
        },
        {
          label: '内部底部',
          value: 'insideBottom'
        },
        {
          label: '内部左上',
          value: 'insideTopLeft'
        },
        {
          label: '内部右上',
          value: 'insideTopRight'
        },
        {
          label: '内部左下',
          value: 'insideBottomLeft'
        },
        {
          label: '内部右下',
          value: 'insideBottomRight'
        }
      ],
      colors: [],
      mapList: [],
      predefineThemeColors: predefineColors,
      mapTree: [],
      currentMap: {},
      axisPositionList: [
        {
          label: '左',
          value: 'start'
        },
        {
          label: '中',
          value: 'center'
        },
        {
          label: '右',
          value: 'end'
        }]
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
    this.colors = this.config.customize.rangeColor
  },
  methods: {
    delColor () {
      if (this.colors.length <= 2) return
      this.colors.pop()
      this.config.customize.rangeColor.pop()
    },
    addColor () {
      this.colors.push('#fff')
    },
    updateColorScheme (colors) {
      this.colors = [...colors]
      this.config.customize.rangeColor = [...colors]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../assets/style/settingWrap.scss';
@import '../../assets/style/bsTheme.scss';
// 筛选条件的按钮样式
.add-filter-box {
  position: relative;
  .add-filter {
    margin-left: 90px;
    margin-bottom: 10px;
  }
  .add-filter-btn {
    position: absolute;
    top: 0;
  }
}
.lc-field-body {
  padding: 12px 16px;
}
::v-deep .bs-el-slider-dark {

  .el-slider__runway {
    background-color: var(--bs-el-background-1) !important;
  }
}
</style>
