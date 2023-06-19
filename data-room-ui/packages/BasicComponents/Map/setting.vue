<template>
  <div class="bs-setting-wrap">
    <el-form
      ref="form"
      :model="config"
      label-width="90px"
      label-position="left"
      class="setting-body"
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
              label="国家"
              value="country"
            />
            <el-option
              label="省份"
              value="province"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          v-if="config.customize.level == 'province'"
          label="地图显示区域"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.dataMap"
            popper-class="bs-el-select"
            class="bs-el-select"
          >
            <el-option
              v-for="map in mapList"
              :key="map.name"
              :label="map.name"
              :value="map.url"
            />
          </el-select>
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
          label="地图分割块颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.areaColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          label="是否打点"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.scatter"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="打点图背景色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.scatterBackgroundColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.scatter"
          label="打点图文字颜色"
          label-width="100px"
        >
          <ColorPicker
            v-model="config.customize.scatterColor"
            :predefine-colors="predefineThemeColors"
          />
        </el-form-item>
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
          label="是否开启筛选"
          label-width="100px"
        >
          <el-switch
            v-model="config.customize.visual"
            class="bs-el-switch"
            active-color="#007aff"
          />
        </el-form-item>
        <el-form-item
          v-if="config.customize.visual"
          label="数值范围"
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
          v-if="config.customize.visual"
          label="配色方案"
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
              class="start-color"
            />
            <span
              class="el-icon-circle-plus-outline"
              style="color: #007aff; font-size: 20px"
              @click="addColor"
            />
            <span
              v-if="colors.length"
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
import SettingTitle from 'packages/SettingTitle/index.vue'
import { chartSettingMixins } from 'packages/js/mixins/chartSettingMixins'
import ColorSelect from 'packages/ColorMultipleSelect/index.vue'
import ColorPicker from 'packages/ColorPicker/index.vue'
import { get } from 'packages/js/utils/http'
import PosWhSetting from 'packages/BigScreenDesign/RightSetting/PosWhSetting.vue'
export default {
  name: 'BarSetting',
  components: {
    ColorSelect,
    ColorPicker,
    PosWhSetting,
    SettingTitle
  },
  mixins: [chartSettingMixins],
  props: {},
  data () {
    return {
      mapList: [],
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
    this.getMapList()
  },
  methods: {
    getMapList () {
      get(
        `${window.BS_CONFIG?.httpConfigs?.baseURL}/bigScreen/design/map/list/${this.config.customize.level}`
      ).then((res) => {
        this.mapList = res
      })
    },
    changeLevel () {
      this.getMapList()
      if (this.config.customize.level === 'country') {
        this.config.customize.dataMap = '中华人民共和国.json'
      } else if (this.config.customize.level === 'province') {
        this.config.customize.dataMap = '安徽省.json'
      }
    },
    delColor () {
      this.config.customize.rangeColor = []
    },
    addColor () {
      this.colors.push('')
    },
    updateColorScheme (colors) {
      this.colors = [...colors]
      this.config.customize.rangeColor = [...colors]
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../~packages/assets/style/settingWrap.scss';
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
</style>
