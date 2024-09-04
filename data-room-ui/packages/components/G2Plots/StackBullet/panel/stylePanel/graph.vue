<template>
  <div class="dataroom-graph-wrapper">
    <el-form-item
      label="方向"
      class="form-item-box"
    >
      <el-select
        v-model="config.option.layout"
        placeholder="请选择"
        @change="changeStyle"
      >
        <el-option
          v-for="item in bulletLayoutOptions"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item
      label="标题"
      class="form-item-box"
    >
      <el-input
        v-model="config.prop.data[0].title"
        placeholder="请输入值"
        @change="changeStyle"
      />
    </el-form-item>
    <el-collapse>
      <el-collapse-item
        title="区间标签"
      >
        <el-row>
          <el-col
            :span="14"
            style="padding-right: 10px; padding-bottom: 5px"
          >
            <div class="set-desc">
              区间值
            </div>
          </el-col>
          <el-col
            :span="6"
            class="form-item-col"
            style="padding-left: 10px; padding-bottom: 5px"
          >
            <div class="set-desc">
              颜色
            </div>
          </el-col>
        </el-row>
        <el-row
          v-for="(range, index) in config.prop.data[0].ranges"
          :key="index"
        >
          <el-col
            :span="14"
            style="padding-right: 10px; padding-bottom: 5px"
          >
            <el-input
              v-model.number="config.prop.data[0].ranges[index]"
              placeholder="请输入值"
              size="mini"
              @change="changeStyle"
            />
          </el-col>
          <el-col
            :span="6"
            class="form-item-col"
            style="padding-left: 10px; padding-bottom: 5px"
          >
            <el-color-picker
              v-model="config.option.color.range[index]"
              @change="changeStyle"
            />
          </el-col>
          <el-col
            :span="4"
            class="form-item-col"
          >
            <el-button
              v-if="config.option.color.range.length > 1"
              icon="el-icon-minus"
              size="mini"
              @click="removeRangeAndColor(0, index)"
            />
          </el-col>
        </el-row>
        <el-row>
          <el-col
            :span="4"
            class="form-item-col"
            style="float: right"
          >
            <el-button
              icon="el-icon-plus"
              size="mini"
              @click="addRangeAndColor(0)"
            />
          </el-col>
        </el-row>
        <el-form-item
          label="区间背景粗细"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.size.range"
            :min="0"
            :step="5"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="显示"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.label.range.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.label.range.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="标签位置"
          >
            <el-select
              v-model="config.option.label.range.position"
              placeholder="请选择"
              @change="changeStyle"
            >
              <el-option
                v-for="item in bulletLabelPositionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="相对偏移量"
          >
            <el-row>
              <el-col
                :span="24"
              >
                <el-input-number
                  v-model="config.option.label.range.offsetX"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  水平
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.label.range.offsetY"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  垂直
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本样式"
          >
            <el-row>
              <el-col
                :span="12"
                style="padding-right: 5px"
              >
                <el-select
                  v-model="config.option.label.range.style.fontFamily"
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
                <div class="set-desc">
                  字体
                </div>
              </el-col>
              <el-col
                :span="12"
                style="padding-left: 5px"
              >
                <el-select
                  v-model="config.option.label.range.style.fontWeight"
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
                <div class="set-desc">
                  文字粗细
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.range.style.fontSize"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  字号
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.range.style.fill"
                  @change="changeStyle"
                />
                <div class="set-desc color-desc">
                  颜色
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本描边"
          >
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.range.style.lineWidth"
                  controls-position="right"
                  :min="0"
                  :max="10"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  粗细
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.range.style.stroke"
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
        </template>
      </el-collapse-item>
      <el-collapse-item
        title="实际值"
      >
        <el-row>
          <el-col
            :span="14"
            style="padding-right: 10px; padding-bottom: 5px"
          >
            <div class="set-desc">
              实际值
            </div>
          </el-col>
          <el-col
            :span="6"
            class="form-item-col"
            style="padding-left: 10px; padding-bottom: 5px"
          >
            <div class="set-desc">
              颜色
            </div>
          </el-col>
        </el-row>
        <el-row
          v-for="(measure, index) in config.prop.data[0].measures"
          :key="index"
        >
          <el-col
            :span="14"
            style="padding-right: 10px; padding-bottom: 5px"
          >
            <el-input
              :value="config.prop.data[0].measures[index]"
              placeholder="请输入值（禁用）"
              size="mini"
              disabled
            />
          </el-col>
          <el-col
            :span="6"
            class="form-item-col"
            style="padding-left: 10px; padding-bottom: 5px"
          >
            <el-color-picker
              v-model="config.option.color.measure[index]"
              @change="changeStyle"
            />
          </el-col>
        </el-row>
        <el-form-item
          label="实际值粗细"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.size.measure"
            :min="0"
            :step="5"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="标签显示"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.label.measure.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.label.measure.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="标签位置"
          >
            <el-select
              v-model="config.option.label.measure.position"
              placeholder="请选择"
              @change="changeStyle"
            >
              <el-option
                v-for="item in bulletLabelPositionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="相对偏移量"
          >
            <el-row>
              <el-col
                :span="24"
              >
                <el-input-number
                  v-model="config.option.label.measure.offsetX"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  水平
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.label.measure.offsetY"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  垂直
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本样式"
          >
            <el-row>
              <el-col
                :span="12"
                style="padding-right: 5px"
              >
                <el-select
                  v-model="config.option.label.measure.style.fontFamily"
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
                <div class="set-desc">
                  字体
                </div>
              </el-col>
              <el-col
                :span="12"
                style="padding-left: 5px"
              >
                <el-select
                  v-model="config.option.label.measure.style.fontWeight"
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
                <div class="set-desc">
                  文字粗细
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.measure.style.fontSize"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  字号
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.measure.style.fill"
                  @change="changeStyle"
                />
                <div class="set-desc color-desc">
                  颜色
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本描边"
          >
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.measure.style.lineWidth"
                  controls-position="right"
                  :min="0"
                  :max="10"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  粗细
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.measure.style.stroke"
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
        </template>
      </el-collapse-item>
      <el-collapse-item
        title="目标值"
      >
        <el-form-item
          label="目标值"
          class="form-item-box"
        >
          <el-input
            v-model.number="config.prop.data[0].target"
            placeholder="请输入值"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="目标值颜色"
          class="form-item-box"
        >
          <el-color-picker
            v-model="config.option.color.target"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="目标值粗细"
          class="form-item-box"
        >
          <el-input-number
            v-model="config.option.size.target"
            :min="0"
            :step="5"
            controls-position="right"
            @change="changeStyle"
          />
        </el-form-item>
        <el-form-item
          label="标签显示"
          class="form-item-box"
        >
          <el-switch
            v-model="config.option.label.target.style.opacity"
            :active-value="1"
            :inactive-value="0"
            @change="changeStyle"
          />
        </el-form-item>
        <template v-if="config.option.label.target.style.opacity">
          <el-form-item
            class="radio form-item-box"
            label="标签位置"
          >
            <el-select
              v-model="config.option.label.target.position"
              placeholder="请选择"
              @change="changeStyle"
            >
              <el-option
                v-for="item in bulletLabelPositionOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="相对偏移量"
          >
            <el-row>
              <el-col
                :span="24"
              >
                <el-input-number
                  v-model="config.option.label.target.offsetX"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  水平
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="24">
                <el-input-number
                  v-model="config.option.label.target.offsetY"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  垂直
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本样式"
          >
            <el-row>
              <el-col
                :span="12"
                style="padding-right: 5px"
              >
                <el-select
                  v-model="config.option.label.target.style.fontFamily"
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
                <div class="set-desc">
                  字体
                </div>
              </el-col>
              <el-col
                :span="12"
                style="padding-left: 5px"
              >
                <el-select
                  v-model="config.option.label.target.style.fontWeight"
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
                <div class="set-desc">
                  文字粗细
                </div>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.target.style.fontSize"
                  controls-position="right"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  字号
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.target.style.fill"
                  @change="changeStyle"
                />
                <div class="set-desc color-desc">
                  颜色
                </div>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item
            class="radio form-item-box"
            label="文本描边"
          >
            <el-row>
              <el-col :span="18">
                <el-input-number
                  v-model="config.option.label.target.style.lineWidth"
                  controls-position="right"
                  :min="0"
                  :max="10"
                  @change="changeStyle"
                />
                <div class="set-desc">
                  粗细
                </div>
              </el-col>
              <el-col
                :span="6"
                class="form-item-col"
              >
                <el-color-picker
                  v-model="config.option.label.target.style.stroke"
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
        </template>
      </el-collapse-item>
      <el-collapse-item
        title="内边距"
      >
        <el-form-item
          label=""
          label-width="0"
          class="form-item-box"
        >
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[0]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                上边距
              </div>
            </el-col>
            <el-col
              :span="12"
              style="padding-left: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[1]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                右边距
              </div>
            </el-col>
          </el-row>
          <el-row>
            <el-col
              :span="12"
              style="padding-right: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[2]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                下边距
              </div>
            </el-col>
            <el-col
              :span="12"
              style="padding-left: 5px"
            >
              <el-input-number
                v-model="config.option.appendPadding[3]"
                controls-position="right"
                @change="changeStyle"
              />
              <div class="set-desc">
                左边距
              </div>
            </el-col>
          </el-row>
        </el-form-item>
      </el-collapse-item>
      <el-collapse-item
        v-if="currentPageType === 'bigScreen'"
        title="旋转"
      >
        <TransformSet :config="config" />
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script>
import TransformSet from '@gcpaas/data-room-ui/packages/components/common/panel/TransformSet/index.vue'
import commonMixins from '@gcpaas/data-room-ui/packages/js/mixins/commonMixins'
import {
  fontWeightOptions,
  fonFamilyList,
  positionOptions,
  bulletLayoutOptions, bulletLabelPositionOptions
} from '@gcpaas/data-room-ui/packages/js/utils/options'
export default {
  name: '',
  components: {
    TransformSet
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
      positionOptions,
      bulletLayoutOptions,
      bulletLabelPositionOptions
    }
  },
  computed: {
    currentPageType () {
      return this.canvasInst.currentPageType
    }
  },
  watch: {},
  created () {},
  mounted () {},
  methods: {
    addRangeAndColor (index) {
      this.config.prop.data[0].ranges.push(0)
      this.config.option.color.range.push('')
    },

    removeRangeAndColor (index, rangeIndex) {
      // 删除指定的 range
      this.config.prop.data[0].ranges.splice(rangeIndex, 1)
      // 删除对应的颜色选择器
      this.config.option.color.range.splice(rangeIndex, 1)
      this.changeStyle()
    }
  }
}
</script>

<style scoped lang="scss">
@import '@gcpaas/data-room-ui/packages/assets/style/common.scss';
@import '@gcpaas/data-room-ui/packages/assets/style/settingWrap.scss';
</style>
