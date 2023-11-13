<template>
  <div>
    <el-form
      ref="form"
      :model="config"
      label-width="120px"
      label-position="left"
      class="setting-body bs-el-form"
    >
      <SettingTitle>标题</SettingTitle>
      <el-form-item
        class="lc-field-body"
        label="名称"
      >
        <el-input
          v-model="config.title"
          clearable
        />
      </el-form-item>
      <SettingTitle v-if="config.border">
        边框
      </SettingTitle>
      <div class="lc-field-body">
        <BorderSetting
          v-if="config.border"
          label-width="120px"
          :config="config.border"
          :big-title="config.title"
        />
      </div>
      <SettingTitle>位置</SettingTitle>
      <div class="lc-field-body">
        <PosWhSetting
          :config="config"
          label-width="120px"
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
          label="标题位置"
          label-width="100px"
        >
          <el-select
            v-model="config.customize.position"
            placeholder="请选择标题位置"
            popper-class="bs-el-select"
            class="bs-el-select"
            clearable
          >
            <el-option
              v-for="item in positionList"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item
          label="字体大小"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontSize"
            class="bs-el-input-number"
            placeholder="请输入字体大小"
            :min="0"
          />
        </el-form-item>
        <el-form-item
          label="字体权重"
          label-width="100px"
        >
          <el-input-number
            v-model="config.customize.fontWeight"
            class="bs-el-input-number"
            :min="0"
            :step="100"
            placeholder="请输入字体权重"
          />
        </el-form-item>
        <el-form-item
          label="字体颜色"
          label-width="100px"
        >
          <el-color-picker
            v-model="config.customize.color"
            class="bs-el-color-picker"
            popper-class="bs-el-color-picker"
          />
        </el-form-item>
        <el-form-item
          label="分割线颜色"
          label-width="100px"
        >
          <el-color-picker
            v-model="config.customize.lineColor"
            class="bs-el-color-picker"
            popper-class="bs-el-color-picker"
          />
        </el-form-item>
      </div>
      <SettingTitle>内容</SettingTitle>
      <div class="lc-field-body">
        <div class="select-item select-item-title">
          <span class="option-drag" />
          <span class="input-wrap_left">图表类型</span>
          <span class="input-wrap_left">标签名称</span>
        </div>
        <draggable
          :list="config.customize.tabList"
          :animation="340"
          group="selectItem"
          handle=".option-drag"
          style="padding: 10px"
        >
          <template>
            <div
              v-for="(tab, index) in config.customize.tabList"
              :key="index"
              class="select-item"
            >
              <div class="select-line-icon option-drag">
                <i class="el-icon-rank" />
              </div>
              <div class="input-wrap">
                <el-form-item
                  :prop="'customize.tabList.' + index + '.chart'"
                  :rules="rules.chart"
                  label-width="0px"
                >
                  <el-select
                    v-model="tab.chart.title"
                    size="mini"
                    popper-class="bs-el-select"
                    class="bs-el-select"
                    @change="handleChangeBindCompnents(...arguments, index)"
                  >
                    <el-option
                      v-for="item in componentList"
                      :key="item.title"
                      :label="item.title"
                      :value="item.title"
                    />
                  </el-select>
                </el-form-item>
              </div>
              <div class="input-wrap">
                <el-form-item
                  :prop="'customize.tabList.' + index + '.name'"
                  :rules="rules.name"
                  label-width="0px"
                >
                  <el-input
                    v-model="tab.name"
                    placeholder="请输入标签名称"
                    size="mini"
                  />
                </el-form-item>
              </div>
              <div
                class="select-line-icon option-delete"
                @click="deleteTab(index)"
              >
                <i class="el-icon-remove-outline" />
              </div>
            </div>
          </template>
        </draggable>
        <div
          class="add-btn"
          @click="addTab"
        >
          新增标签页
        </div>
      </div>
    </el-form>
  </div>
</template>
<script>
import draggable from 'vuedraggable'
import SettingTitle from 'data-room-ui/SettingTitle/index.vue'
import { chartSettingMixins } from 'data-room-ui/js/mixins/chartSettingMixins'
import PosWhSetting from 'data-room-ui/BigScreenDesign/RightSetting/PosWhSetting.vue'
import BorderSetting from 'data-room-ui/BigScreenDesign/RightSetting/BorderSetting.vue'
import CloneDeep from 'lodash-es/cloneDeep'
import plotList from 'data-room-ui/G2Plots/plotList'
import { randomString } from 'data-room-ui/js/utils'
import { settingToTheme } from 'data-room-ui/js/utils/themeFormatting'
import RotateSetting from 'data-room-ui/BigScreenDesign/RightSetting/RotateSetting.vue'
export default {
  components: {
    PosWhSetting,
    SettingTitle,
    draggable,
    BorderSetting,
    RotateSetting
  },
  mixins: [chartSettingMixins],
  data () {
    const validateChart = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择图表'))
      }
      callback()
    }
    return {
      positionList: [{
        label: '靠左',
        value: 'left'
      },
      {
        label: '居中',
        value: 'center'
      },
      {
        label: '靠右',
        value: 'right'
      }],
      rules: {
        name: [
          {
            required: true,
            message: '请输入标签名称',
            trigger: 'blur'
          }
        ],
        chart: [
          { required: true, trigger: 'change', validator: validateChart }
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
    },
    pageCode () {
      return this.$route.query.code
    },
    componentList () {
      return [...plotList]
    }
  },
  watch: {},
  mounted () { },
  methods: {
    deleteTab (index) {
      this.config.customize.tabList.splice(index, 1)
    },
    addTab () {
      const newTab = {
        chartCode: '',
        name: '',
        chart: { parentCode: this.config.code }
      }
      this.config.customize.tabList.push(newTab)
    },
    handleChangeBindCompnents (configName, index) {
      const config = this.componentList.find(
        item => item.title === configName
      )
      config.code = randomString(12)
      this.$set(this.config.customize.tabList[index], 'name', configName)
      this.$set(this.config.customize.tabList[index], 'chart', { ...config, parentCode: this.config.code })
      this.$set(this.config.customize.tabList[index], 'chartCode', config.code)
      this.$set(this.config.customize.tabList[index].chart, 'key', config.code)
      this.$set(this.config.customize.tabList[index].chart, 'theme', settingToTheme(config, 'dark'))
      this.$set(this.config.customize.tabList[index].chart, 'theme', settingToTheme(config, 'light'))
    }
  }
}
</script>

<style lang="scss" scoped>
@import "../../assets/style/settingWrap.scss";
.lc-field-body {
  padding: 12px 16px;
}
.select-item {
  display: flex;
  margin-bottom: 8px;

  .option-drag {
    cursor: move !important;
    width: 30px;
    font-size: 24px;
  }
  .input-wrap {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 2px;

    .el-input-number--mini {
      width: 90px !important;
    }
  }
  .input-wrap_left {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: left;
  }

  .select-line-icon {
    width: 30px;
    font-size: 18px;
    cursor: pointer;
    text-align: center;
  }

  .option-delete {
    color: #f56c6c;
  }
}
.add-btn{
  width: 100px;
  height: 40px;
  margin: 0 auto;
  text-align: center;
  line-height:40px;
  border:1px dashed #dcdfe6;
  &:hover{
    color: #007aff;
    border:1px dashed #007aff;
    cursor: pointer;
  }
}
</style>
