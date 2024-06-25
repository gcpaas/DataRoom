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
          label="是否显示地名"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.mapName"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.mapName"
          label="地名字体颜色"
          label-width="100px"
        >
          <ColorPicker
          v-model="config.customize.mapNameColor"
          :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.mapName"
          label="地名字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.mapNameSize"
            class="bs-el-input-number"
            placeholder="请输入字体大小"
            :min="0"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.mapName"
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

        <el-form-item
          label="地图级别"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.level"
            popper-class="bs-el-select"
            class="bs-el-select"
            @change="changeLevel()"
          >
            <el-option
              v-for="level in levelList"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="地图"
          label-width="100px"
        >
          <el-cascader
            ref="cascade"
            v-model="config.customize.mapId"
            popper-class="bs-el-cascader"
            :options="mapTree"
            :props="{ value: 'id', label: 'name', children: 'children', emitPath: false }"
            @change="mapSelect">
            <template slot-scope="{ node, data }">
              <span style="float: left">{{ data.name }}</span>
              <span v-if="data.disabled" style="float: right; color: #8492a6; font-size: 13px"> 未配置 </span>
            </template>
          </el-cascader>

        </el-form-item>
        <el-form-item
          label="是否开启下钻"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.down"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.down"
          label="允许下钻层级"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.downLevel"
            popper-class="bs-el-select"
            class="bs-el-select">
            <el-option
              v-for="level in downLevelList"
              :key="level.value"
              :label="level.label"
              :value="level.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="比例"
          label-width="100px"
        >
          <el-slider
            v-model="config.customize.zoom"
            class="bs-el-slider-dark"
            :step="0.1"
            :min="0.1"
            :max="5"
          ></el-slider>
        </el-form-item>
        <el-form-item
          label="中心点横向偏移"
          label-width="100px"
        >
          <el-slider
            class="bs-el-slider-dark"
            v-model="config.customize.center1"
            :step="1"
            :min="1"
            :max="100"
          ></el-slider>
        </el-form-item>
        <el-form-item
          label="中心点纵向偏移"
          label-width="100px"
        >
          <el-slider
            class="bs-el-slider-dark"
            v-model="config.customize.center2"
            :step="1"
            :min="1"
            :max="100"
          ></el-slider>
        </el-form-item>
        <el-form-item
          v-if="config.customize.down"
          label="头部字体颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.fontGraphicColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.down"
          label="头部字体大小"
          label-width="100px"
        >
           <el-input-number
            v-model="config.customize.fontSize"
            placeholder="请输入字体大小"
            controls-position="right"
            :step="1"
          />
        </el-form-item>
        <el-form-item
          label="地图背景色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.backgroundColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="地图分割线颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.mapLineColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="地图高亮颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.emphasisColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="值渲染模式"
          label-width="100px"
        >
          <el-radio-group
            v-model="config.customize.scatter"
            class="bs-el-radio-group"
          >
            <el-radio :label="true">
              打点
            </el-radio>
            <el-radio :label="false">
              色块
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </div>
      <SettingTitle v-if="config.customize.scatter" >打点模式</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          v-if="config.customize.scatter"
          label="地图分割块颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.areaColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="点颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.scatterBackgroundColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="点形状"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.scatterSymbol"
            popper-class="bs-el-select"
            class="bs-el-select"
            @change="changeLevel()"
          >
            <el-option
              v-for="symbol in symbolList"
              :key="symbol.value"
              :label="symbol.label"
              :value="symbol.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="显示点文字"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.showScatterValue"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="点文字颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.scatterColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="点尺寸"
          label-width="100px"
        >
          <el-slider
            v-model="config.customize.scatterSize"
            class="bs-el-slider-dark"
            :step="1"
            :min="1"
            :max="100"
          ></el-slider>
        </el-form-item>
      </div>
      <SettingTitle v-if="!config.customize.scatter">色块模式</SettingTitle>
      <div class="lc-field-body">
        <el-form-item
          v-if="!config.customize.scatter"
          label="悬浮框背景色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.tooltipBackgroundColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="!config.customize.scatter"
          label="悬浮框边框色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.borderColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="!config.customize.scatter"
          label="悬浮框数值标题"
          label-width="100px"
        >
          <el-input
            v-model="config.customize.tooltipTitle"
            placeholder="请输入数值标题"
            clearable
          />
        </el-form-item>
        <el-form-item
          v-if="!config.customize.scatter"
          label="启用手动筛选"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.visual"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="!config.customize.scatter"
          label="色块数值范围"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.range[0]"
            placeholder="请输入最小值"
            controls-position="right"
            :step="1"
          />
          -
          <el-input-number
            v-model="config.customize.range[1]"
            controls-position="right"
            placeholder="请输入最大值"
            :step="1"
          />
        </el-form-item>
        <el-form-item
          v-if="!config.customize.scatter"
          label="色块配色方案"
          label-width="100px"
        >
          <color-select
            v-model="config.customize.rangeColor"
            @update="updateColorScheme"
          />
          <div
            style="
                display: flex;
                align-items: center;
                height: 42px;
                flex-wrap: wrap;
              "
          >
            <el-color-picker
              v-for="(colorItem, index) in colors"
              :key="index"
              v-model="config.customize.rangeColor[index]"
              show-alpha
              popper-class="bs-el-color-picker"
              class="start-color bs-el-color-picker"
            />
            <span
              class="el-icon-circle-plus-outline"
              style="color: #007aff; font-size: 20px"
              @click="addColor"
            />
            <span
              v-if="colors.length > 2"
              class="el-icon-remove-outline"
              style="color: #ea0b30; font-size: 20px"
              @click="delColor"
            />
          </div>
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
import {predefineColors} from "data-room-ui/js/utils/colorList";
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
      levelList: [
        {value: '0', label: '世界'},
        {value: '1', label: '国家'},
        {value: '2', label: '省份'},
        {value: '3', label: '城市'},
        {value: '4', label: '区县'}
      ],
      symbolList: [
        {value: 'circle', label: '圆形'},
        {value: 'rect', label: '矩形'},
        {value: 'roundRect', label: '圆角矩形'},
        {value: 'triangle', label: '三角形'},
        {value: 'diamond', label: '菱形'},
        {value: 'pin', label: '水滴'},
        {value: 'arrow', label: '箭头'}
      ],
      // 旧版本地图等级，该数据用于兼容旧版本
      oldLevelMap: {
        'world' : '0',
        'country' : '1',
        'province' : '2',
      },
      downLevelList: [
        {value: 1, label: '下钻一层'},
        {value: 2, label: '下钻两层'},
        {value: 3, label: '下钻三层'},
        {value: 4, label: '下钻四层'},
        {value: 5, label: '下钻五层'}
      ],
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
    getMapTree() {
      const levelConst = ['0', '1', '2', '3', '4']
      if (!levelConst.includes(this.config.customize.level)) {
        this.config.customize.level = this.oldLevelMap[this.config.customize.level] || '0'
      }
      this.$dataRoomAxios.get(`/bigScreen/map/tree/${this.config.customize.level}`).then((res) => {
        this.mapTree = res
      })
    },
    mapSelect (mapId) {
      let mapData = this.$refs['cascade'].getCheckedNodes()[0].data
      this.currentMap = mapData
    },
    changeMap(val){
      this.config.customize.scope=val.slice(0,-5)
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
