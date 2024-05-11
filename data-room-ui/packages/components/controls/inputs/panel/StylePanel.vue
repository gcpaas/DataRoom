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
            label="提示文字"
          >
            <el-input v-model="config.props.placeholder" />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="缩进"
          >
            <el-input-number
              v-model="config.props.indent"
              controls-position="right"
            />
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="输入框背景颜色"
          >
            <el-color-picker
              v-model="config.props.background"
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
              label="普通"
              name="normal"
            >
              <el-collapse>
                <el-collapse-item
                  title="文本样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="颜色"
                  >
                    <el-color-picker v-model="config.props.textStyle.color" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字体样式"
                  >
                    <el-select
                      v-model="config.props.textStyle.fontStyle"
                      placeholder="请选择文本样式"
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
                      v-model="config.props.textStyle.fontWeight"
                      placeholder="请选择文字粗细"
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
                      v-model="config.props.textStyle.fontFamily"
                      placeholder="请选择文本样式"
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
                    <el-input-number v-model="config.props.textStyle.fontSize" />
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item
                  title="提示样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="颜色"
                  >
                    <el-color-picker v-model="config.props.placeholderStyle.color" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="字体样式"
                  >
                    <el-select
                      v-model="config.props.placeholderStyle.fontStyle"
                      placeholder="请选择文本样式"
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
                      v-model="config.props.placeholderStyle.fontWeight"
                      placeholder="请选择文字粗细"
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
                      v-model="config.props.placeholderStyle.fontFamily"
                      placeholder="请选择文本样式"
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
                    <el-input-number v-model="config.props.placeholderStyle.fontSize" />
                  </el-form-item>
                </el-collapse-item>
                <el-collapse-item
                  title="边框样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="边框宽度"
                  >
                    <el-input-number v-model="config.props.normal.border.borderWidth" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框颜色"
                  >
                    <el-color-picker v-model="config.props.normal.border.borderWidth" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框圆角"
                  >
                    <el-input-number v-model="config.props.normal.border.borderRadius" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="线条类型"
                  >
                    <el-select
                      v-model="config.props.normal.border.borderStyle"
                      placeholder="请选择文本样式"
                      @change="changeStyle"
                    >
                      <el-option
                        label="实线"
                        value="slide"
                      />
                      <el-option
                        label="虚线"
                        value="dashed"
                      />
                    </el-select>
                  </el-form-item>
                </el-collapse-item>
              </el-collapse>
            </el-tab-pane>
            <el-tab-pane
              label="悬浮样式"
              name="hover"
            >
              <el-collapse>
                <el-collapse-item
                  title="边框样式"
                >
                  <el-form-item
                    class="radio form-item-box"
                    label="边框宽度"
                  >
                    <el-input-number v-model="config.props.normal.border.borderWidth" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框颜色"
                  >
                    <el-color-picker v-model="config.props.normal.border.borderWidth" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="边框圆角"
                  >
                    <el-input-number v-model="config.props.normal.border.borderRadius" />
                  </el-form-item>
                  <el-form-item
                    class="radio form-item-box"
                    label="线条类型"
                  >
                    <el-select
                      v-model="config.props.normal.border.borderStyle"
                      placeholder="请选择文本样式"
                      @change="changeStyle"
                    >
                      <el-option
                        label="实线"
                        value="slide"
                      />
                      <el-option
                        label="虚线"
                        value="dashed"
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
import { fontWeightOptions, fonFamilyList, positionOptions, fontStyleList } from '@gcpaas/data-room-ui/packages/js/utils/options'
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
      default: () => {}
    }
  },
  data () {
    return {
      activeName: 'normal',
      fontWeightOptions,
      fonFamilyList,
      positionOptions,
      fontStyleList
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType()
    }
  },
  watch: {},
  created () {},
  mounted () {},
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
