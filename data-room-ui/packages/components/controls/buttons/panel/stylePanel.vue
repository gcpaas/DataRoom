<template>
  <div class="dataroom-style-wrapper">
    <div class="title">
      {{ config.name }}
    </div>
    <el-form
      class="setting-body"
      label-width="100px"
      label-position="left"
    >
      <div class="dataroom-base-set-wrapper">
        <BaseSet :config="config" />
      </div>
      <div class="props-box">
        <div class="props-box-contain">
          <el-form-item
            class="radio form-item-box"
            label="文字内容"
          >
            <el-input
              v-model="config.props.global.buttonContent"
              @change="changeStyle"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="超链接"
          >
            <el-input
              v-model="config.props.urlConfig.url"
              @change="changeStyle"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="是否新开窗口"
          >
            <el-switch
              v-model="config.props.urlConfig.ifBlank"
              @change="changeStyle"
            />
          </el-form-item>
        </div>
        <div class="tabs-set-box">
          <el-tabs
            v-model="activeName"
            tab-position="left"
            style="height: 200px;"
          >
            <el-tab-pane
              v-for="tab in options"
              :key="tab.name"
              :label="tab.label"
              :name="tab.name"
            >
              <el-collapse>
                <el-collapse-item
                  title="边框样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="边框宽度"
                  >
                    <el-input-number
                      v-model="config.props[activeName].border.borderWidth"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框颜色"
                  >
                    <el-color-picker
                      v-model="config.props[activeName].border.borderColor"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框圆角"
                  >
                    <el-input-number
                      v-model="config.props[activeName].border.borderRadius"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="线条类型"
                  >
                    <el-select
                      v-model="config.props[activeName].border.borderStyle"
                      placeholder="请选择线条类型"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in borderStyleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item
                  title="背景样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="背景颜色"
                  >
                    <el-color-picker
                      v-model="config.props[activeName].background.color"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="背景图片"
                  >
                    <el-input
                      v-model="config.props[activeName].background.img"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                  >
                    <el-image
                      style="width: 100px; height: 100px"
                      :src="config.props[activeName].background.img"
                      fit="contain"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="背景图片重复"
                  >
                    <el-switch
                      v-model="config.props[activeName].background.repeat"
                      active-value="repeat"
                      inactive-value="no-repeat"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="背景图尺寸"
                  >
                    <el-select
                      v-model="config.props[activeName].background.size"
                      placeholder="请选择背景图尺寸"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in imgSizeList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item
                  title="文字样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="颜色"
                  >
                    <el-color-picker
                      v-model="config.props[activeName].textStyle.color"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字体样式"
                  >
                    <el-select
                      v-model="config.props[activeName].textStyle.fontStyle"
                      placeholder="请选择字体样式"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in fontStyleList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字体粗细"
                  >
                    <el-select
                      v-model="config.props[activeName].textStyle.fontWeight"
                      placeholder="请选择字体粗细"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in fontWeightOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字体"
                  >
                    <el-select
                      v-model="config.props[activeName].textStyle.fontFamily"
                      placeholder="请选择字体"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in fonFamilyList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字号"
                  >
                    <el-input-number
                      v-model="config.props[activeName].textStyle.fontSize"
                      @change="changeStyle"
                    />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="文字对齐方式"
                  >
                    <el-select
                      v-model="config.props[activeName].textStyle.textAlign"
                      placeholder="请选择文本样式"
                      @change="changeStyle"
                    >
                      <el-option
                        v-for="item in textAlignList"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-form>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import {
  fontWeightOptions,
  fonFamilyList,
  positionOptions,
  fontStyleList,
  textAlignList,
  imgSizeList,
  borderStyleList
} from '@gcpaas/data-room-ui/packages/js/utils/options'
import BaseSet from '@gcpaas/data-room-ui/packages/components/common/panel/baseSet/index.vue'

export default {
  name: '',
  components: {
    BaseSet
  },
  mixins: [commonMixins],
  inject: ['canvasInst'],
  props: {
    config: {
      type: Object,
      default: () => {
      }
    }
  },
  data () {
    return {
      activeName: 'normal',
      options: [{
        label: '通用',
        name: 'normal'
      }, {
        label: '点击',
        name: 'click'
      }, {
        label: '悬停',
        name: 'hover'
      }],
      fontWeightOptions,
      fonFamilyList,
      positionOptions,
      fontStyleList,
      textAlignList,
      imgSizeList,
      borderStyleList
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType()
    }
  },
  watch: {},
  created () {
  },
  mounted () {
  },
  methods: {
    addTextShadow () {
      const config = this.config
      config.props.textShadow.push({
        blur: 0,
        color: '#ffe58f',
        offset: {
          offsetX: 0,
          offsetY: 0
        },
        _active: true
      })
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
