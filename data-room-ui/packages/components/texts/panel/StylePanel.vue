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
        <el-form-item
          class="radio form-item-box"
          label="标题名"
        >
          <el-input v-model="config.props.content" />
        </el-form-item>
        <el-collapse>
          <el-collapse-item
            title="文本样式"
          >
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
            <el-form-item
              class="radio form-item-box"
              label="颜色"
            >
              <el-color-picker v-model="config.props.textStyle.color" />
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
          </el-collapse-item>
          <el-form-item
            class="radio form-item-box"
            label="对齐方式"
          >
            <el-row>
              <el-col
                :span="24"
              >
                <el-select
                  v-model="config.props.textAlign.horiAlign"
                  placeholder="请选择文字粗细"
                  @change="changeStyle"
                >
                  <el-option
                    label="左对齐"
                    value="left"
                  />
                  <el-option
                    label="右对齐"
                    value="right"
                  />
                  <el-option
                    label="居中对齐"
                    value="center"
                  />
                </el-select>
                <div class="set-desc">
                  水平
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col
                :span="24"
              >
                <el-select
                  v-model="config.props.textAlign.vertiAlign"
                  placeholder="请选择文字粗细"
                  @change="changeStyle"
                >
                  <el-option
                    label="顶部对齐"
                    value="start"
                  />
                  <el-option
                    label="底部对齐"
                    value="end"
                  />
                  <el-option
                    label="居中对齐"
                    value="center"
                  />
                </el-select>
                <div class="set-desc">
                  垂直
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文字排列方式"
          >
            <el-select
              v-model="config.props.writingMode"
              placeholder="请选择文字排列方式"
              @change="changeStyle"
            >
              <el-option
                label="水平"
                value="horizontal-tb"
              />
              <el-option
                label="垂直"
                value="vertical-lr"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文字间隔"
          >
            <el-input-number v-model="config.props.letterSpacing" />
          </el-form-item>
          <el-collapse-item
            title="背景样式"
          >
            <el-form-item
              class="radio form-item-box"
              label="背景色"
            >
              <el-color-picker v-model="config.props.backgroundStyle.bgColor" />
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="圆角"
            >
              <el-input-number v-model="config.props.backgroundStyle.borderRadius" />
            </el-form-item>
            <el-form-item
              label="线型样式"
              class="form-item-box"
            >
              <el-row>
                <el-col :span="18">
                  <el-input-number
                    v-model="config.props.backgroundStyle.bgBorder.width"
                    controls-position="right"
                    @change="changeStyle"
                  />
                  <div class="set-desc">
                    粗细
                  </div>
                </el-col>
                <el-col
                  :span="12"
                  style="margin-bottom: 10px"
                >
                  <el-select
                    v-model="config.props.backgroundStyle.bgBorder.style"
                    @change="changeStyle"
                  >
                    <el-option
                      label="实线"
                      :value="0"
                    />
                    <el-option
                      label="虚线"
                      :value="5"
                    />
                  </el-select>
                  <div class="set-desc">
                    类型
                  </div>
                </el-col>
              </el-row>
              <el-row>
                <el-col
                  :span="12"
                  class="form-item-col"
                >
                  <el-color-picker
                    v-model="config.props.backgroundStyle.bgBorder.color"
                    class="wenbenyangshiyanse"
                    show-alpha
                    @change="changeStyle"
                  />
                  <div
                    class="set-desc color-desc"
                  >
                    颜色
                  </div>
                </el-col>
              </el-row>
            </el-form-item>
          </el-collapse-item>
          <el-form-item
            class="radio form-item-box"
            label="省略号"
          >
            <el-switch v-model="config.props.ellipsis" />
          </el-form-item>
          <el-collapse-item title="超链接配置">
            <el-form-item
              class="radio form-item-box"
              label="超链接"
            >
              <el-input v-model="config.props.urlConfig.url" />
            </el-form-item>
            <el-form-item
              class="radio form-item-box"
              label="是否新开窗口"
            >
              <el-switch v-model="config.props.urlConfig.ifBlank" />
            </el-form-item>
          </el-collapse-item>
          <el-form-item
            class="radio form-item-box"
            label="手势光标"
          >
            <el-switch v-model="config.props.cursor" />
          </el-form-item>
          <el-collapse-item>
            <template
              slot="title"
            >
              文字阴影<i
                class="el-icon-circle-plus-outline"
                @click.stop="addTextShadow"
              />
            </template>
            <el-tabs>
              <el-tab-pane
                v-for="(item,index) in config.props.textShadow"
                :key="index"
                :label="'文字阴影'+(index+1)"
              >
                <el-form-item
                  class="radio form-item-box"
                  label="颜色"
                >
                  <el-color-picker v-model="item.color" />
                </el-form-item>
                <el-form-item
                  class="radio form-item-box"
                  label="偏移"
                >
                  <el-row>
                    <el-col :span="12">
                      <el-input-number v-model="item.offset.offsetX" />
                    </el-col>
                    <el-col :span="12">
                      <el-input-number v-model="item.offset.offsetY" />
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-form-item
                  class="radio form-item-box"
                  label="模糊半径"
                >
                  <el-input-number v-model="item.blur" />
                </el-form-item>
              </el-tab-pane>
            </el-tabs>
          </el-collapse-item>
        </el-collapse>
      </div>
    </el-form>
  </div>
</template>

<script>
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import { fontWeightOptions, fonFamilyList, positionOptions } from '@gcpaas/data-room-ui/packages/js/utils/options'
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
      fontWeightOptions,
      fonFamilyList,
      positionOptions
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
