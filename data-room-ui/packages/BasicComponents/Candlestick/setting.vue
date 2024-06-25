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
          label="上升色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.highColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="下降色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.lowColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item

          label="地名字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.mapNameWeight"
            class="bs-el-input-number"
            placeholder="请输入字体权重"
            :min="100"
            :step="100"
          />
        </el-form-item>
      </div>
      <SettingTitle>
        网格线
      </SettingTitle>
      <div class="lc-field-body">
        <el-form-item

          label="网格线"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.gridShow"
            class="bs-el-switch"
          />
        </el-form-item>
        <el-form-item
          label="宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.gridWidth"
            class="bs-el-input-number"
          />
        </el-form-item>
        <el-form-item
          label="颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.gridColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
      </div>
      <SettingTitle>
        x轴
      </SettingTitle>
      <div class="lc-field-body">
        <el-form-item

          label="标题"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.xAxis.name"
          />
        </el-form-item>
        <el-form-item

          label="标题位置"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.xAxis.position"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in axisPositionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="标题字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.xAxis.nameSize"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="标题颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.xAxis.nameColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>

        <el-form-item
          label="标签字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.xAxis.labelSize"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="标签颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.xAxis.labelColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="轴线宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.xAxis.lineWidth"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="轴线颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.xAxis.lineColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>

        <el-form-item
          label="刻度线宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.xAxis.tickWidth"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="刻度线颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.xAxis.tickColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
      </div>
      <SettingTitle>
        y轴
      </SettingTitle>
      <div class="lc-field-body">
        <el-form-item

          label="标题"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.yAxis.name"
          />
        </el-form-item>
        <el-form-item

          label="标题位置"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.yAxis.position"
            popper-class="bs-el-select"
            class="bs-el-select"
            placeholder="请选择位置"
          >
            <el-option
              v-for="item in axisPositionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item
          label="标题字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.yAxis.nameSize"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="标题颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.yAxis.nameColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>

        <el-form-item
          label="标签字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.yAxis.labelSize"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="标签颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.yAxis.labelColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="轴线宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.yAxis.lineWidth"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="轴线颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.yAxis.lineColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>

        <el-form-item
          label="刻度线宽度"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.yAxis.tickWidth"
            class="bs-el-input-number"
            placeholder="请输入标题字体大小"
            clearable
          />
        </el-form-item>
        <el-form-item

          label="刻度线颜色"
          label-width="100px"
        >
          <el-color-picker
            v-model="config.customize.yAxis.tickColor"
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
    ColorSelect,
    ColorPicker,
    PosWhSetting,
    SettingTitle,
    BorderSetting,
    RotateSetting
  },
  mixins: [chartSettingMixins],
  props: {},
  data () {
    return {
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
        }],
      levelList: [
        { value: '0', label: '世界' },
        { value: '1', label: '国家' },
        { value: '2', label: '省份' },
        { value: '3', label: '城市' },
        { value: '4', label: '区县' }
      ],
      symbolList: [
        { value: 'circle', label: '圆形' },
        { value: 'rect', label: '矩形' },
        { value: 'roundRect', label: '圆角矩形' },
        { value: 'triangle', label: '三角形' },
        { value: 'diamond', label: '菱形' },
        { value: 'pin', label: '水滴' },
        { value: 'arrow', label: '箭头' }
      ],
      // 旧版本地图等级，该数据用于兼容旧版本
      oldLevelMap: {
        world: '0',
        country: '1',
        province: '2'
      },
      downLevelList: [
        { value: 1, label: '下钻一层' },
        { value: 2, label: '下钻两层' },
        { value: 3, label: '下钻三层' },
        { value: 4, label: '下钻四层' },
        { value: 5, label: '下钻五层' }
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
    this.getMapTree()
    this.colors = this.config.customize.rangeColor
  },
  methods: {
    getMapTree () {
      const levelConst = ['0', '1', '2', '3', '4']
      if (!levelConst.includes(this.config.customize.level)) {
        this.config.customize.level = this.oldLevelMap[this.config.customize.level] || '0'
      }
      this.$dataRoomAxios.get(`/bigScreen/map/tree/${this.config.customize.level}`).then((res) => {
        this.mapTree = res
      })
    },
    mapSelect (mapId) {
      const mapData = this.$refs.cascade.getCheckedNodes()[0].data
      this.currentMap = mapData
    },
    changeMap (val) {
      this.config.customize.scope = val.slice(0, -5)
    },
    changeLevel () {
      this.getMapTree()
    },
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
